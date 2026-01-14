'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CreditCard, Check, X, Eye, Calendar, 
  Building2, Mail, Phone, FileText, AlertCircle 
} from 'lucide-react'
import { formatPrice } from '@/lib/services/subscription.service'
import { SUBSCRIPTION_PLANS } from '@/lib/types/database'

interface PendingSubscription {
  id: string
  plan: string
  receipt_url: string | null
  created_at: string
  starts_at: string
  expires_at: string
  payment_status: string
  entreprises: {
    id: string
    nom: string
    email: string
    telephone: string
  }
}

export default function AdminAbonnementsPage() {
  const [subscriptions, setSubscriptions] = useState<PendingSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<PendingSubscription | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchPendingSubscriptions()
  }, [])

  const fetchPendingSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions/pending')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setSubscriptions(data.subscriptions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (subscriptionId: string) => {
    if (!confirm('Confirmer la validation de cet abonnement ?')) return

    setProcessingId(subscriptionId)
    try {
      const response = await fetch('/api/admin/subscriptions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId,
          notes: adminNotes 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      await fetchPendingSubscriptions()
      setSelectedSub(null)
      setAdminNotes('')
    } catch (err: any) {
      alert('Erreur: ' + err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (subscriptionId: string) => {
    const reason = prompt('Raison du rejet :')
    if (!reason) return

    setProcessingId(subscriptionId)
    try {
      const response = await fetch('/api/admin/subscriptions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId,
          reason 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      await fetchPendingSubscriptions()
      setSelectedSub(null)
    } catch (err: any) {
      alert('Erreur: ' + err.message)
    } finally {
      setProcessingId(null)
    }
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
          <CreditCard className="w-6 h-6 text-blue-600" />
          Gestion des abonnements
        </h1>
        <p className="text-gray-600 mt-1">
          Validez ou rejetez les demandes d'abonnement des entreprises
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
                <p className="text-gray-500 text-sm">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des abonnements */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun abonnement en attente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {subscriptions.map((sub) => {
            const plan = SUBSCRIPTION_PLANS[sub.plan as keyof typeof SUBSCRIPTION_PLANS]
            
            return (
              <Card key={sub.id} className="border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{sub.entreprises.nom}</h3>
                          <p className="text-sm text-gray-500">
                            Demande le {new Date(sub.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{sub.entreprises.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{sub.entreprises.telephone}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Plan:</span>
                            <span className="font-semibold text-gray-900">{plan.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Montant:</span>
                            <span className="font-semibold text-blue-600">
                              {formatPrice(plan.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {sub.receipt_url && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              Reçu de paiement fourni
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {sub.receipt_url && (
                        <Button
                          onClick={() => window.open(sub.receipt_url!, '_blank')}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Voir reçu
                        </Button>
                      )}
                      <Button
                        onClick={() => handleApprove(sub.id)}
                        disabled={processingId === sub.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Valider
                      </Button>
                      <Button
                        onClick={() => handleReject(sub.id)}
                        disabled={processingId === sub.id}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
