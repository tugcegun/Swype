import { useEffect, useState } from 'react'
import { Plus, Search, Shirt, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../hooks/useFirestore'
import { useTranslation, useCategoryTranslation } from '../contexts/LanguageContext'
import WardrobeCard from '../components/wardrobe/WardrobeCard'
import AddItemModal from '../components/wardrobe/AddItemModal'
import ItemDetailModal from '../components/wardrobe/ItemDetailModal'
import EditItemModal from '../components/wardrobe/EditItemModal'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import LottieLoader from '../components/ui/LottieLoader'

const categories = ['Tumu', 'Ust Giyim', 'Alt Giyim', 'Dis Giyim', 'Ayakkabi', 'Aksesuar', 'Diger']

export default function Wardrobe() {
  const { currentUser } = useAuth()
  const { t } = useTranslation()
  const tCategory = useCategoryTranslation()
  const { documents, loading, addDocument, updateDocument, deleteDocument, subscribeToQuery } = useFirestore('wardrobe_items')
  const { documents: cartItems, addDocument: addToCart, subscribeToQuery: subCart } = useFirestore('cart_items')
  const [showModal, setShowModal] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Tumu')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [alreadyInCartItem, setAlreadyInCartItem] = useState(null)

  useEffect(() => {
    if (!currentUser) return
    const userFilter = [{ field: 'userId', operator: '==', value: currentUser.uid }]
    const unsub1 = subscribeToQuery(userFilter)
    const unsub2 = subCart(userFilter)
    return () => { unsub1(); unsub2() }
  }, [currentUser])

  const handleAdd = async (item) => {
    await addDocument({
      ...item,
      userId: currentUser.uid,
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('wardrobe.deleteConfirm'))) {
      await deleteDocument(id)
      setSelectedItem(null)
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(null)
    setEditItem(item)
  }

  const handleSaveEdit = async (id, data) => {
    await updateDocument(id, data)
  }

  const handleDeleteFromDetail = (item) => {
    handleDelete(item.id)
  }

  const handleAddToCart = async (item) => {
    const alreadyExists = cartItems.some(
      (ci) => ci.productName === item.name && ci.brand === (item.brand || '')
    )
    if (alreadyExists) {
      setAlreadyInCartItem(item)
      return
    }
    await addToCart({
      userId: currentUser.uid,
      productName: item.name,
      brand: item.brand || '',
      price: item.price || 0,
      imageUrl: item.imageUrl || '',
      url: '',
      walletId: '',
    })
  }

  const filtered = documents.filter((item) => {
    const matchCat = activeCategory === 'Tumu' || item.category === activeCategory
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('wardrobe.title')}</h1>
          <p className="text-gray-500 dark:text-swype-silver mt-1">{t('wardrobe.clothesCount', { count: documents.length })}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" />
          {t('wardrobe.addClothes')}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-swype-silver" />
          <input
            type="text"
            placeholder={t('wardrobe.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-swype-mid bg-white dark:bg-swype-mid/30 text-swype-dark dark:text-swype-cream placeholder-gray-400 dark:placeholder-swype-silver focus:outline-none focus:ring-2 focus:ring-swype-red/30 focus:border-swype-red"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-in">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-swype-sage text-white'
                : 'bg-white dark:bg-swype-mid/30 text-gray-600 dark:text-swype-silver hover:bg-gray-100 dark:hover:bg-swype-mid/50 border border-gray-200 dark:border-swype-mid'
            }`}
          >
            {tCategory(cat)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LottieLoader size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Shirt size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('wardrobe.noClothes')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1 mb-4">{t('wardrobe.startBuilding')}</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={18} className="mr-2" />
            {t('wardrobe.addFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in stagger">
          {filtered.map((item) => (
            <WardrobeCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onClick={setSelectedItem}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddItemModal isOpen={showModal} onClose={() => setShowModal(false)} onAdd={handleAdd} />

      {/* Detail Modal */}
      <ItemDetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onEdit={handleEdit}
        onDelete={handleDeleteFromDetail}
        onAddToCart={handleAddToCart}
      />

      {/* Edit Modal */}
      <EditItemModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        onSave={handleSaveEdit}
      />

      {/* Already in Cart Warning */}
      <Modal isOpen={!!alreadyInCartItem} onClose={() => setAlreadyInCartItem(null)} title={t('wardrobe.alreadyInCart')}>
        <div className="text-center py-2">
          <AlertCircle size={48} className="text-swype-gold mx-auto mb-3" />
          <p className="text-sm text-swype-dark dark:text-swype-cream font-medium mb-1">
            {t('wardrobe.alreadyInCartMsg', { name: alreadyInCartItem?.name })}
          </p>
          <p className="text-xs text-gray-500 dark:text-swype-silver">
            {t('wardrobe.alreadyInCartDesc')}
          </p>
          <Button variant="accent" className="mt-4 w-full" onClick={() => setAlreadyInCartItem(null)}>
            {t('wardrobe.ok')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
