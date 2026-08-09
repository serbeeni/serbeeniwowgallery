interface BackToTopProps {
  visible: boolean
}

export function BackToTop({ visible }: BackToTopProps) {
  return (
    <button
      className={`back-to-top${visible ? ' visible' : ''}`}
      id="scrollTopBtn"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to Top"
    >
      ▲
    </button>
  )
}
