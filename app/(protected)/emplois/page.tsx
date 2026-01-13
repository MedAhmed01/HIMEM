'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobOfferWithEntreprise, Domain, ContractType } from '@/lib/types/database'
import { 
  Search, Briefcase, MapPin, Calendar, Building2, 
  Filter, X, ChevronRight 
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

export default function EmploisPage() {
  const [jobs, setJobs] = useState<JobOfferWithEntreprise[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [selectedDomains])

  const fetchJobs = async (searchTerm?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm || search) params.set('search', searchTerm || search)
      if (selectedDomains.length > 0) params.set('domains', selectedDomains.join(','))
      params.set('limit', '50')

      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setJobs(data.jobs || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchJobs(search)
  }

  const toggleDomain = (domain: Domain) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    )
  }

  const clearFilters = () => {
    setSelectedDomains([])
    setSearch('')
    fetchJobs('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-6 h-6" />
            <span className="text-blue-200 font-medium">Espace Emploi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Offres d'emploi</h1>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre ou mot-clé..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <Button type="submit" className="bg-white text-blue-600 hover:bg-blue-50 px-6">
              Rechercher
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Filtrer par domaine</span>
              {selectedDomains.length > 0 && (
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Effacer les filtres
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(domain => (
                <button
                  key={domain.value}
                  onClick={() => toggleDomain(domain.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDomains.includes(domain.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {total} offre{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune offre ne correspond à vos critères</p>
              {(search || selectedDomains.length > 0) && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Effacer les filtres
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <Link key={job.id} href={`/emplois/${job.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {job.entreprise?.logo_url ? (
                          <img 
                            src={job.entreprise.logo_url} 
                            alt={job.entreprise.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {job.entreprise?.name}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Expire le {new Date(job.deadline).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline">{CONTRACT_LABELS[job.contract_type]}</Badge>
                          {job.domains.slice(0, 2).map(domain => (
                            <Badge key={domain} variant="secondary" className="text-xs">
                              {DOMAINS.find(d => d.value === domain)?.label || domain}
                            </Badge>
                          ))}
                          {job.domains.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.domains.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
