'use client'


import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  X,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Key,
  Ban,
  Trash2,
  CheckCircle,
  AlertCircle,
  Edit3,
  GraduationCap,
  FileText,
  Eye,
  CreditCard,
  Printer,
  Loader2,
  BookOpen
} from 'lucide-react'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'
import EditEngineerModal from '@/components/admin/EditEngineerModal'
import EngineerIdCard from '@/components/admin/EngineerIdCard'
import EngineerDirectoryDocument from '@/components/admin/EngineerDirectoryDocument'

interface Engineer {
  id: string
  nni: string
  matricule?: string | null
  full_name: string
  email: string
  phone: string
  diploma: string
  grad_year: number
  status: string
  subscription_expiry: string | null
  profile_image_url?: string
  diploma_file_path?: string
  cni_file_path?: string
  payment_receipt_path?: string
  university?: string
  country?: string
  domain?: string[]
  exercise_mode?: string[]
  parrain_name?: string | null
  parrain_phone?: string | null
  created_at: string
}

export default function IngenieursPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEngineerIds, setSelectedEngineerIds] = useState<Set<string>>(new Set())
  const [cardEngineers, setCardEngineers] = useState<Engineer[]>([])
  const [isCardPreviewOpen, setIsCardPreviewOpen] = useState(false)
  const [cardOrientation, setCardOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isDirectoryPreviewOpen, setIsDirectoryPreviewOpen] = useState(false)
  const [isGeneratingDirectoryPdf, setIsGeneratingDirectoryPdf] = useState(false)
  const [restrictToActiveSubscription, setRestrictToActiveSubscription] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [changePasswordModal, setChangePasswordModal] = useState<{
    isOpen: boolean
    userId: string
    userName: string
  }>({
    isOpen: false,
    userId: '',
    userName: ''
  })
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    engineer: Engineer | null
  }>({
    isOpen: false,
    engineer: null
  })

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    engineerId: string
    engineerName: string
  }>({
    isOpen: false,
    engineerId: '',
    engineerName: ''
  })
  const [docsModal, setDocsModal] = useState<{
    isOpen: boolean
    engineer: Engineer | null
  }>({
    isOpen: false,
    engineer: null
  })

  const loadEngineers = async () => {
    try {
      const res = await fetch('/api/admin/engineers')
      const data = await res.json()
      if (data.engineers) {
        setEngineers(data.engineers)
        const availableIds = new Set<string>(data.engineers.map((engineer: Engineer) => engineer.id))
        setSelectedEngineerIds((current) => new Set([...current].filter((id) => availableIds.has(id))))
      }
    } catch (error) {
      console.error('Error loading engineers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEngineers()
  }, [])

  const handleSubscription = async (engineerId: string, action: 'activate' | 'deactivate') => {
    const res = await fetch('/api/admin/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engineerId, action })
    })

    if (res.ok) {
      loadEngineers()
    }
  }

  const handleChangePassword = (engineerId: string, engineerName: string) => {
    setChangePasswordModal({
      isOpen: true,
      userId: engineerId,
      userName: engineerName
    })
  }

  const handlePasswordChangeSuccess = (message: string) => {
    setMessage({ type: 'success', text: message })
  }

  const handlePasswordChangeError = (error: string) => {
    setMessage({ type: 'error', text: error })
  }

  const handleEdit = (engineer: Engineer) => {
    setEditModal({
      isOpen: true,
      engineer
    })
  }

  const handleEditSuccess = (message: string) => {
    setMessage({ type: 'success', text: message })
    loadEngineers()
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/engineers/${deleteDialog.engineerId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Ingénieur supprimé avec succès' })
        setDeleteDialog({ isOpen: false, engineerId: '', engineerName: '' })
        loadEngineers()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' })
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
            Validé
          </span>
        )
      case 'pending_docs':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <span className="w-2 h-2 mr-2 bg-orange-500 rounded-full"></span>
            Documents en attente
          </span>
        )
      case 'pending_reference':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
            Parrainage en attente
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
            Rejeté
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <span className="w-2 h-2 mr-2 bg-gray-500 rounded-full"></span>
            {status}
          </span>
        )
    }
  }

  const isSubscriptionActive = (expiry: string | null) => {
    if (!expiry) return false
    return new Date(expiry) > new Date()
  }

  // When the restriction is enabled, cards and the annuaire only include
  // engineers whose subscription (cotisation) is still valid.
  const getEligibleEngineers = (items: Engineer[]) =>
    restrictToActiveSubscription
      ? items.filter((engineer) => isSubscriptionActive(engineer.subscription_expiry))
      : items

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-red-600',
      'bg-orange-600', 'bg-yellow-600', 'bg-green-600', 'bg-teal-600', 'bg-cyan-600'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const toggleEngineerSelection = (engineerId: string) => {
    setSelectedEngineerIds((current) => {
      const next = new Set(current)
      if (next.has(engineerId)) {
        next.delete(engineerId)
      } else {
        next.add(engineerId)
      }
      return next
    })
  }

  const openCardPreview = (items: Engineer[]) => {
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Sélectionnez au moins un ingénieur.' })
      return
    }
    setCardEngineers(items)
    setIsCardPreviewOpen(true)
  }

  const handleDownloadPdf = async () => {
    const preview = document.querySelector<HTMLElement>('.id-card-print-root')
    if (!preview) return
    const cards = Array.from(preview.querySelectorAll<HTMLElement>('.engineer-id-card'))
    if (cards.length === 0) return

    setIsGeneratingPdf(true)
    try {
      // Wait for portraits and QR codes to be fully loaded before printing.
      const images = Array.from(preview.querySelectorAll<HTMLImageElement>('img'))
      await Promise.all(images.map((image) => image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          })))
      await document.fonts?.ready

      // Collect the page's stylesheets so the cards keep their styling in the
      // isolated print document. The browser renders vector text natively — no
      // html2canvas, no oklch parsing issues, no main-thread freeze.
      const styleHtml = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((node) => node.outerHTML)
        .join('\n')

      const iframe = document.createElement('iframe')
      iframe.setAttribute('aria-hidden', 'true')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)

      const frameDoc = iframe.contentWindow?.document
      if (!frameDoc) throw new Error('Impossible de créer le document d\'impression.')

      // One page per individual card (front, then back), each page sized to the
      // card itself so it can be printed and cut directly. Landscape cards use
      // the same standard ID-card footprint, rotated.
      const isHorizontal = cardOrientation === 'horizontal'
      const pageW = isHorizontal ? '85.6mm' : '54mm'
      const pageH = isHorizontal ? '54mm' : '85.6mm'
      const pagesHtml = cards
        .map((card) => `<div class="print-page">${card.outerHTML}</div>`)
        .join('')

      frameDoc.open()
      frameDoc.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>cartes-omigec</title>
${styleHtml}
<style>
  /* Standard ID/credit-card footprint (54mm x 85.6mm), portrait or landscape. */
  @page { size: ${pageW} ${pageH}; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .print-page {
    width: ${pageW};
    height: ${pageH};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }
  .print-page:last-child { page-break-after: auto; break-after: auto; }
  .engineer-id-card {
    box-shadow: none !important;
    border: none !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
</style>
</head>
<body>${pagesHtml}</body>
</html>`)
      frameDoc.close()

      const frameWindow = iframe.contentWindow
      if (!frameWindow) throw new Error('Impossible de créer le document d\'impression.')

      // Wait for the iframe document (and its images/fonts) to be ready.
      await new Promise<void>((resolve) => {
        if (frameDoc.readyState === 'complete') {
          resolve()
        } else {
          iframe.addEventListener('load', () => resolve(), { once: true })
        }
      })
      const frameImages = Array.from(frameDoc.querySelectorAll('img'))
      await Promise.all(frameImages.map((image) => image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          })))
      await frameDoc.fonts?.ready

      frameWindow.focus()
      frameWindow.print()

      // Clean up the iframe after the print dialog has been handled.
      const cleanup = () => {
        setTimeout(() => {
          iframe.remove()
        }, 500)
      }
      frameWindow.addEventListener('afterprint', cleanup, { once: true })
      setTimeout(cleanup, 60000)

      setMessage({
        type: 'success',
        text: 'Fenêtre d\'impression ouverte — choisissez « Enregistrer au format PDF ».',
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      setMessage({ type: 'error', text: 'Impossible de générer le PDF.' })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const openDirectoryPreview = () => {
    if (getEligibleEngineers(engineers).length === 0) {
      setMessage({
        type: 'error',
        text: restrictToActiveSubscription
          ? 'Aucun ingénieur avec une cotisation à jour à inclure dans l’annuaire.'
          : 'Aucun ingénieur à inclure dans l’annuaire.',
      })
      return
    }
    setIsDirectoryPreviewOpen(true)
  }

  const handleDownloadDirectoryPdf = async () => {
    const directory = document.querySelector<HTMLElement>('.engineer-directory-document')
    if (!directory) return
    const pages = Array.from(directory.querySelectorAll<HTMLElement>('.engineer-directory-page'))
    if (pages.length === 0) return

    setIsGeneratingDirectoryPdf(true)
    try {
      // Wait for the profile photos and logos to load before printing.
      const images = Array.from(directory.querySelectorAll<HTMLImageElement>('img'))
      await Promise.all(images.map((image) => image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          })))
      await document.fonts?.ready

      // Native print keeps the browser rendering the A4 pages as crisp vector
      // output — no html2canvas, so it stays fast and never freezes the UI.
      const styleHtml = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]')
      )
        .map((node) => node.outerHTML)
        .join('\n')

      const iframe = document.createElement('iframe')
      iframe.setAttribute('aria-hidden', 'true')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)

      const frameDoc = iframe.contentWindow?.document
      if (!frameDoc) throw new Error('Impossible de créer le document d\'impression.')

      const pagesHtml = pages
        .map((page) => `<div class="print-page">${page.outerHTML}</div>`)
        .join('')

      frameDoc.open()
      frameDoc.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>annuaire-omigec-${new Date().getFullYear()}</title>
${styleHtml}
<style>
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .print-page {
    width: 210mm;
    height: 297mm;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }
  .print-page:last-child { page-break-after: auto; break-after: auto; }
  .engineer-directory-page {
    box-shadow: none !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
</style>
</head>
<body>${pagesHtml}</body>
</html>`)
      frameDoc.close()

      const frameWindow = iframe.contentWindow
      if (!frameWindow) throw new Error('Impossible de créer le document d\'impression.')

      await new Promise<void>((resolve) => {
        if (frameDoc.readyState === 'complete') {
          resolve()
        } else {
          iframe.addEventListener('load', () => resolve(), { once: true })
        }
      })
      const frameImages = Array.from(frameDoc.querySelectorAll('img'))
      await Promise.all(frameImages.map((image) => image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          })))
      await frameDoc.fonts?.ready

      frameWindow.focus()
      frameWindow.print()

      const cleanup = () => {
        setTimeout(() => {
          iframe.remove()
        }, 500)
      }
      frameWindow.addEventListener('afterprint', cleanup, { once: true })
      setTimeout(cleanup, 60000)

      setMessage({
        type: 'success',
        text: 'Fenêtre d\'impression ouverte — choisissez « Enregistrer au format PDF ».',
      })
    } catch (error) {
      console.error('Directory PDF generation error:', error)
      setMessage({ type: 'error', text: 'Impossible de générer l’annuaire PDF.' })
    } finally {
      setIsGeneratingDirectoryPdf(false)
    }
  }

  const filteredEngineers = engineers.filter(eng =>
    eng.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eng.nni?.includes(searchQuery) ||
    eng.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Engineers eligible for cards / annuaire once the subscription restriction is applied.
  const eligibleEngineers = getEligibleEngineers(engineers)
  const excludedCount = engineers.length - eligibleEngineers.length
  const directoryEngineers = [...eligibleEngineers].sort((a, b) =>
    a.full_name.localeCompare(b.full_name, 'fr')
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Ingénieurs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérer les ingénieurs et générer leurs cartes professionnelles</p>
        </div>

        <div className="flex w-full xl:w-auto flex-col sm:flex-row sm:flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openCardPreview(eligibleEngineers)}
            disabled={eligibleEngineers.length === 0}
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Générer toutes les cartes
          </button>

          <button
            type="button"
            onClick={openDirectoryPreview}
            disabled={eligibleEngineers.length === 0}
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Annuaire PDF
          </button>

          {/* Restrict cards & annuaire to members with a valid subscription */}
          <label
            className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer select-none shadow-sm"
            title="Limiter les cartes et l’annuaire aux ingénieurs dont la cotisation est à jour"
          >
            <input
              type="checkbox"
              checked={restrictToActiveSubscription}
              onChange={(e) => setRestrictToActiveSubscription(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-teal-600"
            />
            <span>
              Cotisation à jour uniquement
              {restrictToActiveSubscription && excludedCount > 0 && (
                <span className="ml-1 text-xs text-slate-400">({excludedCount} exclu{excludedCount !== 1 ? 's' : ''})</span>
              )}
            </span>
          </label>

          {/* Search */}
          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-teal-600 transition-colors w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, NNI ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm placeholder-slate-400 shadow-sm transition-all bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Message Area */}
      {message && (
        <div className={`p-4 rounded-xl border backdrop-blur-sm flex items-center justify-between ${message.type === 'success'
          ? 'bg-green-50/80 border-green-200 text-green-800'
          : 'bg-red-50/80 border-red-200 text-red-800'
          }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {filteredEngineers.length} ingénieur{filteredEngineers.length !== 1 ? 's' : ''}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const visibleIds = filteredEngineers.map((engineer) => engineer.id)
              const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedEngineerIds.has(id))
              setSelectedEngineerIds((current) => {
                const next = new Set(current)
                visibleIds.forEach((id) => allVisibleSelected ? next.delete(id) : next.add(id))
                return next
              })
            }}
            disabled={filteredEngineers.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 disabled:opacity-50 transition-colors"
          >
            {filteredEngineers.length > 0 && filteredEngineers.every((engineer) => selectedEngineerIds.has(engineer.id))
              ? 'Désélectionner les résultats'
              : 'Sélectionner les résultats'}
          </button>
          {selectedEngineerIds.size > 0 && (
            <>
              <button
                type="button"
                onClick={() => openCardPreview(getEligibleEngineers(engineers.filter((engineer) => selectedEngineerIds.has(engineer.id))))}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Générer la sélection ({selectedEngineerIds.size})
              </button>
              <button
                type="button"
                onClick={() => setSelectedEngineerIds(new Set())}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                Effacer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredEngineers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">Aucun ingénieur trouvé</p>
          </div>
        ) : (
          filteredEngineers.map((engineer) => (
            <div key={engineer.id} className={`relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border transition-colors ${selectedEngineerIds.has(engineer.id) ? 'border-teal-500 ring-2 ring-teal-500/15' : 'border-slate-100 dark:border-slate-700'}`}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <label className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEngineerIds.has(engineer.id)}
                      onChange={() => toggleEngineerSelection(engineer.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                    />
                    Sélectionner
                  </label>
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage src={engineer.profile_image_url} alt={engineer.full_name} className="object-cover" />
                    <AvatarFallback className={`${getAvatarColor(engineer.full_name)} text-white text-xl font-semibold`}>
                      {getInitials(engineer.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{engineer.full_name}</h2>
                      <p className="text-sm text-slate-500 font-mono mt-1">NNI: {engineer.nni}</p>
                    </div>
                    {getStatusBadge(engineer.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 mt-5">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Mail className="text-slate-400 mr-2 w-4 h-4" />
                      <span className="truncate">{engineer.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Phone className="text-slate-400 mr-2 w-4 h-4" />
                      <span>{engineer.phone || '-'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <GraduationCap className="text-slate-400 mr-2 w-4 h-4" />
                      <span>Promo: {engineer.grad_year || '-'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Calendar className="text-slate-400 mr-2 w-4 h-4" />
                      <span>Exp: {formatDate(engineer.subscription_expiry)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${isSubscriptionActive(engineer.subscription_expiry)
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {isSubscriptionActive(engineer.subscription_expiry) ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <X className="w-4 h-4 mr-1.5" />}
                      {isSubscriptionActive(engineer.subscription_expiry) ? 'À jour' : 'Expiré'}
                    </span>

                    <button
                      onClick={() => openCardPreview([engineer])}
                      disabled={restrictToActiveSubscription && !isSubscriptionActive(engineer.subscription_expiry)}
                      title={restrictToActiveSubscription && !isSubscriptionActive(engineer.subscription_expiry)
                        ? 'Cotisation expirée — désactivez le filtre pour générer cette carte'
                        : undefined}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Générer la carte
                    </button>

                    <button
                      onClick={() => handleChangePassword(engineer.id, engineer.full_name)}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Mot de passe
                    </button>

                    <button
                      onClick={() => handleEdit(engineer)}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier
                    </button>

                    {!isSubscriptionActive(engineer.subscription_expiry) ? (
                      <button
                        onClick={() => handleSubscription(engineer.id, 'activate')}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscription(engineer.id, 'deactivate')}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Désactiver
                      </button>
                    )}

                    <button
                      onClick={() => setDocsModal({ isOpen: true, engineer })}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Documents
                    </button>

                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, engineerId: engineer.id, engineerName: engineer.full_name })}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        onClose={() => setChangePasswordModal({ isOpen: false, userId: '', userName: '' })}
        userId={changePasswordModal.userId}
        userType="ingenieur"
        userName={changePasswordModal.userName}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
      />

      <EditEngineerModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, engineer: null })}
        engineer={editModal.engineer}
        onSuccess={handleEditSuccess}
        onError={(err) => setMessage({ type: 'error', text: err })}
      />

      {isCardPreviewOpen && typeof document !== 'undefined' && createPortal(
        <div className="admin-id-card-modal fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-4 sm:p-8">
          <div className="admin-id-card-modal-panel mx-auto max-w-7xl overflow-hidden rounded-2xl bg-slate-100 shadow-2xl dark:bg-slate-900">
            <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/95">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aperçu des cartes professionnelles</h3>
                <p className="text-sm text-slate-500">{cardEngineers.length} carte{cardEngineers.length !== 1 ? 's' : ''} · recto et verso</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-600">
                  <button
                    type="button"
                    onClick={() => setCardOrientation('vertical')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${cardOrientation === 'vertical' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                  >
                    Verticale
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardOrientation('horizontal')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${cardOrientation === 'horizontal' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                  >
                    Horizontale
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
                >
                  {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                  {isGeneratingPdf ? 'Préparation...' : 'Imprimer / PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCardPreviewOpen(false)}
                  className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Fermer
                </button>
              </div>
            </div>

            <div className={`id-card-print-root id-card-preview-grid ${cardOrientation === 'horizontal' ? 'id-card-preview-grid-h' : ''} p-5 sm:p-8`}>
              {cardEngineers.map((engineer) => (
                <EngineerIdCard key={engineer.id} engineer={engineer} orientation={cardOrientation} />
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {isDirectoryPreviewOpen && typeof document !== 'undefined' && createPortal(
        <div className="admin-directory-modal fixed inset-0 z-[75] overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-4 sm:p-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-slate-200 shadow-2xl dark:bg-slate-900">
            <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-slate-200 bg-white/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/95">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aperçu de l’annuaire OMIGEC</h3>
                <p className="text-sm text-slate-500">
                  {directoryEngineers.length} ingénieur{directoryEngineers.length !== 1 ? 's' : ''}
                  {restrictToActiveSubscription ? ' · cotisation à jour' : ''} · format A4
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDirectoryPdf}
                  disabled={isGeneratingDirectoryPdf}
                  className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
                >
                  {isGeneratingDirectoryPdf
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <Printer className="w-4 h-4 mr-2" />}
                  {isGeneratingDirectoryPdf ? 'Préparation...' : 'Imprimer l’annuaire / PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDirectoryPreviewOpen(false)}
                  disabled={isGeneratingDirectoryPdf}
                  className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Fermer
                </button>
              </div>
            </div>

            <div className="directory-preview-stage overflow-x-auto p-5 sm:p-8">
              <EngineerDirectoryDocument
                engineers={directoryEngineers}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-lg font-semibold mb-2">Supprimer l&apos;ingénieur</h3>
            <p className="text-slate-600 mb-6">
              Voulez-vous supprimer <span className="font-bold">{deleteDialog.engineerName}</span> ?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteDialog({ isOpen: false, engineerId: '', engineerName: '' })} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {/* Documents Modal */}
      {docsModal.isOpen && docsModal.engineer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Documents - {docsModal.engineer.full_name}</h3>
              <button onClick={() => setDocsModal({ isOpen: false, engineer: null })} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                disabled={!docsModal.engineer.diploma_file_path}
                onClick={() => window.open(`/api/admin/engineers/${docsModal.engineer?.id}/documents/diploma`, '_blank')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${docsModal.engineer.diploma_file_path
                  ? 'bg-slate-50 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                  : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-slate-700">Diplôme Professionnel</span>
                </div>
                {docsModal.engineer.diploma_file_path ? <Eye className="w-5 h-5 text-slate-400" /> : <X className="w-5 h-5 text-red-400" />}
              </button>

              <button
                disabled={!docsModal.engineer.cni_file_path}
                onClick={() => window.open(`/api/admin/engineers/${docsModal.engineer?.id}/documents/cni`, '_blank')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${docsModal.engineer.cni_file_path
                  ? 'bg-slate-50 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                  : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-slate-700">Pièce d&apos;Identité</span>
                </div>
                {docsModal.engineer.cni_file_path ? <Eye className="w-5 h-5 text-slate-400" /> : <X className="w-5 h-5 text-red-400" />}
              </button>

              <button
                disabled={!docsModal.engineer.payment_receipt_path}
                onClick={() => window.open(`/api/admin/engineers/${docsModal.engineer?.id}/documents/payment`, '_blank')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${docsModal.engineer.payment_receipt_path
                  ? 'bg-slate-50 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                  : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-slate-700">Reçu de Paiement</span>
                </div>
                {docsModal.engineer.payment_receipt_path ? <Eye className="w-5 h-5 text-slate-400" /> : <X className="w-5 h-5 text-red-400" />}
              </button>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setDocsModal({ isOpen: false, engineer: null })}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
