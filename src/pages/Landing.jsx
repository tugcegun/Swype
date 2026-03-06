import { Link } from 'react-router-dom'
import { ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from '../contexts/LanguageContext'
import Logo from '../components/ui/Logo'

const brands = [
  { text: 'ZARA', x: 8, y: 15 },
  { text: 'H&M', x: 62, y: 28 },
  { text: 'NIKE', x: 18, y: 42 },
  { text: 'MANGO', x: 55, y: 55 },
  { text: 'PUMA', x: 5, y: 68 },
  { text: 'ADIDAS', x: 48, y: 78 },
  { text: 'COS', x: 25, y: 90 },
  { text: 'UNIQLO', x: 60, y: 10 },
  { text: "LEVI'S", x: 38, y: 35 },
  { text: 'MASSIMO', x: 10, y: 105 },
  { text: 'PULL&BEAR', x: 45, y: 98 },
  { text: 'BERSHKA', x: 70, y: 48 },
  { text: 'STRADIVARIUS', x: 15, y: 55 },
  { text: 'GUCCI', x: 72, y: 68 },
  { text: 'BALENCIAGA', x: 30, y: 18 },
]

function BrandScene() {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full">
      {brands.map((b, i) => (
        <text
          key={b.text}
          x={b.x}
          y={b.y}
          fill={i % 2 === 0 ? 'currentColor' : '#31304D'}
          opacity={0.06 + (i % 3) * 0.02}
          fontSize={10 + (i % 4) * 2}
          fontFamily="'Chillax', monospace"
          fontWeight="700"
          letterSpacing="2"
        >
          {b.text}
        </text>
      ))}
    </svg>
  )
}

export default function Landing() {
  const { dark, toggle } = useTheme()
  const { t } = useTranslation()

  const features = [
    { title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
  ]

  return (
    <div className="min-h-screen bg-swype-cream dark:bg-swype-dark transition-colors">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-4 sticky top-0 z-50 bg-swype-cream/80 dark:bg-swype-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Logo size={64} className="text-swype-dark" />
          <span className="text-2xl font-semibold text-swype-dark dark:text-swype-cream tracking-tight -ml-2">swype</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 hover:bg-swype-silver/20 dark:hover:bg-swype-mid/30 rounded-sm transition-colors cursor-pointer"
          >
            {dark ? <Sun size={16} className="text-swype-cream" /> : <Moon size={16} className="text-swype-dark" />}
          </button>
          <Link
            to="/login"
            className="px-3 py-1.5 text-xs font-medium text-swype-mid dark:text-swype-silver hover:text-swype-dark dark:hover:text-swype-cream transition-colors"
          >
            {t('landing.login')}
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 text-xs font-medium bg-swype-dark dark:bg-swype-cream text-swype-cream dark:text-swype-dark rounded-lg hover:bg-swype-mid dark:hover:bg-swype-silver transition-colors"
          >
            {t('landing.start')}
          </Link>
        </div>
      </nav>

      {/* Hero - Split layout */}
      <section className="px-6 md:px-16 min-h-[85vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Brand names */}
          <div className="hidden lg:block h-[500px] relative">
            <BrandScene />
          </div>

          {/* Right - Content */}
          <div className="lg:text-right">
            <p className="text-xs font-medium text-swype-silver tracking-widest uppercase mb-3">
              {t('landing.wardrobeManager')}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-swype-dark dark:text-swype-cream leading-[1.15] tracking-tight">
              {t('landing.heroTitle1')}
              <br />
              {t('landing.heroTitle2')}
              <br />
              <span className="text-swype-mid dark:text-swype-silver">{t('landing.heroTitle3')}</span>
            </h1>
            <p className="text-sm text-swype-silver mt-5 max-w-sm lg:ml-auto leading-relaxed">
              {t('landing.heroDesc')}
            </p>
            <div className="flex gap-3 mt-6 lg:justify-end">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs bg-swype-dark dark:bg-swype-cream text-swype-cream dark:text-swype-dark rounded-xl font-medium hover:bg-swype-mid dark:hover:bg-swype-silver transition-all duration-200"
              >
                {t('landing.freeStart')}
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-5 py-2.5 text-xs border border-swype-silver/40 dark:border-swype-mid text-swype-mid dark:text-swype-silver rounded-xl font-medium hover:border-swype-mid dark:hover:border-swype-silver transition-all duration-200"
              >
                {t('landing.loginAction')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Minimal */}
      <section className="px-6 md:px-16 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/50 dark:bg-swype-mid/20 border border-swype-silver/20 dark:border-swype-mid/40 hover:bg-white dark:hover:bg-swype-mid/30 hover:border-swype-silver/40 transition-all duration-300"
              >
                <span className="text-[10px] font-semibold text-swype-silver tracking-widest">
                  0{i + 1}
                </span>
                <h3 className="text-sm font-semibold text-swype-dark dark:text-swype-cream mt-2">{f.title}</h3>
                <p className="text-xs text-swype-silver mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-5 border-t border-swype-silver/20 dark:border-swype-mid/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-[10px] text-swype-silver">&copy; 2026 swype</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-swype-dark rounded-full" />
            <div className="w-1.5 h-1.5 bg-swype-mid rounded-full" />
            <div className="w-1.5 h-1.5 bg-swype-silver rounded-full" />
            <div className="w-1.5 h-1.5 bg-swype-cream border border-swype-silver/30 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  )
}
