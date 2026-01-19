'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CountrySelect } from '@/components/ui/country-select'
import type { Domain, ExerciseMode } from '@/lib/types/database'

interface Parrain {
  id: string
  full_name: string
  nni: string
}

interface RegistrationData {
  fullName: string
  nni: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  diplomaTitle: string
  university: string
  country: string
  graduationYear: number | string
  domains: Domain[]
  exerciseMode: ExerciseMode | ''
  diplomaFile: File | null
  cniFile: File | null
  paymentReceiptFile: File | null
  parrainId: string
}

const DOMAINS = [
  {
    value: 'infrastructure_transport' as Domain,
    label: 'Infrastructure de transport',
    description: 'Routes, ponts, tunnels, voies ferrées'
  },
  {
    value: 'batiment_constructions' as Domain,
    label: 'Bâtiment et constructions diverses',
    description: 'Bâtiments résidentiels, commerciaux, industriels'
  },
  {
    value: 'hydraulique_environnement' as Domain,
    label: 'Hydraulique et Environnement',
    description: 'Barrages, réseaux d\'eau, assainissement'
  }
]

const EXERCISE_MODES = [
  {
    value: 'personne_physique' as ExerciseMode,
    label: 'Personne Physique',
    description: 'Exercice individuel'
  },
  {
    value: 'personne_morale' as ExerciseMode,
    label: 'Personne Morale (Bureau d\'étude)',
    description: 'Cabinet ou bureau d\'études'
  },
  {
    value: 'employe_public' as ExerciseMode,
    label: 'Employé (Secteur Public)',
    description: 'Fonctionnaire ou agent public'
  },
  {
    value: 'employe_prive' as ExerciseMode,
    label: 'Employé (Secteur Privé)',
    description: 'Salarié d\'entreprise privée'
  }
]

export default function InscriptionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [parrains, setParrains] = useState<Parrain[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [data, setData] = useState<RegistrationData>({
    fullName: '',
    nni: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    diplomaTitle: '',
    university: '',
    country: '',
    graduationYear: '',
    domains: [],
    exerciseMode: '',
    diplomaFile: null,
    cniFile: null,
    paymentReceiptFile: null,
    parrainId: ''
  })

  useEffect(() => {
    fetch('/api/parrains')
      .then(res => res.json())
      .then(data => setParrains(data.parrains || []))
      .catch(console.error)
  }, [])

  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleDomainToggle = (domain: Domain, checked: boolean) => {
    const newDomains = checked
      ? [...data.domains, domain]
      : data.domains.filter(d => d !== domain)
    handleChange('domains', newDomains)
  }

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Seuls les fichiers PDF sont acceptés'
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return 'Le fichier ne doit pas dépasser 5 MB'
    }
    return null
  }

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (!error) {
        handleChange(field, file)
      }
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          data.fullName.trim() &&
          data.nni.trim() &&
          data.phone.trim() &&
          data.email.trim() &&
          data.password.length >= 8 &&
          data.password === data.confirmPassword
        )
      case 2:
        return !!(
          data.diplomaTitle.trim() &&
          data.university.trim() &&
          data.country &&
          data.graduationYear &&
          !isNaN(Number(data.graduationYear))
        )
      case 3:
        return data.domains.length > 0 && data.exerciseMode !== ''
      case 4:
        return !!(data.diplomaFile && data.cniFile && data.paymentReceiptFile && data.parrainId)
      default:
        return false
    }
  }

  const handleRegistration = async () => {
    setError(null)
    setIsSubmitting(true)

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
      formData.append('diplomaFile', data.diplomaFile!)
      formData.append('cniFile', data.cniFile!)
      formData.append('paymentReceiptFile', data.paymentReceiptFile!)

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
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
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

  const currentYear = new Date().getFullYear()

  return (
    <div className="font-display bg-gray-50 text-[#121616] min-h-screen flex flex-col">
      {/* Header */}
      <header className="pattern-bg p-6 lg:p-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <span className="material-symbols-outlined text-3xl">engineering</span>
            <span className="text-lg font-bold tracking-widest uppercase">Omigec</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-2xl lg:text-3xl font-display font-bold leading-tight">
              Créez votre profil <span className="italic font-light opacity-90">professionnel</span>
            </h1>
            <p className="text-white/70 text-sm font-light mt-1 hidden sm:block">
              Rejoignez l'élite de l'ingénierie.
            </p>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 mt-6">
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

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="flex flex-col">
            
            {/* Step 1: Personal Information */}
            <div className="border-b border-gray-100">
              <input 
                checked={currentStep === 1} 
                className="hidden peer" 
                id="step1" 
                name="step-accordion" 
                type="radio"
                onChange={() => setCurrentStep(1)}
              />
              <label 
                className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-gray-50/50 transition-colors" 
                htmlFor="step1"
              >
                <div className="flex items-center gap-4">
                  <span className={`step-number w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                    currentStep === 1 ? 'border-[#2a7b84] bg-[#2a7b84] text-white shadow-lg shadow-[#2a7b84]/30' : 'border-[#2a7b84] text-[#2a7b84]'
                  }`}>
                    01
                  </span>
                  <div>
                    <h2 className="text-xl font-display font-bold text-[#121616]">Informations Personnelles</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Identité & Sécurité</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${currentStep === 1 ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </label>
              
              {currentStep === 1 && (
                <div className="px-6 lg:px-16 pb-8 overflow-hidden">
                  <div className="max-w-2xl">
                    <div className="flex flex-col gap-8 pt-4">
                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all" 
                          id="fullName" 
                          placeholder=" " 
                          required 
                          type="text"
                          value={data.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                        />
                        <label 
                          htmlFor="fullName"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Nom Complet *
                        </label>
                      </div>

                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all" 
                          id="nni" 
                          placeholder=" " 
                          required 
                          type="text"
                          value={data.nni}
                          onChange={(e) => handleChange('nni', e.target.value)}
                          maxLength={20}
                        />
                        <label 
                          htmlFor="nni"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          NNI (Numéro National d'Identification) *
                        </label>
                      </div>

                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all" 
                          id="phone" 
                          placeholder=" " 
                          required 
                          type="tel"
                          value={data.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        <label 
                          htmlFor="phone"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Téléphone *
                        </label>
                      </div>
                      
                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all pr-10" 
                          id="email" 
                          placeholder=" " 
                          required 
                          type="email"
                          value={data.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                        <label 
                          htmlFor="email"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Adresse courriel professionnelle *
                        </label>
                        <span className="absolute right-0 top-4 text-gray-400">
                          <span className="material-symbols-outlined text-xl">mail</span>
                        </span>
                      </div>
                      
                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all pr-10" 
                          id="password" 
                          placeholder=" " 
                          required 
                          type={showPassword ? "text" : "password"}
                          value={data.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          minLength={8}
                        />
                        <label 
                          htmlFor="password"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Mot de passe *
                        </label>
                        <span 
                          className="absolute right-0 top-4 text-gray-400 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {showPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </span>
                      </div>

                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all pr-10" 
                          id="confirmPassword" 
                          placeholder=" " 
                          required 
                          type={showConfirmPassword ? "text" : "password"}
                          value={data.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        />
                        <label 
                          htmlFor="confirmPassword"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Confirmer le mot de passe *
                        </label>
                        <span 
                          className="absolute right-0 top-4 text-gray-400 cursor-pointer"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {showConfirmPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </span>
                      </div>

                      {data.password && data.confirmPassword && data.password !== data.confirmPassword && (
                        <p className="text-sm text-red-500">Les mots de passe ne correspondent pas</p>
                      )}
                      
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          disabled={!validateStep(1)}
                          className="inline-flex items-center gap-2 bg-[#2a7b84] hover:bg-[#236870] text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-[#2a7b84]/20 transition-all hover:shadow-[#2a7b84]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>Suivant</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Professional Information */}
            <div className="border-b border-gray-100">
              <input 
                checked={currentStep === 2} 
                className="hidden peer" 
                id="step2" 
                name="step-accordion" 
                type="radio"
                onChange={() => setCurrentStep(2)}
              />
              <label 
                className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-gray-50/50 transition-colors" 
                htmlFor="step2"
              >
                <div className="flex items-center gap-4">
                  <span className={`step-number w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                    currentStep === 2 ? 'border-[#2a7b84] bg-[#2a7b84] text-white shadow-lg shadow-[#2a7b84]/30' : 'border-gray-200 text-gray-400'
                  }`}>
                    02
                  </span>
                  <div>
                    <h2 className="text-xl font-display font-bold text-[#121616]">Informations Professionnelles</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Diplôme & Formation</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${currentStep === 2 ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </label>
              
              {currentStep === 2 && (
                <div className="px-6 lg:px-16 pb-8">
                  <div className="max-w-2xl pt-4">
                    <div className="grid grid-cols-1 gap-8">
                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all" 
                          id="diplomaTitle" 
                          placeholder=" " 
                          type="text"
                          value={data.diplomaTitle}
                          onChange={(e) => handleChange('diplomaTitle', e.target.value)}
                        />
                        <label 
                          htmlFor="diplomaTitle"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Titre du Diplôme *
                        </label>
                      </div>

                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all" 
                          id="university" 
                          placeholder=" " 
                          type="text"
                          value={data.university}
                          onChange={(e) => handleChange('university', e.target.value)}
                        />
                        <label 
                          htmlFor="university"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Université / École *
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-base font-semibold text-gray-700">
                          Pays d'obtention *
                        </label>
                        <div className="relative">
                          <CountrySelect
                            value={data.country}
                            onChange={(value) => handleChange('country', value)}
                            placeholder="Rechercher et sélectionner un pays"
                          />
                        </div>
                      </div>

                      <div className="underline-input relative">
                        <input 
                          className="text-lg text-[#121616] w-full border-none border-b-2 border-gray-200 pb-4 pt-4 bg-transparent focus:outline-none focus:border-[#2a7b84] transition-all" 
                          id="graduationYear" 
                          placeholder=" " 
                          type="number"
                          value={data.graduationYear}
                          onChange={(e) => handleChange('graduationYear', parseInt(e.target.value) || '')}
                          min={currentYear - 50}
                          max={currentYear}
                        />
                        <label 
                          htmlFor="graduationYear"
                          className="absolute left-0 top-4 text-gray-500 transition-all pointer-events-none"
                        >
                          Année d'Obtention du Diplôme *
                        </label>
                      </div>

                      {data.graduationYear && !isNaN(Number(data.graduationYear)) && (
                        <div className="bg-[#2a7b84]/10 border border-[#2a7b84]/30 rounded-lg p-4">
                          <p className="text-sm text-[#2a7b84]">
                            <strong>Expérience:</strong> {currentYear - Number(data.graduationYear)} ans
                          </p>
                          <p className="text-sm text-[#2a7b84] mt-1">
                            <strong>Cotisation annuelle:</strong>{' '}
                            {currentYear - Number(data.graduationYear) < 5
                              ? '1 500 MRU'
                              : currentYear - Number(data.graduationYear) <= 15
                              ? '3 000 MRU'
                              : '5 000 MRU'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="pt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold transition-all hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span>Précédent</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        disabled={!validateStep(2)}
                        className="inline-flex items-center gap-2 bg-[#2a7b84] hover:bg-[#236870] text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-[#2a7b84]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Continuer</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Domain and Exercise Mode */}
            <div className="border-b border-gray-100">
              <input 
                checked={currentStep === 3} 
                className="hidden peer" 
                id="step3" 
                name="step-accordion" 
                type="radio"
                onChange={() => setCurrentStep(3)}
              />
              <label 
                className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-gray-50/50 transition-colors" 
                htmlFor="step3"
              >
                <div className="flex items-center gap-4">
                  <span className={`step-number w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                    currentStep === 3 ? 'border-[#2a7b84] bg-[#2a7b84] text-white shadow-lg shadow-[#2a7b84]/30' : 'border-gray-200 text-gray-400'
                  }`}>
                    03
                  </span>
                  <div>
                    <h2 className="text-xl font-display font-bold text-[#121616]">Domaine et Mode d'Exercice</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Spécialisations & Mode</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${currentStep === 3 ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </label>
              
              {currentStep === 3 && (
                <div className="px-6 lg:px-16 pb-8">
                  <div className="max-w-2xl pt-4">
                    <div className="space-y-8">
                      {/* Domains */}
                      <div>
                        <h4 className="text-base font-semibold mb-4">Domaine(s) de Spécialisation *</h4>
                        <p className="text-sm text-gray-500 mb-4">Vous pouvez sélectionner plusieurs domaines</p>
                        <div className="space-y-3">
                          {DOMAINS.map((domain) => (
                            <div key={domain.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                id={domain.value}
                                checked={data.domains.includes(domain.value)}
                                onChange={(e) => handleDomainToggle(domain.value, e.target.checked)}
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-[#2a7b84] focus:ring-[#2a7b84]/20"
                              />
                              <div className="flex-1">
                                <label htmlFor={domain.value} className="font-medium cursor-pointer">
                                  {domain.label}
                                </label>
                                <p className="text-sm text-gray-500">{domain.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {data.domains.length === 0 && (
                          <p className="text-sm text-red-500 mt-2">Veuillez sélectionner au moins un domaine</p>
                        )}
                      </div>

                      {/* Exercise Mode */}
                      <div>
                        <h4 className="text-base font-semibold mb-4">Mode d'Exercice *</h4>
                        <div className="space-y-3">
                          {EXERCISE_MODES.map((mode) => (
                            <div key={mode.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <input
                                type="radio"
                                id={mode.value}
                                name="exerciseMode"
                                checked={data.exerciseMode === mode.value}
                                onChange={() => handleChange('exerciseMode', mode.value)}
                                className="mt-1 h-5 w-5 border-gray-300 text-[#2a7b84] focus:ring-[#2a7b84]/20"
                              />
                              <div className="flex-1">
                                <label htmlFor={mode.value} className="font-medium cursor-pointer">
                                  {mode.label}
                                </label>
                                <p className="text-sm text-gray-500">{mode.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold transition-all hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span>Précédent</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        disabled={!validateStep(3)}
                        className="inline-flex items-center gap-2 bg-[#2a7b84] hover:bg-[#236870] text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-[#2a7b84]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Continuer</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Documents and Sponsorship */}
            <div>
              <input 
                checked={currentStep === 4} 
                className="hidden peer" 
                id="step4" 
                name="step-accordion" 
                type="radio"
                onChange={() => setCurrentStep(4)}
              />
              <label 
                className="flex items-center justify-between p-6 lg:p-8 cursor-pointer hover:bg-gray-50/50 transition-colors" 
                htmlFor="step4"
              >
                <div className="flex items-center gap-4">
                  <span className={`step-number w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                    currentStep === 4 ? 'border-[#2a7b84] bg-[#2a7b84] text-white shadow-lg shadow-[#2a7b84]/30' : 'border-gray-200 text-gray-400'
                  }`}>
                    04
                  </span>
                  <div>
                    <h2 className="text-xl font-display font-bold text-[#121616]">Documents et Parrainage</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Finalisation du compte</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${currentStep === 4 ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </label>
              
              {currentStep === 4 && (
                <div className="px-6 lg:px-16">
                  <div className="max-w-2xl pt-4 pb-10">
                    <div className="space-y-8">
                      {/* Parrain Selection */}
                      <div>
                        <h4 className="text-base font-semibold mb-4">Choisir un Parrain *</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Sélectionnez un ingénieur référent qui validera votre inscription
                        </p>
                        <select
                          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2a7b84] transition-all"
                          value={data.parrainId}
                          onChange={(e) => handleChange('parrainId', e.target.value)}
                        >
                          <option value="">Sélectionnez un parrain</option>
                          {parrains.map((parrain) => (
                            <option key={parrain.id} value={parrain.id}>
                              {parrain.full_name} (NNI: {parrain.nni})
                            </option>
                          ))}
                        </select>
                        {parrains.length === 0 && (
                          <p className="text-sm text-orange-600 mt-2">Aucun parrain disponible pour le moment</p>
                        )}
                      </div>

                      {/* File Uploads */}
                      <div className="space-y-6">
                        {/* Diploma File */}
                        <div>
                          <h4 className="text-base font-semibold mb-2">Copie du Diplôme *</h4>
                          <p className="text-sm text-gray-500 mb-4">Votre diplôme d'ingénieur en génie civil</p>
                          {!data.diplomaFile ? (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-[#2a7b84]/50 transition-colors cursor-pointer group">
                              <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-[#2a7b84] transition-colors">
                                upload_file
                              </span>
                              <label htmlFor="diplomaFile" className="cursor-pointer text-[#2a7b84] hover:text-[#2a7b84]/80">
                                Cliquez pour télécharger le diplôme
                              </label>
                              <input
                                id="diplomaFile"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange('diplomaFile')}
                                className="hidden"
                              />
                              <p className="text-xs text-gray-500">PDF uniquement, max 5 MB</p>
                            </div>
                          ) : (
                            <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="material-symbols-outlined text-2xl text-[#2a7b84]">description</span>
                                <div>
                                  <p className="font-medium text-sm">{data.diplomaFile.name}</p>
                                  <p className="text-xs text-gray-500">{(data.diplomaFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleChange('diplomaFile', null)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* CNI File */}
                        <div>
                          <h4 className="text-base font-semibold mb-2">Copie de la CNI *</h4>
                          <p className="text-sm text-gray-500 mb-4">Votre Carte Nationale d'Identité</p>
                          {!data.cniFile ? (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-[#2a7b84]/50 transition-colors cursor-pointer group">
                              <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-[#2a7b84] transition-colors">
                                upload_file
                              </span>
                              <label htmlFor="cniFile" className="cursor-pointer text-[#2a7b84] hover:text-[#2a7b84]/80">
                                Cliquez pour télécharger la CNI
                              </label>
                              <input
                                id="cniFile"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange('cniFile')}
                                className="hidden"
                              />
                              <p className="text-xs text-gray-500">PDF uniquement, max 5 MB</p>
                            </div>
                          ) : (
                            <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="material-symbols-outlined text-2xl text-[#2a7b84]">description</span>
                                <div>
                                  <p className="font-medium text-sm">{data.cniFile.name}</p>
                                  <p className="text-xs text-gray-500">{(data.cniFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleChange('cniFile', null)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Payment Receipt File */}
                        <div>
                          <h4 className="text-base font-semibold mb-2">Reçu de Paiement *</h4>
                          <p className="text-sm text-gray-500 mb-4">Preuve de paiement des frais d'inscription</p>
                          {!data.paymentReceiptFile ? (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-[#2a7b84]/50 transition-colors cursor-pointer group">
                              <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-[#2a7b84] transition-colors">
                                upload_file
                              </span>
                              <label htmlFor="paymentReceiptFile" className="cursor-pointer text-[#2a7b84] hover:text-[#2a7b84]/80">
                                Cliquez pour télécharger le reçu
                              </label>
                              <input
                                id="paymentReceiptFile"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange('paymentReceiptFile')}
                                className="hidden"
                              />
                              <p className="text-xs text-gray-500">PDF uniquement, max 5 MB</p>
                            </div>
                          ) : (
                            <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="material-symbols-outlined text-2xl text-[#2a7b84]">description</span>
                                <div>
                                  <p className="font-medium text-sm">{data.paymentReceiptFile.name}</p>
                                  <p className="text-xs text-gray-500">{(data.paymentReceiptFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleChange('paymentReceiptFile', null)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-900">
                          <strong>Important:</strong> Assurez-vous que vos documents sont lisibles et que toutes les informations sont visibles.
                        </p>
                      </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold transition-all hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span>Précédent</span>
                      </button>
                      <button 
                        onClick={handleRegistration}
                        disabled={!validateStep(4) || isSubmitting}
                        className="w-full sm:w-auto bg-[#2a7b84] hover:bg-[#236870] text-white px-12 py-4 rounded-full font-bold shadow-xl shadow-[#2a7b84]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        type="button"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Envoi en cours...
                          </>
                        ) : (
                          'Finaliser l\'inscription'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Déjà membre? <Link className="text-[#2a7b84] font-bold hover:underline" href="/connexion">Connectez-vous ici</Link>
          </p>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-xs mt-auto">
        © 2026 OMIGEC Inc. Tous droits réservés.
      </footer>
    </div>
  )
}