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
import { Loader2, Check, Upload } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Domain, ExerciseMode } from '@/lib/types/database'

interface EditEngineerModalProps {
    isOpen: boolean
    onClose: () => void
    engineer: {
        id: string
        full_name: string
        phone: string
        diploma: string
        grad_year: number
        nni: string
        email: string
        university?: string
        country?: string
        domain?: string[]
        exercise_mode?: string[]
        profile_image_url?: string
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
        diploma: '',
        grad_year: 0,
        nni: '',
        email: '',
        university: '',
        country: '',
        domain: [] as string[],
        exercise_mode: [] as string[],
        profile_image_url: ''
    })
    const [loading, setLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)

    useEffect(() => {
        if (engineer) {
            setFormData({
                full_name: engineer.full_name || '',
                phone: engineer.phone || '',
                diploma: engineer.diploma || '',
                grad_year: engineer.grad_year || 0,
                nni: engineer.nni || '',
                email: engineer.email || '',
                university: engineer.university || '',
                country: engineer.country || '',
                domain: engineer.domain || [],
                exercise_mode: Array.isArray(engineer.exercise_mode) ? engineer.exercise_mode : engineer.exercise_mode ? [engineer.exercise_mode] : [],
                profile_image_url: engineer.profile_image_url || ''
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

    const DOMAINS = [
        { value: 'infrastructure_transport', label: 'Infrastructure de transport' },
        { value: 'batiment_constructions', label: 'Bâtiment et constructions' },
        { value: 'hydraulique_environnement', label: 'Hydraulique et Environnement' }
    ]

    const EXERCISE_MODES = [
        { value: 'personne_physique', label: 'Personne Physique' },
        { value: 'personne_morale', label: 'Bureau d\'étude' },
        { value: 'employe_public', label: 'Secteur Public' },
        { value: 'employe_prive', label: 'Secteur Privé' }
    ]

    const COUNTRIES = [
        'Mauritanie', 'Maroc', 'Algérie', 'Tunisie', 'Libye', 'Égypte', 'Soudan', 'Mali', 'Niger', 'Tchad',
        'Sénégal', 'Burkina Faso', 'Côte d\'Ivoire', 'Ghana', 'Nigeria', 'France', 'Espagne', 'Allemagne',
        'Royaume-Uni', 'Canada', 'États-Unis', 'Jordanie', 'Liban', 'Syrie', 'Irak', 'Arabie Saoudite'
    ]

    const handleDomainToggle = (domain: string, checked: boolean) => {
        const newDomains = checked
            ? [...formData.domain, domain]
            : formData.domain.filter(d => d !== domain)
        setFormData({ ...formData, domain: newDomains })
    }

    const handleExerciseModeToggle = (mode: string, checked: boolean) => {
        const newModes = checked
            ? [...formData.exercise_mode, mode]
            : formData.exercise_mode.filter(m => m !== mode)
        setFormData({ ...formData, exercise_mode: newModes })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier le profil complet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Photo de profil */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
                        <Avatar className="h-20 w-20 border-2 border-slate-200 shadow-md flex-shrink-0">
                            <AvatarImage src={formData.profile_image_url} alt={formData.full_name} className="object-cover" />
                            <AvatarFallback className="bg-teal-600 text-white text-2xl font-bold">
                                {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PE'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow w-full space-y-2">
                            <Label className="text-sm font-semibold">Photo de profil</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="URL de l'image (ex: https://...)"
                                    value={formData.profile_image_url}
                                    onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                                    className="flex-grow text-xs"
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="modal-avatar-upload"
                                        className="sr-only"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            
                                            setUploadLoading(true)
                                            try {
                                                const uploadData = new FormData()
                                                uploadData.append('file', file)
                                                uploadData.append('type', 'profile_image')
                                                
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: uploadData
                                                })
                                                
                                                const resData = await res.json()
                                                if (res.ok && resData.url) {
                                                    setFormData(prev => ({ ...prev, profile_image_url: resData.url }))
                                                } else {
                                                    alert(resData.error || 'Erreur lors de l\'upload')
                                                }
                                            } catch (err) {
                                                console.error('File upload error:', err)
                                                alert('Erreur lors du téléchargement de l\'image')
                                            } finally {
                                                setUploadLoading(false)
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor="modal-avatar-upload"
                                        className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all cursor-pointer h-10 shadow-sm"
                                    >
                                        {uploadLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Upload className="w-3.5 h-3.5" />
                                        )}
                                        Charger
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nni">NNI</Label>
                            <Input
                                id="nni"
                                value={formData.nni}
                                onChange={(e) => setFormData({ ...formData, nni: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
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
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Informations Académiques</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="diploma">Diplôme</Label>
                                <Input
                                    id="diploma"
                                    value={formData.diploma}
                                    onChange={(e) => setFormData({ ...formData, diploma: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grad_year">Année de Promotion</Label>
                                <Input
                                    id="grad_year"
                                    type="number"
                                    value={formData.grad_year || ''}
                                    onChange={(e) => setFormData({ ...formData, grad_year: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="university">Université</Label>
                                <Input
                                    id="university"
                                    value={formData.university}
                                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Pays</Label>
                                <Select
                                    value={formData.country}
                                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                                >
                                    <SelectTrigger id="country">
                                        <SelectValue placeholder="Sélectionnez un pays" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Domaines & Exercice</h4>
                        <div className="space-y-3">
                            <Label>Mode d'exercice</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {EXERCISE_MODES.map((m) => (
                                    <div key={m.value} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 transition-colors">
                                        <Checkbox
                                            id={`mode-${m.value}`}
                                            checked={formData.exercise_mode.includes(m.value)}
                                            onCheckedChange={(checked) => handleExerciseModeToggle(m.value, checked as boolean)}
                                        />
                                        <Label
                                            htmlFor={`mode-${m.value}`}
                                            className="text-sm cursor-pointer font-normal"
                                        >
                                            {m.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label>Domaines d'expertise</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {DOMAINS.map((d) => (
                                    <div key={d.value} className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 transition-colors">
                                        <Checkbox
                                            id={`domain-${d.value}`}
                                            checked={formData.domain.includes(d.value)}
                                            onCheckedChange={(checked) => handleDomainToggle(d.value, checked as boolean)}
                                        />
                                        <Label
                                            htmlFor={`domain-${d.value}`}
                                            className="text-sm cursor-pointer font-normal"
                                        >
                                            {d.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
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
