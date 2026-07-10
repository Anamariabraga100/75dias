import { BookOpen, Dumbbell, Lightbulb, Salad } from 'lucide-react'
import { getDailyTip, TIP_CATEGORY_LABELS, type TipCategory } from '../../lib/dailyTips'

const CATEGORY_STYLE: Record<
  TipCategory,
  { icon: typeof BookOpen; color: string; bg: string; border: string }
> = {
  leitura: {
    icon: BookOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
  },
  alimentacao: {
    icon: Salad,
    color: 'text-lime-400',
    bg: 'bg-lime-500/10',
    border: 'border-lime-500/25',
  },
  treino: {
    icon: Dumbbell,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/25',
  },
  mindset: {
    icon: Lightbulb,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
  },
}

type DailyTipCardProps = {
  day: number
}

export function DailyTipCard({ day }: DailyTipCardProps) {
  const tip = getDailyTip(day)
  const style = CATEGORY_STYLE[tip.category]
  const Icon = style.icon

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} p-4 text-left`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
            Dica do dia · {TIP_CATEGORY_LABELS[tip.category]}
          </p>
          <p className="text-xs text-neutral-600">Dia {tip.day}</p>
        </div>
      </div>
      <p className="font-semibold text-sm text-white mb-1.5">{tip.title}</p>
      <p className="text-neutral-400 text-sm leading-relaxed">{tip.body}</p>
      {tip.book && (
        <p className="text-neutral-500 text-xs mt-2.5 pt-2.5 border-t border-white/5">
          📖 Sugestão: <span className="text-neutral-400">{tip.book}</span>
        </p>
      )}
    </div>
  )
}
