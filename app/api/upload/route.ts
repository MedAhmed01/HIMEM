import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'articles'
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const uploadDir = path.join(process.cwd(), 'public', folder)
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)
    
    return NextResponse.json({ url: `/${folder}/${fileName}` })
  } catch {
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })
  }
}
