import { normalizeProgramDay } from './demoProgress'

export interface HabitScienceCard {
  id: string
  emoji: string
  title: string
  fact: string
  source: string
  accent: 'green' | 'blue' | 'amber' | 'purple'
}

const SCIENCE_CARDS: HabitScienceCard[] = [
  {
    id: 'lally-66',
    emoji: '📊',
    title: '66 dias em média',
    fact: 'Pesquisadores da UCL descobriram que um novo hábito leva em média 66 dias para ficar automático — não 21.',
    source: 'Lally et al., 2009',
    accent: 'green',
  },
  {
    id: 'habit-loop',
    emoji: '🔄',
    title: 'O loop do hábito',
    fact: 'Todo hábito tem 3 partes: deixa (gatilho), rotina e recompensa. Mude a rotina, mantenha a recompensa.',
    source: 'Charles Duhigg',
    accent: 'blue',
  },
  {
    id: 'auto-pilot',
    emoji: '🧠',
    title: 'Metade no piloto automático',
    fact: 'Cerca de 43% do que fazemos todo dia são hábitos — ações repetidas sem pensar muito.',
    source: 'Wood & Neal, 2007',
    accent: 'purple',
  },
  {
    id: 'tiny-habits',
    emoji: '🌱',
    title: 'Comece ridiculamente pequeno',
    fact: 'Hábitos que começam pequenos demais para falhar têm 2× mais chance de virar rotina.',
    source: 'BJ Fogg, Stanford',
    accent: 'green',
  },
  {
    id: 'if-then',
    emoji: '🎯',
    title: 'Plano se-então',
    fact: '"Se for 7h, então visto o tênis" aumenta em até 300% a chance de cumprir o hábito.',
    source: 'Gollwitzer, 1999',
    accent: 'amber',
  },
  {
    id: 'never-miss-twice',
    emoji: '🔗',
    title: 'Nunca falhe 2× seguidas',
    fact: 'Um dia perdido não apaga o progresso. O que quebra a corrente é repetir a falha no dia seguinte.',
    source: 'James Clear',
    accent: 'green',
  },
  {
    id: 'environment',
    emoji: '🏠',
    title: 'Ambiente vence força de vontade',
    fact: 'Deixar o tênis à porta ou a garrafa de água na mesa reduz a fricção e aumenta a consistência.',
    source: 'Thaler & Sunstein',
    accent: 'blue',
  },
  {
    id: 'sleep-habits',
    emoji: '😴',
    title: 'Sono fortalece hábitos',
    fact: 'Dormir mal reduz autocontrole no dia seguinte — e facilita cair em hábitos ruins.',
    source: 'Walker, Why We Sleep',
    accent: 'purple',
  },
  {
    id: 'identity',
    emoji: '🪞',
    title: 'Identidade antes de meta',
    fact: 'Dizer "sou uma pessoa que treina" é mais poderoso que "quero emagrecer 5 kg".',
    source: 'James Clear',
    accent: 'green',
  },
  {
    id: 'fresh-start',
    emoji: '✨',
    title: 'Efeito novo começo',
    fact: 'Segundas-feiras, dias 1 e aniversários aumentam a motivação para iniciar hábitos novos.',
    source: 'Dai et al., 2014',
    accent: 'amber',
  },
  {
    id: 'social',
    emoji: '👥',
    title: 'Conta para alguém',
    fact: 'Compromisso social aumenta adesão — por isso grupos e desafios de 90 dias funcionam.',
    source: 'Harkin et al., 2016',
    accent: 'blue',
  },
  {
    id: 'dopamine',
    emoji: '⚡',
    title: 'Celebre o micro-vitória',
    fact: 'Marcar o hábito como feito libera dopamina — seu cérebro aprende a querer repetir.',
    source: 'Neurociência comportamental',
    accent: 'purple',
  },
  {
    id: 'stacking',
    emoji: '📌',
    title: 'Empilhe hábitos',
    fact: 'Depois de [hábito atual], farei [hábito novo]. Ancorar em algo que já faz é um atalho.',
    source: 'BJ Fogg',
    accent: 'green',
  },
  {
    id: 'stress',
    emoji: '🛡️',
    title: 'Estresse sabota rotina',
    fact: 'Sob pressão, o cérebro volta ao automático — por isso hábitos bons precisam estar bem instalados.',
    source: 'Wood & Neal',
    accent: 'amber',
  },
  {
    id: 'consistency',
    emoji: '📈',
    title: 'Consistência > intensidade',
    fact: 'Treinar 20 min 5× por semana supera 2h uma vez e parar — o cérebro aprende por repetição.',
    source: 'Neuroplasticidade',
    accent: 'blue',
  },
  {
    id: 'implementation-intentions',
    emoji: '🗓️',
    title: 'Quando e onde importa',
    fact: 'Quem define horário e local específico para o hábito tem quase o dobro de adesão vs. só "vou tentar".',
    source: 'Gollwitzer & Sheeran',
    accent: 'amber',
  },
  {
    id: 'willpower-muscle',
    emoji: '💪',
    title: 'Força de vontade cansa',
    fact: 'Autocontrole é recurso limitado: decisões difíceis de manhã esgotam o tanque — por isso rotinas matinam bem.',
    source: 'Baumeister et al.',
    accent: 'purple',
  },
  {
    id: 'cue-visibility',
    emoji: '👀',
    title: 'O que você vê, você faz',
    fact: 'Comida à vista aumenta consumo; livro na mesa aumenta leitura. O ambiente é o lembrete mais forte.',
    source: 'Wansink / Psicologia ambiental',
    accent: 'green',
  },
  {
    id: 'streak-effect',
    emoji: '🔥',
    title: 'Sequências motivam',
    fact: 'Ver dias consecutivos completos aumenta a chance de continuar — o cérebro evita “quebrar a corrente”.',
    source: 'Economia comportamental',
    accent: 'amber',
  },
  {
    id: 'sleep-memory',
    emoji: '🧬',
    title: 'Sono consolida aprendizado',
    fact: 'Durante o sono profundo o cérebro reforça o que praticou no dia — inclusive hábitos motores e rotinas.',
    source: 'Walker / Neurociência do sono',
    accent: 'blue',
  },
  {
    id: 'reward-timing',
    emoji: '🎁',
    title: 'Recompensa imediata',
    fact: 'Hábitos grudam mais quando a recompensa vem logo após a ação — mesmo que seja só marcar “feito”.',
    source: 'Skinner / reforço operante',
    accent: 'purple',
  },
  {
    id: 'two-minute',
    emoji: '⏱️',
    title: 'Regra dos 2 minutos',
    fact: 'Reduza o hábito a algo que caiba em 2 minutos. Começar é o gargalo; a escala vem depois.',
    source: 'James Clear',
    accent: 'green',
  },
  {
    id: 'peer-norms',
    emoji: '🪞',
    title: 'Normas do grupo',
    fact: 'Você tende a copiar o comportamento de quem convive. Escolher o círculo certo acelera (ou trava) hábitos.',
    source: 'Christakis & Fowler',
    accent: 'blue',
  },
  {
    id: 'progress-principle',
    emoji: '📊',
    title: 'Progresso pequeno anima',
    fact: 'Sentir avanço diário — mesmo mínimo — é um dos maiores motores de motivação no trabalho e na vida.',
    source: 'Amabile & Kramer',
    accent: 'amber',
  },
]

const ACCENT_STYLES: Record<
  HabitScienceCard['accent'],
  { border: string; bg: string; text: string }
> = {
  green: {
    border: 'border-accent-green/25',
    bg: 'bg-accent-green/8',
    text: 'text-accent-green',
  },
  blue: {
    border: 'border-sky-500/25',
    bg: 'bg-sky-500/8',
    text: 'text-sky-400',
  },
  amber: {
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/8',
    text: 'text-amber-400',
  },
  purple: {
    border: 'border-purple-500/25',
    bg: 'bg-purple-500/8',
    text: 'text-purple-400',
  },
}

export function getAccentStyle(accent: HabitScienceCard['accent']) {
  return ACCENT_STYLES[accent]
}

/** Cards do dia — rotaciona ao longo dos 90 dias. */
export function getDailyScienceCards(day: number, count = 6): HabitScienceCard[] {
  const normalizedDay = normalizeProgramDay(day)
  const cards: HabitScienceCard[] = []
  const total = SCIENCE_CARDS.length

  for (let i = 0; i < count; i++) {
    const index = (normalizedDay - 1 + i * 3) % total
    cards.push(SCIENCE_CARDS[index])
  }

  return cards
}
