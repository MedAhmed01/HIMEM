'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PersonalInfoStepProps {
  data: {
    fullName: string
    nni: string
    phone: string
    email: string
    password: string
    confirmPassword: string
  }
  onChange: (field: string, value: string) => void
}

export function PersonalInfoStep({ data, onChange }: PersonalInfoStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informations Personnelles</h3>
        <p className="text-sm text-gray-600 mb-6">
          Veuillez fournir vos informations personnelles exactes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">
          Nom Complet <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Ex: Mohamed Ahmed Ould Salem"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nni">
          NNI (Numéro National d'Identification) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nni"
          type="text"
          placeholder="Ex: 1234567890"
          value={data.nni}
          onChange={(e) => onChange('nni', e.target.value)}
          required
          maxLength={20}
        />
        <p className="text-xs text-gray-500">
          Votre numéro d'identification nationale unique
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Téléphone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Ex: +222 XX XX XX XX"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Ex: votre@email.com"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">
          Utilisé pour la connexion et les notifications
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Mot de passe <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 8 caractères"
          value={data.password}
          onChange={(e) => onChange('password', e.target.value)}
          required
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirmer le mot de passe <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Répétez le mot de passe"
          value={data.confirmPassword}
          onChange={(e) => onChange('confirmPassword', e.target.value)}
          required
        />
        {data.password && data.confirmPassword && data.password !== data.confirmPassword && (
          <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
        )}
      </div>
    </div>
  )
}
