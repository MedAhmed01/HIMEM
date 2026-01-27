'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileText, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Parrain {
  id: string
  full_name: string
  nni: string
}

interface DocumentUploadStepProps {
  data: {
    diplomaFile: File | null
    cniFile: File | null
    paymentReceiptFile: File | null
    parrainId: string
  }
  onChange: (field: string, value: File | null | string) => void
}

export function DocumentUploadStep({ data, onChange }: DocumentUploadStepProps) {
  const [diplomaError, setDiplomaError] = useState<string | null>(null)
  const [cniError, setCniError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [parrains, setParrains] = useState<Parrain[]>([])

  useEffect(() => {
    fetch('/api/parrains')
      .then(res => res.json())
      .then(data => setParrains(data.parrains || []))
      .catch(console.error)
  }, [])

  const validateFile = (file: File): string | null => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      return 'Seuls les fichiers PDF et images (JPG, PNG) sont acceptés'
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return 'Le fichier ne doit pas dépasser 5 MB'
    }
    return null
  }

  const handleFileChange = (field: string, setError: (e: string | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)
    if (file) {
      const error = validateFile(file)
      if (error) {
        setError(error)
        onChange(field, null)
      } else {
        onChange(field, file)
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const FileUpload = ({
    id,
    label,
    description,
    file,
    error,
    onFileChange,
    onRemove,
    required
  }: {
    id: string
    label: string
    description: string
    file: File | null
    error: string | null
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemove: () => void
    required?: boolean
  }) => (
    <div className="space-y-3">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <p className="text-sm text-gray-500">{description}</p>

      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <Label htmlFor={id} className="cursor-pointer text-primary hover:text-primary/80">
            Cliquez pour télécharger
          </Label>
          <Input id={id} type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={onFileChange} className="hidden" />
          <p className="text-xs text-gray-500 mt-2">PDF ou Images (JPG, PNG), max 5 MB</p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Documents et Parrainage</h3>
        <p className="text-sm text-gray-600 mb-6">
          Téléchargez les documents requis et choisissez votre parrain.
        </p>
      </div>

      {/* Parrain Selection */}
      <div className="space-y-3">
        <Label htmlFor="parrain">
          Choisir un Parrain <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-500">
          Sélectionnez un ingénieur référent qui validera votre inscription
        </p>
        <Select value={data.parrainId} onValueChange={(value) => onChange('parrainId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un parrain" />
          </SelectTrigger>
          <SelectContent>
            {parrains.map((parrain) => (
              <SelectItem key={parrain.id} value={parrain.id}>
                {parrain.full_name} (NNI: {parrain.nni})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {parrains.length === 0 && (
          <p className="text-sm text-orange-600">Aucun parrain disponible pour le moment</p>
        )}
      </div>

      <FileUpload
        id="diplomaFile"
        label="Copie du Diplôme"
        description="Votre diplôme d'ingénieur en génie civil"
        file={data.diplomaFile}
        error={diplomaError}
        onFileChange={handleFileChange('diplomaFile', setDiplomaError)}
        onRemove={() => onChange('diplomaFile', null)}
        required={true}
      />

      <FileUpload
        id="cniFile"
        label="Copie de la CNI"
        description="Votre Carte Nationale d'Identité"
        file={data.cniFile}
        error={cniError}
        onFileChange={handleFileChange('cniFile', setCniError)}
        onRemove={() => onChange('cniFile', null)}
        required={true}
      />

      <FileUpload
        id="paymentReceiptFile"
        label="Reçu de Paiement (Optionnel)"
        description="Preuve de paiement des frais d'inscription"
        file={data.paymentReceiptFile}
        error={paymentError}
        onFileChange={handleFileChange('paymentReceiptFile', setPaymentError)}
        onRemove={() => onChange('paymentReceiptFile', null)}
        required={false}
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Important:</strong> Assurez-vous que vos documents sont lisibles et que toutes les informations sont visibles.
        </p>
      </div>
    </div>
  )
}
