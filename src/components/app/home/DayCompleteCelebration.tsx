import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { fireDayCompleteConfetti } from '../../../lib/confetti'

type DayCompleteCelebrationProps = {
  allDone: boolean
  programDay: number
}

export function DayCompleteCelebration({ allDone, programDay }: DayCompleteCelebrationProps) {
  const prevAllDone = useRef<boolean | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const justCompleted = prevAllDone.current === false && allDone === true
    prevAllDone.current = allDone

    if (!justCompleted) return

    fireDayCompleteConfetti()
    setVisible(true)

    const hide = window.setTimeout(() => setVisible(false), 5200)
    return () => window.clearTimeout(hide)
  }, [allDone, programDay])

  useEffect(() => {
    if (!allDone) setVisible(false)
  }, [allDone])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto relative w-full max-w-sm rounded-3xl border border-accent-green/40 bg-[#0c0f0c]/95 backdrop-blur-md p-6 shadow-[0_0_60px_rgba(34,197,94,0.35)] animate-fade-in">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-accent-green/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-accent-green" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-green">
            Dia {programDay} completo
          </p>
          <h2 className="text-xl font-black text-white leading-tight">
            Você completou o dia!
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Todas as missões fechadas. Disciplina no bolso — amanhã tem mais.
          </p>
        </div>
      </div>
    </div>
  )
}
