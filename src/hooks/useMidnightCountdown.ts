import { useEffect, useState } from 'react'
import { getDayUnlockStatus } from '../lib/dayUnlock'
import type { ChallengeId } from '../store/useAppStore'

type MidnightCountdownInput = {
  challengeAccepted: boolean
  challengeId: ChallengeId | null
  currentDay: number
  taskChecksByDay: Record<number, Record<string, boolean>>
  mirrorPhotos: Record<number, string>
  dayCompletedAt: string | null
  shieldedDays?: number[]
}

export function useMidnightCountdown(input: MidnightCountdownInput) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const status = getDayUnlockStatus({ ...input, now })

  return {
    ...status,
    showCountdown: status.dayComplete && !status.canAdvance && status.remainingMs > 0,
  }
}
