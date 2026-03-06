import { Trash2, Eye, ShoppingCart } from 'lucide-react'
import Card from '../ui/Card'
import { useTranslation, useCategoryTranslation } from '../../contexts/LanguageContext'

const categoryColors = {
  'Ust Giyim': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Alt Giyim': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Dis Giyim': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Ayakkabi': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Aksesuar': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'Diger': 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300',
}

export default function WardrobeCard({ item, onDelete, onClick, onAddToCart }) {
  const { t, language } = useTranslation()
  const tCategory = useCategoryTranslation()
  const colorClass = categoryColors[item.category] || categoryColors['Diger']
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  return (
    <Card hover className="overflow-hidden group cursor-pointer" onClick={() => onClick && onClick(item)}>
      <div className="aspect-square bg-gray-100 dark:bg-swype-mid/30 relative overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-swype-silver/40">
            <Eye size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
        {item.price > 0 && (
          <div className="absolute top-2 left-2 bg-swype-dark/80 text-swype-cream px-2 py-0.5 rounded-sm text-[10px] font-bold">
            {item.price.toLocaleString(locale)} TL
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-swype-dark dark:text-swype-cream text-xs truncate">{item.name}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${colorClass}`}>
            {tCategory(item.category)}
          </span>
          {item.brand && (
            <span className="text-xs text-gray-500 dark:text-swype-silver">{item.brand}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(item) }}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-swype-gold bg-swype-gold/10 hover:bg-swype-gold/20 rounded-sm transition-colors cursor-pointer"
          >
            <ShoppingCart size={11} />
            {t('wardrobeCard.addToCart')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
            className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  )
}
