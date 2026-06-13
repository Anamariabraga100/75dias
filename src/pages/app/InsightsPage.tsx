import { Navigate } from 'react-router-dom'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { useAppStore, CHALLENGES } from '../../store/useAppStore'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function mockWeeklyData(currentDay: number) {
  return WEEK_DAYS.map((day, i) => ({
    day,
    pct: currentDay > 0 ? Math.min(100, 40 + i * 8 + (currentDay % 7) * 3) : 0,
  }))
}

export function InsightsPage() {
  const { challengeAccepted, challengeId, currentDay, disciplineScore, weakAreas } = useAppStore()

  if (!challengeAccepted) return <Navigate to="/app" replace />

  const weekly = mockWeeklyData(currentDay)
  const avgWeek = Math.round(weekly.reduce((a, b) => a + b.pct, 0) / weekly.length)

  const habits =
    challengeId && CHALLENGES[challengeId]
      ? CHALLENGES[challengeId].tasks.map((t, i) => ({
          name: t.title,
          icon: t.icon,
          rate: Math.min(100, 55 + i * 7 + currentDay * 2),
        }))
      : []

  const best = [...habits].sort((a, b) => b.rate - a.rate).slice(0, 2)
  const worst = [...habits].sort((a, b) => a.rate - b.rate).slice(0, 2)

  return (
    <AppShell>
      <AppHeader />
      <div className="px-4 pt-2 pb-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Insights</h1>
          <p className="text-neutral-500 text-sm">Como seus hábitos evoluem — simulação local</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl p-4 border border-neutral-800">
            <p className="text-neutral-500 text-xs">Média semanal</p>
            <p className="text-2xl font-black text-accent-blue">{avgWeek}%</p>
            <p className="text-neutral-600 text-[10px] mt-1">conclusão de hábitos</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-neutral-800">
            <p className="text-neutral-500 text-xs">Disciplina</p>
            <p className="text-2xl font-black">{disciplineScore}%</p>
            <p className="text-neutral-600 text-[10px] mt-1">nota atual</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 border border-neutral-800">
          <p className="text-neutral-400 text-xs uppercase tracking-wide mb-4">Esta semana</p>
          <div className="flex items-end justify-between gap-2 h-32">
            {weekly.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-accent-blue rounded-t-md transition-all"
                    style={{ height: `${d.pct}%`, minHeight: d.pct > 0 ? 4 : 0 }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {best.length > 0 && (
          <div className="bg-surface rounded-2xl p-4 border border-neutral-800">
            <p className="text-accent-green text-xs font-bold uppercase mb-3">✓ Mais consistentes</p>
            {best.map((h) => (
              <div key={h.name} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-sm">
                  {h.icon} {h.name}
                </span>
                <span className="text-accent-green font-bold text-sm">{h.rate}%</span>
              </div>
            ))}
          </div>
        )}

        {worst.length > 0 && (
          <div className="bg-surface rounded-2xl p-4 border border-neutral-800">
            <p className="text-accent-orange text-xs font-bold uppercase mb-3">↑ Precisa de foco</p>
            {worst.map((h) => (
              <div key={h.name} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-sm">
                  {h.icon} {h.name}
                </span>
                <span className="text-accent-orange font-bold text-sm">{h.rate}%</span>
              </div>
            ))}
          </div>
        )}

        {weakAreas.length > 0 && (
          <div className="bg-surface rounded-2xl p-4 border border-neutral-800">
            <p className="text-neutral-400 text-xs uppercase tracking-wide mb-2">
              Áreas do onboarding
            </p>
            <p className="text-neutral-300 text-sm">
              Seu plano foca em <strong className="text-white">{weakAreas.join(' e ')}</strong> — continue
              marcando os hábitos diários para ver evolução real aqui.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
