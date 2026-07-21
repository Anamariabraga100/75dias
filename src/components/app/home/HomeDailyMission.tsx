import { FastForward, Shield } from 'lucide-react'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'
import { isFastDayMode } from '../../../lib/dayUnlock'
import { MidnightCountdown } from './MidnightCountdown'

type HomeDailyMissionProps = {
  programDay: number
  allDone: boolean
  remainingMs: number
  showCountdown: boolean
  canUseShield?: boolean
  disciplineShields?: number
  isShielded?: boolean
  onUseShield?: () => void
  onForceAdvance: () => void
}

/** Escudo + cronômetro do próximo dia (sem card "Missão do dia" / botão Iniciar). */
export function HomeDailyMission({
  programDay,
  allDone,
  remainingMs,
  showCountdown,
  canUseShield = false,
  disciplineShields = 0,
  isShielded = false,
  onUseShield,
  onForceAdvance,
}: HomeDailyMissionProps) {
  const nextDay = programDay + 1
  const hasNextDay = programDay < TOTAL_PROGRAM_DAYS
  const hasShieldInventory = disciplineShields > 0
  const showBlock =
    isShielded ||
    canUseShield ||
    (hasShieldInventory && !isShielded) ||
    (allDone && hasNextDay && showCountdown) ||
    (allDone && hasNextDay && isFastDayMode())

  if (!showBlock) return null

  return (
    <section className="home-section">
      <div className="space-y-3">
        {isShielded && (
          <div className="flex items-center gap-2 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5">
            <Shield size={16} className="text-sky-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-sky-200">Escudo de Disciplina ativo</p>
              <p className="text-[11px] text-sky-300/70 leading-snug">
                Dia {programDay} protegido — sua sequência está salva.
              </p>
            </div>
          </div>
        )}

        {hasShieldInventory && !isShielded && !canUseShield && (
          <div className="flex items-start gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-3 py-2.5">
            <Shield size={14} className="text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-200/80 leading-relaxed">
              Você tem {disciplineShields} escudo{disciplineShields !== 1 ? 's' : ''} guardado
              {disciplineShields !== 1 ? 's' : ''}. Se esquecer de abrir o app um dia, o escudo
              ativa sozinho e salva sua investida.
            </p>
          </div>
        )}

        {canUseShield && onUseShield && (
          <button
            type="button"
            onClick={onUseShield}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-sky-500/50 bg-sky-500/15 text-sky-200 text-sm font-bold hover:bg-sky-500/25 transition-colors"
          >
            <Shield size={16} />
            Usar Escudo de Disciplina ({disciplineShields} disponível
            {disciplineShields !== 1 ? 'is' : ''})
          </button>
        )}

        {allDone && hasNextDay && showCountdown && (
          <MidnightCountdown remainingMs={remainingMs} nextDay={nextDay} />
        )}

        {allDone && hasNextDay && isFastDayMode() && (
          <button
            type="button"
            onClick={onForceAdvance}
            className="w-full text-xs font-semibold text-amber-400/90 hover:text-amber-300 py-1.5 transition-colors"
          >
            <FastForward size={12} className="inline mr-1" />
            Avançar dia (modo teste)
          </button>
        )}
      </div>
    </section>
  )
}
