import { useEffect, useState } from 'react'
import { BACK_TO_TOP_THRESHOLD } from '../config/site'

export function useBackToTop(): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > BACK_TO_TOP_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return visible
}
