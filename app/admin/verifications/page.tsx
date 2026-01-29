'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle, XCircle, UserCheck, Receipt, Mail, Phone, Trash2, AlertCircle, X, User, GraduationCap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Engineer {
  id: string
  nni: string
  full_name: string
  email: string
  phone: string
  diploma: string
  university: string | null
  status: string
  created_at: string
  diploma_file_path: string | null
  cni_file_path: string | null
  payment_receipt_path: string | null
  parrain_id: string | null
  parrain_name?: string | null
  parrain_phone?: string | null
  country?: string | null
  grad_year?: number | null
  profile_image_url?: string
}

export default function VerificationsPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Reject dialog state
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; engineerId: string; engineerName: string }>({
    isOpen: false,
    engineerId: '',
    engineerName: ''
  })
  const [rejectionReason, setRejectionReason] = useState('')

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; engineerId: string; engineerName: string }>({
    isOpen: false,
    engineerId: '',
    engineerName: ''
  })

  const loadEngineers = async () => {
    try {
      const res = await fetch('/api/admin/engineers')
      const data = await res.json()
      if (data.engineers) {
        // Filter only pending_docs engineers
        const pending = data.engineers.filter((e: Engineer) => e.status === 'pending_docs')
        setEngineers(pending)
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

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleApprove = async (engineerId: string) => {
    setActionLoading(engineerId)
    try {
      const res = await fetch('/api/admin/verify-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineerId, action: 'approve' })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Ingénieur approuvé avec succès' })
        loadEngineers()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'approbation' })
      }
    } catch (error) {
      console.error('Approval error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'approbation' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Veuillez fournir une raison pour le rejet' })
      return
    }

    setActionLoading(rejectDialog.engineerId)
    try {
      const res = await fetch('/api/admin/verify-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineerId: rejectDialog.engineerId,
          action: 'reject',
          rejectionReason
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Ingénieur rejeté avec succès' })
        setRejectDialog({ isOpen: false, engineerId: '', engineerName: '' })
        setRejectionReason('')
        loadEngineers()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors du rejet' })
      }
    } catch (error) {
      console.error('Rejection error:', error)
      setMessage({ type: 'error', text: 'Erreur lors du rejet' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    setActionLoading(deleteDialog.engineerId)
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
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#139a9d] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Documents en attente de vérification</h1>
          <p className="text-gray-500 text-sm mt-1">{engineers.length} document{engineers.length !== 1 ? 's' : ''} à vérifier</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => window.open('/admin/verifications/workspace', '_blank')}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Advanced Workspace
          </Button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${message.type === 'success'
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
      <div className="space-y-4">
        {engineers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucun document en attente</p>
            <p className="text-gray-500 text-sm mt-1">Tous les documents ont été traités</p>
          </div>
        ) : (
          engineers.map((engineer) => (
            <div
              key={engineer.id}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Avatar className="w-12 h-12 border border-blue-200">
                      <AvatarImage src={engineer.profile_image_url} alt={engineer.full_name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                        {(engineer.full_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">{engineer.full_name || 'Utilisateur'}</h3>
                      <Badge className="bg-[#139a9d]/20 text-[#139a9d] border-[#139a9d]/30 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Ingénieur
                      </Badge>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      En attente
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleApprove(engineer.id)}
                    disabled={actionLoading === engineer.id}
                    className="h-10 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {actionLoading === engineer.id ? 'Chargement...' : 'Approuver'}
                  </Button>

                  <Button
                    onClick={() => setRejectDialog({ isOpen: true, engineerId: engineer.id, engineerName: engineer.full_name })}
                    disabled={actionLoading === engineer.id}
                    variant="outline"
                    className="h-10 px-4 rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>

                  <Button
                    onClick={() => setDeleteDialog({ isOpen: true, engineerId: engineer.id, engineerName: engineer.full_name })}
                    disabled={actionLoading === engineer.id}
                    variant="outline"
                    className="h-10 px-4 rounded-lg border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">NNI</span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.nni}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </span>
                  <p className="text-sm font-semibold text-gray-900 truncate">{engineer.email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Téléphone
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Diplôme</span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.diploma}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Université</span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.university || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Pays</span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.country || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Année de sortie
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.grad_year || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Parrain</span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.parrain_name || 'Aucun'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Mobile Parrain
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{engineer.parrain_phone || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Soumis le</span>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(engineer.created_at)}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="flex flex-wrap gap-2">
                {engineer.diploma_file_path && (
                  <Button variant="outline" size="sm" asChild className="h-9 px-3 rounded-lg border-gray-300">
                    <a href={`/api/admin/documents/${engineer.id}/diploma`} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Diplôme
                    </a>
                  </Button>
                )}
                {engineer.cni_file_path && (
                  <Button variant="outline" size="sm" asChild className="h-9 px-3 rounded-lg border-gray-300">
                    <a href={`/api/admin/documents/${engineer.id}/cni`} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      CNI
                    </a>
                  </Button>
                )}
                {engineer.payment_receipt_path && (
                  <Button variant="outline" size="sm" asChild className="h-9 px-3 rounded-lg border-gray-300">
                    <a href={`/api/admin/documents/${engineer.id}/payment`} target="_blank" rel="noopener noreferrer">
                      <Receipt className="w-4 h-4 mr-2" />
                      Reçu
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>


      {/* Reject Dialog */}
      <Dialog open={rejectDialog.isOpen} onOpenChange={(open) => !open && setRejectDialog({ isOpen: false, engineerId: '', engineerName: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter la demande de {rejectDialog.engineerName}. Veuillez fournir une raison.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du rejet</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Documents illisibles, informations manquantes..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ isOpen: false, engineerId: '', engineerName: '' })
                setRejectionReason('')
              }}
              disabled={actionLoading === rejectDialog.engineerId}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading === rejectDialog.engineerId || !rejectionReason.trim()}
            >
              {actionLoading === rejectDialog.engineerId ? 'Rejet...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, engineerId: '', engineerName: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'ingénieur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement {deleteDialog.engineerName} ? Cette action est irréversible et supprimera toutes les données associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, engineerId: '', engineerName: '' })}
              disabled={actionLoading === deleteDialog.engineerId}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading === deleteDialog.engineerId}
            >
              {actionLoading === deleteDialog.engineerId ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
