import type { ChallengeId } from '../store/useAppStore'
import { TOTAL_PROGRAM_DAYS } from './demoProgress'
import { isDayComplete } from './streak'

export const JOURNEY_MILESTONES = [
  { day: 1, label: 'Início' },
  { day: 15, label: 'Hábito criado' },
  { day: 30, label: 'Nova identidade' },
  { day: 60, label: 'Consistência inabalável' },
  { day: 90, label: 'Reset concluído' },
] as const

export const ACHIEVEMENT_DEFS = [
  {
    id: 'day-1',
    days: 1,
    kind: 'streak' as const,
    emoji: '🏅',
    title: 'Primeiro passo',
    description: 'Complete seu primeiro dia de investida',
  },
  {
    id: 'day-5',
    days: 5,
    kind: 'streak' as const,
    emoji: '🎯',
    title: 'Foco ativado',
    description: 'Mantenha 5 dias de investida seguidos',
  },
  {
    id: 'day-15',
    days: 15,
    kind: 'streak' as const,
    emoji: '🧠',
    title: 'Mentalidade forte',
    description: 'Mantenha 15 dias de investida seguidos',
  },
  {
    id: 'day-30',
    days: 30,
    kind: 'streak' as const,
    emoji: '⚡',
    title: '1 mês de disciplina',
    description: 'Mantenha 30 dias de investida seguidos',
  },
  {
    id: 'day-60',
    days: 60,
    kind: 'streak' as const,
    emoji: '🔥',
    title: 'Metade do caminho',
    description: 'Mantenha 60 dias de investida seguidos',
  },
  {
    id: 'day-90',
    days: 90,
    kind: 'journey' as const,
    emoji: '🏆',
    title: 'Reset completo',
    description: 'Conclua os 90 dias do programa',
  },
] as const

export type AchievementDef = (typeof ACHIEVEMENT_DEFS)[number]

export type AchievementStatus = AchievementDef & {
  unlocked: boolean
  progress: number
}

export interface ConsistencyBar {
  day: number
  complete: boolean
  isToday: boolean
  isFuture: boolean
}

const GREETING_COMPLETE = [
  'Excelente',
  'Imparável',
  'Brilhante',
  'Invencível',
  'Fenomenal',
] as const

const GREETING_ACTIVE = ['Bora', 'Foco', 'Vamos', 'Hora de', 'Pronto'] as const

const MOTIVATION_COMPLETE = [
  'Você está construindo a sua melhor versão.',
  'Mais um dia vencido. A consistência transforma.',
  'Disciplina silenciosa. Resultado inevitável.',
] as const

const MOTIVATION_ACTIVE = [
  'Disciplina hoje, liberdade para sempre.',
  'Seus hábitos de hoje definem quem você será amanhã.',
  'Um passo de cada vez. Complete o dia de hoje.',
] as const

export function getGreeting(name: string, dayComplete: boolean): string {
  const pool = dayComplete ? GREETING_COMPLETE : GREETING_ACTIVE
  const word = pool[(name.length + (dayComplete ? 1 : 0)) % pool.length]
  return `${word}, ${name}! 🔥`
}

export function getMotivationSubtitle(dayComplete: boolean, programDay: number): string {
  const pool = dayComplete ? MOTIVATION_COMPLETE : MOTIVATION_ACTIVE
  return pool[(programDay - 1) % pool.length]
}

export function countCompletedDays(
  challengeId: ChallengeId,
  displayDay: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>
): number {
  let count = 0
  for (let day = 1; day <= displayDay; day++) {
    if (isDayComplete(challengeId, day, taskChecksByDay, mirrorPhotos)) count++
  }
  return count
}

export function getCompletionRate(completedDays: number, displayDay: number): number {
  if (displayDay <= 0) return 0
  return Math.min(100, Math.round((completedDays / displayDay) * 100))
}

export function estimateTimeInvested(completedDays: number): string {
  const totalMinutes = completedDays * 52
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

/**
 * Conquistas de "dias seguidos" usam a investida (calendário).
 * A de 90 dias usa o progresso do programa.
 * Se a investida zerar, o progresso das conquistas de sequência também zera.
 */
export function getAchievementStatuses(
  investidaStreak: number,
  displayDay: number
): AchievementStatus[] {
  const streakProgress = Math.max(0, investidaStreak)
  const journeyProgress = Math.max(0, displayDay)

  return ACHIEVEMENT_DEFS.map((achievement) => {
    const progressRaw =
      achievement.kind === 'streak' ? streakProgress : journeyProgress
    const progress = Math.min(progressRaw, achievement.days)
    const unlocked = progressRaw >= achievement.days

    return {
      ...achievement,
      unlocked,
      progress,
    }
  })
}

export function countUnlockedAchievements(statuses: AchievementStatus[]): number {
  return statuses.filter((a) => a.unlocked).length
}

export function getConsistencyBars(
  challengeId: ChallengeId,
  displayDay: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  windowSize = 10
): ConsistencyBar[] {
  const end = Math.max(windowSize, displayDay)
  const start = Math.max(1, end - windowSize + 1)
  const bars: ConsistencyBar[] = []

  for (let day = start; day <= end; day++) {
    const isFuture = day > displayDay
    const isToday = day === displayDay
    const complete =
      !isFuture && isDayComplete(challengeId, day, taskChecksByDay, mirrorPhotos)

    bars.push({ day, complete, isToday, isFuture })
  }

  return bars
}

export function getNextAchievement(achievements: AchievementStatus[]): AchievementStatus | null {
  return achievements.find((a) => !a.unlocked) ?? null
}

export function getJourneyPercent(displayDay: number): number {
  return Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100))
}

export function getActiveMilestoneIndex(displayDay: number): number {
  let index = 0
  for (let i = 0; i < JOURNEY_MILESTONES.length; i++) {
    if (displayDay >= JOURNEY_MILESTONES[i].day) index = i
  }
  return index
}
