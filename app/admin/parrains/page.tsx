'use client'

import { useEffect, useState } from 'react'
import { 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Mail, 
  Calendar,
  Badge,
  History,
  Bell,
  Palette
} from 'lucide-react'

interface Engineer {
  id: string
  full_name: string
  nni: string
  email: string
  grad_year: number
}

interface Reference {
  id: string
  engineer_id: string
  added_at: string
  engineer: Engineer
}

export default function ParrainsPage() {
  const [references, setReferences] = useState<Reference[]>([])
  const [availableEngineers, setAvailableEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const res = await fetch('/api/admin/parrains')
    const data = await res.json()
    if (data.references) setReferences(data.references)
    if (data.availableEngineers) setAvailableEngineers(data.availableEngineers)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAction = async (action: 'add' | 'remove', id: string) => {
    const res = await fetch('/api/admin/parrains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id })
    })
    if (res.ok) loadData()
  }

  const calculateExperience = (gradYear: number) => {
    return new Date().getFullYear() - gradYear
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Progress Bar */}
      <div className="h-1 bg-teal-600 w-full fixed top-0 left-0 z-50"></div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Parrains</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Gérer les ingénieurs référents et les demandes de parrainage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
            <img 
              alt="Admin Avatar" 
              className="h-full w-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp6sVFe_V-KLWC1wpequKSp7TWcOMC-n8r4nmNNWVJBFjpwKYyoXgNXQUSBSpjZnodJ2CGG2sryC78P2_mzkwZagMGNbSTKKRNqTPvvl3iZmXV7-2xVg9ysqvH3PEIuq-6y05ye7oJ5UfCQtECRHH1YyFbrHdYFBKqR4GFNgGhfgrSZJMImkMRgEbXzJa78YIE1AM8EjzOatAqh6a5z5D10CB3hl8Wq2kZO2LdC4rRwmyIZGaO9xgIZ2c59cFugi8jrvS2vmYV9RAL"
            />
          </div>
        </div>
      </header>

      {/* Current Parrains Section */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="text-teal-600 w-5 h-5" />
            Parrains Actuels
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {references.length} Actif{references.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {references.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Aucun parrain</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Ajoutez des ingénieurs comme parrains</p>
            </div>
          ) : (
            references.map((ref) => (
              <div
                key={ref.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-200 group"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {getInitials(ref.engineer.full_name)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {ref.engineer.full_name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
                        Parrain
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Badge className="w-4 h-4 text-slate-400" />
                        <span>NNI: {ref.engineer.nni}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a 
                          className="hover:text-teal-600 transition-colors truncate" 
                          href={`mailto:${ref.engineer.email}`}
                        >
                          {ref.engineer.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <History className="w-4 h-4 text-slate-400" />
                        <span>{calculateExperience(ref.engineer.grad_year)} ans d'expérience</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 mt-4 md:mt-0 w-full md:w-auto">
                    <button
                      onClick={() => handleAction('remove', ref.id)}
                      className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-red-200 dark:border-red-900/50 shadow-sm text-sm font-medium rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <UserMinus className="mr-2 w-4 h-4" />
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Available Engineers Section */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="text-teal-600 w-5 h-5" />
            Ingénieurs Disponibles
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {availableEngineers.length} Disponible{availableEngineers.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {availableEngineers.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">Aucun ingénieur disponible</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Tous les ingénieurs éligibles sont déjà parrains
              </p>
            </div>
          ) : (
            availableEngineers.map((engineer) => (
              <div
                key={engineer.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-200 group"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                      {getInitials(engineer.full_name)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {engineer.full_name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Badge className="w-4 h-4 text-slate-400" />
                        <span>NNI: {engineer.nni}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{engineer.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{calculateExperience(engineer.grad_year)} ans d'expérience</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 mt-4 md:mt-0 w-full md:w-auto">
                    <button
                      onClick={() => handleAction('add', engineer.id)}
                      className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-all"
                    >
                      <UserPlus className="mr-2 w-4 h-4" />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Floating Theme Toggle Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transform hover:-translate-y-1">
          <Palette className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}