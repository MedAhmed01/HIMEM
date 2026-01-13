import Link from 'next/link'
import { FileText, Users, Briefcase, UserCheck, LayoutDashboard, Home, LogOut, Sparkles, Image, Newspaper, Building2 } from 'lucide-react'

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
  { name: 'Vérifications', href: '/admin/verifications', icon: FileText, color: 'from-blue-400 to-blue-500' },
  { name: 'Parrains', href: '/admin/parrains', icon: UserCheck, color: 'from-blue-500 to-blue-600' },
  { name: 'Ingénieurs', href: '/admin/ingenieurs', icon: Users, color: 'from-blue-400 to-blue-500' },
  { name: 'Entreprises', href: '/admin/entreprises', icon: Building2, color: 'from-blue-500 to-blue-600' },
  { name: 'Articles', href: '/admin/articles', icon: Newspaper, color: 'from-blue-400 to-blue-500' },
  { name: 'Sponsors', href: '/admin/sponsors', icon: Image, color: 'from-blue-500 to-blue-600' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">OMIGEC</div>
              </Link>
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Admin
              </span>
            </div>
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Retour au site</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-72 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-lg p-5 sticky top-24 border border-gray-100">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3.5 rounded-xl hover:bg-blue-50 transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Home className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-600">Retour au site</span>
                </Link>
                
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-medium text-red-600">Déconnexion</span>
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
