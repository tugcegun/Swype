import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useTranslation } from '../../contexts/LanguageContext'

export default function AddWalletModal({ isOpen, onClose, onAdd }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', balance: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await onAdd({
      name: form.name.trim(),
      balance: parseFloat(form.balance) || 0,
    })
    setForm({ name: '', balance: '' })
    setSaving(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addWallet.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('addWallet.name')}
          placeholder={t('addWallet.namePlaceholder')}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label={t('addWallet.balance')}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: e.target.value })}
        />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            {t('addWallet.cancel')}
          </Button>
          <Button type="submit" variant="gold" className="flex-1" disabled={saving || !form.name.trim()}>
            {saving ? t('addWallet.creating') : t('addWallet.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
