'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileCheck, 
  Users, 
  UserCheck, 
  Briefcase,
  LogOut,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Vérifications', href: '/admin/verifications', icon: FileCheck },
  { name: 'Ingénieurs', href: '/admin/ingenieurs', icon: Users },
  { name: 'Parrains', href: '/admin/parrains', icon: UserCheck },
  { name: 'Emplois', href: '/admin/emplois', icon: Briefcase },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-primary">OMIGEC</div>
        </Link>
        <p className="text-sm text-gray-600 mt-1">Administration</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start">
            <Home className="w-4 h-4 mr-2" />
            Retour au site
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
