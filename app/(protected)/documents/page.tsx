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
  diploma_file_path: string | null
  cni_file_path: string | null
  full_name: string
}

export default function DocumentsPage() {
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
        console.log('Profile data:', data.profile)
        console.log('diploma_file_path:', data.profile.diploma_file_path)
        console.log('cni_file_path:', data.profile.cni_file_path)
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

  const getFileUrl = (filePath: string | null) => {
    if (!filePath) return null
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    // Si le chemin contient déjà l'URL complète, le retourner tel quel
    if (filePath.startsWith('http')) {
      return filePath
    }
    
    // Si le chemin commence par 'documents/', l'utiliser tel quel
    if (filePath.startsWith('documents/')) {
      return `${supabaseUrl}/storage/v1/object/public/${filePath}`
    }
    
    // Sinon, ajouter le préfixe documents/
    return `${supabaseUrl}/storage/v1/object/public/documents/${filePath}`
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
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
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
                      onClick={() => window.open(getFileUrl(profile.diploma_file_path)!, '_blank')}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = getFileUrl(profile.diploma_file_path)!
                        link.download = `diplome_${profile.full_name}.pdf`
                        link.click()
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
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
                      onClick={() => window.open(getFileUrl(profile.cni_file_path)!, '_blank')}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = getFileUrl(profile.cni_file_path)!
                        link.download = `cni_${profile.full_name}.pdf`
                        link.click()
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
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
