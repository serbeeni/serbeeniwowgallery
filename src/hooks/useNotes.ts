import { useCallback, useEffect, useState } from 'react'
import { fetchNotes, type NotesResult } from '../tumblr/fetchNotes'

/** Permalinks are immutable for the life of a page view, so results are cached by post id. */
const cache = new Map<string, NotesResult>()
const inFlight = new Map<string, Promise<NotesResult>>()

export type NotesStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface NotesState extends NotesResult {
  status: NotesStatus
  reload: () => void
}

function load(postId: string, permalink: string): Promise<NotesResult> {
  const pending = inFlight.get(postId)
  if (pending) return pending

  const request = fetchNotes(permalink)
    .then((result) => {
      cache.set(postId, result)
      return result
    })
    .finally(() => inFlight.delete(postId))

  inFlight.set(postId, request)
  return request
}

/** Fetches a post's notes the first time its drawer is opened, and not again. */
export function useNotes(
  postId: string,
  permalink: string | null,
  enabled: boolean,
): NotesState {
  const cached = cache.get(postId)
  const [result, setResult] = useState<NotesResult>(
    cached ?? { notes: [], hasMore: false },
  )
  const [status, setStatus] = useState<NotesStatus>(cached ? 'loaded' : 'idle')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled || !permalink) return
    if (status === 'loaded' || status === 'loading') return

    let cancelled = false
    setStatus('loading')

    load(postId, permalink)
      .then((next) => {
        if (cancelled) return
        setResult(next)
        setStatus('loaded')
      })
      .catch((err) => {
        console.error('Failed to load notes:', err)
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
    // `attempt` is what makes reload() re-run this effect.
  }, [enabled, permalink, postId, status, attempt])

  const reload = useCallback(() => {
    cache.delete(postId)
    setStatus('idle')
    setAttempt((n) => n + 1)
  }, [postId])

  return { ...result, status, reload }
}
