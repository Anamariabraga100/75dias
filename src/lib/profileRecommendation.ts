import type { ChallengeId, Goal, RoutineAnswers } from '../store/useAppStore'

export type HabitSignals = {
  strongRoutine: boolean
  strongExercise: boolean
  strongSleep: boolean
  strongFocus: boolean
  cleanHabits: boolean
  weakRoutine: boolean
  weakExercise: boolean
  weakSleep: boolean
  weakFocus: boolean
  weakEnergy: boolean
  weakVices: boolean
}

export function readHabitSignals(answers: RoutineAnswers, goals: Goal[]): HabitSignals {
  const weakVices =
    answers.pornographyUse === 'weekly' ||
    answers.pornographyUse === 'monthly' ||
    answers.alcoholUse === 'weekly' ||
    answers.alcoholUse === 'frequent'

  return {
    strongRoutine:
      answers.routineConsistency === 'structured' || answers.routineConsistency === 'mostly',
    strongExercise:
      answers.exerciseFrequency === 'daily' || answers.exerciseFrequency === '3_4_week',
    strongSleep: answers.sleepHours === '7_8' || answers.sleepHours === 'more_8',
    strongFocus: answers.screenTime === 'low' || answers.screenTime === 'moderate',
    cleanHabits:
      answers.pornographyUse === 'never' &&
      (answers.alcoholUse === 'never' || answers.alcoholUse === 'social'),
    weakRoutine:
      answers.routineConsistency === 'chaotic' || answers.routineConsistency === 'somewhat',
    weakExercise:
      answers.exerciseFrequency === 'never' || answers.exerciseFrequency === '1_2_week',
    weakSleep: answers.sleepHours === 'less_6' || answers.sleepHours === '6_7',
    weakFocus: answers.screenTime === 'high' || answers.screenTime === 'very_high',
    weakEnergy:
      goals.includes('burnout') ||
      answers.workLoad === 'heavy' ||
      answers.workLoad === 'overwhelming' ||
      answers.mealHabits === 'skip_meals' ||
      answers.mealHabits === 'irregular',
    weakVices,
  }
}

/** Respostas no melhor nível possível em cada pergunta do quiz. */
export function isExcellentProfile(answers: RoutineAnswers): boolean {
  const sleepOk = answers.sleepHours === '7_8' || answers.sleepHours === 'more_8'
  const loadOk = answers.workLoad === 'light' || answers.workLoad === 'moderate'
  const exerciseOk =
    answers.exerciseFrequency === '3_4_week' || answers.exerciseFrequency === 'daily'
  const mealsOk = answers.mealHabits === 'regular' || answers.mealHabits === 'somewhat'
  const screenOk = answers.screenTime === 'low'
  const routineOk =
    answers.routineConsistency === 'structured' || answers.routineConsistency === 'mostly'
  const pornOk = answers.pornographyUse === 'never'
  const alcoholOk = answers.alcoholUse === 'never' || answers.alcoholUse === 'social'
  const studyOk =
    !answers.studySituation ||
    answers.studySituation === 'none' ||
    answers.studyFrequency === 'daily'

  return (
    sleepOk &&
    loadOk &&
    exerciseOk &&
    mealsOk &&
    screenOk &&
    routineOk &&
    pornOk &&
    alcoholOk &&
    studyOk
  )
}

export function recommendChallengeLevel(
  disciplineScore: number,
  answers: RoutineAnswers,
  goals: Goal[]
): ChallengeId {
  if (isExcellentProfile(answers)) return 'implacavel'

  const signals = readHabitSignals(answers, goals)

  const implacavelScore =
    disciplineScore >= 70 &&
    signals.strongRoutine &&
    signals.strongExercise &&
    signals.strongFocus &&
    signals.cleanHabits &&
    !signals.weakEnergy

  if (implacavelScore) return 'implacavel'

  const desafianteScore =
    disciplineScore < 50 ||
    signals.weakRoutine ||
    signals.weakExercise ||
    signals.weakEnergy ||
    signals.weakVices ||
    goals.includes('burnout')

  if (desafianteScore) return 'iniciante'

  return 'intermediario'
}

export function buildRecommendationWhy(
  challengeId: ChallengeId,
  answers: RoutineAnswers,
  goals: Goal[],
  disciplineScore: number
): [string, string] {
  const signals = readHabitSignals(answers, goals)

  if (challengeId === 'iniciante') {
    if (signals.weakVices) {
      return [
        'Há hábitos que ainda puxam sua energia e foco para baixo.',
        'O Desafio Desafiante começa leve — ideal para criar base antes de subir.',
      ]
    }
    if (signals.weakRoutine) {
      return [
        'Sua rotina ainda oscila bastante no dia a dia.',
        'O Desafio Desafiante começa leve — ideal para criar consistência sem sobrecarga.',
      ]
    }
    if (signals.weakExercise) {
      return [
        'Treino e movimento ainda não fazem parte fixa da sua semana.',
        'O Desafio Desafiante ajuda a construir o hábito antes de subir a intensidade.',
      ]
    }
    if (goals.includes('burnout') || signals.weakEnergy) {
      return [
        'Seu perfil pede recuperação antes de exigir demais do corpo.',
        'O Desafio Desafiante respeita seu ritmo e aumenta a chance de completar os 90 dias.',
      ]
    }
    return [
      'Com base nas suas respostas, ainda há espaço para fortalecer hábitos básicos.',
      'O Desafio Desafiante oferece a melhor chance de completar os 90 dias com sucesso.',
    ]
  }

  if (challengeId === 'implacavel') {
    if (isExcellentProfile(answers)) {
      return [
        'Você respondeu no melhor nível em todas as perguntas.',
        'O Desafio Implacável é o próximo passo — máxima exigência nos 90 dias.',
      ]
    }
    if (signals.strongExercise && signals.strongRoutine) {
      return [
        'Você já treina com frequência e mantém rotina organizada.',
        'O Desafio Implacável combina com quem quer o máximo de exigência.',
      ]
    }
    return [
      'Suas respostas mostram disciplina acima da média em hábitos-chave.',
      'O Desafio Implacável é o maior desafio do Reset90 — para quem quer ir além.',
    ]
  }

  if (signals.weakVices) {
    return [
      'Você tem boa base, mas alguns hábitos ainda pedem atenção.',
      'O Desafio Dominante equilibra exigência e consistência para o seu momento.',
    ]
  }

  if (signals.strongRoutine || disciplineScore >= 55) {
    return [
      'Você já tem uma base de hábitos, mas ainda há pontos para ajustar.',
      'O Desafio Dominante equilibra desafio e consistência para o seu momento.',
    ]
  }

  return [
    'Seu perfil está entre o iniciante e o avançado.',
    'O Desafio Dominante será mais compatível com seu momento atual.',
  ]
}

export function buildPriorityActions(
  answers: RoutineAnswers,
  goals: Goal[],
  signals: HabitSignals
): string[] {
  const actions: string[] = []

  if (signals.weakFocus) actions.push('Reduzir tempo de tela com limites diários')
  if (signals.weakSleep) actions.push('Dormir pelo menos 7h por noite')
  if (signals.weakExercise) actions.push('Iniciar treino mínimo 3x por semana')
  if (signals.weakVices && answers.pornographyUse !== 'never') {
    actions.push('Reduzir consumo de pornografia no plano')
  }
  if (signals.weakVices && answers.alcoholUse !== 'never' && answers.alcoholUse !== 'social') {
    actions.push('Limitar álcool na rotina semanal')
  }
  if (
    answers.studySituation &&
    answers.studySituation !== 'none' &&
    answers.studyFrequency !== 'daily'
  ) {
    actions.push('Bloco fixo de estudo todos os dias')
  }
  if (signals.weakRoutine) actions.push('Horários fixos para hábitos-chave')
  if (goals.includes('burnout') && actions.length < 3) {
    actions.push('Pausas e descanso ao fim do dia')
  }

  return actions.slice(0, 3)
}
