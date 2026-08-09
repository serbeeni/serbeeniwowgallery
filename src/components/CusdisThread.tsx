import { CUSDIS_APP_ID, CUSDIS_HOST } from '../config/cusdis'
import { useCusdis } from '../hooks/useCusdis'
import type { TumblrPost } from '../types'

interface CusdisThreadProps {
  post: TumblrPost
  /** Only render once the Comments tab is actually showing. */
  active: boolean
}

/**
 * A comment thread anyone can write in, unlike Tumblr notes. Cusdis reads its config off the
 * target's data attributes and replaces it with an iframe.
 */
export function CusdisThread({ post, active }: CusdisThreadProps) {
  const { ref, status } = useCusdis(active)

  if (status === 'unconfigured') {
    return (
      <div className="post-notes-message">
        Comments are not set up yet — add the Cusdis App ID in{' '}
        <code>src/config/cusdis.ts</code>.
      </div>
    )
  }

  return (
    <div className="cusdis-wrapper">
      {status === 'loading' && (
        <div className="post-notes-message">Loading comments...</div>
      )}

      {status === 'error' && (
        <div className="post-notes-message">Could not load comments.</div>
      )}

      <div
        ref={ref}
        id={`cusdis_thread_${post.id}`}
        data-host={CUSDIS_HOST}
        data-app-id={CUSDIS_APP_ID}
        data-page-id={post.id}
        data-page-url={post.permalink ?? ''}
        data-page-title={post.title}
        data-theme="dark"
      />
    </div>
  )
}
