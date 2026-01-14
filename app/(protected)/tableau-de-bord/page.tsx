'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  FileText, 
  CreditCard, 
  Briefcase, 
  Settings, 
  Bell, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Calendar
} from 'lucide-react'

interface ProfileData {
  full_name: string
  grad_year: number
  subscription_expiry: string | null
  sponsorships_count: number
  status: string
  is_admin: boolean
  profile_image_url?: string
}

export default function TableauDeBordPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      
      if (res.ok) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateExperience = (gradYear: number) => {
    return new Date().getFullYear() - gradYear
  }

  const calculateDaysRemaining = (expiryDate: string | null) => {
    if (!expiryDate) return 0
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  const yearsOfExperience = profile ? calculateExperience(profile.grad_year) : 0
  const daysRemaining = profile ? calculateDaysRemaining(profile.subscription_expiry) : 0
  const sponsorshipsCount = profile?.sponsorships_count || 0

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/profil" className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white shadow-xl ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all">
              <AvatarImage 
                src={profile?.profile_image_url} 
                alt={profile?.full_name || 'User'}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg sm:text-xl font-bold">
                {profile?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Bienvenue{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 group-hover:text-slate-600 transition-colors">Votre espace personnel OMIGEC</p>
            </div>
          </Link>
        </div>

        {/* Profile Info Card */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Nom complet</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{profile?.full_name || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Année de diplôme</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{profile?.grad_year || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Expérience</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{yearsOfExperience} ans</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Statut</p>
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium">
                  {profile?.status === 'valide' ? 'Actif' : profile?.status || '-'}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Cotisation valide jusqu'au</p>
                  <p className="text-sm sm:text-base font-semibold text-slate-900">31 décembre 2026</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Link href="/profil" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Mon Profil
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Gérer mes infos</p>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-pink-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
                    Mes Documents
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mes fichiers</p>
                </div>
              </Link>

              <Link href="/cotisation" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Cotisation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Payer</p>
                </div>
              </Link>

              <Link href="/emplois" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors">
                    Offres d'emploi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Opportunités</p>
                </div>
              </Link>

              <Link href="/mes-candidatures" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Candidatures
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mes postulations</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Admin Link */}
        {profile?.is_admin && (
          <div className="text-center">
            <Link href="/admin" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Accéder au panneau admin
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
