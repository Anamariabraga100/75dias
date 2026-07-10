import { useEffect, useState } from 'react'
import { useAppStore } from '../../../store/useAppStore'
import { getPendingUnlockModal } from '../../../lib/progressionTiers'
import { TierUnlockModal } from './TierUnlockModal'
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
    evolveToTier,
    markTierUnlockSeen,
    mirrorPhotos,
    taskChecksByDay,
    challengeAccepted,
  } = useAppStore()

  const [unlockKind, setUnlockKind] = useState<'30' | '60' | null>(null)
  const [showComplete, setShowComplete] = useState(false)

  const completedDays = countCompletedDays(
    challengeId as 'iniciante' | 'intermediario' | 'implacavel',
    displayDay,
    taskChecksByDay,
    mirrorPhotos
  )

  useEffect(() => {
    const pending = getPendingUnlockModal(programDay, allDone, seenTierUnlockModals)
    if (pending === '30' || pending === '60') {
      setUnlockKind(pending)
    } else if (pending === '90') {
      setShowComplete(true)
    }
  }, [programDay, allDone, seenTierUnlockModals])

  const handleEvolve = () => {
    if (!unlockKind) return
    const target = unlockKind === '30' ? 'intermediario' : 'implacavel'
    evolveToTier(target)
    markTierUnlockSeen(`unlock-${unlockKind}`)
    setUnlockKind(null)
  }

  const handleStay = () => {
    if (!unlockKind) return
    markTierUnlockSeen(`unlock-${unlockKind}`)
    setUnlockKind(null)
  }

  const handleCompleteClose = () => {
    markTierUnlockSeen('unlock-90')
    setShowComplete(false)
  }

  if (!challengeAccepted) return null

  return (
    <>
      {unlockKind && (
        <TierUnlockModal kind={unlockKind} onEvolve={handleEvolve} onStay={handleStay} />
      )}
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
