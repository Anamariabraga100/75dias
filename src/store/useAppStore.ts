import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analyzeProfile } from './profileAnalysis'
import { logMirrorPhotoToCloud, scheduleProfileSync, flushProfileSync } from '../lib/userSync'
import { markStoreHydrated } from '../lib/storeHydration'
import type { SubscriptionStatus } from '../lib/subscription'
import { normalizeProgramDay } from '../lib/demoProgress'
import { getDayUnlockStatus } from '../lib/dayUnlock'
import { getDayMissionProgress, isDayComplete } from '../lib/streak'
import {
  awardDayXp,
  awardHabitXp,
  awardScienceXp,
  awardTierUnlockXp,
} from '../lib/xp'
import { DISCIPLINE_SHIELD_COST, MAX_DISCIPLINE_SHIELDS, canApplyShield } from '../lib/rewards'
import {
  applyInvestidaForToday,
  evaluateInvestidaOnOpen,
  getHardcoreProgramResetPatch,
  type InvestidaNotice,
} from '../lib/investida'

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

export type PornographyUse = 'never' | 'rarely' | 'monthly' | 'weekly'
export type AlcoholUse = 'never' | 'social' | 'weekly' | 'frequent'

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
  pornographyUse: PornographyUse | null
  alcoholUse: AlcoholUse | null
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
  recommendationWhy: [string, string]
}

export interface RadarScores {
  disciplina: number
  energia: number
  habitos: number
  consistencia: number
  saude: number
  foco: number
}

export interface AppState {
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
  /** ISO — quando o dia atual foi concluído (hábitos + foto). */
  dayCompletedAt: string | null
  programDayStartedAt: string | null
  onboardingComplete: boolean
  paymentComplete: boolean
  subscriptionStatus: SubscriptionStatus | null
  subscriptionPeriodEnd: string | null
  subscriptionCancelAtPeriodEnd: boolean
  pixViewed: boolean
  usePromoOffer: boolean
  mirrorPhotos: Record<number, string>
  taskChecksByDay: Record<number, Record<string, boolean>>
  readNotificationIds: string[]
  dismissedNotificationIds: string[]
  seenTierUnlockModals: string[]
  readScienceCardIds: string[]
  totalXp: number
  xpAwardedKeys: string[]
  disciplineShields: number
  shieldedDays: number[]
  lastShieldUsedDay: number | null
  /** Sequência civil de investida (estilo Duolingo). */
  investidaStreak: number
  /** YYYY-MM-DD local da última atividade que manteve a investida. */
  lastInvestidaDate: string | null
  /** Aviso pendente: investida quebrada ou salva por escudo. */
  investidaNotice: InvestidaNotice | null
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
  evolveToTier: (id: ChallengeId) => void
  markTierUnlockSeen: (key: string) => void
  markScienceCardRead: (cardId: string) => void
  purchaseDisciplineShield: () => boolean
  applyDisciplineShield: (day: number) => boolean
  /** Checa faltas de calendário e reseta/salva investida (chamar ao abrir o app). */
  checkInvestidaStreak: () => void
  clearInvestidaNotice: () => void
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
  /** Fecha o dia. Por padrão exige 100%; `allowPartial` libera a partir de 60%. */
  markCurrentDayComplete: (options?: { allowPartial?: boolean }) => void
  advanceProgramDay: (force?: boolean) => boolean
  toggleTaskCheck: (day: number, taskId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (ids: string[]) => void
  dismissNotification: (id: string) => void
  dismissAllNotifications: (ids: string[]) => void
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
  pornographyUse: null,
  alcoholUse: null,
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
  dayCompletedAt: null as string | null,
  programDayStartedAt: null as string | null,
  onboardingComplete: false,
  paymentComplete: false,
  subscriptionStatus: null as SubscriptionStatus | null,
  subscriptionPeriodEnd: null as string | null,
  subscriptionCancelAtPeriodEnd: false,
  pixViewed: false,
  usePromoOffer: false,
  mirrorPhotos: {} as Record<number, string>,
  taskChecksByDay: {} as Record<number, Record<string, boolean>>,
  readNotificationIds: [] as string[],
  dismissedNotificationIds: [] as string[],
  seenTierUnlockModals: [] as string[],
  readScienceCardIds: [] as string[],
  totalXp: 0,
  xpAwardedKeys: [] as string[],
  disciplineShields: 0,
  shieldedDays: [] as number[],
  lastShieldUsedDay: null as number | null,
  investidaStreak: 0,
  lastInvestidaDate: null as string | null,
  investidaNotice: null as InvestidaNotice | null,
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
        scheduleProfileSync()
      },
      setSigned: (signed) => set({ signed }),
      setSelectedPlan: (plan) => set({ selectedPlan: plan }),
      setChallengeId: (id) => set({ challengeId: id }),
      acceptChallenge: (id) => {
        const now = new Date().toISOString()
        set({
          challengeId: id,
          challengeAccepted: true,
          currentDay: 1,
          dayCompletedAt: null,
          programDayStartedAt: now,
          mirrorPhotos: {},
          taskChecksByDay: {},
          seenTierUnlockModals: [],
          readScienceCardIds: [],
          xpAwardedKeys: [],
          shieldedDays: [],
          lastShieldUsedDay: null,
          investidaStreak: 0,
          lastInvestidaDate: null,
          investidaNotice: null,
        })
        scheduleProfileSync()
      },
      evolveToTier: (id) => {
        set({ challengeId: id })
        scheduleProfileSync()
      },
      markTierUnlockSeen: (key) => {
        const seen = get().seenTierUnlockModals
        if (seen.includes(key)) return
        set({ seenTierUnlockModals: [...seen, key] })
        scheduleProfileSync()
      },
      markScienceCardRead: (cardId) => {
        const state = get()
        if (state.readScienceCardIds.includes(cardId)) return
        const { totalXp, xpAwardedKeys } = awardScienceXp(
          state.totalXp,
          state.xpAwardedKeys,
          cardId
        )
        set({
          readScienceCardIds: [...state.readScienceCardIds, cardId],
          totalXp,
          xpAwardedKeys,
        })
        scheduleProfileSync()
      },
      purchaseDisciplineShield: () => {
        const state = get()
        if (state.disciplineShields >= MAX_DISCIPLINE_SHIELDS) return false
        if (state.totalXp < DISCIPLINE_SHIELD_COST) return false

        set({
          totalXp: state.totalXp - DISCIPLINE_SHIELD_COST,
          disciplineShields: state.disciplineShields + 1,
        })
        scheduleProfileSync()
        return true
      },
      applyDisciplineShield: (day) => {
        const state = get()
        if (!state.challengeId) return false
        if (
          isDayComplete(
            state.challengeId,
            day,
            state.taskChecksByDay,
            state.mirrorPhotos,
            state.shieldedDays
          )
        ) {
          return false
        }
        if (
          !canApplyShield(
            day,
            state.shieldedDays,
            state.lastShieldUsedDay,
            state.disciplineShields
          )
        ) {
          return false
        }

        set({
          disciplineShields: state.disciplineShields - 1,
          shieldedDays: [...state.shieldedDays, day],
          lastShieldUsedDay: day,
          dayCompletedAt: state.dayCompletedAt ?? new Date().toISOString(),
          ...applyInvestidaForToday(state),
        })
        scheduleProfileSync()
        return true
      },
      checkInvestidaStreak: () => {
        const state = get()
        // Corrige salto indevido para Dia 2+ sem nenhum hábito marcado (bug do merge invested_days).
        const hasAnyHabit = Object.values(state.taskChecksByDay).some((day) =>
          Object.values(day).some(Boolean)
        )
        const hasPhotos = Object.keys(state.mirrorPhotos).length > 0
        if (
          state.challengeAccepted &&
          normalizeProgramDay(state.currentDay) > 1 &&
          !state.dayCompletedAt &&
          !hasAnyHabit &&
          !hasPhotos
        ) {
          set({ currentDay: 1 })
        }

        const next = get()
        const { patch, changed, hardResetProgram } = evaluateInvestidaOnOpen(next)
        if (!changed) {
          if (normalizeProgramDay(state.currentDay) > 1 && normalizeProgramDay(get().currentDay) === 1) {
            scheduleProfileSync()
            void flushProfileSync()
          }
          return
        }
        set({
          ...patch,
          ...(hardResetProgram ? getHardcoreProgramResetPatch() : {}),
        })
        scheduleProfileSync()
        if (hardResetProgram || patch.investidaNotice?.type === 'shield_saved') {
          void flushProfileSync()
        }
      },
      clearInvestidaNotice: () => set({ investidaNotice: null }),
      quitChallenge: () => {
        set({
          challengeId: null,
          challengeAccepted: false,
          currentDay: 1,
          dayCompletedAt: null,
          programDayStartedAt: null,
          mirrorPhotos: {},
          taskChecksByDay: {},
          seenTierUnlockModals: [],
          readScienceCardIds: [],
          xpAwardedKeys: [],
          shieldedDays: [],
          lastShieldUsedDay: null,
          investidaStreak: 0,
          lastInvestidaDate: null,
          investidaNotice: null,
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
        void logMirrorPhotoToCloud(day, photoUrl)
        get().markCurrentDayComplete()
      },
      markCurrentDayComplete: (options) => {
        const state = get()
        if (!state.challengeAccepted || !state.challengeId) return

        const programDay = normalizeProgramDay(state.currentDay)
        const progress = getDayMissionProgress(
          state.challengeId,
          programDay,
          state.taskChecksByDay,
          state.mirrorPhotos,
          state.shieldedDays
        )

        // Auto (check/foto): só em 100%. Botão "mesmo assim": a partir de 60%.
        const allowed = options?.allowPartial ? progress.canFinalize : progress.isPerfect
        if (!allowed) return

        if (state.dayCompletedAt) return

        const { totalXp, xpAwardedKeys } = awardDayXp(
          state.totalXp,
          state.xpAwardedKeys,
          programDay,
          state.challengeId,
          state.taskChecksByDay,
          state.mirrorPhotos,
          state.shieldedDays
        )

        let nextXp = totalXp
        let nextKeys = xpAwardedKeys
        if (programDay === 30) {
          const tier = awardTierUnlockXp(nextXp, nextKeys, 'intermediario')
          nextXp = tier.totalXp
          nextKeys = tier.xpAwardedKeys
        }
        if (programDay === 60) {
          const tier = awardTierUnlockXp(nextXp, nextKeys, 'implacavel')
          nextXp = tier.totalXp
          nextKeys = tier.xpAwardedKeys
        }

        set({
          dayCompletedAt: new Date().toISOString(),
          totalXp: nextXp,
          xpAwardedKeys: nextKeys,
          ...applyInvestidaForToday(state),
        })
        scheduleProfileSync()
      },
      advanceProgramDay: (force = false) => {
        const state = get()
        if (!state.challengeAccepted || !state.challengeId) return false

        const programDay = normalizeProgramDay(state.currentDay)
        if (programDay >= 90) return false

        const unlock = getDayUnlockStatus({
          challengeAccepted: state.challengeAccepted,
          challengeId: state.challengeId,
          currentDay: state.currentDay,
          taskChecksByDay: state.taskChecksByDay,
          mirrorPhotos: state.mirrorPhotos,
          dayCompletedAt: state.dayCompletedAt,
          shieldedDays: state.shieldedDays,
        })

        if (!force && !unlock.canAdvance) return false

        const now = new Date().toISOString()
        set({
          currentDay: programDay + 1,
          dayCompletedAt: null,
          programDayStartedAt: now,
        })
        scheduleProfileSync()
        return true
      },
      toggleTaskCheck: (day, taskId) => {
        const byDay = get().taskChecksByDay
        const dayChecks = byDay[day] ?? {}
        const next = !dayChecks[taskId]
        const updatedDayChecks = { ...dayChecks, [taskId]: next }
        const state = get()
        const challengeId = state.challengeId
        let dayCompletedAt = state.dayCompletedAt

        if (
          challengeId &&
          normalizeProgramDay(state.currentDay) === day &&
          dayCompletedAt &&
          !isDayComplete(
            challengeId,
            day,
            { ...byDay, [day]: updatedDayChecks },
            state.mirrorPhotos,
            state.shieldedDays
          )
        ) {
          dayCompletedAt = null
        }

        let totalXp = state.totalXp
        let xpAwardedKeys = state.xpAwardedKeys
        if (next && challengeId) {
          const habitAward = awardHabitXp(totalXp, xpAwardedKeys, day, taskId)
          totalXp = habitAward.totalXp
          xpAwardedKeys = habitAward.xpAwardedKeys
        }

        set({
          taskChecksByDay: {
            ...byDay,
            [day]: updatedDayChecks,
          },
          dayCompletedAt,
          totalXp,
          xpAwardedKeys,
        })
        if (next) {
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
          get().markCurrentDayComplete()
        }
        void flushProfileSync()
      },
      markNotificationRead: (id) => {
        const read = get().readNotificationIds
        if (read.includes(id)) return
        set({ readNotificationIds: [...read, id] })
      },
      markAllNotificationsRead: (ids) => {
        get().dismissAllNotifications(ids)
      },
      dismissNotification: (id) => {
        const dismissed = get().dismissedNotificationIds
        const read = get().readNotificationIds
        const nextDismissed = dismissed.includes(id) ? dismissed : [...dismissed, id]
        const nextRead = read.includes(id) ? read : [...read, id]
        set({
          dismissedNotificationIds: nextDismissed,
          readNotificationIds: nextRead,
        })
      },
      dismissAllNotifications: (ids) => {
        const dismissed = new Set([...get().dismissedNotificationIds, ...ids])
        const read = new Set([...get().readNotificationIds, ...ids])
        set({
          dismissedNotificationIds: [...dismissed],
          readNotificationIds: [...read],
        })
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
      version: 3,
      partialize: (state) => ({
        name: state.name,
        email: state.email,
        avatarUrl: state.avatarUrl,
        gender: state.gender,
        goals: state.goals,
        routineAnswers: state.routineAnswers,
        disciplineScore: state.disciplineScore,
        projectedScore: state.projectedScore,
        radarScores: state.radarScores,
        weakAreas: state.weakAreas,
        recommendedChallenge: state.recommendedChallenge,
        profileInsights: state.profileInsights,
        signed: state.signed,
        selectedPlan: state.selectedPlan,
        usePromoOffer: state.usePromoOffer,
        pixViewed: state.pixViewed,
        startDate: state.startDate,
        customStartDate: state.customStartDate,
        readNotificationIds: state.readNotificationIds,
        dismissedNotificationIds: state.dismissedNotificationIds,
        // Cache de acesso — evita bounce no PWA antes do hydrate da nuvem
        authUserId: state.authUserId,
        onboardingComplete: state.onboardingComplete,
        paymentComplete: state.paymentComplete,
        subscriptionStatus: state.subscriptionStatus,
        subscriptionPeriodEnd: state.subscriptionPeriodEnd,
        subscriptionCancelAtPeriodEnd: state.subscriptionCancelAtPeriodEnd,
        challengeAccepted: state.challengeAccepted,
        challengeId: state.challengeId,
      }),
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== 'object') return persisted
        const raw = persisted as Record<string, unknown>
        return {
          name: typeof raw.name === 'string' ? raw.name : '',
          email: typeof raw.email === 'string' ? raw.email : '',
          avatarUrl: typeof raw.avatarUrl === 'string' ? raw.avatarUrl : null,
          gender: raw.gender ?? null,
          goals: Array.isArray(raw.goals) ? raw.goals : [],
          routineAnswers: raw.routineAnswers ?? emptyRoutineAnswers,
          disciplineScore: typeof raw.disciplineScore === 'number' ? raw.disciplineScore : 23,
          projectedScore: typeof raw.projectedScore === 'number' ? raw.projectedScore : 92,
          radarScores: raw.radarScores ?? defaultRadarScores,
          weakAreas: Array.isArray(raw.weakAreas) ? raw.weakAreas : [],
          recommendedChallenge: raw.recommendedChallenge ?? null,
          profileInsights: raw.profileInsights ?? null,
          signed: Boolean(raw.signed),
          selectedPlan: raw.selectedPlan === 'monthly' ? 'monthly' : 'quarterly',
          usePromoOffer: Boolean(raw.usePromoOffer),
          pixViewed: Boolean(raw.pixViewed),
          startDate: raw.startDate ?? null,
          customStartDate: typeof raw.customStartDate === 'string' ? raw.customStartDate : null,
          readNotificationIds: Array.isArray(raw.readNotificationIds) ? raw.readNotificationIds : [],
          dismissedNotificationIds: Array.isArray(raw.dismissedNotificationIds)
            ? raw.dismissedNotificationIds
            : [],
          authUserId: typeof raw.authUserId === 'string' ? raw.authUserId : null,
          onboardingComplete: Boolean(raw.onboardingComplete),
          paymentComplete: Boolean(raw.paymentComplete),
          subscriptionStatus: raw.subscriptionStatus ?? null,
          subscriptionPeriodEnd:
            typeof raw.subscriptionPeriodEnd === 'string' ? raw.subscriptionPeriodEnd : null,
          subscriptionCancelAtPeriodEnd: Boolean(raw.subscriptionCancelAtPeriodEnd),
          challengeAccepted: Boolean(raw.challengeAccepted),
          challengeId: raw.challengeId ?? null,
        }
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<AppState> | undefined
        if (!saved) return current
        return {
          ...current,
          name: saved.name ?? current.name,
          email: saved.email ?? current.email,
          avatarUrl: saved.avatarUrl ?? current.avatarUrl,
          gender: saved.gender ?? current.gender,
          goals: Array.isArray(saved.goals) ? saved.goals : current.goals,
          routineAnswers: saved.routineAnswers ?? current.routineAnswers,
          disciplineScore:
            typeof saved.disciplineScore === 'number' ? saved.disciplineScore : current.disciplineScore,
          projectedScore:
            typeof saved.projectedScore === 'number' ? saved.projectedScore : current.projectedScore,
          radarScores: saved.radarScores ?? current.radarScores,
          weakAreas: Array.isArray(saved.weakAreas) ? saved.weakAreas : current.weakAreas,
          recommendedChallenge: saved.recommendedChallenge ?? current.recommendedChallenge,
          profileInsights: saved.profileInsights ?? current.profileInsights,
          signed: Boolean(saved.signed ?? current.signed),
          selectedPlan: saved.selectedPlan === 'monthly' ? 'monthly' : current.selectedPlan,
          usePromoOffer: Boolean(saved.usePromoOffer ?? current.usePromoOffer),
          pixViewed: Boolean(saved.pixViewed ?? current.pixViewed),
          startDate: saved.startDate ?? current.startDate,
          customStartDate: saved.customStartDate ?? current.customStartDate,
          readNotificationIds: Array.isArray(saved.readNotificationIds)
            ? saved.readNotificationIds
            : current.readNotificationIds,
          dismissedNotificationIds: Array.isArray(saved.dismissedNotificationIds)
            ? saved.dismissedNotificationIds
            : current.dismissedNotificationIds,
          authUserId: saved.authUserId ?? current.authUserId,
          onboardingComplete: Boolean(saved.onboardingComplete ?? current.onboardingComplete),
          paymentComplete: Boolean(saved.paymentComplete ?? current.paymentComplete),
          subscriptionStatus: saved.subscriptionStatus ?? current.subscriptionStatus,
          subscriptionPeriodEnd: saved.subscriptionPeriodEnd ?? current.subscriptionPeriodEnd,
          subscriptionCancelAtPeriodEnd: Boolean(
            saved.subscriptionCancelAtPeriodEnd ?? current.subscriptionCancelAtPeriodEnd
          ),
          challengeAccepted: Boolean(saved.challengeAccepted ?? current.challengeAccepted),
          challengeId: saved.challengeId ?? current.challengeId,
        }
      },
      onRehydrateStorage: () => () => {
        markStoreHydrated()
      },
    }
  )
)

export type RoutineStepId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11'

export const QUIZ_STEP_ORDER: RoutineStepId[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
]

export const ROUTINE_STEPS: Record<
  RoutineStepId,
  {
    title: string
    subtitle: string
    questions: {
      key: keyof RoutineAnswers
      label: string
      emoji: string
      skipWhen?: { key: keyof RoutineAnswers; values: string[] }
      options: { value: string; label: string; emoji: string }[]
    }[]
    skipWhen?: { key: keyof RoutineAnswers; values: string[] }
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
    title: '⚡ Quão puxado está seu dia?',
    subtitle: 'Trabalho, estudo e responsabilidades',
    questions: [
      {
        key: 'workLoad',
        label: 'Carga do dia',
        emoji: '⚡',
        options: [
          { value: 'light', label: 'Leve — sobra tempo', emoji: '🌤️' },
          { value: 'moderate', label: 'Normal — dá pra organizar', emoji: '⚖️' },
          { value: 'heavy', label: 'Pesado — quase sem folga', emoji: '😮‍💨' },
          { value: 'overwhelming', label: 'Sobrecarregado', emoji: '🆘' },
        ],
      },
    ],
    next: '/onboarding/quiz/5',
  },
  '5': {
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
    next: '/onboarding/quiz/6',
  },
  '6': {
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
    next: '/onboarding/quiz/7',
  },
  '7': {
    title: '📱 Quanto tempo no celular fora do trabalho?',
    subtitle: 'Fora do trabalho e estudo',
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
    next: '/onboarding/quiz/8',
  },
  '8': {
    title: '📅 Como é sua rotina hoje?',
    subtitle: 'Nos últimos 30 dias',
    questions: [
      {
        key: 'routineConsistency',
        label: 'Rotina',
        emoji: '📅',
        options: [
          { value: 'chaotic', label: 'Cada dia é um caos', emoji: '🌪️' },
          { value: 'somewhat', label: 'Mais ou menos', emoji: '🎲' },
          { value: 'mostly', label: 'Bem organizada', emoji: '📋' },
          { value: 'structured', label: 'Tudo no horário', emoji: '⏰' },
        ],
      },
    ],
    next: '/onboarding/quiz/9',
  },
  '9': {
    title: '🔞 Você assiste pornografia?',
    subtitle: 'Resposta honesta — só você vê isso',
    questions: [
      {
        key: 'pornographyUse',
        label: 'Pornografia',
        emoji: '🔞',
        options: [
          { value: 'never', label: 'Não assisto', emoji: '✅' },
          { value: 'rarely', label: 'Raramente', emoji: '🙂' },
          { value: 'monthly', label: 'Algumas vezes no mês', emoji: '😐' },
          { value: 'weekly', label: 'Toda semana ou mais', emoji: '⚠️' },
        ],
      },
    ],
    next: '/onboarding/quiz/10',
  },
  '10': {
    title: '🍺 Você bebe álcool?',
    subtitle: 'Sem julgamento — é pra calibrar seu desafio',
    questions: [
      {
        key: 'alcoholUse',
        label: 'Álcool',
        emoji: '🍺',
        options: [
          { value: 'never', label: 'Não bebo', emoji: '✅' },
          { value: 'social', label: 'Só em festas / social', emoji: '🥂' },
          { value: 'weekly', label: 'Quase toda semana', emoji: '🍻' },
          { value: 'frequent', label: 'Várias vezes por semana', emoji: '⚠️' },
        ],
      },
    ],
    next: '/onboarding/quiz/11',
  },
  '11': {
    title: '📚 Com que frequência você estuda?',
    subtitle: 'Se não estuda, pule automaticamente',
    skipWhen: { key: 'studySituation', values: ['none'] },
    questions: [
      {
        key: 'studyFrequency',
        label: 'Frequência de estudo',
        emoji: '📚',
        options: [
          { value: 'occasional', label: 'De vez em quando', emoji: '📝' },
          { value: 'few_times_week', label: 'Alguns dias na semana', emoji: '📖' },
          { value: 'daily', label: 'Quase todo dia', emoji: '🔥' },
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
    name: 'Desafio Explorador',
    badge: 'EXPLORADOR',
    badgeColor: 'bg-accent-green text-black',
    tagline: 'O primeiro passo — leve, possível e consistente',
    image: '/niveis/iniciante.jpg',
    tags: [
      '🥗 Alimentação com carbo e proteína de qualidade',
      '🏋️ Treino 2–3x/semana',
      '📖 Ler 2–5 páginas/dia',
      '😴 Dormir 7h+ pelo menos 4 dias/semana',
    ],
    tasks: [
      {
        id: 'diet',
        icon: '🥗',
        title: 'Alimentação',
        subtitle: '',
        type: 'check' as const,
        daily:
          'Monte refeições com carboidratos de boa qualidade (arroz, batata, aveia, fruta) e proteínas (ovo, carne, frango, peixe, whey). Evite ultraprocessados, fast food e refrigerante.',
        weekly:
          'Priorize comida de verdade a maior parte da semana. Se sair da linha um dia, volte no próximo sem drama.',
        previewVerb: 'Comer com carbo e proteína de qualidade',
        previewHint: 'Comi com carbo e proteína de qualidade — sem ultraprocessados',
        tips: [
          'Carbo de qualidade: arroz, batata, mandioca, aveia, pão integral, frutas.',
          'Proteínas: ovo, frango, carne, peixe, iogurte natural, whey.',
          'Fuja de: salgadinho, refrigerante, fast food, embutidos e doces industriais no dia a dia.',
        ],
      },
      {
        id: 'workout',
        icon: '🏋️',
        title: 'Treino moderado',
        subtitle: '',
        type: 'check' as const,
        daily: 'Se hoje é dia de treino: pelo menos 30 min de movimento (caminhada, academia ou casa).',
        weekly: '2 a 3 treinos por semana. Marque só nos dias que treinou de fato.',
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
        weekly: 'Pelo menos 4 noites com 7h+ de sono por semana.',
        previewVerb: 'Dormir pelo menos 7 horas',
        previewHint: 'Dormi pelo menos 7 horas',
        tips: [
          'Meta: 7 horas ou mais.',
          'Na semana: cumpra isso em pelo menos 4 dias.',
          'Sono ruim destrói treino, humor e disciplina — trate como missão.',
        ],
      },
    ],
  },
  intermediario: {
    id: 'intermediario' as const,
    name: 'Desafio Desafiante',
    badge: 'DESAFIANTE',
    badgeColor: 'bg-accent-yellow text-black',
    tagline: 'Mais exigência — corpo, mente e foco alinhados',
    image: '/niveis/intermediario.jpg',
    tags: [
      '🍽️ Dieta limpa — carbo e proteína de qualidade',
      '🏋️ Treino 3–4x/semana',
      '📖 Ler 5–10 páginas/dia',
      '🚫 Zero pornografia',
      '😴 7h+ em pelo menos 4 dias/semana',
    ],
    tasks: [
      {
        id: 'diet',
        icon: '🍽️',
        title: 'Alimentação limpa',
        subtitle: '',
        type: 'check' as const,
        daily:
          'Base do prato: carbo de qualidade + proteína. Zero ultraprocessados, fast food e excesso de doce.',
        weekly: 'Alimentação limpa na maior parte da semana — comida de verdade primeiro.',
        previewVerb: 'Comer limpo com carbo e proteína',
        previewHint: 'Comi limpo — carbo e proteína, sem ultraprocessados',
        tips: [
          'Carbo de qualidade + proteína em quase toda refeição.',
          'Evite ultraprocessados, refrigerante e delivery por impulso.',
          'Se errou uma refeição, a próxima ainda pode ser limpa.',
        ],
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
        title: 'Zero pornografia',
        subtitle: '',
        type: 'check' as const,
        daily: 'Fora pornografia. Zero. Marque ao final do dia se manteve.',
        weekly: '7 dias limpos — sem exceção.',
        previewVerb: 'Ficar longe de pornografia',
        previewHint: 'Fiquei longe de pornografia hoje',
        tips: [
          'Regra dura: fora. Sem “só um pouco”.',
          'Bloqueie gatilhos (apps, horários, lugar na cama com celular).',
          'Cada dia limpo fortalece foco e disciplina.',
        ],
      },
      {
        id: 'sleep',
        icon: '😴',
        title: 'Sono',
        subtitle: '',
        type: 'check' as const,
        daily: 'Durma pelo menos 7 horas esta noite.',
        weekly: 'Pelo menos 4 noites com 7h+ de sono por semana.',
        previewVerb: 'Dormir pelo menos 7 horas',
        previewHint: 'Dormi pelo menos 7 horas',
        tips: [
          'Meta diária: 7 horas ou mais.',
          'Na semana: pelo menos 4 dias batendo essa meta.',
        ],
      },
    ],
  },
  implacavel: {
    id: 'implacavel' as const,
    name: 'Desafio Implacável',
    badge: 'IMPLACÁVEL',
    badgeColor: 'bg-accent-orange',
    tagline: 'Sem atalhos — transformação total em 90 dias',
    image: '/niveis/implacavel.jpg',
    tags: [
      '📋 Dieta regrada + 1 ref. livre/semana',
      '💊 Suplementação (creatina)',
      '🏋️ Treino 1h · 4–5x/semana',
      '📖 Ler 10–15 páginas/dia',
      '📷 Foto a cada 3 dias',
      '🚫 Zero pornografia',
      '🍷 Álcool 80/20 — 1 dia livre/semana',
      '😴 7h+ em pelo menos 4 dias/semana',
    ],
    tasks: [
      {
        id: 'diet',
        icon: '📋',
        title: 'Dieta regrada',
        subtitle: '',
        type: 'check' as const,
        daily:
          'Prato com carbo de qualidade e proteína. Sem ultraprocessados, fast food ou doce em excesso.',
        weekly: '1 refeição livre por semana — escolha o dia. Nos outros, comida limpa.',
        previewVerb: 'Seguir a dieta regrada',
        previewHint: 'Segui a dieta regrada hoje',
        tips: [
          'Carbo de qualidade + proteína em toda refeição principal.',
          'Fuja de ultraprocessados — eles sabotam energia e resultado.',
          '1 refeição livre/semana é estratégia, não desculpa para o resto da semana.',
        ],
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
        daily:
          'Se hoje é dia de treino: complete no mínimo 1 hora (musculação, corrida ou similar).',
        weekly: '4 a 5 sessões por semana. Marque só nos dias em que treinou de fato.',
        previewVerb: 'Treinar 1 hora nos dias de treino',
        previewHint: 'Treinei pelo menos 1 hora hoje',
        tips: [
          'Mínimo: 60 minutos de treino real.',
          'Aquecimento conta se fizer parte da sessão estruturada.',
          'Marque só se treinou de verdade — honestidade é o jogo.',
        ],
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
        daily: 'Tire a foto do shape hoje — mesmo ângulo, mesma luz e mesma pose.',
        weekly: 'Só aparece nos dias de registro. Tire a foto e pronto.',
        previewVerb: 'Tirar a foto do shape',
        previewHint: 'Tire a foto do shape',
        tips: [
          'Mesmo lugar e mesma pose de sempre.',
          'Luz natural, sem filtro.',
          'Corpo inteiro ou do joelho pra cima — sempre igual.',
        ],
      },
      {
        id: 'noporn',
        icon: '🚫',
        title: 'Zero pornografia',
        subtitle: '',
        type: 'check' as const,
        daily: 'Fora pornografia. Zero acesso. Marque ao final do dia se manteve.',
        weekly: '7 dias limpos — cada dia é uma vitória individual.',
        previewVerb: 'Ficar longe de pornografia',
        previewHint: 'Fiquei longe de pornografia hoje',
        tips: [
          'Regra dura: fora. Sem negociar consigo mesmo.',
          'Proteja o sono e o foco — pornografia drena os dois.',
        ],
      },
      {
        id: 'alcohol',
        icon: '🍷',
        title: 'Álcool 80/20',
        subtitle: '',
        type: 'check' as const,
        daily:
          'Sem álcool hoje — ou marque se hoje é o seu único dia livre da semana (regra 80/20).',
        weekly:
          'Escolha 1 dia livre por semana. Nos outros 6: zero álcool. Sem “mais um dia”.',
        previewVerb: 'Seguir a regra 80/20 do álcool',
        previewHint: 'Segui a regra 80/20 — sem álcool (ou era meu dia livre)',
        tips: [
          '80/20: 6 dias secos, 1 dia livre — escolha o dia com antecedência.',
          'No dia livre, ainda vale consciência: não transforme em excesso.',
          'Fora do dia livre: zero. Sem negociar.',
        ],
      },
      {
        id: 'sleep',
        icon: '😴',
        title: 'Sono',
        subtitle: '',
        type: 'check' as const,
        daily: 'Durma pelo menos 7 horas esta noite. Marque ao acordar.',
        weekly: 'Pelo menos 4 noites com 7h+ por semana para energia e recuperação.',
        previewVerb: 'Dormir pelo menos 7 horas',
        previewHint: 'Dormi pelo menos 7 horas',
        tips: [
          'Meta: 7 horas ou mais.',
          'Cumprir em pelo menos 4 dias na semana.',
          'No Implacável, sono ruim = treino e dieta sabotados.',
        ],
      },
    ],
  },
}

export const CHALLENGE_LIST = [
  CHALLENGES.iniciante,
  CHALLENGES.intermediario,
  CHALLENGES.implacavel,
]
