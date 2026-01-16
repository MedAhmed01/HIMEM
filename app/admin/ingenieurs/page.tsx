'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Check, X, Search, Filter, Sparkles, Calendar, Mail, Phone, Key, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'

interface Engineer {
  id: string
  nni: string
  full_name: string
  email: string
  phone: string
  diploma: string
  status: string
  subscription_expiry: string | null
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

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    engineerId: string
    engineerName: string
  }>({
    isOpen: false,
    engineerId: '',
    engineerName: ''
  })

  const loadEngineers = async () => {
    const res = await fetch('/api/admin/engineers')
    const data = await res.json()
    if (data.engineers) {
      setEngineers(data.engineers)
    }
    setLoading(false)
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

  // Clear message after 5 seconds
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Validé
          </span>
        )
      case 'pending_docs':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Documents en attente
          </span>
        )
      case 'pending_reference':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Parrainage en attente
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejeté
          </span>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isSubscriptionActive = (expiry: string | null) => {
    if (!expiry) return false
    return new Date(expiry) > new Date()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ingénieurs</h1>
          <p className="text-gray-500 text-sm mt-1">Gérer tous les ingénieurs inscrits</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, NNI ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'} text-sm flex-1`}>
            {message.text}
          </p>
          <button 
            onClick={() => setMessage(null)}
            className={`${message.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Engineers List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {filteredEngineers.length} ingénieur{filteredEngineers.length !== 1 ? 's' : ''}
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredEngineers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Aucun ingénieur trouvé</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Aucun ingénieur inscrit'}
              </p>
            </div>
          ) : (
            filteredEngineers.map((engineer) => (
              <div
                key={engineer.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Mobile Layout */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {engineer.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base truncate">
                          {engineer.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">NNI: {engineer.nni}</p>
                      </div>
                      {getStatusBadge(engineer.status)}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{engineer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{engineer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>Exp: {formatDate(engineer.subscription_expiry)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Subscription Status Badge */}
                      {isSubscriptionActive(engineer.subscription_expiry) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                          <Check className="w-3.5 h-3.5" />
                          À jour
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                          <X className="w-3.5 h-3.5" />
                          Non payé
                        </span>
                      )}

                      {/* Change Password Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs rounded-md border-gray-300 hover:bg-gray-50"
                        onClick={() => handleChangePassword(engineer.id, engineer.full_name)}
                      >
                        <Key className="w-3.5 h-3.5 mr-1.5" />
                        Mot de passe
                      </Button>

                      {/* Activate/Deactivate Button */}
                      {!isSubscriptionActive(engineer.subscription_expiry) ? (
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs rounded-md bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleSubscription(engineer.id, 'activate')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Activer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs rounded-md border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleSubscription(engineer.id, 'deactivate')}
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Désactiver
                        </Button>
                      )}

                      {/* Delete Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs rounded-md border-gray-300 text-gray-600 hover:bg-gray-50"
                        onClick={() => setDeleteDialog({ isOpen: true, engineerId: engineer.id, engineerName: engineer.full_name })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        onClose={() => setChangePasswordModal({ isOpen: false, userId: '', userName: '' })}
        userId={changePasswordModal.userId}
        userType="ingenieur"
        userName={changePasswordModal.userName}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer l'ingénieur</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement <span className="font-semibold">{deleteDialog.engineerName}</span> ? 
              Cette action est irréversible et supprimera toutes les données associées.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ isOpen: false, engineerId: '', engineerName: '' })}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
