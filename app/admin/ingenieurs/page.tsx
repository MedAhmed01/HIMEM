'use client'


import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  Check,
  X,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Key,
  Ban,
  Trash2,
  CheckCircle,
  AlertCircle,
  Edit3,
  GraduationCap,
  FileText,
  Eye,
  CreditCard
} from 'lucide-react'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'
import EditEngineerModal from '@/components/admin/EditEngineerModal'

interface Engineer {
  id: string
  nni: string
  full_name: string
  email: string
  phone: string
  diploma: string
  grad_year: number
  status: string
  subscription_expiry: string | null
  profile_image_url?: string
  diploma_file_path?: string
  cni_file_path?: string
  payment_receipt_path?: string
  university?: string
  country?: string
  domain?: string[]
  exercise_mode?: string[]
  parrain_name?: string | null
  parrain_phone?: string | null
  created_at: string
}

export default function IngenieursPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    engineer: Engineer | null
  }>({
    isOpen: false,
    engineer: null
  })

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    engineerId: string
    engineerName: string
  }>({
    isOpen: false,
    engineerId: '',
    engineerName: ''
  })
  const [docsModal, setDocsModal] = useState<{
    isOpen: boolean
    engineer: Engineer | null
  }>({
    isOpen: false,
    engineer: null
  })

  const loadEngineers = async () => {
    try {
      const res = await fetch('/api/admin/engineers')
      const data = await res.json()
      if (data.engineers) {
        setEngineers(data.engineers)
      }
    } catch (error) {
      console.error('Error loading engineers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEngineers()
  }, [])

  const handleSubscription = async (engineerId: string, action: 'activate' | 'deactivate') => {
    const res = await fetch('/api/admin/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engineerId, action })
    })

    if (res.ok) {
      loadEngineers()
    }
  }

  const handleChangePassword = (engineerId: string, engineerName: string) => {
    setChangePasswordModal({
      isOpen: true,
      userId: engineerId,
      userName: engineerName
    })
  }

  const handlePasswordChangeSuccess = (message: string) => {
    setMessage({ type: 'success', text: message })
  }

  const handlePasswordChangeError = (error: string) => {
    setMessage({ type: 'error', text: error })
  }

  const handleEdit = (engineer: Engineer) => {
    setEditModal({
      isOpen: true,
      engineer
    })
  }

  const handleEditSuccess = (message: string) => {
    setMessage({ type: 'success', text: message })
    loadEngineers()
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/engineers/${deleteDialog.engineerId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Ingénieur supprimé avec succès' })
        setDeleteDialog({ isOpen: false, engineerId: '', engineerName: '' })
        loadEngineers()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
            Validé
          </span>
        )
      case 'pending_docs':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <span className="w-2 h-2 mr-2 bg-orange-500 rounded-full"></span>
            Documents en attente
          </span>
        )
      case 'pending_reference':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
            Parrainage en attente
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
            Rejeté
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <span className="w-2 h-2 mr-2 bg-gray-500 rounded-full"></span>
            {status}
          </span>
        )
    }
  }

  const isSubscriptionActive = (expiry: string | null) => {
    if (!expiry) return false
    return new Date(expiry) > new Date()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-red-600',
      'bg-orange-600', 'bg-yellow-600', 'bg-green-600', 'bg-teal-600', 'bg-cyan-600'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const filteredEngineers = engineers.filter(eng =>
    eng.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eng.nni.includes(searchQuery) ||
    eng.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ingénieurs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérer tous les ingénieurs inscrits</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-1/2 lg:w-1/3 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-teal-600 transition-colors w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, NNI ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm placeholder-slate-400 shadow-sm transition-all bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-teal-600 transition-colors text-slate-400">
            <Filter className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Message Area */}
      {message && (
        <div className={`p-4 rounded-xl border backdrop-blur-sm flex items-center justify-between ${message.type === 'success'
          ? 'bg-green-50/80 border-green-200 text-green-800'
          : 'bg-red-50/80 border-red-200 text-red-800'
          }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {filteredEngineers.length} ingénieur{filteredEngineers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredEngineers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">Aucun ingénieur trouvé</p>
          </div>
        ) : (
          filteredEngineers.map((engineer) => (
            <div key={engineer.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage src={engineer.profile_image_url} alt={engineer.full_name} className="object-cover" />
                    <AvatarFallback className={`${getAvatarColor(engineer.full_name)} text-white text-xl font-semibold`}>
                      {getInitials(engineer.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{engineer.full_name}</h2>
                      <p className="text-sm text-slate-500 font-mono mt-1">NNI: {engineer.nni}</p>
                    </div>
                    {getStatusBadge(engineer.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 mt-5">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Mail className="text-slate-400 mr-2 w-4 h-4" />
                      <span className="truncate">{engineer.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Phone className="text-slate-400 mr-2 w-4 h-4" />
                      <span>{engineer.phone || '-'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <GraduationCap className="text-slate-400 mr-2 w-4 h-4" />
                      <span>Promo: {engineer.grad_year || '-'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Calendar className="text-slate-400 mr-2 w-4 h-4" />
                      <span>Exp: {formatDate(engineer.subscription_expiry)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${isSubscriptionActive(engineer.subscription_expiry)
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {isSubscriptionActive(engineer.subscription_expiry) ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <X className="w-4 h-4 mr-1.5" />}
                      {isSubscriptionActive(engineer.subscription_expiry) ? 'À jour' : 'Expiré'}
                    </span>

                    <button
                      onClick={() => handleChangePassword(engineer.id, engineer.full_name)}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Mot de passe
                    </button>

                    <button
                      onClick={() => handleEdit(engineer)}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier
                    </button>

                    {!isSubscriptionActive(engineer.subscription_expiry) ? (
                      <button
                        onClick={() => handleSubscription(engineer.id, 'activate')}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscription(engineer.id, 'deactivate')}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Désactiver
                      </button>
                    )}

                    <button
                      onClick={() => setDocsModal({ isOpen: true, engineer })}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Documents
                    </button>

                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, engineerId: engineer.id, engineerName: engineer.full_name })}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        onClose={() => setChangePasswordModal({ isOpen: false, userId: '', userName: '' })}
        userId={changePasswordModal.userId}
        userType="ingenieur"
        userName={changePasswordModal.userName}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
      />

      <EditEngineerModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, engineer: null })}
        engineer={editModal.engineer}
        onSuccess={handleEditSuccess}
        onError={(err) => setMessage({ type: 'error', text: err })}
      />

      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-lg font-semibold mb-2">Supprimer l'ingénieur</h3>
            <p className="text-slate-600 mb-6">
              Voulez-vous supprimer <span className="font-bold">{deleteDialog.engineerName}</span> ?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteDialog({ isOpen: false, engineerId: '', engineerName: '' })} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {/* Documents Modal */}
      {docsModal.isOpen && docsModal.engineer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Documents - {docsModal.engineer.full_name}</h3>
              <button onClick={() => setDocsModal({ isOpen: false, engineer: null })} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                disabled={!docsModal.engineer.diploma_file_path}
                onClick={() => window.open(`/api/admin/engineers/${docsModal.engineer?.id}/documents/diploma`, '_blank')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${docsModal.engineer.diploma_file_path
                  ? 'bg-slate-50 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                  : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-slate-700">Diplôme Professionnel</span>
                </div>
                {docsModal.engineer.diploma_file_path ? <Eye className="w-5 h-5 text-slate-400" /> : <X className="w-5 h-5 text-red-400" />}
              </button>

              <button
                disabled={!docsModal.engineer.cni_file_path}
                onClick={() => window.open(`/api/admin/engineers/${docsModal.engineer?.id}/documents/cni`, '_blank')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${docsModal.engineer.cni_file_path
                  ? 'bg-slate-50 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                  : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-slate-700">Pièce d'Identité</span>
                </div>
                {docsModal.engineer.cni_file_path ? <Eye className="w-5 h-5 text-slate-400" /> : <X className="w-5 h-5 text-red-400" />}
              </button>

              <button
                disabled={!docsModal.engineer.payment_receipt_path}
                onClick={() => window.open(`/api/admin/engineers/${docsModal.engineer?.id}/documents/payment`, '_blank')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${docsModal.engineer.payment_receipt_path
                  ? 'bg-slate-50 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                  : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-slate-700">Reçu de Paiement</span>
                </div>
                {docsModal.engineer.payment_receipt_path ? <Eye className="w-5 h-5 text-slate-400" /> : <X className="w-5 h-5 text-red-400" />}
              </button>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setDocsModal({ isOpen: false, engineer: null })}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
