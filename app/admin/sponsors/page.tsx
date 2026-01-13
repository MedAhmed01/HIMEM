'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ExternalLink, 
  GripVertical, 
  Eye, 
  EyeOff,
  Upload,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Gestion des Sponsors</h1>
            <p className="text-slate-500">Gérez les logos des partenaires affichés sur le site</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <p className="text-emerald-600 font-medium">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <p className="text-red-600 flex-1">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Setup Instructions */}
      <Card className="glass border-0 shadow-xl overflow-hidden border-l-4 border-l-amber-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Configuration requise</h3>
              <p className="text-sm text-slate-600 mb-3">
                Pour utiliser cette fonctionnalité, assurez-vous d'avoir:
              </p>
              <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                <li>Créé la table <code className="bg-blue-50 text-blue-600 px-1 rounded">sponsors</code> dans Supabase</li>
                <li>Créé le bucket de stockage <code className="bg-blue-50 text-blue-600 px-1 rounded">sponsors</code> (public)</li>
                <li>Configuré les politiques de stockage pour permettre l'upload</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Sponsor */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Ajouter un Sponsor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSponsor} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Logo du sponsor *</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300"
                >
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="w-32 h-20 mx-auto relative flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-blue-600">Cliquez pour changer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Cliquez pour télécharger</p>
                        <p className="text-sm text-slate-500">PNG, JPG, SVG (max 2MB)</p>
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
                  <Label htmlFor="name" className="text-slate-700 font-medium">Nom du sponsor *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Entreprise ABC"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    className="h-12 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-slate-700 font-medium">Site web (optionnel)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="website"
                      placeholder="https://www.example.com"
                      value={newSponsor.websiteUrl}
                      onChange={(e) => setNewSponsor({ ...newSponsor, websiteUrl: e.target.value })}
                      className="h-12 pl-12 rounded-xl border-2 border-slate-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!newSponsor.name || !selectedFile || uploading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 shadow-lg shadow-blue-500/30 btn-shine"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Téléchargement...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Ajouter le sponsor
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sponsors List */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Sponsors actuels ({sponsors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sponsors.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Aucun sponsor</p>
              <p className="text-slate-400 mt-2">Ajoutez votre premier sponsor ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sponsors.map((sponsor, index) => (
                <div
                  key={sponsor.id}
                  className={`rounded-2xl border p-5 transition-all duration-300 ${
                    sponsor.is_active 
                      ? 'border-blue-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 hover:shadow-lg' 
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab text-slate-400 hover:text-slate-600">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </div>

                    <div className="w-24 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="max-h-10 w-auto object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{sponsor.name}</h3>
                        <Badge className={sponsor.is_active 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0' 
                          : 'bg-slate-200 text-slate-600 border-0'
                        }>
                          {sponsor.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      {sponsor.website_url && (
                        <a 
                          href={sponsor.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {sponsor.website_url}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(sponsor.id)}
                        className="rounded-xl border-2"
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
                        className="rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
