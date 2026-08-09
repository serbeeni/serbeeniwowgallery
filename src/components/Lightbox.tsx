import { useEffect, useRef } from 'react'

interface LightboxProps {
  src: string
  onClose: () => void
  onMounted: (el: HTMLElement | null) => void
}

/** Full-bleed image overlay, closed by clicking anywhere on it. */
export function Lightbox({ src, onClose, onMounted }: LightboxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onMounted(ref.current)
  }, [onMounted])

  return (
    <div
      id="custom-fullscreen-overlay"
      ref={ref}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }}
    >
      <img src={src} alt="" />
    </div>
  )
}
