'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    FileText,
    Eye,
    AlertCircle,
    GraduationCap,
    CreditCard,
    CheckCircle,
    Loader2
} from 'lucide-react'

interface ProfileData {
    full_name: string
    diploma_file_path: string | null
    cni_file_path: string | null
    status: string
}

export default function AdminDocumentsPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const res = await fetch('/api/profile')
            const data = await res.json()

            if (res.ok) {
                setProfile(data.profile)
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError('Erreur lors du chargement des documents')
        } finally {
            setLoading(false)
        }
    }

    const getDocumentUrl = (type: 'diploma' | 'cni' | 'payment') => {
        return `/api/my-documents/${type}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Chargement de vos documents...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mes Documents</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Vos documents personnels archivés</p>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium text-sm">{error}</p>
                </div>
            )}

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diplôme */}
                <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
                    <div className="h-2 bg-teal-600"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-900/50">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            Diplôme Professionnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {profile?.diploma_file_path ? (
                            <>
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Document archivé et vérifié</span>
                                </div>
                                <Button
                                    onClick={() => window.open(getDocumentUrl('diploma'), '_blank')}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-600 dark:hover:bg-teal-700 rounded-xl py-6"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Consulter le document
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun diplôme trouvé</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Carte d'Identité */}
                <Card className="bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden">
                    <div className="h-2 bg-slate-600 dark:bg-slate-500"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-900/50">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            Pièce d'Identité
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {profile?.cni_file_path ? (
                            <>
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Document archivé</span>
                                </div>
                                <Button
                                    onClick={() => window.open(getDocumentUrl('cni'), '_blank')}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl py-6"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Consulter le document
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune pièce d'identité trouvée</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Security Tip */}
            <div className="bg-teal-50/50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/50 rounded-2xl p-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-teal-600 flex-shrink-0 shadow-sm">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Espace sécurisé</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Vos documents sont stockés de manière sécurisée. Si vous remarquez une erreur ou si vous souhaitez mettre à jour vos fichiers,
                            veuillez contacter le service informatique de l'Ordre.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
