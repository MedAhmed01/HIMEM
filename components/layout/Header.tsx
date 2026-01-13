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
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16 md:h-20">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-3 justify-self-start">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg md:text-xl">O</span>
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">OMIGEC</span>
          </Link>
          
          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center justify-center gap-1">
            <Link href="/" className="px-4 py-2 rounded-full text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Accueil
            </Link>
            <Link href="/services" className="px-4 py-2 rounded-full text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Services
            </Link>
            <Link href="/emplois" className="px-4 py-2 rounded-full text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Emplois
            </Link>
            <Link href="/recherche" className="px-4 py-2 rounded-full text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Rechercher
            </Link>
            <Link href="/contact" className="px-4 py-2 rounded-full text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons - Right */}
          <div className="hidden md:flex items-center gap-3 justify-self-end">
            <Link href="/connexion">
              <Button variant="ghost" className="h-10 px-5 rounded-full text-gray-700 hover:bg-gray-100 font-medium">
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </Button>
            </Link>
            <Link href="/inscription">
              <Button className="h-10 px-5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">
                <User className="w-4 h-4 mr-2" />
                Inscription
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors justify-self-end col-start-3"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              <Link 
                href="/" 
                className="px-4 py-3 rounded-xl text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                href="/services" 
                className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/emplois" 
                className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Emplois
              </Link>
              <Link 
                href="/recherche" 
                className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Rechercher
              </Link>
              <Link 
                href="/contact" 
                className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link href="/connexion" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full h-12 rounded-full text-gray-700 hover:bg-gray-100 font-medium">
                    <LogIn className="w-4 h-4 mr-2" />
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md">
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
