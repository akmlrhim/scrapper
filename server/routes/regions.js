import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

let regionsCache = null

function getRegions() {
  if (!regionsCache) {
    const data = readFileSync(join(__dirname, '../data/regions.json'), 'utf8')
    regionsCache = JSON.parse(data)
  }
  return regionsCache
}

router.get('/', (req, res) => {
  res.json(getRegions())
})

router.get('/:province/cities', (req, res) => {
  const regions = getRegions()
  const found = regions.find(r => r.province === req.params.province)
  res.json(found ? found.cities : [])
})

router.get('/:province/:city/districts', (req, res) => {
  const regions = getRegions()
  const province = regions.find(r => r.province === req.params.province)
  const city = province?.cities.find(c => c.city === req.params.city)
  res.json(city ? city.districts : [])
})

export default router
