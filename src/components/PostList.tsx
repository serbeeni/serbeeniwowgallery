import type { TumblrPost, ViewMode } from '../types'
import { PostArticle } from './PostArticle'

interface PostListProps {
  posts: TumblrPost[]
  viewMode: ViewMode
  onSelect: (domId: string) => void
  onImageClick: (src: string) => void
  /** Post id whose notes drawer is open, if any. */
  openNotesId: string | null
  onToggleNotes: (postId: string) => void
}

export function PostList({
  posts,
  viewMode,
  onSelect,
  onImageClick,
  openNotesId,
  onToggleNotes,
}: PostListProps) {
  return (
    <main id="contentContainer" className={`${viewMode}-view`}>
      {posts.map((post) => (
        <PostArticle
          key={post.id}
          post={post}
          viewMode={viewMode}
          onSelect={onSelect}
          onImageClick={onImageClick}
          notesOpen={openNotesId === post.id}
          onToggleNotes={() => onToggleNotes(post.id)}
        />
      ))}
    </main>
  )
}
