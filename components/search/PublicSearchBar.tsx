'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Engineer {
  nni: string
  full_name: string
  diploma: string
  grad_year: number
  domains: string[]
  exercise_mode: string
}

interface SearchResponse {
  found: boolean
  status: string
  message: string
  engineers: Engineer[]
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par NNI ou nom..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedEngineer(null)
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="pl-10 pr-10 h-12 text-lg"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {suggestions.map((engineer, index) => (
              <button
                key={index}
                onClick={() => handleSelect(engineer)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{engineer.full_name}</p>
                    <p className="text-sm text-gray-500">NNI: {engineer.nni}</p>
                  </div>
                  <Badge className="bg-green-600">Agréé</Badge>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && query.length >= 2 && suggestions.length === 0 && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
            <div className="px-4 py-3 text-center text-gray-500">
              Aucun ingénieur agréé trouvé
            </div>
          </div>
        )}
      </div>

      {/* Selected engineer details */}
      {selectedEngineer && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-green-800">{selectedEngineer.full_name}</h3>
                <Badge className="bg-green-600">Agréé</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">NNI:</span>{' '}
                  <span className="text-gray-900">{selectedEngineer.nni}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Diplôme:</span>{' '}
                  <span className="text-gray-900">{selectedEngineer.diploma}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Année d'obtention:</span>{' '}
                  <span className="text-gray-900">{selectedEngineer.grad_year}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Mode d'exercice:</span>{' '}
                  <span className="text-gray-900">{selectedEngineer.exercise_mode}</span>
                </div>
              </div>

              {selectedEngineer.domains.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700 text-sm">Domaines:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEngineer.domains.map((domain, i) => (
                      <Badge key={i} variant="outline" className="bg-white">
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
