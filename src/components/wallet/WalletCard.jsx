import { Wallet, Plus, Minus, Trash2 } from 'lucide-react'
import Card from '../ui/Card'
import LordIcon from '../ui/LordIcon'
import { LORDICON } from '../../constants/icons'
import { useTranslation } from '../../contexts/LanguageContext'

export default function WalletCard({ wallet, onAddFunds, onDelete }) {
  const { t, language } = useTranslation()
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  return (
    <Card className="p-5 animate-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-swype-gold/20 rounded-xl flex items-center justify-center">
            <LordIcon
              src={LORDICON.WALLET}
              trigger="hover"
              size={24}
              colors="primary:#d4a853,secondary:#d4a853"
              fallback={<Wallet size={20} className="text-swype-gold" />}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-swype-dark dark:text-swype-cream">{wallet.name}</h3>
            <p className="text-[10px] text-gray-400 dark:text-swype-silver/70">
              {wallet.createdAt?.seconds
                ? new Date(wallet.createdAt.seconds * 1000).toLocaleDateString(locale)
                : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(wallet)}
          className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-sm transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-swype-dark dark:text-swype-cream">
          {wallet.balance.toLocaleString(locale, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-swype-silver">TL</span>
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAddFunds(wallet, 'deposit')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-success/10 text-success rounded-sm text-xs font-medium hover:bg-success/20 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          {t('walletCard.add')}
        </button>
        <button
          onClick={() => onAddFunds(wallet, 'withdraw')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-danger/10 text-danger rounded-sm text-xs font-medium hover:bg-danger/20 transition-colors cursor-pointer"
        >
          <Minus size={14} />
          {t('walletCard.withdraw')}
        </button>
      </div>
    </Card>
  )
}
