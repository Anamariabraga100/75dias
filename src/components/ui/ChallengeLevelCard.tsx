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
    label: 'Desafiante',
    level: 1,
    intensity: 'Leve',
    imagePosition: 'object-[center_15%]',
    ctaCard: 'Começar no Desafio Desafiante',
    ctaPreview: 'Começar no Desafio Desafiante',
    ctaConfirm: 'Começar no Desafio Desafiante',
  },
  intermediario: {
    label: 'Dominante',
    level: 2,
    intensity: 'Moderado',
    imagePosition: 'object-[center_20%]',
    ctaCard: 'Começar no Desafio Dominante',
    ctaPreview: 'Começar no Desafio Dominante',
    ctaConfirm: 'Começar no Desafio Dominante',
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
      className={`relative rounded-3xl overflow-hidden border transition-all ${
        isActive ? 'border-accent-blue/50 ring-1 ring-accent-blue/30' : 'border-neutral-800'
      } ${isDisabled ? 'opacity-45' : ''}`}
    >
      <div className="relative w-full aspect-[3/4] max-h-[min(68vw,280px)]">
        <img
          src={c.image}
          alt={meta.label}
          className={`absolute inset-0 w-full h-full object-cover ${meta.imagePosition}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

        {isRecommended && !isActive && (
          <span className="absolute top-3 right-3 z-10 bg-accent-blue text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            Recomendado
          </span>
        )}
        {isActive && (
          <span className="absolute top-3 right-3 z-10 bg-accent-green text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            Ativo
          </span>
        )}

        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-md ${c.badgeColor}`}>
            Nível {meta.level}
          </span>
          <span className="text-white/80 text-xs font-medium drop-shadow-md">{meta.intensity}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5 pt-20 bg-gradient-to-t from-black via-black/70 to-transparent">
          <h3 className="text-2xl font-bold leading-tight drop-shadow-lg">{meta.label}</h3>
          <p className="text-neutral-300 text-sm mt-2 line-clamp-2 drop-shadow-md leading-relaxed">
            {c.tagline}
          </p>
          <IntensityDots level={meta.level} />
        </div>
      </div>

      <div className="px-5 py-5 bg-surface border-t border-neutral-800/80">
        {isActive ? (
          <Button variant="danger" className="!py-3.5" onClick={onQuit}>
            Desistir do desafio
          </Button>
        ) : (
          <Button
            variant="primary"
            className={`!py-3.5 ${
              isImplacavel ? '!bg-accent-orange !text-black hover:!bg-orange-400' : ''
            }`}
            disabled={isDisabled}
            onClick={onStartLevel}
          >
            {meta.ctaCard}
          </Button>
        )}
      </div>
    </div>
  )
}
