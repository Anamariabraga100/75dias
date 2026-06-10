import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not' | null

export type Goal =
  | 'discipline'
  | 'distractions'
  | 'burnout'
  | 'routine'
  | 'time'
  | 'consistency'

export type ChallengeId = 'hard' | 'medium' | 'soft' | 'custom'

export type StartDateOption = 'today' | 'tomorrow' | 'already' | 'other'

export type PlanType = 'monthly' | 'yearly'

interface AppState {
  name: string
  gender: Gender
  goals: Goal[]
  disciplineScore: number
  signed: boolean
  selectedPlan: PlanType
  challengeId: ChallengeId | null
  startDate: StartDateOption | null
  customStartDate: string | null
  currentDay: number
  onboardingComplete: boolean

  setName: (name: string) => void
  setGender: (gender: Gender) => void
  toggleGoal: (goal: Goal) => void
  setSigned: (signed: boolean) => void
  setSelectedPlan: (plan: PlanType) => void
  setChallengeId: (id: ChallengeId) => void
  setStartDate: (option: StartDateOption, customDate?: string) => void
  completeOnboarding: () => void
  reset: () => void
}

const initialState = {
  name: '',
  gender: null as Gender,
  goals: [] as Goal[],
  disciplineScore: 23,
  signed: false,
  selectedPlan: 'yearly' as PlanType,
  challengeId: null as ChallengeId | null,
  startDate: null as StartDateOption | null,
  customStartDate: null as string | null,
  currentDay: 1,
  onboardingComplete: false,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setName: (name) => set({ name }),
      setGender: (gender) => set({ gender }),
      toggleGoal: (goal) => {
        const goals = get().goals
        set({
          goals: goals.includes(goal)
            ? goals.filter((g) => g !== goal)
            : [...goals, goal],
        })
      },
      setSigned: (signed) => set({ signed }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      setChallengeId: (id) => set({ challengeId: id }),
      setStartDate: (option, customDate) =>
        set({ startDate: option, customStartDate: customDate ?? null }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      reset: () => set(initialState),
    }),
    { name: '75-dias-storage' }
  )
)

export const GOAL_OPTIONS: { id: Goal; emoji: string; label: string }[] = [
  { id: 'discipline', emoji: '🧱', label: 'Construir disciplina de verdade' },
  { id: 'distractions', emoji: '📵', label: 'Sair das distrações' },
  { id: 'burnout', emoji: '🧠', label: 'Recuperar depois de burnout' },
  { id: 'routine', emoji: '🔄', label: 'Criar uma rotina que funciona' },
  { id: 'time', emoji: '⏱️', label: 'Recuperar seu tempo' },
  { id: 'consistency', emoji: '🔥', label: 'Manter consistência' },
]

export const CHALLENGES = {
  hard: {
    id: 'hard' as const,
    name: '75 Dias Hard',
    badge: 'HARD',
    badgeColor: 'bg-accent-orange',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop',
    tags: [
      '🥦 Dieta saudável',
      '💧 3,7L de água/dia',
      '🍷 Zero álcool e cheat meals',
      '📖 Ler 10 páginas',
      '🏋️ 2 treinos/dia (1 outdoor)',
      '📷 Foto de progresso',
    ],
    tasks: [
      { id: 'water', icon: '💧', title: 'Água', subtitle: '0/3785 ml', type: 'counter' as const },
      { id: 'diet', icon: '🥕', title: 'Dieta saudável', subtitle: 'Sem junk food ou refrigerante', type: 'check' as const },
      { id: 'read', icon: '📖', title: 'Ler 10 páginas', subtitle: 'Não-ficção', type: 'check' as const },
      { id: 'alcohol', icon: '🧁', title: 'Sem álcool & cheat meals', subtitle: '', type: 'check' as const },
      { id: 'workout1', icon: '🏋️', title: 'Treino 1', subtitle: '45 min mínimo', type: 'check' as const },
      { id: 'workout2', icon: '🏃', title: 'Treino 2 (outdoor)', subtitle: '45 min mínimo', type: 'check' as const },
      { id: 'photo', icon: '📷', title: 'Foto de progresso', subtitle: '', type: 'action' as const },
    ],
  },
  medium: {
    id: 'medium' as const,
    name: '75 Dias Medium',
    badge: 'MÉDIO',
    badgeColor: 'bg-accent-yellow text-black',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=800&fit=crop',
    tags: [
      '📖 Ler 10 páginas (qualquer livro)',
      '📷 Foto de progresso',
      '🥗 1 refeição saudável/dia',
      '🏋️ 1 treino/dia',
    ],
    tasks: [
      { id: 'read', icon: '📖', title: 'Ler 10 páginas', subtitle: 'Qualquer livro', type: 'check' as const },
      { id: 'workout', icon: '🏋️', title: 'Treino', subtitle: '30 min mínimo', type: 'check' as const },
      { id: 'meal', icon: '🥗', title: 'Refeição saudável', subtitle: 'Pelo menos 1 por dia', type: 'check' as const },
      { id: 'photo', icon: '📷', title: 'Foto de progresso', subtitle: '', type: 'action' as const },
    ],
  },
  soft: {
    id: 'soft' as const,
    name: '75 Dias Soft',
    badge: 'LEVE',
    badgeColor: 'bg-accent-green text-black',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&fit=crop',
    tags: [
      '💧 Beber mais água',
      '📖 Ler 5 páginas',
      '🧘 10 min de mindfulness',
      '🚶 Caminhada diária',
    ],
    tasks: [
      { id: 'water', icon: '💧', title: 'Água', subtitle: '0/2000 ml', type: 'counter' as const },
      { id: 'read', icon: '📖', title: 'Ler 5 páginas', subtitle: '', type: 'check' as const },
      { id: 'walk', icon: '🚶', title: 'Caminhada', subtitle: '20 min mínimo', type: 'check' as const },
      { id: 'mindful', icon: '🧘', title: 'Mindfulness', subtitle: '10 min', type: 'check' as const },
    ],
  },
}
