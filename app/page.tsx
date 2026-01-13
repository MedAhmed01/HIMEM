import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PublicSearchBar } from '@/components/search/PublicSearchBar'
import { LatestArticles } from '@/components/layout/LatestArticles'
import { CheckCircle, Users, FileText, Briefcase, ArrowRight, Shield, Sparkles, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Search Section - Right after sponsors */}
        <section className="py-8 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      Vérifier un Ingénieur
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Recherchez par NNI ou nom pour vérifier le statut d'agrément
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
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-8">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Plateforme Officielle</span>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
                L'Ordre Mauritanien des{' '}
                <span className="text-blue-600">Ingénieurs en Génie Civil</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                La plateforme digitale officielle pour la gestion, la vérification et l'accompagnement des ingénieurs en génie civil en Mauritanie.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/inscription">
                  <Button className="h-14 px-8 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Rejoindre l'OMIGEC
                  </Button>
                </Link>
                <Link href="/connexion">
                  <Button variant="outline" className="h-14 px-8 text-lg rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold">
                    Se connecter
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Nos Services</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Une plateforme complète
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour gérer votre carrière d'ingénieur
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { icon: CheckCircle, title: 'Inscription', desc: 'Inscrivez-vous en ligne et soumettez vos documents facilement', color: 'bg-blue-600' },
                { icon: Users, title: 'Validation', desc: 'Système de parrainage par des ingénieurs agréés', color: 'bg-purple-600' },
                { icon: FileText, title: 'Vérification', desc: 'Vérifiez le statut d\'un ingénieur en temps réel', color: 'bg-orange-500' },
                { icon: Briefcase, title: 'Emplois', desc: 'Accédez aux offres d\'emploi réservées aux membres', color: 'bg-green-600' },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-5`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à rejoindre l'OMIGEC ?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Inscrivez-vous dès maintenant et faites partie de l'ordre professionnel des ingénieurs en génie civil
            </p>
            <Link href="/inscription">
              <Button className="h-14 px-10 text-lg rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                Commencer l'inscription
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}