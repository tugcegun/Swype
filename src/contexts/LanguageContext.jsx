import { createContext, useContext, useState, useCallback } from 'react'
import { tr, en } from '../i18n'

const translations = { tr, en }

const LanguageContext = createContext()

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useTranslation() {
  const { language } = useContext(LanguageContext)
  const t = useCallback((key, params) => {
    let text = translations[language]?.[key] || translations.tr[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v)
      })
    }
    return text
  }, [language])
  return { t, language }
}

// Map Firestore category values to translation keys
const categoryKeyMap = {
  'Tumu': 'category.all',
  'Ust Giyim': 'category.tops',
  'Alt Giyim': 'category.bottoms',
  'Dis Giyim': 'category.outerwear',
  'Ayakkabi': 'category.shoes',
  'Aksesuar': 'category.accessories',
  'Diger': 'category.other',
}

// Map Firestore season values to translation keys
const seasonKeyMap = {
  'Ilkbahar': 'season.spring',
  'Yaz': 'season.summer',
  'Sonbahar': 'season.autumn',
  'Kis': 'season.winter',
  'Tum Mevsimler': 'season.all',
}

export function useCategoryTranslation() {
  const { t } = useTranslation()
  const tCategory = useCallback((firestoreValue) => {
    const key = categoryKeyMap[firestoreValue]
    return key ? t(key) : firestoreValue
  }, [t])
  return tCategory
}

export function useSeasonTranslation() {
  const { t } = useTranslation()
  const tSeason = useCallback((firestoreValue) => {
    const key = seasonKeyMap[firestoreValue]
    return key ? t(key) : firestoreValue
  }, [t])
  return tSeason
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('swype-lang') || 'tr'
  })

  const handleSetLanguage = useCallback((lang) => {
    setLanguage(lang)
    localStorage.setItem('swype-lang', lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    handleSetLanguage(language === 'tr' ? 'en' : 'tr')
  }, [language, handleSetLanguage])

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
