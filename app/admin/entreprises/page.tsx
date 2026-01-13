'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Entreprise, EntrepriseStatus } from '@/lib/types/database'
import { 
  Building2, CheckCircle, XCircle, Clock, 
  Filter, Mail, Phone, AlertCircle, Key
} from 'lucide-react'

const STATUS_CONFIG: Record<EntrepriseStatus, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: 'amber', icon: Clock },
  valide: { label: 'Validé', color: 'green', icon: CheckCircle },
  suspendu: { label: 'Suspendu', color: 'red', icon: XCircle }
}

export default function AdminEntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<EntrepriseStatus | ''>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchEntreprises()
  }, [statusFilter])

  const fetchEntreprises = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      
      const response = await fetch(`/api/admin/entreprises?${params}`)
      const data = await response.json()
      
      console.log('Entreprises data:', data)
      
      if (!response.ok) throw new Error(data.error)
      setEntreprises(data.entreprises || [])
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/entreprises/${id}/validate`, { method: 'POST' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await fetchEntreprises()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspendre cette entreprise ? Toutes ses offres seront désactivées.')) return
    
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/entreprises/${id}/suspend`, { method: 'POST' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await fetchEntreprises()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (entrepriseId: string) => {
    if (!confirm('Envoyer un email de réinitialisation de mot de passe à cette entreprise ?')) {
      return
    }

    setResetLoading(entrepriseId)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: entrepriseId, userType: 'entreprise' })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'email' })
    } finally {
      setResetLoading(null)
    }
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const counts = {
    total: entreprises.length,
    en_attente: entreprises.filter(e => e.status === 'en_attente').length,
    valide: entreprises.filter(e => e.status === 'valide').length,
    suspendu: entreprises.filter(e => e.status === 'suspendu').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{counts.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('en_attente')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{counts.en_attente}</p>
            <p className="text-sm text-gray-500">En attente</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('valide')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{counts.valide}</p>
            <p className="text-sm text-gray-500">Validées</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('suspendu')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{counts.suspendu}</p>
            <p className="text-sm text-gray-500">Suspendues</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      {statusFilter && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filtre: {STATUS_CONFIG[statusFilter].label}</span>
          <button onClick={() => setStatusFilter('')} className="text-blue-600 text-sm hover:underline">
            Effacer
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          message.type === 'success' 
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            message.type === 'success'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
              : 'bg-gradient-to-br from-red-500 to-pink-500'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
          </div>
          <p className={`${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'} font-medium`}>
            {message.text}
          </p>
          <button 
            onClick={() => setMessage(null)}
            className={`ml-auto ${message.type === 'success' ? 'text-emerald-400 hover:text-emerald-600' : 'text-red-400 hover:text-red-600'} text-xl`}
          >
            ×
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {entreprises.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune entreprise trouvée</p>
            </CardContent>
          </Card>
        ) : (
          entreprises.map(entreprise => {
            const statusConfig = STATUS_CONFIG[entreprise.status]
            const StatusIcon = statusConfig.icon
            
            return (
              <Card key={entreprise.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{entreprise.name}</h3>
                          <Badge variant={entreprise.status === 'valide' ? 'default' : 'secondary'}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{entreprise.sector}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {entreprise.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {entreprise.phone}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          NIF: {entreprise.nif} • Inscrit le {new Date(entreprise.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reset Password Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetPassword(entreprise.id)}
                        disabled={resetLoading === entreprise.id}
                        className="text-orange-600 hover:bg-orange-50 border-orange-200"
                        title="Réinitialiser le mot de passe"
                      >
                        {resetLoading === entreprise.id ? (
                          <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Key className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Status Action Buttons */}
                      {entreprise.status === 'en_attente' && (
                        <Button
                          size="sm"
                          onClick={() => handleValidate(entreprise.id)}
                          disabled={actionLoading === entreprise.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === entreprise.id ? '...' : 'Valider'}
                        </Button>
                      )}
                      {entreprise.status === 'valide' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspend(entreprise.id)}
                          disabled={actionLoading === entreprise.id}
                          className="text-red-600 hover:bg-red-50"
                        >
                          {actionLoading === entreprise.id ? '...' : 'Suspendre'}
                        </Button>
                      )}
                      {entreprise.status === 'suspendu' && (
                        <Button
                          size="sm"
                          onClick={() => handleValidate(entreprise.id)}
                          disabled={actionLoading === entreprise.id}
                        >
                          {actionLoading === entreprise.id ? '...' : 'Réactiver'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
