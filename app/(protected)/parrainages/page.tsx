import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCheck, CheckCircle, XCircle, Clock, User, Mail, Phone, GraduationCap, Calendar, Sparkles, Award, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ParrainagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/connexion')
  }

  const { data: isReference } = await supabase
    .from('references_list')
    .select('id')
    .eq('engineer_id', user.id)
    .single()

  if (!isReference) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md glass border-0 shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          <CardContent className="pt-10 pb-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Accès Restreint</h2>
            <p className="text-slate-500">
              Cette page est réservée aux ingénieurs parrains. Contactez l'administration pour devenir parrain.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: verifications, error } = await supabase
    .from('verifications')
    .select(`
      id,
      applicant_id,
      status,
      created_at,
      profiles!verifications_applicant_id_fkey (
        id,
        full_name,
        nni,
        email,
        phone,
        diploma,
        grad_year
      )
    `)
    .eq('reference_id', user.id)
    .order('created_at', { ascending: false })

  const pendingVerifications = verifications?.filter(v => v.status === 'pending') || []
  const completedVerifications = verifications?.filter(v => v.status !== 'pending') || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateExperience = (gradYear: number) => {
    return new Date().getFullYear() - gradYear
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Mes Parrainages</h1>
              <p className="text-slate-500">Gérez les demandes de parrainage qui vous sont adressées</p>
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
                  <p className="text-4xl font-bold text-slate-900">{pendingVerifications.length}</p>
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
                  <p className="text-sm text-slate-500 font-medium">Confirmés</p>
                  <p className="text-4xl font-bold text-slate-900">
                    {completedVerifications.filter(v => v.status === 'confirmed').length}
                  </p>
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
                  <p className="text-sm text-slate-500 font-medium">Rejetés</p>
                  <p className="text-4xl font-bold text-slate-900">
                    {completedVerifications.filter(v => v.status === 'rejected').length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications */}
        <Card className="glass border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              Demandes en Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVerifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-slate-600 font-semibold text-lg">Aucune demande en attente</p>
                <p className="text-slate-400 mt-2">Les nouvelles demandes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerifications.map((verification) => {
                  const applicant = verification.profiles as any
                  return (
                    <div
                      key={verification.id}
                      className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50 p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-xl">{applicant?.full_name?.charAt(0)}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900">{applicant?.full_name}</h3>
                              <Badge className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                En attente
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80">
                              <User className="w-4 h-4 text-indigo-500" />
                              <div>
                                <p className="text-xs text-slate-500">NNI</p>
                                <p className="font-semibold text-slate-900">{applicant?.nni}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80">
                              <Mail className="w-4 h-4 text-pink-500" />
                              <div>
                                <p className="text-xs text-slate-500">Email</p>
                                <p className="font-semibold text-slate-900 truncate">{applicant?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80">
                              <Phone className="w-4 h-4 text-emerald-500" />
                              <div>
                                <p className="text-xs text-slate-500">Téléphone</p>
                                <p className="font-semibold text-slate-900">{applicant?.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80">
                              <GraduationCap className="w-4 h-4 text-purple-500" />
                              <div>
                                <p className="text-xs text-slate-500">Diplôme</p>
                                <p className="font-semibold text-slate-900">{applicant?.diploma}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80">
                              <Calendar className="w-4 h-4 text-cyan-500" />
                              <div>
                                <p className="text-xs text-slate-500">Expérience</p>
                                <p className="font-semibold text-slate-900">{calculateExperience(applicant?.grad_year)} ans</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500">
                            Demande reçue le {formatDate(verification.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <form action="/api/reference/respond" method="POST">
                            <input type="hidden" name="verificationId" value={verification.id} />
                            <input type="hidden" name="action" value="confirm" />
                            <Button
                              type="submit"
                              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-lg shadow-emerald-500/30"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmer
                            </Button>
                          </form>

                          <form action="/api/reference/respond" method="POST">
                            <input type="hidden" name="verificationId" value={verification.id} />
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
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Verifications */}
        {completedVerifications.length > 0 && (
          <Card className="glass border-0 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-slate-400 to-slate-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedVerifications.map((verification) => {
                  const applicant = verification.profiles as any
                  const isConfirmed = verification.status === 'confirmed'
                  return (
                    <div
                      key={verification.id}
                      className={`rounded-2xl border p-5 ${
                        isConfirmed 
                          ? 'border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50' 
                          : 'border-red-100 bg-gradient-to-r from-red-50/50 to-rose-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                            isConfirmed 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                              : 'bg-gradient-to-br from-red-500 to-rose-600'
                          }`}>
                            <span className="text-white font-bold text-lg">{applicant?.full_name?.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{applicant?.full_name}</h4>
                            <p className="text-sm text-slate-500">NNI: {applicant?.nni}</p>
                          </div>
                        </div>
                        <Badge className={`border-0 ${
                          isConfirmed 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                            : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                        }`}>
                          {isConfirmed ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Confirmé
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejeté
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
