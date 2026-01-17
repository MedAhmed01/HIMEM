'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, GraduationCap, MapPin, Building2, Calendar, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
    <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4">
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

      {/* Selected engineer details */}
      {selectedEngineer && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Header with Avatar */}
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-white shadow-md flex-shrink-0 ring-2 ring-slate-100">
                  {selectedEngineer.profile_image_url && (
                    <AvatarImage 
                      src={selectedEngineer.profile_image_url} 
                      alt={selectedEngineer.full_name}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-base sm:text-lg md:text-xl font-bold">
                    {selectedEngineer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-tight">{selectedEngineer.full_name}</h3>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm px-2 sm:px-3 py-0.5 sm:py-1 flex-shrink-0 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Ingénieur </span>Agréé
                    </Badge>
                  </div>

                  {/* Compact Stats */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div className="bg-[#139a9d]/10 rounded-md sm:rounded-lg p-1.5 sm:p-2 border border-[#139a9d]/20">
                      <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#139a9d]" />
                        <span className="text-xs text-slate-600">Expérience</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{calculateExperience(selectedEngineer.grad_year)} ans</p>
                    </div>

                    <div className="bg-purple-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 border border-purple-100">
                      <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                        <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600" />
                        <span className="text-xs text-slate-600">Année</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{selectedEngineer.grad_year}</p>
                    </div>

                    {selectedEngineer.university && (
                      <div className="bg-emerald-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 border border-emerald-100 col-span-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                          <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                          <span className="text-xs text-slate-600">Université</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">{selectedEngineer.university}</p>
                      </div>
                    )}

                    {selectedEngineer.country && (
                      <div className="bg-orange-50 rounded-md sm:rounded-lg p-1.5 sm:p-2 border border-orange-100 col-span-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600" />
                          <span className="text-xs text-slate-600">Pays</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">{selectedEngineer.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-600">Diplôme</span>
                  <p className="text-xs sm:text-sm text-slate-900 mt-0.5">{selectedEngineer.diploma}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-600">Mode d'exercice</span>
                  <p className="text-xs sm:text-sm text-slate-900 mt-0.5">{selectedEngineer.exercise_mode}</p>
                </div>
              </div>

              {/* Domains */}
              {selectedEngineer.domains.length > 0 && (
                <div className="pt-2 sm:pt-3 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5 sm:mb-2">Domaines d'expertise</span>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {selectedEngineer.domains.map((domain, i) => (
                      <Badge 
                        key={i} 
                        className={`bg-gradient-to-r ${getDomainColor(domain)} text-white border-0 text-xs px-2 sm:px-3 py-0.5 sm:py-1`}
                      >
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
