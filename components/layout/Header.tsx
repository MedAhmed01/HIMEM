'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SponsorCarousel } from './SponsorCarousel'
import { Menu, X, User, LogIn } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

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
    <header className={`sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto">
        <div className="grid grid-cols-3 items-center h-14 sm:h-16 md:h-18">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 justify-self-start">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-base sm:text-lg md:text-xl">O</span>
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">OMIGEC</span>
          </Link>
          
          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center justify-center gap-0.5">
            <Link href="/" className="px-3 py-1.5 rounded-full text-sm text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Accueil
            </Link>
            <Link href="/services" className="px-3 py-1.5 rounded-full text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Services
            </Link>
            <Link href="/emplois" className="px-3 py-1.5 rounded-full text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Emplois
            </Link>
            <Link href="/recherche" className="px-3 py-1.5 rounded-full text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Rechercher
            </Link>
            <Link href="/contact" className="px-3 py-1.5 rounded-full text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons - Right */}
          <div className="hidden md:flex items-center gap-2 justify-self-end">
            <Link href="/connexion">
              <Button variant="ghost" className="h-9 px-4 rounded-full text-sm text-gray-700 hover:bg-gray-100 font-medium">
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Connexion
              </Button>
            </Link>
            <Link href="/inscription">
              <Button className="h-9 px-4 rounded-full text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">
                <User className="w-3.5 h-3.5 mr-1.5" />
                Inscription
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors justify-self-end col-start-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-0.5">
              <Link 
                href="/" 
                className="px-3 py-2.5 rounded-lg text-sm text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                href="/services" 
                className="px-3 py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/emplois" 
                className="px-3 py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Emplois
              </Link>
              <Link 
                href="/recherche" 
                className="px-3 py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Rechercher
              </Link>
              <Link 
                href="/contact" 
                className="px-3 py-2.5 rounded-lg text-sm text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link href="/connexion" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full h-10 rounded-lg text-sm text-gray-700 hover:bg-gray-100 font-medium">
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-10 rounded-lg text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md">
                    <User className="w-4 h-4 mr-2" />
                    Inscription
                  </Button>
                </Link>
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
