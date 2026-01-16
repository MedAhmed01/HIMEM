'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language, TranslationKeys } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Force French only - Arabic disabled for now
  const [language] = useState<Language>('fr')

  useEffect(() => {
    // Force French and LTR direction
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'fr'
    localStorage.setItem('language', 'fr')
  }, [])

  // Disabled - always use French
  const setLanguage = () => {
    // Do nothing - French only
  }

  const toggleLanguage = () => {
    // Do nothing - French only
  }

  const value = {
    language,
    setLanguage,
    t: translations.fr,
    toggleLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
