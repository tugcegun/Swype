import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Shirt, Tag, Bell, Settings, X, Wallet, ShoppingCart, BarChart3 } from 'lucide-react'
import { useTranslation } from '../../contexts/LanguageContext'
import Logo from '../ui/Logo'
import LordIcon from '../ui/LordIcon'
import { LORDICON } from '../../constants/icons'

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), lordicon: LORDICON.DASHBOARD },
    { to: '/wardrobe', icon: Shirt, label: t('nav.wardrobe'), lordicon: LORDICON.WARDROBE },
    { to: '/deals', icon: Tag, label: t('nav.deals'), lordicon: LORDICON.DEALS },
    { to: '/wallet', icon: Wallet, label: t('nav.wallet'), lordicon: LORDICON.WALLET },
    { to: '/cart', icon: ShoppingCart, label: t('nav.cart'), lordicon: LORDICON.CART },
    { to: '/reminders', icon: Bell, label: t('nav.reminders'), lordicon: LORDICON.BELL },
    { to: '/reports', icon: BarChart3, label: t('nav.reports'), lordicon: LORDICON.REPORTS },
    { to: '/settings', icon: Settings, label: t('nav.settings'), lordicon: LORDICON.SETTINGS },
  ]

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-swype-dark text-swype-cream z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 lg:hidden">
          <span className="text-sm font-medium">{t('nav.menu')}</span>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="hidden lg:block p-5 pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Logo size={64} />
            <span className="text-sm font-medium tracking-tight text-swype-silver -ml-4">swype</span>
          </div>
        </div>

        <nav className="px-3 mt-4 lg:mt-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-sm mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-swype-mid text-swype-cream'
                    : 'text-swype-silver hover:bg-white/5 hover:text-swype-cream'
                }`
              }
            >
              {item.lordicon ? (
                <LordIcon
                  src={item.lordicon}
                  trigger="hover"
                  size={18}
                  colors="primary:#c4b5a0,secondary:#c4b5a0"
                  fallback={<item.icon size={18} />}
                />
              ) : (
                <item.icon size={18} />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
