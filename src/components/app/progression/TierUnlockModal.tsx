import { Sparkles } from 'lucide-react'
import { BottomSheet, BottomSheetPanel } from '../../ui/BottomSheet'
import { Button } from '../../ui/Button'
import type { ChallengeId } from '../../../store/useAppStore'
import { TIER_INFO } from '../../../lib/progressionTiers'

type TierUnlockModalProps = {
  kind: '30' | '60'
  onEvolve: () => void
  onStay: () => void
}

const UNLOCK_TARGET: Record<'30' | '60', ChallengeId> = {
  '30': 'intermediario',
  '60': 'implacavel',
}

const MESSAGES: Record<'30' | '60', { title: string; body: string }> = {
  '30': {
    title: 'Você completou 30 dias.',
    body: 'Agora sua disciplina será levada ao próximo nível.',
  },
  '60': {
    title: 'Você chegou onde poucos chegam.',
    body: 'Seu próximo passo é o nível mais exigente do Reset90.',
  },
}

export function TierUnlockModal({ kind, onEvolve, onStay }: TierUnlockModalProps) {
  const targetId = UNLOCK_TARGET[kind]
  const tier = TIER_INFO[targetId]
  const msg = MESSAGES[kind]
  const currentTier = kind === '30' ? TIER_INFO.iniciante : TIER_INFO.intermediario

  return (
    <BottomSheet onClose={onStay} className="bg-black/85">
      <BottomSheetPanel className="p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-green/15 flex items-center justify-center mx-auto mb-4 home-pulse-dot">
          <Sparkles size={28} className="text-accent-green" />
        </div>

        <p className="text-accent-green text-xs font-bold uppercase tracking-widest mb-2">
          Novo nível desbloqueado!
        </p>
        <h2 className="text-2xl font-black text-white mb-2">🏆 PARABÉNS!</h2>
        <p className="text-neutral-300 text-sm leading-relaxed mb-1">{msg.title}</p>
        <p className="text-neutral-500 text-sm mb-5">{msg.body}</p>

        <div className="rounded-2xl border border-accent-green/30 bg-accent-green/10 py-5 px-4 mb-6">
          <p className="text-neutral-400 text-xs mb-2">Agora você desbloqueou</p>
          <p className="text-3xl font-black text-white">
            {tier.emoji} {tier.label.toUpperCase()}
          </p>
          <ul className="mt-4 space-y-1.5 text-left">
            {tier.features.map((f) => (
              <li key={f} className="text-neutral-400 text-xs flex items-center gap-2">
                <span className="text-accent-green">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onEvolve} className="!bg-accent-green !text-black font-black">
            Evoluir para {tier.label} ⭐
          </Button>
          <button
            type="button"
            onClick={onStay}
            className="w-full py-3 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Continuar no {currentTier.label}
          </button>
        </div>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
