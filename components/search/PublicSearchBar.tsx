'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, GraduationCap, MapPin, Building2, Calendar, CheckCircle, Briefcase, Award, Hammer, School, Landmark } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface Engineer {
  nni: string
  full_name: string
  diploma: string
  grad_year: number
  university?: string
  country?: string
  profile_image_url?: string
  domains: string[]
  exercise_mode: string
}

interface SearchResponse {
  found: boolean
  status: string
  message: string
  engineers: Engineer[]
}

const DOMAIN_COLORS: Record<string, string> = {
  'Bâtiment & Constructions': 'from-orange-500 to-amber-500',
  'Infrastructure de transport': 'from-blue-500 to-cyan-500',
  'Hydraulique et Environnement': 'from-emerald-500 to-teal-500',
  'Génie Civil': 'from-purple-500 to-pink-500',
  'Électricité': 'from-yellow-500 to-orange-500',
  'Mécanique': 'from-red-500 to-rose-500',
}

export function PublicSearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Engineer[]>([])
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Instant search with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (response.ok) {
          const data: SearchResponse = await response.json()
          setSuggestions(data.engineers || [])
          setShowSuggestions(true)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (engineer: Engineer) => {
    setSelectedEngineer(engineer)
    setQuery(engineer.full_name)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setQuery('')
    setSelectedEngineer(null)
    setSuggestions([])
  }

  const calculateExperience = (gradYear: number) => {
    return new Date().getFullYear() - gradYear
  }

  const getDomainColor = (domain: string) => {
    return DOMAIN_COLORS[domain] || 'from-slate-500 to-slate-600'
  }

  return (
    <div className="w-full mx-auto space-y-3 sm:space-y-4">
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher par NNI, nom ou téléphone..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedEngineer(null)
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 md:h-13 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-slate-200 focus:border-indigo-400 shadow-sm"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-11 sm:right-14 top-1/2 transform -translate-y-1/2">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-xl max-h-72 sm:max-h-80 overflow-y-auto">
            {suggestions.map((engineer, index) => (
              <button
                key={index}
                onClick={() => handleSelect(engineer)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-50 border-b last:border-b-0 transition-colors first:rounded-t-lg sm:first:rounded-t-xl last:rounded-b-lg sm:last:rounded-b-xl"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-slate-100 flex-shrink-0">
                    {engineer.profile_image_url && (
                      <AvatarImage
                        src={engineer.profile_image_url}
                        alt={engineer.full_name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs sm:text-sm font-bold">
                      {engineer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">{engineer.full_name}</p>
                      <Badge className="bg-emerald-500 text-white border-0 text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0">
                        Agréé
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 flex-wrap">
                      {engineer.diploma && (
                        <span className="truncate">{engineer.diploma}</span>
                      )}
                      {engineer.university && (
                        <span className="hidden sm:flex items-center gap-1 truncate">
                          <GraduationCap className="w-3 h-3 flex-shrink-0" />
                          {engineer.university}
                        </span>
                      )}
                      {engineer.country && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <MapPin className="w-3 h-3" />
                          {engineer.country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && query.length >= 2 && suggestions.length === 0 && !isLoading && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-xl">
            <div className="px-4 sm:px-6 py-5 sm:py-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-xs sm:text-sm">Aucun ingénieur agréé trouvé</p>
              <p className="text-xs text-slate-500 mt-1">Vérifiez le NNI, nom ou téléphone saisi</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected engineer details Modal */}
      <Dialog open={!!selectedEngineer} onOpenChange={(open) => !open && setSelectedEngineer(null)}>
        <DialogContent showCloseButton={false} className="max-w-6xl p-0 overflow-hidden border-0 bg-transparent shadow-none sm:rounded-3xl">
          <DialogTitle className="sr-only">Détails de l'ingénieur</DialogTitle>

          <div className="relative max-h-[85vh] overflow-y-auto">
            {/* Main Card with Glassmorphism */}
            <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">

              {/* Header - Same color as card */}
              <div className="relative h-24 sm:h-32 bg-white dark:bg-slate-900 overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEngineer(null)}
                  className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 p-2.5 rounded-full transition-all duration-300 hover:scale-110 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar - Overlapping Header */}
              <div className="relative -mt-16 sm:-mt-20 px-6 sm:px-8 flex justify-center md:justify-start">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl ring-4 ring-teal-500/20 ring-offset-2 ring-offset-white dark:ring-offset-slate-900">
                    {selectedEngineer?.profile_image_url ? (
                      <img
                        alt={`Portrait de ${selectedEngineer.full_name}`}
                        className="w-full h-full object-cover"
                        src={selectedEngineer.profile_image_url}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl font-bold text-white">
                          {selectedEngineer?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 sm:px-8 pt-4 pb-8">
                <div className="text-center md:text-left mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight inline-flex items-center gap-2 flex-wrap justify-center md:justify-start">
                    {selectedEngineer?.full_name}
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                    </svg>
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-teal-500/25">
                      <Award className="w-3.5 h-3.5" />
                      Ingénieur Agréé
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {selectedEngineer && calculateExperience(selectedEngineer.grad_year)} ans d'expérience
                    </span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                  <div className="group bg-gradient-to-br from-cyan-50 to-teal-50/50 dark:from-cyan-900/20 dark:to-teal-900/10 rounded-2xl p-3 border border-cyan-100/50 dark:border-cyan-800/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">Expérience</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{selectedEngineer && calculateExperience(selectedEngineer.grad_year)} <span className="text-xs font-medium text-slate-500">ans</span></p>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/10 rounded-2xl p-3 border border-purple-100/50 dark:border-purple-800/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform">
                        <School className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Promo</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{selectedEngineer?.grad_year}</p>
                  </div>

                  {selectedEngineer?.country && (
                    <div className="group bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/10 rounded-2xl p-3 border border-orange-100/50 dark:border-orange-800/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">Pays</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedEngineer.country}</p>
                    </div>
                  )}
                </div>

                {/* University - Full Width */}
                {selectedEngineer?.university && (
                  <div className="flex items-start gap-4 p-4 mb-6 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/5 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/20">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-md shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Université</p>
                      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {selectedEngineer.university}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details Section */}
                <div className="space-y-6">
                  {/* Diploma Only */}
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/5 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white shadow-md shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Diplôme</p>
                      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                        {selectedEngineer?.diploma}
                      </p>
                    </div>
                  </div>

                  {/* Domains */}
                  {selectedEngineer && selectedEngineer.domains.length > 0 && (
                    <div className="pt-4">
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-8 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></span>
                        Domaines d'expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEngineer.domains.map((domain, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm shadow-sm border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                          >
                            {domain === 'Bâtiment & Constructions' && <Hammer className="w-4 h-4 mr-2 text-orange-500" />}
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-900/50 px-6 sm:px-8 py-5 border-t border-slate-200/50 dark:border-slate-700/50">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Ordre Mauritanien des Ingénieurs
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
