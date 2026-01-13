'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCheck, UserPlus, UserMinus, Users, Sparkles, Mail, Calendar, Award } from 'lucide-react'

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateExperience = (gradYear: number) => {
    return new Date().getFullYear() - gradYear
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Gestion des Parrains</h1>
            <p className="text-slate-500">Gérez les ingénieurs référents pour les nouvelles inscriptions</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Parrains actifs</p>
                <p className="text-4xl font-bold text-slate-900">{references.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Ingénieurs disponibles</p>
                <p className="text-4xl font-bold text-slate-900">{availableEngineers.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Parrains */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <Award className="w-5 h-5 text-white" />
            </div>
            Parrains Actuels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {references.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Aucun parrain enregistré</p>
              <p className="text-slate-400 mt-2">Ajoutez des ingénieurs comme parrains ci-dessous</p>
            </div>
          ) : (
            <div className="space-y-4">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">{ref.engineer.full_name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-slate-900">{ref.engineer.full_name}</h3>
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm">
                            <Award className="w-3 h-3 mr-1" />
                            Parrain
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">NNI:</span> {ref.engineer.nni}
                          </span>
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
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => handleAction('remove', ref.id)}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Retirer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Engineers */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            Ingénieurs Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableEngineers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Aucun ingénieur disponible</p>
              <p className="text-slate-400 mt-2">Tous les ingénieurs éligibles sont déjà parrains</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableEngineers.map((engineer) => (
                <div
                  key={engineer.id}
                  className="rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xl">{engineer.full_name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{engineer.full_name}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">NNI:</span> {engineer.nni}
                          </span>
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
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 shadow-lg shadow-indigo-500/30"
                      onClick={() => handleAction('add', engineer.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
