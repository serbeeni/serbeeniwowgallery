/**
 * Reply text comes from other people's blogs and gets injected as HTML, so it goes through
 * an allowlist first: known-safe inline tags survive, everything else is unwrapped to its
 * text, and every attribute except a link's href is dropped.
 */
const ALLOWED_TAGS = new Set([
  'A',
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'S',
  'BR',
  'P',
  'SPAN',
  'BLOCKQUOTE',
  'CODE',
  'SMALL',
])

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:']

function safeHref(value: string): string | null {
  try {
    const url = new URL(value, window.location.href)
    return SAFE_PROTOCOLS.includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function clean(node: Element) {
  for (const child of Array.from(node.children)) {
    clean(child)

    if (!ALLOWED_TAGS.has(child.tagName)) {
      child.replaceWith(...Array.from(child.childNodes))
      continue
    }

    const href =
      child.tagName === 'A' ? safeHref(child.getAttribute('href') ?? '') : null

    for (const attr of Array.from(child.attributes)) {
      child.removeAttribute(attr.name)
    }

    if (href) {
      child.setAttribute('href', href)
      child.setAttribute('target', '_blank')
      child.setAttribute('rel', 'noopener noreferrer')
    }
  }
}

export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.body.querySelectorAll('script, style, iframe, object, embed').forEach(
    (el) => el.remove(),
  )
  clean(doc.body)
  return doc.body.innerHTML.trim()
}
