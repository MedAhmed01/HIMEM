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
  Calendar,
  Languages
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

const translations = {
  fr: {
    welcome: 'Bienvenue',
    personalSpace: 'Votre espace personnel OMIGEC',
    fullName: 'Nom complet',
    gradYear: 'Année de diplôme',
    experience: 'Expérience',
    years: 'ans',
    status: 'Statut',
    active: 'Actif',
    subscriptionValid: 'Cotisation valide jusqu\'au',
    quickActions: 'Actions rapides',
    myProfile: 'Mon Profil',
    manageInfo: 'Gérer mes infos',
    myDocuments: 'Mes Documents',
    myFiles: 'Mes fichiers',
    subscription: 'Cotisation',
    pay: 'Payer',
    jobOffers: 'Offres d\'emploi',
    opportunities: 'Opportunités',
    applications: 'Candidatures',
    myApplications: 'Mes postulations',
    adminPanel: 'Accéder au panneau admin',
    loading: 'Chargement...'
  },
  ar: {
    welcome: 'مرحبا',
    personalSpace: 'مساحتك الشخصية OMIGEC',
    fullName: 'الاسم الكامل',
    gradYear: 'سنة التخرج',
    experience: 'الخبرة',
    years: 'سنوات',
    status: 'الحالة',
    active: 'نشط',
    subscriptionValid: 'الاشتراك صالح حتى',
    quickActions: 'إجراءات سريعة',
    myProfile: 'ملفي الشخصي',
    manageInfo: 'إدارة معلوماتي',
    myDocuments: 'مستنداتي',
    myFiles: 'ملفاتي',
    subscription: 'الاشتراك',
    pay: 'دفع',
    jobOffers: 'عروض العمل',
    opportunities: 'الفرص',
    applications: 'الطلبات',
    myApplications: 'طلباتي',
    adminPanel: 'الوصول إلى لوحة الإدارة',
    loading: 'جاري التحميل...'
  }
}

export default function TableauDeBordPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr')

  const t = translations[language]

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'ar' : 'fr')
  }

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
          <p className="text-slate-600 font-medium">{t.loading}</p>
        </div>
      </div>
    )
  }

  const yearsOfExperience = profile ? calculateExperience(profile.grad_year) : 0
  const daysRemaining = profile ? calculateDaysRemaining(profile.subscription_expiry) : 0
  const sponsorshipsCount = profile?.sponsorships_count || 0

  return (
    <div className={`min-h-screen py-8 px-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
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
                {t.welcome}{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 group-hover:text-slate-600 transition-colors">{t.personalSpace}</p>
            </div>
          </Link>
          
          <Button 
            onClick={toggleLanguage}
            variant="outline" 
            size="sm"
            className="rounded-xl border-2 gap-2"
          >
            <Languages className="w-4 h-4" />
            {language === 'fr' ? 'العربية' : 'Français'}
          </Button>
        </div>

        {/* Profile Info Card */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">{t.fullName}</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{profile?.full_name || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">{t.gradYear}</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{profile?.grad_year || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">{t.experience}</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">{yearsOfExperience} {t.years}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">{t.status}</p>
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium">
                  {profile?.status === 'valide' ? t.active : profile?.status || '-'}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{t.subscriptionValid}</p>
                  <p className="text-sm sm:text-base font-semibold text-slate-900">31 {language === 'ar' ? 'ديسمبر' : 'décembre'} 2026</p>
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
              {t.quickActions}
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
                    {t.myProfile}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.manageInfo}</p>
                </div>
              </Link>

              <Link href="/documents" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-pink-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
                    {t.myDocuments}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.myFiles}</p>
                </div>
              </Link>

              <Link href="/cotisation" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {t.subscription}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.pay}</p>
                </div>
              </Link>

              <Link href="/emplois" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors">
                    {t.jobOffers}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.opportunities}</p>
                </div>
              </Link>

              <Link href="/mes-candidatures" className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {t.applications}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.myApplications}</p>
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
              {t.adminPanel}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
