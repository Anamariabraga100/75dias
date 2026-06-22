import { Bell } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeaderDropdown } from '../ui/HeaderDropdown'
import { useAppStore } from '../../store/useAppStore'
import { buildNotifications } from '../../lib/notifications'
import type { RefObject } from 'react'

type NotificationsDropdownProps = {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
}

export function NotificationsDropdown({ anchorRef, open, onClose }: NotificationsDropdownProps) {
  const navigate = useNavigate()
  const {
    challengeAccepted,
    challengeId,
    currentDay,
    mirrorPhotos,
    taskChecksByDay,
    readNotificationIds,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore()

  const notifications = useMemo(
    () =>
      buildNotifications({
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

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleClick = (id: string, path?: string, hash?: string) => {
    markNotificationRead(id)
    onClose()
    if (path) {
      navigate(hash ? `${path}#${hash}` : path)
    }
  }

  const handleMarkAllRead = () => {
    markAllNotificationsRead(notifications.map((n) => n.id))
  }

  return (
    <HeaderDropdown anchorRef={anchorRef} open={open} onClose={onClose} width={320}>
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bell size={16} className="text-neutral-400 shrink-0" />
          <h3 className="font-bold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-accent-orange/20 text-accent-orange px-1.5 py-0.5 rounded-full shrink-0">
              {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-[10px] font-semibold text-accent-blue hover:text-accent-blue/80 shrink-0"
          >
            Marcar lidas
          </button>
        )}
      </div>

      <div className="max-h-[min(360px,55dvh)] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-neutral-500 text-sm">
            Nenhuma notificação no momento.
          </p>
        ) : (
          notifications.map((n) => {
            const Icon = n.icon
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClick(n.id, n.action?.path, n.action?.hash)}
                className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-neutral-900/60 transition-colors border-b border-neutral-800/60 last:border-0 ${
                  n.unread ? 'bg-neutral-900/20' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.bg} ${n.color}`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                      {n.tag}
                    </span>
                    {n.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0" />
                    )}
                  </div>
                  <p className="font-semibold text-sm leading-snug">{n.title}</p>
                  <p className="text-neutral-400 text-xs leading-relaxed mt-0.5">{n.body}</p>
                  <p className="text-neutral-600 text-[10px] mt-1">{n.time}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </HeaderDropdown>
  )
}
