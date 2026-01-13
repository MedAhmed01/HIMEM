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
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <div className="text-2xl font-bold text-white">OMIGEC</div>
            </Link>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Ordre Mauritanien des Ingénieurs en Génie Civil - La plateforme digitale pour la gestion des ingénieurs.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              Liens Rapides
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/recherche" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Rechercher un Ingénieur
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              Services
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Vérification d'ingénieurs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Offres d'emploi
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Parrainage
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-pink-400 transition-colors"></span>
                  Cotisations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <a href="mailto:contact@omigec.mr" className="hover:text-cyan-400 transition-colors">contact@omigec.mr</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Téléphone</p>
                  <a href="tel:+22200000000" className="hover:text-pink-400 transition-colors">+222 XX XX XX XX</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Adresse</p>
                  <span>Nouakchott, Mauritanie</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm flex items-center gap-1">
              © {new Date().getFullYear()} OMIGEC. Fait avec <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> en Mauritanie
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-cyan-400 transition-colors">Politique de confidentialité</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">Conditions d'utilisation</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
