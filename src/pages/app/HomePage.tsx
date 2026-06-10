import { useState } from 'react'
import {
  Home,
  Users,
  Gift,
  BarChart2,
  Image,
  RefreshCw,
  User,
  Bell,
  Plus,
  Check,
  ChevronDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { CHALLENGES, useAppStore } from '../../store/useAppStore'

type TaskState = Record<string, boolean | number>

const TASK_COLORS: Record<string, string> = {
  water: 'bg-blue-500',
  diet: 'bg-orange-500',
  read: 'bg-sky-400',
  alcohol: 'bg-purple-500',
  workout1: 'bg-red-500',
  workout2: 'bg-rose-600',
  photo: 'bg-teal-500',
  workout: 'bg-red-500',
  meal: 'bg-lime-500',
  walk: 'bg-emerald-500',
  mindful: 'bg-violet-500',
}

export function HomePage() {
  const navigate = useNavigate()
  const { name, challengeId, currentDay, onboardingComplete, paymentComplete } = useAppStore()
  const challenge = challengeId && challengeId !== 'custom' ? CHALLENGES[challengeId] : CHALLENGES.hard

  const [tasks, setTasks] = useState<TaskState>(() => {
    const init: TaskState = {}
    challenge.tasks.forEach((t: (typeof challenge.tasks)[number]) => {
      init[t.id] = t.type === 'counter' ? 0 : false
    })
    return init
  })

  const toggleCheck = (id: string) => {
    setTasks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const addWater = (id: string, max: number) => {
    setTasks((prev) => ({
      ...prev,
      [id]: Math.min((prev[id] as number) + 473, max),
    }))
  }

  const waterMax = challengeId === 'soft' ? 2000 : 3785

  const NAV = [
    { icon: Home, label: 'Início', active: true },
    { icon: Users, label: 'Amigos', active: false },
    { icon: Gift, label: '', active: false },
    { icon: BarChart2, label: 'Insights', active: false },
    { icon: Image, label: 'Galeria', active: false },
  ]

  if (!onboardingComplete) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <Logo size="lg" />
          <p className="text-neutral-400 mt-4 mb-6">
            Complete o onboarding para começar seu desafio
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black font-bold px-8 py-3 rounded-2xl"
          >
            Começar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh">
        <header className="flex items-center justify-between px-5 pt-5 pb-2">
          <button className="flex items-center gap-1 text-sm text-neutral-300 font-medium">
            {challenge.name}
            <ChevronDown size={14} className="text-neutral-500" />
          </button>
          <span className="text-5xl font-black">{currentDay}</span>
          <div className="flex gap-3">
            <RefreshCw size={20} className="text-neutral-400" />
            <User size={20} className="text-neutral-400" />
          </div>
        </header>

        {name && (
          <p className="text-center text-neutral-500 text-sm mb-4">
            Força, {name}! 💪
          </p>
        )}

        <main className="flex-1 px-4 space-y-3 overflow-y-auto pb-36">
          {challenge.tasks.map((task: (typeof challenge.tasks)[number]) => {
            const colorClass = TASK_COLORS[task.id] ?? 'bg-neutral-600'
            return (
              <div
                key={task.id}
                className="bg-surface rounded-2xl overflow-hidden flex min-h-[72px]"
              >
                <div
                  className={`w-[72px] flex items-center justify-center text-2xl relative shrink-0 ${colorClass}`}
                >
                  <Bell size={11} className="absolute top-2.5 left-2.5 text-white/60" />
                  {task.icon}
                </div>
                <div className="flex-1 py-3.5 pr-4 pl-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{task.title}</p>
                    {task.subtitle && (
                      <p className="text-neutral-500 text-sm mt-0.5">
                        {task.type === 'counter'
                          ? `${tasks[task.id] as number}/${waterMax} ml`
                          : task.subtitle}
                      </p>
                    )}
                  </div>
                  {task.type === 'check' && (
                    <button
                      onClick={() => toggleCheck(task.id)}
                      className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                        tasks[task.id]
                          ? 'bg-green-500 border-green-500'
                          : 'border-neutral-600 bg-neutral-800/50'
                      }`}
                    >
                      {tasks[task.id] && <Check size={16} className="text-white" />}
                    </button>
                  )}
                  {task.type === 'counter' && (
                    <button
                      onClick={() => addWater(task.id, waterMax)}
                      className="w-9 h-9 rounded-xl bg-neutral-700 flex items-center justify-center hover:bg-neutral-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                  {task.type === 'action' && (
                    <button className="w-9 h-9 rounded-xl bg-neutral-700 flex items-center justify-center hover:bg-neutral-600 transition-colors">
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </main>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
          {!paymentComplete && (
            <div className="mx-4 mb-2 bg-accent-blue/20 border border-accent-blue/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <p className="text-accent-blue text-sm font-medium">
                Alcance seus objetivos mais rápido com Pro
              </p>
              <span className="text-accent-blue text-lg">›</span>
            </div>
          )}

          <nav className="bg-surface border-t border-neutral-800 px-2 py-2 flex items-center justify-around">
            {NAV.map(({ icon: Icon, label, active }) => (
              <button
                key={label || 'gift'}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 ${
                  active ? 'text-white' : 'text-neutral-500'
                }`}
              >
                <Icon size={22} />
                {label && <span className="text-xs">{label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="fixed bottom-24 right-4 w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-700 shadow-lg relative">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop"
            alt="Coach"
            className="w-full h-full object-cover"
          />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-yellow text-black text-xs font-bold rounded-full flex items-center justify-center">
            1
          </span>
        </div>
      </div>
    </div>
  )
}
