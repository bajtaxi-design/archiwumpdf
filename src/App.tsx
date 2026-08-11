import { useState, useRef, useCallback } from 'react'
import Header from './components/Header'
import ImageList from './components/ImageList'
import SettingsPanel from './components/SettingsPanel'
import GenerateButton from './components/GenerateButton'
import { generatePDF } from './utils/pdfGenerator'
import type { ImageItem, Settings } from './types'

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [settings, setSettings] = useState<Settings>({
    compression: 'medium',
    pageNumbers: true,
    headerText: '',
    watermark: true,
  })
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const newItems: ImageItem[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif'))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        rotation: 0,
      }))

    if (newItems.length === 0) {
      alert('Nie znaleziono obsługiwanych plików obrazów.')
      return
    }

    setImages((prev) => [...prev, ...newItems])
  }, [])

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  const rotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((i) => (i.id === id ? { ...i, rotation: (i.rotation + 90) % 360 } : i))
    )
  }

  const clearAll = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl))
    setImages([])
  }

  const handleGenerate = async () => {
    if (images.length === 0) return
    setLoading(true)
    setProgress({ current: 0, total: images.length })

    try {
      const pdfBytes = await generatePDF(images, settings, (current, total) => {
        setProgress({ current, total })
      })

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `ArchiwumPDF_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      if (navigator.share && navigator.canShare?.({ files: [new File([blob], a.download, { type: 'application/pdf' })] })) {
        try {
          await navigator.share({
            files: [new File([blob], a.download, { type: 'application/pdf' })],
            title: 'ArchiwumPDF',
          })
        } catch {
          // użytkownik anulował share
        }
      }

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Wystąpił błąd podczas generowania PDF.\n\nSpróbuj ponownie lub zmniejsz liczbę / jakość zdjęć.')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 space-y-5 pb-safe">
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-blue-500/70 rounded-2xl text-slate-300 hover:text-blue-400 transition active:scale-[0.99] flex flex-col items-center gap-1"
          >
            <span className="text-2xl opacity-70">＋</span>
            <span className="font-medium">Dodaj zdjęcia</span>
            <span className="text-xs text-slate-500">JPEG, PNG, HEIC • wiele naraz</span>
          </button>
        </div>

        <ImageList
          images={images}
          onReorder={setImages}
          onRemove={removeImage}
          onRotate={rotateImage}
        />

        {images.length > 0 && (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-slate-500 hover:text-red-400 transition px-2 py-1"
              >
                Wyczyść wszystko
              </button>
            </div>

            <SettingsPanel settings={settings} onChange={setSettings} />

            <GenerateButton
              disabled={images.length === 0}
              loading={loading}
              progress={progress}
              onClick={handleGenerate}
            />
          </>
        )}
      </main>
    </div>
  )
}