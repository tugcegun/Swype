import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import LordIcon from '../ui/LordIcon'
import { LORDICON } from '../../constants/icons'
import { ShoppingCart, Wallet, AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../contexts/LanguageContext'

export default function CheckoutModal({ isOpen, onClose, items, wallets, onCheckout }) {
  const { t, language } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  // Group items by wallet
  const walletGroups = {}
  items.forEach((item) => {
    if (!item.walletId) return
    if (!walletGroups[item.walletId]) {
      const w = wallets.find((w) => w.id === item.walletId)
      walletGroups[item.walletId] = { wallet: w, items: [], total: 0 }
    }
    walletGroups[item.walletId].items.push(item)
    walletGroups[item.walletId].total += item.price || 0
  })

  const unassigned = items.filter((i) => !i.walletId)
  const totalAmount = items.reduce((sum, i) => sum + (i.price || 0), 0)

  const hasInsufficientFunds = Object.values(walletGroups).some(
    (g) => g.wallet && g.total > g.wallet.balance
  )

  const canCheckout = unassigned.length === 0 && !hasInsufficientFunds && items.length > 0

  const handleCheckout = async () => {
    if (!canCheckout) return
    setProcessing(true)
    await onCheckout(walletGroups)
    setProcessing(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('checkout.title')}>
      <div className="space-y-4">
        {/* Summary */}
        <div className="p-4 bg-soft-gray dark:bg-swype-dark/50 rounded-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-swype-silver">{t('checkout.totalProducts')}</span>
            <span className="font-medium text-swype-dark dark:text-swype-cream">{t('checkout.pieces', { count: items.length })}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-swype-silver">{t('checkout.totalAmount')}</span>
            <span className="text-lg font-bold text-swype-dark dark:text-swype-cream">{totalAmount.toLocaleString(locale)} TL</span>
          </div>
        </div>

        {/* Wallet breakdown */}
        {Object.entries(walletGroups).map(([walletId, group]) => {
          const insufficient = group.wallet && group.total > group.wallet.balance
          return (
            <div key={walletId} className={`p-3 rounded-sm border ${insufficient ? 'border-danger/30 bg-danger/5' : 'border-swype-silver/20 dark:border-swype-mid'}`}>
              <div className="flex items-center gap-2 mb-2">
                <LordIcon
                  src={LORDICON.WALLET}
                  trigger="hover"
                  size={16}
                  colors="primary:#d4a853,secondary:#d4a853"
                  fallback={<Wallet size={14} className="text-swype-gold" />}
                />
                <span className="text-xs font-medium text-swype-dark dark:text-swype-cream">
                  {group.wallet?.name || t('checkout.unknownWallet')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-swype-silver">{t('checkout.productWallet', { count: group.items.length, total: group.total.toLocaleString(locale) })}</span>
                <span className={insufficient ? 'text-danger font-medium' : 'text-success'}>
                  {t('checkout.balance', { amount: group.wallet?.balance.toLocaleString(locale) })}
                </span>
              </div>
              {insufficient && (
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-danger">
                  <AlertTriangle size={10} />
                  {t('checkout.insufficientBalance')}
                </div>
              )}
            </div>
          )
        })}

        {/* Warnings */}
        {unassigned.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-sm text-xs text-warning">
            <AlertTriangle size={14} />
            {t('checkout.walletNotSelected', { count: unassigned.length })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            {t('checkout.cancel')}
          </Button>
          <Button
            variant="success"
            className="flex-1"
            onClick={handleCheckout}
            disabled={!canCheckout || processing}
          >
            <ShoppingCart size={14} className="mr-1.5" />
            {processing ? t('checkout.processing') : t('checkout.buy')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
