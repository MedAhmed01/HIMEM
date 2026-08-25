export const CARD_WIDTH_MM = 86
export const CARD_HEIGHT_MM = 54

// Four CSS pixels per millimetre keeps PNG and PDF exports at one shared ratio.
const CARD_CSS_PIXELS_PER_MM = 4
const CARD_WIDTH = CARD_WIDTH_MM * CARD_CSS_PIXELS_PER_MM
const CARD_HEIGHT = CARD_HEIGHT_MM * CARD_CSS_PIXELS_PER_MM
export const CARD_EXPORT_SCALE = 4

const imageDataUrlCache = new Map<string, Promise<string>>()
const svgMarkupCache = new Map<string, Promise<string>>()

const exportStyleProperties = [
  'position', 'top', 'right', 'bottom', 'left', 'z-index',
  'display', 'visibility', 'box-sizing', 'width', 'height', 'min-width', 'min-height',
  'max-width', 'max-height', 'overflow', 'overflow-x', 'overflow-y',
  'flex', 'flex-basis', 'flex-direction', 'flex-grow', 'flex-shrink', 'flex-wrap',
  'align-content', 'align-items', 'align-self', 'justify-content', 'justify-items',
  'gap', 'row-gap', 'column-gap', 'grid-template-columns', 'grid-template-rows',
  'grid-column', 'grid-row',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-width', 'border-style', 'border-color', 'border-radius',
  'background', 'background-color', 'background-image', 'background-position',
  'background-size', 'background-repeat',
  'color', 'font', 'font-family', 'font-size', 'font-style', 'font-weight',
  'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
  'text-overflow', 'white-space', 'word-break',
  'object-fit', 'object-position', 'opacity', 'transform', 'transform-origin',
  'isolation', 'fill', 'stroke', 'stroke-width', 'vertical-align',
] as const

function waitForImage(image: HTMLImageElement) {
  if (image.complete) return Promise.resolve()

  return new Promise<void>((resolve) => {
    image.addEventListener('load', () => resolve(), { once: true })
    image.addEventListener('error', () => resolve(), { once: true })
  })
}

export async function waitForCardAssets(root: ParentNode) {
  await Promise.all(Array.from(root.querySelectorAll<HTMLImageElement>('img')).map(waitForImage))
  await document.fonts?.ready
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)), { once: true })
    reader.addEventListener('error', () => reject(reader.error), { once: true })
    reader.readAsDataURL(blob)
  })
}

function imageUrlToDataUrl(source: string) {
  if (source.startsWith('data:')) return Promise.resolve(source)

  const absoluteUrl = new URL(source, window.location.href).href
  const cached = imageDataUrlCache.get(absoluteUrl)
  if (cached) return cached

  const request = fetch(absoluteUrl, { credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load export image: ${response.status}`)
      return response.blob()
    })
    .then(blobToDataUrl)

  imageDataUrlCache.set(absoluteUrl, request)
  return request
}

function loadSvgMarkup(source: string) {
  const absoluteUrl = new URL(source, window.location.href).href
  const cached = svgMarkupCache.get(absoluteUrl)
  if (cached) return cached

  const request = fetch(absoluteUrl, { credentials: 'same-origin' })
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load export SVG: ${response.status}`)
      return response.text()
    })

  svgMarkupCache.set(absoluteUrl, request)
  return request
}

function copyComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source)
  const targetElement = target as HTMLElement | SVGElement

  for (const property of exportStyleProperties) {
    const value = computed.getPropertyValue(property)
    if (value) targetElement.style.setProperty(property, value)
  }
}

async function prepareCardClone(card: HTMLElement) {
  const clone = card.cloneNode(true) as HTMLElement
  const sourceElements = [card, ...Array.from(card.querySelectorAll('*'))]
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll('*'))]

  sourceElements.forEach((source, index) => {
    const target = cloneElements[index]
    if (target) copyComputedStyles(source, target)
  })

  clone.style.width = `${CARD_WIDTH}px`
  clone.style.height = `${CARD_HEIGHT}px`
  clone.style.margin = '0'
  clone.style.transform = 'none'
  clone.removeAttribute('aria-label')

  const sourceImages = Array.from(card.querySelectorAll<HTMLImageElement>('img'))
  const cloneImages = Array.from(clone.querySelectorAll<HTMLImageElement>('img'))

  await Promise.all(sourceImages.map(async (sourceImage, index) => {
    const cloneImage = cloneImages[index]
    if (!cloneImage) return

    const source = sourceImage.currentSrc || sourceImage.src
    cloneImage.removeAttribute('srcset')
    cloneImage.removeAttribute('sizes')

    try {
      if (new URL(source, window.location.href).pathname.toLowerCase().endsWith('.svg')) {
        const svgDocument = new DOMParser().parseFromString(
          await loadSvgMarkup(source),
          'image/svg+xml',
        )
        const inlineSvg = document.importNode(svgDocument.documentElement, true) as unknown as SVGElement
        inlineSvg.setAttribute('class', cloneImage.getAttribute('class') || '')
        inlineSvg.setAttribute('style', cloneImage.getAttribute('style') || '')
        inlineSvg.setAttribute('aria-hidden', 'true')
        cloneImage.replaceWith(inlineSvg)
        return
      }

      cloneImage.src = await imageUrlToDataUrl(source)
    } catch {
      // Same-origin assets and CORS-enabled portraits are inlined. Keeping the
      // loaded URL here is a graceful fallback for older stored portraits.
      cloneImage.src = source
    }
  }))

  return clone
}

function loadSvgArtwork(svg: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('error', () => reject(new Error('Unable to render the card artwork.')), { once: true })
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

export async function renderCardToCanvas(
  card: HTMLElement,
  scale = CARD_EXPORT_SCALE,
  options: { hideLogo?: boolean } = {},
) {
  await waitForCardAssets(card)
  const clone = await prepareCardClone(card)
  if (options.hideLogo) {
    clone.querySelector<HTMLElement>('.id-card-logo')?.style.setProperty('visibility', 'hidden')
  }
  const serializedCard = new XMLSerializer().serializeToString(clone)
  const outputWidth = CARD_WIDTH * scale
  const outputHeight = CARD_HEIGHT * scale
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}"><foreignObject x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}">${serializedCard}</foreignObject></svg>`
  const artwork = await loadSvgArtwork(svg)
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight

  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('Canvas is unavailable.')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, outputWidth, outputHeight)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(artwork, 0, 0, outputWidth, outputHeight)
  return canvas
}

export function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Unable to create PNG blob.'))
    }, 'image/png')
  }).then((blob) => addPngPhysicalSize(blob, canvas.width, canvas.height))
}

function calculateCrc32(bytes: Uint8Array) {
  let crc = 0xffffffff

  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

async function addPngPhysicalSize(blob: Blob, pixelWidth: number, pixelHeight: number) {
  const source = new Uint8Array(await blob.arrayBuffer())
  const signature = [137, 80, 78, 71, 13, 10, 26, 10]
  const hasPngSignature = signature.every((byte, index) => source[index] === byte)
  if (!hasPngSignature || source.length < 33) return blob

  const sourceView = new DataView(source.buffer, source.byteOffset, source.byteLength)
  const ihdrLength = sourceView.getUint32(8, false)
  const ihdrType = String.fromCharCode(...source.subarray(12, 16))
  if (ihdrType !== 'IHDR') return blob

  const pixelsPerMetreX = Math.round(pixelWidth / (CARD_WIDTH_MM / 1000))
  const pixelsPerMetreY = Math.round(pixelHeight / (CARD_HEIGHT_MM / 1000))

  let chunkOffset = 8
  while (chunkOffset + 12 <= source.length) {
    const chunkLength = sourceView.getUint32(chunkOffset, false)
    const nextChunkOffset = chunkOffset + 12 + chunkLength
    if (nextChunkOffset > source.length) return blob

    const chunkType = String.fromCharCode(...source.subarray(chunkOffset + 4, chunkOffset + 8))
    if (chunkType === 'pHYs' && chunkLength === 9) {
      sourceView.setUint32(chunkOffset + 8, pixelsPerMetreX, false)
      sourceView.setUint32(chunkOffset + 12, pixelsPerMetreY, false)
      source[chunkOffset + 16] = 1
      sourceView.setUint32(
        chunkOffset + 17,
        calculateCrc32(source.subarray(chunkOffset + 4, chunkOffset + 17)),
        false,
      )
      return new Blob([source], { type: 'image/png' })
    }

    chunkOffset = nextChunkOffset
  }

  const physicalSizeChunk = new Uint8Array(21)
  const chunkView = new DataView(
    physicalSizeChunk.buffer,
    physicalSizeChunk.byteOffset,
    physicalSizeChunk.byteLength,
  )

  chunkView.setUint32(0, 9, false)
  physicalSizeChunk.set([112, 72, 89, 115], 4) // pHYs
  chunkView.setUint32(8, pixelsPerMetreX, false)
  chunkView.setUint32(12, pixelsPerMetreY, false)
  physicalSizeChunk[16] = 1 // Unit: metre
  chunkView.setUint32(17, calculateCrc32(physicalSizeChunk.subarray(4, 17)), false)

  const insertionOffset = 8 + 12 + ihdrLength
  const output = new Uint8Array(source.length + physicalSizeChunk.length)
  output.set(source.subarray(0, insertionOffset), 0)
  output.set(physicalSizeChunk, insertionOffset)
  output.set(source.subarray(insertionOffset), insertionOffset + physicalSizeChunk.length)
  return new Blob([output], { type: 'image/png' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function loadLogoSvg(path: string) {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Unable to load vector logo: ${response.status}`)

  const svgDocument = new DOMParser().parseFromString(await response.text(), 'image/svg+xml')
  const svg = svgDocument.documentElement
  if (svg.tagName.toLowerCase() !== 'svg') throw new Error('Invalid vector logo.')
  return svg as unknown as SVGElement
}
