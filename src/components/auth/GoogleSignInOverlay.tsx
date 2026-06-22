import { useEffect, useRef, useState } from 'react'
import { loadGoogleIdentityScript, resolveGoogleClientId } from '../../lib/googleSignIn'

interface GoogleSignInOverlayProps {
  children: React.ReactNode
  disabled?: boolean
  onCredential: (idToken: string) => void
  onError?: (message: string) => void
  className?: string
}

/** Botão customizado com overlay invisível do Google — abre popup igual Varvos. */
export function GoogleSignInOverlay({
  children,
  disabled,
  onCredential,
  onError,
  className = '',
}: GoogleSignInOverlayProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const googleRef = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)
  const onErrorRef = useRef(onError)
  const [ready, setReady] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)

  onCredentialRef.current = onCredential
  onErrorRef.current = onError

  useEffect(() => {
    let cancelled = false
    resolveGoogleClientId().then((id) => {
      if (!cancelled) setClientId(id)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!clientId || !googleRef.current) return

    let cancelled = false

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !googleRef.current || !window.google?.accounts?.id) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (response.credential) {
              onCredentialRef.current(response.credential)
            } else {
              onErrorRef.current?.('Login Google cancelado.')
            }
          },
        })

        const width = hostRef.current?.offsetWidth || 320
        window.google.accounts.id.renderButton(googleRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: Math.max(width, 200),
        })

        setReady(true)
      })
      .catch((e) => {
        onErrorRef.current?.(e instanceof Error ? e.message : 'Falha ao carregar Google.')
      })

    return () => {
      cancelled = true
    }
  }, [clientId])

  if (!clientId) {
    return <>{children}</>
  }

  return (
    <div ref={hostRef} className={`relative ${className}`}>
      {children}
      <div
        ref={googleRef}
        className={`absolute inset-0 z-10 overflow-hidden rounded-[inherit] ${
          disabled || !ready ? 'pointer-events-none opacity-0' : 'opacity-[0.011] cursor-pointer'
        }`}
        aria-hidden={!ready}
      />
    </div>
  )
}
