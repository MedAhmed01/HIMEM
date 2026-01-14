import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle, XCircle, UserCheck, Receipt, Mail, Phone } from 'lucide-react'

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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Documents en attente de vérification</h1>
        <p className="text-gray-500 text-sm mt-1">{pendingEngineers?.length || 0} document{(pendingEngineers?.length || 0) !== 1 ? 's' : ''} à vérifier</p>
      </div>

      {/* Engineers List */}
      <div className="space-y-4">
        {engineersWithParrains.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucun document en attente</p>
            <p className="text-gray-500 text-sm mt-1">Tous les documents ont été traités</p>
          </div>
        ) : (
          engineersWithParrains.map((engineer) => (
            <div
              key={engineer.id}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {(engineer.full_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{engineer.full_name || 'Utilisateur'}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                      En attente
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <form action="/api/admin/verify-docs" method="POST">
                    <input type="hidden" name="engineerId" value={engineer.id} />
                    <input type="hidden" name="action" value="approve" />
                    <Button
                      type="submit"
                      className="h-10 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white"
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
                      className="h-10 px-4 rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </form>
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
                  <span className="text-xs text-gray-500 uppercase font-medium">Soumis le</span>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(engineer.created_at)}</p>
                </div>
              </div>

              {/* Parrain Info */}
              {engineer.parrain_name && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                  <UserCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 uppercase font-medium">Parrain</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {engineer.parrain_name}
                      {engineer.parrain_phone && (
                        <a href={`tel:${engineer.parrain_phone}`} className="ml-2 text-blue-600 hover:underline">
                          {engineer.parrain_phone}
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              )}

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
    </div>
  )
}
