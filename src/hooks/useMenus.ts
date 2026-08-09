import { useCallback, useEffect, useState } from 'react'

export type MenuId = 'main' | 'filter'

export interface MenuState {
  openMenu: MenuId | null
  toggle: (id: MenuId) => void
  closeAll: () => void
}

/**
 * Only one dropdown is ever open, and a click anywhere outside `.menu-container` closes it —
 * same rule as `closeAllMenus()` plus the window listener in the theme.
 */
export function useMenus(): MenuState {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)

  const closeAll = useCallback(() => setOpenMenu(null), [])
  const toggle = useCallback(
    (id: MenuId) => setOpenMenu((current) => (current === id ? null : id)),
    [],
  )

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target?.closest('.menu-container')) closeAll()
    }

    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [closeAll])

  return { openMenu, toggle, closeAll }
}
