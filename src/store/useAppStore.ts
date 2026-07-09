import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analyzeProfile } from './profileAnalysis'
import { logMirrorPhotoToCloud, scheduleProfileSync, flushProfileSync } from '../lib/userSync'
import type { SubscriptionStatus } from '../lib/subscription'

export type Gender = 'male' | 'female' | 'other' | 'prefer_not' | null

export type Goal =
  | 'discipline'
  | 'distractions'
  | 'burnout'
  | 'routine'
  | 'time'
  | 'consistency'

export type ChallengeId = 'iniciante' | 'intermediario' | 'implacavel'

export type StartDateOption = 'today' | 'tomorrow' | 'already' | 'other'

export type PlanType = 'monthly' | 'quarterly'

export type WakeTime = 'before_6' | '6_8' | '8_10' | 'after_10'
export type SleepHours = 'less_6' | '6_7' | '7_8' | 'more_8'
export type ExerciseFrequency = 'never' | '1_2_week' | '3_4_week' | 'daily'
export type ScreenTime = 'low' | 'moderate' | 'high' | 'very_high'
export type RoutineConsistency = 'chaotic' | 'somewhat' | 'mostly' | 'structured'
export type MealHabits = 'skip_meals' | 'irregular' | 'somewhat' | 'regular'

export type WorkSituation =
  | 'student'
  | 'employed_office'
  | 'remote'
  | 'entrepreneur'
  | 'shift'
  | 'not_working'

export type WorkLoad = 'light' | 'moderate' | 'heavy' | 'overwhelming'

export type StudySituation = 'none' | 'school' | 'college' | 'course' | 'self_taught'

export type StudyFrequency = 'none' | 'occasional' | 'few_times_week' | 'daily'

export type TrainingGoal =
  | 'none'
  | 'lose_weight'
  | 'gain_muscle'
  | 'endurance'
  | 'discipline'
  | 'health'

export type TrainingPlace = 'none' | 'home' | 'gym' | 'outdoor' | 'mixed'

export interface RoutineAnswers {
  wakeTime: WakeTime | null
  sleepHours: SleepHours | null
  workSituation: WorkSituation | null
  workLoad: WorkLoad | null
  studySituation: StudySituation | null
  studyFrequency: StudyFrequency | null
  exerciseFrequency: ExerciseFrequency | null
  trainingGoal: TrainingGoal | null
  trainingPlace: TrainingPlace | null
  screenTime: ScreenTime | null
  routineConsistency: RoutineConsistency | null
  mealHabits: MealHabits | null
}

export interface ProfileInsights {
  weakAreas: string[]
  strongAreas: string[]
  scoreSummary: string
  personalizedQuote: string
  beforeItems: string[]
  afterItems: string[]
  dayMessages: { day1: string; day30: string; day90: string }
  blueprintText: string
  priorityActions: string[]
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
  email: string
  avatarUrl: string | null
  gender: Gender
  goals: Goal[]
  routineAnswers: RoutineAnswers
  disciplineScore: number
  projectedScore: number
  radarScores: RadarScores
  weakAreas: string[]
  recommendedChallenge: ChallengeId | null
  profileInsights: ProfileInsights | null
  signed: boolean
  selectedPlan: PlanType
  challengeId: ChallengeId | null
  challengeAccepted: boolean
  startDate: StartDateOption | null
  customStartDate: string | null
  currentDay: number
  onboardingComplete: boolean
  paymentComplete: boolean
  subscriptionStatus: SubscriptionStatus | null
  pixViewed: boolean
  usePromoOffer: boolean
  mirrorPhotos: Record<number, string>
  taskChecksByDay: Record<number, Record<string, boolean>>
  readNotificationIds: string[]
  authUserId: string | null

  setName: (name: string) => void
  setUserProfile: (profile: { name?: string; email?: string; avatarUrl?: string | null }) => void
  clearUserProfile: () => void
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
  acceptChallenge: (id: ChallengeId) => void
  quitChallenge: () => void
  setStartDate: (option: StartDateOption, customDate?: string) => void
  completeOnboarding: () => void
  enterAsReturningUser: () => void
  setPaymentComplete: () => void
  /** Até integrar pagamento real: libera acesso após Pix ou "Já paguei". */
  grantInterimPaymentAccess: () => void
  markPixViewed: () => void
  setUsePromoOffer: (value: boolean) => void
  registerMirrorPhoto: (day: number, photoUrl: string) => void
  toggleTaskCheck: (day: number, taskId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (ids: string[]) => void
  resetProgressForNewAccount: (userId: string) => void
  reset: () => void
}

const emptyRoutineAnswers: RoutineAnswers = {
  wakeTime: null,
  sleepHours: null,
  workSituation: null,
  workLoad: null,
  studySituation: null,
  studyFrequency: null,
  exerciseFrequency: null,
  trainingGoal: null,
  trainingPlace: null,
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

const initialState = {
  name: '',
  email: '',
  avatarUrl: null as string | null,
  gender: null as Gender,
  goals: [] as Goal[],
  routineAnswers: emptyRoutineAnswers,
  disciplineScore: 23,
  projectedScore: 92,
  radarScores: defaultRadarScores,
  weakAreas: [] as string[],
  recommendedChallenge: null as ChallengeId | null,
  profileInsights: null as ProfileInsights | null,
  signed: false,
  selectedPlan: 'quarterly' as PlanType,
  challengeId: null as ChallengeId | null,
  challengeAccepted: false,
  startDate: null as StartDateOption | null,
  customStartDate: null as string | null,
  currentDay: 1,
  onboardingComplete: false,
  paymentComplete: false,
  subscriptionStatus: null as SubscriptionStatus | null,
  pixViewed: false,
  usePromoOffer: false,
  mirrorPhotos: {} as Record<number, string>,
  taskChecksByDay: {} as Record<number, Record<string, boolean>>,
  readNotificationIds: [] as string[],
  authUserId: null as string | null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setName: (name) => {
        set({ name })
        if (name.trim().length >= 2) scheduleProfileSync()
      },
      setUserProfile: (profile) =>
        set((state) => ({
          name: state.name?.trim() ? state.name : (profile.name ?? state.name),
          email: profile.email ?? state.email,
          avatarUrl: profile.avatarUrl !== undefined ? profile.avatarUrl : state.avatarUrl,
        })),
      clearUserProfile: () => set({ email: '', avatarUrl: null, authUserId: null }),
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
        const { routineAnswers, goals, name } = get()
        const result = analyzeProfile(routineAnswers, goals, name)
        set({
          disciplineScore: result.disciplineScore,
          projectedScore: result.projectedScore,
          radarScores: result.radarScores,
          weakAreas: result.weakAreas,
          recommendedChallenge: result.recommendedChallenge,
          profileInsights: result.insights,
        })
      },
      setSigned: (signed) => set({ signed }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      setChallengeId: (id) => set({ challengeId: id }),
      acceptChallenge: (id) => {
        set({
          challengeId: id,
          challengeAccepted: true,
          currentDay: 1,
          mirrorPhotos: {},
          taskChecksByDay: {},
        })
        scheduleProfileSync()
      },
      quitChallenge: () => {
        set({
          challengeId: null,
          challengeAccepted: false,
          currentDay: 1,
          mirrorPhotos: {},
          taskChecksByDay: {},
        })
        scheduleProfileSync()
      },
      setStartDate: (option, customDate) =>
        set({ startDate: option, customStartDate: customDate ?? null, currentDay: 1 }),
      completeOnboarding: () => {
        set({ onboardingComplete: true, currentDay: 1 })
        void flushProfileSync()
      },
      enterAsReturningUser: () =>
        set((state) => ({
          onboardingComplete: true,
          paymentComplete: true,
          currentDay: 1,
          recommendedChallenge: state.recommendedChallenge ?? 'intermediario',
        })),
      setPaymentComplete: () => {
        set({ paymentComplete: true })
        void flushProfileSync()
      },
      grantInterimPaymentAccess: () => {
        set({
          onboardingComplete: true,
          paymentComplete: true,
          subscriptionStatus: 'active',
          pixViewed: true,
        })
        void flushProfileSync()
      },
      markPixViewed: () => set({ pixViewed: true }),
      setUsePromoOffer: (value) => set({ usePromoOffer: value }),
      registerMirrorPhoto: (day, photoUrl) => {
        const current = get().mirrorPhotos
        if (current[day]) return
        set({
          mirrorPhotos: { ...current, [day]: photoUrl },
          readNotificationIds: [
            ...get().readNotificationIds.filter(
              (id) => id !== `photo-due-${day}` && !id.startsWith('photo-missed-')
            ),
            `photo-due-${day}`,
          ],
        })
        void logMirrorPhotoToCloud(day)
      },
      toggleTaskCheck: (day, taskId) => {
        const byDay = get().taskChecksByDay
        const dayChecks = byDay[day] ?? {}
        const next = !dayChecks[taskId]
        const updatedDayChecks = { ...dayChecks, [taskId]: next }
        set({
          taskChecksByDay: {
            ...byDay,
            [day]: updatedDayChecks,
          },
        })
        if (next) {
          const challengeId = get().challengeId
          if (!challengeId) return
          const pending = CHALLENGES[challengeId].tasks.filter(
            (t) => t.type === 'check' && !updatedDayChecks[t.id]
          )
          if (pending.length === 0) {
            set({
              readNotificationIds: [
                ...get().readNotificationIds.filter((id) => id !== `habits-pending-${day}`),
                `habits-pending-${day}`,
              ],
            })
          }
        }
        scheduleProfileSync()
      },
      markNotificationRead: (id) => {
        const read = get().readNotificationIds
        if (read.includes(id)) return
        set({ readNotificationIds: [...read, id] })
      },
      markAllNotificationsRead: (ids) => {
        const read = new Set([...get().readNotificationIds, ...ids])
        set({ readNotificationIds: [...read] })
      },
      resetProgressForNewAccount: (userId) =>
        set((state) => ({
          ...initialState,
          name: state.name,
          email: state.email,
          avatarUrl: state.avatarUrl,
          authUserId: userId,
        })),
      reset: () => set(initialState),
    }),
    {
      name: '75-dias-storage',
      merge: (persisted, current) => {
        const saved = persisted as Partial<AppState> | undefined
        if (!saved) return current
        return {
          ...current,
          ...saved,
          currentDay:
            typeof saved.currentDay === 'number' && saved.currentDay >= 1
              ? Math.min(90, saved.currentDay)
              : 1,
        }
      },
    }
  )
)

export type RoutineStepId = '1' | '2' | '3' | '4' | '5' | '6'

export const QUIZ_STEP_ORDER: RoutineStepId[] = ['1', '2', '3', '4', '5', '6']

export const ROUTINE_STEPS: Record<
  RoutineStepId,
  {
    title: string
    subtitle: string
    questions: {
      key: keyof RoutineAnswers
      label: string
      emoji: string
      skipWhen?: { key: keyof RoutineAnswers; value: string }
      options: { value: string; label: string; emoji: string }[]
    }[]
    next: string
  }
> = {
  '1': {
    title: '😴 Quantas horas você dorme?',
    subtitle: 'Toque na sua resposta',
    questions: [
      {
        key: 'sleepHours',
        label: 'Horas de sono',
        emoji: '😴',
        options: [
          { value: 'less_6', label: 'Menos de 6h', emoji: '🌙' },
          { value: '6_7', label: '6 a 7h', emoji: '💤' },
          { value: '7_8', label: '7 a 8h', emoji: '✨' },
          { value: 'more_8', label: 'Mais de 8h', emoji: '🛏️' },
        ],
      },
    ],
    next: '/onboarding/quiz/2',
  },
  '2': {
    title: '💼 Como é seu trabalho hoje?',
    subtitle: 'Toque na sua resposta',
    questions: [
      {
        key: 'workSituation',
        label: 'Trabalho',
        emoji: '💼',
        options: [
          { value: 'student', label: 'Estudo e trabalho', emoji: '🎓' },
          { value: 'employed_office', label: 'Presencial / CLT', emoji: '🏢' },
          { value: 'remote', label: 'Home office', emoji: '🏠' },
          { value: 'entrepreneur', label: 'Autônomo / dono', emoji: '🚀' },
          { value: 'not_working', label: 'Sem trabalho fixo', emoji: '⏸️' },
        ],
      },
    ],
    next: '/onboarding/quiz/3',
  },
  '3': {
    title: '📚 Você estuda hoje?',
    subtitle: 'Toque na sua resposta',
    questions: [
      {
        key: 'studySituation',
        label: 'Estudos',
        emoji: '📚',
        options: [
          { value: 'none', label: 'Não estudo agora', emoji: '➖' },
          { value: 'school', label: 'Ensino médio', emoji: '🏫' },
          { value: 'college', label: 'Faculdade ou pós', emoji: '🎓' },
          { value: 'course', label: 'Curso ou prova', emoji: '📋' },
          { value: 'self_taught', label: 'Estudo por conta', emoji: '🧠' },
        ],
      },
    ],
    next: '/onboarding/quiz/4',
  },
  '4': {
    title: '🏋️ Com que frequência você treina?',
    subtitle: 'Toque na sua resposta',
    questions: [
      {
        key: 'exerciseFrequency',
        label: 'Treino',
        emoji: '🏋️',
        options: [
          { value: 'never', label: 'Quase nunca', emoji: '🛋️' },
          { value: '1_2_week', label: '1–2x na semana', emoji: '🚶' },
          { value: '3_4_week', label: '3–4x na semana', emoji: '💪' },
          { value: 'daily', label: 'Quase todo dia', emoji: '🔥' },
        ],
      },
    ],
    next: '/onboarding/quiz/5',
  },
  '5': {
    title: '🥗 Como você come no dia a dia?',
    subtitle: 'Toque na sua resposta',
    questions: [
      {
        key: 'mealHabits',
        label: 'Alimentação',
        emoji: '🥗',
        options: [
          { value: 'skip_meals', label: 'Pulo refeições', emoji: '⏭️' },
          { value: 'irregular', label: 'Como o que aparece', emoji: '🍔' },
          { value: 'somewhat', label: 'Tento comer bem', emoji: '🥙' },
          { value: 'regular', label: 'Refeições organizadas', emoji: '🍽️' },
        ],
      },
    ],
    next: '/onboarding/quiz/6',
  },
  '6': {
    title: '🎮 No lazer, quanto tempo no celular?',
    subtitle: 'Última pergunta',
    questions: [
      {
        key: 'screenTime',
        label: 'Lazer / celular',
        emoji: '🎮',
        options: [
          { value: 'low', label: 'Menos de 2h', emoji: '✅' },
          { value: 'moderate', label: '2 a 4h', emoji: '📲' },
          { value: 'high', label: '4 a 6h', emoji: '😬' },
          { value: 'very_high', label: 'Mais de 6h', emoji: '📵' },
        ],
      },
    ],
    next: '/onboarding/resultado',
  },
}

/** Áreas de foco — multi-seleção antes do quiz */
export const GOAL_OPTIONS: { id: Goal; emoji: string; label: string }[] = [
  { id: 'routine', emoji: '💼', label: 'Trabalho' },
  { id: 'discipline', emoji: '📚', label: 'Estudos' },
  { id: 'consistency', emoji: '🏋️', label: 'Treino' },
  { id: 'time', emoji: '🥗', label: 'Alimentação' },
  { id: 'distractions', emoji: '🎮', label: 'Lazer e celular' },
]

export const CHALLENGES = {
  iniciante: {
    id: 'iniciante' as const,
    name: 'Reset90 Iniciante',
    badge: 'INICIANTE',
    badgeColor: 'bg-accent-green text-black',
    tagline: 'O primeiro passo — leve, possível e consistente',
    image: '/niveis/iniciante.jpg',
    tags: [
      '🥗 Dieta básica',
      '🏋️ Treino 2–3x/semana',
      '📖 Ler 2–5 páginas/dia',
      '😴 Dormir o suficiente',
    ],
    tasks: [
      {
        id: 'diet',
        icon: '🥗',
        title: 'Dieta básica',
        subtitle: '',
        type: 'check' as const,
        daily: 'Faça pelo menos 3 refeições simples e evite junk food e refrigerante.',
        weekly: 'Manter alimentação básica e regular a semana toda.',
        previewVerb: 'Comer de forma simples e saudável',
        previewHint: 'Comi de forma simples e saudável hoje',
      },
      {
        id: 'workout',
        icon: '🏋️',
        title: 'Treino moderado',
        subtitle: '',
        type: 'check' as const,
        daily: 'Se hoje é dia de treino: 30 min de movimento (caminhada, academia ou casa).',
        weekly: '2 a 3 treinos por semana. Marque só nos dias que treinou.',
        previewVerb: 'Treinar nos dias de treino',
        previewHint: 'Treinei hoje — marque só nos dias que treinou de fato',
      },
      {
        id: 'read',
        icon: '📖',
        title: 'Leitura',
        subtitle: '',
        type: 'check' as const,
        daily: 'Leia de 2 a 5 páginas hoje — qualquer livro que agregue.',
        weekly: 'Leitura diária, mesmo que poucas páginas.',
        previewVerb: 'Ler minhas páginas diárias',
        previewHint: 'Li minhas páginas diárias',
      },
      {
        id: 'sleep',
        icon: '😴',
        title: 'Sono',
        subtitle: '',
        type: 'check' as const,
        daily: 'Durma pelo menos 7 horas esta noite.',
        weekly: '5+ noites com 7h+ por semana.',
        previewVerb: 'Dormir pelo menos 7 horas',
        previewHint: 'Dormi pelo menos 7 horas',
      },
    ],
  },
  intermediario: {
    id: 'intermediario' as const,
    name: 'Reset90 Intermediário',
    badge: 'INTERMEDIÁRIO',
    badgeColor: 'bg-accent-yellow text-black',
    tagline: 'Mais exigência — corpo, mente e foco alinhados',
    image: '/niveis/intermediario.jpg',
    tags: [
      '🍽️ Dieta moderada — sem industrializado',
      '🏋️ Treino 3–4x/semana',
      '📖 Ler 5–10 páginas/dia',
      '🚫 Sem pornografia',
      '😴 Dormir o suficiente',
    ],
    tasks: [
      {
        id: 'diet',
        icon: '🍽️',
        title: 'Dieta moderada',
        subtitle: '',
        type: 'check' as const,
        daily: 'Evite industrializados, fast food e excesso de doces.',
        weekly: 'Alimentação limpa na maior parte da semana.',
        previewVerb: 'Evitar industrializados e comer limpo',
        previewHint: 'Evitei industrializados e comi limpo hoje',
      },
      {
        id: 'workout',
        icon: '🏋️',
        title: 'Treino',
        subtitle: '',
        type: 'check' as const,
        daily: 'Se hoje é dia de treino: mínimo 40 min de exercício estruturado.',
        weekly: '3 a 4 sessões por semana. Marque nos dias que treinou.',
        previewVerb: 'Treinar nos dias de treino',
        previewHint: 'Treinei hoje — marque só nos dias que treinou de fato',
      },
      {
        id: 'read',
        icon: '📖',
        title: 'Leitura',
        subtitle: '',
        type: 'check' as const,
        daily: 'Leia de 5 a 10 páginas hoje.',
        weekly: 'Leitura todos os dias da semana.',
        previewVerb: 'Ler minhas páginas diárias',
        previewHint: 'Li minhas páginas diárias',
      },
      {
        id: 'noporn',
        icon: '🚫',
        title: 'Sem pornografia',
        subtitle: '',
        type: 'check' as const,
        daily: 'Zero pornografia. Marque ao final do dia se manteve.',
        weekly: '7 dias limpos por semana.',
        previewVerb: 'Ficar longe de pornografia',
        previewHint: 'Fiquei longe de pornografia hoje',
      },
      {
        id: 'sleep',
        icon: '😴',
        title: 'Sono',
        subtitle: '',
        type: 'check' as const,
        daily: 'Durma pelo menos 7 horas esta noite.',
        weekly: '5+ noites com 7h+ por semana.',
        previewVerb: 'Dormir pelo menos 7 horas',
        previewHint: 'Dormi pelo menos 7 horas',
      },
    ],
  },
  implacavel: {
    id: 'implacavel' as const,
    name: 'Reset90 Implacável',
    badge: 'IMPLACÁVEL',
    badgeColor: 'bg-accent-orange',
    tagline: 'Sem atalhos — transformação total em 90 dias',
    image: '/niveis/implacavel.jpg',
    tags: [
      '📋 Dieta regrada + 1 ref. livre/semana',
      '💊 Suplementação (creatina)',
      '🏋️ Treino 4–5x/semana',
      '📖 Ler 10–15 páginas/dia',
      '📷 Foto a cada 3 dias + relatórios',
      '🚫 Zero pornografia & álcool',
      '🚫 Zero masturbação',
      '😴 Dormir o suficiente',
    ],
    tasks: [
      {
        id: 'diet',
        icon: '📋',
        title: 'Dieta regrada',
        subtitle: '',
        type: 'check' as const,
        daily: 'Siga sua dieta sem ultraprocessados, fast food ou doces em excesso.',
        weekly: '1 refeição livre por semana — escolha o dia e marque os demais como cumpridos.',
        previewVerb: 'Seguir a dieta regrada',
        previewHint: 'Segui a dieta regrada hoje',
      },
      {
        id: 'creatine',
        icon: '💊',
        title: 'Creatina',
        subtitle: '',
        type: 'check' as const,
        daily: 'Tome sua dose diária de creatina (conforme orientação da embalagem ou profissional).',
        weekly: 'Todos os 7 dias da semana, sem falhar.',
        previewVerb: 'Tomar creatina diariamente',
        previewHint: 'Tomei minha dose de creatina diária',
      },
      {
        id: 'workout',
        icon: '🏋️',
        title: 'Treino',
        subtitle: '',
        type: 'check' as const,
        daily: 'Se hoje é dia de treino: complete no mínimo 45 min (musculação, corrida ou similar).',
        weekly: '4 a 5 sessões por semana. Marque só nos dias em que treinou de fato.',
        previewVerb: 'Treinar nos dias de treino',
        previewHint: 'Treinei hoje — marque só nos dias que treinou de fato',
      },
      {
        id: 'read',
        icon: '📖',
        title: 'Leitura',
        subtitle: '',
        type: 'check' as const,
        daily: 'Leia de 10 a 15 páginas hoje — preferencialmente não-ficção.',
        weekly: 'Leitura todos os dias da semana, mesmo que seja o mínimo de páginas.',
        previewVerb: 'Ler minhas páginas diárias',
        previewHint: 'Li minhas páginas diárias',
      },
      {
        id: 'photo',
        icon: '📷',
        title: 'Foto do shape',
        subtitle: '',
        type: 'action' as const,
        daily:
          'Se hoje é dia de registro (a cada 3 dias), tire a foto de evolução — mesmo ângulo, luz e pose.',
        weekly:
          '1 foto a cada 3 dias (~30 registros no Reset90). Comparação de 7 em 7 dias e destaque a cada 30 dias.',
        previewVerb: 'Tirar foto de evolução (nos dias de registro)',
        previewHint: 'Tirei minha foto de evolução (nos dias de registro)',
      },
      {
        id: 'noporn',
        icon: '🚫',
        title: 'Zero pornografia',
        subtitle: '',
        type: 'check' as const,
        daily: 'Nenhum acesso a pornografia. Marque ao final do dia se manteve.',
        weekly: '7 dias limpos por semana — cada dia é uma vitória individual.',
        previewVerb: 'Ficar longe de pornografia',
        previewHint: 'Fiquei longe de pornografia hoje',
      },
      {
        id: 'purity',
        icon: '🚫',
        title: 'Zero masturbação',
        subtitle: '',
        type: 'check' as const,
        daily: 'Abstinência total. Marque ao final do dia se manteve.',
        weekly: '7 dias seguidos sem masturbação — foco em disciplina e autocontrole.',
        previewVerb: 'Manter abstinência',
        previewHint: 'Mantive abstinência hoje',
      },
      {
        id: 'alcohol',
        icon: '🍷',
        title: 'Zero álcool',
        subtitle: '',
        type: 'check' as const,
        daily: 'Nenhuma bebida alcoólica. Marque ao final do dia.',
        weekly: 'Semana 100% seca — zero exceções.',
        previewVerb: 'Não beber álcool',
        previewHint: 'Não bebi álcool hoje',
      },
      {
        id: 'sleep',
        icon: '😴',
        title: 'Sono',
        subtitle: '',
        type: 'check' as const,
        daily: 'Durma pelo menos 7 horas esta noite. Marque amanhã ao acordar.',
        weekly: '5+ noites com 7h+ por semana para manter energia e recuperação.',
        previewVerb: 'Dormir pelo menos 7 horas',
        previewHint: 'Dormi pelo menos 7 horas',
      },
    ],
  },
}

export const CHALLENGE_LIST = [
  CHALLENGES.iniciante,
  CHALLENGES.intermediario,
  CHALLENGES.implacavel,
]
