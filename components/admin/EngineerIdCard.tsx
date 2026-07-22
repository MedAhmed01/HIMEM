'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import QRCode from 'qrcode'

export interface EngineerCardData {
  id: string
  nni: string
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

const DOMAIN_LABELS: Record<string, string> = {
  batiment_constructions: 'Bâtiment & constructions',
  genie_civil: 'Génie civil',
  electricite: 'Électricité',
  mecanique: 'Mécanique',
  informatique: 'Informatique',
  telecommunications: 'Télécommunications',
  energie: 'Énergie',
  environnement: 'Environnement',
  mines: 'Mines',
  petrole_gaz: 'Pétrole & gaz',
}

function formatCardDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
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

function CardShell({ side, children }: { side: 'front' | 'back'; children: React.ReactNode }) {
  const shapeId = useId().replaceAll(':', '')
  const bottomGradientId = `id-card-bottom-gradient-${shapeId}`
  const topBarGradientId = `id-card-top-bar-gradient-${shapeId}`
  const topLeftGradientId = `id-card-top-left-gradient-${shapeId}`
  const topRightGradientId = `id-card-top-right-gradient-${shapeId}`

  return (
    <section className={`engineer-id-card engineer-id-card-${side}`} aria-label={`Carte ${side === 'front' ? 'recto' : 'verso'}`}>
      <svg className="id-card-top-shape" width="204" height="45" viewBox="0 0 204 45" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {side === 'back' && <rect x="19" width="164" height="15" fill={`url(#${topBarGradientId})`} />}
        <path d="M50 2.8072e-05H0V16.2715C3.12031e-06 28.569 8.31959e-06 42.4226 5.28213e-06 44.6812C0.0127281 39.56 23.0075 5.99834 50 2.8072e-05Z" fill={`url(#${topLeftGradientId})`} />
        <path d="M204 45V0L185.921 0L154.349 0C160.024 -9.70645e-06 197.333 20.7 204 45Z" fill={`url(#${topRightGradientId})`} />
        <defs>
          <linearGradient id={topBarGradientId} x1="183" y1="7" x2="21.8137" y2="7" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F766E" />
            <stop offset="1" stopColor="#2DD4BF" />
          </linearGradient>
          <linearGradient id={topLeftGradientId} x1="-1.5" y1="45" x2="53.8867" y2="10.107" gradientUnits="userSpaceOnUse">
            <stop offset="0.378592" stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#0F766E" />
          </linearGradient>
          <linearGradient id={topRightGradientId} x1="154" y1="-1.35" x2="182.192" y2="53.8961" gradientUnits="userSpaceOnUse">
            <stop offset="0.378592" stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#0F766E" />
          </linearGradient>
        </defs>
      </svg>
      {children}
      <svg className="id-card-bottom-curve" width="204" height="67" viewBox="0 0 204 67" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M70.9565 29.1304C26.8225 14.7641 0 67 0 67H204V0C154.33 59.4261 128.925 48 70.9565 29.1304Z" fill={`url(#${bottomGradientId})`} />
        <defs>
          <linearGradient id={bottomGradientId} x1="-6" y1="67" x2="204" y2="67" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#0F766E" />
          </linearGradient>
        </defs>
      </svg>
    </section>
  )
}

export default function EngineerIdCard({ engineer, className = '' }: EngineerIdCardProps) {
  const [qrCode, setQrCode] = useState('')
  const verificationUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/recherche?nni=${encodeURIComponent(engineer.nni)}`
    return `${window.location.origin}/recherche?nni=${encodeURIComponent(engineer.nni)}`
  }, [engineer.nni])

  useEffect(() => {
    let active = true
    QRCode.toDataURL(verificationUrl, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((value) => active && setQrCode(value))
      .catch((error) => console.error('Unable to generate engineer QR code:', error))
    return () => {
      active = false
    }
  }, [verificationUrl])

  const domain = engineer.domain?.[0]
  const designation = domain ? DOMAIN_LABELS[domain] || domain.replaceAll('_', ' ') : 'Ingénieur en génie civil'

  return (
    <article className={`engineer-id-card-pair ${className}`.trim()}>
      <CardShell side="front">
        <div className="id-card-brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- Reuses the official transparent site logo. */}
          <img className="id-card-logo" src="/Logo.png" alt="OMIGEC" />
        </div>

        <div className="id-card-portrait-wrap">
          {engineer.profile_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element -- Remote profile photos must remain printable. */
            <img className="id-card-portrait" src={engineer.profile_image_url} alt={`Portrait de ${engineer.full_name}`} />
          ) : (
            <div className="id-card-portrait id-card-portrait-fallback" aria-label={`Initiales de ${engineer.full_name}`}>
              {getInitials(engineer.full_name)}
            </div>
          )}
        </div>

        <div className="id-card-identity">
          <h2>{engineer.full_name}</h2>
          <p>{designation}</p>
        </div>

        <dl className="id-card-details">
          <div><dt>N° NNI</dt><dd>{engineer.nni}</dd></div>
          <div><dt>Diplôme</dt><dd>{engineer.diploma || '—'}</dd></div>
          <div><dt>Promotion</dt><dd>{engineer.grad_year || '—'}</dd></div>
          <div><dt>Téléphone</dt><dd>{engineer.phone || '—'}</dd></div>
          <div><dt>E-mail</dt><dd>{engineer.email || '—'}</dd></div>
        </dl>

        <div className="id-card-front-footer">CARTE PROFESSIONNELLE</div>
      </CardShell>

      <CardShell side="back">
        <div className="id-card-back-copy">
          <p><span />Cette carte est personnelle et atteste de l&apos;inscription de son titulaire auprès de l&apos;OMIGEC.</p>
          <p><span />Toute personne trouvant cette carte est priée de la remettre à l&apos;Ordre Mauritanien des Ingénieurs en Génie Civil.</p>
        </div>

        <div className="id-card-qr-wrap">
          {qrCode ? (
            /* eslint-disable-next-line @next/next/no-img-element -- QR codes are generated as data URLs. */
            <img src={qrCode} alt={`QR de vérification de ${engineer.full_name}`} />
          ) : <div className="id-card-qr-placeholder" />}
        </div>
        <p className="id-card-qr-label">Scanner pour vérifier</p>

        <dl className="id-card-validity">
          <div><dt>Date d&apos;adhésion</dt><dd>{formatCardDate(engineer.created_at)}</dd></div>
          <div><dt>Date d&apos;expiration</dt><dd>{formatCardDate(engineer.subscription_expiry)}</dd></div>
        </dl>

        <div className="id-card-signature">
          <span />
          <strong>Signature autorisée</strong>
        </div>

        <div className="id-card-back-footer">
          <strong>OMIGEC</strong>
          <span>Nouakchott, Mauritanie</span>
        </div>
      </CardShell>
    </article>
  )
}
