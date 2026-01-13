'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Check, X, Search, Filter, Sparkles, Calendar, Mail, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Engineer {
  id: string
  nni: string
  full_name: string
  email: string
  phone: string
  diploma: string
  status: string
  subscription_expiry: string | null
  created_at: string
}

export default function IngenieursPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadEngineers = async () => {
    const res = await fetch('/api/admin/engineers')
    const data = await res.json()
    if (data.engineers) {
      setEngineers(data.engineers)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadEngineers()
  }, [])

  const handleSubscription = async (engineerId: string, action: 'activate' | 'deactivate') => {
    const res = await fetch('/api/admin/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engineerId, action })
    })
    
    if (res.ok) {
      loadEngineers()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm">
            Validé
          </Badge>
        )
      case 'pending_docs':
        return (
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-sm">
            Documents en attente
          </Badge>
        )
      case 'pending_reference':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-sm">
            Parrainage en attente
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-sm">
            Rejeté
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isSubscriptionActive = (expiry: string | null) => {
    if (!expiry) return false
    return new Date(expiry) > new Date()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredEngineers = engineers.filter(eng => 
    eng.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eng.nni.includes(searchQuery) ||
    eng.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Ingénieurs</h1>
            <p className="text-slate-500">Liste de tous les ingénieurs inscrits</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Engineers List */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Tous les ingénieurs ({filteredEngineers.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEngineers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Aucun ingénieur trouvé</p>
              <p className="text-slate-400 mt-2">
                {searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Aucun ingénieur inscrit pour le moment'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEngineers.map((engineer) => (
                <div
                  key={engineer.id}
                  className="rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white font-bold text-xl">{engineer.full_name.charAt(0)}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-900">{engineer.full_name}</h3>
                          {getStatusBadge(engineer.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="font-medium text-slate-700">NNI:</span>
                            {engineer.nni}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{engineer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Phone className="w-4 h-4" />
                            {engineer.phone}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="w-4 h-4" />
                            Exp: {formatDate(engineer.subscription_expiry)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Subscription Status */}
                      {isSubscriptionActive(engineer.subscription_expiry) ? (
                        <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 px-3 py-1.5">
                          <Check className="w-3.5 h-3.5 mr-1" />
                          À jour
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-0 px-3 py-1.5">
                          <X className="w-3.5 h-3.5 mr-1" />
                          Non payé
                        </Badge>
                      )}

                      {/* Action Button */}
                      {!isSubscriptionActive(engineer.subscription_expiry) ? (
                        <Button
                          size="sm"
                          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-md"
                          onClick={() => handleSubscription(engineer.id, 'activate')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Activer (1 an)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleSubscription(engineer.id, 'deactivate')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Désactiver
                        </Button>
                      )}
                    </div>
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
