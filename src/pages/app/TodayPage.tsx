import { Navigate } from 'react-router-dom'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { DailyTasksPanel } from '../../components/app/DailyTasksPanel'
import { useAppStore } from '../../store/useAppStore'
import { LEVEL_META } from '../../components/ui/ChallengeLevelCard'

export function TodayPage() {
  const { challengeAccepted, challengeId, currentDay } = useAppStore()

  if (!challengeAccepted || !challengeId) {
    return <Navigate to="/app" replace />
  }

  const meta = LEVEL_META[challengeId]

  return (
    <AppShell>
      <AppHeader />
      <div className="px-4 pt-2 pb-4">
        <div className="text-center mb-5">
          <p className="text-neutral-500 text-xs uppercase tracking-wide">{meta.label}</p>
          <p className="text-6xl font-black leading-none mt-1">{currentDay}</p>
          <p className="text-neutral-600 text-[10px] uppercase mt-1">dia do Reset90</p>
        </div>
        <DailyTasksPanel />
      </div>
    </AppShell>
  )
}
