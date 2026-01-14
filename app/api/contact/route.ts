import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nom, email et message sont requis' },
        { status: 400 }
      )
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Sauvegarder le message dans la base de données
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || 'Aucun sujet',
        message,
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving contact message:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message' },
        { status: 500 }
      )
    }

    // TODO: Envoyer un email de notification à MedAhmed28234@gmail.com
    // Pour l'instant, le message est sauvegardé dans la DB
    // Vous pouvez configurer un service d'email comme Resend, SendGrid, etc.

    console.log('New contact message:', {
      id: data.id,
      from: email,
      name,
      subject
    })

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
      messageId: data.id
    })

  } catch (error: any) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
