import { Lock } from 'lucide-react'
import { CHALLENGE_LIST, type ChallengeId } from '../../../store/useAppStore'
import { LEVEL_META } from '../../ui/ChallengeLevelCard'
import { TIER_INFO, TIER_ORDER, isTierUnlocked } from '../../../lib/progressionTiers'

type ProgressionLevelPickerProps = {
  completedDays: number
  displayDay: number
  onSelect: (id: ChallengeId) => void
}

const TIER_SUBTITLE: Record<ChallengeId, string> = {
  iniciante: 'Primeiro passo da transformação.',
  intermediario: 'Novos desafios e hábitos avançados.',
  implacavel: 'O nível máximo.',
}

function EvolutionTimeline() {
  return (
    <section className="mb-8">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-5">
        Sua evolução
      </h2>

      <div className="relative px-1">
        <div className="absolute top-[22px] left-8 right-8 h-[3px] rounded-full bg-neutral-800" />
        <div className="absolute top-[22px] left-8 w-[calc(50%-2rem)] h-[3px] rounded-full bg-gradient-to-r from-accent-green/80 to-accent-green/20" />

        <div className="relative flex justify-between items-start">
          {TIER_ORDER.map((id, index) => {
            const tier = TIER_INFO[id]
            const isCurrent = id === 'iniciante'
            const locked = id !== 'iniciante'

            return (
              <div key={id} className="flex flex-col items-center w-[30%] min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border-2 ${
                    isCurrent
                      ? 'bg-accent-green/15 border-accent-green shadow-[0_0_20px_rgba(34,197,94,0.25)]'
                      : locked
                        ? 'bg-neutral-900/80 border-neutral-700 opacity-70'
                        : 'bg-neutral-900 border-neutral-600'
                  }`}
                >
                  {locked ? '🔒' : tier.emoji}
                </div>
                <p
                  className={`text-[11px] font-bold mt-2.5 text-center leading-tight ${
                    isCurrent ? 'text-white' : 'text-neutral-500'
                  }`}
                >
                  {tier.label}
                </p>
                <p className="text-[10px] text-neutral-600 mt-0.5 tabular-nums">
                  {index === 0 ? 'Atual' : `Dia ${tier.unlockDay}`}
                </p>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs font-semibold text-accent-green mt-5">Você está aqui ↑</p>
      </div>
    </section>
  )
}

function LevelCardHero({
  image,
  imagePosition,
  label,
  unlocked,
  children,
}: {
  image: string
  imagePosition: string
  label: string
  unlocked: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full h-[168px] shrink-0 overflow-hidden">
      <img
        src={image}
        alt={label}
        className={`absolute inset-0 w-full h-full object-cover ${imagePosition} ${
          unlocked ? '' : 'brightness-[0.85] saturate-[0.9]'
        }`}
      />
      <div
        className={`absolute inset-0 ${
          unlocked
            ? 'bg-gradient-to-t from-black via-black/50 to-black/10'
            : 'bg-gradient-to-t from-black/95 via-black/45 to-black/15'
        }`}
      />
      <div className="absolute inset-0 p-5 flex flex-col justify-end">{children}</div>
    </div>
  )
}

export function ProgressionLevelPicker({
  completedDays,
  displayDay,
  onSelect,
}: ProgressionLevelPickerProps) {
  return (
    <div className="px-5 pb-8">
      <EvolutionTimeline />

      <div className="flex flex-col gap-5">
        {CHALLENGE_LIST.map((c) => {
          const tier = TIER_INFO[c.id]
          const meta = LEVEL_META[c.id]
          const unlocked = isTierUnlocked(c.id, completedDays)
          const daysLeft = Math.max(0, tier.unlockDay - displayDay)

          if (unlocked) {
            return (
              <article
                key={c.id}
                className="relative rounded-3xl overflow-hidden border border-neutral-700/80 shadow-lg shadow-black/20 bg-[#0d0d0d]"
              >
                <LevelCardHero
                  image={c.image}
                  imagePosition={meta.imagePosition}
                  label={meta.label}
                  unlocked
                >
                  <p className="text-sm text-white/90 mb-1">
                    {tier.emoji} Nível {meta.level}
                  </p>
                  <h3 className="text-3xl font-black tracking-tight text-white uppercase leading-none">
                    {meta.label}
                  </h3>
                  <p className="text-neutral-300 text-sm mt-1.5">{TIER_SUBTITLE[c.id]}</p>
                </LevelCardHero>

                <div className="px-4 py-3 border-t border-neutral-800/60">
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-100 transition-colors"
                  >
                    {c.id === 'iniciante' ? 'Começar agora' : `Iniciar como ${meta.label}`}
                  </button>
                </div>
              </article>
            )
          }

          return (
            <article
              key={c.id}
              className="relative rounded-3xl overflow-hidden border border-neutral-800/80 bg-[#0d0d0d]"
            >
              <LevelCardHero
                image={c.image}
                imagePosition={meta.imagePosition}
                label={meta.label}
                unlocked={false}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock size={14} className="text-neutral-400 shrink-0" />
                  <p className="text-sm text-neutral-400">Nível {meta.level}</p>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white/95 uppercase leading-none">
                  {meta.label}
                </h3>
                <p className="text-neutral-400 text-sm mt-1.5">
                  Desbloqueia no Dia {tier.unlockDay}
                  {daysLeft > 0 && (
                    <span className="text-neutral-500">
                      {' '}
                      · {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante
                      {daysLeft !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </LevelCardHero>

              <div className="px-4 py-3.5 border-t border-neutral-800/60 space-y-3">
                <ul className="space-y-1.5">
                  {tier.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="text-neutral-500 text-xs flex items-center gap-2">
                      <span className="text-neutral-600 shrink-0">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-600 text-sm font-semibold text-center flex items-center justify-center gap-2">
                  <Lock size={14} />
                  Bloqueado
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
