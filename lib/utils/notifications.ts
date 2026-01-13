/**
 * Notification utility for OMIGEC Platform
 * Handles sending notifications to users via email
 */

import { createClient } from '@/lib/supabase/server'

export interface NotificationOptions {
  to: string // email address
  subject: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

/**
 * Send a notification to a user
 * Currently uses console logging as placeholder
 * TODO: Integrate with actual email service (Supabase, SendGrid, etc.)
 */
export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  const { to, subject, message, type = 'info' } = options

  try {
    // Log notification for now
    console.log(`[${type.toUpperCase()}] Notification to ${to}:`)
    console.log(`Subject: ${subject}`)
    console.log(`Message: ${message}`)
    console.log('---')

    // TODO: Implement actual email sending
    // Option 1: Use Supabase Auth email templates
    // Option 2: Use a third-party service like SendGrid, Mailgun, etc.
    // Option 3: Use SMTP directly
    
    // For now, we'll return true to indicate the notification was "sent"
    return true
  } catch (error) {
    console.error('Failed to send notification:', error)
    return false
  }
}

/**
 * Send verification confirmation notification to applicant
 */
export async function notifyVerificationConfirmed(applicantEmail: string, applicantName: string): Promise<boolean> {
  return sendNotification({
    to: applicantEmail,
    subject: 'Votre demande a été approuvée - OMIGEC',
    message: `Bonjour ${applicantName},\n\nVotre demande d'adhésion à l'OMIGEC a été approuvée par votre parrain.\n\nVotre statut est maintenant VALIDÉ. Vous pouvez maintenant procéder au paiement de votre cotisation annuelle pour activer votre compte.\n\nCordialement,\nL'équipe OMIGEC`,
    type: 'success'
  })
}

/**
 * Send verification rejection notification to applicant
 */
export async function notifyVerificationRejected(
  applicantEmail: string, 
  applicantName: string, 
  reason?: string
): Promise<boolean> {
  const reasonText = reason 
    ? `\n\nRaison: ${reason}` 
    : ''

  return sendNotification({
    to: applicantEmail,
    subject: 'Votre demande nécessite une visite au bureau - OMIGEC',
    message: `Bonjour ${applicantName},\n\nVotre demande d'adhésion à l'OMIGEC n'a pas pu être validée par votre parrain.${reasonText}\n\nVeuillez vous présenter au bureau de l'OMIGEC avec vos documents originaux pour finaliser votre inscription.\n\nCordialement,\nL'équipe OMIGEC`,
    type: 'warning'
  })
}

/**
 * Send new verification request notification to reference engineer
 */
export async function notifyReferenceRequest(
  referenceEmail: string,
  referenceName: string,
  applicantName: string,
  applicantNNI: string
): Promise<boolean> {
  return sendNotification({
    to: referenceEmail,
    subject: 'Nouvelle demande de parrainage - OMIGEC',
    message: `Bonjour ${referenceName},\n\nVous avez reçu une nouvelle demande de parrainage de la part de ${applicantName} (NNI: ${applicantNNI}).\n\nVeuillez vous connecter à votre espace pour examiner et répondre à cette demande.\n\nCordialement,\nL'équipe OMIGEC`,
    type: 'info'
  })
}

/**
 * Send document verification result notification
 */
export async function notifyDocumentVerification(
  engineerEmail: string,
  engineerName: string,
  approved: boolean,
  reason?: string
): Promise<boolean> {
  if (approved) {
    return sendNotification({
      to: engineerEmail,
      subject: 'Vos documents ont été approuvés - OMIGEC',
      message: `Bonjour ${engineerName},\n\nVos documents ont été vérifiés et approuvés.\n\nVous pouvez maintenant sélectionner un parrain pour finaliser votre inscription.\n\nCordialement,\nL'équipe OMIGEC`,
      type: 'success'
    })
  } else {
    const reasonText = reason 
      ? `\n\nRaison: ${reason}` 
      : ''

    return sendNotification({
      to: engineerEmail,
      subject: 'Vos documents nécessitent des corrections - OMIGEC',
      message: `Bonjour ${engineerName},\n\nVos documents ont été examinés et nécessitent des corrections.${reasonText}\n\nVeuillez soumettre à nouveau les documents corrigés.\n\nCordialement,\nL'équipe OMIGEC`,
      type: 'warning'
    })
  }
}
