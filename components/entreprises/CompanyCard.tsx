import Link from 'next/link'

interface CompanyCardProps {
    id: string
    name: string
    sector: string
    description: string | null
    logo?: string // Not used yet but good to have in interface
    createdAt: string
}

export default function CompanyCard({
    id, name, sector, description, createdAt
}: CompanyCardProps) {
    // Format description snippet
    const descriptionSnippet = description
        ? (description.length > 100 ? description.substring(0, 100) + '...' : description)
        : 'Aucune description disponible.'

    return (
        <Link href={`/entreprises/${id}`}>
            <article className="group h-full flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft hover:shadow-xl dark:shadow-none dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-700 transition-all duration-300 relative overflow-hidden cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0f766e] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>

                <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner flex-shrink-0">
                        <span className="material-icons-round text-2xl">business</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#0f766e] dark:group-hover:text-teal-400 transition-colors">
                            {name}
                        </h3>
                        <span className="text-sm font-medium text-[#0f766e] dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full border border-teal-100 dark:border-teal-800/50">
                            {sector}
                        </span>
                    </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">
                    {descriptionSnippet}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <span className="material-icons-round text-sm">calendar_today</span>
                        Inscrit depuis {new Date(createdAt).getFullYear()}
                    </span>
                    <span className="inline-flex items-center text-[#0f766e] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Voir le profil
                        <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                    </span>
                </div>
            </article>
        </Link>
    )
}
