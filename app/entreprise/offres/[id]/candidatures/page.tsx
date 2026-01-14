'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, User, Mail, Phone, FileText, 
  CheckCircle, XCircle, Clock, AlertCircle 
} from 'lucide-react'

interface Application {
  id: string
  engineer_id: string
  job_id: string
  status: 'pending' | 'accepted' | 'rejected'
  cover_letter: string
  created_at: string
  engineer: {
    full_name: string
    email: string
    phone: string
    domain: string[]
    grad_year: number
  }
}

interface JobOffer {
  id: string
  title: string
  location: string
}

const STATUS_LABELS = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée'
}

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export default function CandidaturesPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  
  const [job, setJob] = useState<JobOffer | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [jobId])

  const fetchData = async () => {
    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`)
      if (!jobResponse.ok) {
        if (jobResponse.status === 401) {
          router.push('/connexion?type=entreprise')
          return
        }
        throw new Error('Offre non trouvée')
      }
      const jobData = await jobResponse.json()
      setJob(jobData.job)

      // Fetch applications
      const appsResponse = await fetch(`/api/entreprises/jobs/${jobId}/applications`)
      if (!appsResponse.ok) {
        throw new Error('Erreur lors du chargement des candidatures')
      }
      const appsData = await appsResponse.json()
      setApplications(appsData.applications || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setUpdatingId(applicationId)
    try {
      const response = await fetch(`/api/entreprises/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/entreprise/offres" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Link>
          {job && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500">{job.location}</p>
            </div>
          )}
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
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune candidature pour cette offre</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(application => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold">
                        {application.engineer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.engineer.full_name}
                        </h3>
                        <p className="text-gray-600">
                          {application.engineer.domain.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Diplômé en {application.engineer.grad_year} ({new Date().getFullYear() - application.engineer.grad_year} ans d'expérience)
                        </p>
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[application.status]}>
                      {STATUS_LABELS[application.status]}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${application.engineer.email}`} className="hover:text-blue-600">
                        {application.engineer.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${application.engineer.phone}`} className="hover:text-blue-600">
                        {application.engineer.phone}
                      </a>
                    </div>
                  </div>

                  {application.cover_letter && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <p className="font-medium text-gray-700">Lettre de motivation</p>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          disabled={updatingId === application.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          disabled={updatingId === application.id}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    Candidature reçue le {new Date(application.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
