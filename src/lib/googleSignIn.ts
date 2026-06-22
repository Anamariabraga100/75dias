declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
            ux_mode?: 'popup' | 'redirect'
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: { type?: string; theme?: string; size?: string; width?: number }
          ) => void
          cancel: () => void
        }
      }
    }
  }
}

let gsiLoadPromise: Promise<void> | null = null

export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (gsiLoadPromise) return gsiLoadPromise

  gsiLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar Google.')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar Google.'))
    document.head.appendChild(script)
  })

  return gsiLoadPromise
}

/** Abre popup do Google (como Varvos) e devolve o id_token JWT. */
export function openGoogleSignInPopup(clientId: string): Promise<string> {
  return loadGoogleIdentityScript().then(
    () =>
      new Promise((resolve, reject) => {
        let settled = false
        const container = document.createElement('div')
        container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;'
        document.body.appendChild(container)

        const finish = (action: () => void) => {
          if (settled) return
          settled = true
          window.google?.accounts.id.cancel()
          container.remove()
          action()
        }

        window.google!.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (response.credential) {
              finish(() => resolve(response.credential!))
            } else {
              finish(() => reject(new Error('Login Google cancelado.')))
            }
          },
        })

        window.google!.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 320,
        })

        requestAnimationFrame(() => {
          const btn = container.querySelector('div[role="button"]') as HTMLElement | null
          if (!btn) {
            finish(() => reject(new Error('Não foi possível abrir o Google.')))
            return
          }
          btn.click()
        })

        window.setTimeout(() => {
          finish(() => reject(new Error('Login Google demorou demais. Tente novamente.')))
        }, 120_000)
      })
  )
}

export function getGoogleClientId(): string | null {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  return id?.trim() || null
}

export function useGoogleIdentitySignIn(): boolean {
  return Boolean(getGoogleClientId())
}
