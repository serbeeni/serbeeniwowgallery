import type { MouseEvent as ReactMouseEvent } from 'react'
import type { TumblrPost, ViewMode } from '../types'
import { PostNotes } from './PostNotes'

interface PostArticleProps {
  post: TumblrPost
  viewMode: ViewMode
  /** Grid view only: jump back to the stream and scroll to this post. */
  onSelect: (domId: string) => void
  onImageClick: (src: string) => void
  notesOpen: boolean
  onToggleNotes: () => void
}

export function PostArticle({
  post,
  viewMode,
  onSelect,
  onImageClick,
  notesOpen,
  onToggleNotes,
}: PostArticleProps) {
  const domId = `post-${post.id}`
  const photoUrl = post.type === 'photo' ? post.photoUrl : null

  /**
   * Delegated so it covers images however they got here — the `<img>` we build for classic
   * photo posts and the markup Tumblr hands us for NPF posts alike.
   */
  const openLightbox = (e: ReactMouseEvent<HTMLDivElement>) => {
    const img = (e.target as HTMLElement).closest('img')
    if (!img) return

    const anchor = img.closest('[data-big-photo]')
    const src =
      anchor?.getAttribute('data-big-photo') ||
      post.highResUrl ||
      img.getAttribute('src')

    if (!src) return
    e.preventDefault()
    e.stopPropagation()
    onImageClick(src)
  }

  return (
    <article
      className="post"
      id={domId}
      data-raw-src={post.photoUrl ?? undefined}
      onClick={() => {
        if (viewMode === 'grid') onSelect(domId)
      }}
    >
      <div className="grid-snap-wrapper">
        {post.thumbnailSrc && (
          <img src={post.thumbnailSrc} loading="lazy" alt="Grid Preview Image" />
        )}
      </div>

      <div className="post-body-render" onClick={openLightbox}>
        {photoUrl ? (
          <img src={photoUrl} alt="Gallery Entry" loading="lazy" />
        ) : (
          post.contentHtml && (
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          )
        )}
      </div>

      {/* Caption and notes toggle share one row; the drawer opens underneath both. */}
      <div className="post-footer">
        {post.captionHtml && (
          <div
            className="caption-fallback"
            dangerouslySetInnerHTML={{ __html: post.captionHtml }}
          />
        )}
        <PostNotes post={post} open={notesOpen} onToggle={onToggleNotes} />
      </div>
    </article>
  )
}
