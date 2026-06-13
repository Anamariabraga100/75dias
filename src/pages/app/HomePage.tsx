import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../components/layout/AppHeader'
import { AppShell } from '../../components/layout/AppShell'
import { ProgressBanner } from '../../components/ui/ProgressBanner'
import { ChallengeLevelCard } from '../../components/ui/ChallengeLevelCard'
import { ChallengePreviewModal } from '../../components/ui/ChallengePreviewModal'
import { ChallengeConfirmModal } from '../../components/ui/ChallengeConfirmModal'
import { DailyTasksPanel } from '../../components/app/DailyTasksPanel'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
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
  const navigate = useNavigate()
  const tasksRef = useRef<HTMLDivElement>(null)
  const {
    name,
    onboardingComplete,
    challengeAccepted,
    challengeId,
    currentDay,
    recommendedChallenge,
    acceptChallenge,
    quitChallenge,
  } = useAppStore()
  const [previewId, setPreviewId] = useState<ChallengeId | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState>(null)

  if (!onboardingComplete) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <Logo size="lg" />
          <p className="text-neutral-400 mt-4 mb-6">
            Complete o onboarding para começar seu Reset90
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black font-bold px-8 py-3 rounded-2xl"
          >
            Começar
          </button>
        </div>
      </div>
    )
  }

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
  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : undefined

  return (
    <AppShell>
      <AppHeader />
      <ProgressBanner />

      {!challengeAccepted ? (
        <>
          <div className="px-4 mb-2 shrink-0">
            <h1 className="text-lg font-bold">Escolha seu nível</h1>
            <p className="text-neutral-500 text-xs">
              90 dias de disciplina — entre na jornada que combina com você
            </p>
          </div>

          <div className="px-4 flex flex-col gap-2 pb-2">
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
            <p className="text-center text-neutral-600 text-xs pb-2">
              {name}, o momento de agir é agora
            </p>
          )}
        </>
      ) : (
        <div className="px-4 pb-4">
          {activeChallenge && challengeId && (
            <div className="relative rounded-2xl overflow-hidden mb-4 border border-accent-blue/30">
              <div className="relative h-16">
                <img
                  src={activeChallenge.image}
                  alt={LEVEL_META[challengeId].label}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60" />
                <div className="absolute inset-0 px-3 flex items-center justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${activeChallenge.badgeColor}`}
                    >
                      {activeChallenge.badge}
                    </span>
                    <p className="font-bold text-sm mt-1">{LEVEL_META[challengeId].label}</p>
                  </div>
                  <Button
                    variant="danger"
                    className="!w-auto !py-2 !px-4 !text-xs"
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
