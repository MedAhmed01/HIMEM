'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, UserCheck, CheckCircle, ArrowRight, TrendingUp, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  pendingDocs: number
  pendingEngineers: number
  pendingCompanies: number
  activeEngineers: number
  references: number
  totalEngineers: number
}

const quickActions = [
  {
    title: 'Vérifier les documents',
    description: 'Approuver ou rejeter les documents soumis',
    href: '/admin/verifications',
    icon: FileText,
    color: 'from-orange-500 to-amber-500'
  },
  {
    title: 'Gérer les parrains',
    description: 'Ajouter ou retirer des ingénieurs référents',
    href: '/admin/parrains',
    icon: UserCheck,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'Voir tous les ingénieurs',
    description: 'Consulter et gérer les profils',
    href: '/admin/ingenieurs',
    icon: Users,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: "Gérer les offres d'emploi",
    description: 'Publier et modérer les annonces',
    href: '/admin/emplois',
    icon: TrendingUp,
    color: 'from-pink-500 to-rose-500'
  }
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    pendingDocs: 0,
    pendingEngineers: 0,
    pendingCompanies: 0,
    activeEngineers: 0,
    references: 0,
    totalEngineers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

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
      subtitle: 'À vérifier',
      icon: FileText,
      color: 'from-orange-500 to-amber-500',
      shadowColor: 'shadow-orange-500/30',
      bgColor: 'from-orange-50 to-amber-50'
    },
    {
      title: 'Ingénieurs actifs',
      value: stats.activeEngineers.toString(),
      subtitle: 'Validés et à jour',
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/30',
      bgColor: 'from-emerald-50 to-teal-50'
    },
    {
      title: 'Parrains disponibles',
      value: stats.references.toString(),
      subtitle: 'Ingénieurs référents',
      icon: UserCheck,
      color: 'from-purple-500 to-pink-500',
      shadowColor: 'shadow-purple-500/30',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Total ingénieurs',
      value: stats.totalEngineers.toString(),
      subtitle: 'Tous statuts confondus',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/30',
      bgColor: 'from-blue-50 to-cyan-50'
    }
  ]
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme OMIGEC</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-700 font-medium">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-gray-200 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          statsCards.map((stat, index) => {
            const Icon = stat.icon
            const isPendingDocs = index === 0 // First card is pending docs
            
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {isPendingDocs && stats.pendingDocs > 0 ? (
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {stats.pendingEngineers} ingénieur{stats.pendingEngineers !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {stats.pendingCompanies} entreprise{stats.pendingCompanies !== 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="group flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2 text-sm">
                      <span className="truncate">{action.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex-shrink-0" />
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{action.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
        </div>
        <div className="p-5">
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucune activité récente</p>
            <p className="text-sm text-gray-500 mt-1">Les dernières actions apparaîtront ici</p>
          </div>
        </div>
      </div>
    </div>
  )
}
