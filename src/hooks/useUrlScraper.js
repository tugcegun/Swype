import { useState } from 'react'

export function useUrlScraper() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const scrapeUrl = async (url) => {
    if (!url || !url.startsWith('http')) {
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl)

      if (!res.ok) throw new Error('Sayfa yuklenemedi')

      const html = await res.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      const getMeta = (property) => {
        const el =
          doc.querySelector(`meta[property="${property}"]`) ||
          doc.querySelector(`meta[name="${property}"]`)
        return el?.getAttribute('content') || ''
      }

      const title = getMeta('og:title') || doc.querySelector('title')?.textContent || ''
      const image = getMeta('og:image')
      const price =
        getMeta('og:price:amount') ||
        getMeta('product:price:amount') ||
        getMeta('og:price') ||
        ''

      const brand =
        getMeta('og:brand') ||
        getMeta('product:brand') ||
        ''

      setLoading(false)
      return {
        name: title.trim(),
        imageUrl: image.trim(),
        price: price.trim(),
        brand: brand.trim(),
      }
    } catch (err) {
      setError('URL bilgileri alinamadi')
      setLoading(false)
      return null
    }
  }

  return { scrapeUrl, loading, error }
}
