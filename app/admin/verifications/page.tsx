import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle, XCircle, UserCheck, Receipt, Clock, AlertCircle, Sparkles } from 'lucide-react'

export default async function VerificationsPage() {
  const supabase = createAdminClient()

  const { data: pendingEngineers, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'pending_docs')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending engineers:', error)
  }

  const engineersWithParrains = await Promise.all(
    (pendingEngineers || []).map(async (engineer) => {
      let parrainName = null
      let parrainPhone = null
      if (engineer.parrain_id) {
        const { data: parrain } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', engineer.parrain_id)
          .single()
        parrainName = parrain?.full_name
        parrainPhone = parrain?.phone
      }
      return { ...engineer, parrain_name: parrainName, parrain_phone: parrainPhone }
    })
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Vérification des Documents</h1>
            <p className="text-slate-500">Examinez et approuvez les documents soumis</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">En attente</p>
                <p className="text-4xl font-bold text-slate-900">{pendingEngineers?.length || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Approuvés aujourd'hui</p>
                <p className="text-4xl font-bold text-slate-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 shadow-xl overflow-hidden card-hover">
          <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Rejetés aujourd'hui</p>
                <p className="text-4xl font-bold text-slate-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Engineers List */}
      <Card className="glass border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Documents en attente de vérification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {engineersWithParrains.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Aucun document en attente</p>
              <p className="text-slate-400 mt-2">Tous les documents ont été traités</p>
            </div>
          ) : (
            <div className="space-y-4">
              {engineersWithParrains.map((engineer) => (
                <div
                  key={engineer.id}
                  className="rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">{(engineer.full_name || 'U').charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{engineer.full_name || 'Utilisateur'}</h3>
                          <Badge className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-0">
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="p-3 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-xs uppercase tracking-wide">NNI</span>
                          <p className="font-semibold text-slate-900">{engineer.nni}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-xs uppercase tracking-wide">Email</span>
                          <p className="font-semibold text-slate-900 truncate">{engineer.email}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-xs uppercase tracking-wide">Téléphone</span>
                          <p className="font-semibold text-slate-900">{engineer.phone}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-xs uppercase tracking-wide">Diplôme</span>
                          <p className="font-semibold text-slate-900">{engineer.diploma}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-xs uppercase tracking-wide">Université</span>
                          <p className="font-semibold text-slate-900">{engineer.university || '-'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50">
                          <span className="text-slate-500 text-xs uppercase tracking-wide">Soumis le</span>
                          <p className="font-semibold text-slate-900">{formatDate(engineer.created_at)}</p>
                        </div>
                      </div>

                      {/* Parrain Info */}
                      {engineer.parrain_name && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-indigo-600 uppercase tracking-wide font-medium">Parrain</p>
                            <p className="font-semibold text-slate-900">
                              {engineer.parrain_name}
                              {engineer.parrain_phone && (
                                <a href={`tel:${engineer.parrain_phone}`} className="ml-2 text-indigo-600 hover:underline">
                                  {engineer.parrain_phone}
                                </a>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      <div className="flex flex-wrap gap-3">
                        {engineer.diploma_file_path && (
                          <Button variant="outline" size="sm" asChild className="rounded-xl border-2 hover:border-indigo-300 hover:bg-indigo-50">
                            <a href={`/api/admin/documents/${engineer.id}/diploma`} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2 text-indigo-500" />
                              Diplôme
                            </a>
                          </Button>
                        )}
                        {engineer.cni_file_path && (
                          <Button variant="outline" size="sm" asChild className="rounded-xl border-2 hover:border-purple-300 hover:bg-purple-50">
                            <a href={`/api/admin/documents/${engineer.id}/cni`} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2 text-purple-500" />
                              CNI
                            </a>
                          </Button>
                        )}
                        {engineer.payment_receipt_path && (
                          <Button variant="outline" size="sm" asChild className="rounded-xl border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50">
                            <a href={`/api/admin/documents/${engineer.id}/payment`} target="_blank" rel="noopener noreferrer">
                              <Receipt className="w-4 h-4 mr-2 text-emerald-500" />
                              Reçu de Paiement
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <form action="/api/admin/verify-docs" method="POST">
                        <input type="hidden" name="engineerId" value={engineer.id} />
                        <input type="hidden" name="action" value="approve" />
                        <Button
                          type="submit"
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-lg shadow-emerald-500/30"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                      </form>

                      <form action="/api/admin/verify-docs" method="POST">
                        <input type="hidden" name="engineerId" value={engineer.id} />
                        <input type="hidden" name="action" value="reject" />
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeter
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
