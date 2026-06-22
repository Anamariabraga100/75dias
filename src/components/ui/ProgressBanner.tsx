import { useAppStore } from '../../store/useAppStore'
import { getDisplayDay, TOTAL_PROGRAM_DAYS } from '../../lib/demoProgress'

export function ProgressBanner() {
  const { currentDay, challengeAccepted, challengeId } = useAppStore()
  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const pct = Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100))

  return (
    <div className="mx-5 mt-5 mb-6 rounded-2xl p-5 shrink-0 bg-surface border border-neutral-800 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">
            Dias de disciplina
          </p>
          <p className="text-2xl font-black leading-none">
            Dia <span className="text-accent-blue">{displayDay}</span>
            <span className="text-neutral-500 text-lg font-bold">/{TOTAL_PROGRAM_DAYS}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-accent-blue font-bold text-lg">{pct}%</p>
          <p className="text-neutral-500 text-[10px] mt-0.5">do Reset90</p>
        </div>
      </div>

      <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden my-1">
        <div
          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-accent-blue via-cyan-500 to-accent-green"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-neutral-500 text-xs mt-3 leading-relaxed">
        {challengeAccepted && challengeId
          ? `${TOTAL_PROGRAM_DAYS - displayDay} dias para completar sua transformação`
          : `${TOTAL_PROGRAM_DAYS - displayDay} dias para completar — escolha seu desafio abaixo`}
      </p>
    </div>
  )
}
