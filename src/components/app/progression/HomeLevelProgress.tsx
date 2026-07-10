import type { ChallengeId } from '../../../store/useAppStore'
import { getChallengeRecommendation } from '../../../lib/challengeRecommendation'
import { LEVEL_META } from '../../ui/ChallengeLevelCard'
import { TIER_INFO, THEME_BAR } from '../../../lib/progressionTiers'
import { getChallengeJourneyProgress } from '../../../lib/journeyMilestones'

type HomeLevelProgressProps = {
  challengeId: ChallengeId
  displayDay: number
}

export function HomeLevelProgress({ challengeId, displayDay }: HomeLevelProgressProps) {
  const tier = TIER_INFO[challengeId]
  const meta = LEVEL_META[challengeId]
  const challengeTitle = getChallengeRecommendation(challengeId).challengeTitle
  const progress = getChallengeJourneyProgress(displayDay)
  const barGradient = THEME_BAR[tier.theme]

  return (
    <section className="home-section">
      <div className="rounded-2xl border border-neutral-800/80 bg-[#111111] p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              Desafio escolhido
            </p>
            <p className="text-lg font-black text-white leading-tight">{challengeTitle}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {tier.emoji} Nível {meta.level} · {meta.intensity}
            </p>
          </div>
          <div className="flex gap-1 shrink-0 pt-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1.5 w-4 rounded-full ${n <= meta.level ? 'bg-white/80' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>

        <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} home-progress-fill transition-all duration-700`}
            style={{ width: `${progress.pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 tabular-nums">
            Dia {progress.currentDay} / {progress.targetDay}
          </span>
          <span className="text-neutral-500 tabular-nums">{progress.pct}%</span>
        </div>

        {progress.nextNode && progress.daysLeft > 0 && (
          <div className="pt-3 mt-3 border-t border-neutral-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 mb-0.5">
              Próximo marco
            </p>
            <p className="text-sm font-semibold text-white">
              {progress.nextNode.emoji} {progress.nextNode.label}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Dia {progress.nextNode.day} · faltam {progress.nextNodeDaysLeft} dia
              {progress.nextNodeDaysLeft !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {progress.daysLeft === 0 && (
          <div className="pt-3 mt-3 border-t border-neutral-800/80">
            <p className="text-sm font-semibold text-accent-green">🏆 Reset90 completo!</p>
          </div>
        )}
      </div>
    </section>
  )
}
