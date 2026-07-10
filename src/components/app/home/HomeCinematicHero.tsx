import { Check, Lock, Target, Trophy } from 'lucide-react'
import type { ChallengeId } from '../../../store/useAppStore'
import { CHALLENGES } from '../../../store/useAppStore'
import { LEVEL_META } from '../../ui/ChallengeLevelCard'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'
import {
  JOURNEY_MILESTONES,
  getJourneyPercent,
  getActiveMilestoneIndex,
} from '../../../lib/homeMetrics'

type HomeCinematicHeroProps = {
  displayName: string
  dayComplete: boolean
  subtitle: string
  displayDay: number
  streakDays: number
  challengeId: ChallengeId
}

export function HomeCinematicHero({
  displayName,
  dayComplete,
  subtitle,
  displayDay,
  streakDays,
  challengeId,
}: HomeCinematicHeroProps) {
  const journeyPct = getJourneyPercent(displayDay)
  const activeMilestone = getActiveMilestoneIndex(displayDay)
  const challenge = CHALLENGES[challengeId]
  const meta = LEVEL_META[challengeId]
  const greetingWord = dayComplete ? 'Excelente' : 'Bora'

  return (
    <section className="home-section home-section--hero animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-black tracking-tight leading-tight">
          {greetingWord},{' '}
          <span className="text-accent-green">{displayName}</span>! 🔥
        </h1>
        <p className="text-neutral-400 text-sm mt-1.5 leading-relaxed">{subtitle}</p>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-neutral-800/60 min-h-[280px]">
        <img
          src={challenge.image}
          alt={meta.label}
          className={`absolute inset-0 w-full h-full object-cover ${meta.imagePosition}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

        <div className="relative z-10 p-4 flex flex-col min-h-[280px]">
          <div className="flex justify-end">
            <div className="rounded-2xl bg-black/55 border border-white/10 backdrop-blur-md px-3 py-2 text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                Progresso geral
              </p>
              <p className="text-2xl font-black text-accent-green tabular-nums leading-none">
                {journeyPct}%
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5 tabular-nums">
                Dia {displayDay} de {TOTAL_PROGRAM_DAYS}
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="self-start rounded-2xl bg-black/55 border border-white/10 backdrop-blur-md px-3 py-2.5 max-w-[160px]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                Investida
              </p>
              <p className="text-lg font-black text-white tabular-nums leading-tight">
                {streakDays} dia{streakDays !== 1 ? 's' : ''}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {streakDays >= 7 ? 'Ritmo imparável.' : 'Não quebre amanhã.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="relative flex justify-between items-start">
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-neutral-800 rounded-full" />
                <div
                  className="absolute top-3 left-4 h-0.5 bg-accent-green rounded-full transition-all duration-1000"
                  style={{
                    width: `calc(${((activeMilestone + 1) / JOURNEY_MILESTONES.length) * 100}% - 2rem)`,
                    maxWidth: 'calc(100% - 2rem)',
                  }}
                />

                {JOURNEY_MILESTONES.map((milestone, index) => {
                  const reached = displayDay >= milestone.day
                  const isCurrent = activeMilestone === index
                  const isNext = index === activeMilestone + 1 && !reached
                  const isLast = milestone.day === 90

                  return (
                    <div
                      key={milestone.day}
                      className="relative z-10 flex flex-col items-center w-[18%] min-w-0"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mb-1.5 ${
                          reached
                            ? 'bg-accent-green text-black'
                            : isNext
                              ? 'bg-accent-green/20 text-accent-green border border-accent-green/50 home-pulse-dot'
                              : 'bg-neutral-900 text-neutral-600 border border-neutral-700'
                        } ${isCurrent ? 'ring-2 ring-accent-green/40' : ''}`}
                      >
                        {reached ? (
                          <Check size={11} strokeWidth={3} />
                        ) : isLast ? (
                          <Trophy size={10} />
                        ) : isNext ? (
                          <Target size={10} />
                        ) : (
                          <Lock size={9} />
                        )}
                      </div>
                      <p className="text-[8px] font-bold text-neutral-500 tabular-nums">
                        {milestone.day}
                      </p>
                      <p
                        className={`text-[7px] leading-tight text-center mt-0.5 ${
                          reached || isCurrent ? 'text-neutral-300' : 'text-neutral-600'
                        }`}
                      >
                        {milestone.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
