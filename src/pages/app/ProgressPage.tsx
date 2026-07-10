import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { EvolutionMirror } from '../../components/app/EvolutionMirror'
import { JourneyTimeline } from '../../components/app/progression/JourneyTimeline'
import { ProgressNextConquest } from '../../components/app/progress/ProgressNextConquest'
import { ProgressInvestidaCard } from '../../components/app/progress/ProgressInvestidaCard'
import { ProgressXpCard } from '../../components/app/progress/ProgressXpCard'
import { ProgressSummaryCard } from '../../components/app/progress/ProgressSummaryCard'
import { useAppStore } from '../../store/useAppStore'
import { getDisplayDay } from '../../lib/demoProgress'
import { computePeakStreak } from '../../lib/progressPage'

export function ProgressPage() {
  const location = useLocation()
  const {
    challengeAccepted,
    challengeId,
    currentDay,
    taskChecksByDay,
    mirrorPhotos,
    shieldedDays,
    totalXp,
    disciplineShields,
  } = useAppStore()

  const displayDay = getDisplayDay(challengeAccepted, currentDay)

  const recordDays =
    challengeId && challengeAccepted
      ? computePeakStreak(
          challengeId,
          displayDay,
          taskChecksByDay,
          mirrorPhotos,
          shieldedDays
        )
      : 1

  useEffect(() => {
    if (location.hash === '#evolucao' && challengeAccepted && challengeId === 'implacavel') {
      setTimeout(() => {
        document.getElementById('evolucao')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [location.hash, challengeAccepted, challengeId])

  return (
    <AppShell>
      <AppHeader />
      <div className="px-4 pt-2 pb-6 space-y-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-app-fg">Seu progresso</h1>
        </div>

        {challengeAccepted ? (
          <>
            <JourneyTimeline challengeId={challengeId} displayDay={displayDay} />

            <ProgressNextConquest displayDay={displayDay} />

            <ProgressInvestidaCard investidaDays={displayDay} recordDays={recordDays} />

            <ProgressXpCard totalXp={totalXp} disciplineShields={disciplineShields} />

            <ProgressSummaryCard displayDay={displayDay} challengeId={challengeId} />

            <div id="evolucao">
              <EvolutionMirror displayDay={displayDay} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-center">
            <p className="text-neutral-400 text-sm">
              Aceite um desafio na aba Início para acompanhar sua jornada.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
