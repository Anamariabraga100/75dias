import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { CHALLENGES, useAppStore, type ChallengeId } from '../../store/useAppStore'

export function ChallengeLevelsPage() {
  const navigate = useNavigate()
  const { setChallengeId } = useAppStore()
  const challenges = [CHALLENGES.hard, CHALLENGES.medium, CHALLENGES.soft]

  const start = (id: ChallengeId) => {
    setChallengeId(id)
    navigate('/onboarding/inicio')
  }

  return (
    <OnboardingLayout showLogo={false} showBack>
      <div className="space-y-6 overflow-y-auto scrollbar-hide flex-1 pb-4">
        {challenges.map((c) => (
          <div key={c.id} className="relative rounded-3xl overflow-hidden">
            <img src={c.image} alt={c.name} className="w-full h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-lg mb-2 ${c.badgeColor}`}
              >
                {c.badge}
              </span>
              <h2 className="text-3xl font-bold mb-3">{c.name}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-black/60 text-xs text-neutral-300 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="!w-auto flex-1 !py-3">
                  Personalizar
                </Button>
                <Button className="!w-auto flex-1 !py-3" onClick={() => start(c.id)}>
                  Iniciar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </OnboardingLayout>
  )
}
