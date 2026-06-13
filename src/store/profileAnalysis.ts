import type {
  ChallengeId,
  Goal,
  ProfileInsights,
  RadarScores,
  RoutineAnswers,
} from './useAppStore'

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
  wakeTime: { before_6: 85, '6_8': 90, '8_10': 70, after_10: 45 },
  sleepHours: { less_6: 35, '6_7': 65, '7_8': 90, more_8: 75 },
  workSituation: { student: 60, employed_office: 55, remote: 65, entrepreneur: 50, shift: 45, not_working: 58 },
  workLoad: { light: 85, moderate: 70, heavy: 45, overwhelming: 25 },
  studySituation: { none: 70, school: 55, college: 50, course: 60, self_taught: 65 },
  studyFrequency: { none: 70, occasional: 45, few_times_week: 65, daily: 80 },
  exerciseFrequency: { never: 25, '1_2_week': 45, '3_4_week': 70, daily: 92 },
  trainingGoal: { none: 50, lose_weight: 55, gain_muscle: 60, endurance: 65, discipline: 70, health: 65 },
  trainingPlace: { none: 40, home: 65, gym: 75, outdoor: 70, mixed: 80 },
  screenTime: { low: 90, moderate: 70, high: 45, very_high: 25 },
  routineConsistency: { chaotic: 30, somewhat: 55, mostly: 75, structured: 92 },
  mealHabits: { skip_meals: 35, irregular: 50, somewhat: 72, regular: 90 },
} as const

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
  const wake = scoreValue(answers.wakeTime, SCORE_MAPS.wakeTime)
  const sleep = scoreValue(answers.sleepHours, SCORE_MAPS.sleepHours)
  const workLoad = scoreValue(answers.workLoad, SCORE_MAPS.workLoad)
  const studyFreq =
    answers.studySituation === 'none'
      ? 70
      : scoreValue(answers.studyFrequency, SCORE_MAPS.studyFrequency)
  const exercise = scoreValue(answers.exerciseFrequency, SCORE_MAPS.exerciseFrequency)
  const trainingGoal = scoreValue(answers.trainingGoal, SCORE_MAPS.trainingGoal)
  const trainingPlace = scoreValue(answers.trainingPlace, SCORE_MAPS.trainingPlace)
  const screen = scoreValue(answers.screenTime, SCORE_MAPS.screenTime)
  const routine = scoreValue(answers.routineConsistency, SCORE_MAPS.routineConsistency)
  const meals = scoreValue(answers.mealHabits, SCORE_MAPS.mealHabits)

  let goalBoost = 0
  if (goals.includes('discipline')) goalBoost += 2
  if (goals.includes('consistency')) goalBoost += 2

  const radarScores: RadarScores = {
    disciplina: Math.round((exercise + routine + trainingGoal + wake) / 4),
    energia: Math.round((sleep + meals + workLoad + exercise) / 4),
    habitos: Math.round((exercise + meals + routine + studyFreq) / 4),
    consistencia: Math.round((routine + exercise + studyFreq) / 3),
    saude: Math.round((exercise + sleep + meals + trainingPlace) / 4),
    foco: Math.round((screen + routine + workLoad) / 3),
  }

  if (goals.includes('burnout')) radarScores.energia = Math.max(20, radarScores.energia - 8)
  if (goals.includes('distractions')) radarScores.foco = Math.max(20, radarScores.foco - 10)
  if (goals.includes('time')) radarScores.foco = Math.max(20, radarScores.foco - 5)

  const disciplineScore = Math.min(
    88,
    Math.round(
      exercise * 0.18 +
        routine * 0.16 +
        sleep * 0.14 +
        screen * 0.12 +
        workLoad * 0.1 +
        studyFreq * 0.08 +
        meals * 0.08 +
        wake * 0.06 +
        trainingGoal * 0.08 +
        goalBoost
    )
  )

  const projectedScore = Math.min(
    95,
    Math.round(disciplineScore + (100 - disciplineScore) * (goals.length >= 3 ? 0.75 : 0.68))
  )

  let recommendedChallenge: ChallengeId = 'intermediario'
  if (disciplineScore >= 68 && exercise >= 65 && trainingPlace >= 65) {
    recommendedChallenge = 'implacavel'
  } else if (disciplineScore < 48 || exercise < 40 || goals.includes('burnout')) {
    recommendedChallenge = 'iniciante'
  }

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
      ? goals.slice(0, 3).map((g) => GOAL_LABELS[g]).join(', ')
      : 'retomar o controle da rotina'

  const workText = answers.workSituation ? WORK_LABELS[answers.workSituation] : 'sua rotina'
  const studyText =
    answers.studySituation && answers.studySituation !== 'none'
      ? STUDY_LABELS[answers.studySituation]
      : null
  const trainingText = answers.trainingGoal
    ? TRAINING_GOAL_LABELS[answers.trainingGoal]
    : null

  const beforeItems = buildBeforeItems(answers, goals)
  const afterItems = buildAfterItems(answers, goals, weakAreas)
  const priorityActions = buildPriorityActions(answers, goals, weakAreas)

  const challengeName =
    recommendedChallenge === 'implacavel'
      ? 'Reset90 Implacável'
      : recommendedChallenge === 'iniciante'
        ? 'Reset90 Iniciante'
        : 'Reset90 Intermediário'

  const insights: ProfileInsights = {
    weakAreas,
    strongAreas,
    scoreSummary: `${displayName}, com ${workText}${studyText ? ` e foco em ${studyText}` : ''}, sua disciplina hoje está em ${disciplineScore}%. Seus objetivos — ${goalText} — pedem um plano que respeite sua realidade.`,
    personalizedQuote: buildQuote(
      displayName,
      answers,
      goals,
      weakAreas,
      trainingText,
      disciplineScore
    ),
    beforeItems,
    afterItems,
    dayMessages: {
      day1: buildDayMessage(1, answers, goals, weakAreas[0]),
      day30: buildDayMessage(30, answers, goals, weakAreas[0]),
      day90: buildDayMessage(90, answers, goals, weakAreas[0]),
    },
    blueprintText: `${displayName}, montamos uma jornada de 90 dias focada em ${weakAreas.join(' e ')}${trainingText && trainingText !== 'sem meta de treino' ? `, com treino voltado para ${trainingText}` : ''}. Recomendamos o ${challengeName} — no ritmo certo para quem vive ${workText}.`,
    priorityActions,
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

function buildBeforeItems(answers: RoutineAnswers, goals: Goal[]): string[] {
  const items: string[] = []

  if (answers.sleepHours === 'less_6' || answers.sleepHours === '6_7') {
    items.push('Sono insuficiente — acordando cansado(a)')
  }
  if (answers.workLoad === 'heavy' || answers.workLoad === 'overwhelming') {
    items.push('Trabalho/estudos consumindo toda a energia')
  }
  if (answers.studySituation !== 'none' && answers.studyFrequency === 'occasional') {
    items.push('Estudo irregular — sempre correndo contra o prazo')
  }
  if (answers.exerciseFrequency === 'never' || answers.exerciseFrequency === '1_2_week') {
    items.push('Treino inconsistente ou inexistente')
  }
  if (answers.screenTime === 'high' || answers.screenTime === 'very_high') {
    items.push('Celular roubando horas do seu dia')
  }
  if (answers.routineConsistency === 'chaotic' || answers.routineConsistency === 'somewhat') {
    items.push('Rotina instável — cada dia parece diferente')
  }
  if (answers.mealHabits === 'skip_meals' || answers.mealHabits === 'irregular') {
    items.push('Alimentação desorganizada afetando energia')
  }
  if (goals.includes('burnout')) {
    items.push('Sensação de esgotamento e falta de pausa')
  }
  if (goals.includes('distractions')) {
    items.push('Dificuldade em manter foco no que importa')
  }

  if (items.length < 3) {
    items.push('Potencial não convertido em hábitos diários')
    items.push('Recomeços frequentes sem sistema de accountability')
  }

  return items.slice(0, 4)
}

function buildAfterItems(answers: RoutineAnswers, goals: Goal[], weakAreas: string[]): string[] {
  const items: string[] = []

  if (weakAreas.includes('foco') || goals.includes('distractions')) {
    items.push('Rotina com blocos de foco protegidos')
  }
  if (weakAreas.includes('energia') || goals.includes('burnout')) {
    items.push('Energia estável com sono e pausas estruturadas')
  }
  if (weakAreas.includes('disciplina') || goals.includes('discipline')) {
    items.push('Disciplina diária sem depender de motivação')
  }
  if (
    answers.exerciseFrequency === 'never' ||
    answers.trainingGoal === 'lose_weight' ||
    answers.trainingGoal === 'gain_muscle'
  ) {
    items.push('Treino integrado à sua semana real')
  }
  if (answers.studySituation !== 'none') {
    items.push('Estudo com horários fixos e progresso visível')
  }
  if (goals.includes('consistency') || goals.includes('routine')) {
    items.push('Consistência por 90 dias — hábitos que ficam')
  }
  if (goals.includes('time')) {
    items.push('Tempo recuperado para o que realmente importa')
  }

  if (items.length < 3) {
    items.push('Plano personalizado baseado na sua avaliação')
    items.push('Mente calma, foco e autoconfiança')
  }

  return items.slice(0, 4)
}

function buildPriorityActions(
  answers: RoutineAnswers,
  goals: Goal[],
  weakAreas: string[]
): string[] {
  const actions: string[] = []

  if (weakAreas.includes('foco') || answers.screenTime === 'very_high') {
    actions.push('Reduzir tempo de tela com limites diários')
  }
  if (weakAreas.includes('energia') || answers.sleepHours === 'less_6') {
    actions.push('Priorizar 7h+ de sono por noite')
  }
  if (weakAreas.includes('disciplina') || answers.exerciseFrequency === 'never') {
    actions.push('Iniciar treino mínimo 3x por semana')
  }
  if (answers.studySituation !== 'none' && answers.studyFrequency !== 'daily') {
    actions.push('Bloco fixo de estudo todos os dias')
  }
  if (answers.workLoad === 'overwhelming') {
    actions.push('Micro-pausas entre blocos de trabalho')
  }
  if (goals.includes('burnout')) {
    actions.push('Ritual de descompressão ao fim do dia')
  }

  return actions.slice(0, 3)
}

function buildQuote(
  name: string,
  answers: RoutineAnswers,
  goals: Goal[],
  weakAreas: string[],
  trainingText: string | null,
  disciplineScore: number
): string {
  const parts: string[] = []

  if (answers.workLoad === 'overwhelming' || answers.workLoad === 'heavy') {
    parts.push('sua carga de trabalho está drenando energia')
  }
  if (answers.screenTime === 'very_high' || answers.screenTime === 'high') {
    parts.push('o celular está competindo com seus objetivos')
  }
  if (answers.exerciseFrequency === 'never') {
    parts.push('falta de movimento está impactando disposição')
  }
  if (answers.studySituation !== 'none' && answers.studyFrequency === 'occasional') {
    parts.push('estudo sem rotina gera ansiedade e atraso')
  }
  if (goals.includes('burnout')) {
    parts.push('você precisa recuperar antes de exigir mais de si')
  }

  const diagnosis =
    parts.length > 0
      ? parts.slice(0, 2).join(' e ')
      : `${weakAreas[0] ?? 'consistência'} é onde você mais pode evoluir`

  const trainingPart =
    trainingText && trainingText !== 'sem meta de treino'
      ? ` Seu foco em ${trainingText} entra no plano desde o dia 1.`
      : ''

  return `${name}, identificamos que ${diagnosis}. Com 90 dias de estrutura no Reset90, dá para sair de ${disciplineScore}% e chegar perto do seu potencial.${trainingPart}`
}

function buildDayMessage(
  day: number,
  answers: RoutineAnswers,
  goals: Goal[],
  mainWeak: string | undefined
): string {
  const weak = mainWeak ?? 'consistência'

  if (day === 1) {
    if (answers.routineConsistency === 'chaotic') {
      return `Dia 1: sua rotina ainda é imprevisível — ${weak} será o primeiro alvo. Sem sistema, a maioria desiste antes do dia 7.`
    }
    return `Dia 1: começamos fortalecendo ${weak}. Pequenas vitórias diárias valem mais que picos de motivação.`
  }

  if (day === 30) {
    if (goals.includes('consistency')) {
      return 'Dia 30: é aqui que a maioria desiste — mas quem mantém o sistema passa dessa barreira.'
    }
    return `Dia 30: ${weak} já mostra evolução. Agora é consolidar, não acelerar.`
  }

  return `Dia 90: rotina estruturada, ${weak} transformada. Reset completo — hora de manter o que funcionou.`
}
