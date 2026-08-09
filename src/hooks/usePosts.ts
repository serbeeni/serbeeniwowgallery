import { useCallback, useRef, useState } from 'react'
import { fetchPage } from '../tumblr/fetchNextPage'
import {
  parseConfig,
  parseNextPageUrl,
  parsePosts,
} from '../tumblr/parseSource'
import type { TumblrConfig, TumblrPost } from '../types'

const MAX_CONSECUTIVE_FAILURES = 5

/** Read once, synchronously, before React first renders. */
const initialPosts = parsePosts(document)
const initialNextPage = parseNextPageUrl(document)
export const tumblrConfig: TumblrConfig = parseConfig(document)

export interface PostsState {
  posts: TumblrPost[]
  hasMore: boolean
  /** True once everything is in — gates the Sort button and the real Filter menu. */
  allLoaded: boolean
  isBatchLoading: boolean
  isFetching: boolean
  progress: number
  progressActive: boolean
  loadNextPage: () => void
  loadAll: () => void
}

export function usePosts(): PostsState {
  const [posts, setPosts] = useState<TumblrPost[]>(initialPosts)
  const [allLoaded, setAllLoaded] = useState(initialNextPage === null)
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressActive, setProgressActive] = useState(false)

  // The Load All loop needs these synchronously; state would lag a render behind.
  const nextPageRef = useRef<string | null>(initialNextPage)
  const fetchingRef = useRef(false)
  const batchLoadingRef = useRef(false)
  const [hasMore, setHasMore] = useState(initialNextPage !== null)

  /** One page. Resolves to false when the request failed, mirroring the original guard. */
  const loadNextPageOnce = useCallback(async (): Promise<boolean> => {
    const url = nextPageRef.current
    if (!url || fetchingRef.current) return false

    fetchingRef.current = true
    setIsFetching(true)

    try {
      const page = await fetchPage(url)
      // Tumblr can repeat a post across pages when the blog changes mid-scroll.
      setPosts((current) => {
        const seen = new Set(current.map((p) => p.id))
        return [...current, ...page.posts.filter((p) => !seen.has(p.id))]
      })
      nextPageRef.current = page.nextPageUrl
      setHasMore(page.nextPageUrl !== null)
      return true
    } catch (err) {
      console.error('Infinite scroll failed:', err)
      return false
    } finally {
      fetchingRef.current = false
      setIsFetching(false)
    }
  }, [])

  const loadNextPage = useCallback(() => {
    if (batchLoadingRef.current) return
    void loadNextPageOnce()
  }, [loadNextPageOnce])

  const loadAll = useCallback(async () => {
    if (batchLoadingRef.current) return

    const flashComplete = () => {
      setProgressActive(true)
      setProgress(100)
      setTimeout(() => setProgressActive(false), 300)
    }

    if (!nextPageRef.current) {
      setAllLoaded(true)
      flashComplete()
      return
    }

    batchLoadingRef.current = true
    setIsBatchLoading(true)

    // Creep toward 90% — a quarter of the remaining gap per page, as in the theme.
    let current = 15
    setProgressActive(true)
    setProgress(current)

    // The original retried a failing page forever; cap it so a dead network cannot hang here.
    let failures = 0
    while (nextPageRef.current && failures < MAX_CONSECUTIVE_FAILURES) {
      const ok = await loadNextPageOnce()

      if (current < 90) {
        current += (90 - current) * 0.25
        setProgress(current)
      }

      if (ok) {
        failures = 0
      } else {
        failures += 1
        await new Promise((resolve) => setTimeout(resolve, 200))
        if (!nextPageRef.current) break
      }
    }

    batchLoadingRef.current = false
    setIsBatchLoading(false)
    setAllLoaded(true)
    flashComplete()
  }, [loadNextPageOnce])

  return {
    posts,
    hasMore,
    allLoaded,
    isBatchLoading,
    isFetching,
    progress,
    progressActive,
    loadNextPage,
    loadAll: () => void loadAll(),
  }
}
