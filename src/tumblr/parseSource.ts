import type { PageLink, PostType, TumblrConfig, TumblrPost } from '../types'
import { extractLocation } from '../utils/location'

export const SOURCE_ID = 'tumblr-source'
export const CONFIG_ID = 'tumblr-config'
export const NEXT_PAGE_ID = 'nextPageLink'

function isMediaNode(el: Element): boolean {
  return (
    el.tagName === 'IMG' ||
    el.tagName === 'FIGURE' ||
    el.querySelector('img, figure') !== null
  )
}

/**
 * Splits a post body into its picture and its words.
 *
 * NPF posts arrive as `{block:Text}` shaped like
 *   <div class="npf_row">…<figure><img></figure>…</div><p>un'goro crater</p>
 * so the trailing paragraph is the caption in everything but name. Keeping it separate lets
 * it share a row with the notes toggle instead of sitting above it.
 */
function splitBody(bodyEl: Element): {
  contentHtml: string | null
  captionHtml: string | null
} {
  const content: string[] = []
  const caption: string[] = []

  for (const node of Array.from(bodyEl.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) caption.push(text)
      continue
    }

    if (node.nodeType !== Node.ELEMENT_NODE) continue
    const el = node as Element
    ;(isMediaNode(el) ? content : caption).push(el.outerHTML)
  }

  // A post with no picture is just prose — splitting it would strand the whole body in the
  // caption slot, next to the notes toggle.
  if (content.length === 0) {
    return { contentHtml: bodyEl.innerHTML.trim() || null, captionHtml: null }
  }

  return {
    contentHtml: content.join(''),
    captionHtml: caption.join('') || null,
  }
}

/** Reads one `<article class="tumblr-post">` emitted by `{block:Posts}`. */
function parsePost(el: Element): TumblrPost | null {
  const id = el.getAttribute('data-post-id')
  const rawType = el.getAttribute('data-post-type')
  if (!id || (rawType !== 'text' && rawType !== 'photo')) return null

  const type: PostType = rawType
  const bodyEl = el.querySelector('.tumblr-post-body')
  const captionEl = el.querySelector('.tumblr-post-caption')
  const photoUrl = el.getAttribute('data-photo-url') || null

  // `generateGridThumbnails` used the high-res photo when present and otherwise reached for
  // the first inline image in the body. Same order here, resolved once at parse time.
  const inlineImg = bodyEl?.querySelector('img')?.getAttribute('src') ?? null
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim()

  const split = bodyEl
    ? splitBody(bodyEl)
    : { contentHtml: null, captionHtml: null }

  // NPF wraps the picture in an anchor carrying the full-size URL; the visible <img> is a
  // downscaled copy, so the lightbox would otherwise blow up a 500px thumbnail.
  const bigPhoto =
    bodyEl?.querySelector('[data-big-photo]')?.getAttribute('data-big-photo') ??
    null

  return {
    id,
    type,
    contentHtml: split.contentHtml,
    captionHtml: captionEl?.innerHTML.trim() || split.captionHtml,
    photoUrl,
    highResUrl: photoUrl ?? bigPhoto ?? inlineImg,
    thumbnailSrc: photoUrl ?? inlineImg,
    location: extractLocation(el.textContent ?? ''),
    permalink: el.getAttribute('data-permalink') || null,
    noteCount: Number.parseInt(el.getAttribute('data-note-count') ?? '', 10) || 0,
    title: text.length > 80 ? `${text.slice(0, 77)}...` : text || `Post ${id}`,
  }
}

export function parsePosts(root: ParentNode): TumblrPost[] {
  const source = root.querySelector(`#${SOURCE_ID}`)
  if (!source) return []

  return Array.from(source.querySelectorAll('.tumblr-post'))
    .map(parsePost)
    .filter((post): post is TumblrPost => post !== null)
}

export function parseNextPageUrl(root: ParentNode): string | null {
  const link = root.querySelector<HTMLAnchorElement>(`#${NEXT_PAGE_ID}`)
  return link?.href || null
}

export function parseConfig(root: ParentNode): TumblrConfig {
  const config = root.querySelector(`#${CONFIG_ID}`)

  const pages: PageLink[] = Array.from(
    config?.querySelectorAll<HTMLAnchorElement>('[data-field="pages"] a') ?? [],
  ).map((a) => ({
    label: a.textContent?.trim() ?? '',
    url: a.getAttribute('href') ?? '#',
  }))

  return {
    title:
      config?.querySelector('[data-field="title"]')?.textContent?.trim() ?? '',
    descriptionHtml:
      config?.querySelector('[data-field="description"]')?.innerHTML.trim() ||
      null,
    pages,
  }
}
