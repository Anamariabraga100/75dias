import {
  Bell,
  Flame,
  Camera,
  CheckCircle2,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { HeaderDropdown } from '../ui/HeaderDropdown'
import type { RefObject } from 'react'

type NotificationItem = {
  id: string
  icon: LucideIcon
  color: string
  bg: string
  tag: string
  title: string
  body: string
  time: string
  unread?: boolean
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    icon: Sparkles,
    color: 'text-accent-yellow',
    bg: 'bg-accent-yellow/10',
    tag: 'Motivação',
    title: 'Disciplina vence motivação',
    body: 'Você não precisa estar motivado — precisa aparecer. Marque seus hábitos hoje.',
    time: 'Agora',
    unread: true,
  },
  {
    id: '2',
    icon: CheckCircle2,
    color: 'text-accent-green',
    bg: 'bg-accent-green/10',
    tag: 'Aviso',
    title: 'Hábitos pendentes',
    body: 'Faltam itens para fechar o dia. Complete antes de dormir.',
    time: 'Agora',
    unread: true,
  },
  {
    id: '3',
    icon: Flame,
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/10',
    tag: 'Sequência',
    title: 'Não quebre a corrente',
    body: 'Cada dia cumprido fortalece quem você está se tornando.',
    time: '2h atrás',
    unread: false,
  },
  {
    id: '4',
    icon: Camera,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    tag: 'Lembrete',
    title: 'Foto de evolução',
    body: 'Próximo registro em 2 dias — mesmo ângulo e luz (Implacável).',
    time: 'Ontem',
    unread: false,
  },
  {
    id: '5',
    icon: Trophy,
    color: 'text-accent-blue',
    bg: 'bg-accent-blue/10',
    tag: 'Marco',
    title: '1ª semana chegando',
    body: 'Faltam 5 dias para sua primeira semana completa no Reset90.',
    time: '2 dias atrás',
    unread: false,
  },
]

type NotificationsDropdownProps = {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
}

export function NotificationsDropdown({ anchorRef, open, onClose }: NotificationsDropdownProps) {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <HeaderDropdown anchorRef={anchorRef} open={open} onClose={onClose} width={320}>
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-neutral-400" />
          <h3 className="font-bold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-accent-orange/20 text-accent-orange px-1.5 py-0.5 rounded-full">
              {unreadCount} novas
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[min(360px,55dvh)] overflow-y-auto">
        {MOCK_NOTIFICATIONS.map((n) => {
          const Icon = n.icon
          return (
            <button
              key={n.id}
              type="button"
              className="w-full flex gap-3 px-4 py-3 text-left hover:bg-neutral-900/60 transition-colors border-b border-neutral-800/60 last:border-0"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.bg} ${n.color}`}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                    {n.tag}
                  </span>
                  {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />}
                </div>
                <p className="font-semibold text-sm leading-snug">{n.title}</p>
                <p className="text-neutral-400 text-xs leading-relaxed mt-0.5">{n.body}</p>
                <p className="text-neutral-600 text-[10px] mt-1">{n.time}</p>
              </div>
            </button>
          )
        })}
      </div>
    </HeaderDropdown>
  )
}
