import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useTranslation } from '../../contexts/LanguageContext'

export default function AddReminderModal({ isOpen, onClose, onAdd }) {
  const { t } = useTranslation()

  const reminderTypes = [
    { value: 'wardrobe', label: t('reminderType.wardrobe') },
    { value: 'deal', label: t('reminderType.deal') },
    { value: 'market', label: t('reminderType.market') },
    { value: 'general', label: t('reminderType.general') },
  ]

  const repeatOptions = [
    { value: 'none', label: t('addReminder.repeatNone') },
    { value: 'daily', label: t('addReminder.repeatDaily') },
    { value: 'weekly', label: t('addReminder.repeatWeekly') },
    { value: 'monthly', label: t('addReminder.repeatMonthly') },
  ]

  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    time: '',
    type: 'general',
    repeat: 'none',
    notifyBefore: 0,
    category: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setSaving(true)
    await onAdd({
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate ? new Date(form.dueDate) : null,
      time: form.time || null,
      type: form.type,
      repeat: form.repeat,
      notifyBefore: parseInt(form.notifyBefore) || 0,
      category: form.type === 'market' ? 'market' : (form.category || form.type),
      completed: false,
    })
    setForm({ title: '', description: '', dueDate: '', time: '', type: 'general', repeat: 'none', notifyBefore: 0, category: '' })
    setSaving(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('addReminder.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('addReminder.titleLabel')}
          placeholder={t('addReminder.titlePlaceholder')}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <div>
          <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1">
            {t('addReminder.description')}
          </label>
          <textarea
            placeholder={t('addReminder.descPlaceholder')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-sm text-swype-dark dark:text-swype-cream placeholder-swype-silver focus:outline-none focus:ring-1 focus:ring-swype-mid/30 focus:border-swype-mid transition-all duration-200 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('addReminder.date')}
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <Input
            label={t('addReminder.time')}
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        {/* Repeat */}
        <div>
          <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1">
            {t('addReminder.repeat')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {repeatOptions.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm({ ...form, repeat: r.value })}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                  form.repeat === r.value
                    ? 'bg-swype-sage text-white'
                    : 'bg-soft-gray dark:bg-swype-dark/50 text-gray-600 dark:text-swype-silver hover:bg-gray-100 dark:hover:bg-swype-dark/70 border border-swype-silver/30 dark:border-swype-mid'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1">
            {t('addReminder.type')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {reminderTypes.map((tp) => (
              <button
                key={tp.value}
                type="button"
                onClick={() => setForm({ ...form, type: tp.value })}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                  form.type === tp.value
                    ? 'bg-swype-sage text-white'
                    : 'bg-soft-gray dark:bg-swype-dark/50 text-gray-600 dark:text-swype-silver hover:bg-gray-100 dark:hover:bg-swype-dark/70 border border-swype-silver/30 dark:border-swype-mid'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notify Before */}
        <div>
          <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1">
            {t('addReminder.notifyBefore')}
          </label>
          <select
            value={form.notifyBefore}
            onChange={(e) => setForm({ ...form, notifyBefore: e.target.value })}
            className="w-full px-3 py-2 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-sm text-swype-dark dark:text-swype-cream focus:outline-none focus:ring-1 focus:ring-swype-mid/30 focus:border-swype-mid"
          >
            <option value={0}>{t('addReminder.notifyOnTime')}</option>
            <option value={5}>{t('addReminder.notify5')}</option>
            <option value={15}>{t('addReminder.notify15')}</option>
            <option value={30}>{t('addReminder.notify30')}</option>
            <option value={60}>{t('addReminder.notify60')}</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" size="md" className="flex-1" onClick={onClose}>
            {t('addReminder.cancel')}
          </Button>
          <Button type="submit" variant="accent" size="md" className="flex-1" disabled={saving || !form.title.trim()}>
            {saving ? t('addReminder.saving') : t('addReminder.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
