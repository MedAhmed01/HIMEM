import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PublicSearchBar } from '@/components/search/PublicSearchBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Search, Users, CheckCircle, Shield } from 'lucide-react'

export default function RecherchePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#139a9d] to-[#0f7a7d] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/30 border border-blue-400/30 mb-6">
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Recherche d'Ingénieurs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trouvez des Ingénieurs Qualifiés
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Accédez à notre base de données d'ingénieurs vérifiés et certifiés en Mauritanie
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-8">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <PublicSearchBar />
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Base de Données Complète
              </h3>
              <p className="text-gray-600">
                Accédez à des centaines de profils d'ingénieurs qualifiés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Profils Vérifiés
              </h3>
              <p className="text-gray-600">
                Tous les diplômes et qualifications sont vérifiés par l'OMIGEC
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Recherche Sécurisée
              </h3>
              <p className="text-gray-600">
                Vos recherches sont confidentielles et sécurisées
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA for Companies */}
        <Card className="bg-gradient-to-r from-[#139a9d] to-[#0f7a7d] text-white">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Vous êtes une entreprise ?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Créez un compte entreprise pour accéder à des fonctionnalités avancées 
              et publier vos offres d'emploi
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/inscription?type=entreprise">
                <Button size="lg" variant="secondary">
                  Créer un compte entreprise
                </Button>
              </Link>
              <Link href="/connexion?type=entreprise">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Se connecter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Recherchez', desc: 'Utilisez le NNI, nom ou téléphone' },
              { step: '2', title: 'Consultez', desc: 'Voir les profils publics' },
              { step: '3', title: 'Vérifiez', desc: 'Diplômes certifiés OMIGEC' },
              { step: '4', title: 'Contactez', desc: 'Recrutez les meilleurs' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </main>
      
      <Footer />
    </div>
  )
}
