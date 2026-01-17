'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Domain, ContractType, CreateJobOfferData } from '@/lib/types/database'
import { Briefcase, MapPin, Calendar, DollarSign, FileText, Tag } from 'lucide-react'

interface JobOfferFormProps {
  initialData?: Partial<CreateJobOfferData>
  onSubmit: (data: CreateJobOfferData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

const DOMAINS: { value: Domain; label: string }[] = [
  { value: 'infrastructure_transport', label: 'Infrastructure & Transport' },
  { value: 'batiment_constructions', label: 'Bâtiment & Constructions' },
  { value: 'hydraulique_environnement', label: 'Hydraulique & Environnement' }
]

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'stage', label: 'Stage' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'consultant', label: 'Consultant' }
]

export function JobOfferForm({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  submitLabel = 'Publier l\'offre'
}: JobOfferFormProps) {
  const [data, setData] = useState<CreateJobOfferData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    domains: initialData?.domains || [],
    contract_type: initialData?.contract_type || 'cdi',
    location: initialData?.location || '',
    salary_range: initialData?.salary_range || '',
    deadline: initialData?.deadline || ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateJobOfferData, string>>>({})

  const handleChange = (field: keyof CreateJobOfferData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const toggleDomain = (domain: Domain) => {
    setData(prev => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain]
    }))
    if (errors.domains) {
      setErrors(prev => ({ ...prev, domains: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateJobOfferData, string>> = {}

    if (!data.title.trim()) newErrors.title = 'Le titre est requis'
    if (!data.description.trim()) newErrors.description = 'La description est requise'
    if (data.domains.length === 0) newErrors.domains = 'Sélectionnez au moins un domaine'
    if (!data.contract_type) newErrors.contract_type = 'Le type de contrat est requis'
    if (!data.location.trim()) newErrors.location = 'La localisation est requise'
    if (!data.deadline) {
      newErrors.deadline = 'La date limite est requise'
    } else if (new Date(data.deadline) <= new Date()) {
      newErrors.deadline = 'La date doit être dans le futur'
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
      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Briefcase className="w-4 h-4 inline mr-2" />
          Titre du poste *
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
          placeholder="Ex: Ingénieur Génie Civil Senior"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FileText className="w-4 h-4 inline mr-2" />
          Description du poste *
        </label>
        <textarea
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
          placeholder="Décrivez les responsabilités, les qualifications requises, etc."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Domaines */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline mr-2" />
          Domaines requis *
        </label>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map(domain => (
            <button
              key={domain.value}
              type="button"
              onClick={() => toggleDomain(domain.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                data.domains.includes(domain.value)
                  ? 'bg-[#139a9d] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {domain.label}
            </button>
          ))}
        </div>
        {errors.domains && <p className="text-red-500 text-sm mt-1">{errors.domains}</p>}
      </div>

      {/* Type de contrat et Localisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de contrat *
          </label>
          <select
            value={data.contract_type}
            onChange={(e) => handleChange('contract_type', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.contract_type ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
          >
            {CONTRACT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.contract_type && <p className="text-red-500 text-sm mt-1">{errors.contract_type}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 inline mr-2" />
            Localisation *
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            placeholder="Ex: Nouakchott, Mauritanie"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>
      </div>

      {/* Salaire et Date limite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Fourchette salariale (optionnel)
          </label>
          <input
            type="text"
            value={data.salary_range}
            onChange={(e) => handleChange('salary_range', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 300 000 - 500 000 MRU"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date limite de candidature *
          </label>
          <input
            type="date"
            value={data.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${errors.deadline ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
          />
          {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-[#139a9d] hover:bg-[#0f7a7d] text-white font-medium"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Publication...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
