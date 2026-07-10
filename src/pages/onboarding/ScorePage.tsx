import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { ProfileResultSummary } from '../../components/onboarding/ProfileResultSummary'
import { getChallengeRecommendation } from '../../lib/challengeRecommendation'
import { useAppStore } from '../../store/useAppStore'

export function ScorePage() {
  const navigate = useNavigate()
  const {
    disciplineScore,
    projectedScore,
    profileInsights,
    recommendedChallenge,
    computeScores,
  } = useAppStore()

  useEffect(() => {
    computeScores()
  }, [computeScores])

  const challengeId = recommendedChallenge ?? 'intermediario'
  const recommendation = getChallengeRecommendation(challengeId)
  const whyLines = profileInsights?.recommendationWhy ?? recommendation.whyLines

  return (
    <OnboardingLayout
      gradient="blue"
      showLogo
      footer={
        <Button onClick={() => navigate('/onboarding/criando')}>
          Montar meu plano de 90 dias
        </Button>
      }
    >
      <p className="text-neutral-500 text-xs mb-1 uppercase tracking-widest">Diagnóstico pronto</p>
      <h1 className="text-2xl font-black mb-4 leading-tight">
        Seu perfil está pronto
      </h1>

      <ProfileResultSummary
        disciplineScore={disciplineScore}
        projectedScore={projectedScore}
        recommendedChallenge={challengeId}
        whyLines={whyLines}
        priorityActions={profileInsights?.priorityActions}
        compact
      />
    </OnboardingLayout>
  )
}
