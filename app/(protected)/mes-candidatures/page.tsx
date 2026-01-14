'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, MapPin, Calendar, Building2, 
  CheckCircle, XCircle, Clock, AlertCircle, ArrowRight
} from 'lucide-react'

interface Application {
  id: string
  job_id: string
  status: 'pending' | 'accepted' | 'rejected'
  cover_letter: string | null
  created_at: string
  job: {
    title: string
    location: string
    contract_type: string
    deadline: string
    entreprise: {
      name: string
      logo_url?: string
    }
  }
}

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock,
    iconColor: 'text-amber-600'
  },
  accepted: {
    label: 'Acceptée',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  rejected: {
    label: 'Refusée',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600'
  }
}

const CONTRACT_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  freelance: 'Freelance',
  consultant: 'Consultant'
}

export default function MesCandidaturesPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/engineers/applications')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      setApplications(data.applications || [])
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

  const pendingCount = applications.filter(a => a.status === 'pending').length
  const acceptedCount = applications.filter(a => a.status === 'accepted').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-6 h-6" />
            <span className="text-blue-200 font-medium">Emploi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Mes candidatures</h1>
          <p className="text-blue-100">
            Suivez l'état de vos candidatures aux offres d'emploi
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                  <p className="text-sm text-gray-500">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
                  <p className="text-sm text-gray-500">Acceptées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
                  <p className="text-sm text-gray-500">Refusées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Vous n'avez pas encore postulé à des offres</p>
              <Link href="/emplois">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Voir les offres disponibles
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(application => {
              const statusConfig = STATUS_CONFIG[application.status]
              const StatusIcon = statusConfig.icon
              
              return (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {application.job.entreprise?.logo_url ? (
                            <img 
                              src={application.job.entreprise.logo_url} 
                              alt={application.job.entreprise.name}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.job.title}
                          </h3>
                          <p className="text-blue-600 font-medium mb-2">
                            {application.job.entreprise?.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {application.job.location}
                            </span>
                            <Badge variant="outline">
                              {CONTRACT_LABELS[application.job.contract_type] || application.job.contract_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className={`w-4 h-4 mr-1 ${statusConfig.iconColor}`} />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {application.cover_letter && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Votre lettre de motivation</p>
                        <p className="text-sm text-gray-600 line-clamp-3">{application.cover_letter}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-400">
                        Candidature envoyée le {new Date(application.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <Link href={`/emplois/${application.job_id}`}>
                        <Button variant="outline" size="sm">
                          Voir l'offre
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
