import type { ChallengeId } from '../store/useAppStore'
import { computeConsecutiveStreak } from './streak'

export const PROGRESS_CONQUESTS = [
  { day: 7, emoji: '🌱', title: 'Primeira semana', hint: 'sua primeira grande vitória' },
  { day: 15, emoji: '🎯', title: 'Hábito criado', hint: 'disciplina virando rotina' },
  { day: 30, emoji: '💪', title: 'Nível Dominante', hint: 'novo nível desbloqueado' },
  { day: 60, emoji: '🔥', title: 'Nível Implacável', hint: 'o nível máximo' },
  { day: 90, emoji: '🏆', title: 'Reset90 completo', hint: 'você venceu' },
] as const

export type ProgressConquest = (typeof PROGRESS_CONQUESTS)[number]

export function getNextConquest(displayDay: number): ProgressConquest | null {
  return PROGRESS_CONQUESTS.find((c) => c.day > displayDay) ?? null
}

export function getConquestMotivation(displayDay: number, next: ProgressConquest): string {
  const left = next.day - displayDay
  if (next.day === 7) {
    return `🔥 Você já venceu ${displayDay} dia${displayDay !== 1 ? 's' : ''}. Faltam apenas ${left} para completar sua primeira semana.`
  }
  if (left === 1) {
    return `Falta apenas 1 dia para: ${next.title}. Não pare agora.`
  }
  return `Faltam ${left} dias para ${next.hint}. Continue no ritmo.`
}

export function getPacePrediction(displayDay: number, targetDay: number): string | null {
  if (displayDay >= targetDay) return null
  const daysLeft = targetDay - displayDay
  return `Mantendo o ritmo atual, você chega ao Dia ${targetDay} em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}.`
}

export function computePeakStreak(
  challengeId: ChallengeId,
  displayDay: number,
  taskChecksByDay: Record<number, Record<string, boolean>>,
  mirrorPhotos: Record<number, string>,
  shieldedDays: number[] = []
): number {
  let peak = 0
  for (let day = 1; day <= displayDay; day++) {
    peak = Math.max(
      peak,
      computeConsecutiveStreak(
        challengeId,
        day,
        taskChecksByDay,
        mirrorPhotos,
        shieldedDays
      )
    )
  }
  return Math.max(peak, 1)
}
