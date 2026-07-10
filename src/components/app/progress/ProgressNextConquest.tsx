import {
  getConquestMotivation,
  getNextConquest,
  getPacePrediction,
} from '../../../lib/progressPage'

type ProgressNextConquestProps = {
  displayDay: number
}

export function ProgressNextConquest({ displayDay }: ProgressNextConquestProps) {
  const next = getNextConquest(displayDay)

  if (!next) {
    return (
      <section className="rounded-2xl border border-accent-green/30 bg-accent-green/10 p-4 text-center">
        <p className="text-3xl mb-1">🏆</p>
        <p className="font-black text-accent-green">Reset90 completo!</p>
        <p className="text-neutral-400 text-sm mt-1">Você venceu os 90 dias.</p>
      </section>
    )
  }

  const daysLeft = next.day - displayDay
  const motivation = getConquestMotivation(displayDay, next)
  const pace30 = next.day >= 30 ? getPacePrediction(displayDay, 30) : null

  return (
    <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 mb-3">
        🏆 Próxima conquista
      </p>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{next.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-lg leading-tight">{next.title}</p>
          <p className="text-neutral-500 text-xs mt-0.5">Dia {next.day}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-black text-amber-400 tabular-nums leading-none">{daysLeft}</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <p className="text-sm text-neutral-300 leading-relaxed">{motivation}</p>

      {pace30 && displayDay < 30 && (
        <p className="text-xs text-neutral-500 mt-2 pt-2 border-t border-white/5">{pace30}</p>
      )}
    </section>
  )
}
