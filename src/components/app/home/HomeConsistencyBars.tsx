import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
import type { ConsistencyBar } from '../../../lib/homeMetrics'

type HomeConsistencyBarsProps = {
  bars: ConsistencyBar[]
  streakDays: number
}

export function HomeConsistencyBars({ bars, streakDays }: HomeConsistencyBarsProps) {
  const navigate = useNavigate()

  return (
    <section className="home-section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Sua evolução</h2>
        <button
          type="button"
          onClick={() => navigate('/app/progresso')}
          className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 flex items-center gap-0.5 transition-colors"
        >
          Ver histórico
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="rounded-3xl border border-neutral-800/80 bg-[#111111] p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-400">
            Consistência:{' '}
            <span className="font-bold text-white tabular-nums">{streakDays}</span> dias seguidos
          </p>
          {streakDays >= 3 && (
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
              🔥 Melhor sequência
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-1.5 h-24">
          {bars.map((bar, index) => {
            const heightPct = bar.complete ? 100 : bar.isToday ? 45 : bar.isFuture ? 18 : 28

            return (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div className="w-full flex flex-col items-center justify-end h-16">
                  {bar.complete && (
                    <Check size={10} className="text-accent-green mb-0.5 home-bar-check" />
                  )}
                  <div
                    className={`w-full max-w-[28px] rounded-md transition-all home-consistency-bar ${
                      bar.complete
                        ? 'bg-gradient-to-t from-accent-green to-emerald-400'
                        : bar.isToday
                          ? 'bg-neutral-700 border border-dashed border-neutral-500'
                          : 'bg-neutral-800/80'
                    }`}
                    style={{
                      height: `${heightPct}%`,
                      animationDelay: `${index * 50}ms`,
                    }}
                  />
                </div>
                <span
                  className={`text-[9px] font-bold tabular-nums ${
                    bar.isToday ? 'text-white' : bar.complete ? 'text-accent-green' : 'text-neutral-600'
                  }`}
                >
                  D{bar.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
