import { useState } from 'react'
import { Brain, Check, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { getAccentStyle, getDailyScienceCards } from '../../../lib/habitScience'
import { useAppStore } from '../../../store/useAppStore'

type HomeScienceInsightsProps = {
  displayDay: number
}

export function HomeScienceInsights({ displayDay }: HomeScienceInsightsProps) {
  const { readScienceCardIds, markScienceCardRead } = useAppStore()
  const cards = getDailyScienceCards(displayDay, 2)
  const [activeIndex, setActiveIndex] = useState(0)

  const card = cards[activeIndex]
  const style = getAccentStyle(card.accent)
  const isRead = readScienceCardIds.includes(card.id)

  const markRead = () => {
    markScienceCardRead(card.id)
  }

  const goPrev = () => {
    setActiveIndex((i) => (i > 0 ? i - 1 : cards.length - 1))
  }

  const goNext = () => {
    setActiveIndex((i) => (i < cards.length - 1 ? i + 1 : 0))
  }

  return (
    <section className="home-section">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
            <Brain size={16} className="text-sky-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Ciência dos hábitos
            </h2>
            <p className="text-[11px] text-neutral-600 mt-0.5">Aprenda em 30 segundos</p>
          </div>
        </div>
        {cards.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
              aria-label="Insight anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
              aria-label="Próximo insight"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div
        className={`rounded-3xl border ${style.border} ${style.bg} p-4 transition-all duration-300`}
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black/30 flex items-center justify-center shrink-0 text-2xl">
            {card.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wide ${style.text}`}>
                Sabia que?
              </span>
              {isRead && (
                <span className="text-[9px] font-bold text-accent-green flex items-center gap-0.5">
                  <Check size={10} />
                  Lido
                </span>
              )}
            </div>
            <p className="font-bold text-white text-sm leading-snug mb-2">{card.title}</p>
            <p className="text-neutral-400 text-sm leading-relaxed">{card.fact}</p>
            <p className="text-neutral-600 text-[10px] mt-2.5 italic">— {card.source}</p>
          </div>
        </div>

        {!isRead && (
          <button
            type="button"
            onClick={markRead}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black/25 border border-white/5 text-sm font-semibold text-neutral-300 hover:bg-black/40 hover:text-white transition-colors"
          >
            <Lightbulb size={15} className={style.text} />
            Entendi · +10 XP
          </button>
        )}
      </div>

      {cards.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-accent-green' : 'w-1.5 bg-neutral-700'
              }`}
              aria-label={`Insight ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
