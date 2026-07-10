import { Check, Clock, FastForward, Play } from 'lucide-react'
import { UserAvatar } from '../../ui/UserAvatar'
import { LEVEL_META } from '../../ui/ChallengeLevelCard'
import type { ChallengeId } from '../../../store/useAppStore'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'
import { formatUnlockCountdown, isFastDayMode } from '../../../lib/dayUnlock'

type HomePrimaryCtaProps = {
  name: string
  avatarUrl: string | null
  challengeId: ChallengeId
  programDay: number
  allDone: boolean
  canAdvance: boolean
  remainingMs: number
  onStartNextDay: () => void
  onForceAdvance: () => void
  onGoToTasks: () => void
}

const COMPLETE_MESSAGES = [
  'Você venceu a preguiça hoje! Mais um dia concluído com sucesso.',
  'Dia fechado com excelência. Você está no caminho certo.',
  'Checklist completo. Descanse com orgulho — amanhã tem mais.',
] as const

export function HomePrimaryCta({
  name,
  avatarUrl,
  challengeId,
  programDay,
  allDone,
  canAdvance,
  remainingMs,
  onStartNextDay,
  onForceAdvance,
  onGoToTasks,
}: HomePrimaryCtaProps) {
  const levelLabel = LEVEL_META[challengeId].label
  const completeMessage = COMPLETE_MESSAGES[(programDay - 1) % COMPLETE_MESSAGES.length]
  const nextDay = programDay + 1
  const hasNextDay = programDay < TOTAL_PROGRAM_DAYS

  return (
    <section className="home-section">
      <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-b from-[#141414] to-[#0c0c0c] overflow-hidden">
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                Hoje · Dia {programDay}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{levelLabel}</span>
                {allDone && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green border border-accent-green/30">
                    ✓ Completo
                  </span>
                )}
              </div>
            </div>
            <UserAvatar
              name={name}
              avatarUrl={avatarUrl}
              size="lg"
              className={allDone ? 'ring-2 ring-accent-green/50 border-accent-green/40' : ''}
            />
          </div>

          <p className="text-neutral-400 text-sm leading-relaxed mb-5">
            {allDone
              ? completeMessage
              : 'Complete seus hábitos de hoje para manter sua sequência viva.'}
          </p>

          {allDone && hasNextDay ? (
            <div className="space-y-2">
              {canAdvance ? (
                <button
                  type="button"
                  onClick={onStartNextDay}
                  className="home-cta-primary w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base text-black"
                >
                  <Play size={20} fill="currentColor" />
                  Iniciar dia {nextDay}
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-sm">
                  <Clock size={16} className="shrink-0" />
                  Próximo dia em{' '}
                  <span className="font-bold text-white tabular-nums">
                    {formatUnlockCountdown(remainingMs)}
                  </span>
                </div>
              )}

              {isFastDayMode() && (
                <button
                  type="button"
                  onClick={onForceAdvance}
                  className="w-full text-xs font-semibold text-amber-400/90 hover:text-amber-300 py-2 transition-colors"
                >
                  ⚡ Avançar dia (modo teste)
                </button>
              )}
            </div>
          ) : allDone && !hasNextDay ? (
            <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent-green/15 border border-accent-green/30 text-accent-green font-bold">
              <Check size={18} />
              Reset90 completo!
            </div>
          ) : (
            <button
              type="button"
              onClick={onGoToTasks}
              className="home-cta-primary w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base text-black"
            >
              <FastForward size={18} />
              Completar dia {programDay}
            </button>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/5 bg-black/30">
          <p className="text-[11px] text-neutral-500 italic text-center leading-relaxed">
            &ldquo;Disciplina é liberdade. Liberdade de ser quem você decidiu ser.&rdquo;
            <span className="block text-neutral-600 not-italic mt-0.5">— Reset90</span>
          </p>
        </div>
      </div>
    </section>
  )
}
