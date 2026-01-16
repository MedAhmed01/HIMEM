'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Upload,
  FileText,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Payment {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  status: string
  reference: string
  receipt_url?: string
}

export default function CotisationPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState<string | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const res = await fetch('/api/payments')
      const data = await res.json()
      
      if (res.ok) {
        setPayments(data.payments || [])
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erreur lors du chargement de l\'historique')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MRU'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Payé
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
            <AlertCircle className="w-3 h-3 mr-1" />
            Échoué
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleReceiptUpload = async (paymentId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB')
      return
    }

    setUploadingReceipt(paymentId)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('receipt', file)
      formData.append('paymentId', paymentId)

      const res = await fetch('/api/payments/receipt', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        // Update the payment in the list
        setPayments(prev => prev.map(p => 
          p.id === paymentId ? { ...p, receipt_url: data.receiptUrl } : p
        ))
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erreur lors du téléchargement du reçu')
    } finally {
      setUploadingReceipt(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement de l'historique...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mes Cotisations</h1>
            <p className="text-slate-500">Historique de vos paiements</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Payments List */}
        {payments.length === 0 ? (
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <CardContent className="py-16 text-center">
              <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun paiement</h3>
              <p className="text-slate-500">Vous n'avez pas encore effectué de paiement</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="glass border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Cotisation annuelle
                          </h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(payment.payment_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="capitalize">{payment.payment_method}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Référence:</span>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              {payment.reference}
                            </span>
                          </div>
                        </div>
                        
                        {/* Receipt Actions */}
                        <div className="mt-4 flex gap-2">
                          {payment.receipt_url ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingReceipt(payment.receipt_url!)}
                              className="rounded-lg"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir le reçu
                            </Button>
                          ) : (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleReceiptUpload(payment.id, file)
                                }}
                                className="hidden"
                                disabled={uploadingReceipt === payment.id}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={uploadingReceipt === payment.id}
                                className="rounded-lg pointer-events-none"
                                asChild
                              >
                                <span>
                                  {uploadingReceipt === payment.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                                      Téléchargement...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Ajouter un reçu
                                    </>
                                  )}
                                </span>
                              </Button>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatAmount(payment.amount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Receipt Viewer Modal */}
        {viewingReceipt && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingReceipt(null)}
          >
            <div className="relative max-w-4xl w-full bg-white rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setViewingReceipt(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
              <div className="relative w-full h-[80vh]">
                <Image
                  src={viewingReceipt}
                  alt="Reçu de paiement"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Information</h3>
                <p className="text-slate-600 text-sm">
                  La cotisation annuelle OMIGEC est calculée en fonction de votre année de sortie. 
                  Pour toute question concernant vos paiements, contactez l'administration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
