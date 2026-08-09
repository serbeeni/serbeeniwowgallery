import type { TumblrPost, ViewMode } from '../types'
import { PostArticle } from './PostArticle'

interface PostListProps {
  posts: TumblrPost[]
  viewMode: ViewMode
  onSelect: (domId: string) => void
  onImageClick: (src: string) => void
}

export function PostList({
  posts,
  viewMode,
  onSelect,
  onImageClick,
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
        />
      ))}
    </main>
  )
}
