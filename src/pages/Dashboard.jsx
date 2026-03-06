import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shirt, Tag, Plus, ArrowRight, ShoppingBag, Star, Bell, Clock, Check, Wallet, ShoppingCart, ArrowDownRight } from 'lucide-react'
import LordIcon from '../components/ui/LordIcon'
import { LORDICON } from '../constants/icons'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../hooks/useFirestore'
import { useTranslation, useCategoryTranslation } from '../contexts/LanguageContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { t, language } = useTranslation()
  const tCategory = useCategoryTranslation()
  const { documents: wardrobeItems, subscribeToQuery: subWardrobe } = useFirestore('wardrobe_items')
  const { documents: deals, subscribeToQuery: subDeals } = useFirestore('deals')
  const { documents: reminders, subscribeToQuery: subReminders, updateDocument: updateReminder } = useFirestore('reminders')
  const { documents: wallets, subscribeToQuery: subWallets } = useFirestore('wallets')
  const { documents: transactions, subscribeToQuery: subTransactions } = useFirestore('transactions')
  const [stats, setStats] = useState({ totalItems: 0, categories: 0, deals: 0, favBrand: '-' })
  const [notifPermission, setNotifPermission] = useState('default')

  const quickStats = [
    { icon: Shirt, label: t('dashboard.totalClothes'), color: 'bg-blue-500', key: 'totalItems' },
    { icon: ShoppingBag, label: t('dashboard.category'), color: 'bg-purple-500', key: 'categories' },
    { icon: Tag, label: t('dashboard.tracked'), color: 'bg-swype-terra', key: 'deals' },
    { icon: Star, label: t('dashboard.favBrand'), color: 'bg-warning', key: 'favBrand' },
  ]

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotifPermission(Notification.permission)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!currentUser) return
    const userFilter = [{ field: 'userId', operator: '==', value: currentUser.uid }]
    const unsubs = []
    try {
      unsubs.push(subWardrobe(userFilter))
      unsubs.push(subDeals(userFilter))
      unsubs.push(subReminders(userFilter))
      unsubs.push(subWallets(userFilter))
      unsubs.push(subTransactions(userFilter))
    } catch {}
    return () => unsubs.forEach((u) => { try { u?.() } catch {} })
  }, [currentUser])

  useEffect(() => {
    const cats = new Set(wardrobeItems.map((i) => i.category))
    const brands = wardrobeItems.map((i) => i.brand).filter(Boolean)
    const brandCount = {}
    brands.forEach((b) => { brandCount[b] = (brandCount[b] || 0) + 1 })
    const topBrand = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0]
    setStats({
      totalItems: wardrobeItems.length,
      categories: cats.size,
      deals: deals.length,
      favBrand: topBrand ? topBrand[0] : '-',
    })
  }, [wardrobeItems, deals])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return t('dashboard.greeting.morning')
    if (h < 18) return t('dashboard.greeting.afternoon')
    return t('dashboard.greeting.evening')
  }

  const upcomingReminders = reminders
    .filter((r) => !r.completed)
    .sort((a, b) => {
      const dateA = a.dueDate?.seconds || 0
      const dateB = b.dueDate?.seconds || 0
      return dateA - dateB
    })
    .slice(0, 5)

  const topDeals = deals.slice(0, 3)

  const handleToggleReminder = async (reminder) => {
    await updateReminder(reminder.id, { completed: !reminder.completed })
  }

  const locale = language === 'en' ? 'en-US' : 'tr-TR'

  const formatDate = (date) => {
    if (!date) return ''
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date)
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  }

  const totalBalance = (wallets || []).reduce((sum, w) => sum + (w.balance || 0), 0)

  const now = new Date()
  const thisMonthSpending = (transactions || [])
    .filter((tx) => {
      if (!tx.createdAt?.seconds) return false
      const d = new Date(tx.createdAt.seconds * 1000)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && (tx.type === 'purchase' || tx.type === 'withdrawal')
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0)

  const handleEnableNotif = async () => {
    try {
      if ('Notification' in window) {
        const result = await Notification.requestPermission()
        setNotifPermission(result)
      }
    } catch {}
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-in">
        <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">
          {greeting()}, {currentUser?.displayName || t('navbar.user')}!
        </h1>
        <p className="text-gray-500 dark:text-swype-silver mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Notification permission banner */}
      {notifPermission === 'default' && (
        <div className="mb-6 p-4 bg-swype-sage/10 dark:bg-swype-sage/5 border border-swype-sage/20 rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-swype-sage" />
            <span className="text-sm text-swype-dark dark:text-swype-cream">{t('dashboard.enableNotifications')}</span>
          </div>
          <Button variant="accent" size="sm" onClick={handleEnableNotif}>{t('dashboard.enable')}</Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {quickStats.map((s) => (
          <Card key={s.key} className="p-5 animate-in">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-deep-navy dark:text-swype-cream">
                  {typeof stats[s.key] === 'number' ? stats[s.key] : stats[s.key]}
                </p>
                <p className="text-xs text-gray-500 dark:text-swype-silver">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Wallet + Spending Summary */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6 stagger">
        <Link to="/wallet" className="animate-in">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-swype-gold rounded-xl flex items-center justify-center">
                <LordIcon
                  src={LORDICON.WALLET}
                  trigger="hover"
                  size={24}
                  colors="primary:#ffffff,secondary:#ffffff"
                  fallback={<Wallet size={20} className="text-white" />}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-swype-silver">{t('dashboard.totalBalance')}</p>
                <p className="text-xl font-bold text-swype-dark dark:text-swype-cream">
                  {totalBalance.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
                </p>
              </div>
            </div>
            <p className="text-[10px] text-swype-silver mt-2">{t('dashboard.walletCount', { count: (wallets || []).length })}</p>
          </Card>
        </Link>
        <Link to="/reports" className="animate-in">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-swype-terra rounded-xl flex items-center justify-center">
                <ArrowDownRight size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-swype-silver">{t('dashboard.monthlySpending')}</p>
                <p className="text-xl font-bold text-danger">
                  {thisMonthSpending.toLocaleString(locale, { minimumFractionDigits: 2 })} TL
                </p>
              </div>
            </div>
            <p className="text-[10px] text-swype-silver mt-2">{now.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 stagger">
        {/* Quick actions */}
        <Card className="p-6 lg:col-span-1 animate-in">
          <h2 className="font-bold text-deep-navy dark:text-swype-cream mb-4">{t('dashboard.quickAccess')}</h2>
          <div className="space-y-3">
            <Link to="/wardrobe">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Plus size={16} /> {t('dashboard.addClothes')}
                </span>
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/deals">
              <Button variant="outline" className="w-full justify-between mt-3">
                <span className="flex items-center gap-2">
                  <Tag size={16} /> {t('dashboard.viewDeals')}
                </span>
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="w-full justify-between mt-3">
                <span className="flex items-center gap-2">
                  <ShoppingCart size={16} /> {t('dashboard.myCart')}
                </span>
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/reminders">
              <Button variant="outline" className="w-full justify-between mt-3">
                <span className="flex items-center gap-2">
                  <Bell size={16} /> {t('dashboard.reminders')}
                </span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Tracked deals */}
        <Card className="p-6 lg:col-span-2 animate-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-deep-navy dark:text-swype-cream">{t('dashboard.trackedDeals')}</h2>
            <Link to="/deals" className="text-sm text-swype-terra font-medium hover:underline">
              {t('dashboard.all')}
            </Link>
          </div>
          {topDeals.length === 0 ? (
            <div className="text-center py-6">
              <Tag size={32} className="mx-auto text-gray-300 dark:text-swype-silver/30 mb-2" />
              <p className="text-xs text-gray-500 dark:text-swype-silver">
                {t('dashboard.noDeals')}{' '}
                <Link to="/deals" className="text-swype-terra hover:underline">{t('dashboard.searchProduct')}</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topDeals.map((d) => {
                const discount = d.originalPrice > 0
                  ? Math.round(((d.originalPrice - d.dealPrice) / d.originalPrice) * 100)
                  : 0
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 bg-soft-gray dark:bg-swype-mid/30 rounded-xl hover:bg-gray-100 dark:hover:bg-swype-mid/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-swype-terra/10 rounded-lg flex items-center justify-center overflow-hidden">
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt={d.productName} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={18} className="text-swype-terra" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-deep-navy dark:text-swype-cream text-sm truncate max-w-[200px]">{d.productName}</p>
                        <p className="text-xs text-gray-500 dark:text-swype-silver">{d.brand}{d.store ? ` · ${d.store}` : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {d.dealPrice > 0 && <p className="font-bold text-success text-sm">{d.dealPrice.toLocaleString(locale)} TL</p>}
                      {discount > 0 && <p className="text-xs text-swype-terra font-medium">{t('dashboard.discount', { percent: discount })}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming reminders */}
      <Card className="p-6 mt-6 animate-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-deep-navy dark:text-swype-cream flex items-center gap-2">
            <Bell size={18} className="text-swype-sage" />
            {t('dashboard.upcomingReminders')}
          </h2>
          <Link to="/reminders" className="text-sm text-swype-sage font-medium hover:underline">
            {t('dashboard.all')}
          </Link>
        </div>
        {upcomingReminders.length === 0 ? (
          <div className="text-center py-6">
            <Clock size={32} className="mx-auto text-gray-300 dark:text-swype-silver/30 mb-2" />
            <p className="text-xs text-gray-500 dark:text-swype-silver">
              {t('dashboard.noReminders')}{' '}
              <Link to="/reminders" className="text-swype-sage hover:underline">{t('dashboard.addReminder')}</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map((r) => {
              const isOverdue = r.dueDate && new Date(r.dueDate.seconds ? r.dueDate.seconds * 1000 : r.dueDate) < new Date()
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 bg-soft-gray dark:bg-swype-mid/30 rounded-xl hover:bg-gray-100 dark:hover:bg-swype-mid/50 transition-colors"
                >
                  <button
                    onClick={() => handleToggleReminder(r)}
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-swype-silver/50 hover:border-success flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {r.completed && <Check size={12} className="text-success" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-deep-navy dark:text-swype-cream text-sm truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 dark:text-swype-silver">
                      {r.dueDate ? formatDate(r.dueDate) : t('dashboard.noDate')}
                      {r.time && ` · ${r.time}`}
                      {isOverdue && <span className="text-danger ml-2 font-medium">{t('dashboard.overdue')}</span>}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recent wardrobe */}
      {wardrobeItems.length > 0 && (
        <Card className="p-6 mt-6 animate-in" style={{ animationDelay: '360ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-deep-navy dark:text-swype-cream">{t('dashboard.recentClothes')}</h2>
            <Link to="/wardrobe" className="text-sm text-swype-sage font-medium hover:underline">
              {t('dashboard.all')}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wardrobeItems.slice(0, 6).map((item) => (
              <div key={item.id} className="bg-soft-gray dark:bg-swype-mid/30 rounded-xl p-3 text-center">
                <div className="w-full aspect-square bg-gray-200 dark:bg-swype-mid/50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shirt size={24} className="text-gray-400 dark:text-swype-silver/50" />
                  )}
                </div>
                <p className="text-xs font-medium text-deep-navy dark:text-swype-cream truncate">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-swype-silver">{tCategory(item.category)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
