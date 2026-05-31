'use client'

import { useState, useEffect } from 'react'
import { 
  GraduationCap, 
  MapPin, 
  Building2, 
  Calendar, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  X, 
  Landmark,
  ShieldCheck,
  Briefcase,
  Search
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Engineer {
  nni: string
  full_name: string
  diploma: string
  grad_year: number
  university?: string
  country?: string
  profile_image_url?: string
  subscription_expiry?: string
  is_subscription_active: boolean
  domains: string[]
  exercise_modes: string[]
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const DOMAIN_ICONS: Record<string, string> = {
  'Bâtiment & Constructions': 'construction',
  'Génie Civil': 'engineering',
  'Électricité': 'bolt',
  'Mécanique': 'settings',
  'Informatique': 'computer',
  'Télécommunications': 'settings_input_antenna',
  'Énergie': 'electric_bolt',
  'Environnement': 'eco',
  'Mines': 'workspaces',
  'Pétrole & Gaz': 'oil_barrel',
  'Hydraulique et Environnement': 'water_drop',
  'Infrastructure de transport': 'traffic'
}

export default function VerifiedEngineersList() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null)

  useEffect(() => {
    fetchEngineers(pagination.page)
  }, [pagination.page])

  const fetchEngineers = async (page: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/engineers/verified?page=${page}&limit=6`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des ingénieurs')
      }
      const data = await response.json()
      setEngineers(data.engineers || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Une erreur est survenue lors de la récupération des ingénieurs.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const maskNNI = (nni: string) => {
    if (!nni) return ''
    if (nni.length <= 6) return '******'
    return `${nni.slice(0, 3)}****${nni.slice(-3)}`
  }

  const calculateExperience = (gradYear: number) => {
    const currentYear = new Date().getFullYear()
    return currentYear - gradYear
  }

  const getPageNumbers = () => {
    const pages = []
    const totalPages = pagination.totalPages
    const currentPage = pagination.page

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14919B]/10 text-[#14919B] dark:bg-[#14919B]/20 dark:text-[#14919B] text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            Tableau Officiel des Ingénieurs
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight mb-6">
            Membres Agréés & Vérifiés
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Consultez en temps réel l'annuaire officiel des ingénieurs de génie civil inscrits au Tableau de l'Ordre et régulièrement autorisés à exercer en Mauritanie.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto text-center py-12 px-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
            <Button 
              onClick={() => fetchEngineers(pagination.page)} 
              className="bg-[#14919B] hover:bg-[#0E646C] text-white"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Loading State / Skeletons */}
        {!error && isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse h-80 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="space-y-3 mt-4">
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="flex gap-2 pt-4">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!error && !isLoading && engineers.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#14919B]/10 dark:bg-[#14919B]/20 text-[#14919B] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-2">Aucun ingénieur agréé trouvé</h3>
            <p className="text-slate-500 dark:text-slate-400">
              La liste des ingénieurs vérifiés est en cours de mise à jour par l'administration de l'Ordre.
            </p>
          </div>
        )}

        {/* Engineer Cards Grid */}
        {!error && !isLoading && engineers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {engineers.map((engineer, index) => (
                <Card 
                  key={index} 
                  className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      {/* Top Badges and Avatar */}
                      <div className="flex justify-between items-start mb-6">
                        <Avatar className="w-16 h-16 border-2 border-[#14919B]/20 shadow-md group-hover:scale-105 transition-transform duration-300">
                          {engineer.profile_image_url && (
                            <AvatarImage 
                              src={engineer.profile_image_url} 
                              alt={engineer.full_name} 
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-[#14919B] to-[#0E646C] text-white text-lg font-bold">
                            {engineer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] px-2 py-0.5 border-none shadow-sm flex items-center gap-1">
                            <span className="material-icons-outlined text-xs">verified</span>
                            Agréé
                          </Badge>
                          {engineer.is_subscription_active ? (
                            <Badge className="bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 font-bold text-[10px] px-2 py-0.5 border-none shadow-none">
                              Cotisation Active
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-[10px] px-2 py-0.5 border-none shadow-none">
                              Cotisation Expirée
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Profile Name & Title */}
                      <div className="space-y-1.5 mb-5">
                        <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white line-clamp-1 group-hover:text-[#14919B] transition-colors leading-tight">
                          {engineer.full_name}
                        </h3>
                      </div>

                      {/* Qualifications */}
                      <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-50 dark:border-slate-700/50 pt-4 mb-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-[#14919B] shrink-0" />
                          <span className="truncate font-medium">{engineer.diploma}</span>
                        </div>
                        {engineer.university && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{engineer.university} ({engineer.grad_year})</span>
                          </div>
                        )}
                        {engineer.country && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{engineer.country}</span>
                          </div>
                        )}
                      </div>

                      </div>

                    {/* Action Button */}
                    <Button 
                      onClick={() => setSelectedEngineer(engineer)}
                      className="w-full bg-[#14919B]/10 text-[#14919B] hover:bg-[#14919B] hover:text-white font-bold rounded-2xl py-5 transition-all duration-300 border-none shadow-none group-hover:shadow-md"
                    >
                      Voir le Profil Complet
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-16 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-8">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Affichage de <span className="font-bold text-slate-800 dark:text-white">{engineers.length}</span> ingénieurs sur <span className="font-bold text-slate-800 dark:text-white">{pagination.total}</span> membres
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 ${
                      pagination.page === 1 
                        ? 'opacity-40 cursor-not-allowed' 
                        : 'cursor-pointer hover:border-[#14919B] text-[#14919B]'
                    }`}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((num, i) => (
                    <button
                      key={i}
                      onClick={() => typeof num === 'number' && handlePageChange(num)}
                      disabled={typeof num !== 'number'}
                      className={`min-w-[40px] h-10 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        num === pagination.page
                          ? 'bg-[#14919B] text-white shadow-md shadow-[#14919B]/25'
                          : typeof num !== 'number'
                          ? 'text-slate-400 dark:text-slate-600 cursor-default'
                          : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-[#14919B] hover:border-[#14919B] border border-slate-200/80 dark:border-slate-700/80 cursor-pointer'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 ${
                      pagination.page === pagination.totalPages 
                        ? 'opacity-40 cursor-not-allowed' 
                        : 'cursor-pointer hover:border-[#14919B] text-[#14919B]'
                    }`}
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Engineer Detail Dialog */}
      <Dialog 
        open={!!selectedEngineer} 
        onOpenChange={(open) => !open && setSelectedEngineer(null)}
      >
        <DialogContent 
          showCloseButton={false}
          className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto"
        >
          <DialogTitle className="sr-only">Profil de l'ingénieur</DialogTitle>

          {selectedEngineer && (
            <div className="relative bg-white dark:bg-slate-900 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
              
              {/* Colored Top Banner */}
              <div className="h-32 bg-gradient-to-r from-[#14919B] to-[#0E646C] relative">
                <button
                  onClick={() => setSelectedEngineer(null)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 z-10"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overlapping Avatar Area */}
              <div className="px-8 -mt-16 flex flex-col sm:flex-row justify-between items-center sm:items-end mb-6 gap-4">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-900 shadow-xl rounded-full">
                  {selectedEngineer.profile_image_url && (
                    <AvatarImage 
                      src={selectedEngineer.profile_image_url} 
                      alt={selectedEngineer.full_name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-[#14919B] to-[#0E646C] text-white text-3xl font-bold">
                    {selectedEngineer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex gap-2.5">
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 border-none shadow-md flex items-center gap-1.5">
                    <span className="material-icons-outlined text-sm">verified</span>
                    Ingénieur Agréé
                  </Badge>
                  {selectedEngineer.is_subscription_active ? (
                    <Badge className="bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 font-bold text-xs px-3 py-1 border-none shadow-none">
                      Membre Actif
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-xs px-3 py-1 border-none shadow-none">
                      Non à jour
                    </Badge>
                  )}
                </div>
              </div>

              {/* Profile Details Content */}
              <div className="px-8 pb-8 pt-2">
                
                {/* Name and NNI */}
                <div className="text-center sm:text-left mb-6 space-y-1">
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 dark:text-white leading-tight">
                    {selectedEngineer.full_name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-xs text-[#14919B]">
                      {calculateExperience(selectedEngineer.grad_year)} ans d'expérience
                    </span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800 text-center sm:text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Diplôme Obtenu
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-base leading-tight truncate">
                      {selectedEngineer.diploma}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800 text-center sm:text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Année de Promotion
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-base leading-tight">
                      {selectedEngineer.grad_year}
                    </p>
                  </div>
                </div>

                {/* Detailed Information Rows */}
                <div className="space-y-4">
                  {/* University & Country */}
                  {selectedEngineer.university && (
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#14919B]/5 to-transparent dark:from-[#14919B]/10 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <Landmark className="w-5 h-5 text-[#14919B] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Université & Pays d'études
                        </h4>
                        <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                          {selectedEngineer.university}
                          {selectedEngineer.country && ` (${selectedEngineer.country})`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mode of exercise */}
                  {selectedEngineer.exercise_modes && selectedEngineer.exercise_modes.length > 0 && (
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#14919B]/5 to-transparent dark:from-[#14919B]/10 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <Briefcase className="w-5 h-5 text-[#14919B] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Mode d'exercice
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEngineer.exercise_modes.map((mode, i) => (
                            <Badge 
                              key={i} 
                              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border-none font-semibold text-xs py-0.5 px-2.5 rounded-md"
                            >
                              {mode}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Domains */}
                  {selectedEngineer.domains && selectedEngineer.domains.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-[#14919B] rounded-full"></span>
                        Domaines de Spécialisation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEngineer.domains.map((domain, i) => (
                          <Badge 
                            key={i} 
                            className="bg-[#14919B]/5 dark:bg-[#14919B]/15 text-[#14919B] hover:bg-[#14919B]/10 border-none font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-default"
                          >
                            <span className="material-icons-outlined text-sm">
                              {DOMAIN_ICONS[domain] || 'engineering'}
                            </span>
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Dialog Footer */}
              <div className="bg-slate-50 dark:bg-slate-800/40 px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  OMIGEC Officiel
                </span>
                <span>Date de cotisation : {selectedEngineer.subscription_expiry ? new Date(selectedEngineer.subscription_expiry).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'}) : 'Non renseignée'}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
