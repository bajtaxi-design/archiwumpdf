import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import type { ImageItem, CompressionLevel } from '../types'

const COMPRESSION = {
  low:    { quality: 0.92, maxWidth: 2200 },
  medium: { quality: 0.75, maxWidth: 1600 },
  high:   { quality: 0.52, maxWidth: 1200 },
} as const

async function compressImage(file: File, level: CompressionLevel): Promise<Uint8Array> {
  const { quality, maxWidth } = COMPRESSION[level]

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    const url = URL.createObjectURL(file)
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    URL.revokeObjectURL(url)
    bitmap = await createImageBitmap(img)
  }

  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.max(1, Math.floor(bitmap.width * scale))
  const height = Math.max(1, Math.floor(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality
    )
  })

  return new Uint8Array(await blob.arrayBuffer())
}

export async function generatePDF(
  images: ImageItem[],
  settings: {
    compression: CompressionLevel
    pageNumbers: boolean
    headerText: string
    watermark: boolean
  },
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 36

  for (let i = 0; i < images.length; i++) {
    onProgress?.(i + 1, images.length)

    const item = images[i]
    const imageBytes = await compressImage(item.file, settings.compression)
    const jpgImage = await pdfDoc.embedJpg(imageBytes)

    const page = pdfDoc.addPage([pageWidth, pageHeight])

    const headerSpace = settings.headerText.trim() ? 28 : 0
    const footerSpace = settings.pageNumbers ? 28 : 0

    const maxW = pageWidth - margin * 2
    const maxH = pageHeight - margin * 2 - headerSpace - footerSpace

    const scale = Math.min(maxW / jpgImage.width, maxH / jpgImage.height)
    const drawW = jpgImage.width * scale
    const drawH = jpgImage.height * scale

    const x = (pageWidth - drawW) / 2
    const y = margin + footerSpace + (maxH - drawH) / 2

    page.drawImage(jpgImage, {
      x,
      y,
      width: drawW,
      height: drawH,
      rotate: degrees(item.rotation),
    })

    if (settings.headerText.trim()) {
      page.drawText(settings.headerText.trim(), {
        x: margin,
        y: pageHeight - 22,
        size: 10,
        font,
        color: rgb(0.25, 0.25, 0.25),
      })
    }

    if (settings.pageNumbers) {
      const text = `${i + 1} / ${images.length}`
      const tw = font.widthOfTextAtSize(text, 9)
      page.drawText(text, {
        x: (pageWidth - tw) / 2,
        y: 16,
        size: 9,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })
    }

    if (settings.watermark) {
      page.drawText('Archiwum 13 SAS', {
        x: pageWidth / 2 - 78,
        y: pageHeight / 2 - 10,
        size: 26,
        font,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.15,
        rotate: degrees(-32),
      })
    }
  }

  return pdfDoc.save()
}