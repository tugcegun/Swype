import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useTranslation, useCategoryTranslation, useSeasonTranslation } from '../../contexts/LanguageContext'

const categories = ['Ust Giyim', 'Alt Giyim', 'Dis Giyim', 'Ayakkabi', 'Aksesuar', 'Diger']
const seasons = ['Ilkbahar', 'Yaz', 'Sonbahar', 'Kis', 'Tum Mevsimler']

export default function EditItemModal({ isOpen, onClose, item, onSave }) {
  const { t } = useTranslation()
  const tCategory = useCategoryTranslation()
  const tSeason = useSeasonTranslation()
  const [form, setForm] = useState({
    name: '',
    category: 'Ust Giyim',
    color: '',
    season: 'Tum Mevsimler',
    brand: '',
    imageUrl: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        category: item.category || 'Ust Giyim',
        color: item.color || '',
        season: item.season || 'Tum Mevsimler',
        brand: item.brand || '',
        imageUrl: item.imageUrl || '',
        price: item.price || '',
      })
    }
  }, [item])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(item.id, { ...form, price: parseFloat(form.price) || 0 })
    setSaving(false)
    onClose()
  }

  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('editItem.title')}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label={t('addItem.name')} name="name" value={form.name} onChange={handleChange} placeholder={t('addItem.namePlaceholder')} required />

        <div>
          <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1">{t('addItem.category')}</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-sm text-swype-dark dark:text-swype-cream focus:outline-none focus:ring-1 focus:ring-swype-mid/30 focus:border-swype-mid">
            {categories.map((c) => (<option key={c} value={c}>{tCategory(c)}</option>))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label={t('addItem.color')} name="color" value={form.color} onChange={handleChange} placeholder={t('addItem.colorPlaceholder')} />
          <div>
            <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1">{t('addItem.season')}</label>
            <select name="season" value={form.season} onChange={handleChange} className="w-full px-3 py-2 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-sm text-swype-dark dark:text-swype-cream focus:outline-none focus:ring-1 focus:ring-swype-mid/30 focus:border-swype-mid">
              {seasons.map((s) => (<option key={s} value={s}>{tSeason(s)}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label={t('addItem.brand')} name="brand" value={form.brand} onChange={handleChange} placeholder={t('addItem.brandPlaceholder')} />
          <Input label={t('addItem.price')} name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
        </div>
        <Input label={t('addItem.imageUrl')} name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">{t('editItem.cancel')}</Button>
          <Button type="submit" variant="accent" disabled={saving || !form.name.trim()} className="flex-1">
            {saving ? t('editItem.saving') : t('editItem.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
