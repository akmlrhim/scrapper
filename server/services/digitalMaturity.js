import axios from 'axios'

const META_PIXEL_PATTERNS = [
  'connect.facebook.net',
  'fbq(',
  'facebook-pixel',
  '_fbq',
]

const GOOGLE_ADS_PATTERNS = [
  'googleadservices.com',
  'gtag(',
  'google_conversion',
  'adsbygoogle',
]

export async function checkDigitalMaturity(website) {
  if (!website) {
    return { has_website: false, has_meta_pixel: false, has_google_ads: false, has_instagram: false }
  }

  try {
    const url = website.startsWith('http') ? website : `https://${website}`
    const { data: html } = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GeoLeads-Bot/1.0)',
      },
      maxRedirects: 3,
    })

    const hasMetaPixel = META_PIXEL_PATTERNS.some(p => html.includes(p))
    const hasGoogleAds = GOOGLE_ADS_PATTERNS.some(p => html.includes(p))
    const hasInstagram = html.includes('instagram.com') || html.includes('instagram')

    return {
      has_website: true,
      has_meta_pixel: hasMetaPixel,
      has_google_ads: hasGoogleAds,
      has_instagram: hasInstagram,
    }
  } catch {
    return { has_website: true, has_meta_pixel: false, has_google_ads: false, has_instagram: false }
  }
}

export function calcDigitalMaturityScore({ has_website, has_meta_pixel, has_google_ads, has_instagram }) {
  return [has_website, has_meta_pixel, has_google_ads, has_instagram].filter(Boolean).length
}
