'use client'

import { useState, useEffect } from 'react'
import CompanyCard from '@/components/entreprises/CompanyCard'

interface Company {
    id: string
    name: string
    sector: string
    description: string | null
    created_at: string
    status: string
}

export default function EntreprisesPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchCompanies()
    }, [])

    const fetchCompanies = async (query: string = '') => {
        setLoading(true)
        try {
            const url = query
                ? `/api/entreprises/public?q=${encodeURIComponent(query)}`
                : '/api/entreprises/public'

            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setCompanies(data)
        } catch (error) {
            console.error('Error fetching companies:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchCompanies(searchTerm)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Hero Section */}
            <div className="bg-[#0f766e] dark:bg-teal-900 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-6">
                        Découvrez nos Entreprises Partenaires
                    </h1>
                    <p className="mt-4 text-xl text-teal-100 max-w-3xl mx-auto mb-10">
                        Explorez les profils des meilleures entreprises de construction et d'ingénierie en Mauritanie.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                className="w-full px-6 py-4 rounded-full text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-500/30 shadow-lg text-lg"
                                placeholder="Rechercher une entreprise..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bg-[#0f766e] text-white p-2.5 rounded-full hover:bg-teal-700 transition-colors"
                            >
                                <span className="material-icons-round">search</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : companies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {companies.map((company) => (
                            <CompanyCard
                                key={company.id}
                                id={company.id}
                                name={company.name}
                                sector={company.sector}
                                description={company.description}
                                createdAt={company.created_at}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <span className="material-icons-round text-6xl text-slate-300 dark:text-slate-600 mb-4">business_off</span>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-white">Aucune entreprise trouvée</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Essayez de modifier vos termes de recherche.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
