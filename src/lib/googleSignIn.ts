import { useEffect, useState } from 'react'

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
let cachedServerClientId: string | null | undefined

/** Client ID do Varvos — mesmo projeto Google, exibe "Varvos AI" no popup. */
const VARVOS_GOOGLE_CLIENT_SUFFIX = 'hmi7irs5kg8n1u4q6oce79cs1t6mqfjh'

function sanitizeClientId(id: string | undefined | null): string | null {
  const trimmed = id?.trim()
  if (!trimmed) return null
  if (trimmed.includes(VARVOS_GOOGLE_CLIENT_SUFFIX)) {
    console.warn('[Reset90] Client ID aponta para Varvos. Use credenciais do projeto Reset90.')
    return null
  }
  return trimmed
}

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

/** Client ID do build (opcional — local). */
export function getGoogleClientId(): string | null {
  return sanitizeClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)
}

/** Client ID: VITE_ local ou GOOGLE_CLIENT_ID da Vercel via /api/auth/config (como Varvos). */
export async function resolveGoogleClientId(): Promise<string | null> {
  const fromEnv = getGoogleClientId()
  if (fromEnv) return fromEnv

  if (cachedServerClientId !== undefined) return cachedServerClientId

  try {
    const res = await fetch('/api/auth/config')
    if (!res.ok) {
      cachedServerClientId = null
      return null
    }
    const data = (await res.json()) as { clientId?: string }
    cachedServerClientId = sanitizeClientId(data.clientId)
    return cachedServerClientId
  } catch {
    cachedServerClientId = null
    return null
  }
}

/** Abre popup do Google e devolve o id_token JWT. */
export async function openGoogleSignInPopup(clientId?: string): Promise<string> {
  const id = clientId ?? (await resolveGoogleClientId())
  if (!id) throw new Error('Google OAuth não configurado.')

  return loadGoogleIdentityScript().then(
    () =>
      new Promise((resolve, reject) => {
        let settled = false
        const container = document.createElement('div')
        container.style.cssText =
          'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;'
        document.body.appendChild(container)

        const finish = (action: () => void) => {
          if (settled) return
          settled = true
          window.google?.accounts.id.cancel()
          container.remove()
          action()
        }

        window.google!.accounts.id.initialize({
          client_id: id,
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

/** Resolve Client ID (env ou API) — para decidir popup vs redirect. */
export function useGoogleClientId(): { clientId: string | null; ready: boolean } {
  const [clientId, setClientId] = useState<string | null>(() => getGoogleClientId())
  const [ready, setReady] = useState(() => Boolean(getGoogleClientId()))

  useEffect(() => {
    if (getGoogleClientId()) return

    let cancelled = false
    resolveGoogleClientId().then((id) => {
      if (!cancelled) {
        setClientId(id)
        setReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { clientId, ready }
}
