import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2 } from 'lucide-react'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { storeMirrorPhoto } from '../../lib/photoStorage'

interface PhotoCheckInSheetProps {
  day: number
  onRegister: (photoUrl: string) => void
  onClose: () => void
}

export function PhotoCheckInSheet({ day, onRegister, onClose }: PhotoCheckInSheetProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const dataUrl = await storeMirrorPhoto(file)
      setPreviewUrl(dataUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível usar esta imagem.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    if (!previewUrl) return
    onRegister(previewUrl)
  }

  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/15 flex items-center justify-center mx-auto mb-4">
          <Camera size={26} className="text-teal-500" />
        </div>
        <h3 className="font-bold text-lg text-center text-app-fg mb-1">Check-in dia {day}</h3>
        <p className="text-app-muted text-sm text-center leading-relaxed mb-5">
          Mesmo lugar, mesma pose e mesma luz do dia 1. É assim que a evolução fica visível.
        </p>

        <ul className="text-xs text-app-muted space-y-2 mb-5 bg-surface-light rounded-xl p-3 border border-app-border">
          <li>✓ De frente para o espelho ou câmera frontal</li>
          <li>✓ Corpo inteiro ou do joelho pra cima — sempre igual</li>
          <li>✓ Luz natural, sem filtro</li>
        </ul>

        <div className="rounded-xl border-2 border-dashed border-app-border aspect-[3/4] max-h-[240px] mx-auto mb-4 overflow-hidden bg-app-track relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="text-teal-500 animate-spin" />
              <p className="text-app-muted text-xs">Processando foto…</p>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt={`Prévia dia ${day}`} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-app-subtle px-4">
              <Camera size={28} className="opacity-40 mb-2" />
              <p className="text-xs text-center">Tire ou escolha uma foto para continuar</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center mb-3">{error}</p>
        )}

        {!previewUrl && !loading && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-teal-500/40 bg-teal-500/10 py-3 text-sm font-semibold text-teal-600"
            >
              <Camera size={16} />
              Tirar foto
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border border-app-border bg-surface-light py-3 text-sm font-semibold text-app-fg"
            >
              <ImagePlus size={16} />
              Galeria
            </button>
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        {previewUrl && !loading && (
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null)
              setError(null)
            }}
            className="w-full text-xs text-app-muted hover:text-app-fg mb-3 transition-colors"
          >
            Trocar foto
          </button>
        )}

        <Button onClick={handleRegister} disabled={!previewUrl || loading}>
          Registrar foto de hoje
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 text-sm text-app-muted hover:text-app-fg transition-colors mt-2"
        >
          Depois
        </button>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
