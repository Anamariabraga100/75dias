import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { AchievementStatus } from '../../../lib/homeMetrics'

type HomeNextAchievementProps = {
  next: AchievementStatus | null
  displayDay: number
}

export function HomeNextAchievement({ next, displayDay }: HomeNextAchievementProps) {
  const navigate = useNavigate()

  if (!next) return null

  const remaining = next.days - displayDay
  const progressPct = Math.min(100, Math.round((next.progress / next.days) * 100))

  return (
    <section className="home-section">
      <button
        type="button"
        onClick={() => navigate('/app/progresso')}
        className="w-full rounded-2xl border border-neutral-800/80 bg-[#111111] p-4 flex items-center gap-3 text-left hover:bg-neutral-900/50 transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 text-xl">
          {next.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
            Próxima conquista
          </p>
          <p className="font-bold text-sm text-white mt-0.5">{next.days} dias seguidos</p>
          <p className="text-neutral-500 text-xs mt-0.5">
            Faltam apenas {Math.max(remaining, 1)} dia{remaining !== 1 ? 's' : ''} para desbloquear!
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-accent-green rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-neutral-500 tabular-nums">{progressPct}%</span>
          </div>
        </div>
        <ChevronRight size={18} className="text-neutral-600 shrink-0" />
      </button>
    </section>
  )
}
