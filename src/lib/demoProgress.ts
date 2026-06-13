/** Dia usado nos exemplos antes de aceitar o desafio (alinhado ao streak do header). */
export const DEMO_DAY = 1

export const TOTAL_PROGRAM_DAYS = 90

/** Garante dia do programa entre 1 e 90 — nunca 0. */
export function normalizeProgramDay(day: number): number {
  if (!Number.isFinite(day)) return 1
  return Math.min(TOTAL_PROGRAM_DAYS, Math.max(1, Math.round(day)))
}

export function getDisplayDay(challengeAccepted: boolean, currentDay: number): number {
  return challengeAccepted ? normalizeProgramDay(currentDay) : DEMO_DAY
}
