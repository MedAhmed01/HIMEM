'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type UserType = 'ingenieur' | 'entreprise'

function ConnexionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<UserType>('ingenieur')
  const [identifier, setIdentifier] = useState('') // Email ou téléphone
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
      let loginEmail = identifier

      // Si l'identifiant ne contient pas @, c'est probablement un numéro de téléphone
      if (!identifier.includes('@')) {
        // Appeler l'API pour obtenir l'email à partir du téléphone
        const phoneRes = await fetch('/api/auth/phone-to-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: identifier, userType })
        })

        if (!phoneRes.ok) {
          const phoneData = await phoneRes.json()
          setError(phoneData.error || 'Numéro de téléphone non trouvé')
          return
        }

        const phoneData = await phoneRes.json()
        loginEmail = phoneData.email
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) {
        setError('Identifiant ou mot de passe incorrect')
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
      <div className="min-h-screen flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
          <img 
            alt="Architecture and Engineering" 
            className="absolute inset-0 object-cover w-full h-full mix-blend-overlay opacity-50" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI4f5p58dgu1DMYIvIdUJn4yjd7v6YY_aki5yAC1JpgErhzewLLr61YhHIkRynqOoU0q6tOPqhL7jTNxnNl9QmF9g7VM27IlTZALuStCKpt8RZG-W5jtiyXSybSoowxHGgIaGUav9rf_8njwFFZQvG5lJuGav0qMPXeW7_q-lxYzFgP7uGgk1w_9n7i5UpWlE6_aLP_uiyoDASy9WsTH9POx3A0k2DxtOCc9tpjT7n1DqnZDvtl01G7Pug0JN0cFKA65Hl_hCmudA"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-teal-900/90"></div>
          <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
            <div className="mb-12">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-8">
                <span className="material-symbols-outlined text-primary text-4xl">architecture</span>
              </div>
              <h1 className="font-display text-5xl xl:text-6xl text-white leading-tight mb-6">
                Accédez à votre espace <br/>
                <span className="italic">OMIGEC</span>
              </h1>
              <p className="text-teal-50 text-xl font-light max-w-md leading-relaxed">
                Le portail d'excellence pour les ingénieurs et entreprises du secteur de la construction. Connectez-vous pour gérer vos projets et votre profil.
              </p>
            </div>
            <div className="flex gap-4 mt-8">
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <div className="text-white font-bold text-2xl">15k+</div>
                <div className="text-teal-100 text-sm">Ingénieurs certifiés</div>
              </div>
              <div className="glass-effect p-4 rounded-xl border border-white/10">
                <div className="text-white font-bold text-2xl">2.4k</div>
                <div className="text-teal-100 text-sm">Entreprises</div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 p-12 text-white/40 text-xs tracking-widest uppercase">
            © 2026 OMIGEC — L'ingénierie du futur
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-white dark:bg-slate-900">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined">login</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <Link 
                className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors mb-8 group" 
                href="/"
              >
                <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Retour à l'accueil
              </Link>
              <h2 className="text-3xl font-display text-slate-800 dark:text-white mb-2">Connexion</h2>
              <p className="text-slate-500 dark:text-slate-400">Connectez-vous à votre compte OMIGEC</p>
            </div>

            {/* User Type Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                  userType === 'ingenieur' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
                onClick={() => setUserType('ingenieur')}
              >
                <span className="material-symbols-outlined">person</span>
                Ingénieur
              </button>
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                  userType === 'entreprise' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                }`}
                onClick={() => setUserType('entreprise')}
              >
                <span className="material-symbols-outlined">business</span>
                Entreprise
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">!</span>
                </div>
                <div>
                  <p className="font-bold text-red-800 dark:text-red-200">Erreur</p>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" htmlFor="identifier">
                  Email ou Téléphone
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-primary rounded-xl dark:text-white transition-all" 
                    id="identifier" 
                    placeholder="votre@email.com ou 06XXXXXXXX" 
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                    Mot de passe
                  </label>
                  <Link className="text-xs text-primary hover:underline font-medium" href="/reset-password">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
                  <input 
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-primary rounded-xl dark:text-white transition-all" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 hover:text-primary transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              <button 
                className="w-full bg-primary hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 tracking-widest">Ou continuer avec</span>
              </div>
            </div>

            {/* LinkedIn Login */}
            <button className="w-full border-2 border-slate-100 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 py-3 rounded-xl flex items-center justify-center gap-3 transition-all font-medium text-slate-700 dark:text-slate-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
              Se connecter avec LinkedIn
            </button>

            {/* Footer Links */}
            <div className="mt-10 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Pas encore de compte ?{' '}
                {userType === 'entreprise' ? (
                  <Link className="text-primary font-bold hover:underline inline-flex items-center gap-1" href="/inscription-entreprise">
                    Inscrivez votre entreprise
                    <span className="material-symbols-outlined text-[16px]">business</span>
                  </Link>
                ) : (
                  <Link className="text-primary font-bold hover:underline inline-flex items-center gap-1" href="/inscription">
                    Inscrivez-vous
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  </Link>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle Button */}
      <button 
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group" 
        onClick={() => {
          document.documentElement.classList.toggle('dark')
        }}
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 group-hover:rotate-12 transition-transform">
          dark_mode
        </span>
      </button>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConnexionForm />
    </Suspense>
  )
}