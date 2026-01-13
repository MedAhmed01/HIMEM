'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Eye, 
  Users, 
  Briefcase,
  Download,
  TrendingUp,
  Loader2
} from 'lucide-react'

interface JobViewStats {
  jobId: string
  jobTitle: string
  totalViews: number
  uniqueViews: number
}

interface DailyViewStats {
  date: string
  views: number
}

interface EntrepriseStats {
  totalJobs: number
  activeJobs: number
  totalViews: number
  uniqueViews: number
  viewsByJob: JobViewStats[]
  viewsOverTime: DailyViewStats[]
}

export default function StatistiquesPage() {
  const [stats, setStats] = useState<EntrepriseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/entreprises/stats')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/entreprises/stats/export')
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `statistiques-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  // Calculate max views for chart scaling
  const maxViews = stats?.viewsOverTime.reduce((max, day) => Math.max(max, day.views), 0) || 1

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
            <Button onClick={fetchStats} className="mt-4 w-full">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Statistiques</h1>
              <p className="text-slate-500">Suivez les performances de vos offres</p>
            </div>
          </div>

          <Button 
            onClick={handleExport}
            disabled={exporting}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exporter CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total offres</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalJobs || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Offres actives</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.activeJobs || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total vues</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.totalViews || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Vues uniques</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.uniqueViews || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Views Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution des vues (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {stats?.viewsOverTime.map((day, index) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-sm transition-all hover:from-blue-600 hover:to-indigo-600"
                    style={{
                      height: `${Math.max((day.views / maxViews) * 100, 2)}%`,
                      minHeight: day.views > 0 ? '8px' : '2px'
                    }}
                    title={`${day.date}: ${day.views} vues`}
                  />
                  {index % 5 === 0 && (
                    <span className="text-xs text-slate-400 transform -rotate-45 origin-left whitespace-nowrap">
                      {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Views by Job */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Vues par offre
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.viewsByJob.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Aucune offre publiée pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {stats?.viewsByJob.map((job) => (
                  <div
                    key={job.jobId}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{job.jobTitle}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {job.totalViews} vues totales
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.uniqueViews} vues uniques
                        </span>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{
                            width: `${stats.totalViews > 0 ? (job.totalViews / stats.totalViews) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
