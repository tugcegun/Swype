import { Check, Trash2, Clock, Shirt, Tag, Calendar, ShoppingBag, Repeat } from 'lucide-react'
import Card from '../ui/Card'
import { useTranslation } from '../../contexts/LanguageContext'

export default function ReminderCard({ reminder, onToggle, onDelete }) {
  const { t, language } = useTranslation()

  const typeConfig = {
    wardrobe: { icon: Shirt, label: t('reminderType.wardrobe'), color: 'text-blue-500', bg: 'bg-blue-500/10' },
    deal: { icon: Tag, label: t('reminderType.deal'), color: 'text-swype-red', bg: 'bg-swype-red/10' },
    market: { icon: ShoppingBag, label: t('reminderType.market'), color: 'text-swype-gold', bg: 'bg-swype-gold/10' },
    general: { icon: Calendar, label: t('reminderType.general'), color: 'text-purple-500', bg: 'bg-purple-500/10' },
  }

  const repeatLabels = {
    daily: t('reminderCard.daily'),
    weekly: t('reminderCard.weekly'),
    monthly: t('reminderCard.monthly'),
  }

  const config = typeConfig[reminder.type] || typeConfig.general
  const TypeIcon = config.icon

  const isOverdue = !reminder.completed && reminder.dueDate && new Date(reminder.dueDate.seconds ? reminder.dueDate.seconds * 1000 : reminder.dueDate) < new Date()

  const locale = language === 'en' ? 'en-US' : 'tr-TR'
  const formatDate = (date) => {
    if (!date) return ''
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date)
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Card className={`p-4 transition-all ${reminder.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(reminder)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
            reminder.completed
              ? 'bg-success border-success text-white'
              : 'border-gray-300 dark:border-swype-silver/50 hover:border-success'
          }`}
        >
          {reminder.completed && <Check size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium ${config.bg} ${config.color}`}>
              <TypeIcon size={10} />
              {config.label}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium bg-danger/10 text-danger">
                <Clock size={10} />
                {t('reminderCard.overdue')}
              </span>
            )}
            {reminder.repeat && reminder.repeat !== 'none' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium bg-swype-sage/10 text-swype-sage">
                <Repeat size={10} />
                {repeatLabels[reminder.repeat]}
              </span>
            )}
          </div>

          <h3 className={`font-medium text-sm text-swype-dark dark:text-swype-cream ${reminder.completed ? 'line-through' : ''}`}>
            {reminder.title}
          </h3>
          {reminder.description && (
            <p className="text-xs text-gray-500 dark:text-swype-silver mt-0.5">{reminder.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {reminder.dueDate && (
              <p className="text-[10px] text-gray-400 dark:text-swype-silver/70 flex items-center gap-1">
                <Clock size={10} />
                {formatDate(reminder.dueDate)}
              </p>
            )}
            {reminder.time && (
              <p className="text-[10px] text-gray-400 dark:text-swype-silver/70">
                {reminder.time}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(reminder)}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-sm transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  )
}
