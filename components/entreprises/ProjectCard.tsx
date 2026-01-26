import Image from 'next/image'

interface ProjectCardProps {
    title: string
    description: string | null
    imageUrl: string | null
    projectUrl: string | null
    completionDate: string | null
}

export default function ProjectCard({
    title, description, imageUrl, projectUrl, completionDate
}: ProjectCardProps) {
    return (
        <article className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700 transition-all duration-300">
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-700">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 dark:text-slate-600">
                        <span className="material-icons-round text-4xl">image</span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {title}
                </h4>

                {completionDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                        <span className="material-icons-round text-sm">event_available</span>
                        <span>Réalisé le {new Date(completionDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                )}

                {description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                        {description}
                    </p>
                )}

                {projectUrl && (
                    <a
                        href={projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-[#0f766e] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                        Voir le projet
                        <span className="material-icons-round text-sm ml-1">open_in_new</span>
                    </a>
                )}
            </div>
        </article>
    )
}
