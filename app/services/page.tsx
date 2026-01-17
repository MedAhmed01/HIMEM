import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { 
  Users, Building2, FileText, Search, 
  CheckCircle, ArrowRight, Briefcase 
} from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: Search,
      title: 'Recherche d\'Ingénieurs',
      description: 'Accédez à notre base de données d\'ingénieurs qualifiés et vérifiés.',
      link: '/recherche',
      color: 'from-[#139a9d] to-[#0f7a7d]'
    },
    {
      icon: Briefcase,
      title: 'Offres d\'Emploi',
      description: 'Consultez les opportunités d\'emploi pour ingénieurs en Mauritanie.',
      link: '/emplois',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Building2,
      title: 'Espace Entreprise',
      description: 'Publiez vos offres et recrutez les meilleurs talents.',
      link: '/entreprise/tableau-de-bord',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Réseau Professionnel',
      description: 'Rejoignez la communauté des ingénieurs mauritaniens.',
      link: '/inscription',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: FileText,
      title: 'Vérification de Diplômes',
      description: 'Service de vérification et validation des diplômes d\'ingénieurs.',
      link: '/inscription',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: CheckCircle,
      title: 'Certification Professionnelle',
      description: 'Obtenez votre certification OMIGEC reconnue nationalement.',
      link: '/inscription',
      color: 'from-teal-500 to-teal-600'
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#139a9d] to-[#0f7a7d] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nos Services
            </h1>
            <p className="text-xl text-white/80">
              L'OMIGEC offre une gamme complète de services pour les ingénieurs 
              et les entreprises en Mauritanie
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <Link href={service.link}>
                    <Button variant="outline" className="w-full group">
                      En savoir plus
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#139a9d]/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez l'OMIGEC aujourd'hui et accédez à tous nos services
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/inscription">
              <Button size="lg" className="bg-[#139a9d] hover:bg-[#0f7a7d]">
                S'inscrire
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
