'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error: any) {
      setSubmitStatus('error')
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={`font-body bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 antialiased scroll-smooth ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="relative bg-gradient-to-br from-[#0F766E] to-teal-900 pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 hero-pattern"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 -left-20 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center flex-shrink-0 group cursor-pointer">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-white mr-3 transition-transform group-hover:scale-105">
                  <span className="material-symbols-outlined text-[20px]">engineering</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-white leading-none tracking-tight">OMIGEC</span>
                  <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mt-0.5">Ordre Mauritanien</span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center space-x-1">
                <nav className="flex items-center space-x-1 mr-6">
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/">Accueil</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/articles">Articles</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/services">Services</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/10" href="/offres-emploi">Emplois</Link>
                  <Link className="px-3 py-2 text-sm font-medium text-white hover:text-white transition-colors rounded-md bg-white/20" href="/contact">Contact</Link>
                </nav>
                <div className="h-6 w-px bg-white/20 mx-2"></div>
                <div className="flex items-center space-x-3 ml-4">
                  <Link className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-3 py-2" href="/connexion">Connexion</Link>
                  <Link className="group relative flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#0F766E] transition-all duration-200 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-sm hover:shadow-md" href="/inscription">
                    <span className="material-symbols-outlined text-lg mr-1.5 group-hover:animate-pulse">person_add</span>
                    Inscription
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Contactez-nous</h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-teal-50 leading-relaxed font-light">
            Notre équipe est à votre disposition pour répondre à toutes vos questions techniques et administratives.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative -mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Email Card */}
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-2xl">mail</span>
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Pour toute demande générale</p>
                  <a className="text-[#0F766E] hover:text-[#0D9488] font-medium transition-colors" href="mailto:contact@omigec.mr">
                    contact@omigec.mr
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-2xl">call</span>
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Téléphone</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Lun-Ven de 8h à 17h</p>
                  <div className="flex flex-col">
                    <a className="text-[#0F766E] hover:text-[#0D9488] font-medium transition-colors" href="tel:+22234235365">
                      +222 34 23 53 65
                    </a>
                    <a className="text-[#0F766E] hover:text-[#0D9488] font-medium transition-colors" href="tel:+22246992720">
                      +222 46 99 27 20
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-2xl">location_on</span>
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Adresse</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    ZRB N°0170 (Zone carrefour Bana Blanc)<br />
                    Nouakchott, Mauritanie
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-2xl">schedule</span>
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Horaires</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Lundi - Vendredi: 08h00 - 17h00<br />
                    Samedi - Dimanche: Fermé
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Suivez-nous</h3>
              <div className="flex space-x-4">
                <a className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#0F766E] hover:text-white dark:hover:bg-[#0F766E] dark:hover:text-white transition-all duration-300" href="#">
                  <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
                  </svg>
                </a>
                <a className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#0F766E] hover:text-white dark:hover:bg-[#0F766E] dark:hover:text-white transition-all duration-300" href="#">
                  <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path>
                  </svg>
                </a>
                <a className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#0F766E] hover:text-white dark:hover:bg-[#0F766E] dark:hover:text-white transition-all duration-300" href="#">
                  <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 h-full flex flex-col">
              <div className="p-8 md:p-10 flex-1">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Envoyez-nous un message</h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Message envoyé avec succès !</p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Nous vous répondrons dans les plus brefs délais à l'adresse email fournie.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">error</span>
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">Erreur lors de l'envoi</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="block w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0F766E] focus:ring-[#0F766E] sm:text-sm transition-shadow duration-200"
                        id="name"
                        name="name"
                        placeholder="Votre nom"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="block w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0F766E] focus:ring-[#0F766E] sm:text-sm transition-shadow duration-200"
                        id="email"
                        name="email"
                        placeholder="votre.email@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="phone">
                        Téléphone
                      </label>
                      <input
                        className="block w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0F766E] focus:ring-[#0F766E] sm:text-sm transition-shadow duration-200"
                        id="phone"
                        name="phone"
                        placeholder="+222 XX XX XX XX"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="subject">
                        Sujet
                      </label>
                      <input
                        className="block w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0F766E] focus:ring-[#0F766E] sm:text-sm transition-shadow duration-200"
                        id="subject"
                        name="subject"
                        placeholder="Objet de votre message"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="block w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0F766E] focus:ring-[#0F766E] sm:text-sm transition-shadow duration-200 resize-none"
                      id="message"
                      name="message"
                      placeholder="Votre message..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-full shadow-glow text-base font-semibold text-white bg-[#0F766E] hover:bg-[#0D9488] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined mr-2 text-xl">send</span>
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Gradient Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#0F766E] via-teal-400 to-emerald-500"></div>

      {/* Dark Mode Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          <span className={`material-symbols-outlined ${isDarkMode ? 'hidden' : 'block'}`}>dark_mode</span>
          <span className={`material-symbols-outlined ${isDarkMode ? 'block' : 'hidden'}`}>light_mode</span>
        </button>
      </div>
    </div>
  )
}
