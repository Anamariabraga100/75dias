import { LEVEL_META } from '../ui/ChallengeLevelCard'
import { TIER_INFO } from '../../lib/progressionTiers'
import { getChallengeRecommendation } from '../../lib/challengeRecommendation'
import { GENERAL_AVERAGE_SCORE } from '../../store/profileAnalysis'
import type { ChallengeId } from '../../store/useAppStore'

type ProfileResultSummaryProps = {
  disciplineScore: number
  projectedScore: number
  recommendedChallenge: ChallengeId
  whyLines: [string, string]
  priorityActions?: string[]
  compact?: boolean
}

const LEVEL_GLOW: Record<ChallengeId, string> = {
  iniciante: 'shadow-[0_0_24px_rgba(34,197,94,0.15)] border-emerald-500/40',
  intermediario: 'shadow-[0_0_24px_rgba(56,189,248,0.18)] border-sky-500/40',
  implacavel: 'shadow-[0_0_24px_rgba(249,115,22,0.2)] border-orange-500/40',
}

export function ProfileResultSummary({
  disciplineScore,
  projectedScore,
  recommendedChallenge,
  whyLines,
  priorityActions = [],
  compact = false,
}: ProfileResultSummaryProps) {
  const tier = TIER_INFO[recommendedChallenge]
  const copy = getChallengeRecommendation(recommendedChallenge)
  const challengeTitle = copy.challengeTitle
  const meta = LEVEL_META[recommendedChallenge]

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#262626" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray={`${disciplineScore} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-black tabular-nums">
            {disciplineScore}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">Sua disciplina hoje</p>
          <p className="text-sm text-neutral-400">
            Média: {GENERAL_AVERAGE_SCORE}% · Potencial:{' '}
            <span className="text-accent-blue font-semibold">{projectedScore}%</span>
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 text-center">
          <p className="text-[8px] uppercase tracking-wide text-amber-400/80">XP</p>
          <p className="text-xs font-bold text-amber-300">+10</p>
        </div>
      </div>

      <div
        className={`rounded-2xl border bg-neutral-900/60 p-4 ${LEVEL_GLOW[recommendedChallenge]} ${copy.accentClass}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Seu desafio recomendado
          </p>
          <span className="text-[10px] font-bold uppercase text-amber-300/90 bg-black/30 px-2 py-0.5 rounded-full">
            ⭐ Match
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{tier.emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
              Nível {meta.level} · {meta.intensity}
            </p>
            <h2 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
              {challengeTitle}
            </h2>
          </div>
        </div>

        <div className="flex gap-1 mb-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${
                n <= meta.level ? 'bg-white/80' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-neutral-200 leading-snug mb-2">{copy.headline}</p>
        <ul className="space-y-1">
          {whyLines.map((line) => (
            <li key={line} className="text-xs text-neutral-400 leading-relaxed">
              • {line}
            </li>
          ))}
        </ul>

        {priorityActions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5">
              Foco nos 90 dias
            </p>
            {priorityActions.map((action) => (
              <p key={action} className="text-xs text-neutral-500">
                → {action}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-end gap-3 h-20">
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full h-14 rounded-lg bg-neutral-800 relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-neutral-600"
              style={{ height: `${disciplineScore}%` }}
            />
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">Você · {disciplineScore}%</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full h-14 rounded-lg bg-gradient-to-t from-blue-900 to-accent-blue flex items-center justify-center">
            <span className="text-sm font-black text-white">{projectedScore}%</span>
          </div>
          <p className="text-[10px] text-accent-blue/80 mt-1">Com Reset90</p>
        </div>
      </div>
    </div>
  )
}
