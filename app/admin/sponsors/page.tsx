'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Upload,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url?: string | null
  display_order: number
  is_active: boolean
}

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newSponsor, setNewSponsor] = useState({ name: '', websiteUrl: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadSponsors = async () => {
    try {
      const res = await fetch('/api/admin/sponsors')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      }
      setSponsors(data.sponsors || [])
    } catch (err) {
      console.error('Error loading sponsors:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSponsors()
  }, [])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Maximum 2MB.')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSponsor.name || !selectedFile) {
      setError('Veuillez remplir le nom et sélectionner un logo')
      return
    }

    setUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('name', newSponsor.name)
      formData.append('websiteUrl', newSponsor.websiteUrl)
      formData.append('logo', selectedFile)

      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Erreur lors de l\'ajout du sponsor')
        return
      }

      setSuccess('Sponsor ajouté avec succès!')
      setNewSponsor({ name: '', websiteUrl: '' })
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadSponsors()
    } catch (err) {
      console.error('Error adding sponsor:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (sponsorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) return

    try {
      const formData = new FormData()
      formData.append('action', 'delete')
      formData.append('sponsorId', sponsorId)

      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return
      }

      setSuccess('Sponsor supprimé')
      loadSponsors()
    } catch (err) {
      console.error('Error deleting sponsor:', err)
      setError('Erreur lors de la suppression')
    }
  }

  const handleToggle = async (sponsorId: string) => {
    try {
      const formData = new FormData()
      formData.append('action', 'toggle')
      formData.append('sponsorId', sponsorId)

      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return
      }

      loadSponsors()
    } catch (err) {
      console.error('Error toggling sponsor:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#139a9d] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sponsors</h1>
        <p className="text-gray-500 text-sm mt-1">Gérer les logos des partenaires</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm flex-1">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Add New Sponsor */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ajouter un sponsor</h2>
        </div>
        <div className="p-5">
          <form onSubmit={handleAddSponsor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Logo *</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#139a9d] hover:bg-[#139a9d]/5 transition-colors"
                >
                  {previewUrl ? (
                    <div className="space-y-2">
                      <div className="w-32 h-20 mx-auto flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-blue-600">Cliquer pour changer</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Télécharger un logo</p>
                        <p className="text-xs text-gray-500">PNG, JPG, SVG (max 2MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Sponsor Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nom *</Label>
                  <Input
                    id="name"
                    placeholder="Nom du sponsor"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    className="h-10 rounded-lg border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700">Site web</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={newSponsor.websiteUrl}
                    onChange={(e) => setNewSponsor({ ...newSponsor, websiteUrl: e.target.value })}
                    className="h-10 rounded-lg border-gray-300"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!newSponsor.name || !selectedFile || uploading}
                  className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ajout en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sponsors List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Sponsors actuels ({sponsors.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {sponsors.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Aucun sponsor</p>
              <p className="text-gray-500 text-sm mt-1">Ajoutez votre premier sponsor</p>
            </div>
          ) : (
            sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-20 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-2 flex-shrink-0">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="max-h-10 w-auto object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{sponsor.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sponsor.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sponsor.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {sponsor.website_url && (
                      <a 
                        href={sponsor.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{sponsor.website_url}</span>
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(sponsor.id)}
                      className="h-9 px-3 rounded-lg border-gray-300"
                      title={sponsor.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {sponsor.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sponsor.id)}
                      className="h-9 px-3 rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
