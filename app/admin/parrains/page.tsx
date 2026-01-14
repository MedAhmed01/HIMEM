'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCheck, UserPlus, UserMinus, Mail, Calendar } from 'lucide-react'

interface Engineer {
  id: string
  full_name: string
  nni: string
  email: string
  grad_year: number
}

interface Reference {
  id: string
  engineer_id: string
  added_at: string
  engineer: Engineer
}

export default function ParrainsPage() {
  const [references, setReferences] = useState<Reference[]>([])
  const [availableEngineers, setAvailableEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const res = await fetch('/api/admin/parrains')
    const data = await res.json()
    if (data.references) setReferences(data.references)
    if (data.availableEngineers) setAvailableEngineers(data.availableEngineers)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAction = async (action: 'add' | 'remove', id: string) => {
    const res = await fetch('/api/admin/parrains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id })
    })
    if (res.ok) loadData()
  }

  const calculateExperience = (gradYear: number) => {
    return new Date().getFullYear() - gradYear
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Parrains</h1>
        <p className="text-gray-500 text-sm mt-1">Gérer les ingénieurs référents</p>
      </div>

      {/* Current Parrains */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Parrains Actuels</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {references.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Aucun parrain</p>
              <p className="text-gray-500 text-sm mt-1">Ajoutez des ingénieurs comme parrains</p>
            </div>
          ) : (
            references.map((ref) => (
              <div
                key={ref.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {ref.engineer.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{ref.engineer.full_name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Parrain
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>NNI: {ref.engineer.nni}</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {ref.engineer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {calculateExperience(ref.engineer.grad_year)} ans d'expérience
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-lg border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                    onClick={() => handleAction('remove', ref.id)}
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Retirer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Engineers */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ingénieurs Disponibles</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {availableEngineers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Aucun ingénieur disponible</p>
              <p className="text-gray-500 text-sm mt-1">Tous les ingénieurs éligibles sont déjà parrains</p>
            </div>
          ) : (
            availableEngineers.map((engineer) => (
              <div
                key={engineer.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {engineer.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{engineer.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>NNI: {engineer.nni}</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {engineer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {calculateExperience(engineer.grad_year)} ans d'expérience
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                    onClick={() => handleAction('add', engineer.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
