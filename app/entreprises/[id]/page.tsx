'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ProjectCard from '@/components/entreprises/ProjectCard'

interface Project {
    id: string
    title: string
    description: string
    image_url: string | null
    project_url: string | null
    completion_date: string | null
}

interface CompanyDetails {
    id: string
    name: string
    sector: string
    description: string | null
    email: string
    phone: string
    created_at: string
    projects: Project[]
}

export default function CompanyProfilePage() {
    const params = useParams()
    const [company, setCompany] = useState<CompanyDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchCompanyDetails(params.id as string)
        }
    }, [params.id])

    const fetchCompanyDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/entreprises/public/${id}`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setCompany(data)
        } catch (error) {
            console.error('Error fetching company details:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f766e]"></div>
            </div>
        )
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Entreprise non trouvée</h2>
                <Link
                    href="/entreprises"
                    className="text-[#0f766e] hover:underline flex items-center gap-2"
                >
                    <span className="material-icons-round">arrow_back</span>
                    Retour à la liste
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">

            {/* Header / Cover */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {/* Banner Pattern */}
                <div className="h-48 bg-[#0f766e] dark:bg-teal-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 pb-8">
                        {/* Logo Placeholder */}
                        <div className="h-32 w-32 rounded-2xl bg-white dark:bg-slate-700 shadow-xl flex items-center justify-center text-slate-300 dark:text-slate-500 border-4 border-white dark:border-slate-800">
                            <span className="material-icons-round text-6xl">business</span>
                        </div>

                        <div className="flex-grow mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                {company.name}
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                    <span className="material-icons-round text-sm">category</span>
                                    {company.sector}
                                </span>
                                <span className="flex items-center gap-1 text-sm">
                                    <span className="material-icons-round text-sm">calendar_today</span>
                                    Membre depuis {new Date(company.created_at).getFullYear()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4 md:mt-0">
                            <a
                                href={`mailto:${company.email}`}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0f766e] hover:bg-teal-700 text-white rounded-lg transition-colors shadow-sm font-medium"
                            >
                                <span className="material-icons-round text-sm">email</span>
                                Contacter
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* About Section */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-icons-round text-[#0f766e]">info</span>
                            À propos
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            {company.description ? (
                                <p className="whitespace-pre-line">{company.description}</p>
                            ) : (
                                <p className="italic text-slate-400">Aucune description fournie.</p>
                            )}
                        </div>
                    </section>

                    {/* Portfolio Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-icons-round text-[#0f766e]">folder_special</span>
                            Portfolio & Projets
                        </h2>

                        {company.projects && company.projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {company.projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        title={project.title}
                                        description={project.description}
                                        imageUrl={project.image_url}
                                        projectUrl={project.project_url}
                                        completionDate={project.completion_date}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
                                <span className="material-icons-round text-5xl text-slate-300 dark:text-slate-600 mb-3">perm_media</span>
                                <p className="text-slate-500 dark:text-slate-400">Cette entreprise n'a pas encore ajouté de projets à son portfolio.</p>
                            </div>
                        )}
                    </section>

                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                    {/* Contact Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Coordonnées</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-[#0f766e] dark:text-teal-400">
                                    <span className="material-icons-round text-sm">email</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase">Email</p>
                                    <a href={`mailto:${company.email}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-[#0f766e] transition-colors break-all">
                                        {company.email}
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-[#0f766e] dark:text-teal-400">
                                    <span className="material-icons-round text-sm">phone</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase">Téléphone</p>
                                    <a href={`tel:${company.phone}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-[#0f766e] transition-colors">
                                        {company.phone}
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </div>
    )
}
