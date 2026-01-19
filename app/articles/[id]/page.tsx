'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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
    'evenements': 'Événements',
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
    month: 'long',
    year: 'numeric'
  })
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setArticle(data)
        } else {
          setError(true)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'article:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <span className="material-icons-outlined text-red-500 text-2xl">error_outline</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Article non trouvé
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            L'article que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center px-6 py-3 bg-[#14919B] text-white font-medium rounded-full hover:bg-[#0E646C] transition-colors"
          >
            <span className="material-icons-outlined text-sm mr-2">arrow_back</span>
            Retour aux articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/articles"
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-[#14919B] transition-colors"
            >
              <span className="material-icons-outlined text-sm mr-2">arrow_back</span>
              Retour aux articles
            </Link>
            <Link
              href="/"
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-[#14919B] transition-colors"
            >
              <span className="material-icons-outlined text-sm mr-2">home</span>
              Accueil
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className={`bg-white dark:bg-gray-800 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-sm border ${getCategoryColor(article.category || 'actualites')}`}>
              {getCategoryName(article.category || 'actualites')}
            </span>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <span className="material-icons-outlined text-sm mr-1">calendar_today</span>
              {formatDate(article.date)}
            </div>
          </div>
          
          <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900 dark:text-white leading-tight mb-6">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className="material-icons-outlined text-sm mr-1">schedule</span>
              5 min de lecture
            </div>
            <div className="flex items-center">
              <span className="material-icons-outlined text-sm mr-1">visibility</span>
              Article publié
            </div>
          </div>
        </header>

        {/* Article Image */}
        {article.image && (
          <div className="relative h-96 rounded-2xl overflow-hidden mb-12 shadow-xl">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Article Body */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
              {article.description}
            </p>
            
            {/* Contenu étendu de l'article */}
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Cet article présente les dernières informations et développements concernant {article.title.toLowerCase()}. 
                L'OMIGEC s'engage à tenir ses membres informés des évolutions importantes dans le domaine du génie civil.
              </p>
              
              <p>
                Les ingénieurs civils jouent un rôle crucial dans le développement de l'infrastructure mauritanienne. 
                Cette publication vise à fournir des informations précises et actualisées pour soutenir l'excellence 
                professionnelle de nos membres.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                Points clés à retenir
              </h2>
              
              <ul className="space-y-2 ml-6">
                <li>• Information importante concernant la réglementation en vigueur</li>
                <li>• Mise à jour des standards professionnels</li>
                <li>• Recommandations pour les bonnes pratiques</li>
                <li>• Ressources additionnelles pour les membres</li>
              </ul>
              
              <div className="bg-[#14919B]/10 border-l-4 border-[#14919B] p-6 rounded-r-lg mt-8">
                <p className="text-[#14919B] dark:text-[#14919B] font-medium">
                  <strong>Note importante :</strong> Pour plus d'informations ou des clarifications, 
                  n'hésitez pas à contacter l'OMIGEC directement via nos canaux officiels.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Partagez cet article
              </h3>
              <div className="flex gap-3">
                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <span className="material-icons-outlined text-sm">share</span>
                </button>
                <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                  <span className="material-icons-outlined text-sm">link</span>
                </button>
                <button className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors">
                  <span className="material-icons-outlined text-sm">email</span>
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Publié par l'OMIGEC
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Ordre Mauritanien des Ingénieurs de Génie Civil
              </p>
            </div>
          </div>
        </footer>
      </article>

      {/* Related Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-4">
            Articles similaires
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez d'autres articles qui pourraient vous intéresser
          </p>
        </div>
        
        <div className="text-center">
          <Link
            href="/articles"
            className="inline-flex items-center px-8 py-4 bg-[#14919B] text-white font-medium rounded-full hover:bg-[#0E646C] transition-colors shadow-lg"
          >
            Voir tous les articles
            <span className="material-icons-outlined text-sm ml-2">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  )
}