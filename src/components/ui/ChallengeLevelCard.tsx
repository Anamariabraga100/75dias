import { Button } from './Button'
import type { ChallengeId } from '../../store/useAppStore'

export const LEVEL_META: Record<
  ChallengeId,
  {
    label: string
    level: number
    intensity: string
    imagePosition: string
    ctaCard: string
    ctaPreview: string
    ctaConfirm: string
  }
> = {
  iniciante: {
    label: 'Explorador',
    level: 1,
    intensity: 'Leve',
    imagePosition: 'object-[center_15%]',
    ctaCard: 'Começar no Desafio Explorador',
    ctaPreview: 'Começar no Desafio Explorador',
    ctaConfirm: 'Começar no Desafio Explorador',
  },
  intermediario: {
    label: 'Desafiante',
    level: 2,
    intensity: 'Moderado',
    imagePosition: 'object-[center_20%]',
    ctaCard: 'Começar no Desafio Desafiante',
    ctaPreview: 'Começar no Desafio Desafiante',
    ctaConfirm: 'Começar no Desafio Desafiante',
  },
  implacavel: {
    label: 'Implacável',
    level: 3,
    intensity: 'Máximo',
    imagePosition: 'object-[center_25%]',
    ctaCard: 'Começar no Desafio Implacável',
    ctaPreview: 'Começar no Desafio Implacável',
    ctaConfirm: 'Começar no Desafio Implacável',
  },
}

type Challenge = (typeof import('../../store/useAppStore').CHALLENGE_LIST)[number]

interface ChallengeLevelCardProps {
  challenge: Challenge
  isActive: boolean
  isDisabled: boolean
  isRecommended: boolean
  onStartLevel: () => void
  onQuit: () => void
}

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1.5 mt-3">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1.5 w-5 rounded-full ${n <= level ? 'bg-white' : 'bg-white/30'}`}
        />
      ))}
    </div>
  )
}

export function ChallengeLevelCard({
  challenge: c,
  isActive,
  isDisabled,
  isRecommended,
  onStartLevel,
  onQuit,
}: ChallengeLevelCardProps) {
  const meta = LEVEL_META[c.id]
  const isImplacavel = c.id === 'implacavel'

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all ${
        isActive
          ? 'border-white/40 ring-1 ring-white/20'
          : isDisabled
            ? 'border-neutral-800 opacity-50'
            : 'border-neutral-800'
      }`}
    >
      <div className="relative h-40">
        <img
          src={c.image}
          alt={meta.label}
          className={`absolute inset-0 w-full h-full object-cover ${meta.imagePosition}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            Nível {meta.level} · {meta.intensity}
          </p>
          <h3 className="text-xl font-black text-white">{meta.label}</h3>
          <IntensityDots level={meta.level} />
        </div>
        {isRecommended && (
          <span className="absolute top-3 right-3 text-[10px] font-bold bg-accent-green text-black px-2 py-1 rounded-full">
            Recomendado
          </span>
        )}
      </div>

      <div className="p-4 bg-neutral-950">
        <p className="text-neutral-400 text-sm mb-3 leading-relaxed">{c.tagline}</p>
        <ul className="space-y-1.5 mb-4">
          {c.tags.slice(0, isImplacavel ? 5 : 4).map((tag) => (
            <li key={tag} className="text-xs text-neutral-300">
              {tag}
            </li>
          ))}
        </ul>

        {isActive ? (
          <Button variant="danger" onClick={onQuit} className="w-full">
            Desistir do desafio
          </Button>
        ) : (
          <Button onClick={onStartLevel} disabled={isDisabled} className="w-full">
            {meta.ctaCard}
          </Button>
        )}
      </div>
    </div>
  )
}
