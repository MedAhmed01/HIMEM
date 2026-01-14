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
        <div className="flex items-start justify-between">
          <Link href="/profil" className="flex items-center gap-4 group cursor-pointer">
            <Avatar className="w-16 h-16 border-4 border-white shadow-xl ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all">
              <AvatarImage 
                src={profile?.profile_image_url} 
                alt={profile?.full_name || 'User'}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                {profile?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Bienvenue{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-slate-500 group-hover:text-slate-600 transition-colors">Votre espace personnel OMIGEC</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-xl border-2">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl border-2">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-medium">
                      Compte Actif
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Votre statut est à jour</h2>
                  <p className="text-slate-500">Cotisation valide jusqu'au 31 décembre 2026</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Numéro d'agrément</p>
                <p className="text-2xl font-bold gradient-text">OMIGEC-2024-001</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Années d'expérience</p>
                  <p className="text-4xl font-bold text-slate-900">{yearsOfExperience}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Award className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-500"></div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Parrainages effectués</p>
                  <p className="text-4xl font-bold text-slate-900">{sponsorshipsCount}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <User className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Jours restants</p>
                  <p className="text-4xl font-bold text-slate-900">{daysRemaining}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/profil" className="group">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    Mon Profil
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Gérer mes informations</p>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-pink-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-pink-600 transition-colors flex items-center gap-2">
                    Mes Documents
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Consulter mes fichiers</p>
                </div>
              </Link>

              <Link href="/cotisation" className="group">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                    Cotisation
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Payer ma cotisation</p>
                </div>
              </Link>

              <Link href="/emplois" className="group">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-cyan-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors flex items-center gap-2">
                    Offres d'emploi
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Voir les opportunités</p>
                </div>
              </Link>

              <Link href="/mes-candidatures" className="group">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    Mes candidatures
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Suivre mes postulations</p>
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
