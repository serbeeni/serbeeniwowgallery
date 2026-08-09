import { useEffect } from 'react'
import { INFINITE_SCROLL_OFFSET } from '../config/site'

/** Reveals the next batch once the reader nears the bottom, like the theme's scroll handler. */
export function useInfiniteScroll(enabled: boolean, onReachEnd: () => void) {
  useEffect(() => {
    if (!enabled) return

    const onScroll = () => {
      const bottom =
        document.documentElement.scrollHeight - INFINITE_SCROLL_OFFSET
      if (window.innerHeight + window.scrollY >= bottom) onReachEnd()
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled, onReachEnd])
}
