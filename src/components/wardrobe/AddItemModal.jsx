import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useUrlScraper } from '../../hooks/useUrlScraper'
import { useTranslation, useCategoryTranslation, useSeasonTranslation } from '../../contexts/LanguageContext'
import { Link2, Loader2 } from 'lucide-react'

const categories = ['Ust Giyim', 'Alt Giyim', 'Dis Giyim', 'Ayakkabi', 'Aksesuar', 'Diger']
const seasons = ['Ilkbahar', 'Yaz', 'Sonbahar', 'Kis', 'Tum Mevsimler']

export default function AddItemModal({ isOpen, onClose, onAdd }) {
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
    price: '',
  })
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { scrapeUrl, loading: scraping, error: scrapeError } = useUrlScraper()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleUrlPaste = async (e) => {
    const url = e.target.value
    setUrlInput(url)

    if (!url || !url.startsWith('http')) return

    const data = await scrapeUrl(url)
    if (data) {
      setForm((prev) => ({
        ...prev,
        name: data.name || prev.name,
        imageUrl: data.imageUrl || prev.imageUrl,
        brand: data.brand || prev.brand,
        price: data.price || prev.price,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    await onAdd({
      ...form,
      price: parseFloat(form.price) || 0,
      wearCount: 0,
      styleTags: [],
    })
    setForm({ name: '', category: 'Ust Giyim', color: '', season: 'Tum Mevsimler', brand: '', imageUrl: '', price: '' })
    setUrlInput('')
    setLoading(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addItem.title')}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* URL Paste Section */}
        <div className="p-3 bg-swype-sage/10 dark:bg-swype-sage/5 rounded-sm border border-swype-sage/20">
          <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1 flex items-center gap-1.5">
            <Link2 size={12} />
            {t('addItem.pasteUrl')}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={handleUrlPaste}
              placeholder={t('addItem.urlPlaceholder')}
              className="flex-1 px-3 py-1.5 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-sm text-swype-dark dark:text-swype-cream placeholder-swype-silver focus:outline-none focus:ring-1 focus:ring-swype-sage/30 focus:border-swype-sage"
            />
            {scraping && <Loader2 size={16} className="animate-spin text-swype-sage mt-2" />}
          </div>
          {scrapeError && <p className="text-[10px] text-danger mt-1">{scrapeError}</p>}
          {!scrapeError && urlInput && !scraping && (
            <p className="text-[10px] text-swype-sage mt-1">{t('addItem.autoFilled')}</p>
          )}
        </div>

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
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">{t('addItem.cancel')}</Button>
          <Button type="submit" disabled={loading || !form.name.trim()} className="flex-1">
            {loading ? t('addItem.adding') : t('addItem.add')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
