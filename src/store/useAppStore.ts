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

export type WakeTime = 'before_6' | '6_8' | '8_10' | 'after_10'
export type SleepHours = 'less_6' | '6_7' | '7_8' | 'more_8'
export type ExerciseFrequency = 'never' | '1_2_week' | '3_4_week' | 'daily'
export type ScreenTime = 'low' | 'moderate' | 'high' | 'very_high'
export type RoutineConsistency = 'chaotic' | 'somewhat' | 'mostly' | 'structured'
export type MealHabits = 'skip_meals' | 'irregular' | 'somewhat' | 'regular'

export interface RoutineAnswers {
  wakeTime: WakeTime | null
  sleepHours: SleepHours | null
  exerciseFrequency: ExerciseFrequency | null
  screenTime: ScreenTime | null
  routineConsistency: RoutineConsistency | null
  mealHabits: MealHabits | null
}

export interface RadarScores {
  disciplina: number
  energia: number
  habitos: number
  consistencia: number
  saude: number
  foco: number
}

interface AppState {
  name: string
  gender: Gender
  goals: Goal[]
  routineAnswers: RoutineAnswers
  disciplineScore: number
  projectedScore: number
  radarScores: RadarScores
  weakAreas: string[]
  recommendedChallenge: ChallengeId | null
  signed: boolean
  selectedPlan: PlanType
  challengeId: ChallengeId | null
  startDate: StartDateOption | null
  customStartDate: string | null
  currentDay: number
  onboardingComplete: boolean
  paymentComplete: boolean
  usePromoOffer: boolean

  setName: (name: string) => void
  setGender: (gender: Gender) => void
  toggleGoal: (goal: Goal) => void
  setRoutineAnswer: <K extends keyof RoutineAnswers>(
    key: K,
    value: RoutineAnswers[K]
  ) => void
  computeScores: () => void
  setSigned: (signed: boolean) => void
  setSelectedPlan: (plan: PlanType) => void
  setChallengeId: (id: ChallengeId) => void
  setStartDate: (option: StartDateOption, customDate?: string) => void
  completeOnboarding: () => void
  setPaymentComplete: () => void
  setUsePromoOffer: (value: boolean) => void
  reset: () => void
}

const emptyRoutineAnswers: RoutineAnswers = {
  wakeTime: null,
  sleepHours: null,
  exerciseFrequency: null,
  screenTime: null,
  routineConsistency: null,
  mealHabits: null,
}

const defaultRadarScores: RadarScores = {
  disciplina: 23,
  energia: 23,
  habitos: 23,
  consistencia: 23,
  saude: 23,
  foco: 23,
}

const SCORE_MAPS = {
  wakeTime: { before_6: 85, '6_8': 90, '8_10': 70, after_10: 45 },
  sleepHours: { less_6: 35, '6_7': 65, '7_8': 90, more_8: 75 },
  exerciseFrequency: { never: 25, '1_2_week': 45, '3_4_week': 70, daily: 92 },
  screenTime: { low: 90, moderate: 70, high: 45, very_high: 25 },
  routineConsistency: { chaotic: 30, somewhat: 55, mostly: 75, structured: 92 },
  mealHabits: { skip_meals: 35, irregular: 50, somewhat: 72, regular: 90 },
} as const

function scoreValue(value: string | null, map: Record<string, number>): number {
  if (!value) return 50
  return map[value] ?? 50
}

const initialState = {
  name: '',
  gender: null as Gender,
  goals: [] as Goal[],
  routineAnswers: emptyRoutineAnswers,
  disciplineScore: 23,
  projectedScore: 92,
  radarScores: defaultRadarScores,
  weakAreas: [] as string[],
  recommendedChallenge: null as ChallengeId | null,
  signed: false,
  selectedPlan: 'yearly' as PlanType,
  challengeId: null as ChallengeId | null,
  startDate: null as StartDateOption | null,
  customStartDate: null as string | null,
  currentDay: 1,
  onboardingComplete: false,
  paymentComplete: false,
  usePromoOffer: false,
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
      setRoutineAnswer: (key, value) =>
        set((state) => ({
          routineAnswers: { ...state.routineAnswers, [key]: value },
        })),
      computeScores: () => {
        const { routineAnswers } = get()
        const wake = scoreValue(routineAnswers.wakeTime, SCORE_MAPS.wakeTime)
        const sleep = scoreValue(routineAnswers.sleepHours, SCORE_MAPS.sleepHours)
        const exercise = scoreValue(routineAnswers.exerciseFrequency, SCORE_MAPS.exerciseFrequency)
        const screen = scoreValue(routineAnswers.screenTime, SCORE_MAPS.screenTime)
        const routine = scoreValue(routineAnswers.routineConsistency, SCORE_MAPS.routineConsistency)
        const meals = scoreValue(routineAnswers.mealHabits, SCORE_MAPS.mealHabits)

        const disciplineScore = Math.round(
          exercise * 0.25 +
            routine * 0.2 +
            sleep * 0.2 +
            screen * 0.15 +
            wake * 0.1 +
            meals * 0.1
        )

        const radarScores: RadarScores = {
          disciplina: Math.round((exercise + routine + wake) / 3),
          energia: Math.round((sleep + meals + exercise) / 3),
          habitos: Math.round((exercise + meals + routine) / 3),
          consistencia: Math.round((routine + exercise) / 2),
          saude: Math.round((exercise + sleep + meals) / 3),
          foco: Math.round((screen + routine) / 2),
        }

        const projectedScore = Math.min(
          95,
          Math.round(disciplineScore + (100 - disciplineScore) * 0.72)
        )

        let recommendedChallenge: ChallengeId = 'medium'
        if (disciplineScore >= 68 && exercise >= 65) recommendedChallenge = 'hard'
        else if (disciplineScore < 48 || exercise < 40) recommendedChallenge = 'soft'

        const axisLabels: { key: keyof RadarScores; label: string }[] = [
          { key: 'disciplina', label: 'disciplina' },
          { key: 'energia', label: 'energia' },
          { key: 'habitos', label: 'hábitos' },
          { key: 'consistencia', label: 'consistência' },
          { key: 'saude', label: 'saúde' },
          { key: 'foco', label: 'foco' },
        ]
        const weakAreas = axisLabels
          .sort((a, b) => radarScores[a.key] - radarScores[b.key])
          .slice(0, 2)
          .map((a) => a.label)

        set({ disciplineScore, projectedScore, radarScores, weakAreas, recommendedChallenge })
      },
      setSigned: (signed) => set({ signed }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      setChallengeId: (id) => set({ challengeId: id }),
      setStartDate: (option, customDate) =>
        set({ startDate: option, customStartDate: customDate ?? null }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setPaymentComplete: () => set({ paymentComplete: true }),
      setUsePromoOffer: (value) => set({ usePromoOffer: value }),
      reset: () => set(initialState),
    }),
    { name: '75-dias-storage' }
  )
)

export type RoutineStepId = '1' | '2' | '3' | '4'

export const ROUTINE_STEPS: Record<
  RoutineStepId,
  {
    title: string
    subtitle: string
    questions: {
      key: keyof RoutineAnswers
      label: string
      emoji: string
      options: { value: string; label: string; emoji: string }[]
    }[]
    next: string
  }
> = {
  '1': {
    title: 'Como é sua rotina de sono?',
    subtitle: 'O sono é a base de tudo — energia, foco e disciplina',
    questions: [
      {
        key: 'sleepHours',
        label: 'Quantas horas você dorme por noite?',
        emoji: '😴',
        options: [
          { value: 'less_6', label: 'Menos de 6 horas', emoji: '🌙' },
          { value: '6_7', label: '6 a 7 horas', emoji: '💤' },
          { value: '7_8', label: '7 a 8 horas', emoji: '✨' },
          { value: 'more_8', label: 'Mais de 8 horas', emoji: '🛏️' },
        ],
      },
      {
        key: 'wakeTime',
        label: 'Que horas você costuma acordar?',
        emoji: '⏰',
        options: [
          { value: 'before_6', label: 'Antes das 6h', emoji: '🌅' },
          { value: '6_8', label: 'Entre 6h e 8h', emoji: '☀️' },
          { value: '8_10', label: 'Entre 8h e 10h', emoji: '🌤️' },
          { value: 'after_10', label: 'Depois das 10h', emoji: '😅' },
        ],
      },
    ],
    next: '/onboarding/rotina/2',
  },
  '2': {
    title: 'Movimento no dia a dia',
    subtitle: 'Sem julgamento — queremos entender seu ponto de partida',
    questions: [
      {
        key: 'exerciseFrequency',
        label: 'Com que frequência você se exercita?',
        emoji: '🏃',
        options: [
          { value: 'never', label: 'Quase nunca', emoji: '🛋️' },
          { value: '1_2_week', label: '1–2 vezes por semana', emoji: '🚶' },
          { value: '3_4_week', label: '3–4 vezes por semana', emoji: '💪' },
          { value: 'daily', label: 'Quase todos os dias', emoji: '🔥' },
        ],
      },
    ],
    next: '/onboarding/rotina/3',
  },
  '3': {
    title: 'Foco e distrações',
    subtitle: 'O celular e a falta de estrutura sabotam mais do que a gente imagina',
    questions: [
      {
        key: 'screenTime',
        label: 'Quanto tempo passa no celular por dia?',
        emoji: '📱',
        options: [
          { value: 'low', label: 'Menos de 2 horas', emoji: '✅' },
          { value: 'moderate', label: '2 a 4 horas', emoji: '📲' },
          { value: 'high', label: '4 a 6 horas', emoji: '😬' },
          { value: 'very_high', label: 'Mais de 6 horas', emoji: '📵' },
        ],
      },
      {
        key: 'routineConsistency',
        label: 'Como você descreveria sua rotina?',
        emoji: '🔄',
        options: [
          { value: 'chaotic', label: 'Caótica — cada dia é diferente', emoji: '🌪️' },
          { value: 'somewhat', label: 'Mais ou menos — tento, mas falho', emoji: '🎲' },
          { value: 'mostly', label: 'Razoável — tenho alguns hábitos fixos', emoji: '📋' },
          { value: 'structured', label: 'Estruturada — sigo um plano', emoji: '🎯' },
        ],
      },
    ],
    next: '/onboarding/rotina/4',
  },
  '4': {
    title: 'Alimentação e energia',
    subtitle: 'Última pergunta — depois analisamos tudo para você',
    questions: [
      {
        key: 'mealHabits',
        label: 'Como são seus hábitos alimentares?',
        emoji: '🥗',
        options: [
          { value: 'skip_meals', label: 'Pulo refeições com frequência', emoji: '⏭️' },
          { value: 'irregular', label: 'Irregulares — como o que aparece', emoji: '🍔' },
          { value: 'somewhat', label: 'Razoáveis — tento comer bem', emoji: '🥙' },
          { value: 'regular', label: 'Organizadas — planejo minhas refeições', emoji: '🍽️' },
        ],
      },
    ],
    next: '/onboarding/ciencia',
  },
}

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
