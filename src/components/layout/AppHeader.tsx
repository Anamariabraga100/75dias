import { useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import { useAppStore } from '../../store/useAppStore'
import { NotificationsDropdown } from '../app/NotificationsDropdown'
import { ProfileDropdown } from '../app/ProfileDropdown'
import { countUnreadNotifications } from '../../lib/notifications'
import { computeInvestedDays } from '../../lib/streak'
import { UserAvatar } from '../ui/UserAvatar'

import { getDisplayDay } from '../../lib/demoProgress'

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
            ? 'Complete os hábitos de hoje para começar sua investida. Cada dia fechado conta.'
            : days >= 7
              ? 'Uma semana ou mais fechando o dia completo. Disciplina não é motivação — é repetir mesmo nos dias difíceis.'
              : 'Dias seguidos com hábitos (e foto, se for dia de registro) concluídos. Não quebre a corrente.'}
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
  } = useAppStore()
  const bellRef = useRef<HTMLButtonElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [streakOpen, setStreakOpen] = useState(false)

  const programDay = getDisplayDay(challengeAccepted, currentDay)
  const investedDays = useMemo(
    () =>
      computeInvestedDays(
        challengeAccepted,
        challengeId,
        currentDay,
        taskChecksByDay,
        mirrorPhotos
      ),
    [challengeAccepted, challengeId, currentDay, taskChecksByDay, mirrorPhotos]
  )
  const unreadCount = useMemo(
    () =>
      countUnreadNotifications({
        challengeAccepted,
        challengeId,
        currentDay,
        mirrorPhotos,
        taskChecksByDay,
        readNotificationIds,
      }),
    [
      challengeAccepted,
      challengeId,
      currentDay,
      mirrorPhotos,
      taskChecksByDay,
      readNotificationIds,
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
        <div className="flex items-center justify-between px-5 pt-[max(0.875rem,env(safe-area-inset-top))] pb-4">
          <Logo size="sm" to="/app" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStreakOpen(true)}
              aria-label={`${investedDays} dias de investida`}
              className="flex items-center gap-1.5 bg-black/40 border border-neutral-700/80 rounded-full px-2.5 py-1 hover:bg-neutral-900 transition-colors"
            >
              <span className="text-sm">🔥</span>
              <div className="leading-tight text-left">
                <span className="text-sm font-bold tabular-nums">{investedDays}</span>
                <span className="text-[9px] text-neutral-500 block whitespace-nowrap">
                  dias de investida
                </span>
              </div>
            </button>

            <button
              ref={bellRef}
              type="button"
              onClick={toggleNotifications}
              aria-expanded={notificationsOpen}
              aria-label="Notificações"
              className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
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
              className={`transition-all ${profileOpen ? 'opacity-100' : 'hover:opacity-90'}`}
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
    </>
  )
}
