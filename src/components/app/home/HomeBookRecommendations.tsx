import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'

const BOOKS = [
  {
    title: 'Como Fazer Amigos e Influenciar Pessoas',
    summary:
      'Clássico de Dale Carnegie sobre empatia, escuta e influência genuína — essencial para relacionamentos e liderança.',
  },
  {
    title: 'Segredos da Mente Milionária',
    summary:
      'T. Harv Eker mostra como suas crenças sobre dinheiro moldam resultados e como reprogramar a mentalidade financeira.',
  },
  {
    title: 'Quem Pensa Enriquece',
    summary:
      'Napoleon Hill mapeia o desejo, a fé e a persistência como base da conquista — princípios atemporais de sucesso.',
  },
  {
    title: 'O Homem Mais Rico da Babilônia',
    summary:
      'Parábolas simples sobre poupar, investir e pagar a si primeiro — educação financeira em formato de história.',
  },
  {
    title: 'Hábitos Atômicos',
    summary:
      'James Clear ensina a melhorar 1% por dia: sistemas, identidade e ambiente que tornam o progresso automático.',
  },
  {
    title: 'A Única Coisa',
    summary:
      'Gary Keller defende foco extremo: descobrir a tarefa que torna tudo o mais fácil ou desnecessário.',
  },
] as const

export function HomeBookRecommendations() {
  const [openTitle, setOpenTitle] = useState<string | null>(null)

  return (
    <section className="home-section">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <BookOpen size={16} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Recomendação de leitura
          </h2>
          <p className="text-[11px] text-neutral-600 mt-0.5">
            Toque em um livro para ver o resumo
          </p>
        </div>
      </div>

      <ul className="rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-[#121212] to-[#0a0a0a] divide-y divide-neutral-800/80 overflow-hidden">
        {BOOKS.map((book) => {
          const open = openTitle === book.title
          return (
            <li key={book.title}>
              <button
                type="button"
                onClick={() => setOpenTitle(open ? null : book.title)}
                aria-expanded={open}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/80 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-bold text-neutral-100 leading-snug flex-1">
                      {book.title}
                    </p>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-neutral-500 mt-0.5 transition-transform duration-300 ${
                        open ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </div>
                  {!open && (
                    <p className="text-[10px] text-neutral-600 mt-1">Toque para ler o resumo</p>
                  )}
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      open ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[12px] text-neutral-500 leading-relaxed">{book.summary}</p>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
