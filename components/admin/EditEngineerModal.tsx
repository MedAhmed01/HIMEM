'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface EditEngineerModalProps {
    isOpen: boolean
    onClose: () => void
    engineer: {
        id: string
        full_name: string
        phone: string
        diploma: string
        nni: string
        email: string
    } | null
    onSuccess: (message: string) => void
    onError: (error: string) => void
}

export default function EditEngineerModal({
    isOpen,
    onClose,
    engineer,
    onSuccess,
    onError
}: EditEngineerModalProps) {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        diploma: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (engineer) {
            setFormData({
                full_name: engineer.full_name || '',
                phone: engineer.phone || '',
                diploma: engineer.diploma || ''
            })
        }
    }, [engineer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!engineer) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/engineers/${engineer.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                onSuccess(data.message || 'Profil mis à jour avec succès')
                onClose()
            } else {
                onError(data.error || 'Erreur lors de la mise à jour')
            }
        } catch (error) {
            console.error('Update error:', error)
            onError('Une erreur est survenue lors de la mise à jour')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>NNI (Lecture seule)</Label>
                        <Input value={engineer?.nni || ''} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email (Lecture seule)</Label>
                        <Input value={engineer?.email || ''} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nom Complet</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="diploma">Diplôme</Label>
                        <Input
                            id="diploma"
                            value={formData.diploma}
                            onChange={(e) => setFormData({ ...formData, diploma: e.target.value })}
                            required
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer les modifications
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
