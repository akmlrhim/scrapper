import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { searchBusinesses } from '../services/googleMaps.js'
import { checkDigitalMaturity, calcDigitalMaturityScore } from '../services/digitalMaturity.js'

const router = Router()

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Track running tasks in memory for cancellation
const runningTasks = new Map()

router.post('/start', async (req, res) => {
  console.log('[scraping/start] body:', JSON.stringify(req.body))

  const {
    province, city, district, keywords, max_results = 50,
    check_website = true, check_pixel = true, check_google_ads = false,
    user_id
  } = req.body

  if (!province || !city || !keywords?.length || !user_id) {
    const missing = { province, city, 'keywords.length': keywords?.length, user_id }
    console.warn('[scraping/start] parameter kurang:', missing)
    return res.status(400).json({ error: `Parameter tidak lengkap: ${JSON.stringify(missing)}` })
  }

  const supabase = getSupabase()
  const taskId = uuidv4()

  // Insert task record
  const { error: insertError } = await supabase.from('tasks').insert({
    id: taskId,
    user_id,
    province,
    city,
    district: district || null,
    keyword: keywords.join(', '),
    status: 'pending',
    progress: 0,
    total_leads: max_results,
    found_leads: 0,
  })

  if (insertError) {
    return res.status(500).json({ error: insertError.message })
  }

  res.json({ task_id: taskId, message: 'Task dimulai.' })

  // Run scraping in background
  setImmediate(() => runScrapingTask({
    taskId, supabase, province, city, district, keywords,
    maxResults: max_results, checkWebsite: check_website,
    checkPixel: check_pixel, checkGoogleAds: check_google_ads, userId: user_id
  }))
})

router.post('/cancel/:taskId', async (req, res) => {
  const { taskId } = req.params
  runningTasks.set(taskId, 'cancelled')

  const supabase = getSupabase()
  await supabase.from('tasks').update({ status: 'failed', error_message: 'Dibatalkan oleh pengguna.' }).eq('id', taskId)

  res.json({ message: 'Task dibatalkan.' })
})

const MATURITY_CONCURRENCY = 5

async function runScrapingTask({ taskId, supabase, province, city, district, keywords, maxResults, checkWebsite, checkPixel, checkGoogleAds, userId }) {
  runningTasks.set(taskId, 'running')

  try {
    await supabase.from('tasks').update({ status: 'running' }).eq('id', taskId)

    const allLeads = []
    const perKeyword = Math.ceil(maxResults / keywords.length)
    const needsCheck = checkWebsite || checkPixel || checkGoogleAds

    for (let ki = 0; ki < keywords.length; ki++) {
      if (runningTasks.get(taskId) === 'cancelled') break

      const keyword = keywords[ki]
      const businesses = await searchBusinesses({ keyword, province, city, district, maxResults: perKeyword })

      // Run digital maturity checks concurrently (MATURITY_CONCURRENCY at a time)
      const maturities = []
      for (let i = 0; i < businesses.length; i += MATURITY_CONCURRENCY) {
        if (runningTasks.get(taskId) === 'cancelled') break
        const batch = businesses.slice(i, i + MATURITY_CONCURRENCY)
        const batchResults = await Promise.all(
          batch.map(biz =>
            needsCheck && biz.website
              ? checkDigitalMaturity(biz.website)
              : Promise.resolve({ has_website: !!biz.website, has_meta_pixel: false, has_google_ads: false, has_instagram: false })
          )
        )
        maturities.push(...batchResults)

        const progress = Math.round(((ki * perKeyword + i + batch.length) / maxResults) * 100)
        await supabase.from('tasks').update({
          progress: Math.min(progress, 99),
          found_leads: allLeads.length + maturities.length,
        }).eq('id', taskId)
      }

      for (let bi = 0; bi < businesses.length; bi++) {
        const biz = businesses[bi]
        const maturity = maturities[bi] ?? { has_website: !!biz.website, has_meta_pixel: false, has_google_ads: false, has_instagram: false }
        allLeads.push({
          task_id: taskId,
          user_id: userId,
          business_name: biz.business_name,
          address: biz.address,
          phone: biz.phone || null,
          website: biz.website || null,
          email: biz.email || null,
          rating: biz.rating,
          reviews_count: biz.reviews_count,
          category: biz.category,
          province,
          city,
          district: district || null,
          keyword,
          has_website: maturity.has_website,
          has_meta_pixel: maturity.has_meta_pixel,
          has_google_ads: maturity.has_google_ads,
          has_instagram: maturity.has_instagram,
          digital_maturity_score: calcDigitalMaturityScore(maturity),
          maps_url: biz.maps_url || null,
        })
      }
    }

    if (allLeads.length > 0) {
      const BATCH = 50
      for (let i = 0; i < allLeads.length; i += BATCH) {
        await supabase.from('leads').insert(allLeads.slice(i, i + BATCH))
      }
    }

    const finalStatus = runningTasks.get(taskId) === 'cancelled' ? 'failed' : 'completed'
    await supabase.from('tasks').update({
      status: finalStatus,
      progress: 100,
      found_leads: allLeads.length,
      completed_at: new Date().toISOString(),
    }).eq('id', taskId)
  } catch (err) {
    console.error('Scraping error:', err)
    await supabase.from('tasks').update({
      status: 'failed',
      error_message: err.message,
    }).eq('id', taskId)
  } finally {
    runningTasks.delete(taskId)
  }
}

export default router
