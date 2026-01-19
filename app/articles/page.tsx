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

const categories = [
  { id: 'all', name: 'Tous les articles', color: 'text-blue-600' },
  { id: 'actualites', name: 'Actualités', color: 'text-green-600' },
  { id: 'formations', name: 'Formations', color: 'text-purple-600' },
  { id: 'evenements', name: 'Événements', color: 'text-orange-500' },
  { id: 'reglementation', name: 'Réglementation', color: 'text-teal-600' },
  { id: 'technique', name: 'Technique', color: 'text-blue-600' }
]

const getCategoryName = (category: string) => {
  const cat = categories.find(c => c.id === category)
  return cat?.name || category
}

const getCategoryColor = (category: string) => {
  const cat = categories.find(c => c.id === category)
  return cat?.color || 'text-gray-600'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles')
        if (response.ok) {
          const data = await response.json()
          setArticles(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const filteredArticles = articles.filter(article => 
    activeCategory === 'all' || article.category === activeCategory
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-[#14919B]/10 rounded-xl text-[#14919B]">
                <span className="material-icons-outlined text-2xl">newspaper</span>
              </div>
              <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">Actualités</span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 dark:text-white mb-4">
              Articles & Actualités
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Restez informé des dernières nouvelles, réglementations et événements de l'OMIGEC
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeCategory === category.id
                  ? 'bg-[#14919B] text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6">
                  <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <span className="material-icons-outlined text-gray-400 text-2xl">article</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeCategory === 'all' 
                ? 'Aucun article publié pour le moment' 
                : `Aucun article dans la catégorie "${getCategoryName(activeCategory)}"`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <span className={`absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${getCategoryColor(article.category || 'actualites')}`}>
                    {getCategoryName(article.category || 'actualites')}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mb-3">
                    <span className="material-icons-outlined text-sm mr-1">calendar_today</span>
                    {formatDate(article.date)}
                  </div>
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-[#14919B] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                  <div className="mt-4 flex items-center text-[#14919B] font-medium text-sm group-hover:gap-2 transition-all">
                    Lire la suite
                    <span className="material-icons-outlined text-sm ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-16">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[#14919B] text-white font-medium rounded-full hover:bg-[#0E646C] transition-colors"
          >
            <span className="material-icons-outlined text-sm mr-2">home</span>
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  )
}