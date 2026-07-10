import { Check, Lock } from 'lucide-react'
import type { ChallengeId } from '../../../store/useAppStore'
import { TIER_INFO, TIER_ORDER } from '../../../lib/progressionTiers'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'

type JourneyTimelineProps = {
  challengeId: ChallengeId | null
  completedDays: number
  displayDay: number
}

export function JourneyTimeline({ challengeId, completedDays, displayDay }: JourneyTimelineProps) {
  const nodes = [
    ...TIER_ORDER.map((id) => ({ type: 'tier' as const, id, day: TIER_INFO[id].unlockDay })),
    { type: 'end' as const, day: TOTAL_PROGRAM_DAYS },
  ]

  const journeyPct = Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100))

  return (
    <section className="rounded-3xl border border-neutral-800/80 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-5 pb-6 overflow-hidden">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">
        Jornada
      </h2>

      <div className="relative px-2 mb-2">
        <div className="absolute top-[26px] left-10 right-10 h-[3px] rounded-full bg-neutral-800" />
        <div
          className="absolute top-[26px] left-10 h-[3px] rounded-full bg-gradient-to-r from-accent-green via-emerald-400 to-accent-green/40 transition-all duration-1000 ease-out"
          style={{ width: `calc((100% - 5rem) * ${journeyPct / 100})` }}
        />

        <div className="relative flex justify-between items-start">
          {nodes.map((node, index) => {
            if (node.type === 'end') {
              const reached = displayDay >= TOTAL_PROGRAM_DAYS
              return (
                <div key="end" className="flex flex-col items-center w-14 shrink-0">
                  <div
                    className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl border-2 transition-all ${
                      reached
                        ? 'bg-accent-green border-accent-green text-black shadow-[0_0_24px_rgba(34,197,94,0.35)]'
                        : 'bg-neutral-950 border-neutral-700 text-neutral-500'
                    }`}
                  >
                    {reached ? <Check size={22} strokeWidth={3} /> : '🏆'}
                  </div>
                  <p className="text-[11px] font-bold text-neutral-500 mt-2 tabular-nums">90</p>
                </div>
              )
            }

            const tier = TIER_INFO[node.id]
            const unlocked = completedDays >= tier.unlockDay
            const isCurrent = challengeId === node.id
            const passed =
              displayDay > tier.unlockDay || (displayDay === tier.unlockDay && unlocked)
            const prevDay = index > 0 ? nodes[index - 1].day : 0
            const nextDay = nodes[index + 1]?.day ?? TOTAL_PROGRAM_DAYS
            const isHere = displayDay >= prevDay && displayDay < nextDay

            return (
              <div key={node.id} className="flex flex-col items-center w-[22%] min-w-0">
                <div
                  className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl border-2 transition-all ${
                    passed
                      ? 'bg-accent-green/20 border-accent-green text-accent-green shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                      : unlocked
                        ? 'bg-neutral-900 border-neutral-600'
                        : 'bg-neutral-950 border-neutral-800 opacity-70'
                  } ${isCurrent || isHere ? 'ring-2 ring-accent-green/50 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                >
                  {passed ? (
                    <Check size={20} className="text-accent-green" strokeWidth={3} />
                  ) : unlocked ? (
                    tier.emoji
                  ) : (
                    <Lock size={16} className="text-neutral-600" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-neutral-500 mt-2 tabular-nums">{node.day}</p>
                <p
                  className={`text-[10px] text-center leading-tight mt-0.5 font-semibold ${
                    isCurrent || isHere ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  {tier.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center text-xs font-semibold text-accent-green mt-5">Você está aqui ↑</p>
    </section>
  )
}
