'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { EntrepriseRegistrationForm } from '@/components/forms/EntrepriseRegistrationForm'
import { ArrowLeft, CheckCircle, Building2, Briefcase, Users } from 'lucide-react'

export default function InscriptionEntreprisePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegistration = async (data: any) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/entreprises/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Une erreur est survenue')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/connexion?type=entreprise')
      }, 3000)

    } catch (err) {
      console.error('Registration error:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Inscription Réussie!</h1>
          <p className="text-gray-600 text-lg mb-6">
            Votre demande d'inscription a été soumise avec succès.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800">
              Votre compte est en attente de validation par notre équipe. 
              Vous recevrez un email une fois votre compte activé.
            </p>
          </div>
          <p className="text-gray-500">Redirection vers la connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>

      {/* Title Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 className="w-6 h-6" />
            <span className="text-blue-200 font-medium">Espace Entreprise</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Inscription Entreprise</h1>
          <p className="text-blue-100 text-lg">
            Recrutez les meilleurs ingénieurs de Mauritanie
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">+500 Ingénieurs</p>
              <p className="text-sm text-gray-500">Profils qualifiés</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Publication facile</p>
              <p className="text-sm text-gray-500">Offres en quelques clics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Visibilité</p>
              <p className="text-sm text-gray-500">Auprès des experts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">!</span>
            </div>
            <div>
              <p className="font-bold text-red-800">Erreur</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <EntrepriseRegistrationForm onSubmit={handleRegistration} isLoading={isLoading} />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <p className="text-gray-600">
            Déjà inscrit ?{' '}
            <Link href="/connexion?type=entreprise" className="text-blue-600 hover:text-blue-700 font-bold">
              Connectez-vous
            </Link>
          </p>
          <p className="text-gray-500 text-sm">
            Vous êtes ingénieur ?{' '}
            <Link href="/inscription" className="text-blue-600 hover:text-blue-700">
              Inscrivez-vous ici
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
