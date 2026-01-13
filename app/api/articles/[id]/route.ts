import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const articlesPath = path.join(process.cwd(), 'data', 'articles.json')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = fs.readFileSync(articlesPath, 'utf-8')
    const articles = JSON.parse(data)
    const article = articles.find((a: { id: string; published: boolean }) => a.id === id && a.published)
    
    if (!article) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }
    
    return NextResponse.json(article)
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
