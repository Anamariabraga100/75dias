import { FastForward, Play, Shield, Sparkles, Target } from 'lucide-react'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'
import { isFastDayMode } from '../../../lib/dayUnlock'
import { XP_PER_DAY } from '../../../lib/xp'
import { MidnightCountdown } from './MidnightCountdown'

type HomeDailyMissionProps = {
  programDay: number
  missionDone: number
  missionTotal: number
  allDone: boolean
  canAdvance: boolean
  remainingMs: number
  canUseShield?: boolean
  disciplineShields?: number
  isShielded?: boolean
  onUseShield?: () => void
  onStartNextDay: () => void
  onForceAdvance: () => void
}

export function HomeDailyMission({
  programDay,
  missionDone,
  missionTotal,
  allDone,
  canAdvance,
  remainingMs,
  canUseShield = false,
  disciplineShields = 0,
  isShielded = false,
  onUseShield,
  onStartNextDay,
  onForceAdvance,
}: HomeDailyMissionProps) {
  const nextDay = programDay + 1
  const hasNextDay = programDay < TOTAL_PROGRAM_DAYS
  const hasShieldInventory = disciplineShields > 0

  return (
    <section className="home-section">
      <div
        className={`rounded-3xl border p-5 transition-colors ${
          isShielded
            ? 'border-sky-500/50 bg-gradient-to-br from-sky-950/40 via-[#0d1117] to-[#0a0a0a] shadow-[0_0_24px_rgba(56,189,248,0.12)]'
            : 'border-neutral-800/80 bg-gradient-to-br from-[#121212] to-[#0a0a0a]'
        }`}
      >
        {isShielded && (
          <div className="flex items-center gap-2 mb-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5">
            <Shield size={16} className="text-sky-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-sky-200">Escudo de Disciplina ativo</p>
              <p className="text-[11px] text-sky-300/70 leading-snug">
                Dia {programDay} protegido — sua sequência está salva.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isShielded ? 'bg-sky-500/15' : 'bg-accent-green/15'
              }`}
            >
              {isShielded ? (
                <Shield size={16} className="text-sky-300" />
              ) : (
                <Target size={16} className="text-accent-green" />
              )}
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Missão do dia
              </h2>
              <p
                className={`text-sm font-bold tabular-nums mt-0.5 ${
                  isShielded ? 'text-sky-300' : 'text-accent-green'
                }`}
              >
                {isShielded
                  ? 'Dia protegido'
                  : `${missionDone} de ${missionTotal} concluída${missionTotal !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border px-3 py-2 text-center shrink-0 min-w-[108px] ${
              isShielded
                ? 'border-sky-500/30 bg-sky-500/10'
                : 'border-accent-green/20 bg-accent-green/5'
            }`}
          >
            <p className="text-[8px] font-bold uppercase tracking-wide text-neutral-500 mb-1">
              {isShielded ? 'Proteção' : 'Recompensa de hoje'}
            </p>
            {isShielded ? (
              <Shield size={18} className="text-sky-300 mx-auto mb-1" />
            ) : (
              <Sparkles size={18} className="text-accent-green mx-auto mb-1" />
            )}
            <p className="text-[10px] font-semibold text-white leading-tight">
              {isShielded ? 'Sequência salva' : '+1 dia de disciplina'}
            </p>
            <p
              className={`text-[9px] mt-0.5 ${
                isShielded ? 'text-sky-300/80' : 'text-accent-green/80'
              }`}
            >
              {isShielded ? '🛡️ Escudo ativo' : `+${XP_PER_DAY} XP`}
            </p>
          </div>
        </div>

        {!isShielded && (
          <div className="flex gap-1.5 mb-4">
            {Array.from({ length: missionTotal }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  i < missionDone
                    ? 'bg-gradient-to-r from-accent-green to-emerald-400'
                    : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        )}

        <p className="text-neutral-500 text-xs mb-4">
          {isShielded
            ? `O Dia ${programDay} conta como completo graças ao escudo. Continue amanhã com disciplina.`
            : allDone && hasNextDay
              ? `Dia ${programDay} completo! Pronto para o Dia ${nextDay}.`
              : allDone
                ? 'Reset90 completo — você chegou ao topo.'
                : `Complete todas as missões e conquiste o Dia ${nextDay}.`}
        </p>

        {hasShieldInventory && !isShielded && !canUseShield && (
          <div className="flex items-start gap-2 mb-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-3 py-2.5">
            <Shield size={14} className="text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-200/80 leading-relaxed">
              Você tem {disciplineShields} escudo{disciplineShields !== 1 ? 's' : ''} guardado
              {disciplineShields !== 1 ? 's' : ''}. Se não completar o dia, o botão para usar aparece
              aqui.
            </p>
          </div>
        )}

        {canUseShield && onUseShield && (
          <button
            type="button"
            onClick={onUseShield}
            className="w-full mb-3 flex items-center justify-center gap-2 py-3 rounded-2xl border border-sky-500/50 bg-sky-500/15 text-sky-200 text-sm font-bold hover:bg-sky-500/25 transition-colors"
          >
            <Shield size={16} />
            Usar Escudo de Disciplina ({disciplineShields} disponível
            {disciplineShields !== 1 ? 'is' : ''})
          </button>
        )}

        {allDone && hasNextDay && (
          <div className="space-y-2">
            {canAdvance ? (
              <button
                type="button"
                onClick={onStartNextDay}
                className="home-cta-primary w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-sm text-black"
              >
                <Play size={18} fill="currentColor" />
                Iniciar dia {nextDay}
              </button>
            ) : (
              <MidnightCountdown remainingMs={remainingMs} nextDay={nextDay} />
            )}
            {isFastDayMode() && (
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
        )}
      </div>
    </section>
  )
}
