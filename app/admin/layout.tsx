'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  FileText, 
  Users, 
  UserCheck, 
  LayoutDashboard, 
  Home, 
  LogOut, 
  Building2, 
  CreditCard, 
  Mail, 
  Newspaper, 
  Image,
  Sun,
  Moon,
  Palette,
  Award
} from 'lucide-react'

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Vérifications', href: '/admin/verifications', icon: FileText },
  { name: 'Parrains', href: '/admin/parrains', icon: UserCheck },
  { name: 'Ingénieurs', href: '/admin/ingenieurs', icon: Users },
  { name: 'Entreprises', href: '/admin/entreprises', icon: Building2 },
  { name: 'Sponsors', href: '/admin/sponsors', icon: Award },
  { name: 'Abonnements', href: '/admin/abonnements-entreprises', icon: CreditCard },
  { name: 'Messages', href: '/admin/messages', icon: Mail, badge: 4 },
  { name: 'Articles', href: '/admin/articles', icon: Newspaper },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDark, setIsDark] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('admin-theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('admin-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('admin-theme', 'light')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/connexion')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-teal-600 dark:bg-teal-900 z-50 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">OMIGEC</h1>
            <p className="text-teal-100 text-[10px] uppercase tracking-wider">Ordre des Ingénieurs</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white text-sm">
            <UserCheck className="w-4 h-4" />
            <span>Mode Administrateur</span>
          </div>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 text-white hover:text-teal-200 transition-colors text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Retour au site</span>
          </Link>

          <button 
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors overflow-y-auto">
        <nav className="mt-6 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg group transition-all ${
                  isActive 
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-r-4 border-teal-600 dark:border-teal-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-teal-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="pt-10 pb-4 border-t border-slate-100 dark:border-slate-800 mt-10">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-rose-500">Déconnexion</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16 p-8">
        {children}
      </main>

      {/* Floating Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Palette className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
