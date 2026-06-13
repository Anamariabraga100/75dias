import { useNavigate } from 'react-router-dom'
import { BarChart2, Flag, LogOut, Settings } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { LEVEL_META } from '../ui/ChallengeLevelCard'
import { getPlanDisplayLabel } from '../../lib/pricing'
import { getDisplayDay, TOTAL_PROGRAM_DAYS } from '../../lib/demoProgress'
import { HeaderDropdown } from '../ui/HeaderDropdown'
import type { RefObject } from 'react'

type ProfileDropdownProps = {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
}

export function ProfileDropdown({ anchorRef, open, onClose }: ProfileDropdownProps) {
  const navigate = useNavigate()
  const {
    name,
    challengeAccepted,
    challengeId,
    currentDay,
    selectedPlan,
    usePromoOffer,
  } = useAppStore()

  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Reset90'
  const initial = displayName.charAt(0)
  const planLabel = getPlanDisplayLabel(selectedPlan, usePromoOffer)
  const levelLabel = challengeId ? LEVEL_META[challengeId].label : 'Sem desafio ativo'
  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const email = name
    ? `${name.toLowerCase().replace(/\s+/g, '')}@reset90.app`
    : 'membro@reset90.app'

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  const items = [
    {
      icon: BarChart2,
      label: 'Meu progresso',
      onClick: () => go('/app/progresso'),
    },
    {
      icon: Flag,
      label: challengeAccepted ? `Desafio · ${levelLabel}` : 'Escolher desafio',
      onClick: () => go('/app'),
    },
    {
      icon: Settings,
      label: 'Configurações',
      onClick: onClose,
      muted: true,
    },
  ]

  return (
    <HeaderDropdown anchorRef={anchorRef} open={open} onClose={onClose} width={280}>
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-purple-600 flex items-center justify-center text-sm font-bold border-2 border-neutral-700 shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{displayName}</p>
          <p className="text-neutral-500 text-xs truncate">{email}</p>
        </div>
      </div>

      <div className="px-4 py-2.5 border-b border-neutral-800 grid grid-cols-2 gap-2 text-center">
        <div className="bg-neutral-900/60 rounded-lg py-2">
          <p className="text-[10px] text-neutral-500">Dia</p>
          <p className="font-bold text-sm">
            {displayDay}
            <span className="text-neutral-500 font-medium">/{TOTAL_PROGRAM_DAYS}</span>
          </p>
        </div>
        <div className="bg-neutral-900/60 rounded-lg py-2">
          <p className="text-[10px] text-neutral-500">Plano</p>
          <p className="font-bold text-[11px] truncate px-1">{planLabel.replace('Plano ', '')}</p>
        </div>
      </div>

      <div className="py-1">
        {items.map(({ icon: Icon, label, onClick, muted }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-900/60 ${
              muted ? 'text-neutral-500' : 'text-neutral-200'
            }`}
          >
            <Icon size={16} className="shrink-0 text-neutral-400" />
            {label}
          </button>
        ))}
      </div>

      <div className="border-t border-neutral-800 py-1">
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-500 hover:bg-neutral-900/60 transition-colors"
        >
          <LogOut size={16} className="shrink-0" />
          Sair
        </button>
      </div>
    </HeaderDropdown>
  )
}
