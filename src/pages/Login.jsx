import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from '../contexts/LanguageContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { LogIn, Sun, Moon } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(t('login.error'))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-swype-cream dark:bg-swype-dark px-4 transition-colors relative">
      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2 hover:bg-swype-silver/20 dark:hover:bg-swype-mid/30 rounded-sm transition-colors cursor-pointer"
      >
        {dark ? <Sun size={16} className="text-swype-cream" /> : <Moon size={16} className="text-swype-dark" />}
      </button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Logo size={56} className="text-swype-dark" />
            <span className="text-xl font-semibold text-swype-dark dark:text-swype-cream tracking-tight -ml-2">swype</span>
          </Link>
          <h1 className="text-lg font-bold text-swype-dark dark:text-swype-cream">{t('login.welcome')}</h1>
          <p className="text-xs text-swype-silver mt-1">{t('login.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-swype-mid/50 rounded-sm shadow-sm border border-swype-silver/30 dark:border-swype-mid p-6">
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-900/20 text-danger text-xs rounded-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
            />
            <Input
              label={t('login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              <LogIn size={14} className="mr-1.5" />
              {loading ? t('login.loading') : t('login.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-swype-silver mt-5">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-swype-dark dark:text-swype-cream font-semibold hover:underline">
            {t('login.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
