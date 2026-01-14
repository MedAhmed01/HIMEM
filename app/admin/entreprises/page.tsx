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
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'

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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [changePasswordModal, setChangePasswordModal] = useState<{
    isOpen: boolean
    userId: string
    userName: string
  }>({
    isOpen: false,
    userId: '',
    userName: ''
  })

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

  const handleChangePassword = (entrepriseId: string, entrepriseName: string) => {
    setChangePasswordModal({
      isOpen: true,
      userId: entrepriseId,
      userName: entrepriseName
    })
  }

  const handlePasswordChangeSuccess = (message: string) => {
    setMessage({ type: 'success', text: message })
  }

  const handlePasswordChangeError = (error: string) => {
    setMessage({ type: 'error', text: error })
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Entreprises</h1>
        <p className="text-gray-500 text-sm mt-1">Gérer les entreprises inscrites</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button 
          onClick={() => setStatusFilter('')}
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </button>
        <button 
          onClick={() => setStatusFilter('en_attente')}
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl font-bold text-orange-600">{counts.en_attente}</p>
          <p className="text-sm text-gray-500 mt-1">En attente</p>
        </button>
        <button 
          onClick={() => setStatusFilter('valide')}
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl font-bold text-green-600">{counts.valide}</p>
          <p className="text-sm text-gray-500 mt-1">Validées</p>
        </button>
        <button 
          onClick={() => setStatusFilter('suspendu')}
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl font-bold text-red-600">{counts.suspendu}</p>
          <p className="text-sm text-gray-500 mt-1">Suspendues</p>
        </button>
      </div>

      {/* Filter */}
      {statusFilter && (
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Filtre: {STATUS_CONFIG[statusFilter].label}</span>
          <button onClick={() => setStatusFilter('')} className="text-blue-600 hover:underline">
            Effacer
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'} text-sm flex-1`}>
            {message.text}
          </p>
          <button 
            onClick={() => setMessage(null)}
            className={`${message.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'}`}
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {entreprises.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Aucune entreprise trouvée</p>
            </div>
          ) : (
            entreprises.map(entreprise => {
              const statusConfig = STATUS_CONFIG[entreprise.status]
              const StatusIcon = statusConfig.icon
              
              return (
                <div key={entreprise.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{entreprise.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          entreprise.status === 'valide' 
                            ? 'bg-green-100 text-green-800' 
                            : entreprise.status === 'en_attente'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{entreprise.sector}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {entreprise.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {entreprise.phone}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        NIF: {entreprise.nif} • Inscrit le {new Date(entreprise.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Change Password Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangePassword(entreprise.id, entreprise.name)}
                        className="h-9 px-3 rounded-lg border-gray-300"
                        title="Modifier le mot de passe"
                      >
                        <Key className="w-4 h-4" />
                      </Button>

                      {/* Status Action Buttons */}
                      {entreprise.status === 'en_attente' && (
                        <Button
                          size="sm"
                          onClick={() => handleValidate(entreprise.id)}
                          disabled={actionLoading === entreprise.id}
                          className="h-9 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white"
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
                          className="h-9 px-3 rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {actionLoading === entreprise.id ? '...' : 'Suspendre'}
                        </Button>
                      )}
                      {entreprise.status === 'suspendu' && (
                        <Button
                          size="sm"
                          onClick={() => handleValidate(entreprise.id)}
                          disabled={actionLoading === entreprise.id}
                          className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {actionLoading === entreprise.id ? '...' : 'Réactiver'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        onClose={() => setChangePasswordModal({ isOpen: false, userId: '', userName: '' })}
        userId={changePasswordModal.userId}
        userType="entreprise"
        userName={changePasswordModal.userName}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
      />
    </div>
  )
}
