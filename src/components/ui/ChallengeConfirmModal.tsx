import { AlertTriangle, Flame, X } from 'lucide-react'
import { Button } from './Button'
import { BottomSheet, BottomSheetPanel } from './BottomSheet'
import { LEVEL_META } from './ChallengeLevelCard'
import type { ChallengeId } from '../../store/useAppStore'

type AcceptProps = {
  type: 'accept'
  challengeId: ChallengeId
  userName?: string
  onConfirm: () => void
  onCancel: () => void
}

type QuitProps = {
  type: 'quit'
  challengeId: ChallengeId
  currentDay: number
  onConfirm: () => void
  onCancel: () => void
}

type ChallengeConfirmModalProps = AcceptProps | QuitProps

export function ChallengeConfirmModal(props: ChallengeConfirmModalProps) {
  const { onCancel } = props
  const isAccept = props.type === 'accept'
  const levelLabel = LEVEL_META[props.challengeId].label

  return (
    <BottomSheet onClose={onCancel} className="bg-black/80">
      <BottomSheetPanel className="p-5 w-full min-w-0">
        <div className="w-full min-w-0">
          <div className="flex items-start justify-between gap-3 mb-4 w-full">
            <div
              className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${
                isAccept ? 'bg-accent-blue/20' : 'bg-red-500/20'
              }`}
            >
              {isAccept ? (
                <Flame size={22} className="text-accent-blue" />
              ) : (
                <AlertTriangle size={22} className="text-red-400" />
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 shrink-0 rounded-full bg-neutral-800 flex items-center justify-center"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

        {isAccept ? (
          <>
            <h3 className="font-bold text-lg mb-2">Você está se comprometendo</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              {props.userName ? `${props.userName}, ao` : 'Ao'} aceitar o nível{' '}
              <span className="text-white font-semibold">{levelLabel}</span>, você assume um
              compromisso de 90 dias consigo mesmo.
            </p>
            <div className="bg-neutral-900 rounded-xl p-4 mb-5 space-y-2 text-sm text-neutral-300">
              <p>
                <span className="text-white font-medium">Ninguém fará por você.</span> Cumprir os
                hábitos diários depende exclusivamente da sua disciplina e honestidade ao marcar
                cada dia.
              </p>
              <p>
                O Reset90 te dá estrutura — mas a transformação só acontece se você aparecer todos
                os dias, mesmo quando não estiver motivado.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={props.onConfirm}>{LEVEL_META[props.challengeId].ctaConfirm}</Button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Ainda não estou pronto
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-2">Desistir do desafio?</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Se você desistir agora, perderá todo o progresso do nível{' '}
              <span className="text-white font-semibold">{levelLabel}</span>
              {props.currentDay > 1 && (
                <>
                  {' '}
                  — incluindo seus{' '}
                  <span className="text-accent-orange font-semibold">
                    {props.currentDay} dias de disciplina
                  </span>
                </>
              )}
              .
            </p>
            <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-4 mb-5 text-sm text-neutral-300 space-y-2">
              <p>
                Ao aceitar um desafio novamente, você{' '}
                <span className="text-white font-medium">recomeça do dia 1</span> — como se fosse a
                primeira vez.
              </p>
              <p className="text-neutral-500">
                Não há como recuperar os dias já cumpridos depois de desistir.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button variant="danger" onClick={props.onConfirm}>
                Sim, desistir
              </Button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Continuar no desafio
              </button>
            </div>
          </>
        )}
        </div>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
