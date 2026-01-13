'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Building2, Mail, Phone, FileText, Lock, Eye, EyeOff } from 'lucide-react'

interface EntrepriseFormData {
  name: string
  nif: string
  sector: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  description: string
}

interface EntrepriseRegistrationFormProps {
  onSubmit: (data: EntrepriseFormData) => Promise<void>
  isLoading?: boolean
}

const SECTORS = [
  'BTP - Bâtiment et Travaux Publics',
  'Énergie et Mines',
  'Hydraulique et Environnement',
  'Transport et Logistique',
  'Télécommunications',
  'Industrie',
  'Services et Conseil',
  'Agriculture et Agroalimentaire',
  'Autre'
]

export function EntrepriseRegistrationForm({ onSubmit, isLoading = false }: EntrepriseRegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [data, setData] = useState<EntrepriseFormData>({
    name: '',
    nif: '',
    sector: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    description: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof EntrepriseFormData, string>>>({})

  const handleChange = (field: keyof EntrepriseFormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EntrepriseFormData, string>> = {}

    if (!data.name.trim()) newErrors.name = 'Le nom est requis'
    if (!data.nif.trim()) newErrors.nif = 'Le NIF est requis'
    if (!data.sector) newErrors.sector = 'Le secteur est requis'
    if (!data.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!data.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!data.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (data.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères'
    }
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de l'entreprise */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Informations de l'entreprise
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Ex: SOGEA Mauritanie"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIF (Numéro d'Identification Fiscale) *
            </label>
            <input
              type="text"
              value={data.nif}
              onChange={(e) => handleChange('nif', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.nif ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Ex: 123456789"
            />
            {errors.nif && <p className="text-red-500 text-sm mt-1">{errors.nif}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Secteur d'activité *
          </label>
          <select
            value={data.sector}
            onChange={(e) => handleChange('sector', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.sector ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">Sélectionnez un secteur</option>
            {SECTORS.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnel)
          </label>
          <textarea
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Décrivez brièvement votre entreprise..."
          />
        </div>
      </div>


      {/* Coordonnées */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Coordonnées
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email professionnel *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="contact@entreprise.mr"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="+222 XX XX XX XX"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Sécurité
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white text-gray-900 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={data.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white text-gray-900 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Processus d'inscription</p>
            <p className="text-blue-700 text-sm mt-1">
              Après soumission, votre demande sera examinée par notre équipe. 
              Une fois validée, vous pourrez souscrire à un forfait et publier vos offres d'emploi.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Inscription en cours...
          </>
        ) : (
          'Créer mon compte entreprise'
        )}
      </Button>
    </form>
  )
}
