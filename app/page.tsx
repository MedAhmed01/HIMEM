'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PublicSearchBar } from '@/components/search/PublicSearchBar'
import LatestArticles from '@/components/LatestArticles'

interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url?: string | null
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async () => {
    try {
      const res = await fetch('/api/sponsors')
      const data = await res.json()
      setSponsors(data.sponsors || [])
    } catch (error) {
      console.error('Error loading sponsors:', error)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const getColorFromName = (name: string) => {
    const colors = [
      'text-red-600',
      'text-blue-600',
      'text-green-600',
      'text-yellow-600',
      'text-purple-600',
      'text-pink-600',
      'text-indigo-600',
      'text-orange-600'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className={`font-body bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-header transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center flex-shrink-0 group cursor-pointer">
              <img
                src="/Icon1.png"
                alt="OMIGEC Logo"
                className="w-10 h-10 mr-3 transition-transform group-hover:scale-105 object-contain"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold text-slate-800 dark:text-white leading-none tracking-tight">OMIGEC</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Ordre Mauritanien des Ingénieurs en Génie Civil</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              <nav className="flex items-center space-x-1 mr-6">
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#14919B] dark:hover:text-[#14919B] transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" href="/">Accueil</Link>
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#14919B] dark:hover:text-[#14919B] transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" href="/articles">Articles</Link>
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#14919B] dark:hover:text-[#14919B] transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" href="/services">Services</Link>
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#14919B] dark:hover:text-[#14919B] transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" href="/offres-emploi">Emplois</Link>
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#14919B] dark:hover:text-[#14919B] transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" href="/contact">Contact</Link>
              </nav>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <div className="flex items-center space-x-3 ml-4">
                <Link className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#14919B] dark:hover:text-[#14919B] transition-colors px-3 py-2" href="/connexion">Connexion</Link>
                <Link className="group relative flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-[#14919B] rounded-full hover:bg-[#0e6b73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14919B] shadow-sm hover:shadow-md" href="/inscription">
                  <span className="material-icons-outlined text-lg mr-1.5 group-hover:animate-pulse">person_add</span>
                  Inscription
                </Link>
              </div>
            </div>
            <div className="flex items-center lg:hidden">
              <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors" type="button">
                <span className="sr-only">Open menu</span>
                <span className="material-icons-outlined text-2xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4F5F5]/30 to-transparent dark:from-[#0E646C]/10 dark:to-background-dark pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14919B]/10 text-[#14919B] dark:bg-[#14919B]/20 dark:text-[#14919B] text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="material-icons-outlined text-sm">verified</span>
                Plateforme Officielle
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-slate-900 dark:text-white mb-8">
                Ordre Mauritanien des <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14919B] to-[#0E646C]">Ingénieurs</span> <br />
                en Génie Civil
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-10 border-l-4 border-[#14919B] pl-6">
                La plateforme digitale officielle pour la gestion, la vérification et l'accompagnement des ingénieurs en génie civil en Mauritanie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-[#14919B] hover:bg-[#0E646C] transition-all shadow-xl shadow-[#14919B]/25 transform hover:-translate-y-1" href="/inscription">
                  <span className="material-icons-outlined mr-2">group_add</span>
                  Rejoindre l'OMIGEC
                </Link>
                <Link className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-slate-700 bg-white dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:-translate-y-1" href="/connexion">
                  Se connecter
                  <span className="material-icons-outlined ml-2">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#14919B]/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-overlay animate-pulse"></div>
              <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-[#D4F5F5] rounded-full blur-3xl mix-blend-multiply dark:bg-[#0E646C]/20 dark:mix-blend-overlay"></div>
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-[#14919B]/10 rounded-xl text-[#14919B]">
                    <span className="material-icons-outlined text-3xl">verified_user</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Vérifier un Ingénieur</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Recherchez instantanément par NNI ou nom dans notre base de données officielle.</p>
                  </div>
                </div>
                <PublicSearchBar />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Marquee */}
      <div className="w-full bg-white dark:bg-slate-900 py-8 border-y border-slate-100 dark:border-slate-800 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-6">
          Nos Partenaires de Confiance
        </p>
        {sponsors.length > 0 ? (
          <div className="marquee-container relative w-full overflow-hidden">
            <div className="flex w-[200%] animate-marquee">
              {/* First set of sponsors */}
              <div className="flex items-center justify-around w-1/2 px-4 gap-12">
                {sponsors.map((sponsor) => (
                  <div
                    key={`first-${sponsor.id}`}
                    className="group cursor-pointer opacity-70 hover:opacity-100 transition-all duration-300"
                    onClick={() => sponsor.website_url && window.open(`https://${sponsor.website_url}`, '_blank')}
                  >
                    <div className="flex items-center justify-center min-w-[120px] h-16">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-12 w-auto object-contain max-w-[140px] transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${getColorFromName(sponsor.name)} text-sm font-bold border-2 border-current`}>
                            {getInitials(sponsor.name)}
                          </div>
                          <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">
                            {sponsor.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Second set of sponsors (duplicate for seamless loop) */}
              <div className="flex items-center justify-around w-1/2 px-4 gap-12">
                {sponsors.map((sponsor) => (
                  <div
                    key={`second-${sponsor.id}`}
                    className="group cursor-pointer opacity-70 hover:opacity-100 transition-all duration-300"
                    onClick={() => sponsor.website_url && window.open(`https://${sponsor.website_url}`, '_blank')}
                  >
                    <div className="flex items-center justify-center min-w-[120px] h-16">
                      {sponsor.logo_url ? (
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-12 w-auto object-contain max-w-[140px] transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${getColorFromName(sponsor.name)} text-sm font-bold border-2 border-current`}>
                            {getInitials(sponsor.name)}
                          </div>
                          <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">
                            {sponsor.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 dark:text-slate-600 text-sm">
              Aucun partenaire configuré pour le moment
            </p>
          </div>
        )}
      </div>

      {/* Services Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#14919B] font-bold tracking-wider uppercase text-sm">Services Numériques</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-slate-900 dark:text-white mt-3 mb-6">Une plateforme complète</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Tout ce dont vous avez besoin pour gérer votre carrière d'ingénieur, centralisé en un seul endroit sécurisé.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">how_to_reg</span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Inscription</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Inscrivez-vous en ligne et soumettez vos documents facilement sans déplacement.</p>
            </div>
            <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">verified</span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Validation</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Système de parrainage par des ingénieurs agréés et validation rapide.</p>
            </div>
            <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">assignment_turned_in</span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Vérification</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Vérifiez le statut d'un ingénieur en temps réel pour garantir la conformité.</p>
            </div>
            <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">work_outline</span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Emplois</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Accédez aux offres d'emploi réservées aux membres et postulez directement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <LatestArticles />

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-[#14919B] rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-[#14919B]/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 px-4 md:px-12">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6">Prêt à rejoindre l'OMIGEC ?</h2>
            <p className="text-teal-50 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">Inscrivez-vous dès maintenant et faites partie de l'Ordre Mauritanien des Ingénieurs en Génie Civil pour accéder à tous nos services exclusifs.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/inscription" className="bg-white text-[#14919B] font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all transform hover:-translate-y-1 flex items-center justify-center">
                Commencer l'inscription
                <span className="material-icons-outlined ml-2">arrow_forward</span>
              </Link>
              <Link href="/contact" className="bg-[#14919B] border-2 border-white/30 text-white font-bold py-4 px-10 rounded-xl hover:bg-[#14919B]/80 hover:border-white/50 transition-all flex items-center justify-center">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-[#14919B] p-1.5 rounded text-white">
                  <span className="material-icons-outlined text-xl">engineering</span>
                </div>
                <span className="font-display font-bold text-xl text-slate-900 dark:text-white">OMIGEC</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Ordre Mauritanien des Ingénieurs de Génie Civil œuvre pour l'excellence et l'éthique dans la profession d'ingénieur.</p>
              <div className="flex gap-4 pt-2">
                <a className="text-slate-400 hover:text-[#14919B] transition-colors" href="#">
                  <span className="material-icons-outlined">facebook</span>
                </a>
                <a className="text-slate-400 hover:text-[#14919B] transition-colors" href="#">
                  <span className="material-icons-outlined">share</span>
                </a>
                <a className="text-slate-400 hover:text-[#14919B] transition-colors" href="#">
                  <span className="material-icons-outlined">alternate_email</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Navigation</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-[#14919B] transition-colors" href="/">Accueil</Link></li>
                <li><Link className="hover:text-[#14919B] transition-colors" href="/about">À propos</Link></li>
                <li><Link className="hover:text-[#14919B] transition-colors" href="/services">Services</Link></li>
                <li><Link className="hover:text-[#14919B] transition-colors" href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Services</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-[#14919B] transition-colors" href="/inscription">Inscription au tableau</Link></li>
                <li><Link className="hover:text-[#14919B] transition-colors" href="/emplois">Offres d'emploi</Link></li>
                <li><Link className="hover:text-[#14919B] transition-colors" href="/recherche">Vérification ingénieur</Link></li>
                <li><Link className="hover:text-[#14919B] transition-colors" href="/docs">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="material-icons-outlined text-[#14919B] text-base mt-0.5">location_on</span>
                  <span>ZRB N°0170 (Zone carrefour Bana Blanc)<br />Nouakchott, Mauritanie</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-icons-outlined text-[#14919B] text-base">phone</span>
                  <div className="flex flex-col">
                    <span>+222 34 23 53 65</span>
                    <span>+222 46 99 27 20</span>
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-icons-outlined text-[#14919B] text-base">email</span>
                  <span>contact@omigec.mr</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 text-center md:text-left">© 2026 OMIGEC. Tous droits réservés.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link className="hover:text-[#14919B] transition-colors" href="/privacy">Confidentialité</Link>
              <Link className="hover:text-[#14919B] transition-colors" href="/terms">Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}