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
          {days === 1
            ? 'Você está no primeiro dia do Reset90. Cada dia de disciplina fortalece quem você está se tornando.'
            : days >= 7
              ? `${days} dias no programa — uma semana ou mais de investida real. Disciplina não é motivação: é repetir mesmo nos dias difíceis.`
              : `Dia ${days} de disciplina no programa. Continue aparecendo — consistência silenciosa transforma.`}
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
      className={`flex items-center gap-1.5 bg-black/40 border rounded-full px-2 py-1 transition-colors ${accentClass} ${
        onClick && !disabled ? 'hover:bg-neutral-900' : disabled ? 'opacity-50 cursor-default' : ''
      }`}
    >
      {icon}
      <div className="leading-tight text-left">
        <span className="text-sm font-bold tabular-nums">{value}</span>
        <span className="text-[8px] text-neutral-500 block whitespace-nowrap">{label}</span>
      </div>
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
  } = useAppStore()
  const bellRef = useRef<HTMLButtonElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [streakOpen, setStreakOpen] = useState(false)
  const [xpOpen, setXpOpen] = useState(false)

  const programDay = getDisplayDay(challengeAccepted, currentDay)
  const investedDays = challengeAccepted ? programDay : 0

  const unreadCount = useMemo(
    () =>
      countUnreadNotifications({
        challengeAccepted,
        challengeId,
        currentDay,
        mirrorPhotos,
        taskChecksByDay,
        readNotificationIds,
        dismissedNotificationIds,
      }),
    [
      challengeAccepted,
      challengeId,
      currentDay,
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
        <div className="flex items-center justify-between px-5 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3 gap-2">
          <Logo size="sm" to="/app" />

          <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
            {challengeAccepted && (
              <>
                <HeaderStatPill
                  icon={<span className="text-sm">🔥</span>}
                  value={String(investedDays)}
                  label="investida"
                  onClick={() => setStreakOpen(true)}
                />
                <HeaderStatPill
                  icon={<Zap size={13} className="text-amber-400" />}
                  value={formatXp(totalXp)}
                  label="XP"
                  accent="amber"
                  onClick={() => setXpOpen(true)}
                />
                {disciplineShields > 0 && (
                  <HeaderStatPill
                    icon={<Shield size={13} className="text-sky-400" />}
                    value={String(disciplineShields)}
                    label="escudo"
                    accent="sky"
                    onClick={() => setXpOpen(true)}
                  />
                )}
              </>
            )}

            <button
              ref={bellRef}
              type="button"
              onClick={toggleNotifications}
              aria-expanded={notificationsOpen}
              aria-label="Notificações"
              className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                notificationsOpen
                  ? 'bg-neutral-800 border-neutral-600'
                  : 'bg-black/40 border-neutral-700/80 hover:bg-neutral-900'
              }`}
            >
              <Bell size={18} className="text-neutral-300" />
              {hasUnread && !notificationsOpen && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-orange rounded-full" />
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
