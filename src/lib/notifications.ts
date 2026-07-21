import {
  Camera,
  CheckCircle2,
  Flame,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import type { ChallengeId } from '../store/useAppStore'
import { CHALLENGES } from '../store/useAppStore'
import { getDisplayDay, TOTAL_PROGRAM_DAYS } from './demoProgress'
import { getPhotoDaysUpTo, isPhotoDay } from './photoSchedule'

export type NotificationKind =
  | 'habits'
  | 'photo_due'
  | 'photo_missed'
  | 'milestone'
  | 'motivation'
  | 'streak'

export interface AppNotification {
  id: string
  kind: NotificationKind
  icon: LucideIcon
  color: string
  bg: string
  tag: string
  title: string
  body: string
  time: string
  priority: number
  unread: boolean
  action?: { path: string; hash?: string }
}

export interface NotificationState {
  challengeAccepted: boolean
  challengeId: ChallengeId | null
  currentDay: number
  investidaStreak?: number
  mirrorPhotos: Record<number, string>
  taskChecksByDay: Record<number, Record<string, boolean>>
  readNotificationIds: string[]
  dismissedNotificationIds: string[]
}

const MOTIVATION_LINES = [
  'Você não precisa estar motivado — precisa aparecer. Marque seus hábitos hoje.',
  'Disciplina vence motivação. Um dia de cada vez.',
  'O espelho muda devagar; a consistência muda tudo.',
  'Faça o mínimo hoje. Amanhã fica mais fácil.',
]

function isRead(id: string, readIds: string[]) {
  return readIds.includes(id)
}

function pendingCheckTasks(
  challengeId: ChallengeId,
  day: number,
  taskChecksByDay: Record<number, Record<string, boolean>>
) {
  const checks = taskChecksByDay[day] ?? {}
  return CHALLENGES[challengeId].tasks.filter(
    (t) => t.type === 'check' && !checks[t.id]
  )
}

export function buildNotifications(state: NotificationState): AppNotification[] {
  const {
    challengeAccepted,
    challengeId,
    currentDay,
    investidaStreak = 0,
    mirrorPhotos,
    taskChecksByDay,
    readNotificationIds,
    dismissedNotificationIds,
  } = state

  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const items: Omit<AppNotification, 'unread'>[] = []

  if (!challengeAccepted || !challengeId) {
    items.push({
      id: 'motivation-start',
      kind: 'motivation',
      icon: Sparkles,
      color: 'text-accent-yellow',
      bg: 'bg-accent-yellow/10',
      tag: 'Motivação',
      title: 'Comece seu Reset90',
      body: 'Escolha um nível de desafio na aba Início e dê o primeiro passo.',
      time: 'Agora',
      priority: 10,
      action: { path: '/app' },
    })
    if (dismissedNotificationIds.includes('motivation-start')) {
      return []
    }
    return [
      {
        ...items[0],
        unread: !isRead('motivation-start', readNotificationIds),
      },
    ]
  }

  const pending = pendingCheckTasks(challengeId, displayDay, taskChecksByDay)
  if (pending.length > 0) {
    items.push({
      id: `habits-pending-${displayDay}`,
      kind: 'habits',
      icon: CheckCircle2,
      color: 'text-accent-green',
      bg: 'bg-accent-green/10',
      tag: 'Aviso',
      title: 'Hábitos pendentes',
      body:
        pending.length === 1
          ? `Falta marcar: ${pending[0].title}. Complete antes de dormir.`
          : `Faltam ${pending.length} hábitos para fechar o dia. Complete antes de dormir.`,
      time: 'Agora',
      priority: 100,
      action: { path: '/app' },
    })
  }

  const isImplacavel = challengeId === 'implacavel'

  if (isImplacavel && isPhotoDay(displayDay) && !mirrorPhotos[displayDay]) {
    items.push({
      id: `photo-due-${displayDay}`,
      kind: 'photo_due',
      icon: Camera,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      tag: 'Lembrete',
      title: 'Tire a foto do shape',
      body: `Dia ${displayDay}: tire a foto agora — mesmo ângulo, luz e pose.`,
      time: 'Agora',
      priority: 95,
      action: { path: '/app', hash: 'tarefas-hoje' },
    })
  }

  if (isImplacavel) {
    const missed = getPhotoDaysUpTo(displayDay).filter(
      (d) => d < displayDay && !mirrorPhotos[d]
    )
    if (missed.length > 0) {
      const latestMissed = Math.max(...missed)
      items.push({
        id: `photo-missed-${latestMissed}`,
        kind: 'photo_missed',
        icon: Camera,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        tag: 'Pendência',
        title: 'Foto do shape perdida',
        body:
          missed.length === 1
            ? `Faltou a foto do dia ${latestMissed}.`
            : `${missed.length} fotos em aberto. A mais recente: dia ${latestMissed}.`,
        time: 'Pendente',
        priority: 70,
        action: { path: '/app/progresso', hash: 'evolucao' },
      })
    }
  }

  if (challengeAccepted) {
    if (investidaStreak === 0) {
      items.push({
        id: 'streak-broken',
        kind: 'streak',
        icon: Flame,
        color: 'text-accent-orange',
        bg: 'bg-accent-orange/10',
        tag: 'Investida',
        title: 'Investida zerada',
        body: 'Você faltou um dia. Progresso e investida voltaram ao Dia 1 — XP permanece. Complete as missões hoje.',
        time: 'Atenção',
        priority: 15,
        action: { path: '/app' },
      })
    } else {
      items.push({
        id: `streak-${investidaStreak}`,
        kind: 'streak',
        icon: Flame,
        color: 'text-accent-orange',
        bg: 'bg-accent-orange/10',
        tag: 'Sequência',
        title: `${investidaStreak} dia${investidaStreak !== 1 ? 's' : ''} de investida`,
        body:
          investidaStreak >= 7
            ? 'Uma semana ou mais sem falhar. Não quebre a corrente hoje.'
            : investidaStreak === 1
              ? 'Primeiro dia da sequência. Volte amanhã para não zerar.'
              : 'Cada dia seguido fortalece quem você está se tornando.',
        time: investidaStreak >= 7 ? 'Marco' : 'Sequência',
        priority: 20,
        action: { path: '/app' },
      })
    }
  }

  const daysLeft = TOTAL_PROGRAM_DAYS - displayDay
  const milestones = [
    { at: 7, label: '1ª semana completa' },
    { at: 30, label: '30 dias — primeiro mês' },
    { at: 60, label: '60 dias — metade do caminho' },
    { at: 90, label: '90 dias — Reset completo' },
  ]

  for (const m of milestones) {
    const remaining = m.at - displayDay
    if (remaining > 0 && remaining <= 5) {
      items.push({
        id: `milestone-${m.at}`,
        kind: 'milestone',
        icon: Trophy,
        color: 'text-accent-blue',
        bg: 'bg-accent-blue/10',
        tag: 'Marco',
        title: m.label,
        body: `Faltam ${remaining} dia${remaining !== 1 ? 's' : ''} para esse marco no Reset90.`,
        time: 'Em breve',
        priority: 25,
        action: { path: '/app/progresso' },
      })
      break
    }
  }

  if (pending.length === 0) {
    items.push({
      id: `motivation-${displayDay}`,
      kind: 'motivation',
      icon: Sparkles,
      color: 'text-accent-yellow',
      bg: 'bg-accent-yellow/10',
      tag: 'Motivação',
      title: 'Disciplina vence motivação',
      body: MOTIVATION_LINES[(displayDay - 1) % MOTIVATION_LINES.length],
      time: daysLeft <= 0 ? 'Final' : `${daysLeft}d restantes`,
      priority: 5,
      action: { path: '/app' },
    })
  }

  items.sort((a, b) => b.priority - a.priority)

  return items
    .filter((n) => !dismissedNotificationIds.includes(n.id))
    .map((n) => ({
      ...n,
      unread: !isRead(n.id, readNotificationIds),
    }))
}

export function countUnreadNotifications(state: NotificationState) {
  return buildNotifications(state).filter((n) => n.unread).length
}

