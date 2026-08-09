import { CUSDIS_IFRAME_CSS } from './iframeStyle'

const STYLE_ID = 'serbeeni-cusdis-style'

/**
 * Cusdis is a Svelte app that re-renders on its own, so the structural edits below are
 * reapplied whenever its tree changes rather than done once.
 */
function applyStructure(doc: Document) {
  // The email field is optional and unwanted; drop the whole labelled block.
  const email = doc.querySelector('input[name="email"]')
  if (email) {
    const block = email.closest('.px-1') ?? email.parentElement
    block?.remove()
  }

  // Put the composer below whatever comments already exist. Walking up past single-child
  // wrappers finds the composer's own block without depending on Cusdis's class names.
  const textarea = doc.querySelector('textarea')
  if (textarea) {
    let block: HTMLElement = textarea
    while (
      block.parentElement &&
      block.parentElement !== doc.body &&
      block.parentElement.children.length === 1
    ) {
      block = block.parentElement
    }

    const parent = block.parentElement
    if (parent && parent.lastElementChild !== block) parent.appendChild(block)
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
  let observer: MutationObserver | null = null

  const enhance = () => {
    // srcdoc iframes are same-origin, but a thrown SecurityError should not break the page.
    let doc: Document | null = null
    try {
      doc = iframe.contentDocument
    } catch {
      return
    }
    if (!doc) return

    injectStyle(doc)
    applyStructure(doc)

    observer?.disconnect()
    observer = new MutationObserver(() => applyStructure(doc))
    observer.observe(doc.body, { childList: true, subtree: true })
  }

  iframe.addEventListener('load', enhance)
  // The document may already be parsed when a reused iframe is handed back.
  enhance()

  return () => {
    iframe.removeEventListener('load', enhance)
    observer?.disconnect()
  }
}
