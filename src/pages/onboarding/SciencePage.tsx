import { useNavigate } from 'react-router-dom'
import { OnboardingLayout, PageTitle } from '../../components/layout/OnboardingLayout'
import { Button } from '../../components/ui/Button'

const FINDINGS = [
  'Repetição no mesmo contexto (horário, local, gatilho) é o principal mecanismo de formação de hábitos.',
  'A automaticidade cresce de forma gradual — os primeiros dias exigem mais esforço consciente.',
  'Hábitos consolidados persistem mesmo quando a motivação cai, porque são acionados pelo ambiente.',
  'Substituir hábitos antigos exige mudar o contexto, não depender só de força de vontade.',
]

export function SciencePage() {
  const navigate = useNavigate()

  return (
    <OnboardingLayout
      footer={<Button onClick={() => navigate('/onboarding/resultado')}>Continuar</Button>}
    >
      <PageTitle
        title="Método baseado em ciência"
        subtitle="O Reset90 aplica o que a psicologia comprova sobre formação de hábitos"
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <article className="bg-surface rounded-2xl overflow-hidden border border-neutral-800">
          <div className="p-5 flex gap-4 border-b border-neutral-800">
            <div className="w-14 h-14 bg-surface-light rounded-xl flex items-center justify-center text-2xl shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <p className="text-accent-blue text-xs font-bold uppercase tracking-wide mb-1">
                Revisão científica · 2016
              </p>
              <p className="font-semibold text-sm leading-snug">
                Psychology of Habit
              </p>
              <p className="text-neutral-500 text-xs mt-0.5">
                Wood, W., &amp; Rünger, D. · Annual Review of Psychology
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <blockquote className="text-neutral-200 text-sm leading-relaxed border-l-2 border-accent-blue pl-4">
              Hábitos se formam por ações repetidas em contextos estáveis — não por motivação
              passageira. Com o tempo, o cérebro transfere o comportamento de sistemas
              deliberativos para sistemas automáticos.
            </blockquote>

            <div>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-wide mb-2">
                O que a pesquisa comprova
              </p>
              <ul className="space-y-2">
                {FINDINGS.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-neutral-300 leading-relaxed">
                    <span className="text-accent-green shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/40 rounded-xl p-4">
              <p className="text-neutral-300 text-sm leading-relaxed">
                <span className="text-white font-semibold">Por isso 90 dias:</span> estudos
                indicam que a consolidação de hábitos leva semanas a meses de repetição
                consistente. O Reset90 foi desenhado nessa janela — tempo suficiente para
                rotinas sobreviverem aos altos e baixos da motivação.
              </p>
            </div>
          </div>

          <footer className="px-5 py-4 bg-neutral-900/50 border-t border-neutral-800">
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Wood, W., &amp; Rünger, D. (2016). Psychology of Habit.{' '}
              <span className="italic">Annual Review of Psychology</span>, 67, 289–314.
            </p>
          </footer>
        </article>
      </div>
    </OnboardingLayout>
  )
}
