import type { ChallengeId } from '../../../store/useAppStore'
import { getLevelProgress, getNextTier, isTierUnlocked, TIER_INFO, THEME_BAR } from '../../../lib/progressionTiers'

type HomeLevelProgressProps = {
  challengeId: ChallengeId
  displayDay: number
  completedDays: number
  onEvolve?: (tier: ChallengeId) => void
}

export function HomeLevelProgress({
  challengeId,
  displayDay,
  completedDays,
  onEvolve,
}: HomeLevelProgressProps) {
  const tier = TIER_INFO[challengeId]
  const progress = getLevelProgress(displayDay, challengeId)
  const barGradient = THEME_BAR[tier.theme]
  const nextTierId = getNextTier(challengeId)
  const canEvolve =
    nextTierId &&
    isTierUnlocked(nextTierId, completedDays) &&
    challengeId !== nextTierId &&
    onEvolve

  return (
    <section className="home-section">
      <div className="rounded-2xl border border-neutral-800/80 bg-[#111111] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
          Nível atual
        </p>
        <p className="text-lg font-black text-white mb-3">
          {tier.emoji} {tier.label}
        </p>

        <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} home-progress-fill transition-all duration-700`}
            style={{ width: `${progress.pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-neutral-400 tabular-nums">
            {progress.currentDay} / {progress.targetDay} dias
          </span>
          <span className="text-neutral-500 tabular-nums">{progress.pct}%</span>
        </div>

        {progress.daysLeft > 0 && (
          <div className="pt-3 border-t border-neutral-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 mb-0.5">
              Próximo nível
            </p>
            <p className="text-sm font-semibold text-white">
              {progress.nextEmoji} {progress.nextLabel}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Faltam {progress.daysLeft} dia{progress.daysLeft !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {canEvolve && nextTierId && (
          <button
            type="button"
            onClick={() => onEvolve(nextTierId)}
            className="mt-3 w-full py-2.5 rounded-xl border border-accent-green/40 bg-accent-green/10 text-accent-green text-sm font-bold hover:bg-accent-green/15 transition-colors"
          >
            Evoluir para {TIER_INFO[nextTierId].label} ⭐
          </button>
        )}
      </div>
    </section>
  )
}
