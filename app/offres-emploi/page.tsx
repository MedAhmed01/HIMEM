'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import JobCard from '@/components/JobCard'

interface Job {
  id: string
  title: string
  company: string
  location: string
  deadline: string
  contractType: string
  type: string
  domains: string[]
  icon: string
}

export default function EmploisPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationTerm, setLocationTerm] = useState('')
  const [sortBy, setSortBy] = useState('Pertinence')

  // Données d'exemple - à remplacer par des données dynamiques
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Test emploi',
      company: 'Handesti',
      location: 'Nouakchott',
      deadline: '31/01/2026',
      contractType: 'CDI',
      type: 'Plein temps',
      domains: ['Infrastructure & Transport', 'Bâtiment & Constructions'],
      icon: 'domain'
    },
    {
      id: '2',
      title: 'Chef de Projet BTP',
      company: 'Mauritanie Construction',
      location: 'Nouadhibou',
      deadline: '15/02/2026',
      contractType: 'CDD',
      type: 'CDD',
      domains: ['Gestion de Projet'],
      icon: 'architecture'
    },
    {
      id: '3',
      title: 'Développeur Full Stack',
      company: 'Tech Solutions',
      location: 'Télétravail',
      deadline: '28/02/2026',
      contractType: 'Freelance',
      type: 'Freelance',
      domains: ['Informatique', 'Design'],
      icon: 'computer'
    }
  ]

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    job.location.toLowerCase().includes(locationTerm.toLowerCase())
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La recherche est déjà gérée par le filtrage en temps réel
  }

  return (
    <div className={`bg-background-light dark:bg-background-dark text-slate-600 dark:text-slate-300 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="relative bg-gradient-to-br from-teal-900 via-[#0f766e] to-teal-800 pb-24 pt-10 px-6 lg:px-12 overflow-hidden architectural-pattern">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#14b8a6] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-500 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto relative z-10 mb-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center flex-shrink-0 group cursor-pointer">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-white mr-3 transition-transform group-hover:scale-105">
                <span className="material-icons-round text-[20px]">engineering</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold text-white leading-none tracking-tight">OMIGEC</span>
                <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mt-0.5">Ordre Mauritanien</span>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-1">
              <nav className="flex items-center space-x-1 mr-6">
                <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/">Accueil</Link>
                <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/services">Services</Link>
                <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/articles">Articles</Link>
                <Link className="px-3 py-2 text-sm font-medium text-white hover:text-white transition-colors rounded-md bg-white/20" href="/offres-emploi">Emplois</Link>
                <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/contact">Contact</Link>
              </nav>
              <div className="h-6 w-px bg-white/20 mx-2"></div>
              <div className="flex items-center space-x-3 ml-4">
                <Link className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-3 py-2" href="/connexion">Connexion</Link>
                <Link className="group relative flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#0f766e] transition-all duration-200 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm hover:shadow-md" href="/inscription">
                  <span className="material-icons-round text-lg mr-1.5 group-hover:animate-pulse">person_add</span>
                  Inscription
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-teal-100/80 mb-8 text-sm font-medium">
            <span className="material-icons-round text-lg">business_center</span>
            <span>Espace Emploi</span>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Offres d'emploi</h1>
            <p className="text-teal-100 text-lg max-w-2xl font-light">
              Trouvez l'opportunité qui correspond à vos ambitions parmi nos offres exclusives.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="glass-panel rounded-3xl p-2 shadow-2xl flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-icons-round text-white/60 group-focus-within:text-white transition-colors">search</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none text-white placeholder-white/60 focus:ring-0 pl-12 pr-4 py-3 rounded-xl transition-all outline-none"
                  placeholder="Rechercher par titre ou mot-clé..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="hidden md:block w-px h-8 bg-white/20 mx-2"></div>
              
              <div className="flex-1 w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-icons-round text-white/60 group-focus-within:text-white transition-colors">place</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none text-white placeholder-white/60 focus:ring-0 pl-12 pr-4 py-3 rounded-xl transition-all outline-none"
                  placeholder="Ville, région ou code postal"
                  type="text"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>
              
              <button 
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block"
                title="Filtres avancés"
                type="button"
              >
                <span className="material-icons-round">tune</span>
              </button>
              
              <button 
                className="w-full md:w-auto bg-white text-[#0f766e] font-bold py-3 px-8 rounded-full shadow-lg hover:bg-teal-50 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                type="submit"
              >
                Rechercher
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-20">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-slate-800 dark:text-white font-semibold text-lg">
            <span className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm text-sm font-bold mr-2 text-[#0f766e] dark:text-teal-400 border border-slate-100 dark:border-slate-600">
              {filteredJobs.length}
            </span>
            offres trouvées
          </h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">Trier par:</span>
            <select 
              className="bg-white dark:bg-slate-800 border-none text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0f766e] py-2 pl-3 pr-8 cursor-pointer outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Pertinence</option>
              <option>Date (récent)</option>
              <option>Date (ancien)</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              deadline={job.deadline}
              contractType={job.contractType}
              type={job.type}
              domains={job.domains}
              icon={job.icon}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">
              <span className="material-icons-round">chevron_left</span>
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-[#0f766e] text-white shadow-lg shadow-teal-500/30 font-medium">
              1
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              2
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              3
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="material-icons-round">chevron_right</span>
            </button>
          </nav>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-8 mt-12">
        <div className="container mx-auto px-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© 2026 OMIGEC. Tous droits réservés.</p>
        </div>
      </footer>

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