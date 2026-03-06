import { useState, useEffect } from 'react'
import { Save, Bell, User, Shield, BellRing, BellOff, Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation, useLanguage } from '../contexts/LanguageContext'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useNotifications } from '../hooks/useNotifications'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LordIcon from '../components/ui/LordIcon'
import { LORDICON } from '../constants/icons'

export default function Settings() {
  const { currentUser } = useAuth()
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  const { permission, supported, requestPermission } = useNotifications()
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [notifications, setNotifications] = useState({
    deals: true,
    priceDrops: true,
    weeklyDigest: false,
    newArrivals: true,
    pushEnabled: false,
  })

  useEffect(() => {
    if (!currentUser) return
    const loadSettings = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists() && userDoc.data().notifications) {
        setNotifications((prev) => ({ ...prev, ...userDoc.data().notifications }))
      }
    }
    loadSettings()
  }, [currentUser])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await updateProfile(currentUser, { displayName })
      await updateDoc(doc(db, 'users', currentUser.uid), { displayName })
      setMessage(t('settings.profileSuccess'))
    } catch (err) {
      setMessage(t('settings.profileError'))
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const toggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { notifications: updated })
    } catch {}
  }

  const handleEnablePush = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js')
        } catch {}
      }
      const updated = { ...notifications, pushEnabled: true }
      setNotifications(updated)
      await updateDoc(doc(db, 'users', currentUser.uid), { notifications: updated })
      setMessage(t('settings.notifEnabled'))
      setTimeout(() => setMessage(''), 3000)
    } else if (result === 'denied') {
      setMessage(t('settings.notifDenied'))
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const isSuccess = message && (message.includes(t('settings.profileSuccess').slice(0, 6)) || message.includes(t('settings.notifEnabled').slice(0, 6)))

  const notifItems = [
    { key: 'deals', label: t('settings.notifDeals'), desc: t('settings.notifDealsDesc') },
    { key: 'priceDrops', label: t('settings.notifPriceDrops'), desc: t('settings.notifPriceDropsDesc') },
    { key: 'weeklyDigest', label: t('settings.notifWeekly'), desc: t('settings.notifWeeklyDesc') },
    { key: 'newArrivals', label: t('settings.notifNewArrivals'), desc: t('settings.notifNewArrivalsDesc') },
  ]

  return (
    <div className="max-w-2xl stagger">
      <div className="mb-8 animate-in">
        <h1 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-swype-cream">{t('settings.title')}</h1>
        <p className="text-gray-500 dark:text-swype-silver mt-1">{t('settings.subtitle')}</p>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-xl text-sm border ${
          isSuccess ? 'bg-green-50 dark:bg-green-900/20 text-success border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-danger border-red-100 dark:border-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Language */}
      <Card className="p-6 mb-6 animate-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-swype-sage rounded-xl flex items-center justify-center">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-deep-navy dark:text-swype-cream">{t('settings.language')}</h2>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('settings.languageDesc')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('tr')}
            className={`flex-1 py-2.5 rounded-sm text-sm font-medium transition-colors cursor-pointer ${
              language === 'tr'
                ? 'bg-swype-sage text-white'
                : 'bg-soft-gray dark:bg-swype-dark/30 text-gray-600 dark:text-swype-silver hover:bg-gray-100 dark:hover:bg-swype-dark/50 border border-swype-silver/30 dark:border-swype-mid'
            }`}
          >
            Türkçe
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-2.5 rounded-sm text-sm font-medium transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-swype-sage text-white'
                : 'bg-soft-gray dark:bg-swype-dark/30 text-gray-600 dark:text-swype-silver hover:bg-gray-100 dark:hover:bg-swype-dark/50 border border-swype-silver/30 dark:border-swype-mid'
            }`}
          >
            English
          </button>
        </div>
      </Card>

      {/* Profile */}
      <Card className="p-6 mb-6 animate-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-ocean-blue rounded-xl flex items-center justify-center">
            <LordIcon
              src={LORDICON.ACCOUNT}
              trigger="hover"
              size={24}
              colors="primary:#ffffff,secondary:#ffffff"
              fallback={<User size={20} className="text-white" />}
            />
          </div>
          <div>
            <h2 className="font-bold text-deep-navy dark:text-swype-cream">{t('settings.profileInfo')}</h2>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('settings.profileDesc')}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label={t('settings.name')}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label={t('settings.email')}
            type="email"
            value={currentUser?.email || ''}
            disabled
            className="bg-gray-50 dark:bg-swype-mid/30 cursor-not-allowed"
          />
          <Button type="submit" disabled={saving}>
            <Save size={16} className="mr-2" />
            {saving ? t('settings.saving') : t('settings.save')}
          </Button>
        </form>
      </Card>

      {/* Push Notifications */}
      {supported && (
        <Card className="p-6 mb-6 animate-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-swype-sage rounded-xl flex items-center justify-center">
              <BellRing size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-deep-navy dark:text-swype-cream">{t('settings.browserNotifications')}</h2>
              <p className="text-xs text-gray-500 dark:text-swype-silver">{t('settings.browserNotifDesc')}</p>
            </div>
          </div>

          <div className="p-4 bg-soft-gray dark:bg-swype-dark/30 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {permission === 'granted' ? (
                  <BellRing size={16} className="text-success" />
                ) : (
                  <BellOff size={16} className="text-gray-400" />
                )}
                <span className="text-sm font-medium text-swype-dark dark:text-swype-cream">
                  {permission === 'granted' ? t('settings.notifActive') : permission === 'denied' ? t('settings.notifBlocked') : t('settings.notifOff')}
                </span>
              </div>
              {permission !== 'granted' && permission !== 'denied' && (
                <Button variant="accent" size="sm" onClick={handleEnablePush}>
                  {t('settings.enable')}
                </Button>
              )}
            </div>
          </div>

          {permission === 'denied' && (
            <p className="text-xs text-gray-500 dark:text-swype-silver">
              {t('settings.notifBrowserDesc')}
            </p>
          )}
        </Card>
      )}

      {/* Notification Preferences */}
      <Card className="p-6 mb-6 animate-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-swype-terra rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-deep-navy dark:text-swype-cream">{t('settings.notifPreferences')}</h2>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('settings.notifPreferencesDesc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {notifItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-soft-gray dark:bg-swype-mid/30 rounded-xl">
              <div>
                <p className="font-medium text-deep-navy dark:text-swype-cream text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-swype-silver">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(item.key)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative cursor-pointer ${
                  notifications[item.key] ? 'bg-swype-sage' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                    notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Account info */}
      <Card className="p-6 animate-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-deep-navy dark:text-swype-cream">{t('settings.account')}</h2>
            <p className="text-xs text-gray-500 dark:text-swype-silver">{t('settings.accountInfo')}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-2">
            <span className="text-gray-500 dark:text-swype-silver">{t('settings.accountType')}</span>
            <span className="font-medium text-deep-navy dark:text-swype-cream">{t('settings.free')}</span>
          </div>
          <div className="flex justify-between p-2">
            <span className="text-gray-500 dark:text-swype-silver">{t('settings.memberId')}</span>
            <span className="font-mono text-xs text-gray-400 dark:text-swype-silver/70">{currentUser?.uid?.slice(0, 12)}...</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
