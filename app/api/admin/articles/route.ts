import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const articlesPath = path.join(process.cwd(), 'data', 'articles.json')

function getArticles() {
  try {
    const data = fs.readFileSync(articlesPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function saveArticles(articles: unknown[]) {
  fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2))
}

export async function GET() {
  return NextResponse.json(getArticles())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const articles = getArticles()
    const newArticle = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      image: body.image || '/articles/default.jpg',
      date: new Date().toISOString().split('T')[0],
      published: body.published ?? true
    }
    articles.unshift(newArticle)
    saveArticles(articles)
    return NextResponse.json(newArticle, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const articles = getArticles()
    const index = articles.findIndex((a: { id: string }) => a.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }
    articles[index] = { ...articles[index], ...body }
    saveArticles(articles)
    return NextResponse.json(articles[index])
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const articles = getArticles()
    const filtered = articles.filter((a: { id: string }) => a.id !== id)
    saveArticles(filtered)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
