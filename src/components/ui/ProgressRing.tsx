interface ProgressRingProps {
  percent: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ percent, size = 160, strokeWidth = 8 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b59ff"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold">{percent}%</span>
      </div>
    </div>
  )
}

interface LoadingStepProps {
  label: string
  status: 'pending' | 'loading' | 'done'
}

export function LoadingStep({ label, status }: LoadingStepProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
          status === 'done'
            ? 'border-accent-blue bg-accent-blue'
            : status === 'loading'
              ? 'border-white border-t-transparent animate-spin'
              : 'border-neutral-600'
        }`}
      >
        {status === 'done' && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span
        className={`text-sm ${status === 'pending' ? 'text-neutral-500' : 'text-neutral-300'}`}
      >
        {label}
      </span>
    </div>
  )
}
