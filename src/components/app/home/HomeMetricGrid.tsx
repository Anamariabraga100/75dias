import { Clock, Flame, Trophy, Zap } from 'lucide-react'

type HomeMetricGridProps = {
  streakDays: number
  completionRate: number
  achievementsCount: number
  timeInvested: string
}

const METRICS = [
  { key: 'streak', icon: Flame, label: 'Dias seguidos', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { key: 'rate', icon: Zap, label: 'Taxa de conclusão', color: 'text-accent-green', bg: 'bg-accent-green/10' },
  { key: 'achievements', icon: Trophy, label: 'Conquistas', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'time', icon: Clock, label: 'Tempo investido', color: 'text-sky-400', bg: 'bg-sky-500/10' },
] as const

export function HomeMetricGrid({
  streakDays,
  completionRate,
  achievementsCount,
  timeInvested,
}: HomeMetricGridProps) {
  const values: Record<(typeof METRICS)[number]['key'], string> = {
    streak: String(streakDays),
    rate: `${completionRate}%`,
    achievements: String(achievementsCount),
    time: timeInvested,
  }

  return (
    <section className="home-section">
      <div className="grid grid-cols-2 gap-3">
        {METRICS.map(({ key, icon: Icon, label, color, bg }, index) => (
          <div
            key={key}
            className="rounded-2xl border border-neutral-800/60 bg-[#111111] p-4 home-metric-card"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-white tabular-nums leading-none">{values[key]}</p>
            <p className="text-[11px] text-neutral-500 mt-1.5 leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
