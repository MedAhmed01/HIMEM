'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SponsorCarousel } from './SponsorCarousel'
import { Menu, X, User, LogIn, ChevronDown, Building2, UserCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageToggle } from '@/components/LanguageToggle'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInscriptionOpen, setIsInscriptionOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { t, language } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header className={`sticky top-0 z-50 bg-[#139a9d] border-b border-[#0f7a7d] shadow-sm transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto">
        <div className="grid grid-cols-3 items-center h-14 sm:h-16 md:h-18">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 justify-self-start">
            <img 
              src="/Logo.png" 
              alt="OMIGEC Logo" 
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain"
            />
          </Link>
          
          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center justify-center gap-0.5">
            <Link href="/" className="px-3 py-1.5 rounded-full text-sm text-white font-medium hover:bg-white/10 transition-all duration-200">
              {t.nav.home}
            </Link>
            <Link href="/services" className="px-3 py-1.5 rounded-full text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all duration-200">
              {t.nav.services}
            </Link>
            <Link href="/emplois" className="px-3 py-1.5 rounded-full text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all duration-200">
              {t.nav.jobs}
            </Link>
            <Link href="/recherche" className="px-3 py-1.5 rounded-full text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all duration-200">
              {t.common.search}
            </Link>
            <Link href="/contact" className="px-3 py-1.5 rounded-full text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all duration-200">
              {t.nav.contact}
            </Link>
          </nav>

          {/* Desktop Auth Buttons - Right */}
          <div className="hidden md:flex items-center gap-2 justify-self-end">
            <LanguageToggle />
            <Link href="/connexion">
              <Button variant="ghost" className="h-9 px-4 rounded-full text-sm text-white hover:bg-white/10 font-medium">
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                {t.nav.login}
              </Button>
            </Link>
            
            {/* Dropdown Inscription */}
            <div className="relative inscription-dropdown">
              <Button 
                onClick={() => setIsInscriptionOpen(!isInscriptionOpen)}
                className="h-9 px-4 rounded-full text-sm bg-white text-[#139a9d] hover:bg-white/90 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                {t.nav.register}
                <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              
              {isInscriptionOpen && (
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50`}>
                  <Link 
                    href="/inscription"
                    onClick={() => setIsInscriptionOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#139a9d]/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#139a9d]/20 flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-[#139a9d]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{language === 'ar' ? 'مهندس' : 'Ingénieur'}</p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'تسجيل فردي' : 'Inscription individuelle'}</p>
                    </div>
                  </Link>
                  <Link 
                    href="/inscription-entreprise"
                    onClick={() => setIsInscriptionOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{language === 'ar' ? 'شركة' : 'Entreprise'}</p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'حساب مهني' : 'Compte professionnel'}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors justify-self-end col-start-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-0.5">
              <Link 
                href="/" 
                className="px-3 py-2.5 rounded-lg text-sm text-white font-medium hover:bg-white/10 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link 
                href="/services" 
                className="px-3 py-2.5 rounded-lg text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.services}
              </Link>
              <Link 
                href="/emplois" 
                className="px-3 py-2.5 rounded-lg text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.jobs}
              </Link>
              <Link 
                href="/recherche" 
                className="px-3 py-2.5 rounded-lg text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.common.search}
              </Link>
              <Link 
                href="/contact" 
                className="px-3 py-2.5 rounded-lg text-sm text-white/90 font-medium hover:bg-white/10 hover:text-white transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.contact}
              </Link>
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/10">
                <div className="px-3 mb-2">
                  <LanguageToggle />
                </div>
                <Link href="/connexion" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full h-10 rounded-lg text-sm text-white hover:bg-white/10 font-medium">
                    <LogIn className="w-4 h-4 mr-2" />
                    {t.nav.login}
                  </Button>
                </Link>
                
                {/* Inscription Options */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/70 px-3">{t.nav.register}</p>
                  <Link href="/inscription" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-10 rounded-lg text-sm font-medium justify-start bg-white text-[#139a9d] border-white hover:bg-white/90">
                      <UserCircle className="w-4 h-4 mr-2" />
                      <span>{language === 'ar' ? 'مهندس' : 'Ingénieur'}</span>
                    </Button>
                  </Link>
                  <Link href="/inscription-entreprise" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-10 rounded-lg text-sm font-medium justify-start bg-white text-[#139a9d] border-white hover:bg-white/90">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span>{language === 'ar' ? 'شركة' : 'Entreprise'}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Sponsor Carousel */}
      <SponsorCarousel />
    </header>
  )
}
