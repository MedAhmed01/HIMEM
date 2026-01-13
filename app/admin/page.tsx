import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, UserCheck, CheckCircle, ArrowRight, TrendingUp, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    title: 'Documents en attente',
    value: '0',
    subtitle: 'À vérifier',
    icon: FileText,
    color: 'from-orange-500 to-amber-500',
    shadowColor: 'shadow-orange-500/30',
    bgColor: 'from-orange-50 to-amber-50'
  },
  {
    title: 'Ingénieurs actifs',
    value: '0',
    subtitle: 'Validés et à jour',
    icon: CheckCircle,
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/30',
    bgColor: 'from-emerald-50 to-teal-50'
  },
  {
    title: 'Parrains disponibles',
    value: '0',
    subtitle: 'Ingénieurs référents',
    icon: UserCheck,
    color: 'from-purple-500 to-pink-500',
    shadowColor: 'shadow-purple-500/30',
    bgColor: 'from-purple-50 to-pink-50'
  },
  {
    title: 'Total ingénieurs',
    value: '0',
    subtitle: 'Tous statuts confondus',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/30',
    bgColor: 'from-blue-50 to-cyan-50'
  }
]

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
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-primary">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Tableau de bord</h1>
              <p className="text-slate-500">Vue d'ensemble de la plateforme OMIGEC</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-100">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-600 font-medium">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="glass border-0 shadow-xl overflow-hidden card-hover">
              <div className={`h-1.5 bg-gradient-to-r ${stat.color}`}></div>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                    <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="group p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        {action.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Aucune activité récente</p>
            <p className="text-sm text-slate-400 mt-1">Les dernières actions apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
