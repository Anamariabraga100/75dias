type ProgressInvestidaCardProps = {
  investidaDays: number
  recordDays: number
}

export function ProgressInvestidaCard({ investidaDays, recordDays }: ProgressInvestidaCardProps) {
  const isRecord = investidaDays >= recordDays

  return (
    <section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80 mb-3">
        🔥 Investida
      </p>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-black text-white tabular-nums leading-none">
            {investidaDays}
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            dia{investidaDays !== 1 ? 's' : ''} seguidos
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500 mb-0.5">
            Recorde
          </p>
          <p className="text-2xl font-black text-orange-400 tabular-nums">{recordDays}</p>
          <p className="text-[10px] text-neutral-600">dias seguidos</p>
        </div>
      </div>

      {isRecord && investidaDays > 1 && (
        <p className="text-xs text-orange-400/90 mt-3 font-semibold">✨ Você está no seu recorde!</p>
      )}
    </section>
  )
}
