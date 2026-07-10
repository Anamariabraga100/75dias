import { normalizeProgramDay } from './demoProgress'

export type TipCategory = 'leitura' | 'alimentacao' | 'treino' | 'mindset'

export interface DailyTip {
  day: number
  category: TipCategory
  title: string
  body: string
  book?: string
}

type TipSeed = Omit<DailyTip, 'day' | 'category'>

const CATEGORY_ORDER: TipCategory[] = ['leitura', 'alimentacao', 'treino', 'mindset']

const LEITURA: TipSeed[] = [
  {
    title: 'Comece pequeno, leia todo dia',
    body: '10 páginas por dia somam um livro inteiro em poucas semanas. O hábito importa mais que o volume.',
    book: 'Hábitos Atômicos — James Clear',
  },
  {
    title: 'Disciplina antes da motivação',
    body: 'Motivação acaba; disciplina fica. Leia mesmo nos dias em que não estiver com vontade.',
    book: 'A Guerra da Arte — Steven Pressfield',
  },
  {
    title: 'Foque no processo',
    body: 'Não espere sentir-se pronto. A leitura diária treina sua mente como o treino treina o corpo.',
    book: 'Mindset — Carol Dweck',
  },
  {
    title: 'Menos redes, mais páginas',
    body: 'Troque 15 min de scroll por 15 min de leitura. Em 90 dias, isso muda sua forma de pensar.',
    book: 'O Ego é Seu Inimigo — Ryan Holiday',
  },
  {
    title: 'Anote uma ideia por dia',
    body: 'Depois de ler, escreva uma frase que ficou. Isso fixa o aprendizado e cria seu arquivo pessoal.',
    book: 'Como Fazer Anotações Inteligentes — Sönke Ahrens',
  },
  {
    title: 'Leia para agir',
    body: 'Cada capítulo deve gerar uma ação concreta na sua rotina. Conhecimento sem prática não transforma.',
    book: 'Os 7 Hábitos das Pessoas Altamente Eficazes — Stephen Covey',
  },
  {
    title: 'Releia o que mudou você',
    body: 'Livros bons merecem segunda passagem. Na releitura, você encontra o que não estava pronto para ver antes.',
    book: 'O Poder do Agora — Eckhart Tolle',
  },
  {
    title: 'Audiolivro conta',
    body: 'Caminhada, transporte ou arrumação da casa: use o tempo morto para absorver ideias de quem já trilhou o caminho.',
    book: 'Essencialismo — Greg McKeown',
  },
  {
    title: 'Escolha um tema por mês',
    body: 'Disciplina, sono, nutrição ou treino — mergulhe em um assunto por vez para consolidar o hábito mental.',
    book: 'A Coragem de Ser Imperfeito — Brené Brown',
  },
  {
    title: 'Leia biografias',
    body: 'Ver como outras pessoas superaram resistência te lembra que o caminho difícil é normal, não exceção.',
    book: 'Shoe Dog — Phil Knight',
  },
  {
    title: 'Pare no meio de um capítulo',
    body: 'Terminar no ponto alto deixa vontade de voltar amanhã — truque clássico para manter consistência.',
    book: 'A Única Coisa — Gary Keller',
  },
  {
    title: 'Leitura noturna sem tela',
    body: 'Livro físico ou e-reader sem notificações ajuda o cérebro a desacelerar e melhora o sono.',
    book: 'Por Que Dormimos — Matthew Walker',
  },
  {
    title: 'Compartilhe o que aprendeu',
    body: 'Explicar uma ideia para alguém (ou para você mesmo em voz alta) fixa o conteúdo na memória.',
    book: 'Aprendendo a Aprender — Barbara Oakley',
  },
  {
    title: 'Leia autores que te desafiam',
    body: 'Desconforto intelectual é sinal de crescimento. Fuja só do que confirma o que você já acredita.',
    book: 'O Obstáculo é o Caminho — Ryan Holiday',
  },
  {
    title: 'Ritual de leitura',
    body: 'Mesmo horário, mesmo lugar, mesma bebida. Rituais reduzem a fricção de começar.',
    book: 'Rotina Milagrosa — Hal Elrod',
  },
  {
    title: 'Um livro por vez',
    body: 'Termine antes de pular para o próximo. Profundidade bate dispersão na construção de caráter.',
    book: 'Deep Work — Cal Newport',
  },
  {
    title: 'Leia sobre sono e recuperação',
    body: 'Disciplina sem descanso quebra. Entender sono é investir na sua performance de amanhã.',
    book: 'Sleep Smarter — Shawn Stevenson',
  },
  {
    title: 'Subtraia, não só some',
    body: 'Livros sobre minimalismo e foco ensinam a cortar o que rouba energia do que realmente importa.',
    book: 'Essencialismo — Greg McKeown',
  },
  {
    title: 'Journaling depois da leitura',
    body: 'Três linhas: o que li, o que senti, o que vou fazer. Simples e poderoso.',
    book: 'O Milagre da Manhã — Hal Elrod',
  },
  {
    title: 'Leia sobre identidade',
    body: 'Você não “tenta” ser disciplinado — você se torna alguém que cumpre o que promete.',
    book: 'Hábitos Atômicos — James Clear',
  },
  {
    title: 'Clássicos de desenvolvimento',
    body: 'Livros antigos ainda vendem porque falam de humanos, não de modinha. Vale revisitá-los.',
    book: 'Como Fazer Amigos e Influenciar Pessoas — Dale Carnegie',
  },
  {
    title: 'Leitura como recompensa',
    body: 'Depois de fechar o dia, a leitura vira prêmio — não punição. Associe prazer ao hábito.',
    book: 'O Poder do Hábito — Charles Duhigg',
  },
  {
    title: 'Biblioteca do futuro você',
    body: 'Cada livro lido neste desafio é um tijolo na pessoa que você estará em 90 dias.',
    book: 'A Sutil Arte de Ligar o F*da-se — Mark Manson',
  },
]

const ALIMENTACAO: TipSeed[] = [
  {
    title: 'Proteína em cada refeição',
    body: 'Ovos, frango, peixe, iogurte ou leguminosas — saciedade maior e recuperação muscular melhor.',
  },
  {
    title: 'Água antes de comer',
    body: 'Um copo de água 15 min antes da refeição ajuda digestão e reduz confusão entre sede e fome.',
  },
  {
    title: 'Prato colorido',
    body: 'Metade vegetais, um quarto proteína, um quarto carboidrato inteligente. Simples e eficaz.',
  },
  {
    title: 'Prepare o ambiente',
    body: 'O que está na bancada, você come. Deixe frutas e snacks saudáveis visíveis; esconda ultraprocessados.',
  },
  {
    title: 'Coma devagar',
    body: '20 minutos por refeição dá tempo do cérebro registrar saciedade. Sem pressa na mesa.',
  },
  {
    title: 'Não pule o café da manhã',
    body: 'Proteína + fibra de manhã estabiliza energia e reduz compulsão no fim do dia.',
  },
  {
    title: 'Planeje o domingo',
    body: 'Cozinhe arroz, legumes e proteína em lote. Decisões de segunda ficam mais fáceis.',
  },
  {
    title: 'Gordura boa não engorda',
    body: 'Abacate, azeite, castanhas e peixes gordos são aliados — o problema é excesso e ultraprocessado.',
  },
  {
    title: 'Fibra é sua amiga',
    body: 'Aveia, feijão, vegetais e frutas inteiras regulam intestino e ajudam no controle de peso.',
  },
  {
    title: 'Evite bebida calórica',
    body: 'Refrigerante e suco industrializado somam calorias sem saciar. Prefira água, chá ou café sem açúcar.',
  },
  {
    title: 'Lanche estratégico',
    body: 'Iogurte grego, banana com pasta de amendoim ou ovo cozido — evita chegar faminto na janta.',
  },
  {
    title: 'Sono e fome andam juntos',
    body: 'Mal dormir aumenta fome e vontade de doce. Cuidar do sono é estratégia nutricional.',
  },
  {
    title: 'Sal na medida',
    body: 'Temperos naturais (alho, limão, ervas) dão sabor sem depender de industrializado salgado.',
  },
  {
    title: 'Carboidrato no treino',
    body: 'Arroz, batata ou pão integral perto do treino dão energia. Ajuste conforme seu objetivo.',
  },
  {
    title: 'Hidratação no treino',
    body: 'Meio litro de água nas 2h antes do exercício. Desidratação corta performance e foco.',
  },
  {
    title: 'Refeição pós-treino',
    body: 'Proteína + carboidrato até 2h depois ajuda recuperação. Não precisa ser perfeito — precisa existir.',
  },
  {
    title: 'Coma comida de verdade',
    body: 'Se a lista de ingredientes é um parágrafo químico, pense duas vezes. Menos rótulo, mais comida.',
  },
  {
    title: 'Fruta inteira > suco',
    body: 'A fibra da fruta modera o açúcar. Suco natural sem polpa dispara glicemia rápido.',
  },
  {
    title: 'Cozinhar é disciplina',
    body: 'Cada refeição feita em casa é controle sobre o que entra no seu corpo. Invista 30 min nisso.',
  },
  {
    title: 'Cheat meal com consciência',
    body: 'Um deslize não apaga 90 dias. O problema é transformar exceção em regra. Volte no próximo prato.',
  },
  {
    title: 'Vegetais congelados contam',
    body: 'Praticidade sem desculpa. Congelado mantém nutrientes e acelera sua vida corrida.',
  },
  {
    title: 'Mastigue mais, coma menos',
    body: 'Saciedade vem do volume e do tempo. Saladas e sopas ajudam sem passar fome.',
  },
  {
    title: 'Alimente o futuro você',
    body: 'Cada refeição é voto no corpo que você quer daqui a 90 dias. Vote com intenção.',
  },
]

const TREINO: TipSeed[] = [
  {
    title: 'Consistência > intensidade',
    body: 'Treinar moderado 4x por semana por 90 dias supera um mês heroico seguido de parada.',
  },
  {
    title: 'Aquecimento de 5 min',
    body: 'Mobilidade e pulso leve preparam articulações e reduzem risco de lesão. Não pule.',
  },
  {
    title: 'Progressão gradual',
    body: 'Some 2,5 kg ou 1 repetição por semana. Micro progresso vira transformação visível.',
  },
  {
    title: 'Descanse entre séries',
    body: '60–90s para hipertrofia; 2–3 min para força. Respeite o tempo — não é preguiça, é método.',
  },
  {
    title: 'Forma antes de carga',
    body: 'Executar mal com peso alto é atalho para lesão. Grave um vídeo e corrija o movimento.',
  },
  {
    title: 'Treino de pernas',
    body: 'Agachamento, avanço e stiff constroem base. Pernas grandes elevam metabolismo e testosterona.',
  },
  {
    title: 'Cardio não é inimigo',
    body: '20–30 min de caminhada inclinada ou bike melhora coração e recuperação entre musculação.',
  },
  {
    title: 'Alongue depois',
    body: '5 min pós-treino em quadríceps, posterior e ombros mantém amplitude e reduz rigidez.',
  },
  {
    title: 'Durma para crescer',
    body: 'Músculo se constrói no descanso. Treinar cansado demais atrapalha mais do que ajuda.',
  },
  {
    title: 'Treino em casa conta',
    body: 'Flexões, agachamento, prancha e elástico — sem academia, com resultado se for consistente.',
  },
  {
    title: 'Registre seus treinos',
    body: 'Anotar séries e pesos elimina adivinhação. O que não é medido não é melhorado.',
  },
  {
    title: 'Varie o estímulo',
    body: 'A cada 4–6 semanas, mude exercícios ou ordem. O corpo se adapta — surpreenda-o.',
  },
  {
    title: 'Core todo dia leve',
    body: 'Prancha 30–60s aquece o centro e protege lombar. Pode ser fora do treino principal.',
  },
  {
    title: 'Não compare',
    body: 'Seu treino é contra o você de ontem. Redes sociais mostram highlight, não rotina.',
  },
  {
    title: 'Hora do treino fixa',
    body: 'Mesmo horário cria hábito automático. Manhã cedo ou logo após o trabalho — escolha e proteja.',
  },
  {
    title: 'Supersérie para tempo curto',
    body: 'Dois exercícios seguidos sem pausa. Mais volume em menos tempo nos dias corridos.',
  },
  {
    title: 'Recuperação ativa',
    body: 'Caminhada leve no dia off melhora circulação sem sobrecarregar. Descanso não é sedentarismo.',
  },
  {
    title: 'Ombros e postura',
    body: 'Remada, face pull e rotação externa equilibram ombros de quem trabalha sentado.',
  },
  {
    title: 'Beba água no treino',
    body: 'Gole a cada 15–20 min em sessões longas. Performance cai com desidratação leve.',
  },
  {
    title: 'Meta semanal realista',
    body: '3–4 sessões bem feitas vencem 7 medianas. Qualidade e recuperação importam.',
  },
  {
    title: 'Escute o corpo',
    body: 'Dor aguda ≠ desconforto muscular. Ajuste ou pare. 90 dias exigem você inteiro, não lesionado.',
  },
  {
    title: 'Celebrar pequenas vitórias',
    body: 'Mais uma repetição, mais 5 min de cardio — progresso invisível vira resultado visível.',
  },
  {
    title: 'Treino é investimento',
    body: 'Cada sessão fortalece não só músculo, mas caráter. Você prova para si que cumpre o combinado.',
  },
]

const MINDSET: TipSeed[] = [
  {
    title: 'Apareça mesmo sem vontade',
    body: 'Motivação é bônus. Nos dias difíceis, a vitória é só começar — o resto costuma vir.',
  },
  {
    title: 'Identidade > meta',
    body: 'Não diga “quero emagrecer”. Diga “sou alguém que treina e come bem”. Identidade sustenta hábitos.',
  },
  {
    title: 'Falhou? Próximo dia.',
    body: 'Um dia ruim não define 90 dias. O que define é quantas vezes você volta ao plano.',
  },
  {
    title: 'Ambiente vence força de vontade',
    body: 'Roupa de treino pronta, comida preparada, celular longe — reduza atrito, não dependa só de ânimo.',
  },
  {
    title: 'Celebre o dia fechado',
    body: 'Reconhecer vitórias pequenas libera dopamina saudável e reforça o ciclo de consistência.',
  },
  {
    title: 'Compare com você',
    body: 'Foto, peso, energia, sono — métricas pessoais. Outros estão em outra corrida.',
  },
  {
    title: 'Disciplina é liberdade',
    body: 'Rotina não prende — liberta de decisões cansativas todo dia. Automatize o essencial.',
  },
  {
    title: 'Visualize o dia 90',
    body: 'Feche os olhos 30s e veja como quer se sentir. Clareza de destino alimenta persistência.',
  },
  {
    title: 'Corte o ruído',
    body: 'Menos opinião aleatória, mais execução. Você já sabe o que precisa fazer hoje.',
  },
  {
    title: 'Gratidão pelo corpo',
    body: 'Ele carrega você todos os dias. Treinar e nutrir é agradecimento, não punição.',
  },
  {
    title: 'Accountability',
    body: 'Conte para alguém de confiança que está no desafio. Compromisso social ajuda nos dias fracos.',
  },
  {
    title: 'Paciência com resultado',
    body: 'Mudança visível leva semanas; mudança real leva meses. Confie no processo que você escolheu.',
  },
  {
    title: 'Reframe do cansaço',
    body: '“Estou cansado” pode virar “vou fazer a versão mínima”. Versão mínima ainda conta.',
  },
  {
    title: 'Elimine o “tudo ou nada”',
    body: 'Treino de 20 min > zero. Refeição ok > delivery por desistência. Perfeição mata consistência.',
  },
  {
    title: 'Manhã define o dia',
    body: 'Acordar no horário, água, movimento leve — vitórias cedo criam momentum para o resto.',
  },
  {
    title: 'Escreva seu porquê',
    body: 'Por que 90 dias? Coloque no espelho ou na capa do celular. Releia quando quiser desistir.',
  },
  {
    title: 'Silêncio e foco',
    body: '10 min sem tela por dia acalmam o sistema nervoso e melhoram decisões alimentares e de treino.',
  },
  {
    title: 'Orgulho silencioso',
    body: 'Não precisa postar tudo. A satisfação de saber que cumpriu já é recompensa.',
  },
  {
    title: 'Respeite sua versão de hoje',
    body: 'Alguns dias você está no topo; outros no modo sobrevivência. Os dois são parte do jogo longo.',
  },
  {
    title: 'Recompensa alinhada',
    body: 'Celebre com algo que não sabotee — filme, banho longo, roupa nova — não com excesso de comida.',
  },
  {
    title: 'Você já começou',
    body: 'A parte mais difícil muitas vezes é começar. Você já passou disso. Continue.',
  },
  {
    title: 'Legado de 90 dias',
    body: 'No fim, não será só corpo — será prova de que você honra compromissos consigo mesmo.',
  },
  {
    title: 'Amanhã agradece hoje',
    body: 'Cada escolha certa de hoje é um presente para quem você será amanhã de manhã.',
  },
]

const TIPS_BY_CATEGORY: Record<TipCategory, TipSeed[]> = {
  leitura: LEITURA,
  alimentacao: ALIMENTACAO,
  treino: TREINO,
  mindset: MINDSET,
}

export const TIP_CATEGORY_LABELS: Record<TipCategory, string> = {
  leitura: 'Leitura',
  alimentacao: 'Alimentação',
  treino: 'Treino',
  mindset: 'Mindset',
}

export function getDailyTip(day: number): DailyTip {
  const normalizedDay = normalizeProgramDay(day)
  const category = CATEGORY_ORDER[(normalizedDay - 1) % CATEGORY_ORDER.length]
  const pool = TIPS_BY_CATEGORY[category]
  const index = Math.floor((normalizedDay - 1) / CATEGORY_ORDER.length) % pool.length

  return {
    day: normalizedDay,
    category,
    ...pool[index],
  }
}
