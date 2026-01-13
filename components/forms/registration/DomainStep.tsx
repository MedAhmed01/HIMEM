'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Domain, ExerciseMode } from '@/lib/types/database'

interface DomainStepProps {
  data: {
    domains: Domain[]
    exerciseMode: ExerciseMode | ''
  }
  onChange: (field: string, value: Domain[] | ExerciseMode) => void
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

export function DomainStep({ data, onChange }: DomainStepProps) {
  const handleDomainToggle = (domain: Domain, checked: boolean) => {
    const newDomains = checked
      ? [...data.domains, domain]
      : data.domains.filter(d => d !== domain)
    onChange('domains', newDomains)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Domaine et Mode d'Exercice</h3>
        <p className="text-sm text-gray-600 mb-6">
          Sélectionnez votre(vos) domaine(s) de spécialisation et votre mode d'exercice.
        </p>
      </div>

      {/* Domains Section */}
      <div className="space-y-4">
        <Label className="text-base">
          Domaine(s) de Spécialisation <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-500">
          Vous pouvez sélectionner plusieurs domaines
        </p>
        
        <div className="space-y-3">
          {DOMAINS.map((domain) => (
            <div key={domain.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={domain.value}
                checked={data.domains.includes(domain.value)}
                onCheckedChange={(checked) => handleDomainToggle(domain.value, checked as boolean)}
              />
              <div className="flex-1">
                <Label
                  htmlFor={domain.value}
                  className="font-medium cursor-pointer"
                >
                  {domain.label}
                </Label>
                <p className="text-sm text-gray-500">{domain.description}</p>
              </div>
            </div>
          ))}
        </div>

        {data.domains.length === 0 && (
          <p className="text-sm text-red-500">
            Veuillez sélectionner au moins un domaine
          </p>
        )}
      </div>

      {/* Exercise Mode Section */}
      <div className="space-y-4">
        <Label htmlFor="exerciseMode" className="text-base">
          Mode d'Exercice <span className="text-red-500">*</span>
        </Label>
        
        <Select
          value={data.exerciseMode}
          onValueChange={(value) => onChange('exerciseMode', value as ExerciseMode)}
        >
          <SelectTrigger id="exerciseMode">
            <SelectValue placeholder="Sélectionnez votre mode d'exercice" />
          </SelectTrigger>
          <SelectContent>
            {EXERCISE_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                <div>
                  <div className="font-medium">{mode.label}</div>
                  <div className="text-sm text-gray-500">{mode.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
