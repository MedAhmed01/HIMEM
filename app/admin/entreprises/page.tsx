'use client'

import { useState, useEffect } from 'react'
import { Entreprise, EntrepriseStatus } from '@/lib/types/database'
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Mail, 
  Phone, 
  AlertCircle, 
  Key,
  CreditCard,
  MoreVertical,
  Ban,
  Check,
  X,
  Plus
} from 'lucide-react'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'

interface EntrepriseWithSubscription extends Entreprise {
  currentSubscription?: {
    id: string
    plan: string
    starts_at: string
    expires_at: string
    is_active: boolean
    payment_status: string
  } | null
  hasActiveSubscription: boolean
}

const STATUS_CONFIG: Record<EntrepriseStatus, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: 'orange', icon: Clock },
  valide: { label: 'Validé', color: 'emerald', icon: CheckCircle },
  suspendu: { label: 'Suspendu', color: 'red', icon: XCircle }
}

export default function AdminEntreprisesPage() {
  const [entreprises, setEntreprises] = useState<EntrepriseWithSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<EntrepriseStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [changePasswordModal, setChangePasswordModal] = useState<{
    isOpen: boolean
    userId: string
    userName: string
  }>({
    isOpen: false,
    userId: '',
    userName: ''
  })

  useEffect(() => {
    fetchEntreprises()
  }, [statusFilter])

  const fetchEntreprises = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      
      const response = await fetch(`/api/admin/entreprises?${params}`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      setEntreprises(data.entreprises || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/entreprises/${id}/validate`, { method: 'POST' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await fetchEntreprises()
      setMessage({ type: 'success', text: 'Entreprise validée avec succès' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspendre cette entreprise ? Toutes ses offres seront désactivées.')) return
    
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/entreprises/${id}/suspend`, { method: 'POST' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await fetchEntreprises()
      setMessage({ type: 'success', text: 'Entreprise suspendue avec succès' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Rejeter cette entreprise ? Cette action est irréversible.')) return
    
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/entreprises/${id}/reject`, { method: 'POST' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await fetchEntreprises()
      setMessage({ type: 'success', text: 'Entreprise rejetée avec succès' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangePassword = (entrepriseId: string, entrepriseName: string) => {
    setChangePasswordModal({
      isOpen: true,
      userId: entrepriseId,
      userName: entrepriseName
    })
  }

  const handlePasswordChangeSuccess = (message: string) => {
    setMessage({ type: 'success', text: message })
  }

  const handlePasswordChangeError = (error: string) => {
    setMessage({ type: 'error', text: error })
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const getStatusBadge = (status: EntrepriseStatus) => {
    const config = STATUS_CONFIG[status]
    const colorClasses = {
      emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[config.color as keyof typeof colorClasses]}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          config.color === 'emerald' ? 'bg-emerald-500' :
          config.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
        }`}></span>
        {config.label}
      </span>
    )
  }

  const getPlanBadge = (plan: string | undefined) => {
    if (!plan) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Clock className="w-3 h-3" />
          Standard
        </span>
      )
    }

    const planConfig = {
      business: { label: 'Business', icon: CreditCard, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-800' },
      premium: { label: 'Premium', icon: CreditCard, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-100 dark:border-purple-800' },
      starter: { label: 'Starter', icon: CreditCard, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-100 dark:border-green-800' }
    }

    const config = planConfig[plan as keyof typeof planConfig] || planConfig.business
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const filteredEntreprises = entreprises.filter(entreprise => {
    const matchesSearch = 
      entreprise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entreprise.nif?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entreprise.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || entreprise.status === statusFilter
    const matchesCategory = !categoryFilter || entreprise.sector?.toLowerCase().includes(categoryFilter.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const counts = {
    total: entreprises.length,
    en_attente: entreprises.filter(e => e.status === 'en_attente').length,
    valide: entreprises.filter(e => e.status === 'valide').length,
    suspendu: entreprises.filter(e => e.status === 'suspendu').length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Entreprises</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérer les entreprises inscrites sur la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {counts.total} entreprise{counts.total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-blue-600 rounded-xl p-5 shadow-lg text-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-300">
            <Building2 className="w-24 h-24" />
          </div>
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-4xl font-bold block mb-1">{counts.total}</span>
              <span className="text-blue-100 font-medium text-sm">Total Entreprises</span>
            </div>
          </div>
        </div>

        {/* En attente */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-orange-500/50 transition-colors group">
          <div className="flex justify-between items-start">
            <div className="bg-orange-50 dark:bg-orange-900/20 w-10 h-10 rounded-lg flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
              {counts.en_attente}
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-3">En attente</span>
        </div>

        {/* Validées */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-emerald-500/50 transition-colors group">
          <div className="flex justify-between items-start">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              {counts.valide}
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-3">Validées</span>
        </div>

        {/* Suspendues */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-red-500/50 transition-colors group">
          <div className="flex justify-between items-start">
            <div className="bg-red-50 dark:bg-red-900/20 w-10 h-10 rounded-lg flex items-center justify-center text-red-600">
              <Ban className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
              {counts.suspendu}
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-3">Suspendues</span>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
            : 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          <p className={`${message.type === 'success' ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'} text-sm flex-1`}>
            {message.text}
          </p>
          <button 
            onClick={() => setMessage(null)}
            className={`${message.type === 'success' ? 'text-emerald-400 hover:text-emerald-600' : 'text-red-400 hover:text-red-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, NIF, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-600 focus:border-blue-600 text-sm shadow-sm placeholder-slate-400 transition-shadow"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EntrepriseStatus | '')}
              className="form-select pl-3 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-blue-600 focus:border-blue-600 shadow-sm cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="valide">Validée</option>
              <option value="en_attente">En attente</option>
              <option value="suspendu">Suspendue</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select pl-3 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:ring-blue-600 focus:border-blue-600 shadow-sm cursor-pointer"
            >
              <option value="">Toutes les catégories</option>
              <option value="btp">BTP</option>
              <option value="informatique">Informatique</option>
              <option value="services">Services</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Entreprise</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Plan & NIF</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {filteredEntreprises.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Aucune entreprise trouvée</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                      {searchQuery || statusFilter || categoryFilter ? 'Essayez de modifier vos filtres' : 'Les entreprises inscrites apparaîtront ici'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntreprises.map((entreprise) => (
                  <tr key={entreprise.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-600">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{entreprise.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Inscrit le {new Date(entreprise.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(entreprise.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300">{entreprise.sector}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Secteur d'activité</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{entreprise.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{entreprise.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {getPlanBadge(entreprise.currentSubscription?.plan)}
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          NIF: {entreprise.nif || 'Non renseigné'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleChangePassword(entreprise.id, entreprise.name)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
                          title="Accès Sécurité"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        
                        {entreprise.status === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleValidate(entreprise.id)}
                              disabled={actionLoading === entreprise.id}
                              className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors"
                              title="Valider"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(entreprise.id)}
                              disabled={actionLoading === entreprise.id}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                              title="Rejeter"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {entreprise.status === 'valide' && (
                          <button
                            onClick={() => handleSuspend(entreprise.id)}
                            disabled={actionLoading === entreprise.id}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                            title="Suspendre"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        
                        {entreprise.status === 'suspendu' && (
                          <button
                            onClick={() => handleValidate(entreprise.id)}
                            disabled={actionLoading === entreprise.id}
                            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors"
                            title="Réactiver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Affichage de <span className="font-medium text-slate-900 dark:text-white">1</span> à{' '}
            <span className="font-medium text-slate-900 dark:text-white">{filteredEntreprises.length}</span> sur{' '}
            <span className="font-medium text-slate-900 dark:text-white">{filteredEntreprises.length}</span> résultats
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              disabled
            >
              Précédent
            </button>
            <button
              className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              disabled
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
        <Plus className="w-6 h-6" />
      </button>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        onClose={() => setChangePasswordModal({ isOpen: false, userId: '', userName: '' })}
        userId={changePasswordModal.userId}
        userType="entreprise"
        userName={changePasswordModal.userName}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
      />
    </div>
  )
}