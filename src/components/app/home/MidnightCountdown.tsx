import { Clock } from 'lucide-react'
import { getMidnightCountdownParts, isFastDayMode } from '../../../lib/dayUnlock'

type MidnightCountdownProps = {
  remainingMs: number
  nextDay?: number
  compact?: boolean
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[52px]">
      <span className="text-3xl font-black text-white tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mt-1">
        {label}
      </span>
    </div>
  )
}

export function MidnightCountdown({ remainingMs, nextDay, compact = false }: MidnightCountdownProps) {
  const { hours, minutes, seconds } = getMidnightCountdownParts(remainingMs)
  const fast = isFastDayMode()

  if (compact) {
    return (
      <span className="font-bold text-white tabular-nums">
        {hours > 0 || !fast
          ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          : `${minutes}m ${String(seconds).padStart(2, '0')}s`}
      </span>
    )
  }

  return (
    <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-sky-400 shrink-0" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/90">
            Próximo dia libera à meia-noite
          </p>
          {nextDay && (
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Dia {nextDay} desbloqueia quando o relógio zerar
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1">
        {(fast && hours === 0 ? false : true) && (
          <>
            <TimeUnit value={hours} label="horas" />
            <span className="text-2xl font-black text-neutral-600 pb-4">:</span>
          </>
        )}
        <TimeUnit value={minutes} label="min" />
        <span className="text-2xl font-black text-neutral-600 pb-4">:</span>
        <TimeUnit value={seconds} label="seg" />
      </div>
    </div>
  )
}
