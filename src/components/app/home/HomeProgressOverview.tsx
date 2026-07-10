import { TrendingUp } from 'lucide-react'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'

type HomeProgressOverviewProps = {
  displayDay: number
  progressPct: number
  daysLeft: number
  completedDays: number
}

export function HomeProgressOverview({
  displayDay,
  progressPct,
  daysLeft,
  completedDays,
}: HomeProgressOverviewProps) {
  const circumference = 2 * Math.PI * 42
  const strokeOffset = circumference - (circumference * progressPct) / 100

  return (
    <section className="home-section">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-accent-green" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Seu progresso</h2>
      </div>

      <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-[#121212] to-[#0a0a0a] p-5">
        <div className="flex items-center gap-5">
          <div className="relative w-[104px] h-[104px] shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#262626"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#22c55e"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="home-ring-progress transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-black text-white tabular-nums leading-none">{progressPct}%</p>
              <p className="text-[9px] text-neutral-500 mt-0.5">concluído</p>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <p className="text-neutral-500 text-xs mb-0.5">Dias de disciplina</p>
              <p className="text-xl font-black text-white tabular-nums">
                {displayDay}
                <span className="text-neutral-500 text-sm font-bold"> / {TOTAL_PROGRAM_DAYS} dias</span>
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-0.5">Faltam</p>
              <p className="text-sm font-semibold text-neutral-300">
                {daysLeft} dias para sua transformação
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-green via-emerald-400 to-teal-400 home-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-neutral-500 text-xs mt-4 leading-relaxed italic border-l-2 border-neutral-700 pl-3">
          &ldquo;Disciplinas pequenas todos os dias resultam em transformações gigantes.&rdquo;
        </p>

        <p className="text-[10px] text-neutral-600 mt-3 text-right tabular-nums">
          {completedDays} dia{completedDays !== 1 ? 's' : ''} fechado{completedDays !== 1 ? 's' : ''} com sucesso
        </p>
      </div>
    </section>
  )
}
