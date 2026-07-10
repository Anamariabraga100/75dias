import { useState, useRef } from 'react'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { ChallengePreviewModal } from '../../components/ui/ChallengePreviewModal'
import { ActiveChallengeHome } from '../../components/app/home/ActiveChallengeHome'
import { ChallengeDifficultyPicker } from '../../components/app/progression/ChallengeDifficultyPicker'
import {
  useAppStore,
  type ChallengeId,
} from '../../store/useAppStore'

export function HomePage() {
  const tasksRef = useRef<HTMLDivElement>(null)
  const { challengeAccepted, acceptChallenge } = useAppStore()
  const [previewId, setPreviewId] = useState<ChallengeId | null>(null)

  const openPreview = (id: ChallengeId) => {
    setPreviewId(id)
  }

  const proceedToAccept = () => {
    if (!previewId) return
    acceptChallenge(previewId)
    setPreviewId(null)
    setTimeout(() => {
      tasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  return (
    <AppShell>
      <AppHeader />

      {!challengeAccepted ? (
        <>
          <div className="px-5 mt-5 mb-1 shrink-0">
            <h1 className="text-2xl font-black tracking-tight">Sua Jornada</h1>
            <p className="text-neutral-500 text-sm mt-1">Escolha sua dificuldade para os 90 dias</p>
          </div>

          <ChallengeDifficultyPicker onSelect={openPreview} />
        </>
      ) : (
        <div ref={tasksRef}>
          <ActiveChallengeHome />
        </div>
      )}

      {previewId && (
        <ChallengePreviewModal
          challengeId={previewId}
          onAccept={proceedToAccept}
          onClose={() => setPreviewId(null)}
        />
      )}
    </AppShell>
  )
}
