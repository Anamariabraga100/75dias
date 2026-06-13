import { useAppStore } from '../../store/useAppStore'
import { getDisplayDay, TOTAL_PROGRAM_DAYS } from '../../lib/demoProgress'

export function ProgressBanner() {
  const { currentDay, challengeAccepted, challengeId } = useAppStore()
  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const pct = Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100))

  return (
    <div className="mx-4 mb-3 bg-gradient-to-r from-accent-blue/20 via-purple-950/40 to-black border border-accent-blue/20 rounded-2xl p-4 shrink-0">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-neutral-400 text-xs uppercase tracking-wider mb-0.5">
            Dias de disciplina
          </p>
          <p className="text-2xl font-black leading-none">
            Dia <span className="text-accent-blue">{displayDay}</span>
            <span className="text-neutral-500 text-lg font-bold">/{TOTAL_PROGRAM_DAYS}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-accent-yellow font-bold text-lg">{pct}%</p>
          <p className="text-neutral-500 text-[10px]">do Reset90</p>
        </div>
      </div>

      <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-neutral-500 text-xs mt-2">
        {challengeAccepted && challengeId
          ? `${TOTAL_PROGRAM_DAYS - displayDay} dias para completar sua transformação`
          : `${TOTAL_PROGRAM_DAYS - displayDay} dias para completar — escolha seu desafio abaixo`}
      </p>
    </div>
  )
}
