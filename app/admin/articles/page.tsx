'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Eye, 
  EyeOff, 
  Newspaper, 
  Upload, 
  Image as ImageIcon,
  Search,
  Clock,
  MoreHorizontal,
  EditIcon,
  FileText
} from 'lucide-react'

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
  { id: 'evenements', name: 'Événements', color: 'text-indigo-600' },
  { id: 'reglementation', name: 'Réglementation', color: 'text-teal-600' },
  { id: 'technique', name: 'Technique', color: 'text-teal-600' }
]

const getCategoryColor = (category: string) => {
  const cat = categories.find(c => c.id === category)
  return cat?.color || 'text-gray-600'
}

const getCategoryName = (category: string) => {
  const cat = categories.find(c => c.id === category)
  return cat?.name || category
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', image: '', published: true, category: 'actualites' })
  const [uploading, setUploading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchArticles = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/articles')
    const data = await res.json()
    setArticles(data)
    setLoading(false)
  }

  useEffect(() => { fetchArticles() }, [])

  const resetForm = () => {
    setFormData({ title: '', description: '', image: '', published: true, category: 'actualites' })
    setEditingArticle(null)
    setShowForm(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('folder', 'articles')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      const data = await res.json()
      
      if (!res.ok) {
        alert(`Erreur d'upload: ${data.error}`)
        return
      }
      
      if (data.url) {
        setFormData({ ...formData, image: data.url })
        alert('Image uploadée avec succès!')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Erreur lors de l\'upload de l\'image')
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingArticle) {
      await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingArticle.id })
      })
    } else {
      await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
    }
    resetForm()
    fetchArticles()
  }

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      description: article.description,
      image: article.image,
      published: article.published,
      category: article.category || 'actualites'
    })
    setEditingArticle(article)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet article ?')) {
      await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' })
      fetchArticles()
    }
  }

  const togglePublished = async (article: Article) => {
    await fetch('/api/admin/articles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.id, published: !article.published })
    })
    fetchArticles()
  }

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Articles</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-light">Gérer les articles et actualités de l'OMIGEC</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={fetchArticles}
                disabled={loading}
                className="p-2.5 text-gray-500 hover:text-[#14919B] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Actualiser"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              {/* Search */}
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent focus-within:border-blue-500 transition-colors">
                <Search className="text-gray-400 w-4 h-4 mr-2" />
                <input 
                  className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-48 outline-none" 
                  placeholder="Rechercher..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* New Article Button */}
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Nouvel Article</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Tabs */}
        <div className="flex space-x-1 mb-8 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article 
                key={article.id}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full relative"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  {article.image ? (
                    <img 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      src={article.image}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  
                  {/* Category Badge */}
                  <span className={`absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${getCategoryColor(article.category || 'actualites')}`}>
                    {getCategoryName(article.category || 'actualites')}
                  </span>
                  
                  {/* Actions Menu */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-1.5 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mb-3 space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>Modifié le {formatDate(article.date)}</span>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {article.description}
                  </p>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        article.published 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-yellow-100 dark:bg-yellow-900/50'
                      }`}>
                        {article.published ? (
                          <Eye className="text-green-600 dark:text-green-400 w-3 h-3" />
                        ) : (
                          <EditIcon className="text-yellow-600 dark:text-yellow-400 w-3 h-3" />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        article.published 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {article.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEdit(article)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            
            {/* Create New Article Card */}
            <button 
              onClick={() => setShowForm(true)}
              className="group border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 min-h-[400px]"
            >
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4">
                <Plus className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 w-8 h-8" />
              </div>
              <span className="text-lg font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600">
                Créer un brouillon rapide
              </span>
              <p className="text-sm text-gray-400 dark:text-gray-600 mt-2 text-center max-w-xs">
                Commencez un nouvel article avec une mise en page vierge.
              </p>
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredArticles.length > 0 && (
          <div className="mt-12 flex justify-center">
            <nav aria-label="Pagination" className="flex items-center space-x-2">
              <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">1</button>
              <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">2</button>
              <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">3</button>
              <span className="px-2 text-gray-400">...</span>
              <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Article Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
              </h2>
              <button 
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Titre</Label>
                  <Input 
                    id="title" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    className="mt-2 h-12 rounded-xl border-gray-300 dark:border-gray-600 text-base"
                    placeholder="Entrez le titre de l'article..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Catégorie</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="mt-2 w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</Label>
                  <textarea
                    id="description"
                    className="mt-2 w-full min-h-[120px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Décrivez votre article..."
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Image de couverture</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="h-12 px-6 rounded-xl border-gray-300 dark:border-gray-600 flex-shrink-0"
                      >
                        {uploading ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploading ? 'Upload...' : 'Uploader'}
                      </Button>
                      <Input 
                        value={formData.image} 
                        onChange={e => setFormData({...formData, image: e.target.value})} 
                        placeholder="Ou collez l'URL de l'image..."
                        className="h-12 rounded-xl border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    
                    {formData.image && (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={e => setFormData({...formData, published: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publier immédiatement
                  </Label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="flex-1 h-12 rounded-xl border-gray-300 dark:border-gray-600"
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                  >
                    {editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
