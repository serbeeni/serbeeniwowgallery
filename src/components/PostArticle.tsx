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

      <div className="post-body-render">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Gallery Entry"
            loading="lazy"
            onClick={(e) => {
              e.stopPropagation()
              onImageClick(photoUrl)
            }}
          />
        ) : (
          post.bodyHtml && (
            <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
          )
        )}
      </div>

      {/* Caption and notes toggle share one row; the drawer opens underneath both. */}
      <div className="post-footer">
        {photoUrl && post.captionHtml && (
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
