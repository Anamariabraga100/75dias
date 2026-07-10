import { DISCIPLINE_SHIELD_COST, MAX_DISCIPLINE_SHIELDS } from '../../../lib/rewards'
import { formatXp } from '../../../lib/xp'

type ProgressXpCardProps = {
  totalXp: number
  disciplineShields?: number
}

export function ProgressXpCard({ totalXp, disciplineShields = 0 }: ProgressXpCardProps) {
  const target = DISCIPLINE_SHIELD_COST
  const pct = Math.min(100, Math.round((totalXp / target) * 100))
  const remaining = Math.max(0, target - totalXp)
  const canBuy = totalXp >= target

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
          ⚡ XP
        </p>
        <p className="text-lg font-black text-amber-400 tabular-nums">{formatXp(totalXp)} XP</p>
      </div>

      <div className="h-2.5 rounded-full bg-neutral-800 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-neutral-400">
        {disciplineShields > 0 ? (
          <span className="text-sky-300 font-semibold">
            🛡️ {disciplineShields}/{MAX_DISCIPLINE_SHIELDS} escudo
            {disciplineShields !== 1 ? 's' : ''} no inventário — use na missão do dia se precisar
          </span>
        ) : canBuy ? (
          <span className="text-amber-400 font-semibold">
            🛡️ Você já pode comprar um Escudo de Disciplina! Toque no XP no topo.
          </span>
        ) : (
          <>
            Faltam <span className="text-white font-bold tabular-nums">{formatXp(remaining)} XP</span>{' '}
            para ganhar um Escudo
          </>
        )}
      </p>
    </section>
  )
}
