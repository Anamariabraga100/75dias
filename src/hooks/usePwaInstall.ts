import { useCallback, useEffect, useState } from 'react'
import {
  type BeforeInstallPromptEvent,
  dismissBanner,
  isBannerDismissed,
  isIosDevice,
  isIosSafari,
  isStandaloneDisplay,
} from '../lib/pwaInstall'

const FORCE_PREVIEW = import.meta.env.DEV

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(FORCE_PREVIEW)
  const [iosGuideOpen, setIosGuideOpen] = useState(false)
  const [devGuideOpen, setDevGuideOpen] = useState(false)
  const ios = isIosDevice()
  const iosSafari = isIosSafari()

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setVisible(false)
      return
    }

    // Localhost: sempre mostra a barra para preview visual
    if (FORCE_PREVIEW) {
      setVisible(true)
      return
    }

    if (isBannerDismissed()) {
      setVisible(false)
      return
    }

    // iOS não dispara beforeinstallprompt — mostra a barra com guia manual
    if (ios) {
      setVisible(true)
      return
    }

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)

    const onInstalled = () => {
      setDeferredPrompt(null)
      setVisible(false)
      setIosGuideOpen(false)
      setDevGuideOpen(false)
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [ios])

  const dismiss = useCallback(() => {
    if (!FORCE_PREVIEW) dismissBanner()
    setVisible(false)
    setIosGuideOpen(false)
    setDevGuideOpen(false)
  }, [])

  const install = useCallback(async () => {
    if (ios) {
      setIosGuideOpen(true)
      return
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (choice.outcome === 'accepted') {
        setVisible(false)
      }
      return
    }

    // Preview no localhost (sem evento nativo de instalação)
    if (FORCE_PREVIEW) {
      setDevGuideOpen(true)
    }
  }, [deferredPrompt, ios])

  return {
    visible,
    ios,
    iosSafari,
    iosGuideOpen,
    devGuideOpen,
    canPrompt: Boolean(deferredPrompt) || ios || FORCE_PREVIEW,
    closeIosGuide: () => setIosGuideOpen(false),
    closeDevGuide: () => setDevGuideOpen(false),
    install,
    dismiss,
  }
}
