import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Flag, LogOut, Settings, AlertTriangle } from 'lucide-react'
import { formatPreferredName } from '../../lib/displayName'
import { useAppStore } from '../../store/useAppStore'
import { LEVEL_META } from '../ui/ChallengeLevelCard'
import { ChallengeConfirmModal } from '../ui/ChallengeConfirmModal'
import { getDisplayDay, TOTAL_PROGRAM_DAYS } from '../../lib/demoProgress'
import { HeaderDropdown } from '../ui/HeaderDropdown'
import { UserAvatar } from '../ui/UserAvatar'
import { SettingsSheet } from './SettingsSheet'
import { SubscriptionPlanCard } from './SubscriptionPlanCard'
import { signOut } from '../../lib/auth'
import { refreshSubscriptionStatus } from '../../lib/subscriptionSync'
import { hasActiveAccess } from '../../lib/subscription'
import type { RefObject } from 'react'

type ProfileDropdownProps = {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
}

export function ProfileDropdown({ anchorRef, open, onClose }: ProfileDropdownProps) {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [quitConfirmOpen, setQuitConfirmOpen] = useState(false)
  const {
    name,
    email,
    avatarUrl,
    challengeAccepted,
    challengeId,
    currentDay,
    investidaStreak,
    paymentComplete,
    subscriptionStatus,
    quitChallenge,
    evolveToTier,
  } = useAppStore()

  const displayName = formatPreferredName(name)
  const levelLabel = challengeId ? LEVEL_META[challengeId].label : 'Sem desafio ativo'
  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const hasSubscription = hasActiveAccess(subscriptionStatus, paymentComplete)
  const displayEmail =
    email || (name ? `${name.toLowerCase().replace(/\s+/g, '')}@reset90.app` : 'membro@reset90.app')

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/', { replace: true })
  }

  const openSettings = () => {
    onClose()
    setSettingsOpen(true)
  }

  const requestQuit = () => {
    onClose()
    setQuitConfirmOpen(true)
  }

  const handleConfirmQuit = () => {
    quitChallenge()
    setQuitConfirmOpen(false)
    navigate('/app', { replace: true })
  }

  const handleDowngradeToBasic = () => {
    evolveToTier('iniciante')
    setQuitConfirmOpen(false)
    navigate('/app', { replace: true })
  }

  useEffect(() => {
    if (!open || !hasSubscription) return
    void refreshSubscriptionStatus()
  }, [open, hasSubscription])

  const items = [
    {
      icon: BarChart2,
      label: 'Meu progresso',
      onClick: () => go('/app/progresso'),
    },
    {
      icon: Flag,
      label: challengeAccepted ? `Desafio · ${levelLabel}` : 'Escolher desafio',
      onClick: () => go('/app'),
    },
    {
      icon: Settings,
      label: 'Configurações',
      onClick: openSettings,
    },
  ]

  return (
    <>
      <HeaderDropdown anchorRef={anchorRef} open={open} onClose={onClose} width={280}>
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-3">
          <UserAvatar name={name} avatarUrl={avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{displayName}</p>
            <p className="text-neutral-500 text-xs truncate">{displayEmail}</p>
          </div>
        </div>

        <div className="px-4 py-2.5 border-b border-neutral-800">
          <div className="bg-neutral-900/60 rounded-lg py-2 px-3 text-center">
            <p className="text-[10px] text-neutral-500">Dia do programa</p>
            <p className="font-bold text-sm">
              {displayDay}
              <span className="text-neutral-500 font-medium">/{TOTAL_PROGRAM_DAYS}</span>
            </p>
          </div>
        </div>

        {hasSubscription && <SubscriptionPlanCard variant="compact" />}

        <div className="py-1">
          {items.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-900/60 text-neutral-200"
            >
              <Icon size={16} className="shrink-0 text-neutral-400" />
              {label}
            </button>
          ))}
        </div>

        <div className="border-t border-neutral-800 py-1">
          {challengeAccepted && challengeId && (
            <button
              type="button"
              onClick={requestQuit}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400/90 hover:bg-red-950/30 transition-colors"
            >
              <AlertTriangle size={16} className="shrink-0" />
              Desistir do desafio
            </button>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400/90 hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            Sair
          </button>
        </div>
      </HeaderDropdown>

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}

      {quitConfirmOpen && challengeId && (
        <ChallengeConfirmModal
          type="quit"
          challengeId={challengeId}
          currentDay={currentDay}
          investidaStreak={investidaStreak}
          userName={displayName}
          onConfirm={handleConfirmQuit}
          onDowngradeToBasic={handleDowngradeToBasic}
          onCancel={() => setQuitConfirmOpen(false)}
        />
      )}
    </>
  )
}
