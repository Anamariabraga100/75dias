import { LEVEL_META } from '../../ui/ChallengeLevelCard'
import type { ChallengeId } from '../../../store/useAppStore'
import { TOTAL_PROGRAM_DAYS } from '../../../lib/demoProgress'

type ProgressSummaryCardProps = {
  displayDay: number
  challengeId: ChallengeId | null
}

export function ProgressSummaryCard({ displayDay, challengeId }: ProgressSummaryCardProps) {
  const pct = Math.min(100, Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100))
  const daysLeft = Math.max(0, TOTAL_PROGRAM_DAYS - displayDay)
  const level =
    challengeId && challengeId in LEVEL_META ? LEVEL_META[challengeId].label : '—'

  return (
    <section className="rounded-2xl border border-neutral-800/80 bg-[#111111] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">
        Resumo
      </p>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-black text-white tabular-nums">{displayDay}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">dia atual</p>
        </div>
        <div>
          <p className="text-2xl font-black text-accent-blue tabular-nums">{pct}%</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">concluído</p>
        </div>
        <div>
          <p className="text-2xl font-black text-neutral-300 tabular-nums">{daysLeft}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">dias restantes</p>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden mt-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-green transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[10px] text-neutral-600 text-center mt-2">Desafio {level}</p>
    </section>
  )
}
