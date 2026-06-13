import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

type HeaderDropdownProps = {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  children: ReactNode
  align?: 'right' | 'left'
  width?: number
}

export function HeaderDropdown({
  anchorRef,
  open,
  onClose,
  children,
  align = 'right',
  width = 300,
}: HeaderDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<{ top: number; left?: number; right?: number }>({
    top: 0,
  })

  useEffect(() => {
    if (!open || !anchorRef.current) return

    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      const gap = 10
      setStyle({
        top: rect.bottom + gap,
        ...(align === 'right'
          ? { right: Math.max(16, window.innerWidth - rect.right) }
          : { left: Math.max(16, rect.left) }),
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef, align])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[120]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="fixed z-[121] dropdown-animate"
        style={{
          top: style.top,
          right: style.right,
          left: style.left,
          width,
          maxWidth: 'min(300px, calc(100vw - 2rem))',
        }}
        role="dialog"
      >
        {/* Seta apontando para o botão */}
        <div
          className={`absolute -top-1.5 w-3 h-3 rotate-45 bg-surface border border-neutral-700 ${
            align === 'right' ? 'right-3' : 'left-3'
          }`}
        />
        <div className="relative rounded-2xl bg-surface border border-neutral-700 shadow-2xl shadow-black/60 overflow-hidden">
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}
