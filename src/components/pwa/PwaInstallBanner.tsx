import { Download, Share, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'

export function PwaInstallBanner() {
  const location = useLocation()
  const {
    visible,
    ios,
    iosSafari,
    iosGuideOpen,
    devGuideOpen,
    canPrompt,
    install,
    dismiss,
    closeIosGuide,
    closeDevGuide,
  } = usePwaInstall()

  // Só na área logada do app
  if (!location.pathname.startsWith('/app')) return null
  if (!visible || !canPrompt) return null

  return (
    <>
      <div className="sticky top-0 z-[60] border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-3 py-2.5">
          <img
            src="/pwa-192x192.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">Instale o Reset90</p>
            <p className="truncate text-[11px] text-neutral-400">
              Abra como app, em tela cheia
            </p>
          </div>
          <button
            type="button"
            onClick={() => void install()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-black"
          >
            <Download size={14} strokeWidth={2.5} />
            Baixar
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="shrink-0 rounded-lg p-1.5 text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {ios && iosGuideOpen && (
        <BottomSheet onClose={closeIosGuide}>
          <BottomSheetPanel className="p-5">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Share size={24} className="text-white" />
            </div>
            <h3 className="mb-1 text-center text-lg font-bold text-white">
              Adicionar à tela inicial
            </h3>
            {!iosSafari ? (
              <p className="mb-6 text-center text-sm leading-relaxed text-neutral-400">
                No iPhone, abra este site no <strong className="text-white">Safari</strong> e
                use Compartilhar → Adicionar à Tela de Início.
              </p>
            ) : (
              <>
                <p className="mb-5 text-center text-sm leading-relaxed text-neutral-400">
                  No iPhone, o Safari cuida da instalação. Siga estes passos:
                </p>
                <ol className="mb-6 space-y-3 text-sm text-neutral-200">
                  <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                    <span className="font-black text-teal-400">1</span>
                    <span>
                      Toque em <strong className="text-white">Compartilhar</strong> (ícone de
                      quadrado com seta para cima)
                    </span>
                  </li>
                  <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                    <span className="font-black text-teal-400">2</span>
                    <span>
                      Role e toque em{' '}
                      <strong className="text-white">Adicionar à Tela de Início</strong>
                    </span>
                  </li>
                  <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                    <span className="font-black text-teal-400">3</span>
                    <span>
                      Confirme em <strong className="text-white">Adicionar</strong>
                    </span>
                  </li>
                </ol>
              </>
            )}
            <button
              type="button"
              onClick={closeIosGuide}
              className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black"
            >
              Entendi
            </button>
          </BottomSheetPanel>
        </BottomSheet>
      )}

      {devGuideOpen && (
        <BottomSheet onClose={closeDevGuide}>
          <BottomSheetPanel className="p-5">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Download size={24} className="text-white" />
            </div>
            <h3 className="mb-1 text-center text-lg font-bold text-white">Preview da instalação</h3>
            <p className="mb-6 text-center text-sm leading-relaxed text-neutral-400">
              No localhost o Chrome não abre o instalador real. Em produção (HTTPS), este botão
              dispara o prompt nativo de instalar o app.
            </p>
            <button
              type="button"
              onClick={closeDevGuide}
              className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black"
            >
              Entendi
            </button>
          </BottomSheetPanel>
        </BottomSheet>
      )}
    </>
  )
}
