'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react'

interface Article {
  id: string
  title: string
  description: string
  image: string
  date: string
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/articles/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setArticle(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.id])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = article?.title || ''

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#139a9d] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <Link href="/">
            <Button className="bg-[#139a9d] hover:bg-[#0f7a7d]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back Link */}
              <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour à l'accueil
              </Link>

              {/* Article Header */}
              <header className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <time>{new Date(article.date).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</time>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {article.title}
                </h1>
              </header>

              {/* Featured Image */}
              {article.image && (
                <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden mb-10 bg-gray-100">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none mb-12">
                <p className="text-xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article.description}
                </p>
              </div>

              {/* Share Section */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Partager cet article</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareOnFacebook}
                      className="w-10 h-10 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Facebook className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareOnTwitter}
                      className="w-10 h-10 rounded-full hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200"
                    >
                      <Twitter className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareOnLinkedIn}
                      className="w-10 h-10 rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                    >
                      <Linkedin className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyLink}
                      className="w-10 h-10 rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <LinkIcon className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
