import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: sponsors, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching sponsors:', error)
      return NextResponse.json({ sponsors: [], error: error.message })
    }

    return NextResponse.json({ sponsors: sponsors || [] })
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json({ sponsors: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const formData = await request.formData()
    
    const action = formData.get('action') as string
    const sponsorId = formData.get('sponsorId') as string
    
    // Delete sponsor
    if (action === 'delete' && sponsorId) {
      // Get sponsor to delete logo from storage
      const { data: sponsor } = await supabase
        .from('sponsors')
        .select('logo_path')
        .eq('id', sponsorId)
        .single()
      
      if (sponsor?.logo_path) {
        await supabase.storage.from('sponsors').remove([sponsor.logo_path])
      }
      
      const { error } = await supabase.from('sponsors').delete().eq('id', sponsorId)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }
    
    // Toggle active status
    if (action === 'toggle' && sponsorId) {
      const { data: sponsor } = await supabase
        .from('sponsors')
        .select('is_active')
        .eq('id', sponsorId)
        .single()
      
      const { error } = await supabase
        .from('sponsors')
        .update({ is_active: !sponsor?.is_active })
        .eq('id', sponsorId)
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }
    
    // Reorder sponsors
    if (action === 'reorder') {
      const orders = JSON.parse(formData.get('orders') as string)
      for (const item of orders) {
        await supabase
          .from('sponsors')
          .update({ display_order: item.order })
          .eq('id', item.id)
      }
      return NextResponse.json({ success: true })
    }
    
    // Add new sponsor
    const name = formData.get('name') as string
    const websiteUrl = formData.get('websiteUrl') as string
    const logoFile = formData.get('logo') as File
    
    if (!name) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }
    
    if (!logoFile || logoFile.size === 0) {
      return NextResponse.json({ error: 'Logo requis' }, { status: 400 })
    }
    
    // Get max order
    const { data: maxOrderData } = await supabase
      .from('sponsors')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()
    
    const newOrder = (maxOrderData?.display_order || 0) + 1
    
    // Upload logo to Supabase Storage
    const fileExt = logoFile.name.split('.').pop()
    const fileName = `sponsor_${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`
    
    const arrayBuffer = await logoFile.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('sponsors')
      .upload(filePath, arrayBuffer, {
        contentType: logoFile.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erreur lors du téléchargement: ' + uploadError.message }, { status: 500 })
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('sponsors')
      .getPublicUrl(filePath)
    
    // Insert sponsor
    const { error: insertError } = await supabase
      .from('sponsors')
      .insert({
        name,
        website_url: websiteUrl || null,
        logo_url: publicUrl,
        logo_path: filePath,
        display_order: newOrder,
        is_active: true
      })
    
    if (insertError) {
      console.error('Insert error:', insertError)
      // Clean up uploaded file
      await supabase.storage.from('sponsors').remove([filePath])
      return NextResponse.json({ error: 'Erreur lors de l\'ajout: ' + insertError.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error managing sponsors:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
