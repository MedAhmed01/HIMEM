'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { formatMatricule } from '@/lib/matricule'

export interface EngineerCardData {
  id: string
  nni: string
  matricule?: string | null
  full_name: string
  full_name_ar?: string | null
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
    <svg className="id-card-artwork id-card-front-artwork" viewBox="0 0 336 192" preserveAspectRatio="none" aria-hidden="true">
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
    <svg className="id-card-artwork id-card-back-artwork" viewBox="0 0 243 192" preserveAspectRatio="none" aria-hidden="true">
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

function GreenLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- The vector source logo must remain printable.
    <img className="id-card-logo" src="/Logo-teal.svg" alt="OMIGEC" />
  )
}

// Shrinks a single-line field until it fits its box. The inline font size is
// kept by the print/export clone.
function fitText(element: HTMLElement | null, maximumFontSize: number, minimumFontSize = 4) {
  if (!element) return
  element.style.fontSize = `${maximumFontSize}px`
  let size = maximumFontSize
  while (element.scrollWidth > element.clientWidth && size > minimumFontSize) {
    size = Math.max(minimumFontSize, size - 0.2)
    element.style.fontSize = `${size}px`
  }
}

export default function EngineerIdCard({ engineer, className = '' }: EngineerIdCardProps) {
  const [qrCode, setQrCode] = useState('')
  const nameFrRef = useRef<HTMLDivElement>(null)
  const nameArRef = useRef<HTMLDivElement>(null)
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
      color: { dark: '#14919b', light: '#ffffff' },
    })
      .then((value) => active && setQrCode(value))
      .catch((error) => console.error('Unable to generate engineer QR code:', error))

    return () => {
      active = false
    }
  }, [verificationUrl])

  useLayoutEffect(() => {
    fitText(nameFrRef.current, 7.5)
    fitText(nameArRef.current, 8)
  }, [engineer.full_name, engineer.full_name_ar])

  const matricule = formatMatricule(engineer.matricule)
  const pairClass = `engineer-id-card-pair ${className}`.trim()

  return (
    <article className={pairClass}>
      <section className="engineer-id-card engineer-id-card-front" aria-label="Carte recto">
        <FrontArtwork />

        <div className="id-card-brand">
          <div className="id-card-front-logo">
            <GreenLogo />
          </div>
        </div>

        <div className="id-card-band">
          <span lang="fr">Ingénieur</span>
          <span lang="ar" dir="rtl">مهندس</span>
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

        <div className="id-card-rows">
          <div className="id-card-row">
            <div lang="fr"><b>CARTE PROFESSIONNELLE N°:</b> {matricule}</div>
            <div lang="ar" dir="rtl"><b>بطاقة مهنية رقم:</b> {matricule}</div>
          </div>
          <div className="id-card-row">
            <div ref={nameFrRef} lang="fr" title={engineer.full_name}><b>Nom complet :</b> {engineer.full_name}</div>
            <div ref={nameArRef} lang="ar" dir="rtl" title={engineer.full_name_ar || ''}><b>الاسم الكامل:</b> {engineer.full_name_ar || '—'}</div>
          </div>
          <div className="id-card-row">
            <div lang="fr"><b>NNI :</b> {engineer.nni || '—'}</div>
            <div lang="ar" dir="rtl"><b>ر.و.ت:</b> <bdi>{engineer.nni || '—'}</bdi></div>
          </div>
          <div className="id-card-row">
            <div lang="fr"><b>Téléphone :</b> {engineer.phone || '—'}</div>
            <div lang="ar" dir="rtl"><b>الهاتف:</b> <bdi>{engineer.phone || '—'}</bdi></div>
          </div>
        </div>

        <div className="id-card-footer-bars" aria-hidden="true" />
      </section>

      <section className="engineer-id-card engineer-id-card-back" aria-label="Carte verso">
        <BackArtwork />
        <div className="id-card-back-panel" aria-hidden="true" />

        <div className="id-card-back-copy">
          <div lang="fr">
            <h2>Note</h2>
            <p>Cette carte est personnelle et atteste de l&apos;inscription de son titulaire auprès de l&apos;OMIGEC.</p>
            <p>Toute personne trouvant cette carte est priée de la remettre à l&apos;Ordre Mauritanien des Ingénieurs en Génie Civil.</p>
          </div>
          <div lang="ar" dir="rtl" className="id-card-back-copy-ar">
            <h2>ملاحظة</h2>
            <p>هذه البطاقة شخصية وتثبت تسجيل حاملها لدى الهيئة.</p>
            <p>يُرجى ممن يعثر على هذه البطاقة تسليمها إلى الهيئة الموريتانية للمهندسين المدنيين.</p>
          </div>
        </div>

        <div className="id-card-back-footer">
          <strong>OMIGEC</strong>
          <span>Nouakchott, Mauritanie — <span lang="ar" dir="rtl">نواكشوط، موريتانيا</span></span>
        </div>

        <div className="id-card-back-logo">
          <GreenLogo />
        </div>

        <div className="id-card-qr-wrap">
          {qrCode ? (
            // eslint-disable-next-line @next/next/no-img-element -- QR codes are generated as data URLs.
            <img src={qrCode} alt={`QR de vérification de ${engineer.full_name}`} />
          ) : (
            <div className="id-card-qr-placeholder" />
          )}
        </div>
        <p className="id-card-qr-label">
          SCANNER POUR VÉRIFIER
          <span lang="ar" dir="rtl">امسح للتحقق</span>
        </p>
      </section>
    </article>
  )
}
