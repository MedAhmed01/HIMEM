'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Entreprise, JobOffer } from '@/lib/types/database'
import { 
  Building2, Briefcase, Eye, Calendar, Plus, 
  CreditCard, Settings, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react'

export default function EntrepriseTableauDeBordPage() {
  const router = useRouter()
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch profile
      const profileRes = await fetch('/api/entreprises/profile')
      const profileData = await profileRes.json()
      
      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          router.push('/connexion?type=entreprise')
          return
        }
        throw new Error(profileData.error)
      }
      setEntreprise(profileData.entreprise)

      // Fetch subscription
      const subRes = await fetch('/api/entreprises/subscriptions')
      const subData = await subRes.json()
      if (subRes.ok) {
        setSubscriptionInfo(subData)
      }

      // Fetch jobs
      const jobsRes = await fetch('/api/entreprises/jobs')
      const jobsData = await jobsRes.json()
      if (jobsRes.ok) {
        setJobs(jobsData.jobs || [])
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !entreprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700">{error || 'Erreur de chargement'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeJobs = jobs.filter(j => j.is_active && new Date(j.deadline) > new Date())
  const totalViews = jobs.reduce((sum, j) => sum + j.views_count, 0)
  const hasActiveSubscription = subscriptionInfo?.hasActiveSubscription ?? false
  const daysRemaining = subscriptionInfo?.subscription?.daysRemaining ?? 0
  const remainingQuota = subscriptionInfo?.subscription?.remainingQuota ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              {entreprise.logo_url ? (
                <img src={entreprise.logo_url} alt={entreprise.name} className="w-12 h-12 object-contain" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{entreprise.name}</h1>
              <p className="text-blue-200">{entreprise.sector}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Alert */}
        {entreprise.status === 'en_attente' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800">Votre compte est en attente de validation par l'administrateur.</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
                  <p className="text-gray-500 text-sm">Offres actives</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
                  <p className="text-gray-500 text-sm">Vues totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{remainingQuota}</p>
                  <p className="text-gray-500 text-sm">Quota restant</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  hasActiveSubscription ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Calendar className={`w-6 h-6 ${hasActiveSubscription ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {hasActiveSubscription ? `${daysRemaining}j` : '-'}
                  </p>
                  <p className="text-gray-500 text-sm">Jours restants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasActiveSubscription ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">
                      Forfait {subscriptionInfo.subscription.plan.name} actif
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {daysRemaining} jours restants • {remainingQuota} offres disponibles
                  </p>
                  <Link href="/entreprise/abonnement">
                    <Button variant="outline" className="w-full">Gérer l'abonnement</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">Aucun abonnement actif</p>
                  <Link href="/entreprise/abonnement">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Souscrire à un forfait
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jobs Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Offres d'emploi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-600">
                  {activeJobs.length} offre{activeJobs.length > 1 ? 's' : ''} active{activeJobs.length > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Link href="/entreprise/offres" className="flex-1">
                    <Button variant="outline" className="w-full">Voir mes offres</Button>
                  </Link>
                  {hasActiveSubscription && remainingQuota > 0 ? (
                    <Link href="/entreprise/offres/nouvelle">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/entreprise/abonnement">
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs */}
        {jobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dernières offres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobs.slice(0, 5).map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={job.is_active ? 'default' : 'secondary'}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {job.views_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
