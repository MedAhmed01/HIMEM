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
  Calendar, FileText, Zap, AlertCircle, Building2, Clock
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
  const [entrepriseProfile, setEntrepriseProfile] = useState<any>(null)

  useEffect(() => {
    fetchEntrepriseProfile()
  }, [])

  const fetchEntrepriseProfile = async () => {
    try {
      const response = await fetch('/api/entreprises/profile')
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/connexion?type=entreprise')
          return
        }
        throw new Error(data.error)
      }
      
      setEntrepriseProfile(data)
      
      if (data.hasEntreprise) {
        await fetchSubscriptionInfo()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleRequestSubscription = async (plan: SubscriptionPlan) => {
    setIsSubscribing(plan)
    setError(null)

    try {
      const response = await fetch('/api/entreprises/subscriptions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.action === 'register') {
          // User needs to register as enterprise first
          if (confirm('Vous devez d\'abord vous inscrire en tant qu\'entreprise. Voulez-vous être redirigé vers la page d\'inscription ?')) {
            window.location.href = '/inscription-entreprise'
            return
          }
        }
        throw new Error(data.error)
      }

      alert('Demande d\'abonnement envoyée avec succès. L\'administrateur activera votre abonnement sous peu.')
      await fetchSubscriptionInfo()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubscribing(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If user doesn't have an enterprise account
  if (!entrepriseProfile?.hasEntreprise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compte Entreprise Requis</h1>
          <p className="text-gray-600 text-lg mb-8">
            Pour accéder aux abonnements, vous devez d'abord créer un compte entreprise.
          </p>
          <div className="space-y-4">
            <Link 
              href="/inscription-entreprise"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Building2 className="w-5 h-5" />
              Créer un compte entreprise
            </Link>
            <p className="text-gray-500 text-sm">
              Déjà inscrit ? <Link href="/connexion?type=entreprise" className="text-blue-600 hover:text-blue-700">Connectez-vous</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If enterprise account is not validated
  if (entrepriseProfile.entreprise?.status !== 'valide') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compte en Attente de Validation</h1>
          <p className="text-gray-600 text-lg mb-4">
            Votre compte entreprise <strong>{entrepriseProfile.entreprise?.name}</strong> est en cours de validation.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <p className="text-amber-800">
              Notre équipe examine votre demande. Vous pourrez accéder aux abonnements une fois votre compte validé.
            </p>
          </div>
          <p className="text-gray-500">
            Statut actuel: <span className="font-medium text-amber-600">{entrepriseProfile.entreprise?.status}</span>
          </p>
        </div>
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
                    onClick={() => handleRequestSubscription(key as SubscriptionPlan)}
                    disabled={isSubscribing !== null}
                    className={`w-full h-12 rounded-xl text-white ${
                      isBusiness 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : isCurrentPlan
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubscribing === key ? 'Demande en cours...' : isCurrentPlan ? 'Renouveler' : 'Demander l\'activation'}
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
                <li>• Envoyez une demande d'activation à l'administrateur</li>
                <li>• L'administrateur activera manuellement votre abonnement</li>
                <li>• Une fois activé, publiez vos offres d'emploi immédiatement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
