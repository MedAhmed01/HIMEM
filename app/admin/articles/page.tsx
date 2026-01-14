'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Newspaper, Upload, Image as ImageIcon } from 'lucide-react'

interface Article {
  id: string
  title: string
  description: string
  image: string
  date: string
  published: boolean
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', image: '', published: true })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchArticles = async () => {
    const res = await fetch('/api/admin/articles')
    const data = await res.json()
    setArticles(data)
    setLoading(false)
  }

  useEffect(() => { fetchArticles() }, [])

  const resetForm = () => {
    setFormData({ title: '', description: '', image: '', published: true })
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
      published: article.published
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-500 text-sm mt-1">Gérer les articles et actualités</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Nouvel Article
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{editingArticle ? 'Modifier l\'article' : 'Nouvel article'}</h2>
            <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-4 h-4" /></Button>
          </div>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">Titre</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                  className="mt-1 h-10 rounded-lg border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <textarea
                  id="description"
                  className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Image</Label>
                <div className="flex gap-3 mt-1">
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
                    className="h-10 px-4 rounded-lg border-gray-300 flex-shrink-0"
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
                    placeholder="/articles/image.jpg"
                    className="h-10 rounded-lg border-gray-300"
                  />
                </div>
                {formData.image && (
                  <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={e => setFormData({...formData, published: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="published" className="text-sm text-gray-700">Publié</Label>
              </div>
              <Button type="submit" className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700">
                {editingArticle ? 'Mettre à jour' : 'Créer'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Aucun article</p>
                <p className="text-gray-500 text-sm mt-1">Créez votre premier article</p>
              </div>
            ) : (
              articles.map(article => (
                <div key={article.id} className={`p-4 hover:bg-gray-50 transition-colors ${!article.published ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {article.image ? (
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{article.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(article.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => togglePublished(article)}
                        className="h-9 w-9 rounded-lg"
                      >
                        {article.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(article)}
                        className="h-9 w-9 rounded-lg"
                      >
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(article.id)}
                        className="h-9 w-9 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
