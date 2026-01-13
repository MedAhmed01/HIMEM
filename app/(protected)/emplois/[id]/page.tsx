'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobOfferWithEntreprise, Domain, ContractType } from '@/lib/types/database'
import { 
  ArrowLeft, Building2, MapPin, Calendar, Mail, Phone,
  Briefcase, Clock, DollarSign, AlertCircle, Lock
} from 'lucide-react'

const DOMAINS: { value: Domain; label: string }[] = [
  { value: 'infrastructure_transport', label: 'Infrastructure & Transport' },
  { value: 'batiment_constructions', label: 'Bâtiment & Constructions' },
  { value: 'hydraulique_environnement', label: 'Hydraulique & Environnement' }
]

const CONTRACT_LABELS: Record<ContractType, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  freelance: 'Freelance',
  consultant: 'Consultant'
}

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  
  const [job, setJob] = useState<JobOfferWithEntreprise | null>(null)
  const [showContacts, setShowContacts] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Offre non trouvée')
      }
      
      setJob(data.job)
      setShowContacts(data.showContacts)

      // Enregistrer la vue
      await fetch(`/api/jobs/${jobId}/view`, { method: 'POST' })

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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Offre non trouvée</h2>
            <p className="text-gray-500 mb-6">{error || 'Cette offre n\'existe pas ou a été supprimée.'}</p>
            <Link href="/emplois">
              <Button>Retour aux offres</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysRemaining = Math.ceil(
    (new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/emplois" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Job Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {job.entreprise?.logo_url ? (
                  <img 
                    src={job.entreprise.logo_url} 
                    alt={job.entreprise.name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                <p className="text-lg text-blue-600 font-medium mb-3">{job.entreprise?.name}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{CONTRACT_LABELS[job.contract_type]}</Badge>
                  {job.domains.map(domain => (
                    <Badge key={domain} variant="secondary">
                      {DOMAINS.find(d => d.value === domain)?.label || domain}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Description du poste
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Détails</h3>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>
                    Expire le {new Date(job.deadline).toLocaleDateString('fr-FR')}
                    {daysRemaining > 0 && (
                      <span className="text-sm text-gray-500 ml-1">
                        ({daysRemaining} jour{daysRemaining > 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </div>

                {job.salary_range && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span>{job.salary_range}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
                
                {showContacts ? (
                  <div className="space-y-3">
                    {job.entreprise?.email && (
                      <a 
                        href={`mailto:${job.entreprise.email}`}
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                      >
                        <Mail className="w-5 h-5" />
                        <span>{job.entreprise.email}</span>
                      </a>
                    )}
                    {job.entreprise?.phone && (
                      <a 
                        href={`tel:${job.entreprise.phone}`}
                        className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                      >
                        <Phone className="w-5 h-5" />
                        <span>{job.entreprise.phone}</span>
                      </a>
                    )}
                    <p className="text-sm text-gray-500 mt-4">
                      Envoyez votre CV directement à l'entreprise
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Accès restreint</p>
                        <p className="text-amber-700 text-sm mt-1">
                          Les coordonnées de l'entreprise sont réservées aux membres à jour de cotisation.
                        </p>
                        <Link href="/tableau-de-bord">
                          <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700">
                            Renouveler ma cotisation
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.entreprise && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">À propos de l'entreprise</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {job.entreprise.logo_url ? (
                        <img 
                          src={job.entreprise.logo_url} 
                          alt={job.entreprise.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{job.entreprise.name}</p>
                      <p className="text-sm text-gray-500">{job.entreprise.sector}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
