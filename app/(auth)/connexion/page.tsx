'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, LogIn, Sparkles, ArrowLeft, Eye, EyeOff, Building2, User } from 'lucide-react'

type UserType = 'ingenieur' | 'entreprise'

function ConnexionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<UserType>('ingenieur')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'entreprise') {
      setUserType('entreprise')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Email ou mot de passe incorrect')
        return
      }

      if (data.user) {
        // Utiliser l'API pour vérifier le type d'utilisateur (bypass RLS)
        const checkRes = await fetch('/api/auth/check-user-type')
        const checkData = await checkRes.json()

        if (!checkRes.ok) {
          setError(checkData.error || 'Erreur lors de la vérification du compte')
          await supabase.auth.signOut()
          return
        }

        if (userType === 'entreprise') {
          // Vérifier si c'est une entreprise
          if (checkData.type !== 'entreprise') {
            setError('Ce compte n\'est pas associé à une entreprise')
            await supabase.auth.signOut()
            return
          }

          if (checkData.status === 'en_attente') {
            setError('Votre compte est en attente de validation')
            await supabase.auth.signOut()
            return
          }

          if (checkData.status === 'suspendu') {
            setError('Votre compte a été suspendu')
            await supabase.auth.signOut()
            return
          }

          router.push('/entreprise/tableau-de-bord')
        } else {
          // Connexion ingénieur
          if (checkData.type === 'entreprise') {
            setError('Ce compte est associé à une entreprise. Utilisez l\'onglet Entreprise.')
            await supabase.auth.signOut()
            return
          }

          if (checkData.isAdmin) {
            router.push('/admin')
          } else {
            router.push('/tableau-de-bord')
          }
        }
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Blue Top Bar */}
          <div className="h-2 bg-blue-600"></div>
          
          <CardHeader className="space-y-4 text-center pt-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              {userType === 'entreprise' ? (
                <Building2 className="w-8 h-8 text-white" />
              ) : (
                <LogIn className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold text-blue-600">
              Connexion
            </CardTitle>
            <CardDescription className="text-base">
              {userType === 'entreprise' 
                ? 'Connectez-vous à votre espace entreprise'
                : 'Connectez-vous à votre compte OMIGEC'
              }
            </CardDescription>

            {/* User Type Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setUserType('ingenieur')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  userType === 'ingenieur'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                Ingénieur
              </button>
              <button
                type="button"
                onClick={() => setUserType('entreprise')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  userType === 'entreprise'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Entreprise
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-12 pr-12 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-lg">!</span>
                  </div>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-medium shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-slate-600">
                Pas encore de compte ?{' '}
                {userType === 'entreprise' ? (
                  <Link href="/inscription-entreprise" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Inscrivez votre entreprise
                  </Link>
                ) : (
                  <Link href="/inscription" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Inscrivez-vous
                  </Link>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="h-2 bg-blue-600"></div>
            <CardContent className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-slate-600">Chargement...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <ConnexionForm />
    </Suspense>
  )
}
