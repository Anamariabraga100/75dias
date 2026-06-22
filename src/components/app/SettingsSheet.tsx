import { useNavigate } from 'react-router-dom'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import { UserAvatar } from '../ui/UserAvatar'
import { useAppStore } from '../../store/useAppStore'
import { getPlanDisplayLabel } from '../../lib/pricing'
import { LEVEL_META } from '../ui/ChallengeLevelCard'
import { signOut } from '../../lib/auth'

interface SettingsSheetProps {
  onClose: () => void
}

export function SettingsSheet({ onClose }: SettingsSheetProps) {
  const navigate = useNavigate()
  const {
    name,
    email,
    avatarUrl,
    challengeId,
    challengeAccepted,
    selectedPlan,
    usePromoOffer,
  } = useAppStore()

  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Reset90'
  const planLabel = getPlanDisplayLabel(selectedPlan, usePromoOffer)
  const levelLabel = challengeId ? LEVEL_META[challengeId].label : 'Nenhum'

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="p-5">
        <h3 className="font-bold text-lg text-app-fg mb-4">Configurações</h3>

        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-surface-light border border-app-border">
          <UserAvatar name={name} avatarUrl={avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            <p className="text-app-muted text-xs truncate">{email || 'Conta local'}</p>
          </div>
        </div>

        <dl className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-app-muted">Plano</dt>
            <dd className="font-medium text-app-fg text-right">{planLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-app-muted">Desafio</dt>
            <dd className="font-medium text-app-fg text-right">
              {challengeAccepted ? levelLabel : 'Não iniciado'}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/app/progresso')
          }}
          className="w-full btn-primary-themed font-bold py-3 rounded-xl text-sm mb-3"
        >
          Ver meu progresso
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-900/60 bg-red-950/30 hover:bg-red-950/50 transition-colors"
        >
          Sair da conta
        </button>
      </BottomSheetPanel>
    </BottomSheet>
  )
}
