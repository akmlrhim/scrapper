import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'

const router = Router()

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

router.get('/', async (req, res) => {
  const { user_id, page = 1, limit = 25, search, has_website, has_meta_pixel } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id required' })

  const supabase = getSupabase()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1)

  if (search) query = query.or(`business_name.ilike.%${search}%,address.ilike.%${search}%`)
  if (has_website !== undefined) query = query.eq('has_website', has_website === 'true')
  if (has_meta_pixel !== undefined) query = query.eq('has_meta_pixel', has_meta_pixel === 'true')

  const { data, count, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  res.json({ leads: data, total: count })
})

export default router
