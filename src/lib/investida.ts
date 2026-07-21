/** Investida estilo Duolingo — sequência por dia civil (fuso local). */

export type InvestidaNotice =
  | { type: 'broken'; previousStreak: number }
  | { type: 'shield_saved'; streak: number; shieldsUsed: number }

export type InvestidaStateSlice = {
  challengeAccepted: boolean
  currentDay: number
  investidaStreak: number
  lastInvestidaDate: string | null
  disciplineShields: number
  programDayStartedAt: string | null
  dayCompletedAt: string | null
  investidaNotice: InvestidaNotice | null
}

/** YYYY-MM-DD no fuso local. */
export function toLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseLocalDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

/** Dias civis entre duas chaves (positiva se `to` é depois de `from`). */
export function calendarDaysBetween(fromKey: string, toKey: string): number {
  const from = parseLocalDateKey(fromKey)
  const to = parseLocalDateKey(toKey)
  if (!from || !to) return 0
  const ms = to.getTime() - from.getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}

export function shiftLocalDateKey(key: string, deltaDays: number): string {
  const date = parseLocalDateKey(key)
  if (!date) return key
  date.setDate(date.getDate() + deltaDays)
  return toLocalDateKey(date)
}

/**
 * Ao abrir o app: se faltou 1+ dia civil sem atividade, o escudo ativa sozinho
 * (consome 1 por dia perdido). Se não houver escudo suficiente → quebra hardcore.
 */
export function evaluateInvestidaOnOpen(
  state: InvestidaStateSlice,
  now: Date = new Date()
): {
  patch: Partial<InvestidaStateSlice> & { investidaNotice: InvestidaNotice | null }
  changed: boolean
  /** Quebrou a sequência — progresso do programa deve voltar ao Dia 1 (XP permanece). */
  hardResetProgram: boolean
} {
  const empty = {
    patch: { investidaNotice: state.investidaNotice },
    changed: false,
    hardResetProgram: false,
  }

  if (!state.challengeAccepted) return empty

  const today = toLocalDateKey(now)
  let last = state.lastInvestidaDate

  // Migração: se nunca teve lastInvestidaDate, usa último progresso conhecido
  if (!last) {
    const fallbackIso = state.dayCompletedAt ?? state.programDayStartedAt
    if (fallbackIso) {
      const fallbackDate = new Date(fallbackIso)
      if (!Number.isNaN(fallbackDate.getTime())) {
        last = toLocalDateKey(fallbackDate)
      }
    }
  }

  if (!last) return empty

  const gap = calendarDaysBetween(last, today)

  // Hoje ou ontem: ainda no prazo (como Duolingo até o fim do dia / meia-noite)
  if (gap <= 1) {
    // Só migra lastInvestidaDate — NÃO inventa streak a partir do dia do programa
    // (isso fazia o progresso “pular” e investida subir sem completar).
    if (last !== state.lastInvestidaDate) {
      return {
        patch: {
          lastInvestidaDate: last,
          investidaNotice: state.investidaNotice,
        },
        changed: true,
        hardResetProgram: false,
      }
    }
    return empty
  }

  // gap >= 2 → faltou pelo menos 1 dia inteiro
  const missedDays = gap - 1
  const available = Math.max(0, state.disciplineShields)

  // Só consome escudos se der para cobrir todos os dias perdidos
  if (available >= missedDays) {
    const streak = Math.max(state.investidaStreak, 1)
    return {
      patch: {
        disciplineShields: available - missedDays,
        investidaStreak: streak,
        lastInvestidaDate: shiftLocalDateKey(today, -1),
        investidaNotice: {
          type: 'shield_saved',
          streak,
          shieldsUsed: missedDays,
        },
      },
      changed: true,
      hardResetProgram: false,
    }
  }

  // Sem escudo suficiente — quebra (não gasta escudos à toa)
  const previousStreak = Math.max(state.investidaStreak, 1)
  return {
    patch: {
      investidaStreak: 0,
      lastInvestidaDate: null,
      investidaNotice: {
        type: 'broken',
        previousStreak,
      },
    },
    changed: true,
    hardResetProgram: true,
  }
}

/** Campos de progresso do programa a zerar na quebra (XP / escudos / ciência ficam). */
export function getHardcoreProgramResetPatch(now: Date = new Date()) {
  return {
    currentDay: 1,
    dayCompletedAt: null as string | null,
    programDayStartedAt: now.toISOString(),
    taskChecksByDay: {} as Record<number, Record<string, boolean>>,
    mirrorPhotos: {} as Record<number, string>,
    shieldedDays: [] as number[],
    lastShieldUsedDay: null as number | null,
    seenTierUnlockModals: [] as string[],
  }
}

/** Ao completar hábitos / usar escudo no dia: conta +1 investida no dia civil. */
export function applyInvestidaForToday(
  state: Pick<InvestidaStateSlice, 'investidaStreak' | 'lastInvestidaDate'>,
  now: Date = new Date()
): Pick<InvestidaStateSlice, 'investidaStreak' | 'lastInvestidaDate'> {
  const today = toLocalDateKey(now)
  const last = state.lastInvestidaDate

  if (last === today) {
    return {
      investidaStreak: Math.max(state.investidaStreak, 1),
      lastInvestidaDate: today,
    }
  }

  const yesterday = shiftLocalDateKey(today, -1)
  if (last === yesterday) {
    return {
      investidaStreak: Math.max(state.investidaStreak, 0) + 1,
      lastInvestidaDate: today,
    }
  }

  // Nova sequência (ou primeiro dia após quebra)
  return {
    investidaStreak: 1,
    lastInvestidaDate: today,
  }
}
