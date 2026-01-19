import Link from 'next/link'

interface ServiceCardProps {
  icon: string
  title: string
  description: string
  link: string
  color: string
}

export default function ServiceCard({ icon, title, description, link, color }: ServiceCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6 text-white shadow-lg`}>
        <span className="material-icons-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{description}</p>
      <Link 
        href={link}
        className="inline-flex items-center text-[#148d8d] font-semibold group-hover:gap-2 transition-all"
      >
        En savoir plus
        <span className="material-icons-outlined ml-2 text-sm transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
      </Link>
    </div>
  )
}