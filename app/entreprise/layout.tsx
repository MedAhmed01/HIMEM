'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  CreditCard,
  BarChart3,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  {
    href: '/entreprise/tableau-de-bord',
    label: 'Tableau de bord',
    icon: LayoutDashboard
  },
  {
    href: '/entreprise/offres',
    label: 'Mes offres',
    icon: Briefcase
  },
  {
    href: '/entreprise/profil',
    label: 'Mon profil',
    icon: Building2
  },
  {
    href: '/entreprise/abonnement',
    label: 'Abonnement',
    icon: CreditCard
  },
  {
    href: '/entreprise/statistiques',
    label: 'Statistiques',
    icon: BarChart3
  }
]

export default function EntrepriseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 shadow-sm">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                OMIGEC
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full">
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
