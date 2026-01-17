'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Users, Briefcase, UserCheck, LayoutDashboard, Home, LogOut, Sparkles, Image, Newspaper, Building2, Menu, X, CreditCard, Mail } from 'lucide-react'

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard, color: 'from-[#139a9d] to-[#0f7a7d]' },
  { name: 'Vérifications', href: '/admin/verifications', icon: FileText, color: 'from-[#139a9d]/80 to-[#0f7a7d]/80' },
  { name: 'Parrains', href: '/admin/parrains', icon: UserCheck, color: 'from-[#139a9d] to-[#0f7a7d]' },
  { name: 'Ingénieurs', href: '/admin/ingenieurs', icon: Users, color: 'from-[#139a9d]/80 to-[#0f7a7d]/80' },
  { name: 'Entreprises', href: '/admin/entreprises', icon: Building2, color: 'from-[#139a9d] to-[#0f7a7d]' },
  { name: 'Abonnements', href: '/admin/abonnements', icon: CreditCard, color: 'from-amber-500 to-amber-600' },
  { name: 'Messages', href: '/admin/messages', icon: Mail, color: 'from-green-500 to-green-600' },
  { name: 'Articles', href: '/admin/articles', icon: Newspaper, color: 'from-[#139a9d]/80 to-[#0f7a7d]/80' },
  { name: 'Sponsors', href: '/admin/sponsors', icon: Image, color: 'from-[#139a9d] to-[#0f7a7d]' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/connexion')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-[#139a9d] border-b border-[#0f7a7d] shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/admin" className="flex items-center gap-2 sm:gap-2.5 group">
                <img 
                  src="/Logo.png" 
                  alt="OMIGEC Logo" 
                  className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain"
                />
              </Link>
              <span className="hidden sm:flex px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-medium items-center gap-1 sm:gap-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Admin
              </span>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Home Link */}
            <Link href="/" className="hidden lg:flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors group">
              <Home className="w-4 h-4" />
              <span>Retour au site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="absolute top-[160px] sm:top-[192px] md:top-[224px] left-0 right-0 bg-white border-b border-gray-200 shadow-xl max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-192px)] md:max-h-[calc(100vh-224px)] overflow-y-auto">
            <div className="p-3 sm:p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#139a9d]/10 transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm text-gray-700 group-hover:text-[#139a9d] transition-colors">{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Home className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-sm text-gray-600">Retour au site</span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="font-medium text-sm text-red-600">Déconnexion</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}

      <div className="container mx-auto py-4 sm:py-6 md:py-8">
        <div className="flex gap-4 lg:gap-8">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <nav className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-5 sticky top-20 border border-gray-100">
              <div className="space-y-1.5 lg:space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-2.5 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl hover:bg-[#139a9d]/10 transition-all group"
                    >
                      <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      </div>
                      <span className="font-medium text-sm lg:text-base text-gray-700 group-hover:text-[#139a9d] transition-colors">{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200 space-y-1.5 lg:space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Home className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-sm lg:text-base text-gray-600">Retour au site</span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl hover:bg-red-50 transition-all group"
                >
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <LogOut className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                  </div>
                  <span className="font-medium text-sm lg:text-base text-red-600">Déconnexion</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
