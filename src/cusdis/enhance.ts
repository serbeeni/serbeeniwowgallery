import { CUSDIS_IFRAME_CSS } from './iframeStyle'

const STYLE_ID = 'serbeeni-cusdis-style'

export const STACK_CLASS = 'sb-stack'
export const COMPOSER_CLASS = 'sb-composer'

/**
 * Marks the composer so CSS can order it below the comments.
 *
 * This only ever adds classes. An earlier version moved the node with appendChild, which
 * Svelte undid on every keystroke — and re-inserting an element blurs it, so the reply box
 * lost focus as you typed. Class marks are idempotent, survive re-renders, and cannot feed
 * the mutation observer that triggered them.
 */
function applyStructure(doc: Document) {
  const container = doc.getElementById('root')?.firstElementChild
  const textarea = doc.querySelector('textarea')
  if (!container || !textarea) return

  if (!container.classList.contains(STACK_CLASS)) {
    container.classList.add(STACK_CLASS)
  }

  // Walk up to the composer's own block — the child of the container that holds the textarea.
  let block: HTMLElement = textarea
  while (
    block.parentElement &&
    block.parentElement !== container &&
    block.parentElement !== doc.body
  ) {
    block = block.parentElement
  }

  if (
    block.parentElement === container &&
    !block.classList.contains(COMPOSER_CLASS)
  ) {
    block.classList.add(COMPOSER_CLASS)
  }
}

function injectStyle(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return
  const style = doc.createElement('style')
  style.id = STYLE_ID
  style.textContent = CUSDIS_IFRAME_CSS
  doc.head.appendChild(style)
}

/**
 * Restyles and rearranges a Cusdis thread. Safe to call repeatedly — the iframe Cusdis uses
 * is a singleton it reuses for every thread, and each render fires `load` again.
 */
export function enhanceCusdisIframe(iframe: HTMLIFrameElement): () => void {
  let mutations: MutationObserver | null = null
  let resizes: ResizeObserver | null = null

  /**
   * Cusdis sizes the iframe from a height it measures and posts once. Removing the email
   * field and moving the composer changes that height afterwards, leaving the frame too
   * short and scrolling internally — so the height is taken over here instead.
   */
  let lastHeight = 0

  const syncHeight = (doc: Document) => {
    const height = Math.ceil(doc.documentElement.scrollHeight)
    // A one-pixel tolerance stops the resize observer and this setter from chasing each
    // other: writing the height resizes the frame, which fires the observer again.
    if (height > 0 && Math.abs(height - lastHeight) > 1) {
      lastHeight = height
      iframe.style.height = `${height}px`
    }
  }

  const enhance = () => {
    // srcdoc iframes are same-origin, but a thrown SecurityError should not break the page.
    let doc: Document | null = null
    try {
      doc = iframe.contentDocument
    } catch {
      return
    }
    if (!doc?.body) return
    const target = doc

    injectStyle(target)
    applyStructure(target)
    syncHeight(target)

    mutations?.disconnect()
    mutations = new MutationObserver(() => {
      applyStructure(target)
      syncHeight(target)
    })
    mutations.observe(target.body, { childList: true, subtree: true })

    // Catches reflow the mutation observer cannot see — a textarea dragged taller, a font
    // finishing loading, the rail changing width. Observing body rather than the root
    // element keeps it clear of the height we write onto the frame itself.
    resizes?.disconnect()
    resizes = new ResizeObserver(() => syncHeight(target))
    resizes.observe(target.body)
  }

  iframe.addEventListener('load', enhance)
  // The document may already be parsed when a reused iframe is handed back.
  enhance()

  return () => {
    iframe.removeEventListener('load', enhance)
    mutations?.disconnect()
    resizes?.disconnect()
  }
}
