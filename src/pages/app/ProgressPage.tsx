import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { EvolutionMirror } from '../../components/app/EvolutionMirror'
import { useAppStore } from '../../store/useAppStore'
import { LEVEL_META } from '../../components/ui/ChallengeLevelCard'
import { getDisplayDay, TOTAL_PROGRAM_DAYS } from '../../lib/demoProgress'

const MILESTONES = [
  { day: 7, label: '1ª semana completa', emoji: '🌱' },
  { day: 30, label: '1 mês de disciplina', emoji: '⚡' },
  { day: 60, label: '2 meses no desafio', emoji: '🔥' },
  { day: 90, label: 'Reset90 concluído', emoji: '🏆' },
]

export function ProgressPage() {
  const location = useLocation()
  const { challengeAccepted, challengeId, recommendedChallenge, currentDay } = useAppStore()

  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const previewLevelId = challengeId ?? recommendedChallenge ?? 'intermediario'

  const pct = Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100))
  const daysLeft = Math.max(0, TOTAL_PROGRAM_DAYS - displayDay)
  const meta = LEVEL_META[challengeId ?? previewLevelId]

  const nextMilestone = MILESTONES.find((m) => m.day > displayDay)
  const completedMilestones = MILESTONES.filter((m) => m.day <= displayDay)

  const weekLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const dayNum = i + 1
    const isPast = dayNum < displayDay
    const isToday = dayNum === displayDay
    const isFuture = dayNum > displayDay
    return { dayNum, isPast, isToday, isFuture }
  })

  useEffect(() => {
    if (location.hash === '#evolucao') {
      setTimeout(() => {
        document.getElementById('evolucao')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [location.hash])

  return (
    <AppShell>
      <AppHeader />
      <div className="px-4 pt-2 pb-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-app-fg">Seu progresso</h1>
          <p className="text-app-muted text-sm">
            Disciplina, marcos e evolução no espelho
          </p>
        </div>

        <div className="rounded-2xl p-5 border border-accent-blue/20 shadow-sm bg-surface">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-app-muted text-xs uppercase tracking-wide mb-1">
                Dia do programa
              </p>
              <p className="text-4xl font-black leading-none text-app-fg">
                {displayDay}
                <span className="text-app-subtle text-xl font-bold">/{TOTAL_PROGRAM_DAYS}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-app-muted text-xs uppercase tracking-wide mb-1">Concluído</p>
              <p className="text-3xl font-black text-accent-blue">{pct}%</p>
            </div>
          </div>

          <div className="h-3 bg-app-track rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-app-border">
            <div>
              <p className="text-app-muted text-xs">Faltam</p>
              <p className="font-bold text-lg text-app-fg">
                {daysLeft} <span className="text-sm font-medium text-app-muted">dias</span>
              </p>
            </div>
            <div>
              <p className="text-app-muted text-xs">Nível ativo</p>
              <p className="font-bold text-lg truncate text-app-fg">{meta?.label ?? '—'}</p>
            </div>
          </div>
        </div>

        <EvolutionMirror displayDay={displayDay} />

        {nextMilestone ? (
          <div className="bg-surface rounded-2xl p-4 border border-app-border shadow-sm">
            <p className="text-app-muted text-xs uppercase tracking-wide mb-2">Próximo marco</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{nextMilestone.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-app-fg">{nextMilestone.label}</p>
                <p className="text-app-muted text-sm">Dia {nextMilestone.day}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-accent-yellow font-bold text-lg">
                  {nextMilestone.day - displayDay}
                </p>
                <p className="text-app-subtle text-[10px]">dias restantes</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-accent-green/10 rounded-2xl p-4 border border-accent-green/30 text-center">
            <p className="text-2xl mb-1">🏆</p>
            <p className="font-bold text-accent-green">Reset90 completo!</p>
          </div>
        )}

        <div className="bg-surface rounded-2xl p-4 border border-app-border shadow-sm">
          <p className="text-app-muted text-xs uppercase tracking-wide mb-3">
            Marcos da jornada
          </p>
          <div className="space-y-2">
            {MILESTONES.map((m) => {
              const done = displayDay >= m.day
              return (
                <div
                  key={m.day}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    done ? 'bg-accent-green/10' : 'bg-app-overlay'
                  }`}
                >
                  <span className="text-lg w-8 text-center">{done ? '✓' : m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'text-app-fg' : 'text-app-muted'}`}>
                      {m.label}
                    </p>
                    <p className="text-app-subtle text-xs">Dia {m.day}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      done
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-app-track text-app-muted'
                    }`}
                  >
                    {done ? 'Alcançado' : 'Pendente'}
                  </span>
                </div>
              )
            })}
          </div>
          {completedMilestones.length > 0 && (
            <p className="text-app-muted text-xs mt-3 text-center">
              {completedMilestones.length} de {MILESTONES.length} marcos alcançados
            </p>
          )}
        </div>

        <div className="bg-surface rounded-2xl p-4 border border-app-border shadow-sm">
          <p className="text-app-muted text-xs uppercase tracking-wide mb-1">
            Últimas 4 semanas
          </p>
          <p className="text-app-subtle text-xs mb-3">
            Cada quadrado = 1 dia do desafio
          </p>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekLabels.map((label, i) => (
              <div key={i} className="text-center text-[9px] text-app-subtle font-medium">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ dayNum, isPast, isToday, isFuture }) => (
              <div
                key={dayNum}
                className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold ${
                  isToday
                    ? 'ring-2 ring-accent-blue ring-offset-1 ring-offset-surface bg-accent-blue/40 text-white'
                    : isPast
                      ? 'bg-accent-blue/70 text-white/80'
                      : isFuture
                        ? 'bg-app-track text-app-subtle'
                        : ''
                }`}
              >
                {isPast || isToday ? dayNum : ''}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-app-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-accent-blue/70" />
              Dia cumprido
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm ring-2 ring-accent-blue bg-accent-blue/40" />
              Hoje
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-app-track" />
              Futuro
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
