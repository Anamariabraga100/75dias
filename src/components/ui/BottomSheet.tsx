import { createPortal } from 'react-dom'
import { useEffect, type ReactNode } from 'react'

type BottomSheetProps = {
  children: ReactNode
  onClose: () => void
  className?: string
}

export function BottomSheet({ children, onClose, className = 'bg-black/75' }: BottomSheetProps) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return createPortal(
    <div
      className={`fixed inset-0 z-[110] ${className}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="absolute inset-x-0 bottom-0 px-4 pb-[calc(72px+env(safe-area-inset-bottom,0px)+1rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export function BottomSheetPanel({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  className?: string
}) {
  return (
    <div
      className={`w-full bg-surface rounded-2xl animate-fade-in max-h-[min(75dvh,calc(100dvh-72px-4rem))] overflow-x-hidden overflow-y-auto scrollbar-hide ${className}`}
      onClick={onClick ?? ((e) => e.stopPropagation())}
    >
      {children}
    </div>
  )
}
