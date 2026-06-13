import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

type BottomSheetProps = {
  children: ReactNode
  onClose: () => void
  className?: string
}

export function BottomSheet({ children, onClose, className = 'bg-black/75' }: BottomSheetProps) {
  return createPortal(
    <div
      className={`fixed inset-0 z-[110] flex items-end justify-center px-4 pb-[calc(72px+env(safe-area-inset-bottom,0px)+1.5rem)] ${className}`}
      onClick={onClose}
    >
      {children}
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
      className={`w-full max-w-md bg-surface rounded-2xl animate-fade-in max-h-[min(75dvh,calc(100dvh-72px-4rem))] overflow-y-auto ${className}`}
      onClick={onClick ?? ((e) => e.stopPropagation())}
    >
      {children}
    </div>
  )
}
