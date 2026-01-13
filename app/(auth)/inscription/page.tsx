'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { RegistrationWizard } from '@/components/forms/RegistrationWizard'
import { ArrowLeft, CheckCircle, Zap, Sparkles } from 'lucide-react'

export default function InscriptionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegistration = async (data: any) => {
    setError(null)

    try {
      const formData = new FormData()
      formData.append('fullName', data.fullName)
      formData.append('nni', data.nni)
      formData.append('phone', data.phone)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('diplomaTitle', data.diplomaTitle)
      formData.append('university', data.university)
      formData.append('country', data.country)
      formData.append('graduationYear', data.graduationYear.toString())
      formData.append('domains', JSON.stringify(data.domains))
      formData.append('exerciseMode', data.exerciseMode)
      formData.append('parrainId', data.parrainId)
      formData.append('diplomaFile', data.diplomaFile)
      formData.append('cniFile', data.cniFile)
      formData.append('paymentReceiptFile', data.paymentReceiptFile)

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Une erreur est survenue')
        return
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/connexion')
      }, 3000)

    } catch (err) {
      console.error('Registration error:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
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
            Votre demande a été soumise avec succès.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800">
              Vos documents sont en cours de vérification. Vous recevrez un email une fois la vérification terminée.
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
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6" />
            <span className="text-blue-200 font-medium">Rejoignez l'OMIGEC</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Inscription</h1>
          <p className="text-blue-100 text-lg">
            Créez votre compte en quelques étapes simples
          </p>
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
        <RegistrationWizard onComplete={handleRegistration} />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="text-blue-600 hover:text-blue-700 font-bold">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}