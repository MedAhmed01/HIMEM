'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobOffer, ContractType } from '@/lib/types/database'
import { 
  ArrowLeft, Plus, Briefcase, MapPin, Calendar, Eye, 
  Edit, Trash2, AlertCircle, CheckCircle, Users 
} from 'lucide-react'

const CONTRACT_LABELS: Record<ContractType, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  freelance: 'Freelance',
  consultant: 'Consultant'
}

export default function EntrepriseOffresPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch subscription info
      const subResponse = await fetch('/api/entreprises/subscriptions')
      const subData = await subResponse.json()
      
      if (!subResponse.ok) {
        if (subResponse.status === 401) {
          router.push('/connexion?type=entreprise')
          return
        }
        throw new Error(subData.error)
      }
      setSubscriptionInfo(subData)

      // Fetch jobs
      const jobsResponse = await fetch('/api/entreprises/jobs')
      const jobsData = await jobsResponse.json()
      
      if (jobsResponse.ok) {
        setJobs(jobsData.jobs || [])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return
    
    setDeletingId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      setJobs(jobs.filter(j => j.id !== jobId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const isExpired = (deadline: string) => new Date(deadline) < new Date()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeJobs = jobs.filter(j => j.is_active && !isExpired(j.deadline))
  const remainingQuota = subscriptionInfo?.subscription?.remainingQuota ?? 0
  const hasActiveSubscription = subscriptionInfo?.hasActiveSubscription ?? false

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/entreprise/tableau-de-bord" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
          {hasActiveSubscription && remainingQuota > 0 ? (
            <Link href="/entreprise/offres/nouvelle">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle offre
              </Button>
            </Link>
          ) : (
            <Link href="/entreprise/abonnement">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                {hasActiveSubscription ? 'Augmenter mon quota' : 'Souscrire pour publier'}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes offres d'emploi</h1>

        {/* Quota Info */}
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-4 ${
          hasActiveSubscription ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          {hasActiveSubscription ? (
            <>
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {remainingQuota} offre{remainingQuota > 1 ? 's' : ''} disponible{remainingQuota > 1 ? 's' : ''}
                </p>
                <p className="text-blue-700 text-sm">
                  {activeJobs.length} offre{activeJobs.length > 1 ? 's' : ''} active{activeJobs.length > 1 ? 's' : ''}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Aucun abonnement actif</p>
                <p className="text-amber-700 text-sm">Souscrivez à un forfait pour publier des offres</p>
              </div>
              <Link href="/entreprise/abonnement">
                <Button className="bg-amber-600 hover:bg-amber-700">Voir les forfaits</Button>
              </Link>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Vous n'avez pas encore publié d'offres</p>
              {hasActiveSubscription && remainingQuota > 0 && (
                <Link href="/entreprise/offres/nouvelle">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer ma première offre
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <Card key={job.id} className={!job.is_active || isExpired(job.deadline) ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant={job.is_active && !isExpired(job.deadline) ? 'default' : 'secondary'}>
                          {!job.is_active ? 'Supprimée' : isExpired(job.deadline) ? 'Expirée' : 'Active'}
                        </Badge>
                        <Badge variant="outline">{CONTRACT_LABELS[job.contract_type]}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Expire le {new Date(job.deadline).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {job.views_count} vue{job.views_count > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Users className="w-4 h-4" />
                          {job.applications_count || 0} candidature{(job.applications_count || 0) > 1 ? 's' : ''}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/entreprise/offres/${job.id}/candidatures`}>
                        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Users className="w-4 h-4 mr-1" />
                          Candidatures
                        </Button>
                      </Link>
                      <Link href={`/entreprise/offres/${job.id}/modifier`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === job.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
