import { Flame, Sprout, X } from 'lucide-react'
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
  investidaStreak?: number
  userName?: string
  onConfirm: () => void
  onCancel: () => void
  /** Oferece descer para Explorador em vez de zerar tudo. */
  onDowngradeToBasic?: () => void
}

type ChallengeConfirmModalProps = AcceptProps | QuitProps

export function ChallengeConfirmModal(props: ChallengeConfirmModalProps) {
  const { onCancel } = props
  const isAccept = props.type === 'accept'
  const levelLabel = LEVEL_META[props.challengeId].label
  const canOfferBasic =
    !isAccept &&
    props.challengeId !== 'iniciante' &&
    typeof props.onDowngradeToBasic === 'function'

  const streak =
    !isAccept && typeof props.investidaStreak === 'number' ? props.investidaStreak : 0
  const day = !isAccept ? props.currentDay : 0
  const name = !isAccept ? props.userName?.trim() : undefined

  return (
    <BottomSheet onClose={onCancel} className="bg-black/70">
      <BottomSheetPanel className="p-5 w-full min-w-0">
        <div className="w-full min-w-0">
          <div className="flex items-start justify-between gap-3 mb-5 w-full">
            <div
              className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border ${
                isAccept
                  ? 'bg-sky-500/10 border-sky-500/20'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              <Flame
                size={20}
                className={isAccept ? 'text-sky-400' : 'text-neutral-300'}
              />
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 shrink-0 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {isAccept ? (
            <>
              <h3 className="font-bold text-lg mb-2 tracking-tight">Você está se comprometendo</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                {props.userName ? `${props.userName}, ao` : 'Ao'} aceitar o nível{' '}
                <span className="text-white font-semibold">{levelLabel}</span>, você assume um
                compromisso de 90 dias consigo mesmo.
              </p>
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 mb-5 space-y-2 text-sm text-neutral-400 leading-relaxed">
                <p>
                  <span className="text-neutral-200 font-medium">Ninguém fará por você.</span>{' '}
                  Cumprir os hábitos depende da sua disciplina e honestidade ao marcar cada dia.
                </p>
                <p>
                  O Reset90 dá a estrutura — a transformação vem de aparecer todos os dias, mesmo
                  sem motivação.
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                Pausar o desafio
              </p>
              <h3 className="font-bold text-xl mb-2 tracking-tight text-white leading-snug">
                {name ? `${name}, tem certeza?` : 'Tem certeza?'}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-5">
                Você está no{' '}
                <span className="text-neutral-200 font-medium">{levelLabel}</span>
                {day > 1 && (
                  <>
                    {' '}
                    · dia <span className="text-neutral-200 font-medium">{day}</span>
                  </>
                )}
                {streak > 0 && (
                  <>
                    {' '}
                    ·{' '}
                    <span className="text-neutral-200 font-medium">
                      {streak} dia{streak !== 1 ? 's' : ''} de investida
                    </span>
                  </>
                )}
                .
              </p>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 mb-3 space-y-3">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Zerar o desafio apaga o progresso desta jornada — a sequência, o XP e o ritmo que
                  você já construiu.
                </p>
                <p className="text-xs text-neutral-500 leading-relaxed border-t border-neutral-800/80 pt-3">
                  A assinatura permanece ativa até você cancelar no portal. Desistir do desafio não
                  cancela o plano.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#0f1110] p-4 mb-5">
                <p className="text-sm text-neutral-400 leading-relaxed">
                  <span className="text-neutral-200 font-medium">Dá para continuar.</span> Um dia
                  fraco não apaga o caminho — sumir, sim. Se o nível atual está pesado, dá para
                  ajustar sem jogar tudo fora.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm hover:bg-neutral-100 transition-colors"
                >
                  Continuar no desafio
                </button>

                {canOfferBasic && (
                  <button
                    type="button"
                    onClick={props.onDowngradeToBasic}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm font-medium hover:border-neutral-600 hover:bg-neutral-900/80 transition-colors"
                  >
                    <Sprout size={16} className="text-neutral-400" />
                    Trocar para o Explorador
                  </button>
                )}

                <button
                  type="button"
                  onClick={props.onConfirm}
                  className="w-full py-3 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Desistir e zerar progresso
                </button>
              </div>
            </>
          )}
        </div>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
