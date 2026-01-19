'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  description: string
  image: string
  date: string
  published: boolean
  category?: string
}

const getCategoryName = (category: string) => {
  const categories: { [key: string]: string } = {
    'actualites': 'Actualités',
    'formations': 'Formations',
    'evenements': 'Événement',
    'reglementation': 'Réglementation',
    'technique': 'Technique'
  }
  return categories[category] || category
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'actualites': 'text-green-600',
    'formations': 'text-purple-600',
    'evenements': 'text-orange-500',
    'reglementation': 'text-teal-600',
    'technique': 'text-blue-600'
  }
  return colors[category] || 'text-gray-600'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export default function LatestArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles')
        if (response.ok) {
          const data = await response.json()
          // Prendre seulement les 3 derniers articles
          setArticles(data.slice(0, 3))
        }
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-slate-50 dark:bg-slate-900/50 -z-10 skew-x-12 translate-x-24"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#14919B]/10 rounded-lg text-[#14919B]">
                  <span className="material-icons-outlined">newspaper</span>
                </div>
                <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">Actualités</span>
              </div>
              <h2 className="font-display font-bold text-4xl text-slate-900 dark:text-white">Dernières Publications</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skeleton pour l'article principal */}
            <div className="lg:col-span-2">
              <div className="relative h-96 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse">
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                  <div className="w-20 h-6 bg-slate-300 dark:bg-slate-600 rounded-full mb-3"></div>
                  <div className="w-3/4 h-8 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>
            {/* Skeleton pour les articles secondaires */}
            <div className="flex flex-col gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse flex gap-4 h-full">
                  <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex flex-col justify-center flex-1">
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="w-full h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-slate-50 dark:bg-slate-900/50 -z-10 skew-x-12 translate-x-24"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#14919B]/10 rounded-lg text-[#14919B]">
                  <span className="material-icons-outlined">newspaper</span>
                </div>
                <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">Actualités</span>
              </div>
              <h2 className="font-display font-bold text-4xl text-slate-900 dark:text-white">Dernières Publications</h2>
            </div>
            <Link className="group inline-flex items-center text-[#14919B] font-bold hover:text-[#0E646C] transition-colors" href="/articles">
              Voir toutes les actualités
              <span className="material-icons-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="material-icons-outlined text-slate-400 text-2xl">article</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Aucun article publié pour le moment</p>
          </div>
        </div>
      </section>
    )
  }

  const [mainArticle, ...sideArticles] = articles

  return (
    <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-slate-50 dark:bg-slate-900/50 -z-10 skew-x-12 translate-x-24"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#14919B]/10 rounded-lg text-[#14919B]">
                <span className="material-icons-outlined">newspaper</span>
              </div>
              <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">Actualités</span>
            </div>
            <h2 className="font-display font-bold text-4xl text-slate-900 dark:text-white">Dernières Publications</h2>
          </div>
          <Link className="group inline-flex items-center text-[#14919B] font-bold hover:text-[#0E646C] transition-colors" href="/articles">
            Voir toutes les actualités
            <span className="material-icons-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article principal */}
          {mainArticle && (
            <Link href={`/articles/${mainArticle.id}`} className="lg:col-span-2 group cursor-pointer">
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-90"></div>
                <img 
                  alt={mainArticle.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={mainArticle.image || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                  <span className="inline-block px-3 py-1 bg-[#14919B] text-white text-xs font-bold rounded-full mb-3">
                    À la une
                  </span>
                  <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 group-hover:underline decoration-[#14919B] decoration-4 underline-offset-4">
                    {mainArticle.title}
                  </h3>
                  <div className="flex items-center text-slate-300 text-sm gap-4">
                    <span className="flex items-center gap-1">
                      <span className="material-icons-outlined text-sm">calendar_today</span> 
                      {formatDate(mainArticle.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons-outlined text-sm">schedule</span> 
                      5 min de lecture
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}
          
          {/* Articles secondaires */}
          <div className="flex flex-col gap-6">
            {sideArticles.map((article) => (
              <Link 
                key={article.id}
                href={`/articles/${article.id}`}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-[#14919B]/50 dark:hover:border-[#14919B]/50 transition-colors cursor-pointer group flex gap-4 h-full"
              >
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                  <img 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    src={article.image || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className={`text-xs font-bold mb-1 ${getCategoryColor(article.category || 'actualites')}`}>
                    {getCategoryName(article.category || 'actualites')}
                  </span>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-[#14919B] transition-colors">
                    {article.title}
                  </h4>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {formatDate(article.date)}
                  </span>
                </div>
              </Link>
            ))}
            
            {/* Si moins de 2 articles secondaires, afficher un placeholder */}
            {sideArticles.length < 2 && (
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center h-full min-h-[120px]">
                <div className="text-center">
                  <span className="material-icons-outlined text-slate-400 text-2xl mb-2 block">article</span>
                  <p className="text-slate-400 text-sm">Plus d'articles bientôt</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}