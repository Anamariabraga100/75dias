interface OnboardingProgressProps {
  current: number
  total: number
  label?: string
  className?: string
}

export function OnboardingProgress({
  current,
  total,
  label,
  className = '',
}: OnboardingProgressProps) {
  const pct = Math.min(100, Math.round((current / total) * 100))

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          {label ?? `Passo ${current} de ${total}`}
        </p>
        <p className="text-[10px] font-bold tabular-nums text-neutral-600">{pct}%</p>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
