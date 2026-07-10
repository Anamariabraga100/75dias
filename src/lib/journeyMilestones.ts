import { TOTAL_PROGRAM_DAYS } from './demoProgress'

export const CHALLENGE_JOURNEY_NODES = [
  { day: 1, emoji: '🌱', label: 'Início' },
  { day: 30, emoji: '💪', label: '1 mês' },
  { day: 60, emoji: '🔥', label: 'Metade' },
  { day: 90, emoji: '🏆', label: 'Reset' },
] as const

export type JourneyNode = (typeof CHALLENGE_JOURNEY_NODES)[number]

export function getChallengeJourneyProgress(displayDay: number) {
  const pct = Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100))
  const nextNode = CHALLENGE_JOURNEY_NODES.find((node) => node.day > displayDay) ?? null

  return {
    currentDay: displayDay,
    targetDay: TOTAL_PROGRAM_DAYS,
    pct,
    daysLeft: Math.max(0, TOTAL_PROGRAM_DAYS - displayDay),
    nextNode,
    nextNodeDaysLeft: nextNode ? nextNode.day - displayDay : 0,
  }
}

export function isJourneyNodeReached(displayDay: number, nodeDay: number): boolean {
  return displayDay >= nodeDay
}
