export type PostType = 'text' | 'photo'

/** One post, read out of the `{block:Posts}` markup Tumblr renders into `#tumblr-source`. */
export interface TumblrPost {
  /** `{PostID}` — unique per post, used for the DOM id and scroll targeting. */
  id: string
  type: PostType
  /** `{Body}` for text posts. */
  bodyHtml: string | null
  /** `{Caption}` for photo posts. */
  captionHtml: string | null
  /** `{PhotoURL-HighRes}` for photo posts. */
  photoUrl: string | null
  /** Image shown in grid view, or null for text posts with no inline image. */
  thumbnailSrc: string | null
  /** Parsed out of the post text — drives the Filter menu. */
  location: string | null
  /** `{Permalink}` — the comment drawer fetches this to read the post's notes. */
  permalink: string | null
  /** `{NoteCount}` as rendered on the index page. */
  noteCount: number
}

export type NoteKind = 'reply' | 'like' | 'reblog' | 'posted' | 'other'

/** One entry from a post's notes list. */
export interface Note {
  id: string
  kind: NoteKind
  blogName: string
  blogUrl: string | null
  avatarUrl: string | null
  /** e.g. "liked this" or "reblogged this from someone". */
  action: string
  /** Sanitised reply text, for `reply` notes. */
  bodyHtml: string | null
}

/** `{Title}`, `{Description}` and `{block:Pages}` handed over by the theme. */
export interface TumblrConfig {
  title: string
  descriptionHtml: string | null
  pages: PageLink[]
}

export interface PageLink {
  label: string
  url: string
}

export type ViewMode = 'stream' | 'grid'
