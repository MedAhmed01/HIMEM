'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Users,
  UserCheck,
  CheckCircle,
  Calendar,
  TrendingUp,
  Clock,
  Bell,
  FileCheck,
  UserPlus,
  Briefcase,
  BarChart3,
  Building2,
  UserCircle
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  pendingDocs: number
  pendingEngineers: number
  pendingCompanies: number
  activeEngineers: number
  references: number
  totalEngineers: number
}

interface Activity {
  id: string
  user: string
  action: string
  time: string
  status: 'pending' | 'approved' | 'system'
  avatar?: string
  type?: 'engineer' | 'company' | 'job' | 'system'
}

const quickActions = [
  {
    title: 'Vérifier les documents',
    description: 'Approuver ou rejeter les soumissions',
    href: '/admin/verifications',
    icon: FileCheck,
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600'
  },
  {
    title: 'Gérer les parrains',
    description: 'Ajouter/retirer des référents',
    href: '/admin/parrains',
    icon: UserPlus,
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600'
  },
  {
    title: 'Annuaire ingénieurs',
    description: 'Consulter et modifier les profils',
    href: '/admin/ingenieurs',
    icon: Users,
    bgColor: 'bg-sky-100 dark:bg-sky-900/20',
    iconColor: 'text-sky-600'
  },
  {
    title: "Offres d'emploi",
    description: 'Publier et modérer les annonces',
    href: '/admin/emplois',
    icon: Briefcase,
    bgColor: 'bg-rose-100 dark:bg-rose-900/20',
    iconColor: 'text-rose-600'
  }
]

// Helper for relative time formatting
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `Il y a ${diffInSeconds} sec`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `Il y a ${diffInDays}j`

  return date.toLocaleDateString('fr-FR')
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    pendingDocs: 24,
    pendingEngineers: 0,
    pendingCompanies: 0,
    activeEngineers: 1248,
    references: 86,
    totalEngineers: 1540
  })
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    loadStats()
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const res = await fetch('/api/admin/activities')
      const data = await res.json()
      if (res.ok) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (res.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Documents en attente',
      value: stats.pendingDocs.toString(),
      subtitle: 'à vérifier',
      icon: Clock,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600',
      trend: '+12%',
      trendColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Ingénieurs actifs',
      value: stats.activeEngineers.toString(),
      subtitle: 'validés',
      icon: CheckCircle,
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600',
      trend: '+4%',
      trendColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Parrains disponibles',
      value: stats.references.toString(),
      subtitle: 'référents',
      icon: UserCheck,
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600',
      trend: '-2%',
      trendColor: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'
    },
    {
      title: 'Total membres',
      value: stats.totalEngineers.toString(),
      subtitle: 'tous statuts',
      icon: Users,
      bgColor: 'bg-sky-100 dark:bg-sky-900/30',
      iconColor: 'text-sky-600',
      trend: '+8%',
      trendColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
    }
  ]

  const chartData = [40, 65, 45, 85, 60, 95] // Mock chart data
  const chartLabels = ['Aout', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tableau de bord</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Vue d'ensemble de la plateforme OMIGEC</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <Calendar className="text-teal-600 w-5 h-5" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))
        ) : (
          statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800 transition-all hover:scale-[1.02]">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} ${stat.iconColor} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.trendColor}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  <span className="text-xs text-slate-400">{stat.subtitle}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Actions & Chart */}
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-teal-600 w-5 h-5" />
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-teal-600 transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center ${action.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{action.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Inscriptions mensuelles</h3>
              <select className="bg-slate-50 dark:bg-slate-900 border-none text-xs rounded-lg px-3 py-1 ring-1 ring-slate-200 dark:ring-slate-700">
                <option>Derniers 6 mois</option>
                <option>Cette année</option>
              </select>
            </div>
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {chartData.map((height, index) => (
                <div key={index} className="w-full relative group">
                  <div
                    className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative group cursor-pointer"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute inset-0 bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg"></div>
                    {index === chartData.length - 1 && (
                      <div className="absolute inset-0 bg-teal-600 rounded-t-lg"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest px-2">
              {chartLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="text-teal-600 w-5 h-5" />
            Activité récente
          </h3>
          <div className="relative space-y-6">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700"></div>
            {activities.length === 0 && !loading ? (
              <p className="text-center text-slate-500 text-sm py-4">Aucune activité récente</p>
            ) : activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 z-10 overflow-hidden flex-shrink-0">
                  <div className={`w-full h-full flex items-center justify-center ${activity.type === 'job' ? 'bg-rose-50' :
                    activity.type === 'company' ? 'bg-sky-50' : 'bg-slate-100'
                    } dark:bg-slate-700`}>
                    {activity.type === 'engineer' ? <UserCircle className="w-6 h-6 text-indigo-500" /> :
                      activity.type === 'company' ? <Building2 className="w-6 h-6 text-sky-500" /> :
                        activity.type === 'job' ? <Briefcase className="w-6 h-6 text-rose-500" /> :
                          <Bell className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start text-left">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{activity.user}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{formatTimeAgo(activity.time)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-left">{activity.action}</p>
                  {activity.status !== 'system' && (
                    <div className="mt-2 flex gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${activity.status === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                        }`}>
                        {activity.status === 'pending' ? 'En attente' : 'Validé'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Link href="/admin/activites" className="block">
              <button className="w-full py-3 text-sm text-teal-600 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors mt-4">
                Voir tout l'historique
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
