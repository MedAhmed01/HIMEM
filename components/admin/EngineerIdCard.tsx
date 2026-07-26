'use client'

import { useEffect, useId, useMemo, useState } from 'react'
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

export type CardOrientation = 'vertical' | 'horizontal'

interface EngineerIdCardProps {
  engineer: EngineerCardData
  orientation?: CardOrientation
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

function CardShell({
  side,
  orientation,
  children,
}: {
  side: 'front' | 'back'
  orientation: CardOrientation
  children: React.ReactNode
}) {
  const shapeId = useId().replaceAll(':', '')
  const bottomGradientId = `id-card-bottom-gradient-${shapeId}`
  const topBarGradientId = `id-card-top-bar-gradient-${shapeId}`
  const topLeftGradientId = `id-card-top-left-gradient-${shapeId}`
  const topRightGradientId = `id-card-top-right-gradient-${shapeId}`

  const orientationClass = orientation === 'horizontal' ? ' engineer-id-card-h' : ''

  return (
    <section
      className={`engineer-id-card engineer-id-card-${side}${orientationClass}`}
      aria-label={`Carte ${side === 'front' ? 'recto' : 'verso'}`}
    >
      <svg className="id-card-top-shape" width="204" height="45" viewBox="0 0 204 45" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
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
      <svg className="id-card-bottom-curve" width="204" height="67" viewBox="0 0 204 67" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
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

export default function EngineerIdCard({ engineer, orientation = 'vertical', className = '' }: EngineerIdCardProps) {
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

  const matricule = formatMatricule(engineer.matricule)

  // Shared design pieces reused by both orientations so the look stays identical.
  const brand = (
    <div className="id-card-brand">
      {/* eslint-disable-next-line @next/next/no-img-element -- Reuses the official transparent site logo. */}
      <img className="id-card-logo" src="/Logo.png" alt="OMIGEC" />
    </div>
  )

  const portrait = (
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
  )

  const identity = (
    <div className="id-card-identity">
      <h2>{engineer.full_name}</h2>
    </div>
  )

  const details = (
    <dl className="id-card-details">
      <div><dt>Matricule</dt><dd>{matricule}</dd></div>
      <div><dt>N° NNI</dt><dd>{engineer.nni || '—'}</dd></div>
      <div><dt>Promotion</dt><dd>{engineer.grad_year || '—'}</dd></div>
      <div><dt>Téléphone</dt><dd>{engineer.phone || '—'}</dd></div>
    </dl>
  )

  const backCopy = (
    <div className="id-card-back-copy">
      <p><span />Cette carte est personnelle et atteste de l&apos;inscription de son titulaire auprès de l&apos;OMIGEC.</p>
      <p><span />Toute personne trouvant cette carte est priée de la remettre à l&apos;Ordre Mauritanien des Ingénieurs en Génie Civil.</p>
    </div>
  )

  const qr = (
    <>
      <div className="id-card-qr-wrap">
        {qrCode ? (
          /* eslint-disable-next-line @next/next/no-img-element -- QR codes are generated as data URLs. */
          <img src={qrCode} alt={`QR de vérification de ${engineer.full_name}`} />
        ) : <div className="id-card-qr-placeholder" />}
      </div>
      <p className="id-card-qr-label">Scanner pour vérifier</p>
    </>
  )

  const backFooter = (
    <div className="id-card-back-footer">
      <strong>OMIGEC</strong>
      <span>Nouakchott, Mauritanie</span>
    </div>
  )

  const pairClass = `engineer-id-card-pair ${orientation === 'horizontal' ? 'engineer-id-card-pair-h' : ''} ${className}`.trim()

  if (orientation === 'horizontal') {
    return (
      <article className={pairClass}>
        <CardShell side="front" orientation="horizontal">
          <div className="id-card-h-body">
            <div className="id-card-h-left">
              {brand}
              {portrait}
            </div>
            <div className="id-card-h-right">
              {identity}
              {details}
            </div>
          </div>
          <div className="id-card-front-footer">CARTE PROFESSIONNELLE</div>
        </CardShell>

        <CardShell side="back" orientation="horizontal">
          <div className="id-card-h-body id-card-h-body-back">
            <div className="id-card-h-left">
              {backCopy}
            </div>
            <div className="id-card-h-right">
              {qr}
            </div>
          </div>
          {backFooter}
        </CardShell>
      </article>
    )
  }

  return (
    <article className={pairClass}>
      <CardShell side="front" orientation="vertical">
        {brand}
        {portrait}
        {identity}
        {details}
        <div className="id-card-front-footer">CARTE PROFESSIONNELLE</div>
      </CardShell>

      <CardShell side="back" orientation="vertical">
        {backCopy}
        {qr}
        {backFooter}
      </CardShell>
    </article>
  )
}
