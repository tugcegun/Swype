import { useState, useEffect, useRef } from 'react'
import { Plus, Clock, Filter, Shirt, Tag, Calendar, ShoppingBag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../hooks/useFirestore'
import { useTranslation } from '../contexts/LanguageContext'
import ReminderCard from '../components/reminders/ReminderCard'
import AddReminderModal from '../components/reminders/AddReminderModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LottieLoader from '../components/ui/LottieLoader'

export default function Reminders() {
  const { currentUser } = useAuth()
  const { t } = useTranslation()
  const { documents: reminders, loading, addDocument, updateDocument, deleteDocument, subscribeToQuery } = useFirestore('reminders')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const notifiedRef = useRef(new Set())

  const typeFilters = [
    { value: 'all', label: t('reminderType.all'), icon: Filter },
    { value: 'wardrobe', label: t('reminderType.wardrobe'), icon: Shirt },
    { value: 'deal', label: t('reminderType.deal'), icon: Tag },
    { value: 'market', label: t('reminderType.market'), icon: ShoppingBag },
    { value: 'general', label: t('reminderType.general'), icon: Calendar },
  ]

  useEffect(() => {
    if (!currentUser) return
    const unsub = subscribeToQuery([
      { field: 'userId', operator: '==', value: currentUser.uid },
    ])
    return unsub
  }, [currentUser])

  useEffect(() => {
    if (!reminders.length) return

    const checkReminders = () => {
      const now = new Date()
      reminders.forEach((r) => {
        if (r.completed || notifiedRef.current.has(r.id)) return
        if (!r.dueDate || !r.time) return

        const dueDate = r.dueDate.seconds ? new Date(r.dueDate.seconds * 1000) : new Date(r.dueDate)
        const [hours, minutes] = r.time.split(':').map(Number)
        dueDate.setHours(hours, minutes, 0, 0)

        const notifyBefore = (r.notifyBefore || 0) * 60 * 1000
        const notifyTime = new Date(dueDate.getTime() - notifyBefore)

        if (now >= notifyTime && now - notifyTime < 60000) {
          notifiedRef.current.add(r.id)
          try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(t('reminders.notification'), {
                body: r.title,
                icon: '/favicon.png',
              })
            }
          } catch {}
        }
      })
    }

    const interval = setInterval(checkReminders, 30000)
    checkReminders()
    return () => clearInterval(interval)
  }, [reminders, t])

  const handleAdd = async (data) => {
    await addDocument({
      ...data,
      userId: currentUser.uid,
    })
  }

  const handleToggle = async (reminder) => {
    await updateDocument(reminder.id, { completed: !reminder.completed })
  }

  const handleDelete = async (reminder) => {
    if (window.confirm(t('reminders.deleteConfirm', { name: reminder.title }))) {
      await deleteDocument(reminder.id)
    }
  }

  const filtered = reminders
    .filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (!showCompleted && r.completed) return false
      return true
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const dateA = a.dueDate?.seconds || 0
      const dateB = b.dueDate?.seconds || 0
      return dateA - dateB
    })

  const activeCount = reminders.filter((r) => !r.completed).length
  const completedCount = reminders.filter((r) => r.completed).length
  const overdueCount = reminders.filter((r) => {
    if (r.completed || !r.dueDate) return false
    const d = r.dueDate.seconds ? new Date(r.dueDate.seconds * 1000) : new Date(r.dueDate)
    return d < new Date()
  }).length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 animate-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('reminders.title')}</h1>
          <p className="text-gray-500 dark:text-swype-silver mt-1">
            {activeCount > 0 ? t('reminders.activeCount', { count: activeCount }) : t('reminders.noReminders')}
          </p>
        </div>
        <Button variant="accent" size="md" onClick={() => setAddModalOpen(true)}>
          <Plus size={16} className="mr-1.5" />
          {t('reminders.newReminder')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 animate-in stagger">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-swype-sage">{activeCount}</p>
          <p className="text-xs text-gray-500 dark:text-swype-silver">{t('reminders.active')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-success">{completedCount}</p>
          <p className="text-xs text-gray-500 dark:text-swype-silver">{t('reminders.completed')}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-danger">{overdueCount}</p>
          <p className="text-xs text-gray-500 dark:text-swype-silver">{t('reminders.overdue')}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 animate-in">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === f.value
                  ? 'bg-swype-sage text-white'
                  : 'bg-white dark:bg-swype-mid/30 text-gray-600 dark:text-swype-silver hover:bg-gray-100 dark:hover:bg-swype-mid/50 border border-gray-200 dark:border-swype-mid'
              }`}
            >
              <f.icon size={14} />
              {f.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-swype-silver cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded accent-swype-sage cursor-pointer"
          />
          {t('reminders.showCompleted')}
        </label>
      </div>

      {/* Reminders list */}
      {loading ? (
        <div className="text-center py-20">
          <LottieLoader size={40} text={t('common.loading')} />
        </div>
      ) : filtered.length === 0 && reminders.length === 0 ? (
        <div className="text-center py-20">
          <Clock size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('reminders.noReminders')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1 mb-4">
            {t('reminders.noRemindersDesc')}
          </p>
          <Button variant="accent" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} className="mr-1.5" />
            {t('reminders.addFirst')}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Filter size={48} className="text-gray-300 dark:text-swype-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-deep-navy dark:text-swype-cream">{t('reminders.filterEmpty')}</h3>
          <p className="text-gray-500 dark:text-swype-silver mt-1">{t('reminders.filterEmptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3 animate-in stagger">
          {filtered.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      <AddReminderModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}
