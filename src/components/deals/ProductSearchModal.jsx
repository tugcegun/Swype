import { useState } from 'react'
import { Search, Plus, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { useProductSearch } from '../../hooks/useProductSearch'
import { useTranslation } from '../../contexts/LanguageContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function ProductSearchModal({ isOpen, onClose, onTrack }) {
  const { t, language } = useTranslation()
  const [query, setQuery] = useState('')
  const { results, loading, error, requestCount, searchProducts, clearResults } = useProductSearch()
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  const handleSearch = (e) => {
    e.preventDefault()
    searchProducts(query)
  }

  const handleTrack = (product) => {
    onTrack({
      productName: product.title,
      brand: product.brand,
      store: product.store,
      originalPrice: product.originalPrice || product.price || 0,
      dealPrice: product.price || 0,
      imageUrl: product.imageUrl,
      url: product.url,
    })
  }

  const handleClose = () => {
    setQuery('')
    clearResults()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('productSearch.title')}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-gray-400 dark:text-swype-silver">
          {t('productSearch.monthlyUsage', { count: requestCount })}
        </p>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('productSearch.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-sm text-swype-dark dark:text-swype-cream placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-swype-red/30"
          />
        </div>
        <Button type="submit" variant="accent" size="md" disabled={loading || !query.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : t('productSearch.search')}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-danger/10 text-danger rounded-sm text-xs">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <Loader2 size={24} className="animate-spin mx-auto text-swype-red mb-2" />
          <p className="text-xs text-gray-500 dark:text-swype-silver">{t('productSearch.searching')}</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <p className="text-xs text-gray-500 dark:text-swype-silver mb-2">{t('productSearch.resultCount', { count: results.length })}</p>
          {results.map((product, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-soft-gray dark:bg-swype-dark/50 rounded-sm hover:bg-gray-100 dark:hover:bg-swype-dark/70 transition-colors"
            >
              <div className="w-12 h-12 rounded-sm bg-gray-200 dark:bg-swype-mid/30 overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Search size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-swype-dark dark:text-swype-cream truncate">{product.title}</p>
                <p className="text-[10px] text-gray-500 dark:text-swype-silver">
                  {product.store && `${product.store} · `}
                  {product.brand}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.price && (
                    <span className="text-xs font-bold text-success">{product.price.toLocaleString(locale)} TL</span>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[10px] text-swype-silver line-through">
                      {product.originalPrice.toLocaleString(locale)} TL
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button variant="accent" size="sm" onClick={() => handleTrack(product)}>
                  <Plus size={12} className="mr-1" />
                  {t('productSearch.track')}
                </Button>
                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-medium rounded-sm border border-swype-silver/40 dark:border-swype-mid text-swype-dark dark:text-swype-cream hover:bg-gray-100 dark:hover:bg-swype-mid/50 transition-colors"
                  >
                    <ExternalLink size={10} className="mr-1" />
                    {t('productSearch.go')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <div className="text-center py-8">
          <Search size={32} className="mx-auto text-gray-300 dark:text-swype-silver/30 mb-2" />
          <p className="text-xs text-gray-500 dark:text-swype-silver">{t('productSearch.typeToSearch')}</p>
        </div>
      )}

      {!loading && !error && results.length === 0 && !query && (
        <div className="text-center py-8">
          <Search size={32} className="mx-auto text-gray-300 dark:text-swype-silver/30 mb-2" />
          <p className="text-sm font-medium text-swype-dark dark:text-swype-cream mb-1">{t('productSearch.searchTitle')}</p>
          <p className="text-xs text-gray-500 dark:text-swype-silver">
            {t('productSearch.searchDesc')}
          </p>
        </div>
      )}
    </Modal>
  )
}
