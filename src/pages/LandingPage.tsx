import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Logo } from '../components/ui/Logo'

const CARDS = [
  {
    title: 'Iniciante',
    badge: 'INICIANTE',
    badgeColor: 'bg-accent-green text-black',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=600&fit=crop',
  },
  {
    title: 'Implacável',
    badge: 'IMPLACÁVEL',
    badgeColor: 'bg-accent-orange text-white',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=600&fit=crop',
    featured: true,
  },
  {
    title: 'Reset90',
    badge: '90 DIAS',
    badgeColor: 'bg-accent-yellow text-black',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh">
        <div className="relative h-[45vh] overflow-hidden">
          <div className="flex gap-3 px-4 pt-6 h-full items-end justify-center">
            {CARDS.map((card, i) => (
              <div
                key={card.title}
                className={`relative rounded-2xl overflow-hidden shrink-0 transition-all ${
                  card.featured ? 'w-36 h-52 z-10' : 'w-28 h-44 opacity-70'
                }`}
                style={{ transform: i === 0 ? 'rotate(-4deg)' : i === 2 ? 'rotate(4deg)' : '' }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mb-1 ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                  <p className="text-white font-bold text-sm leading-tight">
                    {card.title}
                    <br />
                    <span className="text-xs font-normal text-neutral-300">Desafio</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-8">
          <div className="text-center mb-8 mt-4">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold mt-6 mb-3">90 dias. Reset total.</h1>
            <p className="text-neutral-400 text-base leading-relaxed">
              Disciplina, corpo e mente — reconstrua sua rotina do zero com o Reset90
            </p>
          </div>

          <div className="mt-auto space-y-3">
            <Button onClick={() => navigate('/onboarding/pronto')}>Começar</Button>
            <Button variant="outline" onClick={() => navigate('/app')}>
              Já tenho conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
