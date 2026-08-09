import type { TumblrPost } from '../types'
import { NEXT_PAGE_ID, parsePosts } from './parseSource'

export interface PageResult {
  posts: TumblrPost[]
  nextPageUrl: string | null
}

/**
 * Fetches a Tumblr pagination URL and reads the posts out of it — the same DOMParser trick
 * the original `fetchNextPage()` used, minus the DOM surgery.
 */
export async function fetchPage(url: string): Promise<PageResult> {
  const response = await fetch(url)
  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // A detached document has no base URL, so `.href` would be empty — resolve by hand.
  const nextHref = doc.getElementById(NEXT_PAGE_ID)?.getAttribute('href') ?? null

  return {
    posts: parsePosts(doc),
    nextPageUrl: nextHref ? new URL(nextHref, window.location.href).href : null,
  }
}
