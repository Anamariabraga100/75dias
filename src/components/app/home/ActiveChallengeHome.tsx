import { useEffect, useRef } from 'react'
import { useAppStore } from '../../../store/useAppStore'
import { formatPreferredName } from '../../../lib/displayName'
import { getDisplayDay, normalizeProgramDay } from '../../../lib/demoProgress'
import { useMidnightCountdown } from '../../../hooks/useMidnightCountdown'
import {
  getAchievementStatuses,
  getMotivationSubtitle,
  getNextAchievement,
} from '../../../lib/homeMetrics'
import { DailyTasksPanel } from '../DailyTasksPanel'
import { DayCompleteCelebration } from './DayCompleteCelebration'
import { HomeCinematicHero } from './HomeCinematicHero'
import { HomeBookRecommendations } from './HomeBookRecommendations'
import { HomeDailyMission } from './HomeDailyMission'
import { HomeNextAchievement } from './HomeNextAchievement'
import { HomeMotivationFooter } from './HomeMotivationFooter'
import { HomeScienceInsights } from './HomeScienceInsights'
import { canApplyShield } from '../../../lib/rewards'
import { HomeLevelProgress } from '../progression/HomeLevelProgress'
import { TierUnlockWatcher } from '../progression/TierUnlockWatcher'

export function ActiveChallengeHome() {
  const tasksRef = useRef<HTMLDivElement>(null)
  const {
    name,
    challengeId,
    challengeAccepted,
    currentDay,
    mirrorPhotos,
    taskChecksByDay,
    dayCompletedAt,
    advanceProgramDay,
    shieldedDays,
    disciplineShields,
    lastShieldUsedDay,
    applyDisciplineShield,
    investidaStreak,
  } = useAppStore()

  const programDay = normalizeProgramDay(currentDay)
  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const displayName = formatPreferredName(name)

  const allDone = Boolean(dayCompletedAt)

  const dayUnlock = useMidnightCountdown({
    challengeAccepted,
    challengeId,
    currentDay,
    taskChecksByDay,
    mirrorPhotos,
    dayCompletedAt,
    shieldedDays,
  })

  const achievements = getAchievementStatuses(investidaStreak, displayDay)
  const nextAchievement = getNextAchievement(achievements)
  const streakDays = investidaStreak

  const canUseShield =
    Boolean(challengeId) &&
    !allDone &&
    canApplyShield(programDay, shieldedDays, lastShieldUsedDay, disciplineShields)

  // Novo dia libera sozinho — sem clicar em "Iniciar".
  useEffect(() => {
    if (!challengeId || !dayUnlock.canAdvance) return
    advanceProgramDay()
  }, [challengeId, dayUnlock.canAdvance, advanceProgramDay])

  if (!challengeId) return null

  return (
    <div className="home-dashboard">
      <DayCompleteCelebration allDone={allDone} programDay={programDay} />

      <HomeCinematicHero
        displayName={displayName}
        dayComplete={allDone}
        subtitle={getMotivationSubtitle(allDone, programDay)}
        displayDay={displayDay}
        streakDays={streakDays}
        challengeId={challengeId}
      />

      <section ref={tasksRef} id="tarefas-hoje" className="home-section scroll-mt-4">
        <DailyTasksPanel mission />
      </section>

      <HomeDailyMission
        programDay={programDay}
        allDone={allDone}
        remainingMs={dayUnlock.remainingMs}
        showCountdown={dayUnlock.showCountdown}
        canUseShield={canUseShield}
        disciplineShields={disciplineShields}
        isShielded={shieldedDays.includes(programDay)}
        onUseShield={() => applyDisciplineShield(programDay)}
        onForceAdvance={() => advanceProgramDay(true)}
      />

      <HomeLevelProgress challengeId={challengeId} displayDay={displayDay} />

      <HomeNextAchievement next={nextAchievement} />

      <HomeBookRecommendations />

      <HomeScienceInsights displayDay={displayDay} />

      <HomeMotivationFooter challengeId={challengeId} programDay={programDay} />

      <TierUnlockWatcher
        programDay={programDay}
        displayDay={displayDay}
        allDone={allDone}
        challengeId={challengeId}
      />
    </div>
  )
}
