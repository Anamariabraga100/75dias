import { useEffect, useState } from 'react'
import { useAppStore } from '../../../store/useAppStore'
import { Reset90CompleteModal } from './Reset90CompleteModal'
import { formatPreferredName } from '../../../lib/displayName'
import { countCompletedDays } from '../../../lib/homeMetrics'

type TierUnlockWatcherProps = {
  programDay: number
  displayDay: number
  allDone: boolean
  challengeId: string
}

export function TierUnlockWatcher({
  programDay,
  displayDay,
  allDone,
  challengeId,
}: TierUnlockWatcherProps) {
  const {
    name,
    seenTierUnlockModals,
    markTierUnlockSeen,
    mirrorPhotos,
    taskChecksByDay,
    challengeAccepted,
  } = useAppStore()

  const [showComplete, setShowComplete] = useState(false)

  const completedDays = countCompletedDays(
    challengeId as 'iniciante' | 'intermediario' | 'implacavel',
    displayDay,
    taskChecksByDay,
    mirrorPhotos
  )

  useEffect(() => {
    if (
      programDay === 90 &&
      allDone &&
      !seenTierUnlockModals.includes('unlock-90')
    ) {
      setShowComplete(true)
    }
  }, [programDay, allDone, seenTierUnlockModals])

  const handleCompleteClose = () => {
    markTierUnlockSeen('unlock-90')
    setShowComplete(false)
  }

  if (!challengeAccepted) return null

  return (
    <>
      {showComplete && (
        <Reset90CompleteModal
          displayName={formatPreferredName(name)}
          completedDays={completedDays}
          onClose={handleCompleteClose}
        />
      )}
    </>
  )
}
