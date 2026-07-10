import { Zap } from 'lucide-react'
import { CHALLENGES, type ChallengeId } from '../../../store/useAppStore'

const FOOTER_QUOTES = [
  'Você é mais forte do que imagina. Um dia de cada vez. Rumo ao seu melhor.',
  'A disciplina de hoje constrói o corpo e a mente de amanhã.',
  'Não precisa ser perfeito — precisa aparecer. De novo. E de novo.',
] as const

type HomeMotivationFooterProps = {
  challengeId: ChallengeId
  programDay: number
}

export function HomeMotivationFooter({ challengeId, programDay }: HomeMotivationFooterProps) {
  const challenge = CHALLENGES[challengeId]
  const quote = FOOTER_QUOTES[(programDay - 1) % FOOTER_QUOTES.length]

  return (
    <section className="home-section">
      <div className="relative rounded-3xl overflow-hidden border border-neutral-800/80 bg-[#111111] min-h-[100px]">
        <img
          src={challenge.image}
          alt=""
          className="absolute right-0 top-0 h-full w-2/5 object-cover object-top opacity-40"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/95 to-transparent" />

        <div className="relative z-10 p-4 flex items-center gap-3 pr-[38%]">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed font-medium">{quote}</p>
        </div>
      </div>
    </section>
  )
}
