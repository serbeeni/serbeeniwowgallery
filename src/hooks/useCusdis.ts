import { useEffect, useRef, useState } from 'react'
import { CUSDIS_APP_ID, CUSDIS_SCRIPT } from '../config/cusdis'
import { enhanceCusdisIframe } from '../cusdis/enhance'

declare global {
  interface Window {
    CUSDIS?: {
      renderTo: (target: HTMLElement) => void
      initial: () => void
    }
  }
}

/** Loaded at most once, however many threads open. */
let loader: Promise<void> | null = null

function loadCusdis(): Promise<void> {
  if (loader) return loader

  loader = new Promise<void>((resolve, reject) => {
    if (window.CUSDIS) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = CUSDIS_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Cusdis script failed to load'))
    document.head.appendChild(script)
  }).catch((err) => {
    // Let a later attempt retry rather than caching the failure forever.
    loader = null
    throw err
  })

  return loader
}

export type CusdisStatus = 'unconfigured' | 'loading' | 'ready' | 'error'

/**
 * Mounts a Cusdis thread into the returned element. Cusdis reads its configuration off the
 * target's data attributes, so the caller owns the markup and this only triggers the render.
 */
export function useCusdis(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<CusdisStatus>(
    CUSDIS_APP_ID ? 'loading' : 'unconfigured',
  )

  useEffect(() => {
    if (!enabled || !CUSDIS_APP_ID) return

    let cancelled = false
    let teardown: (() => void) | undefined
    setStatus('loading')

    loadCusdis()
      .then(() => {
        if (cancelled || !ref.current) return
        window.CUSDIS?.renderTo(ref.current)

        const iframe = ref.current.querySelector('iframe')
        if (iframe) teardown = enhanceCusdisIframe(iframe)

        setStatus('ready')
      })
      .catch((err) => {
        console.error('Cusdis failed:', err)
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [enabled])

  return { ref, status }
}
