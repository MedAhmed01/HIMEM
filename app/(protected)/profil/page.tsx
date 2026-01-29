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
  School,
  LogOut,
  Key,
  Download,
  Trash2
} from 'lucide-react'
import type { Domain, ExerciseMode } from '@/lib/types/database'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  exercise_mode: ExerciseMode[]
  status: string
  subscription_expiry: string | null
  profile_image_url?: string
  cv_url?: string
  sponsorships_count?: number
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
    color: 'from-[#139a9d] to-[#0f7a7d]'
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
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Password change dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()

      if (res.ok) {
        console.log('Profile data loaded:', data.profile)
        console.log('grad_year:', data.profile.grad_year)
        console.log('sponsorships_count:', data.profile.sponsorships_count)
        console.log('subscription_expiry:', data.profile.subscription_expiry)
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

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier PDF' })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Le CV ne doit pas dépasser 10MB' })
      return
    }

    setUploadingCV(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('cv', file)

      const res = await fetch('/api/profile/cv', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setProfile(prev => prev ? { ...prev, cv_url: data.cvUrl } : null)
        setMessage({ type: 'success', text: 'CV téléchargé avec succès' })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement du CV' })
    } finally {
      setUploadingCV(false)
    }
  }

  const handleCVDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre CV ?')) return

    setUploadingCV(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profile/cv', {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        setProfile(prev => prev ? { ...prev, cv_url: undefined } : null)
        setMessage({ type: 'success', text: 'CV supprimé avec succès' })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du CV' })
    } finally {
      setUploadingCV(false)
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

  const handleExerciseModeToggle = (mode: ExerciseMode, checked: boolean) => {
    if (!profile) return

    const currentModes = Array.isArray(profile.exercise_mode) ? profile.exercise_mode : [profile.exercise_mode]
    const newModes = checked
      ? [...currentModes, mode]
      : currentModes.filter(m => m !== mode)

    setProfile({ ...profile, exercise_mode: newModes })
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/connexion')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' })
      return
    }

    setChangingPassword(true)
    setMessage(null)

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' })
        setShowPasswordDialog(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors du changement de mot de passe' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' })
    } finally {
      setChangingPassword(false)
    }
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
          <Badge className="bg-gradient-to-r from-[#139a9d] to-[#0f7a7d] text-white border-0 px-4 py-2">
            <FileText className="w-4 h-4 mr-2" />
            Documents en attente
          </Badge>
        )
      case 'pending_reference':
        return (
          <Badge className="bg-gradient-to-r from-[#139a9d] to-[#0f7a7d] text-white border-0 px-4 py-2">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-[#139a9d]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#139a9d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-[#139a9d]/10">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#139a9d]/5 to-[#0f7a7d]/5 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Success/Error Message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg ${message.type === 'success'
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${message.type === 'success'
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
          <div className="h-24 bg-gradient-to-r from-[#139a9d] via-[#0f7a7d] to-[#139a9d] relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute -bottom-16 left-8">
              {/* Profile Image */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                  <AvatarImage
                    src={profile.profile_image_url}
                    alt={profile.full_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#139a9d] to-[#0f7a7d] text-white text-3xl font-bold">
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
            </div>

            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              {getStatusBadge(profile.status)}
            </div>
          </div>

          {/* Profile Info - Now on white background */}
          <div className="pt-8 px-8 pb-4">
            <div className="ml-40"> {/* Offset to align with profile image */}
              <h1 className="text-3xl font-bold mb-2 text-slate-900">{profile.full_name}</h1>
              <div className="flex items-center gap-4 text-slate-600">
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

          {/* Profile Stats */}
          <CardContent className="pt-4 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#139a9d]/10 to-[#0f7a7d]/10 border border-[#139a9d]/30">
                <div className="w-12 h-12 bg-gradient-to-br from-[#139a9d] to-[#0f7a7d] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{calculateExperience(profile.grad_year)}</p>
                <p className="text-sm text-slate-600">Années d'expérience</p>
              </div>

              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{profile.sponsorships_count || 0}</p>
                <p className="text-sm text-slate-600">Parrainages effectués</p>
              </div>

              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#139a9d]/10 to-[#0f7a7d]/10 border border-[#139a9d]/30">
                <div className="w-12 h-12 bg-gradient-to-br from-[#139a9d] to-[#0f7a7d] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{profile.grad_year}</p>
                <p className="text-sm text-slate-600">Année de sortie</p>
              </div>

              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-[#139a9d]/10 to-[#0f7a7d]/10 border border-[#139a9d]/30">
                <div className="w-12 h-12 bg-gradient-to-br from-[#139a9d] to-[#0f7a7d] rounded-xl flex items-center justify-center mx-auto mb-3">
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
          <div className="flex gap-3">
            <Button
              onClick={() => setShowPasswordDialog(true)}
              variant="outline"
              className="rounded-xl"
            >
              <Key className="w-4 h-4 mr-2" />
              Changer le mot de passe
            </Button>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="rounded-xl"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-xl border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations Personnelles */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#139a9d] via-[#0f7a7d] to-[#139a9d]"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#139a9d] to-[#0f7a7d] flex items-center justify-center shadow-md">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="diploma" className="text-sm font-semibold text-slate-700">Diplôme</Label>
                    <Badge variant="outline" className="text-[10px] text-slate-500 uppercase tracking-wider">Contact Administration</Badge>
                  </div>
                  <Input
                    id="diploma"
                    value={profile.diploma}
                    disabled
                    className="h-12 rounded-xl border-2 bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-500">Le diplôme ne peut être modifié que par l'administration</p>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="university" className="text-sm font-semibold text-slate-700">Université</Label>
                    <Badge variant="outline" className="text-[10px] text-slate-500 uppercase tracking-wider">Archives</Badge>
                  </div>
                  <Input
                    id="university"
                    value={profile.university || ''}
                    disabled
                    placeholder="Ex: Université de Nouakchott"
                    className="h-12 rounded-xl border-2 bg-slate-50 text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-slate-700">Pays</Label>
                  <Input
                    id="country"
                    value={profile.country || ''}
                    disabled
                    className="h-12 rounded-xl border-2 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domaines et Mode d'Exercice */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#139a9d] via-[#0f7a7d] to-[#139a9d]"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#139a9d] to-[#0f7a7d] flex items-center justify-center shadow-md">
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
                  {DOMAINS.map((domain) => {
                    const isSelected = profile.domain.includes(domain.value)
                    return (
                      <div key={domain.value} className={`p-4 rounded-2xl border-2 transition-all ${isSelected
                        ? `bg-gradient-to-r ${domain.color} border-current`
                        : 'border-slate-200 hover:border-slate-300'
                        }`}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={domain.value}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleDomainToggle(domain.value, checked as boolean)}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor={domain.value} className={`font-semibold cursor-pointer ${isSelected ? 'text-white' : 'text-slate-900'
                              }`}>
                              {domain.label}
                            </Label>
                            <p className={`text-sm mt-1 ${isSelected ? 'text-white/90' : 'text-slate-600'
                              }`}>{domain.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mode d'Exercice */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-slate-700">Mode d'Exercice</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXERCISE_MODES.map((mode) => {
                    const Icon = mode.icon
                    const isSelected = Array.isArray(profile.exercise_mode)
                      ? profile.exercise_mode.includes(mode.value)
                      : profile.exercise_mode === mode.value
                    return (
                      <div
                        key={mode.value}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                          ? 'bg-gradient-to-r from-[#139a9d]/10 to-[#0f7a7d]/10 border-[#139a9d]/50'
                          : 'border-slate-200 hover:border-slate-300'
                          } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                        onClick={() => isEditing && handleExerciseModeToggle(mode.value, !isSelected)}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`mode-${mode.value}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => isEditing && handleExerciseModeToggle(mode.value, checked as boolean)}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected
                            ? 'bg-gradient-to-br from-[#139a9d] to-[#0f7a7d]'
                            : 'bg-slate-100'
                            }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${isSelected ? 'text-[#0f7a7d]' : 'text-slate-900'}`}>{mode.label}</h4>
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

          {/* CV Section */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Curriculum Vitae
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.cv_url ? (
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-800">CV téléchargé</h4>
                      <p className="text-sm text-emerald-600">Votre CV est disponible pour les employeurs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(profile.cv_url, '_blank')}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCVDelete}
                      disabled={uploadingCV}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {uploadingCV ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-slate-400 transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun CV téléchargé</h3>
                  <p className="text-slate-600 mb-4">Téléchargez votre CV en format PDF pour améliorer vos candidatures</p>
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all cursor-pointer shadow-lg shadow-purple-500/25">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      className="hidden"
                      disabled={uploadingCV}
                    />
                    {uploadingCV ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Télécharger mon CV
                      </>
                    )}
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Format PDF uniquement, taille max: 10MB</p>
                </div>
              )}

              {/* Replace CV Option */}
              {profile.cv_url && (
                <div className="text-center">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all cursor-pointer border border-slate-300">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      className="hidden"
                      disabled={uploadingCV}
                    />
                    {uploadingCV ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        Remplacement...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Remplacer le CV
                      </>
                    )}
                  </label>
                </div>
              )}
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
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#139a9d] to-[#0f7a7d] hover:from-[#0f7a7d] hover:to-[#139a9d] shadow-lg shadow-[#139a9d]/30"
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

        {/* Password Change Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le mot de passe</DialogTitle>
              <DialogDescription>
                Entrez votre mot de passe actuel et choisissez un nouveau mot de passe.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="h-12 rounded-xl"
                  placeholder="Au moins 6 caractères"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                disabled={changingPassword}
              >
                Annuler
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-gradient-to-r from-[#139a9d] to-[#0f7a7d]"
              >
                {changingPassword ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changement...
                  </div>
                ) : (
                  'Changer le mot de passe'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}