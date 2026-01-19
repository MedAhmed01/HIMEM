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
  X,
  Search,
  Edit,
  CloudUpload,
  Palette
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
  const [searchQuery, setSearchQuery] = useState('')
  const [isDark, setIsDark] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check for saved theme
    const savedTheme = localStorage.getItem('sponsors-theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('sponsors-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('sponsors-theme', 'light')
    }
  }

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

  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const getColorFromName = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600 border-red-200',
      'bg-blue-100 text-blue-600 border-blue-200',
      'bg-green-100 text-green-600 border-green-200',
      'bg-yellow-100 text-yellow-600 border-yellow-200',
      'bg-purple-100 text-purple-600 border-purple-200',
      'bg-pink-100 text-pink-600 border-pink-200',
      'bg-indigo-100 text-indigo-600 border-indigo-200',
      'bg-orange-100 text-orange-600 border-orange-200'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sponsors</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérer les logos des partenaires et leur visibilité sur la plateforme.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-200 text-sm flex-1">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Sponsor Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 sticky top-8">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" />
                  Ajouter un sponsor
                </h2>
              </div>
              
              <form onSubmit={handleAddSponsor} className="p-6 space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo *</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-teal-600 dark:hover:border-teal-500 transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1 text-center">
                      {previewUrl ? (
                        <div className="space-y-2">
                          <div className="w-20 h-16 mx-auto flex items-center justify-center">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <p className="text-xs text-teal-600">Cliquer pour changer</p>
                        </div>
                      ) : (
                        <>
                          <CloudUpload className="w-10 h-10 text-gray-400 group-hover:text-teal-600 transition-colors mx-auto" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                            <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none">
                              Télécharger
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, SVG (max 2MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </div>

                {/* Sponsor Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="sponsor-name">
                    Nom *
                  </label>
                  <input
                    id="sponsor-name"
                    type="text"
                    placeholder="Nom du sponsor"
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-teal-600 focus:ring-teal-600 sm:text-sm"
                  />
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="sponsor-website">
                    Site web
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">https://</span>
                    </div>
                    <input
                      id="sponsor-website"
                      type="text"
                      placeholder="example.com"
                      value={newSponsor.websiteUrl}
                      onChange={(e) => setNewSponsor({ ...newSponsor, websiteUrl: e.target.value })}
                      className="block w-full pl-16 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-teal-600 focus:ring-teal-600 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!newSponsor.name || !selectedFile || uploading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ajout en cours...
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sponsors Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header with Search */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Sponsors actuels
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
                  {filteredSponsors.length}
                </span>
              </h2>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-teal-600 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Sponsors Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      sponsor.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {sponsor.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  {/* Logo Area */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center p-6 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors h-32">
                    {sponsor.logo_url ? (
                      <img
                        alt={`Logo ${sponsor.name}`}
                        className="max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        src={sponsor.logo_url}
                      />
                    ) : (
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-2xl border-2 ${getColorFromName(sponsor.name)}`}>
                        {getInitials(sponsor.name)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {sponsor.name}
                    </h3>
                    {sponsor.website_url && (
                      <a
                        href={`https://${sponsor.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-teal-600 hover:underline truncate block mt-1 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {sponsor.website_url}
                      </a>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
                    <button
                      onClick={() => handleToggle(sponsor.id)}
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-teal-600 hover:border-teal-600 dark:hover:text-teal-500 dark:hover:border-teal-500 shadow-sm transition-colors"
                      title={sponsor.is_active ? 'Masquer' : 'Afficher'}
                    >
                      {sponsor.is_active ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-blue-500 hover:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400 shadow-sm transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-red-500 hover:border-red-500 dark:hover:text-red-400 dark:hover:border-red-400 shadow-sm transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Sponsor Card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-600 dark:hover:border-teal-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors h-[280px]"
              >
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-500" />
                </div>
                <span className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-500">
                  Nouvel emplacement
                </span>
              </div>
            </div>

            {/* Empty State */}
            {filteredSponsors.length === 0 && !loading && (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  {searchQuery ? 'Aucun sponsor trouvé' : 'Aucun sponsor'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchQuery ? 'Essayez un autre terme de recherche' : 'Ajoutez votre premier sponsor'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={toggleTheme}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 dark:focus:ring-offset-gray-900"
          title="Toggle Theme"
        >
          <Palette className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
