import { Tag, ExternalLink, Bell, ShoppingCart } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useTranslation } from '../../contexts/LanguageContext'

export default function DealCard({ deal, onAlert, alertLabel, onAddToCart }) {
  const { t } = useTranslation()
  const discount = deal.originalPrice > 0
    ? Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
    : 0

  return (
    <Card hover className="overflow-hidden">
      <div className="aspect-video bg-gray-100 dark:bg-swype-mid/30 relative overflow-hidden">
        {deal.imageUrl ? (
          <img src={deal.imageUrl} alt={deal.productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-swype-silver/40">
            <Tag size={28} />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-swype-dark text-swype-cream px-1.5 py-0.5 rounded-sm text-[10px] font-bold">
          %{discount}
        </div>
      </div>

      <div className="p-3">
        <p className="text-[10px] text-swype-mid dark:text-swype-silver font-semibold uppercase tracking-wide">{deal.brand}</p>
        <h3 className="font-medium text-swype-dark dark:text-swype-cream mt-0.5 text-xs line-clamp-2">{deal.productName}</h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-success">{deal.dealPrice} TL</span>
          <span className="text-[10px] text-swype-silver line-through">{deal.originalPrice} TL</span>
        </div>

        <p className="text-[10px] text-swype-silver mt-1.5">
          {deal.endDate && `Son: ${new Date(deal.endDate).toLocaleDateString('tr-TR')}`}
        </p>

        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onAlert && onAlert(deal)}
          >
            <Bell size={12} className="mr-1" />
            {alertLabel || t('dealCard.alarm')}
          </Button>
          {onAddToCart && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => onAddToCart(deal)}
            >
              <ShoppingCart size={12} className="mr-1" />
              {t('dealCard.cart')}
            </Button>
          )}
          {deal.url && (
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-medium rounded-sm bg-swype-dark text-swype-cream hover:bg-swype-mid transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              {t('dealCard.go')}
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}
