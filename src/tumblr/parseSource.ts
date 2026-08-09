import type { PageLink, PostType, TumblrConfig, TumblrPost } from '../types'
import { extractLocation } from '../utils/location'

export const SOURCE_ID = 'tumblr-source'
export const CONFIG_ID = 'tumblr-config'
export const NEXT_PAGE_ID = 'nextPageLink'

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

  return {
    id,
    type,
    bodyHtml: bodyEl?.innerHTML.trim() || null,
    captionHtml: captionEl?.innerHTML.trim() || null,
    photoUrl,
    thumbnailSrc: photoUrl ?? inlineImg,
    location: extractLocation(el.textContent ?? ''),
    permalink: el.getAttribute('data-permalink') || null,
    noteCount: Number.parseInt(el.getAttribute('data-note-count') ?? '', 10) || 0,
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
