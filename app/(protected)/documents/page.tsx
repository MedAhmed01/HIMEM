'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Upload,
  CreditCard,
  GraduationCap
} from 'lucide-react'

interface ProfileData {
  full_name: string
  diploma_file_path: string | null
  cni_file_path: string | null
  payment_receipt_path: string | null
  status: string
}

export default function DocumentsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez PDF ou Images (JPG, PNG)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5 Mo)')
      return
    }

    setUploading(type)
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const res = await fetch('/api/profile/documents', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMessage('Document mis à jour avec succès. Votre statut est maintenant "En attente".')
        loadProfile() // Reload to get new path and status
      } else {
        setError(data.error || 'Erreur lors du téléchargement')
      }
    } catch (err) {
      setError('Erreur lors de la communication avec le serveur')
    } finally {
      setUploading(null)
    }
  }

  const getDocumentUrl = (type: 'diploma' | 'cni' | 'payment') => {
    return `/api/my-documents/${type}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement des documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mes Documents</h1>
            <p className="text-slate-500">Diplômes et pièces d'identité</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <p className="text-emerald-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diplôme */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                Diplôme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.diploma_file_path ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Document téléchargé</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(getDocumentUrl('diploma'), '_blank')}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        id="reupload-diploma"
                        className="hidden"
                        accept=".pdf, .jpg, .jpeg, .png"
                        onChange={(e) => handleReupload(e, 'diploma')}
                        disabled={!!uploading}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('reupload-diploma')?.click()}
                        disabled={!!uploading}
                      >
                        {uploading === 'diploma' ? (
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Modifier
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucun diplôme téléchargé</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte d'Identité */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                Carte d'Identité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.cni_file_path ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Document téléchargé</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(getDocumentUrl('cni'), '_blank')}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        id="reupload-cni"
                        className="hidden"
                        accept=".pdf, .jpg, .jpeg, .png"
                        onChange={(e) => handleReupload(e, 'cni')}
                        disabled={!!uploading}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('reupload-cni')?.click()}
                        disabled={!!uploading}
                      >
                        {uploading === 'cni' ? (
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Modifier
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucune carte d'identité téléchargée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reçu de Paiement */}
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                Reçu de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.payment_receipt_path ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Document téléchargé</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(getDocumentUrl('payment'), '_blank')}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        id="reupload-payment"
                        className="hidden"
                        accept=".pdf, .jpg, .jpeg, .png"
                        onChange={(e) => handleReupload(e, 'payment')}
                        disabled={!!uploading}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('reupload-payment')?.click()}
                        disabled={!!uploading}
                      >
                        {uploading === 'payment' ? (
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Modifier
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Aucun reçu téléchargé</p>
                  </div>
                  <input
                    type="file"
                    id="upload-payment-new"
                    className="hidden"
                    accept=".pdf, .jpg, .jpeg, .png"
                    onChange={(e) => handleReupload(e, 'payment')}
                    disabled={!!uploading}
                  />
                  <Button
                    onClick={() => document.getElementById('upload-payment-new')?.click()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={!!uploading}
                  >
                    {uploading === 'payment' ? 'Envoi...' : 'Télécharger maintenant'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Information importante</h3>
                <p className="text-slate-600 text-sm">
                  Ces documents ont été téléchargés lors de votre inscription. Pour modifier ou mettre à jour vos documents,
                  veuillez contacter l'administration OMIGEC.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
