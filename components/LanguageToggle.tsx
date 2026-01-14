'use client'

import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  // Hide for now - return null to not render
  return null

  /* Uncomment when ready to enable Arabic
  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="rounded-xl border-2 gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === 'fr' ? 'العربية' : 'Français'}
    </Button>
  )
  */
}
