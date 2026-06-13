import { Button } from './Button'
import type { ChallengeId } from '../../store/useAppStore'

export const LEVEL_META: Record<
  ChallengeId,
  {
    label: string
    level: number
    intensity: string
    ctaCard: string
    ctaPreview: string
    ctaConfirm: string
  }
> = {
  iniciante: {
    label: 'Iniciante',
    level: 1,
    intensity: 'Leve',
    ctaCard: 'Dar o primeiro passo',
    ctaPreview: 'Começar agora',
    ctaConfirm: 'Iniciar minha jornada',
  },
  intermediario: {
    label: 'Intermediário',
    level: 2,
    intensity: 'Moderado',
    ctaCard: 'Quero evoluir',
    ctaPreview: 'Aceitar desafio',
    ctaConfirm: 'Aceitar e começar',
  },
  implacavel: {
    label: 'Implacável',
    level: 3,
    intensity: 'Máximo',
    ctaCard: 'Entrar no modo Implacável 🔥',
    ctaPreview: 'Aceito o desafio',
    ctaConfirm: 'Provar meu compromisso',
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
    <div className="flex gap-0.5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1 w-3 rounded-full ${n <= level ? 'bg-white' : 'bg-white/25'}`}
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
        isActive ? 'border-accent-blue/50 ring-1 ring-accent-blue/30' : 'border-neutral-800'
      } ${isDisabled ? 'opacity-45' : ''}`}
    >
      {isRecommended && !isActive && (
        <span className="absolute top-2 right-2 z-10 bg-accent-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          Recomendado
        </span>
      )}
      {isActive && (
        <span className="absolute top-2 right-2 z-10 bg-accent-green/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
          Ativo
        </span>
      )}

      <div className="relative h-[72px]">
        <img src={c.image} alt={meta.label} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        <div className="absolute inset-0 px-3 py-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.badgeColor}`}>
              Nível {meta.level}
            </span>
            <span className="text-neutral-400 text-[10px]">{meta.intensity}</span>
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight">{meta.label}</h3>
            <IntensityDots level={meta.level} />
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        {isActive ? (
          <Button variant="danger" className="!py-2.5 !text-sm" onClick={onQuit}>
            Desistir do desafio
          </Button>
        ) : (
          <Button
            variant="primary"
            className={`!py-2.5 !text-sm ${
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
