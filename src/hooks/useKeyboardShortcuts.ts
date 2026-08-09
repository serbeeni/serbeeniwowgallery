import { useEffect, useRef } from 'react'

export interface Shortcuts {
  onToggleMenu: () => void
  onToggleFilter: () => void
  onLoadAll: () => void
  onToggleLayout: () => void
  onToggleSort: () => void
  onToggleMusic: () => void
}

function isTypingTarget(): boolean {
  const active = document.activeElement
  if (!active) return false
  return (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) ||
    (active as HTMLElement).isContentEditable
  )
}

/** M / F / L / G / S, plus Ctrl+M (or ⌘M) for music — as in the theme. */
export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const ref = useRef(shortcuts)
  ref.current = shortcuts

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget()) return

      const key = e.key ? e.key.toLowerCase() : ''

      if ((e.ctrlKey || e.metaKey) && key === 'm') {
        e.preventDefault()
        ref.current.onToggleMusic()
        return
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return

      const handler = {
        m: ref.current.onToggleMenu,
        f: ref.current.onToggleFilter,
        l: ref.current.onLoadAll,
        g: ref.current.onToggleLayout,
        s: ref.current.onToggleSort,
      }[key]

      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [])
}
