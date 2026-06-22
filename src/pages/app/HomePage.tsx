import { useState, useRef } from 'react'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { ProgressBanner } from '../../components/ui/ProgressBanner'
import { ChallengeLevelCard } from '../../components/ui/ChallengeLevelCard'
import { ChallengePreviewModal } from '../../components/ui/ChallengePreviewModal'
import { ChallengeConfirmModal } from '../../components/ui/ChallengeConfirmModal'
import { DailyTasksPanel } from '../../components/app/DailyTasksPanel'
import { Button } from '../../components/ui/Button'
import { formatPreferredName } from '../../lib/displayName'
import {
  CHALLENGE_LIST,
  CHALLENGES,
  useAppStore,
  type ChallengeId,
} from '../../store/useAppStore'
import { LEVEL_META } from '../../components/ui/ChallengeLevelCard'

type ConfirmState =
  | { type: 'accept'; challengeId: ChallengeId }
  | { type: 'quit'; challengeId: ChallengeId }
  | null

export function HomePage() {
  const tasksRef = useRef<HTMLDivElement>(null)
  const {
    name,
    challengeAccepted,
    challengeId,
    currentDay,
    recommendedChallenge,
    acceptChallenge,
    quitChallenge,
  } = useAppStore()
  const [previewId, setPreviewId] = useState<ChallengeId | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  const openPreview = (id: ChallengeId) => setPreviewId(id)

  const proceedToAccept = () => {
    if (!previewId) return
    const id = previewId
    setPreviewId(null)
    setConfirm({ type: 'accept', challengeId: id })
  }

  const requestQuit = () => {
    if (challengeId) setConfirm({ type: 'quit', challengeId })
  }

  const handleConfirmAccept = () => {
    if (confirm?.type !== 'accept') return
    acceptChallenge(confirm.challengeId)
    setConfirm(null)
    setTimeout(() => {
      tasksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  const handleConfirmQuit = () => {
    quitChallenge()
    setConfirm(null)
  }

  const activeChallenge = challengeId ? CHALLENGES[challengeId] : null
  const displayName = name?.trim() ? formatPreferredName(name) : undefined

  return (
    <AppShell>
      <AppHeader />
      <ProgressBanner />

      {!challengeAccepted ? (
        <>
          <div className="px-5 mb-6 shrink-0">
            <h1 className="text-xl font-bold mb-2">Escolha seu nível</h1>
            <p className="text-neutral-500 text-sm leading-relaxed">
              90 dias de disciplina — entre na jornada que combina com você
            </p>
          </div>

          <div className="px-5 flex flex-col gap-6 pb-8">
            {CHALLENGE_LIST.map((c) => (
              <ChallengeLevelCard
                key={c.id}
                challenge={c}
                isActive={false}
                isDisabled={false}
                isRecommended={recommendedChallenge === c.id}
                onStartLevel={() => openPreview(c.id)}
                onQuit={requestQuit}
              />
            ))}
          </div>

          {name && (
            <p className="text-center text-neutral-500 text-sm pb-6 px-5 -mt-2">
              {displayName}, o momento de agir é agora
            </p>
          )}
        </>
      ) : (
        <div className="px-5 pb-6 pt-1">
          {activeChallenge && challengeId && (
            <div className="relative rounded-3xl overflow-hidden mb-4 border border-accent-blue/30">
              <div className="relative aspect-[21/9] max-h-[140px] w-full">
                <img
                  src={activeChallenge.image}
                  alt={LEVEL_META[challengeId].label}
                  className={`absolute inset-0 w-full h-full object-cover ${LEVEL_META[challengeId].imagePosition}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 px-4 flex items-center justify-between">
                  <div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${activeChallenge.badgeColor}`}
                    >
                      {activeChallenge.badge}
                    </span>
                    <p className="font-bold text-base mt-1.5 drop-shadow-md">
                      {LEVEL_META[challengeId].label}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    className="!w-auto !py-2 !px-4 !text-xs shrink-0"
                    onClick={requestQuit}
                  >
                    Desistir
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div ref={tasksRef} id="tarefas-hoje">
            <DailyTasksPanel />
          </div>
        </div>
      )}

      {previewId && (
        <ChallengePreviewModal
          challengeId={previewId}
          onAccept={proceedToAccept}
          onClose={() => setPreviewId(null)}
        />
      )}

      {confirm?.type === 'accept' && (
        <ChallengeConfirmModal
          type="accept"
          challengeId={confirm.challengeId}
          userName={displayName}
          onConfirm={handleConfirmAccept}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm?.type === 'quit' && (
        <ChallengeConfirmModal
          type="quit"
          challengeId={confirm.challengeId}
          currentDay={currentDay}
          onConfirm={handleConfirmQuit}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AppShell>
  )
}
