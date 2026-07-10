import { useRef } from 'react'
import { CHALLENGES, useAppStore } from '../../../store/useAppStore'
import { formatPreferredName } from '../../../lib/displayName'
import { getDisplayDay, normalizeProgramDay } from '../../../lib/demoProgress'
import { useMidnightCountdown } from '../../../hooks/useMidnightCountdown'
import { isPhotoDay } from '../../../lib/photoSchedule'
import {
  getAchievementStatuses,
  getMotivationSubtitle,
  getNextAchievement,
} from '../../../lib/homeMetrics'
import { isDayComplete } from '../../../lib/streak'
import { DailyTasksPanel } from '../DailyTasksPanel'
import { HomeCinematicHero } from './HomeCinematicHero'
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
  } = useAppStore()

  if (!challengeId) return null

  const programDay = normalizeProgramDay(currentDay)
  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const displayName = formatPreferredName(name)
  const challenge = CHALLENGES[challengeId]
  const tasks = taskChecksByDay[programDay] ?? {}
  const checkTotal = challenge.tasks.filter((t) => t.type === 'check').length
  const completedCount = challenge.tasks.filter((t) => t.type === 'check' && tasks[t.id]).length
  const photoRequired = challengeId === 'implacavel' && isPhotoDay(programDay)
  const photoDone = !photoRequired || Boolean(mirrorPhotos[programDay])
  const allDone = isDayComplete(
    challengeId,
    programDay,
    taskChecksByDay,
    mirrorPhotos,
    shieldedDays
  )
  const missionTotal = checkTotal + (photoRequired ? 1 : 0)
  const missionDone = allDone
    ? missionTotal
    : completedCount + (photoRequired && photoDone ? 1 : 0)

  const dayUnlock = useMidnightCountdown({
    challengeAccepted,
    challengeId,
    currentDay,
    taskChecksByDay,
    mirrorPhotos,
    dayCompletedAt,
    shieldedDays,
  })

  const achievements = getAchievementStatuses(displayDay, allDone)
  const nextAchievement = getNextAchievement(achievements)
  const streakDays = displayDay

  const canUseShield =
    !allDone &&
    canApplyShield(programDay, shieldedDays, lastShieldUsedDay, disciplineShields)

  return (
    <div className="home-dashboard">
      <HomeCinematicHero
        displayName={displayName}
        dayComplete={allDone}
        subtitle={getMotivationSubtitle(allDone, programDay)}
        displayDay={displayDay}
        streakDays={streakDays}
        challengeId={challengeId}
      />

      <HomeLevelProgress challengeId={challengeId} displayDay={displayDay} />

      <HomeDailyMission
        programDay={programDay}
        missionDone={missionDone}
        missionTotal={missionTotal}
        allDone={allDone}
        canAdvance={dayUnlock.canAdvance}
        remainingMs={dayUnlock.remainingMs}
        canUseShield={canUseShield}
        disciplineShields={disciplineShields}
        isShielded={shieldedDays.includes(programDay)}
        onUseShield={() => applyDisciplineShield(programDay)}
        onStartNextDay={() => advanceProgramDay()}
        onForceAdvance={() => advanceProgramDay(true)}
      />

      <HomeNextAchievement next={nextAchievement} displayDay={displayDay} />

      <section ref={tasksRef} id="tarefas-hoje" className="home-section scroll-mt-4">
        <DailyTasksPanel mission />
      </section>

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
