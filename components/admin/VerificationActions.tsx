'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, Download, Check, X } from 'lucide-react'
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

interface VerificationActionsProps {
  profileId: string
  diplomaPath: string | null
  cniPath: string | null
}

export function VerificationActions({ 
  profileId, 
  diplomaPath, 
  cniPath 
}: VerificationActionsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch('/api/admin/verify-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          action: 'approve'
        })
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Erreur lors de l\'approbation')
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('Erreur lors de l\'approbation')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Veuillez fournir une raison pour le rejet')
      return
    }

    setIsRejecting(true)
    try {
      const response = await fetch('/api/admin/verify-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          action: 'reject',
          reason: rejectionReason
        })
      })

      if (response.ok) {
        setShowRejectDialog(false)
        setRejectionReason('')
        router.refresh()
      } else {
        alert('Erreur lors du rejet')
      }
    } catch (error) {
      console.error('Rejection error:', error)
      alert('Erreur lors du rejet')
    } finally {
      setIsRejecting(false)
    }
  }

  const handleDownload = async (path: string, filename: string) => {
    try {
      const response = await fetch(`/api/admin/download-document?path=${encodeURIComponent(path)}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Erreur lors du téléchargement')
    }
  }

  return (
    <div>
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3">Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {diplomaPath && (
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleDownload(diplomaPath, 'diplome.pdf')}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left">Diplôme</span>
              <Download className="w-4 h-4" />
            </Button>
          )}
          {cniPath && (
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleDownload(cniPath, 'cni.pdf')}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left">CNI</span>
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Check className="w-4 h-4 mr-2" />
          {isApproving ? 'Approbation...' : 'Approuver'}
        </Button>
        <Button
          onClick={() => setShowRejectDialog(true)}
          disabled={isApproving || isRejecting}
          variant="destructive"
          className="flex-1"
        >
          <X className="w-4 h-4 mr-2" />
          Rejeter
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet de cette demande.
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
              onClick={() => setShowRejectDialog(false)}
              disabled={isRejecting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? 'Rejet...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
