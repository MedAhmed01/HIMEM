'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface JobDetail {
  id: string
  title: string
  company: string
  location: string
  deadline: string
  contractType: string
  type: string
  domains: string[]
  description: string
  requirements: string[]
  benefits: string[]
  salary?: string
  icon: string
}

export default function JobDetailPage() {
  const params = useParams()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulation de chargement des données
    const fetchJob = async () => {
      // Données d'exemple - à remplacer par un appel API réel
      const jobData: JobDetail = {
        id: params.id as string,
        title: 'Ingénieur en Génie Civil',
        company: 'Mauritanie Construction',
        location: 'Nouakchott',
        deadline: '31/01/2026',
        contractType: 'CDI',
        type: 'Plein temps',
        domains: ['Infrastructure & Transport', 'Bâtiment & Constructions'],
        description: 'Nous recherchons un ingénieur en génie civil expérimenté pour rejoindre notre équipe dynamique. Vous serez responsable de la conception, de la planification et de la supervision de projets de construction majeurs en Mauritanie.',
        requirements: [
          'Diplôme d\'ingénieur en génie civil',
          'Minimum 3 ans d\'expérience dans le BTP',
          'Maîtrise des logiciels AutoCAD et Revit',
          'Connaissance des normes de construction mauritaniennes',
          'Excellentes compétences en communication',
          'Capacité à travailler en équipe'
        ],
        benefits: [
          'Salaire compétitif',
          'Assurance santé complète',
          'Formation continue',
          'Opportunités d\'évolution',
          'Environnement de travail moderne',
          'Projets stimulants'
        ],
        salary: '800,000 - 1,200,000 MRU',
        icon: 'architecture'
      }
      
      setTimeout(() => {
        setJob(jobData)
        setLoading(false)
      }, 1000)
    }

    fetchJob()
  }, [params.id])

  const getDomainColor = (domain: string) => {
    const colors: { [key: string]: string } = {
      'Infrastructure & Transport': 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-100 dark:border-teal-800/50',
      'Bâtiment & Constructions': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800/50',
      'Gestion de Projet': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50'
    }
    return colors[domain] || 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-100 dark:border-gray-800/50'
  }

  if (loading) {
    return (
      <div className={`bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Chargement de l'offre...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className={`bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <span className="material-icons-round text-red-500 text-2xl">error_outline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Offre non trouvée</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Cette offre d'emploi n'existe pas ou n'est plus disponible.</p>
          <Link href="/offres-emploi" className="inline-flex items-center px-6 py-3 bg-[#0f766e] text-white font-medium rounded-full hover:bg-teal-700 transition-colors">
            <span className="material-icons-round text-sm mr-2">arrow_back</span>
            Retour aux offres
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-background-light dark:bg-background-dark text-slate-600 dark:text-slate-300 font-sans antialiased min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/offres-emploi" className="flex items-center text-slate-600 dark:text-slate-300 hover:text-[#0f766e] transition-colors">
              <span className="material-icons-round text-sm mr-2">arrow_back</span>
              Retour aux offres
            </Link>
            <Link href="/" className="flex items-center text-slate-600 dark:text-slate-300 hover:text-[#0f766e] transition-colors">
              <span className="material-icons-round text-sm mr-2">home</span>
              Accueil
            </Link>
          </div>
        </div>
      </nav>

      {/* Job Header */}
      <header className="bg-gradient-to-br from-teal-900 via-[#0f766e] to-teal-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <span className="material-icons-round text-4xl">{job.icon}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-teal-100/80 mb-2 text-sm">
                <span className="material-icons-round text-lg">business_center</span>
                <span>Offre d'emploi</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-teal-100 mb-4">
                <span className="flex items-center gap-2">
                  <span className="material-icons-round text-lg">business</span>
                  {job.company}
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-icons-round text-lg">location_on</span>
                  {job.location}
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-icons-round text-lg">schedule</span>
                  {job.type}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                  {job.contractType}
                </span>
                {job.domains.map((domain, index) => (
                  <span key={index} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Job Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-soft border border-slate-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-icons-round text-[#0f766e]">description</span>
                Description du poste
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{job.description}</p>
            </section>

            {/* Requirements */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-soft border border-slate-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-icons-round text-[#0f766e]">checklist</span>
                Exigences
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <span className="material-icons-round text-[#0f766e] text-lg mt-0.5">check_circle</span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-soft border border-slate-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-icons-round text-[#0f766e]">star</span>
                Avantages
              </h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <span className="material-icons-round text-green-500 text-lg mt-0.5">verified</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Intéressé par cette offre ?
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Postulez dès maintenant et rejoignez notre équipe
                </p>
              </div>
              
              <button className="w-full bg-[#0f766e] hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 mb-4">
                <span className="flex items-center justify-center gap-2">
                  <span className="material-icons-round">send</span>
                  Postuler maintenant
                </span>
              </button>
              
              <button className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-xl transition-colors">
                <span className="flex items-center justify-center gap-2">
                  <span className="material-icons-round">bookmark_border</span>
                  Sauvegarder
                </span>
              </button>
            </div>

            {/* Job Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Informations sur l'offre</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Type de contrat</span>
                  <span className="font-medium text-slate-900 dark:text-white">{job.contractType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Localisation</span>
                  <span className="font-medium text-slate-900 dark:text-white">{job.location}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date limite</span>
                  <span className="font-medium text-slate-900 dark:text-white">{job.deadline}</span>
                </div>
                
                {job.salary && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Salaire</span>
                    <span className="font-medium text-slate-900 dark:text-white">{job.salary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Partager cette offre</h3>
              
              <div className="flex gap-3">
                <button className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <span className="material-icons-round">share</span>
                </button>
                <button className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <span className="material-icons-round">link</span>
                </button>
                <button className="flex-1 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <span className="material-icons-round">email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dark Mode Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          <span className={`material-icons-round ${isDarkMode ? 'hidden' : 'block'}`}>dark_mode</span>
          <span className={`material-icons-round ${isDarkMode ? 'block' : 'hidden'}`}>light_mode</span>
        </button>
      </div>
    </div>
  )
}