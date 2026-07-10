import { Bell } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeaderDropdown } from '../ui/HeaderDropdown'
import { useAppStore } from '../../store/useAppStore'
import { buildNotifications } from '../../lib/notifications'
import { NotificationRow } from './NotificationRow'
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
    dismissedNotificationIds,
    dismissNotification,
    dismissAllNotifications,
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

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleActivate = (id: string, path?: string, hash?: string) => {
    dismissNotification(id)
    onClose()
    if (path) {
      navigate(hash ? `${path}#${hash}` : path)
    }
  }

  const handleDismiss = (id: string) => {
    dismissNotification(id)
  }

  const handleMarkAllRead = () => {
    dismissAllNotifications(notifications.map((n) => n.id))
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
        {notifications.length > 0 && (
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
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onDismiss={handleDismiss}
              onActivate={handleActivate}
            />
          ))
        )}
      </div>
    </HeaderDropdown>
  )
}
