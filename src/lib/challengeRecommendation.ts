import type { ChallengeId } from '../store/useAppStore'

export type ChallengeRecommendationCopy = {
  badgeEmoji: string
  badgeLabel: string
  challengeTitle: string
  headline: string
  whyTitle: string
  whyLines: [string, string]
  accentClass: string
  ctaLabel: string
}

export const CHALLENGE_RECOMMENDATION: Record<ChallengeId, ChallengeRecommendationCopy> = {
  iniciante: {
    badgeEmoji: '🟢',
    badgeLabel: 'DESAFIO DESAFIANTE',
    challengeTitle: 'Desafio Desafiante',
    headline: 'Recomendamos o Desafio Desafiante para começar com leveza.',
    whyTitle: 'Por quê?',
    whyLines: [
      'Você ainda está criando consistência.',
      'O Desafio Desafiante oferece a melhor chance de completar os 90 dias.',
    ],
    accentClass: 'border-emerald-500/30 bg-emerald-500/10',
    ctaLabel: 'Começar no Desafio Desafiante',
  },
  intermediario: {
    badgeEmoji: '🔵',
    badgeLabel: 'DESAFIO DOMINANTE',
    challengeTitle: 'Desafio Dominante',
    headline: 'Recomendamos o Desafio Dominante — nível moderado nos 90 dias.',
    whyTitle: 'Por quê?',
    whyLines: [
      'Você já tem uma boa base de hábitos.',
      'O Desafio Dominante combina exigência e consistência para o seu momento.',
    ],
    accentClass: 'border-sky-500/30 bg-sky-500/10',
    ctaLabel: 'Começar no Desafio Dominante',
  },
  implacavel: {
    badgeEmoji: '🔥',
    badgeLabel: 'DESAFIO IMPLACÁVEL',
    challengeTitle: 'Desafio Implacável',
    headline: 'Recomendamos o Desafio Implacável — máxima exigência.',
    whyTitle: 'Por quê?',
    whyLines: [
      'Sua rotina atual mostra alta disciplina.',
      'O Desafio Implacável é para quem quer ir além nos 90 dias.',
    ],
    accentClass: 'border-orange-500/30 bg-orange-500/10',
    ctaLabel: 'Começar no Desafio Implacável',
  },
}

export function getChallengeRecommendation(id: ChallengeId): ChallengeRecommendationCopy {
  return CHALLENGE_RECOMMENDATION[id]
}

export const DIFFICULTY_HINT =
  '90 dias para todos · Desafio Desafiante, Dominante e Implacável são níveis que você escolhe agora.'
