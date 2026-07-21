import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Check,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ArrowRight,
  Camera,
  Clock,
} from 'lucide-react'
import { CHALLENGES, useAppStore, type ChallengeId } from '../../store/useAppStore'
import { LEVEL_META } from '../ui/ChallengeLevelCard'
import { isPhotoDay } from '../../lib/photoSchedule'
import { getDisplayDay, normalizeProgramDay, TOTAL_PROGRAM_DAYS } from '../../lib/demoProgress'
import {
  formatUnlockCountdown,
  getDayUnlockStatus,
  isFastDayMode,
} from '../../lib/dayUnlock'
import { getDayMissionProgress } from '../../lib/streak'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'
import { PhotoCheckInSheet } from './PhotoCheckInSheet'
import { DailyTipCard } from './DailyTipCard'

type Task = (typeof CHALLENGES)[ChallengeId]['tasks'][number]

const TASK_COLORS: Record<string, string> = {
  diet: 'bg-lime-600',
  workout: 'bg-red-500',
  read: 'bg-sky-400',
  sleep: 'bg-indigo-500',
  noporn: 'bg-purple-600',
  purity: 'bg-violet-700',
  alcohol: 'bg-rose-700',
  creatine: 'bg-cyan-600',
  photo: 'bg-teal-500',
}

const TASK_MISSION_TAGS: Record<string, { label: string; className: string; ring: string }> = {
  diet: { label: '★ IMPORTANTE', className: 'text-accent-green', ring: 'border-lime-500' },
  workout: { label: '🔥 ENERGIA', className: 'text-red-400', ring: 'border-red-500' },
  read: { label: '★ MENTE', className: 'text-sky-400', ring: 'border-sky-400' },
  sleep: { label: '☾ RECUPERAÇÃO', className: 'text-purple-400', ring: 'border-indigo-500' },
  noporn: { label: '★ FOCO', className: 'text-violet-400', ring: 'border-violet-500' },
  purity: { label: '★ FOCO', className: 'text-violet-400', ring: 'border-violet-500' },
  alcohol: { label: '★ DISCIPLINA', className: 'text-rose-400', ring: 'border-rose-500' },
  creatine: { label: '★ SAÚDE', className: 'text-cyan-400', ring: 'border-cyan-500' },
  photo: { label: '📷 EVOLUÇÃO', className: 'text-teal-400', ring: 'border-teal-500' },
}

const MOTIVATION_MESSAGES = [
  'Você apareceu hoje. Disciplina é repetir mesmo quando ninguém está olhando.',
  'Mais um dia no bolso. A versão que você quer ser agradece cada escolha certa.',
  'Checklist fechado. Descanse com a cabeça leve — amanhã tem mais.',
  'Consistência silenciosa. É assim que o Reset90 transforma quem insiste.',
  'Hoje você venceu a preguiça. Esse é o jogo — um dia de cada vez.',
]

function TaskInfoModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const tips = 'tips' in task && Array.isArray(task.tips) ? task.tips : []

  return (
    <BottomSheet onClose={onClose}>
      <BottomSheetPanel className="flex flex-col animate-fade-in">
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">{task.icon}</span>
              <h3 className="font-bold text-lg leading-tight">{task.title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4 pb-4">
            <div>
              <p className="text-accent-blue text-xs font-bold uppercase tracking-wide mb-1.5">
                Hoje
              </p>
              <p className="text-neutral-300 text-sm leading-relaxed">{task.daily}</p>
            </div>
            <div>
              <p className="text-accent-yellow text-xs font-bold uppercase tracking-wide mb-1.5">
                Na semana
              </p>
              <p className="text-neutral-300 text-sm leading-relaxed">{task.weekly}</p>
            </div>
            {tips.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                  Para não errar
                </p>
                {tips.map((tip) => (
                  <p key={tip} className="text-neutral-300 text-sm leading-relaxed">
                    • {tip}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-5 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm"
          >
            Entendi
          </button>
        </div>
      </BottomSheetPanel>
    </BottomSheet>
  )
}

export function DailyTasksPanel({
  compact = false,
  mission = false,
}: {
  compact?: boolean
  mission?: boolean
}) {
  const navigate = useNavigate()
  const {
    challengeId,
    currentDay,
    challengeAccepted,
    mirrorPhotos,
    registerMirrorPhoto,
    taskChecksByDay,
    toggleTaskCheck,
    dayCompletedAt,
    markCurrentDayComplete,
    advanceProgramDay,
  } = useAppStore()
  const [infoTask, setInfoTask] = useState<Task | null>(null)
  const [showCompletedDetails, setShowCompletedDetails] = useState(false)
  const [showPhotoCheckIn, setShowPhotoCheckIn] = useState(false)
  const [, setUnlockTick] = useState(0)

  const programDay = normalizeProgramDay(currentDay)
  const challenge = challengeId ? CHALLENGES[challengeId] : null
  const meta = challengeId ? LEVEL_META[challengeId] : null
  const tasks = taskChecksByDay[programDay] ?? {}

  const toggleCheck = (id: string) => {
    toggleTaskCheck(programDay, id)
  }

  const completedCount =
    challenge?.tasks.filter((t) => t.type === 'check' && tasks[t.id]).length ?? 0
  const checkTotal = challenge?.tasks.filter((t) => t.type === 'check').length ?? 0
  const displayDay = getDisplayDay(challengeAccepted, currentDay)
  const daysLeft = Math.max(0, TOTAL_PROGRAM_DAYS - displayDay)
  const isImplacavel = challengeId === 'implacavel'
  const photoRequired = isImplacavel && isPhotoDay(programDay)
  const missionProgress = challengeId
    ? getDayMissionProgress(
        challengeId,
        programDay,
        taskChecksByDay,
        mirrorPhotos
      )
    : { done: 0, total: 0, ratio: 0, canFinalize: false, isPerfect: false }
  const dayMarked = Boolean(dayCompletedAt)
  const allDone = dayMarked
  // Só o botão "mesmo assim" — nunca completa sozinho nos 60%.
  const showPartialCompleteCta =
    missionProgress.canFinalize && !missionProgress.isPerfect && !dayMarked
  const progressPctOfDay = Math.round(missionProgress.ratio * 100)
  const motivation =
    MOTIVATION_MESSAGES[(programDay - 1) % MOTIVATION_MESSAGES.length]
  const progressPct = Math.min(
    100,
    Math.round((displayDay / TOTAL_PROGRAM_DAYS) * 100)
  )
  const uiCompact = compact || mission

  const dayUnlock = getDayUnlockStatus({
    challengeAccepted,
    challengeId,
    currentDay,
    taskChecksByDay,
    mirrorPhotos,
    dayCompletedAt,
    now: Date.now(),
  })

  useEffect(() => {
    if (!allDone) setShowCompletedDetails(false)
  }, [allDone])

  // Só fecha automaticamente em 100%. Com 60%+ incompleto, só libera o botão.
  useEffect(() => {
    if (missionProgress.isPerfect && !dayCompletedAt) markCurrentDayComplete()
  }, [missionProgress.isPerfect, dayCompletedAt, markCurrentDayComplete])

  useEffect(() => {
    if (!dayUnlock.canAdvance && dayUnlock.remainingMs > 0) {
      const id = window.setInterval(() => setUnlockTick((t) => t + 1), 1000)
      return () => window.clearInterval(id)
    }
  }, [dayUnlock.canAdvance, dayUnlock.remainingMs])

  useEffect(() => {
    if (dayUnlock.canAdvance) advanceProgramDay()
  }, [dayUnlock.canAdvance, advanceProgramDay])

  if (!challengeId || !challenge || !meta) return null

  const nextDaySection =
    !uiCompact && programDay < TOTAL_PROGRAM_DAYS ? (
      <div className="mt-4 pt-4 border-t border-white/10 text-left">
        {!dayUnlock.canAdvance && dayUnlock.remainingMs > 0 && (
          <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm py-2">
            <Clock size={15} className="shrink-0" />
            <span>
              Próximo dia em{' '}
              <span className="font-semibold text-neutral-200 tabular-nums">
                {formatUnlockCountdown(dayUnlock.remainingMs)}
              </span>
            </span>
          </div>
        )}
        {isFastDayMode() && (
          <button
            type="button"
            onClick={() => advanceProgramDay(true)}
            className="w-full mt-2 text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors py-2"
          >
            ⚡ Avançar dia (modo teste)
          </button>
        )}
        {isFastDayMode() && (
            <p className="text-[10px] text-neutral-600 text-center mt-1">
              Dev: {import.meta.env.DEV ? '10s' : '1 min'} após concluir o dia · ou force abaixo
            </p>
        )}
      </div>
    ) : null

  const progressSummary = (
    <div className="rounded-xl bg-black/30 border border-white/5 p-3 mb-4 text-left">
      <p className="text-neutral-500 text-[10px] uppercase tracking-wide mb-2">Seu progresso</p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div>
          <p className="text-[10px] text-neutral-500">Dia</p>
          <p className="font-bold text-sm tabular-nums">
            {displayDay}
            <span className="text-neutral-500 font-medium">/{TOTAL_PROGRAM_DAYS}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-neutral-500">Concluído</p>
          <p className="font-bold text-sm text-accent-blue tabular-nums">{progressPct}%</p>
        </div>
        <div>
          <p className="text-[10px] text-neutral-500">Faltam</p>
          <p className="font-bold text-sm tabular-nums">
            {daysLeft}
            <span className="text-neutral-500 font-medium text-xs"> dias</span>
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )

  const progressLinks = (
    <div className="flex flex-col gap-2 w-full">
      <button
        type="button"
        onClick={() =>
          navigate(isImplacavel ? '/app/progresso#evolucao' : '/app/progresso')
        }
        className="w-full flex items-center justify-between gap-2 rounded-xl bg-surface border border-app-border px-3 py-2.5 text-left hover:bg-surface-light transition-colors shadow-sm"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-app-fg">
          <BarChart2 size={16} className="text-accent-blue shrink-0" />
          {isImplacavel ? 'Ver evolução no espelho' : 'Ver meu progresso'}
        </span>
        <ArrowRight size={14} className="text-app-muted shrink-0" />
      </button>
    </div>
  )

  const renderTasks = () => {
    // Foto do shape só nos dias de registro (Implacável).
    const visibleTasks = challenge.tasks.filter((task) => {
      if (task.id !== 'photo') return true
      return photoRequired
    })

    return (
    <div className="space-y-2.5">
      {visibleTasks.map((task) => {
        const colorClass = TASK_COLORS[task.id] ?? 'bg-neutral-600'
        const missionTag = TASK_MISSION_TAGS[task.id]
        const done =
          task.type === 'check'
            ? tasks[task.id]
            : task.id === 'photo' && Boolean(mirrorPhotos[programDay])
        const isPhotoTask = task.id === 'photo'
        const openPhotoOrInfo = () => {
          if (isPhotoTask) {
            if (!done) setShowPhotoCheckIn(true)
            return
          }
          setInfoTask(task)
        }

        if (mission) {
          return (
            <div
              key={task.id}
              className={`rounded-2xl border bg-[#111111] overflow-hidden flex transition-all duration-300 hover:border-white/15 ${
                done ? 'border-accent-green/25' : 'border-neutral-800/80'
              }`}
            >
              <button
                type="button"
                onClick={openPhotoOrInfo}
                className={`w-14 flex items-center justify-center shrink-0 ${colorClass} transition-transform active:scale-95`}
                aria-label={
                  isPhotoTask ? 'Tirar foto do shape' : `Abrir explicação de ${task.title}`
                }
              >
                <span className="text-2xl">{task.icon}</span>
              </button>
              <button
                type="button"
                onClick={openPhotoOrInfo}
                className="flex-1 py-3 pr-2 pl-3 flex items-start text-left gap-2 min-w-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <p
                      className={`font-bold text-sm ${
                        done ? 'text-neutral-500 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                    {!isPhotoTask && (
                      <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                        <Info size={11} className="text-neutral-500" />
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      done ? 'text-neutral-600 line-through' : 'text-neutral-500'
                    }`}
                  >
                    {done && isPhotoTask ? 'Foto registrada' : task.previewHint}
                  </p>
                  {missionTag && (
                    <p className={`text-[9px] font-bold mt-1.5 ${missionTag.className}`}>
                      {missionTag.label}
                    </p>
                  )}
                </div>
              </button>
              {task.type === 'check' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCheck(task.id)
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-3 mr-3 ${
                    done
                      ? 'bg-accent-green border-accent-green scale-105'
                      : `${missionTag?.ring ?? 'border-neutral-600'} ${missionTag?.className ?? 'text-neutral-500'} bg-transparent animate-task-check`
                  }`}
                  aria-label={done ? `Desmarcar ${task.title}` : `Marcar ${task.title} como concluída`}
                >
                  {done && <Check size={16} className="text-black" />}
                </button>
              )}
              {isPhotoTask && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!done) setShowPhotoCheckIn(true)
                  }}
                  disabled={done}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-3 mr-3 ${
                    done
                      ? 'bg-accent-green border-accent-green'
                      : 'border-teal-500 text-teal-500 animate-task-check'
                  }`}
                  aria-label={done ? 'Foto já registrada' : 'Tirar foto do shape'}
                >
                  {done ? <Check size={16} className="text-black" /> : <Camera size={16} />}
                </button>
              )}
            </div>
          )
        }

        return (
          <div
            key={task.id}
            className={`bg-surface rounded-2xl overflow-hidden flex border transition-all duration-300 ${
              done
                ? 'border-accent-green/30'
                : isPhotoTask
                  ? 'border-teal-500/40'
                  : 'border-transparent'
            }`}
          >
            <button
              type="button"
              onClick={openPhotoOrInfo}
              className={`w-12 flex items-center justify-center shrink-0 ${colorClass}`}
              aria-label={
                isPhotoTask ? 'Tirar foto do shape' : `Abrir explicação de ${task.title}`
              }
            >
              <span className="text-xl">{task.icon}</span>
            </button>
            <button
              type="button"
              onClick={openPhotoOrInfo}
              className="flex-1 py-3 pr-2 pl-2.5 flex items-start text-left gap-2 min-w-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p
                    className={`font-semibold text-sm ${
                      done ? 'text-neutral-400 line-through' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  {isPhotoTask && !done && (
                    <span className="text-[9px] font-bold text-teal-400 bg-teal-500/15 px-1.5 py-0.5 rounded shrink-0">
                      Hoje
                    </span>
                  )}
                  {!isPhotoTask && (
                    <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                      <Info size={13} className="text-neutral-400" />
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    done ? 'text-neutral-600 line-through' : 'text-neutral-500'
                  }`}
                >
                  {done && isPhotoTask ? 'Foto registrada' : task.previewHint}
                </p>
              </div>
            </button>
            {task.type === 'check' && (
              <button
                type="button"
                onClick={() => toggleCheck(task.id)}
                className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all mt-3 mr-2 ${
                  done
                    ? 'bg-green-500 border-green-500'
                    : 'border-neutral-600 text-neutral-400 bg-neutral-800/50 animate-task-check'
                }`}
                aria-label={done ? `Desmarcar ${task.title}` : `Marcar ${task.title} como concluída`}
              >
                {done && <Check size={16} className="text-white" />}
              </button>
            )}
            {isPhotoTask && (
              <button
                type="button"
                onClick={() => !done && setShowPhotoCheckIn(true)}
                disabled={done}
                className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all mt-3 mr-2 ${
                  done
                    ? 'bg-green-500 border-green-500'
                    : 'border-teal-500 bg-teal-500/15 text-teal-500 animate-task-check'
                }`}
                aria-label={done ? 'Foto já registrada' : 'Tirar foto do shape'}
              >
                {done ? <Check size={16} className="text-white" /> : <Camera size={16} />}
              </button>
            )}
            {task.type === 'action' && task.id !== 'photo' && (
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-app-track flex items-center justify-center shrink-0 mt-3 mr-2"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        )
      })}
    </div>
    )
  }


  return (
    <div className="animate-fade-in">
      {!uiCompact && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-wide">Hoje</p>
            <h2 className="text-lg font-bold">
              Dia {programDay} · {meta.label}
            </h2>
          </div>
          {checkTotal > 0 && !allDone && (
            <div className="text-sm font-bold px-3 py-1 rounded-full bg-surface text-neutral-400">
              {completedCount}/{checkTotal}
            </div>
          )}
          {allDone && (
            <div className="text-sm font-bold px-3 py-1 rounded-full bg-accent-green/20 text-accent-green">
              ✓ Completo
            </div>
          )}
        </div>
      )}

      {mission && !allDone && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Hoje · Dia {programDay}
          </h2>
          <span className="text-sm font-bold text-neutral-500 tabular-nums">
            {missionProgress.done}/{missionProgress.total}
          </span>
        </div>
      )}

      {showPartialCompleteCta && (
        <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
          <p className="text-sm text-neutral-300 leading-relaxed mb-3">
            Você concluiu {progressPctOfDay}% das missões ({missionProgress.done} de{' '}
            {missionProgress.total}). Pode seguir nas que faltam ou fechar o dia assim mesmo.
          </p>
          <button
            type="button"
            onClick={() => markCurrentDayComplete({ allowPartial: true })}
            className="w-full py-3 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm font-semibold hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
          >
            Completar o dia mesmo assim
          </button>
        </div>
      )}

      {uiCompact && !mission && allDone && !showCompletedDetails && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Dica e resumo
          </h2>
        </div>
      )}

      {uiCompact && !mission && !allDone && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Hábitos de hoje
            </h2>
            <p className="text-sm font-semibold text-white mt-1">
              Dia {programDay} · {meta.label}
            </p>
          </div>
          {checkTotal > 0 && (
            <div className="text-sm font-bold px-3 py-1 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
              {completedCount}/{checkTotal}
            </div>
          )}
        </div>
      )}

      {allDone && !showCompletedDetails ? (
        <div
          className={`${
            mission
              ? 'space-y-4'
              : uiCompact
                ? 'rounded-2xl border border-neutral-800/80 bg-[#111111] p-4'
                : 'bg-gradient-to-br from-accent-green/15 to-emerald-950/20 border border-accent-green/30 rounded-2xl p-5 text-center'
          }`}
        >
          {!uiCompact && (
            <>
              <div className="w-14 h-14 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-3">
                <Check size={28} className="text-accent-green" />
              </div>
              <p className="font-bold text-lg text-white mb-2">Dia completo!</p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">{motivation}</p>
            </>
          )}
          {uiCompact && !mission && (
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">{motivation}</p>
          )}
          {!mission && (
            <div className="mb-4">
              <DailyTipCard day={displayDay} />
            </div>
          )}
          {!uiCompact && nextDaySection}
          {!uiCompact && progressSummary}
          <button
            type="button"
            onClick={() => setShowCompletedDetails(true)}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold text-accent-green hover:text-accent-green/80 transition-colors ${
              mission ? '' : uiCompact ? '' : 'mb-4'
            }`}
          >
            Ver o que cumpri hoje
            <ChevronDown size={16} />
          </button>
          {!uiCompact && progressLinks}
        </div>
      ) : (
        <>
          {allDone && (
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-accent-green text-sm font-medium">
                Dia finalizado — {missionProgress.done} de {missionProgress.total}{' '}
                {missionProgress.total !== 1 ? 'missões' : 'missão'}
              </p>
              <button
                type="button"
                onClick={() => setShowCompletedDetails(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Ocultar
                <ChevronUp size={14} />
              </button>
            </div>
          )}
          {uiCompact && !mission && !allDone ? (
            <div className="rounded-2xl border border-neutral-800/80 bg-[#111111] p-1">
              {renderTasks()}
            </div>
          ) : (
            renderTasks()
          )}
          {allDone && !mission && (
            <div className={`${uiCompact ? 'mt-4' : 'mt-4 pt-4 border-t border-neutral-800'} space-y-3`}>
              {!uiCompact && <DailyTipCard day={displayDay} />}
              {!uiCompact && nextDaySection}
              {!uiCompact && progressSummary}
              {!uiCompact && progressLinks}
            </div>
          )}
        </>
      )}

      {infoTask && <TaskInfoModal task={infoTask} onClose={() => setInfoTask(null)} />}
      {showPhotoCheckIn && (
        <PhotoCheckInSheet
          day={programDay}
          onRegister={(photoUrl) => {
            registerMirrorPhoto(programDay, photoUrl)
            setShowPhotoCheckIn(false)
          }}
          onClose={() => setShowPhotoCheckIn(false)}
        />
      )}
    </div>
  )
}
