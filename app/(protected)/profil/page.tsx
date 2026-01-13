'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  MapPin, 
  Building, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  Calendar,
  FileText,
  Camera,
  Upload,
  Edit3,
  Globe,
  School
} from 'lucide-react'
import type { Domain, ExerciseMode } from '@/lib/types/database'

interface ProfileData {
  id: string
  nni: string
  full_name: string
  phone: string
  email: string
  diploma: string
  grad_year: number
  university: string
  country: string
  domain: Domain[]
  exercise_mode: ExerciseMode
  status: string
  subscription_expiry: string | null
  profile_image_url?: string
}

const DOMAINS = [
  {
    value: 'infrastructure_transport' as Domain,
    label: 'Infrastructure de transport',
    description: 'Routes, ponts, tunnels, voies ferrées',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    value: 'batiment_constructions' as Domain,
    label: 'Bâtiment et constructions diverses',
    description: 'Bâtiments résidentiels, commerciaux, industriels',
    color: 'from-orange-500 to-amber-500'
  },
  {
    value: 'hydraulique_environnement' as Domain,
    label: 'Hydraulique et Environnement',
    description: 'Barrages, réseaux d\'eau, assainissement',
    color: 'from-emerald-500 to-teal-500'
  }
]

const EXERCISE_MODES = [
  {
    value: 'personne_physique' as ExerciseMode,
    label: 'Personne Physique',
    description: 'Exercice individuel',
    icon: User
  },
  {
    value: 'personne_morale' as ExerciseMode,
    label: 'Personne Morale (Bureau d\'étude)',
    description: 'Cabinet ou bureau d\'études',
    icon: Building
  },
  {
    value: 'employe_public' as ExerciseMode,
    label: 'Employé (Secteur Public)',
    description: 'Fonctionnaire ou agent public',
    icon: Globe
  },
  {
    value: 'employe_prive' as ExerciseMode,
    label: 'Employé (Secteur Privé)',
    description: 'Salarié d\'entreprise privée',
    icon: Building
  }
]

const COUNTRIES = [
  'Mauritanie', 'Maroc', 'Algérie', 'Tunisie', 'Libye', 'Égypte', 'Soudan', 'Mali', 'Niger', 'Tchad',
  'Sénégal', 'Burkina Faso', 'Côte d\'Ivoire', 'Ghana', 'Nigeria', 'France', 'Espagne', 'Allemagne',
  'Royaume-Uni', 'Canada', 'États-Unis', 'Jordanie', 'Liban', 'Syrie', 'Irak', 'Arabie Saoudite'
]

export default function ProfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      
      if (res.ok) {
        setProfile(data.profile)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image valide' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 5MB' })
      return
    }

    setUploadingImage(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const res = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setProfile(prev => prev ? { ...prev, profile_image_url: data.imageUrl } : null)
        setMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès' })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement de l\'image' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          diploma: profile.diploma,
          university: profile.university,
          country: profile.country,
          domain: profile.domain,
          exercise_mode: profile.exercise_mode
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
        setProfile(data.profile)
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setSaving(false)
    }
  }

  const handleDomainToggle = (domain: Domain, checked: boolean) => {
    if (!profile) return
    
    const newDomains = checked
      ? [...profile.domain, domain]
      : profile.domain.filter(d => d !== domain)
    
    setProfile({ ...profile, domain: newDomains })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            Compte Validé
          </Badge>
        )
      case 'pending_docs':
        return (
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-2">
            <FileText className="w-4 h-4 mr-2" />
            Documents en attente
          </Badge>
        )
      case 'pending_reference':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-4 py-2">
            <User className="w-4 h-4 mr-2" />
            Parrainage en attente
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="px-4 py-2">
            {status}
          </Badge>
        )
    }
  }

  const calculateExperience = (gradYear: number) => {
    return new Date().getFullYear() - gradYear
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-md shadow-2xl">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p className="text-slate-600">Impossible de charger votre profil</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Success/Error Message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              message.type === 'success'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                : 'bg-gradient-to-br from-red-500 to-pink-500'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <AlertCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <p className={`${message.type === 'success' ? 'text-emerald-700' : 'text-red-700'} font-medium flex-1`}>
              {message.text}
            </p>
            <button 
              onClick={() => setMessage(null)}
              className={`${message.type === 'success' ? 'text-emerald-400 hover:text-emerald-600' : 'text-red-400 hover:text-red-600'} text-xl font-bold`}
            >
              ×
            </button>
          </div>
        )}

        {/* Profile Header */}
        <Card className="glass border-0 shadow-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              {/* Profile Image */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                  <AvatarImage 
                    src={profile.profile_image_url} 
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                    {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload Button */}
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-600" />
                  )}
                </label>
              </div>
              
              {/* Profile Info */}
              <div className="pb-4 text-white">
                <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phone}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              {getStatusBadge(profile.status)}
            </div>
          </div>
          
          {/* Profile Stats */}
          <CardContent className="pt-20 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{calculateExperience(profile.grad_year)}</p>
                <p className="text-sm text-slate-600">Années d'expérience</p>
              </div>
              
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{profile.domain.length}</p>
                <p className="text-sm text-slate-600">Domaines d'expertise</p>
              </div>
              
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{profile.grad_year}</p>
                <p className="text-sm text-slate-600">Année de sortie</p>
              </div>
              
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {profile.subscription_expiry ? 
                    Math.ceil((new Date(profile.subscription_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
                    : 0
                  }
                </p>
                <p className="text-sm text-slate-600">Jours restants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Toggle */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Informations du Profil</h2>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="rounded-xl"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations Personnelles */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700">Nom Complet</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-2 disabled:bg-slate-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nni" className="text-sm font-semibold text-slate-700">NNI</Label>
                  <Input
                    id="nni"
                    value={profile.nni}
                    disabled
                    className="h-12 rounded-xl border-2 bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-500">Le NNI ne peut pas être modifié</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-2 disabled:bg-slate-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="h-12 rounded-xl border-2 bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-500">L'email ne peut pas être modifié</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations Académiques */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <School className="w-5 h-5 text-white" />
                </div>
                Informations Académiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="diploma" className="text-sm font-semibold text-slate-700">Diplôme</Label>
                  <Input
                    id="diploma"
                    value={profile.diploma}
                    onChange={(e) => setProfile({ ...profile, diploma: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-2 disabled:bg-slate-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grad_year" className="text-sm font-semibold text-slate-700">Année de Sortie</Label>
                  <Input
                    id="grad_year"
                    value={profile.grad_year}
                    disabled
                    className="h-12 rounded-xl border-2 bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-500">L'année de sortie ne peut pas être modifiée</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-semibold text-slate-700">Université</Label>
                  <Input
                    id="university"
                    value={profile.university || ''}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Ex: Université de Nouakchott"
                    className="h-12 rounded-xl border-2 disabled:bg-slate-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-slate-700">Pays</Label>
                  <Select
                    value={profile.country || ''}
                    onValueChange={(value) => setProfile({ ...profile, country: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 disabled:bg-slate-50">
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domaines et Mode d'Exercice */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                  <Building className="w-5 h-5 text-white" />
                </div>
                Domaines et Mode d'Exercice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Domaines */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">Domaines d'Expertise</Label>
                <div className="grid grid-cols-1 gap-4">
                  {DOMAINS.map((domain) => (
                    <div key={domain.value} className={`p-4 rounded-2xl border-2 transition-all ${
                      profile.domain.includes(domain.value) 
                        ? `bg-gradient-to-r ${domain.color} bg-opacity-10 border-current` 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={domain.value}
                          checked={profile.domain.includes(domain.value)}
                          onCheckedChange={(checked) => handleDomainToggle(domain.value, checked as boolean)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={domain.value} className="font-semibold cursor-pointer text-slate-900">
                            {domain.label}
                          </Label>
                          <p className="text-sm text-slate-600 mt-1">{domain.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode d'Exercice */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">Mode d'Exercice</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXERCISE_MODES.map((mode) => {
                    const Icon = mode.icon
                    const isSelected = profile.exercise_mode === mode.value
                    return (
                      <div
                        key={mode.value}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300' 
                            : 'border-slate-200 hover:border-slate-300'
                        } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                        onClick={() => isEditing && setProfile({ ...profile, exercise_mode: mode.value })}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected 
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                              : 'bg-slate-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{mode.label}</h4>
                            <p className="text-sm text-slate-600 mt-1">{mode.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isEditing && (
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  loadProfile() // Reset changes
                }}
                className="h-12 px-8 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
                  </div>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}