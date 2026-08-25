'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { formatMatricule } from '@/lib/matricule'

export interface EngineerCardData {
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
  domain?: string[]
  created_at: string
}

interface EngineerIdCardProps {
  engineer: EngineerCardData
  className?: string
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function FrontArtwork() {
  return (
    <svg className="id-card-artwork id-card-front-artwork" viewBox="0 0 336 192" aria-hidden="true">
      <g fill="#f4f8f9">
        <path d="M0 183 31 164v-34l16 9v34l16 10v-34l16 9v34l17 10H63L47 183l-16 9H0Z" />
        <path d="m104 87 32-19 31 18-16 9-15-9-16 9 16 9v36l-16 9v-36l-32-18 16-8Z" />
        <path d="m176 87 32-19 32 19-16 9-16-9-16 9v36l-16 9V87Z" />
        <path d="m176 132 16-9v27l32 19v23h-16v-14l-32-19-32 19v14h-32v-9l48-28v-27l16 9v-5Z" />
        <path d="m240 96 16 9v54l16 9v-54l16 9v36l16 9v-36l32 19v18l-16-9v18l16 9v5h-16l-32-19v18h-16v-5l-32-18V96Z" />
      </g>
    </svg>
  )
}

function BackArtwork() {
  return (
    <svg className="id-card-artwork id-card-back-artwork" viewBox="0 0 243 192" aria-hidden="true">
      <g fill="rgba(255,255,255,.075)">
        <path d="m192 0 51 30v27l-51-30-42 25-24-14 66-38Z" />
        <path d="m109 48 42 25-24 14-18-11v34l-24 14V62l24-14Z" />
        <path d="m192 48 51 30v28l-51-30-42 25-24-14 66-39Z" />
        <path d="m64 111 43 25-24 14-19-11-42 25v28H0v-41l64-40Z" />
        <path d="m149 101 43 25-24 14-19-11-42 25 42 25 43-25 24 14-67 40-66-40 66-39v-28Z" />
        <path d="m243 133-51 30-24-14 75-44v28Z" />
      </g>
      <g fill="rgba(0,45,52,.08)">
        <path d="m109 76 18 11-18 11V76Z" />
        <path d="m149 129 19 11-19 11-19-11 19-11Z" />
        <path d="m192 76 51 30v27l-51-30-24 14-18-11 42-30Z" />
      </g>
    </svg>
  )
}

function BrandLogo({ tone }: { tone: 'light' | 'teal' }) {
  if (tone === 'teal') {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- The vector source logo must remain printable.
      <img className="id-card-logo id-card-logo-teal" src="/Logo-teal.svg" alt="OMIGEC" />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- The vector source logo must remain printable.
    <img className="id-card-logo id-card-logo-light" src="/Logo.svg" alt="OMIGEC" />
  )
}

export default function EngineerIdCard({ engineer, className = '' }: EngineerIdCardProps) {
  const [qrCode, setQrCode] = useState('')
  const engineerNameRef = useRef<HTMLHeadingElement>(null)
  const verificationUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/recherche?nni=${encodeURIComponent(engineer.nni)}`
    return `${window.location.origin}/recherche?nni=${encodeURIComponent(engineer.nni)}`
  }, [engineer.nni])

  useEffect(() => {
    let active = true
    QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#14727a', light: '#ffffff' },
    })
      .then((value) => active && setQrCode(value))
      .catch((error) => console.error('Unable to generate engineer QR code:', error))

    return () => {
      active = false
    }
  }, [verificationUrl])

  useLayoutEffect(() => {
    const nameElement = engineerNameRef.current
    if (!nameElement) return

    const maximumFontSize = 15
    const minimumFontSize = 5
    const availableWidth = nameElement.clientWidth

    // Measure from the approved design size, then reduce only as much as the
    // current name needs. The inline result is retained by the print clone.
    nameElement.style.fontSize = `${maximumFontSize}px`

    if (nameElement.scrollWidth <= availableWidth) return

    const proportionalSize = maximumFontSize * (availableWidth / nameElement.scrollWidth)
    let fittedSize = Math.min(maximumFontSize, Math.max(minimumFontSize, proportionalSize * 0.98))
    nameElement.style.fontSize = `${fittedSize}px`

    // Account for fractional-pixel rounding so no final character is clipped.
    while (nameElement.scrollWidth > availableWidth && fittedSize > minimumFontSize) {
      fittedSize = Math.max(minimumFontSize, fittedSize - 0.1)
      nameElement.style.fontSize = `${fittedSize}px`
    }
  }, [engineer.full_name])

  const matricule = formatMatricule(engineer.matricule)
  const pairClass = `engineer-id-card-pair ${className}`.trim()

  return (
    <article className={pairClass}>
      <section className="engineer-id-card engineer-id-card-front" aria-label="Carte recto">
        <div className="id-card-front-header" aria-hidden="true" />
        <FrontArtwork />

        <div className="id-card-header-content">
          <div className="id-card-front-logo">
            <BrandLogo tone="light" />
          </div>

          <div className="id-card-organization-name">
            <p className="id-card-organization-name-ar" lang="ar" dir="rtl">
              الهيئة الموريتانية للمهندسين المدنيين
            </p>
            <p className="id-card-organization-name-fr" lang="fr">
              Ordre Mauritanien des Ingénieurs Génie Civil
            </p>
          </div>

          <div className="id-card-card-title">
            <strong>CARTE</strong>
            <span>PROFESSIONNELLE</span>
          </div>
        </div>

        <div className="id-card-portrait-frame">
          {engineer.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- Remote profile photos must remain printable.
            <img className="id-card-portrait" src={engineer.profile_image_url} alt={`Portrait de ${engineer.full_name}`} />
          ) : (
            <div className="id-card-portrait id-card-portrait-fallback" aria-label={`Initiales de ${engineer.full_name}`}>
              {getInitials(engineer.full_name)}
            </div>
          )}
        </div>

        <div className="id-card-engineer-identity">
          <span className="id-card-engineer-label" lang="fr">INGÉNIEUR</span>
          <h2 ref={engineerNameRef} className="id-card-engineer-name" title={engineer.full_name}>
            {engineer.full_name}
          </h2>
        </div>

        <dl className="id-card-front-details">
          <div>
            <dt>Matricule :</dt>
            <dd>{matricule}</dd>
          </div>
          <div>
            <dt>N° NNI:</dt>
            <dd>{engineer.nni || '—'}</dd>
          </div>
          <div>
            <dt>Promotion:</dt>
            <dd>{engineer.grad_year || '—'}</dd>
          </div>
          <div>
            <dt>Téléphone:</dt>
            <dd>{engineer.phone || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="engineer-id-card engineer-id-card-back" aria-label="Carte verso">
        <BackArtwork />
        <div className="id-card-back-panel" aria-hidden="true" />

        <div className="id-card-back-copy">
          <h2>Note</h2>
          <p>Cette carte est personnelle et atteste de l&apos;inscription de son titulaire auprès de l&apos;OMIGEC.</p>
          <p>Toute personne trouvant cette carte est priée de la remettre à l&apos;Ordre Mauritanien des Ingénieurs en Génie Civil.</p>
        </div>

        <div className="id-card-back-footer">
          <strong>OMIGEC</strong>
          <span>Nouakchott, Mauritanie</span>
        </div>

        <div className="id-card-back-logo">
          <BrandLogo tone="teal" />
        </div>

        <div className="id-card-qr-wrap">
          {qrCode ? (
            // eslint-disable-next-line @next/next/no-img-element -- QR codes are generated as data URLs.
            <img src={qrCode} alt={`QR de vérification de ${engineer.full_name}`} />
          ) : (
            <div className="id-card-qr-placeholder" />
          )}
        </div>
        <p className="id-card-qr-label">SCANNER POUR VÉRIFIER</p>
      </section>
    </article>
  )
}
