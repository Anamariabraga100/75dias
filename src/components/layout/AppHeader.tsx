import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Bell, Shield, Zap } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import { useAppStore } from '../../store/useAppStore'
import { NotificationsDropdown } from '../app/NotificationsDropdown'
import { ProfileDropdown } from '../app/ProfileDropdown'
import { XpModal } from '../app/XpModal'
import { countUnreadNotifications } from '../../lib/notifications'
import { UserAvatar } from '../ui/UserAvatar'
import { getDisplayDay } from '../../lib/demoProgress'
import { formatXp } from '../../lib/xp'

function StreakModal({
  days,
  programDay,
  onClose,
}: {
  days: number
  programDay: number
  onClose: () => void
}) {
  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5">
        <div className="text-center mb-4">
          <span className="text-4xl">🔥</span>
          <p className="text-3xl font-black mt-2 tabular-nums">{days}</p>
          <p className="text-neutral-400 text-sm">dias de investida</p>
          <p className="text-neutral-600 text-xs mt-1">Dia {programDay} do programa</p>
        </div>
        <p className="text-neutral-300 text-sm leading-relaxed text-center mb-5">
          {days === 0
            ? 'Sua investida está em zero. Complete os hábitos de hoje para começar uma nova sequência — estilo Duolingo.'
            : days === 1
              ? 'Primeiro dia da sequência. Volte amanhã e marque de novo para não quebrar.'
              : days >= 7
                ? `${days} dias seguidos sem falhar. Disciplina não é motivação: é repetir mesmo nos dias difíceis.`
                : `${days} dias seguidos de disciplina. Continue aparecendo — consistência silenciosa transforma.`}
        </p>
        <p className="text-neutral-500 text-xs text-center mb-5">
          Continue marcando seus hábitos na aba Início para manter a investida viva.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm"
        >
          Bora continuar
        </button>
      </BottomSheetPanel>
    </BottomSheet>
  )
}

function HeaderStatPill({
  icon,
  value,
  label,
  onClick,
  disabled,
  accent,
}: {
  icon: ReactNode
  value: string
  label: string
  onClick?: () => void
  disabled?: boolean
  accent?: 'green' | 'amber' | 'sky'
}) {
  const accentClass =
    accent === 'amber'
      ? 'border-amber-500/30'
      : accent === 'sky'
        ? 'border-sky-500/30'
        : 'border-neutral-700/80'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${value} ${label}`}
      title={`${value} ${label}`}
      className={`inline-flex items-center gap-1 shrink-0 bg-black/40 border rounded-full pl-1.5 pr-2 py-1 transition-colors ${accentClass} ${
        onClick && !disabled ? 'hover:bg-neutral-900' : disabled ? 'opacity-50 cursor-default' : ''
      }`}
    >
      <span className="shrink-0 flex items-center justify-center">{icon}</span>
      <span className="text-xs font-bold tabular-nums leading-none">{value}</span>
    </button>
  )
}

export function AppHeader() {
  const {
    name,
    avatarUrl,
    currentDay,
    challengeAccepted,
    challengeId,
    mirrorPhotos,
    taskChecksByDay,
    readNotificationIds,
    dismissedNotificationIds,
    totalXp,
    disciplineShields,
    investidaStreak,
  } = useAppStore()
  const bellRef = useRef<HTMLButtonElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [streakOpen, setStreakOpen] = useState(false)
  const [xpOpen, setXpOpen] = useState(false)

  const programDay = getDisplayDay(challengeAccepted, currentDay)
  const investedDays = challengeAccepted ? investidaStreak : 0

  const unreadCount = useMemo(
    () =>
      countUnreadNotifications({
        challengeAccepted,
        challengeId,
        currentDay,
        investidaStreak,
        mirrorPhotos,
        taskChecksByDay,
        readNotificationIds,
        dismissedNotificationIds,
      }),
    [
      challengeAccepted,
      challengeId,
      currentDay,
      investidaStreak,
      mirrorPhotos,
      taskChecksByDay,
      readNotificationIds,
      dismissedNotificationIds,
    ]
  )
  const hasUnread = unreadCount > 0

  const toggleNotifications = () => {
    setProfileOpen(false)
    setNotificationsOpen((v) => !v)
  }

  const toggleProfile = () => {
    setNotificationsOpen(false)
    setProfileOpen((v) => !v)
  }

  return (
    <>
      <header className="app-header sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-2 px-3 sm:px-5 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3">
          <div className="shrink-0 min-w-0 max-w-[38%]">
            <Logo size="sm" to="/app" />
          </div>

          <div className="flex items-center gap-1 min-w-0 flex-1 justify-end overflow-hidden">
            {challengeAccepted && (
              <div className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-hide">
                <HeaderStatPill
                  icon={<span className="text-xs leading-none">🔥</span>}
                  value={String(investedDays)}
                  label="investida"
                  onClick={() => setStreakOpen(true)}
                />
                <HeaderStatPill
                  icon={<Zap size={12} className="text-amber-400" />}
                  value={formatXp(totalXp)}
                  label="XP"
                  accent="amber"
                  onClick={() => setXpOpen(true)}
                />
                {disciplineShields > 0 && (
                  <HeaderStatPill
                    icon={<Shield size={12} className="text-sky-400" />}
                    value={String(disciplineShields)}
                    label="escudo"
                    accent="sky"
                    onClick={() => setXpOpen(true)}
                  />
                )}
              </div>
            )}

            <button
              ref={bellRef}
              type="button"
              onClick={toggleNotifications}
              aria-expanded={notificationsOpen}
              aria-label="Notificações"
              className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                notificationsOpen
                  ? 'bg-neutral-800 border-neutral-600'
                  : 'bg-black/40 border-neutral-700/80 hover:bg-neutral-900'
              }`}
            >
              <Bell size={16} className="text-neutral-300" />
              {hasUnread && !notificationsOpen && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-orange rounded-full" />
              )}
            </button>

            <button
              ref={avatarRef}
              type="button"
              onClick={toggleProfile}
              aria-expanded={profileOpen}
              aria-label="Perfil"
              className={`transition-all shrink-0 ${profileOpen ? 'opacity-100' : 'hover:opacity-90'}`}
            >
              <UserAvatar name={name} avatarUrl={avatarUrl} size="sm" ring={profileOpen} />
            </button>
          </div>
        </div>
      </header>

      <NotificationsDropdown
        anchorRef={bellRef}
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <ProfileDropdown
        anchorRef={avatarRef}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
      {streakOpen && (
        <StreakModal
          days={investedDays}
          programDay={programDay}
          onClose={() => setStreakOpen(false)}
        />
      )}
      {xpOpen && <XpModal onClose={() => setXpOpen(false)} />}
    </>
  )
}
