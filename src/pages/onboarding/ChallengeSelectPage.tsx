import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'
import { CHALLENGES } from '../../store/useAppStore'

export function ChallengeSelectPage() {
  const navigate = useNavigate()
  const hard = CHALLENGES.hard

  return (
    <OnboardingLayout>
      <PageTitle title="Escolha um desafio" />

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate('/onboarding/niveis')}
          className="flex-1 bg-white text-black rounded-2xl py-4 px-5 font-bold flex items-center justify-between"
        >
          Criar meu desafio
          <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <ArrowRight size={16} className="text-white" />
          </span>
        </button>
        <button className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center shrink-0">
          <Search size={20} className="text-neutral-400" />
        </button>
      </div>

      <p className="text-neutral-500 text-sm text-center mb-4">
        Ou escolha um desafio abaixo ↓
      </p>

      <div
        className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
        onClick={() => navigate('/onboarding/niveis')}
      >
        <img
          src={hard.image}
          alt={hard.name}
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="inline-block bg-accent-orange text-white text-xs font-bold px-3 py-1 rounded-lg mb-2">
            {hard.badge}
          </span>
          <h2 className="text-2xl font-bold mb-3">{hard.name}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {hard.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="bg-black/60 text-xs text-neutral-300 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="!w-auto flex-1 !py-3">
              Personalizar
            </Button>
            <Button className="!w-auto flex-1 !py-3" onClick={() => navigate('/onboarding/niveis')}>
              Iniciar
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
