import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { PublicSearchBar } from '@/components/search/PublicSearchBar'
import { LatestArticles } from '@/components/layout/LatestArticles'
import { CheckCircle, Users, FileText, Briefcase, ArrowRight, Shield, Sparkles, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Search Section - Right after sponsors */}
        <section className="py-3 sm:py-5 md:py-6 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-[#139a9d] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                      Vérifier un Ingénieur
                    </h2>
                    <p className="text-gray-600 text-xs mt-0.5">
                      Recherchez par NNI ou nom
                    </p>
                  </div>
                </div>
                <PublicSearchBar />
              </div>
            </div>
          </div>
        </section>

        {/* Latest Articles Section */}
        <LatestArticles />

        {/* Hero Section */}
        <section className="py-10 sm:py-14 md:py-16 lg:py-20">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center px-2">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#139a9d]/10 border border-[#139a9d]/30 mb-5 sm:mb-6 md:mb-8">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#139a9d]" />
                <span className="text-xs sm:text-sm font-semibold text-[#139a9d]">Plateforme Officielle</span>
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight text-gray-900 px-2">
                L'Ordre Mauritanien des{' '}
                <span className="text-[#139a9d]">Ingénieurs en Génie Civil</span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                La plateforme digitale officielle pour la gestion, la vérification et l'accompagnement des ingénieurs en génie civil en Mauritanie.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                <Link href="/inscription" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-11 sm:h-12 md:h-13 px-5 sm:px-6 md:px-8 text-sm sm:text-base rounded-lg sm:rounded-xl bg-[#139a9d] hover:bg-[#0f7a7d] text-white font-semibold shadow-md hover:shadow-lg transition-all">
                    <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 mr-2" />
                    Rejoindre l'OMIGEC
                  </Button>
                </Link>
                <Link href="/connexion" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-12 md:h-13 px-5 sm:px-6 md:px-8 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold">
                    Se connecter
                    <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#139a9d]/10 border border-[#139a9d]/30 mb-3 sm:mb-4">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#139a9d]" />
                <span className="text-xs sm:text-sm font-medium text-[#139a9d]">Nos Services</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                Une plateforme complète
              </h2>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour gérer votre carrière d'ingénieur
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto">
              {[
                { icon: CheckCircle, title: 'Inscription', desc: 'Inscrivez-vous en ligne et soumettez vos documents facilement', color: 'bg-[#139a9d]' },
                { icon: Users, title: 'Validation', desc: 'Système de parrainage par des ingénieurs agréés', color: 'bg-purple-600' },
                { icon: FileText, title: 'Vérification', desc: 'Vérifiez le statut d\'un ingénieur en temps réel', color: 'bg-orange-500' },
                { icon: Briefcase, title: 'Emplois', desc: 'Accédez aux offres d\'emploi réservées aux membres', color: 'bg-green-600' },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-lg sm:rounded-xl ${item.color} flex items-center justify-center mb-3 sm:mb-4`}>
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gradient-to-br from-[#139a9d] to-[#0f7a7d]">
          <div className="container mx-auto text-center px-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 md:mb-6 px-2">
              Prêt à rejoindre l'OMIGEC ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2 leading-relaxed">
              Inscrivez-vous dès maintenant et faites partie de l'ordre professionnel des ingénieurs en génie civil
            </p>
            <Link href="/inscription">
              <Button className="h-11 sm:h-12 md:h-13 px-6 sm:px-8 md:px-10 text-sm sm:text-base rounded-lg sm:rounded-xl bg-white text-[#139a9d] hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transition-all">
                Commencer l'inscription
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}