'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  CreditCard, Check, X, Eye, Calendar, 
  Building2, Mail, Phone, FileText, AlertCircle,
  UserX, Trash2, Settings, Clock
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatPrice } from '@/lib/services/subscription.service'
import { SUBSCRIPTION_PLANS } from '@/lib/types/database'

// Helper function to format price if import fails
const safeFormatPrice = (amount: number): string => {
  try {
    return formatPrice(amount)
  } catch {
    return `${amount.toLocaleString('fr-FR')} MRU`
  }
}

interface PendingSubscription {
  id: string
  plan: string
  created_at: string
  starts_at: string
  expires_at: string
  payment_status: string
  entreprises: {
    id: string
    nom: string
    email: string
    telephone: string
    status: string
  }
}

interface ActiveSubscription {
  id: string
  plan: string
  starts_at: string
  expires_at: string
  is_active: boolean
  created_at: string
  entreprises: {
    id: string
    nom: string
    email: string
    telephone: string
    status: string
  }
}

export default function AdminAbonnementsEntreprisesPage() {
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([])
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // Activation dialog
  const [activationDialog, setActivationDialog] = useState<{
    isOpen: boolean
    subscription: PendingSubscription | null
  }>({ isOpen: false, subscription: null })
  const [activationData, setActivationData] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  })

  // Deactivation dialog
  const [deactivationDialog, setDeactivationDialog] = useState<{
    isOpen: boolean
    subscription: ActiveSubscription | null
  }>({ isOpen: false, subscription: null })
  const [deactivationReason, setDeactivationReason] = useState('')

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    subscription: ActiveSubscription | null
  }>({ isOpen: false, subscription: null })

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setError(null)
      
      // Fetch pending subscriptions
      const pendingResponse = await fetch('/api/admin/subscriptions/pending')
      
      if (!pendingResponse.ok) {
        const pendingData = await pendingResponse.json().catch(() => ({ error: 'Erreur de réseau' }))
        console.error('Pending subscriptions error:', {
          status: pendingResponse.status,
          statusText: pendingResponse.statusText,
          data: pendingData
        })
        throw new Error(pendingData.error || `Erreur HTTP ${pendingResponse.status}: ${pendingResponse.statusText}`)
      }

      const pendingData = await pendingResponse.json()

      // Fetch active subscriptions
      const activeResponse = await fetch('/api/admin/subscriptions/active')
      
      if (!activeResponse.ok) {
        const activeData = await activeResponse.json().catch(() => ({ error: 'Erreur de réseau' }))
        console.error('Active subscriptions error:', {
          status: activeResponse.status,
          statusText: activeResponse.statusText,
          data: activeData
        })
        throw new Error(activeData.error || `Erreur HTTP ${activeResponse.status}: ${activeResponse.statusText}`)
      }

      const activeData = await activeResponse.json()

      console.log('Subscriptions loaded:', {
        pending: pendingData.subscriptions?.length || 0,
        active: activeData.subscriptions?.length || 0
      })

      setPendingSubscriptions(pendingData.subscriptions || [])
      setActiveSubscriptions(activeData.subscriptions || [])
    } catch (err: any) {
      console.error('Fetch subscriptions error:', err)
      setError(err.message || 'Erreur lors du chargement des abonnements')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivateSubscription = async () => {
    if (!activationDialog.subscription) return

    if (!activationData.startDate || !activationData.endDate) {
      setError('Veuillez remplir les dates de début et de fin')
      return
    }

    setProcessingId(activationDialog.subscription.id)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: activationDialog.subscription.id,
          startDate: activationData.startDate,
          endDate: activationData.endDate,
          notes: activationData.notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'activation')
      }

      console.log('Subscription activated successfully')
      await fetchSubscriptions()
      setActivationDialog({ isOpen: false, subscription: null })
      setActivationData({ startDate: '', endDate: '', notes: '' })
      
      // Show success message
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successDiv.textContent = 'Abonnement activé avec succès'
      document.body.appendChild(successDiv)
      setTimeout(() => document.body.removeChild(successDiv), 3000)
      
    } catch (err: any) {
      console.error('Activation error:', err)
      setError('Erreur lors de l\'activation: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeactivateSubscription = async () => {
    if (!deactivationDialog.subscription) return

    if (!deactivationReason.trim()) {
      setError('Veuillez indiquer la raison de la désactivation')
      return
    }

    setProcessingId(deactivationDialog.subscription.id)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/subscriptions/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: deactivationDialog.subscription.id,
          reason: deactivationReason
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la désactivation')
      }

      console.log('Subscription deactivated successfully')
      await fetchSubscriptions()
      setDeactivationDialog({ isOpen: false, subscription: null })
      setDeactivationReason('')
      
      // Show success message
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successDiv.textContent = 'Abonnement désactivé avec succès'
      document.body.appendChild(successDiv)
      setTimeout(() => document.body.removeChild(successDiv), 3000)
      
    } catch (err: any) {
      console.error('Deactivation error:', err)
      setError('Erreur lors de la désactivation: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteDialog.subscription) return

    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce compte entreprise ? Cette action est irréversible.')) {
      return
    }

    setProcessingId(deleteDialog.subscription.id)
    try {
      const response = await fetch(`/api/admin/entreprises/${deleteDialog.subscription.entreprises.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Compte entreprise supprimé avec succès')
      await fetchSubscriptions()
      setDeleteDialog({ isOpen: false, subscription: null })
    } catch (err: any) {
      alert('Erreur: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectSubscription = async (subscriptionId: string) => {
    const reason = prompt('Raison du rejet :')
    if (!reason) return

    setProcessingId(subscriptionId)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/subscriptions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, reason })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du rejet')
      }

      console.log('Subscription rejected successfully')
      await fetchSubscriptions()
      
      // Show success message
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successDiv.textContent = 'Demande rejetée avec succès'
      document.body.appendChild(successDiv)
      setTimeout(() => document.body.removeChild(successDiv), 3000)
      
    } catch (err: any) {
      console.error('Rejection error:', err)
      setError('Erreur lors du rejet: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const openActivationDialog = (subscription: PendingSubscription) => {
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS].duration)
    
    setActivationData({
      startDate: today,
      endDate: endDate.toISOString().split('T')[0],
      notes: ''
    })
    setActivationDialog({ isOpen: true, subscription })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          Gestion des abonnements entreprises
        </h1>
        <p className="text-gray-600 mt-1">
          Activez manuellement les abonnements et gérez les comptes entreprises
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm underline mt-1"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Debug Info</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Pending subscriptions: {pendingSubscriptions.length}</p>
            <p>Active subscriptions: {activeSubscriptions.length}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Processing ID: {processingId || 'None'}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingSubscriptions.length}</p>
                <p className="text-sm text-gray-600">Demandes en attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeSubscriptions.length}</p>
                <p className="text-sm text-gray-600">Abonnements actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingSubscriptions.length + activeSubscriptions.length}
                </p>
                <p className="text-sm text-gray-600">Total abonnements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demandes en attente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Demandes d'activation en attente ({pendingSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingSubscriptions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune demande en attente</p>
          ) : (
            <div className="space-y-4">
              {pendingSubscriptions.map((subscription) => (
                <div key={subscription.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {subscription.entreprises.nom}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]?.name || subscription.plan}
                        </span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          {safeFormatPrice(SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]?.price || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {subscription.entreprises.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {subscription.entreprises.telephone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Demandé le {new Date(subscription.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openActivationDialog(subscription)}
                        disabled={processingId === subscription.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingId === subscription.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleRejectSubscription(subscription.id)}
                        disabled={processingId === subscription.id}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abonnements actifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Abonnements actifs ({activeSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSubscriptions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun abonnement actif</p>
          ) : (
            <div className="space-y-4">
              {activeSubscriptions.map((subscription) => {
                const daysRemaining = Math.ceil(
                  (new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                const isExpiringSoon = daysRemaining <= 7
                const isExpired = daysRemaining < 0

                return (
                  <div key={subscription.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {subscription.entreprises.nom}
                          </h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]?.name || subscription.plan}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isExpired 
                              ? 'bg-red-100 text-red-800' 
                              : isExpiringSoon 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isExpired 
                              ? 'Expiré' 
                              : isExpiringSoon 
                              ? `${daysRemaining} jours restants` 
                              : `${daysRemaining} jours restants`
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {subscription.entreprises.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Du {new Date(subscription.starts_at).toLocaleDateString('fr-FR')} au {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setDeactivationDialog({ isOpen: true, subscription })}
                          disabled={processingId === subscription.id}
                          variant="outline"
                          className="border-amber-200 text-amber-600 hover:bg-amber-50"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Désactiver
                        </Button>
                        <Button
                          onClick={() => setDeleteDialog({ isOpen: true, subscription })}
                          disabled={processingId === subscription.id}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'activation */}
      <Dialog open={activationDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setActivationDialog({ isOpen: false, subscription: null })
          setActivationData({ startDate: '', endDate: '', notes: '' })
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Activer l'abonnement</DialogTitle>
            <DialogDescription>
              Définissez les dates d'activation pour {activationDialog.subscription?.entreprises.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={activationData.startDate}
                onChange={(e) => setActivationData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={activationData.endDate}
                onChange={(e) => setActivationData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Notes administratives..."
                value={activationData.notes}
                onChange={(e) => setActivationData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActivationDialog({ isOpen: false, subscription: null })}
            >
              Annuler
            </Button>
            <Button
              onClick={handleActivateSubscription}
              disabled={processingId !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingId ? 'Activation...' : 'Activer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de désactivation */}
      <Dialog open={deactivationDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeactivationDialog({ isOpen: false, subscription: null })
          setDeactivationReason('')
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Désactiver l'abonnement</DialogTitle>
            <DialogDescription>
              Désactiver l'abonnement de {deactivationDialog.subscription?.entreprises.nom}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reason">Raison de la désactivation</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez la raison de la désactivation..."
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivationDialog({ isOpen: false, subscription: null })}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeactivateSubscription}
              disabled={processingId !== null}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {processingId ? 'Désactivation...' : 'Désactiver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog({ isOpen: false, subscription: null })
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le compte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement le compte de {deleteDialog.subscription?.entreprises.nom} ? 
              Cette action supprimera toutes les données associées et ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, subscription: null })}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={processingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingId ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}