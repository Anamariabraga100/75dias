import { useState } from 'react'
import { CHALLENGE_LIST, CHALLENGES, type ChallengeId } from '../../../store/useAppStore'
import { useAppStore } from '../../../store/useAppStore'
import { LEVEL_META } from '../../ui/ChallengeLevelCard'
import { TIER_INFO } from '../../../lib/progressionTiers'
import {
  DIFFICULTY_HINT,
  getChallengeRecommendation,
} from '../../../lib/challengeRecommendation'

type ChallengeDifficultyPickerProps = {
  onSelect: (id: ChallengeId) => void
}

function RecommendedHero({
  challengeId,
  onSelect,
}: {
  challengeId: ChallengeId
  onSelect: (id: ChallengeId) => void
}) {
  const challenge = CHALLENGES[challengeId]
  const meta = LEVEL_META[challengeId]
  const tier = TIER_INFO[challengeId]
  const copy = getChallengeRecommendation(challengeId)
  const challengeTitle = copy.challengeTitle

  return (
    <article className="rounded-3xl overflow-hidden border border-neutral-700/80 bg-[#0d0d0d] shadow-lg shadow-black/20">
      <div className="relative h-[160px] w-full overflow-hidden">
        <img
          src={challenge.image}
          alt={challengeTitle}
          className={`absolute inset-0 w-full h-full object-cover ${meta.imagePosition}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300/90 bg-black/50 border border-amber-400/30 px-2.5 py-1 rounded-full">
            ⭐ Recomendado
          </span>
          <span className="text-[10px] font-bold uppercase text-white/80 bg-black/40 px-2 py-1 rounded-full">
            Nível {meta.level}/3
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs text-white/75 mb-0.5">
            {tier.emoji} {meta.intensity}
          </p>
          <h3 className="text-2xl font-black tracking-tight text-white uppercase leading-none">
            {challengeTitle}
          </h3>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full ${n <= meta.level ? 'bg-white' : 'bg-white/25'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-neutral-800/60">
        <button
          type="button"
          onClick={() => onSelect(challengeId)}
          className={`w-full py-3 rounded-xl text-sm font-black transition-colors ${
            challengeId === 'implacavel'
              ? 'bg-accent-orange text-black hover:bg-orange-400'
              : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          {copy.ctaLabel}
        </button>
      </div>
    </article>
  )
}

function AlternateLevelCard({
  challengeId,
  isRecommended,
  onSelect,
}: {
  challengeId: ChallengeId
  isRecommended: boolean
  onSelect: (id: ChallengeId) => void
}) {
  const challenge = CHALLENGES[challengeId]
  const meta = LEVEL_META[challengeId]
  const tier = TIER_INFO[challengeId]
  const challengeTitle = getChallengeRecommendation(challengeId).challengeTitle

  return (
    <button
      type="button"
      onClick={() => onSelect(challengeId)}
      className="w-full text-left rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden hover:border-neutral-600 transition-colors"
    >
      <div className="flex items-stretch min-h-[80px]">
        <div className="w-20 shrink-0 relative">
          <img
            src={challenge.image}
            alt={challengeTitle}
            className={`absolute inset-0 w-full h-full object-cover ${meta.imagePosition}`}
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base">{tier.emoji}</span>
            <p className="font-bold text-white text-sm uppercase tracking-wide">{challengeTitle}</p>
            {isRecommended && (
              <span className="text-[9px] font-bold uppercase text-amber-400/90">Match</span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 leading-snug line-clamp-1">{challenge.tagline}</p>
          <p className="text-[10px] text-neutral-600 mt-0.5">Nível {meta.level} · {meta.intensity}</p>
        </div>
      </div>
    </button>
  )
}

export function ChallengeDifficultyPicker({ onSelect }: ChallengeDifficultyPickerProps) {
  const recommendedChallenge = useAppStore((s) => s.recommendedChallenge) ?? 'intermediario'
  const disciplineScore = useAppStore((s) => s.disciplineScore)
  const whyLines = useAppStore(
    (s) =>
      s.profileInsights?.recommendationWhy ??
      getChallengeRecommendation(s.recommendedChallenge ?? 'intermediario').whyLines
  )
  const [showAllLevels, setShowAllLevels] = useState(false)
  const recommendation = getChallengeRecommendation(recommendedChallenge)

  return (
    <div className="px-5 pb-8">
      <section className={`rounded-2xl border p-3.5 mb-4 ${recommendation.accentClass}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            Seu desafio recomendado
          </p>
          <span className="text-[10px] font-bold text-amber-300/90 bg-black/30 px-2 py-0.5 rounded-full">
            {disciplineScore}% disciplina
          </span>
        </div>

        <p className="text-base font-black text-white mb-1">
          {recommendation.badgeEmoji} {recommendation.challengeTitle}
        </p>

        <p className="text-xs text-neutral-200 leading-relaxed mb-2">{recommendation.headline}</p>

        <ul className="space-y-1">
          {whyLines.map((line) => (
            <li key={line} className="text-xs text-neutral-400 leading-relaxed">
              • {line}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] text-neutral-500 leading-relaxed mb-3 text-center px-1">{DIFFICULTY_HINT}</p>

      <RecommendedHero challengeId={recommendedChallenge} onSelect={onSelect} />

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-800" />
        <button
          type="button"
          onClick={() => setShowAllLevels((v) => !v)}
          className="text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors shrink-0"
        >
          {showAllLevels ? 'Ocultar outros níveis' : 'Escolher outro nível'}
        </button>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      {showAllLevels && (
        <div className="space-y-2">
          {CHALLENGE_LIST.map((c) => (
            <AlternateLevelCard
              key={c.id}
              challengeId={c.id}
              isRecommended={c.id === recommendedChallenge}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
