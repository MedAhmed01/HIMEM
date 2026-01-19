'use client'

import { useState } from 'react'
import Link from 'next/link'
import ServiceCard from '@/components/ServiceCard'

export default function ServicesPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const services = [
    {
      icon: 'search',
      title: 'Recherche d\'Ingénieurs',
      description: 'Accédez à notre base de données d\'ingénieurs qualifiés et vérifiés pour vos projets les plus ambitieux.',
      link: '/#recherche',
      color: 'bg-teal-500 shadow-teal-500/20'
    },
    {
      icon: 'work_outline',
      title: 'Offres d\'Emploi',
      description: 'Consultez les meilleures opportunités d\'emploi pour ingénieurs en Mauritanie et propulsez votre carrière.',
      link: '/offres-emploi',
      color: 'bg-purple-500 shadow-purple-500/20'
    },
    {
      icon: 'business',
      title: 'Espace Entreprise',
      description: 'Publiez vos offres, gérez vos recrutements et trouvez les talents qui feront la différence.',
      link: '/entreprise',
      color: 'bg-emerald-500 shadow-emerald-500/20'
    },
    {
      icon: 'groups',
      title: 'Réseau Professionnel',
      description: 'Rejoignez la plus grande communauté d\'ingénieurs mauritaniens pour échanger et collaborer.',
      link: '/inscription',
      color: 'bg-orange-500 shadow-orange-500/20'
    },
    {
      icon: 'verified',
      title: 'Vérification de Diplômes',
      description: 'Service sécurisé de vérification et validation des diplômes d\'ingénieurs pour garantir la conformité.',
      link: '/inscription',
      color: 'bg-red-500 shadow-red-500/20'
    },
    {
      icon: 'workspace_premium',
      title: 'Certification',
      description: 'Obtenez votre certification OMIGEC reconnue nationalement et valorisez vos compétences.',
      link: '/inscription',
      color: 'bg-[#00b0ad] shadow-[#00b0ad]/20'
    }
  ]

  return (
    <div className={`font-sans antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="relative overflow-hidden py-24 px-6 bg-gradient-to-br from-[#0d6e6e] via-[#148d8d] to-[#0d6e6e] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <pattern height="10" id="grid" patternUnits="userSpaceOnUse" width="10">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect fill="url(#grid)" height="100%" width="100%"></rect>
          </svg>
        </div>
        
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center flex-shrink-0 group cursor-pointer">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-white mr-3 transition-transform group-hover:scale-105">
                  <span className="material-icons-outlined text-[20px]">engineering</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-white leading-none tracking-tight">OMIGEC</span>
                  <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mt-0.5">Ordre Mauritanien</span>
                </div>
              </Link>
              
              <div className="hidden lg:flex items-center space-x-1">
                <nav className="flex items-center space-x-1 mr-6">
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/">Accueil</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white hover:text-white transition-colors rounded-md bg-white/20" href="/services">Services</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/articles">Articles</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/offres-emploi">Emplois</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/contact">Contact</Link>
                </nav>
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <div className="flex items-center space-x-3 ml-4">
                  <Link className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-3 py-2" href="/connexion">Connexion</Link>
                  <Link className="group relative flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#14919B] transition-all duration-200 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm hover:shadow-md" href="/inscription">
                    <span className="material-icons-outlined text-lg mr-1.5 group-hover:animate-pulse">person_add</span>
                    Inscription
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Nos Services</h1>
          <p className="text-lg md:text-xl text-teal-50/90 max-w-2xl mx-auto font-light leading-relaxed">
            L'OMIGEC offre une gamme complète de services pour les ingénieurs et les entreprises en Mauritanie, favorisant l'excellence et l'innovation.
          </p>
        </div>
      </header>

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto px-6 -mt-12 mb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              link={service.link}
              color={service.color}
            />
          ))}
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Prêt à commencer ?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">
            Rejoignez l'OMIGEC aujourd'hui et accédez à tous nos services exclusifs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/inscription"
              className="w-full sm:w-auto px-8 py-4 bg-[#148d8d] hover:bg-[#0d6e6e] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#148d8d]/20 hover:shadow-xl hover:shadow-[#148d8d]/30 active:scale-95"
            >
              S'inscrire maintenant
            </Link>
            <Link 
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* Dark Mode Toggle */}
      <button 
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform" 
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        <span className={`material-icons-outlined ${isDarkMode ? 'hidden' : 'block'}`}>dark_mode</span>
        <span className={`material-icons-outlined ${isDarkMode ? 'block' : 'hidden'}`}>light_mode</span>
      </button>
    </div>
  )
}
