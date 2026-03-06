import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useTranslation } from '../../contexts/LanguageContext'

export default function AddFundsModal({ isOpen, onClose, wallet, type, onSubmit }) {
  const { t, language } = useTranslation()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const isDeposit = type === 'deposit'
  const title = isDeposit ? t('addFunds.deposit') : t('addFunds.withdraw')
  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!val || val <= 0) return
    if (!isDeposit && val > wallet.balance) return

    setSaving(true)
    await onSubmit({
      walletId: wallet.id,
      walletName: wallet.name,
      amount: val,
      type: isDeposit ? 'deposit' : 'withdrawal',
      description: description.trim() || (isDeposit ? t('addFunds.defaultDeposit') : t('addFunds.defaultWithdraw')),
    })
    setAmount('')
    setDescription('')
    setSaving(false)
    onClose()
  }

  if (!wallet) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${title} - ${wallet.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center p-3 bg-soft-gray dark:bg-swype-dark/50 rounded-sm">
          <p className="text-xs text-gray-500 dark:text-swype-silver">{t('addFunds.currentBalance')}</p>
          <p className="text-xl font-bold text-swype-dark dark:text-swype-cream">
            {wallet.balance.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
          </p>
        </div>

        <Input
          label={t('addFunds.amount', { title })}
          type="number"
          min="0.01"
          step="0.01"
          max={!isDeposit ? wallet.balance : undefined}
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {!isDeposit && parseFloat(amount) > wallet.balance && (
          <p className="text-xs text-danger">{t('addFunds.insufficientBalance')}</p>
        )}

        <Input
          label={t('addFunds.description')}
          placeholder={t('addFunds.descPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            {t('addFunds.cancel')}
          </Button>
          <Button
            type="submit"
            variant={isDeposit ? 'success' : 'danger'}
            className="flex-1"
            disabled={saving || !parseFloat(amount) || (!isDeposit && parseFloat(amount) > wallet.balance)}
          >
            {saving ? t('addFunds.processing') : title}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
