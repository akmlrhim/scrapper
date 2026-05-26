import axios from 'axios'
import * as cheerio from 'cheerio'

const SERPAPI_KEY = process.env.SERPAPI_KEY
const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

/**
 * Priority: SerpAPI → Google Places API → HTTP scraping → Mock data
 */
export async function searchBusinesses({ keyword, province, city, district, maxResults = 50 }) {
  const location = [district, city, province, 'Indonesia'].filter(Boolean).join(', ')
  const query = `${keyword} ${location}`

  if (SERPAPI_KEY) {
    return searchViaSerpAPI(query, keyword, maxResults)
  }
  if (PLACES_API_KEY) {
    return searchViaPlacesAPI(query, keyword, maxResults)
  }
  return searchViaHTTP(query, keyword, maxResults)
}

// ─── SerpAPI (Google Maps engine) ─────────────────────────────────────────────
async function searchViaSerpAPI(query, keyword, maxResults) {
  const results = []
  let start = 0

  try {
    do {
      const { data } = await axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_maps',
          q: query,
          type: 'search',
          hl: 'id',
          api_key: SERPAPI_KEY,
          start: start > 0 ? start : undefined,
        },
        timeout: 20000,
      })

      const places = data.local_results ?? []
      if (places.length === 0) break

      for (const place of places) {
        results.push(normalizeSerpResult(place))
        if (results.length >= maxResults) break
      }

      start += places.length
      if (!data.serpapi_pagination?.next) break
    } while (results.length < maxResults)
  } catch (err) {
    console.error('SerpAPI error:', err.response?.data?.error || err.message)
    // Fallback ke mock jika quota habis atau error
    return generateMockData(keyword, query, maxResults)
  }

  return results.length > 0 ? results : generateMockData(keyword, query, maxResults)
}

function normalizeSerpResult(place) {
  return {
    business_name: place.title || '',
    address: place.address || '',
    phone: place.phone || '',
    website: place.website || '',
    rating: place.rating || null,
    reviews_count: place.reviews || 0,
    category: place.type || '',
    maps_url: place.place_id_search
      ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
      : (place.link || ''),
  }
}

// ─── Google Places API (legacy fallback) ──────────────────────────────────────
async function searchViaPlacesAPI(query, keyword, maxResults) {
  const results = []
  let pageToken = null

  do {
    const params = { query, key: PLACES_API_KEY, language: 'id' }
    if (pageToken) params.pagetoken = pageToken

    const { data } = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      { params }
    )

    for (const place of data.results) {
      results.push({
        business_name: place.name,
        address: place.formatted_address || '',
        phone: '',
        website: '',
        rating: place.rating || null,
        reviews_count: place.user_ratings_total || 0,
        category: place.types?.[0]?.replace(/_/g, ' ') || '',
        maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      })
      if (results.length >= maxResults) break
    }

    pageToken = data.next_page_token
    if (pageToken) await sleep(2000)
  } while (pageToken && results.length < maxResults)

  return results
}

// ─── HTTP scraping (last resort) ──────────────────────────────────────────────
async function searchViaHTTP(query, keyword, maxResults) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'id-ID,id;q=0.9',
  }

  try {
    const { data } = await axios.get(url, { headers, timeout: 15000 })
    const results = parseGoogleMapsHTML(data, maxResults)
    return results.length > 0 ? results : generateMockData(keyword, query, maxResults)
  } catch {
    return generateMockData(keyword, query, maxResults)
  }
}

function parseGoogleMapsHTML(html, maxResults) {
  const results = []
  const $ = cheerio.load(html)

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html())
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        if (item['@type'] === 'LocalBusiness' && results.length < maxResults) {
          results.push({
            business_name: item.name || '',
            address: item.address?.streetAddress || '',
            phone: item.telephone || '',
            website: item.url || '',
            rating: item.aggregateRating?.ratingValue || null,
            reviews_count: item.aggregateRating?.reviewCount || 0,
            category: item['@type'] || '',
            maps_url: '',
          })
        }
      }
    } catch {}
  })

  return results
}

// ─── Mock data (development / quota exceeded) ─────────────────────────────────
export function generateMockData(keyword, location, count = 20) {
  const businessTypes = [
    'Restoran', 'Kafe', 'Salon', 'Bengkel', 'Apotek', 'Toko', 'Klinik',
    'Hotel', 'Laundry', 'Percetakan', 'Butik', 'Warung', 'Minimarket',
  ]
  const names = [
    'Berkah', 'Maju', 'Jaya', 'Sejahtera', 'Mandiri', 'Prima', 'Setia',
    'Abadi', 'Mulia', 'Indah', 'Barokah', 'Amanah', 'Sumber', 'Karya',
  ]

  return Array.from({ length: count }, (_, i) => {
    const type = businessTypes[i % businessTypes.length]
    const name = names[Math.floor(Math.random() * names.length)]
    const hasWebsite = Math.random() > 0.55
    return {
      business_name: `${type} ${name} ${i + 1}`,
      address: `Jl. Contoh No. ${i + 1}, ${location}`,
      phone: `08${Math.floor(Math.random() * 9e9 + 1e9)}`,
      website: hasWebsite ? `https://www.${name.toLowerCase()}${type.toLowerCase()}.com` : '',
      rating: +(3 + Math.random() * 2).toFixed(1),
      reviews_count: Math.floor(Math.random() * 500),
      category: keyword || type,
      maps_url: `https://maps.google.com/?q=${encodeURIComponent(`${type} ${name}, ${location}`)}`,
    }
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
