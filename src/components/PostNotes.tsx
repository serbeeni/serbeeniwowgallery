import { useMemo, useState } from 'react'
import { useNotes } from '../hooks/useNotes'
import type { TumblrPost } from '../types'

type Tab = 'all' | 'replies'

interface PostNotesProps {
  post: TumblrPost
}

/**
 * A drawer under the post body holding that post's notes. The toggle sits in the post's
 * bottom-right corner; notes are only fetched once the drawer is first opened.
 */
export function PostNotes({ post }: PostNotesProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('all')
  const { notes, hasMore, status, reload } = useNotes(
    post.id,
    post.permalink,
    open,
  )

  const shown = useMemo(
    () => (tab === 'replies' ? notes.filter((n) => n.kind === 'reply') : notes),
    [notes, tab],
  )

  if (post.noteCount === 0 || !post.permalink) return null

  const label = post.noteCount === 1 ? '1 note' : `${post.noteCount} notes`

  return (
    <div className="post-notes">
      <div className="post-notes-bar">
        <button
          className="notes-toggle-btn"
          onClick={(e) => {
            e.stopPropagation()
            setOpen((value) => !value)
          }}
          aria-expanded={open}
        >
          {open ? '▴' : '▾'} {label}
        </button>
      </div>

      {open && (
        <div className="post-notes-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="post-notes-tabs">
            <button
              className={tab === 'all' ? 'is-active' : undefined}
              onClick={() => setTab('all')}
            >
              All
            </button>
            <button
              className={tab === 'replies' ? 'is-active' : undefined}
              onClick={() => setTab('replies')}
            >
              Replies
            </button>
          </div>

          {status === 'loading' && (
            <div className="post-notes-message">Loading notes...</div>
          )}

          {status === 'error' && (
            <div className="post-notes-message">
              Could not load notes.{' '}
              <button className="notes-link-btn" onClick={reload}>
                Try again
              </button>
            </div>
          )}

          {status === 'loaded' && shown.length === 0 && (
            <div className="post-notes-message">
              {tab === 'replies' ? 'No replies yet.' : 'No notes yet.'}
            </div>
          )}

          {shown.length > 0 && (
            <ul className="post-notes-list">
              {shown.map((note) => (
                <li className={`post-note is-${note.kind}`} key={note.id}>
                  {note.avatarUrl && (
                    <img className="post-note-avatar" src={note.avatarUrl} alt="" />
                  )}
                  <div className="post-note-content">
                    <span className="post-note-head">
                      {note.blogUrl ? (
                        <a
                          href={note.blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {note.blogName}
                        </a>
                      ) : (
                        note.blogName
                      )}{' '}
                      <span className="post-note-action">{note.action}</span>
                    </span>
                    {note.bodyHtml && (
                      <div
                        className="post-note-body"
                        dangerouslySetInnerHTML={{ __html: note.bodyHtml }}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/*
            Tumblr only ships the first page of notes with the permalink; saying so beats
            silently showing a truncated list.
          */}
          {status === 'loaded' && hasMore && (
            <div className="post-notes-message">
              Showing the first {notes.length} of {label}.{' '}
              <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                See all on Tumblr
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
