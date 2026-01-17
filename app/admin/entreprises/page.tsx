'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Entreprise, EntrepriseStatus } from '@/lib/types/database'
import { 
  Building2, CheckCircle, XCircle, Clock, 
  Filter, Mail, Phone, AlertCircle, Key,
  CreditCard, Play, Pause, Calendar
} from 'lucide-react'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EntrepriseWithSubscription extends Entreprise {
  currentSubscription?: {
    id: string
    plan: string
    starts_at: string
    expires_at: string
    is_active: boolean
    payment_status: string
  } | null
  hasActiveSubscription: boolean
}

const STATUS_CONFIG: Record<EntrepriseStatus, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: 'amber', icon: Clock },
  valide: { label: 'Validé', color: 'green', icon: CheckCircle },
  suspendu: { label: 'Suspendu', color: 'red', icon: XCircle }
}

export default function AdminEntreprisesPage() {
  const [entreprises, setEntreprises] = useState<EntrepriseWithSubscription[]>([])
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

  // Subscription activation modal
  const [activationModal, setActivationModal] = useState<{
    isOpen: boolean
    entrepriseId: string
    entrepriseName: string
  }>({
    isOpen: false,
    entrepriseId: '',
    entrepriseName: ''
  })
  const [activationData, setActivationData] = useState({
    plan: 'business',
    duration: 30
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

  const handleActivateSubscription = async () => {
    if (!activationModal.entrepriseId) return

    setActionLoading(activationModal.entrepriseId)
    try {
      const response = await fetch(`/api/admin/entreprises/${activationModal.entrepriseId}/activate-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activationData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'activation')
      }

      setMessage({ type: 'success', text: data.message })
      await fetchEntreprises()
      setActivationModal({ isOpen: false, entrepriseId: '', entrepriseName: '' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeactivateSubscription = async (entrepriseId: string, entrepriseName: string) => {
    if (!confirm(`Désactiver l'abonnement de ${entrepriseName} ?`)) return

    setActionLoading(entrepriseId)
    try {
      const response = await fetch(`/api/admin/entreprises/${entrepriseId}/deactivate-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Désactivé manuellement par admin' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la désactivation')
      }

      setMessage({ type: 'success', text: data.message })
      await fetchEntreprises()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const openActivationModal = (entrepriseId: string, entrepriseName: string) => {
    setActivationModal({ isOpen: true, entrepriseId, entrepriseName })
    setActivationData({ plan: 'business', duration: 30 })
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Entreprises
              </h1>
              <p className="text-gray-600 mt-1">Gérer les entreprises inscrites sur la plateforme</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {counts.total} entreprises
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <button 
            onClick={() => setStatusFilter('')}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              statusFilter === '' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${
                  statusFilter === '' 
                    ? 'bg-white/20' 
                    : 'bg-blue-100'
                }`}>
                  <Building2 className={`w-5 h-5 ${
                    statusFilter === '' ? 'text-white' : 'text-blue-600'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  statusFilter === '' ? 'text-white' : 'text-gray-900'
                }`}>
                  {counts.total}
                </div>
              </div>
              <p className={`text-sm font-medium ${
                statusFilter === '' ? 'text-blue-100' : 'text-gray-600'
              }`}>
                Total
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button 
            onClick={() => setStatusFilter('en_attente')}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              statusFilter === 'en_attente' 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${
                  statusFilter === 'en_attente' 
                    ? 'bg-white/20' 
                    : 'bg-amber-100'
                }`}>
                  <Clock className={`w-5 h-5 ${
                    statusFilter === 'en_attente' ? 'text-white' : 'text-amber-600'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  statusFilter === 'en_attente' ? 'text-white' : 'text-amber-600'
                }`}>
                  {counts.en_attente}
                </div>
              </div>
              <p className={`text-sm font-medium ${
                statusFilter === 'en_attente' ? 'text-amber-100' : 'text-gray-600'
              }`}>
                En attente
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button 
            onClick={() => setStatusFilter('valide')}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              statusFilter === 'valide' 
                ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25' 
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${
                  statusFilter === 'valide' 
                    ? 'bg-white/20' 
                    : 'bg-emerald-100'
                }`}>
                  <CheckCircle className={`w-5 h-5 ${
                    statusFilter === 'valide' ? 'text-white' : 'text-emerald-600'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  statusFilter === 'valide' ? 'text-white' : 'text-emerald-600'
                }`}>
                  {counts.valide}
                </div>
              </div>
              <p className={`text-sm font-medium ${
                statusFilter === 'valide' ? 'text-emerald-100' : 'text-gray-600'
              }`}>
                Validées
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-emerald-600/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button 
            onClick={() => setStatusFilter('suspendu')}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              statusFilter === 'suspendu' 
                ? 'bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25' 
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${
                  statusFilter === 'suspendu' 
                    ? 'bg-white/20' 
                    : 'bg-red-100'
                }`}>
                  <XCircle className={`w-5 h-5 ${
                    statusFilter === 'suspendu' ? 'text-white' : 'text-red-600'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  statusFilter === 'suspendu' ? 'text-white' : 'text-red-600'
                }`}>
                  {counts.suspendu}
                </div>
              </div>
              <p className={`text-sm font-medium ${
                statusFilter === 'suspendu' ? 'text-red-100' : 'text-gray-600'
              }`}>
                Suspendues
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Active Filter Indicator */}
        {statusFilter && (
          <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">
              Filtre actif: {STATUS_CONFIG[statusFilter].label}
            </span>
            <button 
              onClick={() => setStatusFilter('')} 
              className="ml-auto px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              Effacer
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success/Error Message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
              : 'bg-red-50/80 border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className="text-sm flex-1 font-medium">{message.text}</p>
            <button 
              onClick={() => setMessage(null)}
              className={`p-1 rounded-lg transition-colors ${
                message.type === 'success' 
                  ? 'hover:bg-emerald-100 text-emerald-400 hover:text-emerald-600' 
                  : 'hover:bg-red-100 text-red-400 hover:text-red-600'
              }`}
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modern Entreprises List */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl">
          {entreprises.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune entreprise trouvée</h3>
              <p className="text-gray-500">Les entreprises inscrites apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {entreprises.map((entreprise, index) => {
                const statusConfig = STATUS_CONFIG[entreprise.status]
                const StatusIcon = statusConfig.icon
                
                return (
                  <div 
                    key={entreprise.id} 
                    className="group p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Company Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Logo/Icon */}
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-8 h-8 text-blue-600" />
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                                {entreprise.name}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  entreprise.status === 'valide' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : entreprise.status === 'en_attente'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-3 font-medium">{entreprise.sector}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <Mail className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{entreprise.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <Phone className="w-4 h-4" />
                                <span>{entreprise.phone}</span>
                              </div>
                            </div>

                            {/* Subscription Info */}
                            {entreprise.currentSubscription && (
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">
                                    {entreprise.currentSubscription.plan}
                                  </span>
                                  {entreprise.hasActiveSubscription ? (
                                    <span className="text-xs text-emerald-600 font-medium">
                                      (actif jusqu'au {new Date(entreprise.currentSubscription.expires_at).toLocaleDateString('fr-FR')})
                                    </span>
                                  ) : (
                                    <span className="text-xs text-red-600 font-medium">(inactif)</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>NIF: {entreprise.nif}</span>
                              <span>•</span>
                              <span>Inscrit le {new Date(entreprise.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        {/* Subscription Controls */}
                        {entreprise.status === 'valide' && (
                          <>
                            {entreprise.hasActiveSubscription ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeactivateSubscription(entreprise.id, entreprise.name)}
                                disabled={actionLoading === entreprise.id}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                {actionLoading === entreprise.id ? '...' : 'Désactiver'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => openActivationModal(entreprise.id, entreprise.name)}
                                disabled={actionLoading === entreprise.id}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Activer
                              </Button>
                            )}
                          </>
                        )}

                        {/* Other Action Buttons */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChangePassword(entreprise.id, entreprise.name)}
                          className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                        >
                          <Key className="w-4 h-4" />
                        </Button>

                        {/* Status Action Buttons */}
                        {entreprise.status === 'en_attente' && (
                          <Button
                            size="sm"
                            onClick={() => handleValidate(entreprise.id)}
                            disabled={actionLoading === entreprise.id}
                            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
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
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                          >
                            {actionLoading === entreprise.id ? '...' : 'Suspendre'}
                          </Button>
                        )}
                        {entreprise.status === 'suspendu' && (
                          <Button
                            size="sm"
                            onClick={() => handleValidate(entreprise.id)}
                            disabled={actionLoading === entreprise.id}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
                          >
                            {actionLoading === entreprise.id ? '...' : 'Réactiver'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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

      {/* Subscription Activation Modal */}
      <Dialog open={activationModal.isOpen} onOpenChange={(open) => {
        if (!open) {
          setActivationModal({ isOpen: false, entrepriseId: '', entrepriseName: '' })
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Activer un abonnement
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Configurer l'abonnement pour <span className="font-semibold text-gray-900">{activationModal.entrepriseName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="plan" className="text-sm font-semibold text-gray-700 mb-3 block">Plan d'abonnement</Label>
              <Select value={activationData.plan} onValueChange={(value) => 
                setActivationData(prev => ({ ...prev, plan: value }))
              }>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-xl">
                  <SelectItem value="starter" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div>
                        <div className="font-medium">Starter</div>
                        <div className="text-xs text-gray-500">3 offres • 5000 MRU</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="business" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <div>
                        <div className="font-medium">Business</div>
                        <div className="text-xs text-gray-500">10 offres • 12000 MRU</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="premium" className="rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <div>
                        <div className="font-medium">Premium</div>
                        <div className="text-xs text-gray-500">Illimité • 25000 MRU</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm font-semibold text-gray-700 mb-3 block">Durée (jours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={activationData.duration}
                onChange={(e) => setActivationData(prev => ({ 
                  ...prev, 
                  duration: parseInt(e.target.value) || 30 
                }))}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3 text-sm text-blue-800">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Période d'activation</div>
                  <div className="text-blue-600">
                    Du {new Date().toLocaleDateString('fr-FR')} au{' '}
                    {new Date(Date.now() + activationData.duration * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button
              variant="outline"
              onClick={() => setActivationModal({ isOpen: false, entrepriseId: '', entrepriseName: '' })}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={handleActivateSubscription}
              disabled={actionLoading !== null}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25"
            >
              {actionLoading ? 'Activation...' : 'Activer l\'abonnement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
