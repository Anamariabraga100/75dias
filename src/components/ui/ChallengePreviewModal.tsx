import { X } from 'lucide-react'
import { Button } from './Button'
import { BottomSheet, BottomSheetPanel } from './BottomSheet'
import { LEVEL_META } from './ChallengeLevelCard'
import { getChallengeRecommendation } from '../../lib/challengeRecommendation'
import { CHALLENGES, type ChallengeId } from '../../store/useAppStore'

interface ChallengePreviewModalProps {
  challengeId: ChallengeId
  onAccept: () => void
  onClose: () => void
}

export function ChallengePreviewModal({
  challengeId,
  onAccept,
  onClose,
}: ChallengePreviewModalProps) {
  const challenge = CHALLENGES[challengeId]
  const meta = LEVEL_META[challengeId]
  const ctaLabel = getChallengeRecommendation(challengeId).ctaLabel

  return (
    <BottomSheet onClose={onClose} className="bg-black/80">
      <BottomSheetPanel
        className="overflow-hidden flex flex-col max-h-[min(85dvh,calc(100dvh-72px-4rem))]"
      >
        <div className="relative aspect-[16/10] max-h-[200px] shrink-0">
          <img
            src={challenge.image}
            alt={meta.label}
            className={`absolute inset-0 w-full h-full object-cover ${meta.imagePosition}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/30 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${challenge.badgeColor}`}>
              Nível {meta.level}
            </span>
            <h3 className="font-bold text-lg mt-1">{meta.label}</h3>
            <p className="text-neutral-400 text-xs">{challenge.tagline}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">
            Sua jornada de 90 dias
          </p>
          <p className="text-neutral-500 text-sm mb-4">
            Mesma jornada para todos — a diferença está na intensidade dos hábitos diários:
          </p>

          <div className="space-y-2 mb-4">
            {challenge.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 bg-neutral-900/60 rounded-xl px-3 py-2.5"
              >
                <span className="text-lg shrink-0 mt-0.5">{task.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">
                    {task.previewVerb}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="bg-black/40 text-[11px] text-neutral-400 px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {challengeId === 'implacavel' && (
            <p className="text-neutral-600 text-[11px] mt-3">
              Evolução no espelho no Progresso — check-in nos dias 1, 4, 7… com comparação automática.
            </p>
          )}
        </div>

        <div className="shrink-0 px-5 pb-5 pt-2 border-t border-neutral-800 bg-surface">
          <Button
            onClick={onAccept}
            className={`!mb-2 ${
              challengeId === 'implacavel'
                ? '!bg-accent-orange !text-black hover:!bg-orange-400'
                : ''
            }`}
          >
            {ctaLabel}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Escolher outro nível
          </button>
        </div>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
