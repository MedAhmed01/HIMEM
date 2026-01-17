'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/types/database'
import { formatPrice } from '@/lib/services/subscription.service'
import { 
  ArrowLeft, Check, Crown, Briefcase, Rocket, 
  Calendar, FileText, Zap, AlertCircle 
} from 'lucide-react'

interface SubscriptionInfo {
  hasActiveSubscription: boolean
  subscription: {
    plan: { key: string; name: string; price: number; maxOffers: number }
    remainingQuota: number
    daysRemaining: number
    usedQuota: number
  } | null
  availablePlans: Array<{
    key: string
    name: string
    price: number
    maxOffers: number
    duration: number
  }>
}

const PLAN_CONFIG = {
  starter: {
    icon: Briefcase,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    checkBg: 'bg-blue-100',
    checkColor: 'text-blue-600'
  },
  business: {
    icon: Rocket,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    checkBg: 'bg-purple-100',
    checkColor: 'text-purple-600'
  },
  premium: {
    icon: Crown,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    checkBg: 'bg-amber-100',
    checkColor: 'text-amber-600'
  }
}

export default function AbonnementPage() {
  const router = useRouter()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

  useEffect(() => {
    fetchSubscriptionInfo()
  }, [])

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/entreprises/subscriptions')
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/connexion?type=entreprise')
          return
        }
        throw new Error(data.error)
      }
      
      setSubscriptionInfo(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setError(null)
  }

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return

    setIsSubscribing(selectedPlan)
    setError(null)

    try {
      let receiptUrl = null

      // Upload du reçu si fourni
      if (receiptFile) {
        setUploadingReceipt(true)
        
        console.log('Uploading receipt:', {
          name: receiptFile.name,
          size: receiptFile.size,
          type: receiptFile.type
        })
        
        const formData = new FormData()
        formData.append('file', receiptFile)
        formData.append('type', 'subscription_receipt')

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include' // Important pour passer les cookies de session
        })

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json()
          console.error('Upload error:', errorData)
          throw new Error(errorData.error || 'Erreur lors de l\'upload du reçu')
        }

        const uploadData = await uploadRes.json()
        console.log('Upload success:', uploadData)
        receiptUrl = uploadData.url
        setUploadingReceipt(false)
      }

      // Créer l'abonnement
      const response = await fetch('/api/entreprises/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: selectedPlan,
          receiptUrl 
        })
      })

      const data = await response.json()

      console.log('Subscription creation response:', data)

      if (!response.ok) {
        throw new Error(data.error)
      }

      // Afficher un message de succès
      alert(data.message || 'Demande d\'abonnement créée avec succès !')

      // Rafraîchir les infos
      await fetchSubscriptionInfo()
      setSelectedPlan(null)
      setReceiptFile(null)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubscribing(null)
      setUploadingReceipt(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentPlan = subscriptionInfo?.subscription?.plan.key

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/entreprise/tableau-de-bord" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Choisissez votre forfait</h1>
          <p className="text-blue-100 text-lg">
            Publiez vos offres d'emploi et recrutez les meilleurs ingénieurs
          </p>
        </div>
      </div>

      {/* Current Subscription Info */}
      {subscriptionInfo?.hasActiveSubscription && subscriptionInfo.subscription && (
        <div className="max-w-6xl mx-auto px-4 -mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900">
                Abonnement {subscriptionInfo.subscription.plan.name} actif
              </p>
              <p className="text-green-700 text-sm">
                {subscriptionInfo.subscription.daysRemaining} jours restants • 
                {subscriptionInfo.subscription.remainingQuota} offres disponibles
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const config = PLAN_CONFIG[key as keyof typeof PLAN_CONFIG]
            const Icon = config.icon
            const isCurrentPlan = currentPlan === key
            const isBusiness = key === 'business'

            return (
              <Card 
                key={key} 
                className={`relative overflow-hidden bg-white ${
                  isBusiness ? 'border-2 border-purple-500 shadow-xl' : 'border border-gray-200'
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isBusiness && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAIRE
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                    ACTUEL
                  </div>
                )}
                
                <CardHeader className="text-center pb-2 pt-8">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${config.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                    <span className="text-gray-500">/mois</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${config.checkBg} flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-3 h-3 ${config.checkColor}`} />
                      </div>
                      <span className="text-gray-700">
                        {plan.maxOffers === Infinity ? 'Offres illimitées' : `${plan.maxOffers} offres d'emploi`}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${config.checkBg} flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-3 h-3 ${config.checkColor}`} />
                      </div>
                      <span className="text-gray-700">Validité {plan.duration} jours</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${config.checkBg} flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-3 h-3 ${config.checkColor}`} />
                      </div>
                      <span className="text-gray-700">Accès aux statistiques</span>
                    </li>
                    {key === 'premium' && (
                      <li className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-3 h-3 text-amber-600" />
                        </div>
                        <span className="text-gray-700">Mise en avant prioritaire</span>
                      </li>
                    )}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(key as SubscriptionPlan)}
                    disabled={isSubscribing !== null}
                    className={`w-full h-12 rounded-xl text-white ${
                      isBusiness 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : isCurrentPlan
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isCurrentPlan ? 'Renouveler' : 'Souscrire'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#139a9d]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-[#139a9d]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#139a9d] mb-2">Comment ça marche ?</h3>
              <ul className="text-[#139a9d]/80 space-y-1 text-sm">
                <li>• Choisissez le forfait adapté à vos besoins</li>
                <li>• Effectuez le paiement et joignez le reçu</li>
                <li>• Notre équipe vérifie votre paiement</li>
                <li>• Une fois validé, publiez vos offres d'emploi immédiatement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Finaliser l'abonnement {SUBSCRIPTION_PLANS[selectedPlan as SubscriptionPlan].name}
            </h3>
            
            <div className="space-y-4">
              {/* Montant */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700 mb-1">Montant à payer</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatPrice(SUBSCRIPTION_PLANS[selectedPlan as SubscriptionPlan].price)}
                </p>
              </div>

              {/* Instructions de paiement */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900 mb-2">Instructions de paiement :</p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Effectuez le virement bancaire</li>
                  <li>Conservez le reçu de paiement</li>
                  <li>Joignez le reçu ci-dessous (optionnel)</li>
                  <li>Notre équipe validera votre abonnement</li>
                </ol>
              </div>

              {/* Upload du reçu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reçu de paiement (optionnel)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {receiptFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {receiptFile.name}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setSelectedPlan(null)
                    setReceiptFile(null)
                    setError(null)
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubscribing !== null || uploadingReceipt}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmSubscription}
                  disabled={isSubscribing !== null || uploadingReceipt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {uploadingReceipt ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Upload...
                    </div>
                  ) : isSubscribing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Traitement...
                    </div>
                  ) : (
                    'Confirmer'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
