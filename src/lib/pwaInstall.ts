const DISMISS_KEY = 'reset90-pwa-banner-dismissed'
const DISMISS_DAYS = 14

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return true
  const media = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return media || iosStandalone
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua)
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOS || iPadOs
}

export function isIosSafari(): boolean {
  if (!isIosDevice()) return false
  const ua = navigator.userAgent
  // Chrome/Firefox/Edge no iOS também usam WebKit, mas não têm "Adicionar à Tela de Início" completo
  const isCriOS = /CriOS/.test(ua)
  const isFxiOS = /FxiOS/.test(ua)
  const isEdgiOS = /EdgiOS/.test(ua)
  return !isCriOS && !isFxiOS && !isEdgiOS
}

export function isBannerDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const until = Number(raw)
    if (!Number.isFinite(until)) return false
    return Date.now() < until
  } catch {
    return false
  }
}

export function dismissBanner(): void {
  try {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(until))
  } catch {
    /* ignore */
  }
}
