import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const articlesPath = path.join(process.cwd(), 'data', 'articles.json')

export async function GET() {
  try {
    const data = fs.readFileSync(articlesPath, 'utf-8')
    const articles = JSON.parse(data)
    const published = articles.filter((a: { published: boolean }) => a.published)
    return NextResponse.json(published)
  } catch {
    return NextResponse.json([])
  }
}
