import { Trash2, Tag, ExternalLink, Shirt } from 'lucide-react'
import Card from '../ui/Card'
import { useTranslation } from '../../contexts/LanguageContext'

export default function CartItem({ item, wallets, onWalletChange, onRemove, onAddToWardrobe }) {
  const { t, language } = useTranslation()
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-gray-100 dark:bg-swype-mid/30 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
          ) : (
            <Tag size={20} className="text-gray-300 dark:text-swype-silver/40" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              {item.brand && <p className="text-[10px] text-swype-mid dark:text-swype-silver font-semibold uppercase tracking-wide">{item.brand}</p>}
              <h3 className="font-medium text-sm text-swype-dark dark:text-swype-cream line-clamp-1">{item.productName}</h3>
            </div>
            <button
              onClick={() => onRemove(item)}
              className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-sm transition-colors cursor-pointer ml-2"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-success">{item.price?.toLocaleString(locale)} TL</span>
            <div className="flex items-center gap-2">
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-swype-dark dark:hover:text-swype-cream transition-colors">
                  <ExternalLink size={12} />
                </a>
              )}
              <button
                onClick={() => onAddToWardrobe(item)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-swype-sage bg-swype-sage/10 hover:bg-swype-sage/20 rounded-sm transition-colors cursor-pointer"
              >
                <Shirt size={11} />
                {t('cartItem.addToWardrobe')}
              </button>
              <select
                value={item.walletId || ''}
                onChange={(e) => onWalletChange(item.id, e.target.value)}
                className="text-[10px] px-2 py-1 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-swype-dark dark:text-swype-cream"
              >
                <option value="">{t('cartItem.selectWallet')}</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.balance.toLocaleString(locale)} TL)</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
