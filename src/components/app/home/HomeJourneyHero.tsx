import { Check, Flag, Lock, Target } from 'lucide-react'
import { JOURNEY_MILESTONES, getJourneyPercent, getActiveMilestoneIndex } from '../../../lib/homeMetrics'

type HomeJourneyHeroProps = {
  greeting: string
  subtitle: string
  displayDay: number
}

export function HomeJourneyHero({ greeting, subtitle, displayDay }: HomeJourneyHeroProps) {
  const journeyPct = getJourneyPercent(displayDay)
  const activeMilestone = getActiveMilestoneIndex(displayDay)

  return (
    <section className="home-section animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-black tracking-tight text-white leading-tight">{greeting}</h1>
        <p className="text-neutral-400 text-sm mt-1.5 leading-relaxed">{subtitle}</p>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-neutral-800/80 bg-gradient-to-b from-[#141a14] via-[#0d120d] to-black p-4 pb-3">
        <div className="absolute top-3 right-3 z-10 rounded-xl bg-black/50 border border-accent-green/20 px-2.5 py-1.5 backdrop-blur-sm">
          <p className="text-accent-green font-black text-lg leading-none tabular-nums">{journeyPct}%</p>
          <p className="text-[9px] text-neutral-500 uppercase tracking-wide">Jornada</p>
        </div>

        <div className="relative h-[148px] w-full">
          <svg
            viewBox="0 0 320 148"
            className="absolute inset-0 w-full h-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="mountainFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a2e1a" />
                <stop offset="100%" stopColor="#0a0f0a" />
              </linearGradient>
              <linearGradient id="pathGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
              </linearGradient>
            </defs>

            <path
              d="M0 148 L0 95 L45 72 L95 88 L140 48 L195 62 L250 22 L320 38 L320 148 Z"
              fill="url(#mountainFill)"
            />
            <path
              d="M0 148 L0 95 L45 72 L95 88 L140 48 L195 62 L250 22 L320 38 L320 148 Z"
              fill="none"
              stroke="#22c55e"
              strokeOpacity="0.12"
              strokeWidth="1"
            />

            <path
              d="M28 118 C55 102, 78 96, 95 88 S130 58, 140 48 S175 68, 195 62 S230 38, 250 22"
              fill="none"
              stroke="#334433"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M28 118 C55 102, 78 96, 95 88 S130 58, 140 48 S175 68, 195 62 S230 38, 250 22"
              fill="none"
              stroke="url(#pathGlow)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset={400 - (400 * journeyPct) / 100}
              className="home-path-draw"
            />

            <circle
              cx={28 + (222 * journeyPct) / 100}
              cy={118 - (96 * journeyPct) / 100}
              r="5"
              fill="#22c55e"
              className="home-pulse-dot"
            />
          </svg>

          <div
            className="absolute transition-all duration-700 ease-out"
            style={{
              left: `${8 + (journeyPct * 0.72)}%`,
              top: `${58 - journeyPct * 0.38}%`,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-accent-green/20 border border-accent-green/50 flex items-center justify-center home-pulse-dot">
              <Flag size={14} className="text-accent-green" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 mt-2 pt-3 border-t border-white/5">
          {JOURNEY_MILESTONES.map((milestone, index) => {
            const reached = displayDay >= milestone.day
            const isCurrent = activeMilestone === index
            const isNext = index === activeMilestone + 1 && !reached

            return (
              <div key={milestone.day} className="flex flex-col items-center text-center px-0.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                    reached
                      ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
                      : isNext
                        ? 'bg-accent-green/10 text-accent-green border border-accent-green/30 home-pulse-dot'
                        : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                  } ${isCurrent ? 'ring-2 ring-accent-green/30' : ''}`}
                >
                  {reached ? (
                    <Check size={12} strokeWidth={3} />
                  ) : isNext ? (
                    <Target size={12} />
                  ) : (
                    <Lock size={10} />
                  )}
                </div>
                <p className="text-[9px] font-bold text-neutral-500 tabular-nums">Dia {milestone.day}</p>
                <p
                  className={`text-[8px] leading-tight mt-0.5 ${
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
    </section>
  )
}
