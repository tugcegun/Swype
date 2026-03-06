import { Pencil, Trash2, Eye, ShoppingCart } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useTranslation, useCategoryTranslation, useSeasonTranslation } from '../../contexts/LanguageContext'

const categoryColors = {
  'Ust Giyim': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Alt Giyim': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Dis Giyim': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Ayakkabi': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Aksesuar': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'Diger': 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300',
}

export default function ItemDetailModal({ isOpen, onClose, item, onEdit, onDelete, onAddToCart }) {
  const { t, language } = useTranslation()
  const tCategory = useCategoryTranslation()
  const tSeason = useSeasonTranslation()

  if (!item) return null

  const colorClass = categoryColors[item.category] || categoryColors['Diger']
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name}>
      {/* Image */}
      <div className="w-full aspect-square bg-gray-100 dark:bg-swype-mid/30 rounded-sm overflow-hidden mb-4 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-swype-silver/40">
            <Eye size={64} />
          </div>
        )}
        {item.price > 0 && (
          <div className="absolute bottom-3 left-3 bg-swype-dark/80 text-swype-cream px-3 py-1 rounded-sm text-sm font-bold">
            {item.price.toLocaleString(locale)} TL
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-sm font-medium ${colorClass}`}>
            {tCategory(item.category)}
          </span>
          {item.season && item.season !== 'Tum Mevsimler' && (
            <span className="text-xs px-2 py-0.5 rounded-sm font-medium bg-swype-sage/10 text-swype-sage">
              {tSeason(item.season)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {item.brand && (
            <div>
              <p className="text-[10px] text-gray-400 dark:text-swype-silver/70 uppercase tracking-wide">{t('itemDetail.brand')}</p>
              <p className="text-sm font-medium text-swype-dark dark:text-swype-cream">{item.brand}</p>
            </div>
          )}
          {item.color && (
            <div>
              <p className="text-[10px] text-gray-400 dark:text-swype-silver/70 uppercase tracking-wide">{t('itemDetail.color')}</p>
              <p className="text-sm font-medium text-swype-dark dark:text-swype-cream">{item.color}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-gray-400 dark:text-swype-silver/70 uppercase tracking-wide">{t('itemDetail.season')}</p>
            <p className="text-sm font-medium text-swype-dark dark:text-swype-cream">{tSeason(item.season || 'Tum Mevsimler')}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 dark:text-swype-silver/70 uppercase tracking-wide">{t('itemDetail.price')}</p>
            <p className="text-sm font-bold text-success">{item.price > 0 ? `${item.price.toLocaleString(locale)} TL` : t('itemDetail.notSpecified')}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <Button variant="gold" className="flex-1" onClick={() => { onAddToCart(item); onClose() }}>
          <ShoppingCart size={14} className="mr-1.5" />
          {t('itemDetail.addToCart')}
        </Button>
        <Button variant="accent" size="md" onClick={() => onEdit(item)}>
          <Pencil size={14} />
        </Button>
        <Button variant="danger" size="md" onClick={() => onDelete(item)}>
          <Trash2 size={14} />
        </Button>
      </div>
    </Modal>
  )
}
