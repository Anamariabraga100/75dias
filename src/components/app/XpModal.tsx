import { useEffect, useState } from 'react'
import { CheckCircle2, Shield, Zap } from 'lucide-react'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import { useAppStore } from '../../store/useAppStore'
import {
  formatXp,
  XP_PER_DAY,
  XP_PER_HABIT,
  XP_PER_SCIENCE,
  XP_PER_STREAK_7,
  XP_PER_TIER_UNLOCK,
} from '../../lib/xp'
import {
  COMING_SOON_REWARDS,
  DISCIPLINE_SHIELD_COST,
  MAX_DISCIPLINE_SHIELDS,
  canPurchaseShield,
} from '../../lib/rewards'

type XpModalProps = {
  onClose: () => void
}

export function XpModal({ onClose }: XpModalProps) {
  const {
    totalXp,
    disciplineShields,
    purchaseDisciplineShield,
  } = useAppStore()

  const [justPurchased, setJustPurchased] = useState(false)
  const canBuy = canPurchaseShield(disciplineShields, totalXp)
  const shieldsFull = disciplineShields >= MAX_DISCIPLINE_SHIELDS

  useEffect(() => {
    if (!justPurchased) return
    const timer = window.setTimeout(() => setJustPurchased(false), 4000)
    return () => window.clearTimeout(timer)
  }, [justPurchased])

  const handlePurchase = () => {
    if (!purchaseDisciplineShield()) return
    setJustPurchased(true)
  }

  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5 max-h-[85vh] overflow-y-auto">
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
            <Zap size={28} className="text-amber-400" />
          </div>
          <p className="text-3xl font-black tabular-nums text-white">{formatXp(totalXp)}</p>
          <p className="text-neutral-400 text-sm">seu XP acumulado</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 mb-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Como você ganha XP
          </p>
          {[
            { label: 'Completar um hábito', xp: XP_PER_HABIT },
            { label: 'Completar o dia', xp: XP_PER_DAY },
            { label: 'Ler insight de hábitos', xp: XP_PER_SCIENCE },
            { label: 'Sequência de 7 dias', xp: XP_PER_STREAK_7 },
            { label: 'Desbloquear um nível', xp: XP_PER_TIER_UNLOCK },
          ].map((row) => (
            <p key={row.label} className="text-sm text-neutral-300 flex items-center justify-between">
              <span>{row.label}</span>
              <span className="font-bold text-amber-400">+{row.xp} XP</span>
            </p>
          ))}
        </div>

        {justPurchased && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 mb-4 flex items-start gap-3">
            <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300 text-sm">Escudo adicionado ao inventário!</p>
              <p className="text-emerald-400/80 text-xs mt-1 leading-relaxed">
                Você tem {disciplineShields} escudo{disciplineShields !== 1 ? 's' : ''} guardado
                {disciplineShields !== 1 ? 's' : ''}. Se esquecer de abrir o app, ele ativa sozinho e
                salva sua investida.
              </p>
            </div>
          </div>
        )}

        {disciplineShields > 0 && (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                <Shield size={22} className="text-sky-300" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm">
                  {disciplineShields} escudo{disciplineShields !== 1 ? 's' : ''} no inventário
                </p>
                <p className="text-sky-200/70 text-xs mt-1 leading-relaxed">
                  Se você esquecer de entrar no app, o escudo ativa sozinho e protege a sequência —
                  você verá um aviso na próxima vez.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Loja de recompensas
            </p>
            <span className="text-[10px] text-sky-400/80 tabular-nums font-semibold">
              🛡️ {disciplineShields}/{MAX_DISCIPLINE_SHIELDS}
            </span>
          </div>

          <div
            className={`rounded-xl border p-4 transition-colors ${
              disciplineShields > 0
                ? 'border-sky-500/40 bg-sky-500/15'
                : 'border-sky-500/30 bg-sky-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">Escudo de Disciplina</p>
                <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                  Protege 1 dia perdido na sua sequência. Máximo de {MAX_DISCIPLINE_SHIELDS} escudos
                  acumulados. Não protege dias consecutivos.
                </p>
                <p className="text-amber-400 text-xs font-bold mt-2">{DISCIPLINE_SHIELD_COST} XP</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePurchase}
              disabled={!canBuy}
              className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                canBuy
                  ? 'bg-sky-500 text-black hover:bg-sky-400'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {shieldsFull
                ? 'Estoque cheio (máx. 2)'
                : totalXp < DISCIPLINE_SHIELD_COST
                  ? `Faltam ${formatXp(DISCIPLINE_SHIELD_COST - totalXp)} XP`
                  : 'Comprar escudo'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 mb-5">
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-2">
            Em breve na loja
          </p>
          <ul className="space-y-1.5">
            {COMING_SOON_REWARDS.map((item) => (
              <li key={item.label} className="text-neutral-500 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{item.emoji}</span>
                  {item.label}
                </span>
                <span className="text-neutral-600 tabular-nums">{item.cost} XP</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-amber-400 text-black font-bold py-3 rounded-xl text-sm"
        >
          Fechar
        </button>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
