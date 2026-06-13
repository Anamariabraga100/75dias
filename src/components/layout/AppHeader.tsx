import { useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import { useAppStore } from '../../store/useAppStore'
import { NotificationsDropdown } from '../app/NotificationsDropdown'
import { ProfileDropdown } from '../app/ProfileDropdown'

import { getDisplayDay } from '../../lib/demoProgress'

function StreakModal({ days, onClose }: { days: number; onClose: () => void }) {
  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5">
        <div className="text-center mb-4">
          <span className="text-4xl">🔥</span>
          <p className="text-3xl font-black mt-2 tabular-nums">{days}</p>
          <p className="text-neutral-400 text-sm">dias de investida</p>
        </div>
        <p className="text-neutral-300 text-sm leading-relaxed text-center mb-5">
          {days >= 7
            ? 'Uma semana ou mais de presença diária. Disciplina não é motivação — é repetir mesmo nos dias difíceis.'
            : 'Cada dia que você aparece conta. A transformação no espelho começa com consistência, não perfeição.'}
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
  const { name, currentDay, challengeAccepted } = useAppStore()
  const bellRef = useRef<HTMLButtonElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [streakOpen, setStreakOpen] = useState(false)

  const initial = (name || 'R').charAt(0).toUpperCase()
  const streakDays = getDisplayDay(challengeAccepted, currentDay)
  const hasUnread = true

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
      <header className="relative z-40 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2 shrink-0">
        <Logo size="sm" to="/app" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStreakOpen(true)}
            aria-label={`${streakDays} dias de investida`}
            className="flex items-center gap-1.5 bg-surface border border-neutral-800 rounded-full px-2.5 py-1 hover:bg-neutral-900 transition-colors"
          >
            <span className="text-sm">🔥</span>
            <div className="leading-tight text-left">
              <span className="text-sm font-bold tabular-nums">{streakDays}</span>
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
                : 'bg-surface border-neutral-800 hover:bg-neutral-900'
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
            className={`w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue to-purple-600 flex items-center justify-center text-sm font-bold transition-all ${
              profileOpen
                ? 'ring-2 ring-white border-2 border-neutral-700'
                : 'border-2 border-neutral-700 hover:opacity-90'
            }`}
          >
            {initial}
          </button>
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
        <StreakModal days={streakDays} onClose={() => setStreakOpen(false)} />
      )}
    </>
  )
}
