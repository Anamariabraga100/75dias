import { Download, Share, X } from 'lucide-react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { BottomSheet, BottomSheetPanel } from '../ui/BottomSheet'

/** Botão compacto de instalar — só no cabeçalho do /app. */
export function PwaInstallHeaderButton() {
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

  if (!visible || !canPrompt) return null

  return (
    <>
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => void install()}
          className="inline-flex items-center gap-1 rounded-xl border border-neutral-700/80 bg-white px-2.5 py-1.5 text-[11px] font-bold text-black"
          aria-label="Instalar app"
        >
          <Download size={13} strokeWidth={2.5} />
          Baixar
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar instalação"
          className="rounded-lg p-1 text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
        >
          <X size={14} />
        </button>
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
