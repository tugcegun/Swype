import { Link } from 'react-router-dom'
import { LogOut, User, Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from '../../contexts/LanguageContext'
import { useState } from 'react'
import Logo from '../ui/Logo'
import LordIcon from '../ui/LordIcon'
import { LORDICON } from '../../constants/icons'

export default function Navbar({ onToggleSidebar }) {
  const { currentUser, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <nav className="bg-swype-cream/80 dark:bg-swype-dark/80 backdrop-blur-md border-b border-swype-silver/20 dark:border-swype-mid/40 px-4 py-3 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-swype-silver/20 dark:hover:bg-swype-mid/30 rounded-lg cursor-pointer"
        >
          <Menu size={20} className="text-swype-dark dark:text-swype-cream" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-1 lg:hidden">
          <Logo size={46} />
          <span className="text-lg font-semibold text-swype-dark dark:text-swype-cream tracking-tight">swype</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 hover:bg-swype-silver/20 dark:hover:bg-swype-mid/30 rounded-sm transition-colors cursor-pointer"
        >
          {dark ? <Sun size={16} className="text-swype-cream" /> : <Moon size={16} className="text-swype-dark" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-swype-silver/20 dark:hover:bg-swype-mid/30 rounded-sm transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 bg-swype-cream dark:bg-swype-mid rounded-full flex items-center justify-center border border-swype-silver/30 dark:border-swype-silver/20">
              <LordIcon
                src={LORDICON.ACCOUNT}
                trigger="hover"
                size={20}
                colors="primary:#2d2d2d,secondary:#2d2d2d"
                fallback={<User size={14} className="text-swype-dark dark:text-swype-cream" />}
              />
            </div>
            <span className="text-xs font-medium text-swype-dark dark:text-swype-cream hidden sm:block">
              {currentUser?.displayName || t('navbar.user')}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-swype-mid rounded-sm shadow-lg border border-swype-silver/20 dark:border-swype-dark/40 py-1">
              <Link
                to="/settings"
                className="flex items-center gap-2 px-3 py-2 text-xs text-swype-dark dark:text-swype-cream hover:bg-swype-cream dark:hover:bg-swype-dark/30"
                onClick={() => setShowMenu(false)}
              >
                <User size={14} />
                {t('navbar.profileSettings')}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-swype-cream dark:hover:bg-swype-dark/30 cursor-pointer"
              >
                <LogOut size={14} />
                {t('navbar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
