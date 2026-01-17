'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CountrySelect } from '@/components/ui/country-select'

interface ProfessionalInfoStepProps {
  data: {
    diplomaTitle: string
    graduationYear: number | string
    university: string
    country: string
  }
  onChange: (field: string, value: string | number) => void
}

export function ProfessionalInfoStep({ data, onChange }: ProfessionalInfoStepProps) {
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 50
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informations Professionnelles</h3>
        <p className="text-sm text-gray-600 mb-6">
          Informations sur votre diplôme et votre parcours professionnel.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diplomaTitle">
          Titre du Diplôme <span className="text-red-500">*</span>
        </Label>
        <Input
          id="diplomaTitle"
          type="text"
          placeholder="Ex: Ingénieur en Génie Civil"
          value={data.diplomaTitle}
          onChange={(e) => onChange('diplomaTitle', e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">
          Le titre exact de votre diplôme d'ingénieur
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">
          Université / École <span className="text-red-500">*</span>
        </Label>
        <Input
          id="university"
          type="text"
          placeholder="Ex: École Polytechnique de Nouakchott"
          value={data.university}
          onChange={(e) => onChange('university', e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">
          L'établissement où vous avez obtenu votre diplôme
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Pays d'obtention <span className="text-red-500">*</span>
        </Label>
        <CountrySelect
          value={data.country}
          onChange={(value) => onChange('country', value)}
          placeholder="Rechercher et sélectionner un pays"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="graduationYear">
          Année d'Obtention du Diplôme <span className="text-red-500">*</span>
        </Label>
        <Input
          id="graduationYear"
          type="number"
          placeholder={`Ex: ${currentYear - 5}`}
          value={data.graduationYear}
          onChange={(e) => onChange('graduationYear', parseInt(e.target.value) || '')}
          required
          min={minYear}
          max={currentYear}
        />
      </div>

      {data.graduationYear && !isNaN(Number(data.graduationYear)) && (
        <div className="bg-[#139a9d]/10 border border-[#139a9d]/30 rounded-lg p-4">
          <p className="text-sm text-[#139a9d]">
            <strong>Expérience:</strong> {currentYear - Number(data.graduationYear)} ans
          </p>
          <p className="text-sm text-[#139a9d] mt-1">
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
  )
}
