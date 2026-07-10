import { Share2, Trophy } from 'lucide-react'
import { BottomSheet, BottomSheetPanel } from '../../ui/BottomSheet'
import { Button } from '../../ui/Button'

type Reset90CompleteModalProps = {
  displayName: string
  completedDays: number
  onClose: () => void
}

export function Reset90CompleteModal({
  displayName,
  completedDays,
  onClose,
}: Reset90CompleteModalProps) {
  const handleShare = async () => {
    const text = `🏆 Concluí o Reset90 — 90 dias de disciplina! Entrei para os Implacáveis. #Reset90`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Reset90 Completo', text })
      } catch {
        /* usuário cancelou */
      }
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <BottomSheet onClose={onClose} className="bg-black/90">
      <BottomSheetPanel className="p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
          <Trophy size={36} className="text-black" />
        </div>

        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
          Badge dourado desbloqueado
        </p>
        <h2 className="text-2xl font-black text-white mb-2">🏆 RESET90 CONCLUÍDO</h2>
        <p className="text-neutral-300 text-sm mb-1">Você venceu, {displayName}.</p>
        <p className="text-4xl font-black text-amber-400 tabular-nums my-3">90 dias</p>
        <p className="text-neutral-400 text-sm mb-6">
          Você entrou para os <span className="text-white font-semibold">Implacáveis</span>.
        </p>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6 text-left space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
            Suas estatísticas
          </p>
          <p className="text-sm text-neutral-300">
            <span className="text-white font-bold tabular-nums">{completedDays}</span> dias fechados
            com disciplina
          </p>
          <p className="text-sm text-neutral-300">Certificado digital disponível</p>
          <p className="text-sm text-amber-400 font-semibold">🏅 Conquista Elite — Reset Completo</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleShare} className="!bg-amber-400 !text-black font-black gap-2">
            <Share2 size={18} />
            Compartilhar conquista
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-sm text-neutral-500 hover:text-neutral-300"
          >
            Continuar
          </button>
        </div>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
