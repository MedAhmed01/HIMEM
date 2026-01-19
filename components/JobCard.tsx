import Link from 'next/link'

interface JobCardProps {
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

const getDomainColor = (domain: string) => {
  const colors: { [key: string]: string } = {
    'Infrastructure & Transport': 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-100 dark:border-teal-800/50',
    'Bâtiment & Constructions': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800/50',
    'Gestion de Projet': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50',
    'Informatique': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100 dark:border-purple-800/50',
    'Design': 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-100 dark:border-pink-800/50'
  }
  return colors[domain] || 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-100 dark:border-gray-800/50'
}

export default function JobCard({ 
  id, title, company, location, deadline, contractType, type, domains, icon 
}: JobCardProps) {
  return (
    <Link href={`/offres-emploi/${id}`}>
      <article className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft hover:shadow-xl dark:shadow-none dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-700 transition-all duration-300 relative overflow-hidden cursor-pointer">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0f766e] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Company Icon */}
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
              <span className="material-icons-round text-3xl">{icon}</span>
            </div>
          </div>

          {/* Job Content */}
          <div className="flex-grow space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#0f766e] dark:group-hover:text-teal-400 transition-colors">
                  {title}
                </h3>
                <span className="text-[#0f766e] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium text-sm flex items-center gap-1 mt-1 w-fit">
                  {company}
                  <span className="material-icons-round text-[14px]">open_in_new</span>
                </span>
              </div>
              <div className="sm:hidden mt-2">
                <span className="inline-flex items-center text-[#0f766e] text-sm font-semibold">
                  Voir l'offre 
                  <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="material-icons-round text-lg text-slate-400 dark:text-slate-500">location_on</span>
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-icons-round text-lg text-slate-400 dark:text-slate-500">event</span>
                <span>Expire le {deadline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-icons-round text-lg text-slate-400 dark:text-slate-500">schedule</span>
                <span>{type}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                {contractType}
              </span>
              {domains.map((domain, index) => (
                <span key={index} className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDomainColor(domain)}`}>
                  {domain}
                </span>
              ))}
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="hidden sm:flex items-center justify-center pl-4 border-l border-slate-100 dark:border-slate-700 h-full self-stretch">
            <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-700 group-hover:bg-[#0f766e] group-hover:text-white dark:group-hover:bg-teal-500 dark:group-hover:text-white flex items-center justify-center transition-all text-slate-400 dark:text-slate-400">
              <span className="material-icons-round">chevron_right</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}