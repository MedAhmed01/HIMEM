'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { UserCheck } from 'lucide-react'
import type { ReferenceEngineer } from '@/lib/types/database'

interface ReferenceSelectorProps {
  references: ReferenceEngineer[]
  onSelect: (referenceId: string) => Promise<void>
}

export function ReferenceSelector({ references, onSelect }: ReferenceSelectorProps) {
  const [selectedReference, setSelectedReference] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedReference) {
      setError('Veuillez sélectionner un parrain')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSelect(selectedReference)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Reference selection error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRef = references.find(ref => ref.id === selectedReference)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>Sélection du Parrain</CardTitle>
            <CardDescription>
              Choisissez un ingénieur référent pour valider votre inscription
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#139a9d]/10 border border-[#139a9d]/30 rounded-lg p-4">
            <h4 className="font-semibold text-[#139a9d] mb-2">
              Qu'est-ce qu'un parrain ?
            </h4>
            <p className="text-sm text-[#139a9d]/80">
              Un parrain est un ingénieur agréé qui confirme votre identité et vos qualifications.
              Une fois que votre parrain aura validé votre demande, votre inscription sera finalisée.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">
              Sélectionnez votre parrain <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedReference}
              onValueChange={setSelectedReference}
              disabled={isSubmitting}
            >
              <SelectTrigger id="reference">
                <SelectValue placeholder="Choisissez un ingénieur référent" />
              </SelectTrigger>
              <SelectContent>
                {references.map((ref) => (
                  <SelectItem key={ref.id} value={ref.id}>
                    <div>
                      <div className="font-medium">{ref.fullName}</div>
                      <div className="text-sm text-gray-500">NNI: {ref.nni}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {references.length} parrain(s) disponible(s)
            </p>
          </div>

          {selectedRef && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2">Parrain sélectionné :</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nom:</span> {selectedRef.fullName}</p>
                <p><span className="font-medium">NNI:</span> {selectedRef.nni}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!selectedReference || isSubmitting}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande de parrainage'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Votre parrain recevra une notification et devra confirmer votre demande.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
