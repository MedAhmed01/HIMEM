/**
 * Matricule OMIGEC : numéro d'ordre à 4 chiffres stocké en base
 * (colonne `profiles.matricule`, attribuée séquentiellement).
 */
export function formatMatricule(matricule?: string | null) {
  const digits = (matricule || '').replace(/\D/g, '')
  if (!digits) return '—'
  return digits.slice(-4).padStart(4, '0')
}
