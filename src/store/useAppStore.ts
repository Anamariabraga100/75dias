import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analyzeProfile } from './profileAnalysis'

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
  acceptChallenge: (id: ChallengeId) => void
  quitChallenge: () => void
  setStartDate: (option: StartDateOption, customDate?: string) => void
  completeOnboarding: () => void
  setPaymentComplete: () => void
  setUsePromoOffer: (value: boolean) => void
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
      acceptChallenge: (id) =>
        set({ challengeId: id, challengeAccepted: true, currentDay: 1 }),
      quitChallenge: () =>
        set({ challengeId: null, challengeAccepted: false, currentDay: 1 }),
      setStartDate: (option, customDate) =>
        set({ startDate: option, customStartDate: customDate ?? null, currentDay: 1 }),
      completeOnboarding: () => set({ onboardingComplete: true, currentDay: 1 }),
      setPaymentComplete: () => set({ paymentComplete: true }),
      setUsePromoOffer: (value) => set({ usePromoOffer: value }),
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
    title: 'Como é sua rotina de sono?',
    subtitle: 'O sono é a base de energia, foco e disciplina',
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
    title: 'Como é sua vida profissional?',
    subtitle: 'Trabalho impacta diretamente sua energia e tempo disponível',
    questions: [
      {
        key: 'workSituation',
        label: 'Qual é sua situação de trabalho hoje?',
        emoji: '💼',
        options: [
          { value: 'student', label: 'Estudante (trabalho + estudo)', emoji: '🎓' },
          { value: 'employed_office', label: 'CLT / presencial', emoji: '🏢' },
          { value: 'remote', label: 'Home office / remoto', emoji: '🏠' },
          { value: 'entrepreneur', label: 'Empreendedor(a) / autônomo(a)', emoji: '🚀' },
          { value: 'shift', label: 'Turnos alternados', emoji: '🌓' },
          { value: 'not_working', label: 'Sem trabalho fixo agora', emoji: '⏸️' },
        ],
      },
      {
        key: 'workLoad',
        label: 'Como você descreveria sua carga de trabalho?',
        emoji: '📊',
        options: [
          { value: 'light', label: 'Leve — tenho tempo livre', emoji: '😌' },
          { value: 'moderate', label: 'Moderada — equilibrada', emoji: '⚖️' },
          { value: 'heavy', label: 'Pesada — quase sem folga', emoji: '😓' },
          { value: 'overwhelming', label: 'Exaustiva — no limite', emoji: '🔥' },
        ],
      },
    ],
    next: '/onboarding/rotina/3',
  },
  '3': {
    title: 'E os estudos?',
    subtitle: 'Entender isso ajuda a encaixar leitura e aprendizado no plano',
    questions: [
      {
        key: 'studySituation',
        label: 'Você estuda atualmente?',
        emoji: '📚',
        options: [
          { value: 'none', label: 'Não estudo no momento', emoji: '➖' },
          { value: 'school', label: 'Ensino médio', emoji: '🏫' },
          { value: 'college', label: 'Faculdade / pós', emoji: '🎓' },
          { value: 'course', label: 'Curso ou certificação', emoji: '📋' },
          { value: 'self_taught', label: 'Estudo por conta própria', emoji: '🧠' },
        ],
      },
      {
        key: 'studyFrequency',
        label: 'Com que frequência você estuda?',
        emoji: '📖',
        skipWhen: { key: 'studySituation', value: 'none' },
        options: [
          { value: 'occasional', label: 'De vez em quando', emoji: '🎲' },
          { value: 'few_times_week', label: '2–3 vezes por semana', emoji: '📅' },
          { value: 'daily', label: 'Quase todos os dias', emoji: '🔥' },
        ],
      },
    ],
    next: '/onboarding/rotina/4',
  },
  '4': {
    title: 'Treino e movimento',
    subtitle: 'Sem julgamento — queremos seu ponto de partida real',
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
      {
        key: 'trainingGoal',
        label: 'Qual sua meta principal com treino?',
        emoji: '🎯',
        options: [
          { value: 'none', label: 'Não tenho meta específica', emoji: '➖' },
          { value: 'lose_weight', label: 'Emagrecer / perder gordura', emoji: '⚖️' },
          { value: 'gain_muscle', label: 'Ganhar massa muscular', emoji: '🏋️' },
          { value: 'endurance', label: 'Condicionamento / resistência', emoji: '🏃' },
          { value: 'discipline', label: 'Criar disciplina no treino', emoji: '🧱' },
          { value: 'health', label: 'Saúde e bem-estar geral', emoji: '❤️' },
        ],
      },
      {
        key: 'trainingPlace',
        label: 'Onde você prefere ou costuma treinar?',
        emoji: '📍',
        options: [
          { value: 'none', label: 'Ainda não treino', emoji: '➖' },
          { value: 'home', label: 'Em casa', emoji: '🏠' },
          { value: 'gym', label: 'Academia', emoji: '🏋️' },
          { value: 'outdoor', label: 'Ar livre / rua', emoji: '🌳' },
          { value: 'mixed', label: 'Misto — vario conforme o dia', emoji: '🔄' },
        ],
      },
    ],
    next: '/onboarding/rotina/5',
  },
  '5': {
    title: 'Foco e distrações',
    subtitle: 'Celular e falta de estrutura sabotam mais do que a gente imagina',
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
    next: '/onboarding/rotina/6',
  },
  '6': {
    title: 'Alimentação e energia',
    subtitle: 'Última pergunta — em seguida analisamos tudo para você',
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
  iniciante: {
    id: 'iniciante' as const,
    name: 'Reset90 Iniciante',
    badge: 'INICIANTE',
    badgeColor: 'bg-accent-green text-black',
    tagline: 'O primeiro passo — leve, possível e consistente',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=800&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop',
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
