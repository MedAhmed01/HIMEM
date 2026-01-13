'use client'

import { useEffect, useState } from 'react'

interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url?: string | null
  display_order: number
}

export function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch('/api/sponsors')
        if (res.ok) {
          const data = await res.json()
          setSponsors(data.sponsors || [])
        }
      } catch (err) {
        console.error('Error fetching sponsors:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSponsors()
  }, [])

  if (!loading && sponsors.length === 0) {
    return null
  }

  const shouldAnimate = sponsors.length >= 3
  const displaySponsors = shouldAnimate 
    ? [...sponsors, ...sponsors, ...sponsors, ...sponsors]
    : sponsors

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-t border-blue-100/50 py-3 overflow-hidden">
      <div className="relative">
        {shouldAnimate && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-pink-50 to-transparent z-10 pointer-events-none"></div>
          </>
        )}
        
        <div className={`flex ${shouldAnimate ? 'animate-marquee-infinite' : 'justify-center'}`}>
          {displaySponsors.map((sponsor, index) => (
            <a
              key={`${sponsor.id}-${index}`}
              href={sponsor.website_url || undefined}
              target={sponsor.website_url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex-shrink-0 mx-6 group"
              onClick={(e) => !sponsor.website_url && e.preventDefault()}
            >
              <div className="h-14 w-36 rounded-xl bg-white/80 backdrop-blur-sm border border-blue-100 flex items-center justify-center px-4 transition-all duration-300 group-hover:shadow-lg group-hover:border-blue-300 group-hover:scale-105">
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="max-h-10 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-blue-500 text-sm font-medium">{sponsor.name}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
