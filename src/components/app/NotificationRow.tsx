import { useRef, useState } from 'react'
import type { AppNotification } from '../../lib/notifications'

const DISMISS_THRESHOLD_PX = 72

type NotificationRowProps = {
  notification: AppNotification
  onDismiss: (id: string) => void
  onActivate: (id: string, path?: string, hash?: string) => void
}

export function NotificationRow({ notification, onDismiss, onActivate }: NotificationRowProps) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [exiting, setExiting] = useState(false)
  const startX = useRef(0)
  const dragged = useRef(false)
  const n = notification
  const Icon = n.icon

  const finishDismiss = () => {
    setExiting(true)
    const direction = dragX >= 0 ? 1 : -1
    setDragX(direction * 360)
    window.setTimeout(() => onDismiss(n.id), 180)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (exiting) return
    dragged.current = false
    startX.current = event.clientX
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || exiting) return
    const delta = event.clientX - startX.current
    if (Math.abs(delta) > 6) dragged.current = true
    setDragX(delta)
  }

  const handlePointerEnd = () => {
    if (!dragging || exiting) return
    setDragging(false)
    if (Math.abs(dragX) >= DISMISS_THRESHOLD_PX) {
      finishDismiss()
      return
    }
    setDragX(0)
  }

  const handleClick = () => {
    if (dragged.current || exiting) return
    onActivate(n.id, n.action?.path, n.action?.hash)
  }

  const dragOpacity = Math.max(0.35, 1 - Math.abs(dragX) / 220)

  return (
    <div className="relative overflow-hidden border-b border-neutral-800/60 last:border-0">
      <div
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center text-neutral-500 pointer-events-none"
        aria-hidden
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide">Ocultar</span>
      </div>

      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          transform: `translateX(${dragX}px)`,
          opacity: dragOpacity,
          transition: dragging ? 'none' : 'transform 0.18s ease, opacity 0.18s ease',
        }}
        className={`relative z-10 w-full flex gap-3 px-4 py-3 text-left touch-pan-y ${
          n.unread ? 'bg-neutral-900/20' : 'bg-app-bg'
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
    </div>
  )
}
