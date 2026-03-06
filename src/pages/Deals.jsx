import { useState, useEffect } from 'react'
import { Search, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../hooks/useFirestore'
import { useTranslation, useCategoryTranslation } from '../contexts/LanguageContext'
import DealCard from '../components/deals/DealCard'
import ProductSearchModal from '../components/deals/ProductSearchModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LottieLoader from '../components/ui/LottieLoader'
import { useNavigate } from 'react-router-dom'

const dealCategories = ['Tumu', 'Ust Giyim', 'Alt Giyim', 'Dis Giyim', 'Ayakkabi', 'Aksesuar']

export default function Deals() {
  const { currentUser } = useAuth()
  const { t } = useTranslation()
  const tCategory = useCategoryTranslation()
  const { documents: deals, loading, addDocument, deleteDocument, subscribeToQuery } = useFirestore('deals')
  const { addDocument: addCartItem } = useFirestore('cart_items')
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tumu')
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const unsub = subscribeToQuery([
      { field: 'userId', operator: '==', value: currentUser.uid },
    ])
    return unsub
  }, [currentUser])

  const handleTrackProduct = async (product) => {
    await addDocument({
      userId: currentUser.uid,
      productName: product.productName,
      brand: product.brand,
      store: product.store || '',
      originalPrice: product.originalPrice || 0,
      dealPrice: product.dealPrice || 0,
      imageUrl: product.imageUrl || '',
      url: product.url || '',
      category: '',
    })
    setSearchModalOpen(false)
  }

  const handleDelete = async (deal) => {
    if (window.confirm(t('deals.removeConfirm', { name: deal.productName }))) {
      await deleteDocument(deal.id)
    }
  }

  const handleAddToCart = async (deal) => {
    await addCartItem({
      userId: currentUser.uid,
      productName: deal.productName,
      brand: deal.brand || '',
      price: deal.dealPrice || 0,
      imageUrl: deal.imageUrl || '',
      url: deal.url || '',
      walletId: '',
    })
    navigate('/cart')
  }

  const filtered = deals.filter((d) => {
    const matchCat = activeCategory === 'Tumu' || d.category === activeCategory
    const matchSearch =
      (d.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  const avgDiscount = deals.length > 0
    ? Math.round(
        deals.reduce((sum, d) => {
          if (d.originalPrice && d.dealPrice && d.originalPrice > 0) {
            return sum + ((d.originalPrice - d.dealPrice) / d.originalPrice) * 100
          }
          return sum
        }, 0) / deals.filter((d) => d.originalPrice > 0).length || 0
      )
    : 0

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('deals.title')}</h1>
          <p className="text-gray-500 dark:text-swype-silver mt-1">
            {deals.length > 0 ? t('deals.trackingCount', { count: deals.length }) : t('deals.noTracking')}
          </p>
        </div>
        <Button variant="accent" size="md" onClick={() => setSearchModalOpen(true)}>
          <Search size={16} className="mr-1.5" />
          {t('deals.searchProduct')}
        </Button>
      </div>

      {/* Search */}
      {deals.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-swype-silver" />
            <input
              type="text"
              placeholder={t('deals.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-swype-mid bg-white dark:bg-swype-mid/30 text-swype-dark dark:text-swype-cream placeholder-gray-400 dark:placeholder-swype-silver focus:outline-none focus:ring-2 focus:ring-swype-red/30 focus:border-swype-red"
            />
          </div>
        </div>
      )}

      {/* Category filters */}
      {deals.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-in">
          {dealCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-swype-red text-white'
                  : 'bg-white dark:bg-swype-mid/30 text-gray-600 dark:text-swype-silver hover:bg-gray-100 dark:hover:bg-swype-mid/50 border border-gray-200 dark:border-swype-mid'
              }`}
            >
              {tCategory(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Summary stats */}
      {deals.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 animate-in stagger">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-swype-red">{deals.length}</p>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('deals.tracked')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-success">%{avgDiscount}</p>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('deals.avgDiscount')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">
              {deals.filter((d) => d.originalPrice && d.dealPrice && d.dealPrice < d.originalPrice).length}
            </p>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('deals.onSale')}</p>
          </Card>
        </div>
      )}

      {/* Deals grid */}
      {loading ? (
        <div className="text-center py-20">
          <LottieLoader size={40} text={t('common.loading')} />
        </div>
      ) : filtered.length === 0 && deals.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('deals.noProducts')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1 mb-4">
            {t('deals.noProductsDesc')}
          </p>
          <Button variant="accent" onClick={() => setSearchModalOpen(true)}>
            <Search size={16} className="mr-1.5" />
            {t('deals.startSearch')}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('deals.noResults')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1">{t('deals.noResultsDesc')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in stagger">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} onAlert={handleDelete} alertLabel={t('deals.remove')} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}

      {/* Product Search Modal */}
      <ProductSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onTrack={handleTrackProduct}
      />
    </div>
  )
}
