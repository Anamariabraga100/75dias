import { Shield, Flame } from 'lucide-react'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import type { InvestidaNotice } from '../../lib/investida'

type InvestidaBreakModalProps = {
  notice: InvestidaNotice
  onClose: () => void
}

export function InvestidaBreakModal({ notice, onClose }: InvestidaBreakModalProps) {
  const saved = notice.type === 'shield_saved'

  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
            saved ? 'bg-sky-500/15' : 'bg-orange-500/15'
          }`}
        >
          {saved ? (
            <Shield size={30} className="text-sky-400" />
          ) : (
            <Flame size={30} className="text-orange-400" />
          )}
        </div>

        {saved ? (
          <>
            <h3 className="mb-1 text-center text-xl font-black text-white">
              Salvo pelo escudo
            </h3>
            <p className="mb-2 text-center text-3xl font-black tabular-nums text-sky-400">
              {notice.streak}
              <span className="text-base font-bold text-neutral-400"> dias intactos</span>
            </p>
            <p className="mb-6 text-center text-sm leading-relaxed text-neutral-400">
              Você não entrou no app{' '}
              {notice.shieldsUsed === 1
                ? 'ontem'
                : `por ${notice.shieldsUsed} dias`}
              . O Escudo de Disciplina ativou sozinho e protegeu sua investida
              {notice.shieldsUsed !== 1 ? ` (−${notice.shieldsUsed} escudos)` : ' (−1 escudo)'}
              . Continue hoje para não perder de novo.
            </p>
          </>
        ) : (
          <>
            <h3 className="mb-1 text-center text-xl font-black text-white">
              Sequência quebrada
            </h3>
            <p className="mb-2 text-center text-3xl font-black tabular-nums text-orange-400">
              {notice.previousStreak}
              <span className="text-base font-bold text-neutral-400"> dias perdidos</span>
            </p>
            <p className="mb-6 text-center text-sm leading-relaxed text-neutral-400">
              Você faltou sem escudo suficiente. Investida e progresso voltaram ao Dia 1 — XP e
              escudos restantes ficam. Complete as missões de hoje para recomeçar.
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black"
        >
          {saved ? 'Continuar' : 'Recomeçar do Dia 1'}
        </button>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
