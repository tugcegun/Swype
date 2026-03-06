import { useState, useRef } from 'react'

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY
const API_HOST = 'real-time-product-search.p.rapidapi.com'

const CACHE_KEY = 'swype_search_cache'
const COUNTER_KEY = 'swype_api_counter'
const CACHE_TTL = 30 * 60 * 1000 // 30 dakika
const RATE_LIMIT_MS = 3000 // 3 saniye bekleme
const MONTHLY_LIMIT = 500
const WARNING_THRESHOLD = 450

// --- 1. Cache yonetimi ---
function getCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch { return {} }
}

function setCache(query, data) {
  const cache = getCache()
  cache[query.toLowerCase().trim()] = { data, ts: Date.now() }
  // Eski kayitlari temizle (max 50 entry)
  const entries = Object.entries(cache)
  if (entries.length > 50) {
    entries.sort((a, b) => a[1].ts - b[1].ts)
    entries.slice(0, entries.length - 50).forEach(([k]) => delete cache[k])
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

function getCached(query) {
  const cache = getCache()
  const entry = cache[query.toLowerCase().trim()]
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    return entry.data
  }
  return null
}

// --- 2. Istek sayaci ---
function getCounter() {
  try {
    const stored = JSON.parse(localStorage.getItem(COUNTER_KEY) || '{}')
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`
    if (stored.month !== currentMonth) {
      return { month: currentMonth, count: 0 }
    }
    return stored
  } catch { return { month: `${new Date().getFullYear()}-${new Date().getMonth()}`, count: 0 } }
}

function incrementCounter() {
  const counter = getCounter()
  counter.count += 1
  localStorage.setItem(COUNTER_KEY, JSON.stringify(counter))
  return counter.count
}

export function useProductSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requestCount, setRequestCount] = useState(() => getCounter().count)
  const lastRequestTime = useRef(0)

  const searchProducts = async (query) => {
    if (!query.trim()) return

    if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
      setError('RapidAPI key bulunamadi. .env dosyasina VITE_RAPIDAPI_KEY ekleyin.')
      return
    }

    // --- 3. Rate limiting ---
    const now = Date.now()
    const timeSinceLast = now - lastRequestTime.current
    if (timeSinceLast < RATE_LIMIT_MS) {
      const wait = Math.ceil((RATE_LIMIT_MS - timeSinceLast) / 1000)
      setError(`Cok hizli! ${wait} saniye bekleyin.`)
      return
    }

    // --- 1. Cache kontrol ---
    const cached = getCached(query)
    if (cached) {
      setResults(cached)
      setError(null)
      return
    }

    // --- 2. Limit kontrol ---
    const counter = getCounter()
    if (counter.count >= MONTHLY_LIMIT) {
      setError('Aylik API limiti doldu (500/500). Gelecek ay sifirlanacak.')
      return
    }

    setLoading(true)
    setError(null)
    lastRequestTime.current = now

    try {
      const response = await fetch(
        `https://${API_HOST}/search-v2?q=${encodeURIComponent(query)}&country=tr&language=tr&limit=20`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': API_HOST,
          },
        }
      )

      // --- 4. Error handling (429 vb.) ---
      if (response.status === 429) {
        setError('API limiti asildi! Lutfen daha sonra tekrar deneyin.')
        return
      }

      if (!response.ok) {
        throw new Error(`API hatasi: ${response.status}`)
      }

      const data = await response.json()

      const items = data.data?.products || data.data || []
      const products = items.map((item) => ({
        title: item.product_title || '',
        price: item.offer?.price ? parseTRPrice(item.offer.price) : null,
        originalPrice: item.offer?.original_price
          ? parseTRPrice(item.offer.original_price)
          : null,
        imageUrl: item.product_photos?.[0] || '',
        url: item.offer?.offer_page_url || item.product_page_url || '',
        store: item.offer?.store_name || '',
        brand: extractBrand(item.product_title || ''),
        rating: item.product_rating || null,
      }))

      // Cache'e kaydet
      setCache(query, products)

      // Sayaci artir
      const newCount = incrementCounter()
      setRequestCount(newCount)

      setResults(products)

      // Uyari goster (450+)
      if (newCount >= WARNING_THRESHOLD) {
        setError(`Dikkat: Bu ay ${newCount}/${MONTHLY_LIMIT} istek kullanildi!`)
      }
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setError(null)
  }

  return { results, loading, error, requestCount, searchProducts, clearResults }
}

function parseTRPrice(priceStr) {
  if (!priceStr) return null
  const cleaned = priceStr.replace(/[₺TL\s]/gi, '').trim()
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
  }
  const parts = cleaned.split('.')
  if (parts.length === 2 && parts[1].length === 3) {
    return parseFloat(cleaned.replace(/\./g, ''))
  }
  return parseFloat(cleaned) || null
}

function extractBrand(title) {
  const knownBrands = [
    'Zara', 'H&M', 'Nike', 'Adidas', 'Mango', 'Massimo Dutti',
    'Pull & Bear', 'Bershka', 'Stradivarius', 'LC Waikiki',
    'Koton', 'DeFacto', 'Puma', 'New Balance', 'Converse',
    'Levi\'s', 'Tommy Hilfiger', 'Calvin Klein', 'Guess',
    'Trendyol', 'Hepsiburada',
  ]
  const lower = title.toLowerCase()
  for (const brand of knownBrands) {
    if (lower.includes(brand.toLowerCase())) return brand
  }
  return title.split(' ')[0] || ''
}
