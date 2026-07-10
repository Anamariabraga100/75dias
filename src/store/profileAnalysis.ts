import type {
  ChallengeId,
  Goal,
  ProfileInsights,
  RadarScores,
  RoutineAnswers,
} from './useAppStore'
import {
  buildPriorityActions,
  buildRecommendationWhy,
  readHabitSignals,
  recommendChallengeLevel,
} from '../lib/profileRecommendation'

const GOAL_LABELS: Record<Goal, string> = {
  discipline: 'construir disciplina',
  distractions: 'reduzir distrações',
  burnout: 'recuperar do burnout',
  routine: 'criar uma rotina sólida',
  time: 'recuperar seu tempo',
  consistency: 'manter consistência',
}

const WORK_LABELS: Record<string, string> = {
  student: 'estudante',
  employed_office: 'trabalho presencial',
  remote: 'home office',
  entrepreneur: 'empreendedor',
  shift: 'turnos alternados',
  not_working: 'sem trabalho fixo',
}

const STUDY_LABELS: Record<string, string> = {
  none: 'sem estudos ativos',
  school: 'ensino médio',
  college: 'faculdade',
  course: 'curso profissionalizante',
  self_taught: 'estudo autodidata',
}

const TRAINING_GOAL_LABELS: Record<string, string> = {
  none: 'sem meta de treino',
  lose_weight: 'emagrecer',
  gain_muscle: 'ganhar massa',
  endurance: 'condicionamento',
  discipline: 'disciplina no treino',
  health: 'saúde geral',
}

function scoreValue(value: string | null, map: Record<string, number>): number {
  if (!value) return 50
  return map[value] ?? 50
}

const SCORE_MAPS = {
  wakeTime: { before_6: 82, '6_8': 88, '8_10': 72, after_10: 48 },
  sleepHours: { less_6: 32, '6_7': 58, '7_8': 88, more_8: 82 },
  workLoad: { light: 86, moderate: 72, heavy: 48, overwhelming: 28 },
  studyFrequency: { none: 72, occasional: 42, few_times_week: 68, daily: 86 },
  exerciseFrequency: { never: 22, '1_2_week': 48, '3_4_week': 74, daily: 92 },
  trainingGoal: { none: 52, lose_weight: 58, gain_muscle: 64, endurance: 68, discipline: 76, health: 66 },
  trainingPlace: { none: 38, home: 66, gym: 76, outdoor: 72, mixed: 82 },
  screenTime: { low: 92, moderate: 74, high: 46, very_high: 24 },
  routineConsistency: { chaotic: 28, somewhat: 52, mostly: 76, structured: 94 },
  mealHabits: { skip_meals: 32, irregular: 50, somewhat: 74, regular: 90 },
  pornographyUse: { never: 96, rarely: 72, monthly: 44, weekly: 16 },
  alcoholUse: { never: 94, social: 78, weekly: 40, frequent: 18 },
} as const

const HABIT_WEIGHTS = {
  routine: 0.18,
  exercise: 0.16,
  sleep: 0.14,
  screen: 0.12,
  meals: 0.1,
  study: 0.08,
  workLoad: 0.06,
  wake: 0.04,
  pornography: 0.06,
  alcohol: 0.06,
} as const

function inferWakeTime(sleepHours: RoutineAnswers['sleepHours']): string | null {
  if (!sleepHours) return null
  if (sleepHours === 'less_6') return 'before_6'
  if (sleepHours === '6_7' || sleepHours === '7_8') return '6_8'
  return '8_10'
}

function inferTrainingFromExercise(
  exercise: RoutineAnswers['exerciseFrequency']
): { goal: string | null; place: string | null } {
  if (!exercise || exercise === 'never') return { goal: 'none', place: 'none' }
  if (exercise === '1_2_week') return { goal: 'health', place: 'mixed' }
  return { goal: 'discipline', place: 'mixed' }
}

export const GENERAL_AVERAGE_SCORE = 57

export function analyzeProfile(
  answers: RoutineAnswers,
  goals: Goal[],
  name: string
): {
  disciplineScore: number
  projectedScore: number
  radarScores: RadarScores
  weakAreas: string[]
  recommendedChallenge: ChallengeId
  insights: ProfileInsights
} {
  const wake = scoreValue(answers.wakeTime ?? inferWakeTime(answers.sleepHours), SCORE_MAPS.wakeTime)
  const sleep = scoreValue(answers.sleepHours, SCORE_MAPS.sleepHours)
  const workLoad = scoreValue(answers.workLoad, SCORE_MAPS.workLoad)
  const studyFreq =
    answers.studySituation === 'none' || !answers.studySituation
      ? 72
      : scoreValue(answers.studyFrequency, SCORE_MAPS.studyFrequency)
  const exercise = scoreValue(answers.exerciseFrequency, SCORE_MAPS.exerciseFrequency)
  const inferredTraining = inferTrainingFromExercise(answers.exerciseFrequency)
  const trainingGoal = scoreValue(
    answers.trainingGoal ?? inferredTraining.goal,
    SCORE_MAPS.trainingGoal
  )
  const trainingPlace = scoreValue(
    answers.trainingPlace ?? inferredTraining.place,
    SCORE_MAPS.trainingPlace
  )
  const screen = scoreValue(answers.screenTime, SCORE_MAPS.screenTime)
  const routine = scoreValue(answers.routineConsistency, SCORE_MAPS.routineConsistency)
  const meals = scoreValue(answers.mealHabits, SCORE_MAPS.mealHabits)
  const pornography = scoreValue(answers.pornographyUse, SCORE_MAPS.pornographyUse)
  const alcohol = scoreValue(answers.alcoholUse, SCORE_MAPS.alcoholUse)

  const signals = readHabitSignals(answers, goals)

  const radarScores: RadarScores = {
    disciplina: Math.round((exercise + routine + trainingGoal + wake) / 4),
    energia: Math.round((sleep + meals + workLoad + exercise) / 4),
    habitos: Math.round((exercise + meals + routine + studyFreq) / 4),
    consistencia: Math.round((routine + exercise + studyFreq) / 3),
    saude: Math.round((exercise + sleep + meals + trainingPlace) / 4),
    foco: Math.round((screen + routine + workLoad + pornography) / 4),
  }

  if (goals.includes('burnout')) radarScores.energia = Math.max(20, radarScores.energia - 6)
  if (goals.includes('distractions')) radarScores.foco = Math.max(20, radarScores.foco - 8)

  let disciplineScore = Math.round(
    routine * HABIT_WEIGHTS.routine +
      exercise * HABIT_WEIGHTS.exercise +
      sleep * HABIT_WEIGHTS.sleep +
      screen * HABIT_WEIGHTS.screen +
      meals * HABIT_WEIGHTS.meals +
      studyFreq * HABIT_WEIGHTS.study +
      workLoad * HABIT_WEIGHTS.workLoad +
      wake * HABIT_WEIGHTS.wake +
      pornography * HABIT_WEIGHTS.pornography +
      alcohol * HABIT_WEIGHTS.alcohol
  )

  if (goals.includes('discipline')) disciplineScore += 2
  if (goals.includes('consistency')) disciplineScore += 2

  disciplineScore = Math.min(92, Math.max(18, disciplineScore))

  const projectedScore = Math.min(
    96,
    Math.round(disciplineScore + (100 - disciplineScore) * (goals.length >= 3 ? 0.72 : 0.65))
  )

  const recommendedChallenge = recommendChallengeLevel(disciplineScore, answers, goals)
  const recommendationWhy = buildRecommendationWhy(
    recommendedChallenge,
    answers,
    goals,
    disciplineScore
  )

  const axisLabels: { key: keyof RadarScores; label: string }[] = [
    { key: 'disciplina', label: 'disciplina' },
    { key: 'energia', label: 'energia' },
    { key: 'habitos', label: 'hábitos' },
    { key: 'consistencia', label: 'consistência' },
    { key: 'saude', label: 'saúde' },
    { key: 'foco', label: 'foco' },
  ]

  const sorted = [...axisLabels].sort((a, b) => radarScores[a.key] - radarScores[b.key])
  const weakAreas = sorted.slice(0, 2).map((a) => a.label)
  const strongAreas = sorted
    .slice(-2)
    .reverse()
    .map((a) => a.label)

  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Você'
  const goalText =
    goals.length > 0
      ? goals.slice(0, 2).map((g) => GOAL_LABELS[g]).join(' e ')
      : 'retomar o controle da rotina'

  const workText = answers.workSituation ? WORK_LABELS[answers.workSituation] : 'sua rotina'
  const studyText =
    answers.studySituation && answers.studySituation !== 'none'
      ? STUDY_LABELS[answers.studySituation]
      : null
  const trainingText = answers.trainingGoal
    ? TRAINING_GOAL_LABELS[answers.trainingGoal]
    : null

  const priorityActions = buildPriorityActions(answers, goals, signals)

  const challengeName =
    recommendedChallenge === 'implacavel'
      ? 'Desafio Implacável'
      : recommendedChallenge === 'iniciante'
        ? 'Desafio Desafiante'
        : 'Desafio Dominante'

  const insights: ProfileInsights = {
    weakAreas,
    strongAreas,
    scoreSummary: `${displayName}, sua disciplina hoje está em ${disciplineScore}% — ${
      disciplineScore >= GENERAL_AVERAGE_SCORE ? 'acima' : 'abaixo'
    } da média geral (${GENERAL_AVERAGE_SCORE}%). Foco: ${goalText}.`,
    personalizedQuote: buildQuote(displayName, signals, weakAreas, disciplineScore, projectedScore),
    beforeItems: buildBeforeItems(answers, goals, signals),
    afterItems: buildAfterItems(answers, goals, weakAreas),
    dayMessages: {
      day1: buildDayMessage(1, answers, goals, weakAreas[0]),
      day30: buildDayMessage(30, answers, goals, weakAreas[0]),
      day90: buildDayMessage(90, answers, goals, weakAreas[0]),
    },
    blueprintText: `${displayName}, montamos uma jornada de 90 dias focada em ${weakAreas.join(' e ')}${
      trainingText && trainingText !== 'sem meta de treino'
        ? `, com treino voltado para ${trainingText}`
        : ''
    }. Com base nas suas respostas, recomendamos o ${challengeName} — no ritmo que combina com quem vive ${workText}${
      studyText ? ` e estuda em ${studyText}` : ''
    }.`,
    priorityActions,
    recommendationWhy,
  }

  return {
    disciplineScore,
    projectedScore,
    radarScores,
    weakAreas,
    recommendedChallenge,
    insights,
  }
}

function buildBeforeItems(
  _answers: RoutineAnswers,
  goals: Goal[],
  signals: ReturnType<typeof readHabitSignals>
): string[] {
  const items: string[] = []
  if (signals.weakSleep) items.push('Sono insuficiente — acordando cansado(a)')
  if (signals.weakEnergy) items.push('Energia baixa no dia a dia')
  if (signals.weakExercise) items.push('Treino inconsistente ou inexistente')
  if (signals.weakFocus) items.push('Celular competindo com seus objetivos')
  if (signals.weakRoutine) items.push('Rotina instável — cada dia parece diferente')
  if (signals.weakVices) items.push('Hábitos que drenam energia e foco')
  if (goals.includes('burnout')) items.push('Sensação de esgotamento')
  if (items.length < 2) items.push('Hábitos ainda não viraram sistema automático')
  return items.slice(0, 3)
}

function buildAfterItems(_answers: RoutineAnswers, goals: Goal[], weakAreas: string[]): string[] {
  const items: string[] = []
  if (weakAreas.includes('foco') || goals.includes('distractions')) {
    items.push('Rotina com blocos de foco protegidos')
  }
  if (weakAreas.includes('energia') || goals.includes('burnout')) {
    items.push('Energia estável com sono e pausas')
  }
  if (weakAreas.includes('disciplina') || goals.includes('discipline')) {
    items.push('Disciplina diária sem depender de motivação')
  }
  if (goals.includes('consistency') || goals.includes('routine')) {
    items.push('Consistência por 90 dias — hábitos que ficam')
  }
  if (items.length < 2) items.push('Plano personalizado com base na sua avaliação')
  return items.slice(0, 3)
}

function buildQuote(
  name: string,
  signals: ReturnType<typeof readHabitSignals>,
  weakAreas: string[],
  disciplineScore: number,
  projectedScore: number
): string {
  const focus =
    signals.weakFocus
      ? 'reduzir distrações de tela'
      : signals.weakExercise
        ? 'tornar o treino um hábito fixo'
        : signals.weakRoutine
          ? 'estruturar sua rotina diária'
          : `fortalecer ${weakAreas[0] ?? 'consistência'}`

  return `${name}, seu próximo passo é ${focus}. Com 90 dias de estrutura no Reset90, dá para evoluir de ${disciplineScore}% para cerca de ${projectedScore}%.`
}

function buildDayMessage(
  day: number,
  answers: RoutineAnswers,
  _goals: Goal[],
  mainWeak: string | undefined
): string {
  const weak = mainWeak ?? 'consistência'

  if (day === 1) {
    if (answers.routineConsistency === 'chaotic') {
      return `Dia 1: sua rotina ainda é imprevisível — ${weak} será o primeiro alvo.`
    }
    return `Dia 1: começamos fortalecendo ${weak}. Pequenas vitórias diárias valem mais que picos de motivação.`
  }

  if (day === 30) {
    return 'Dia 30: é aqui que a maioria desiste — quem mantém o sistema passa dessa barreira.'
  }

  return `Dia 90: rotina estruturada, ${weak} transformada. Reset completo.`
}
