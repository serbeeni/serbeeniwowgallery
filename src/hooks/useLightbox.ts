import { useCallback, useEffect, useState } from 'react'

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => void
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => void
}

export interface LightboxState {
  src: string | null
  open: (src: string) => void
  close: () => void
  /** Called by the overlay once it is mounted, to request real fullscreen. */
  enterFullscreen: (el: HTMLElement | null) => void
}

/**
 * The theme's `launchPerfectFullscreen` / `triggerSafeClose` pair: an overlay plus a real
 * fullscreen request, closed by clicking it, pressing Escape, or leaving fullscreen.
 */
export function useLightbox(): LightboxState {
  const [src, setSrc] = useState<string | null>(null)

  const open = useCallback((next: string) => setSrc(next), [])

  const close = useCallback(() => {
    const doc = document as FullscreenDocument
    if (doc.fullscreenElement) {
      void doc.exitFullscreen().catch(() => {})
    } else if (doc.webkitFullscreenElement) {
      doc.webkitExitFullscreen?.()
    }
    setSrc(null)
  }, [])

  const enterFullscreen = useCallback((el: HTMLElement | null) => {
    if (!el) return
    const target = el as FullscreenElement
    if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => {})
    } else {
      target.webkitRequestFullscreen?.()
    }
  }, [])

  useEffect(() => {
    if (!src) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopImmediatePropagation()
      close()
    }

    const onFullscreenChange = () => {
      const doc = document as FullscreenDocument
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) setSrc(null)
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [src, close])

  return { src, open, close, enterFullscreen }
}
