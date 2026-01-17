import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Heart, Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto py-10 sm:py-12 md:py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2.5 mb-4 sm:mb-5 group">
              <img 
                src="/logo.png" 
                alt="OMIGEC Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain group-hover:scale-105 transition-transform"
              />
              <div className="text-xl sm:text-2xl font-bold text-white">OMIGEC</div>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
              Ordre Mauritanien des Ingénieurs en Génie Civil - La plateforme digitale pour la gestion des ingénieurs.
            </p>
            <div className="flex space-x-2 sm:space-x-2.5">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-[#139a9d] hover:to-[#0f7a7d] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-[#139a9d] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-[#139a9d] hover:to-[#0f7a7d] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-[#139a9d] to-cyan-500"></div>
              Liens Rapides
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              <li>
                <Link href="/" className="text-slate-400 text-xs sm:text-sm hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/recherche" className="text-slate-400 text-xs sm:text-sm hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Rechercher un Ingénieur
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-slate-400 text-xs sm:text-sm hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-slate-400 text-xs sm:text-sm hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              Services
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              <li>
                <Link href="#" className="text-slate-400 text-xs sm:text-sm hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Vérification d'ingénieurs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 text-xs sm:text-sm hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Offres d'emploi
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 text-xs sm:text-sm hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Parrainage
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 text-xs sm:text-sm hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Cotisations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              Contact
            </h3>
            <ul className="space-y-3 sm:space-y-3.5">
              <li className="flex items-start gap-2.5 text-slate-400">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#139a9d]/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a href="mailto:contact@omigec.mr" className="text-xs sm:text-sm hover:text-cyan-400 transition-colors">contact@omigec.mr</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Téléphone</p>
                  <a href="tel:+22200000000" className="text-xs sm:text-sm hover:text-pink-400 transition-colors">+222 XX XX XX XX</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Adresse</p>
                  <span className="text-xs sm:text-sm">Nouakchott, Mauritanie</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-7 md:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1 text-center md:text-left">
              © {new Date().getFullYear()} OMIGEC. Fait avec <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 fill-pink-500" /> en Mauritanie
            </p>
            <div className="flex items-center gap-4 sm:gap-5 md:gap-6 text-xs sm:text-sm text-slate-500">
              <Link href="#" className="hover:text-cyan-400 transition-colors">Politique de confidentialité</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">Conditions d'utilisation</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
