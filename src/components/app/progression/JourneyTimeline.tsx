import { Check } from 'lucide-react'
import type { ChallengeId } from '../../../store/useAppStore'
import { getChallengeRecommendation } from '../../../lib/challengeRecommendation'
import { LEVEL_META } from '../../ui/ChallengeLevelCard'
import { TIER_INFO, THEME_BAR } from '../../../lib/progressionTiers'
import {
  CHALLENGE_JOURNEY_NODES,
  getChallengeJourneyProgress,
  isJourneyNodeReached,
} from '../../../lib/journeyMilestones'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'

type JourneyTimelineProps = {
  challengeId: ChallengeId | null
  displayDay: number
}

export function JourneyTimeline({ challengeId, displayDay }: JourneyTimelineProps) {
  if (!challengeId) return null

  const tier = TIER_INFO[challengeId]
  const meta = LEVEL_META[challengeId]
  const challengeTitle = getChallengeRecommendation(challengeId).challengeTitle
  const barGradient = THEME_BAR[tier.theme]
  const progress = getChallengeJourneyProgress(displayDay)
  const journeyPct = progress.pct

  const nodes = CHALLENGE_JOURNEY_NODES

  return (
    <section className="rounded-3xl border border-neutral-800/80 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-5 pb-6 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1">
            Sua jornada
          </h2>
          <p className="text-lg font-black text-white leading-tight">{challengeTitle}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {tier.emoji} Nível {meta.level} · {meta.intensity} · 90 dias
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-black/40 border border-neutral-800 px-2.5 py-1.5 text-right">
          <p className="text-[9px] uppercase tracking-wide text-neutral-500">Dia</p>
          <p className="text-lg font-black text-white tabular-nums leading-none">{displayDay}</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-neutral-800 overflow-hidden mb-6">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-700`}
          style={{ width: `${journeyPct}%` }}
        />
      </div>

      <div className="relative px-1 mb-2">
        <div className="absolute top-[26px] left-8 right-8 h-[3px] rounded-full bg-neutral-800" />
        <div
          className="absolute top-[26px] left-8 h-[3px] rounded-full bg-gradient-to-r from-accent-green via-emerald-400 to-accent-green/40 transition-all duration-1000 ease-out"
          style={{ width: `calc((100% - 4rem) * ${journeyPct / 100})` }}
        />

        <div className="relative flex justify-between items-start">
          {nodes.map((node, index) => {
            const reached = isJourneyNodeReached(displayDay, node.day)
            const nextDay = nodes[index + 1]?.day ?? TOTAL_PROGRAM_DAYS + 1
            const isHere = displayDay >= node.day && displayDay < nextDay

            return (
              <div key={node.day} className="flex flex-col items-center w-[22%] min-w-0">
                <div
                  className={`w-[48px] h-[48px] rounded-2xl flex items-center justify-center text-lg border-2 transition-all ${
                    reached
                      ? 'bg-accent-green/20 border-accent-green text-accent-green shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  } ${isHere ? 'ring-2 ring-accent-green/50 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                >
                  {reached ? (
                    <Check size={18} className="text-accent-green" strokeWidth={3} />
                  ) : (
                    node.emoji
                  )}
                </div>
                <p className="text-[10px] font-bold text-neutral-500 mt-2 tabular-nums">{node.day}</p>
                <p
                  className={`text-[9px] text-center leading-tight mt-0.5 font-semibold ${
                    isHere ? 'text-white' : reached ? 'text-neutral-400' : 'text-neutral-600'
                  }`}
                >
                  {node.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-5">
        {displayDay >= TOTAL_PROGRAM_DAYS ? (
          <span className="text-accent-green font-semibold">Reset90 completo — você venceu os 90 dias</span>
        ) : progress.nextNode ? (
          <>
            Próximo marco:{' '}
            <span className="text-white font-semibold">
              {progress.nextNode.label} (dia {progress.nextNode.day})
            </span>
            {' · '}
            faltam {progress.nextNodeDaysLeft} dia{progress.nextNodeDaysLeft !== 1 ? 's' : ''}
          </>
        ) : (
          <>Dia {displayDay} de {TOTAL_PROGRAM_DAYS}</>
        )}
      </p>
    </section>
  )
}
