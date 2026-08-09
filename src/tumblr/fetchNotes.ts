import type { Note, NoteKind } from '../types'
import { sanitizeHtml } from '../utils/sanitize'

export const NOTES_ID = 'tumblr-notes'

export interface NotesResult {
  notes: Note[]
  /** Tumblr renders only the first page of notes; the rest sit behind its own endpoint. */
  hasMore: boolean
}

/**
 * Tumblr has never promised a stable shape for notes markup, so every field is read
 * defensively — a note that only yields a blog name still renders.
 */
function parseNote(li: Element, index: number): Note {
  const classes = li.className.toLowerCase()

  const kind: NoteKind = classes.includes('reply')
    ? 'reply'
    : classes.includes('like')
      ? 'like'
      : classes.includes('reblog')
        ? 'reblog'
        : classes.includes('original_post') || classes.includes('posted')
          ? 'posted'
          : 'other'

  const actionEl = li.querySelector('.action')
  const link =
    li.querySelector<HTMLAnchorElement>('.action a[href]') ??
    li.querySelector<HTMLAnchorElement>('a.tumblelog[href]') ??
    li.querySelector<HTMLAnchorElement>('a[href]')

  const blogName = link?.textContent?.trim() || 'someone'

  // The action reads "<blog> liked this"; the name is shown separately, so drop the prefix.
  const actionText = (actionEl?.textContent ?? '').trim().replace(/\s+/g, ' ')
  const action = actionText.startsWith(blogName)
    ? actionText.slice(blogName.length).trim()
    : actionText

  const replyBody = li.querySelector('.reply_text, blockquote, .reply-text')

  return {
    id: li.id || `note-${index}`,
    kind,
    blogName,
    blogUrl: link?.getAttribute('href') || null,
    avatarUrl:
      li.querySelector('img.avatar, .avatar_frame img, img')?.getAttribute('src') ??
      null,
    action: action || (kind === 'reply' ? 'replied' : ''),
    bodyHtml: replyBody ? sanitizeHtml(replyBody.innerHTML) || null : null,
  }
}

export function parseNotes(root: ParentNode): NotesResult {
  const container = root.querySelector(`#${NOTES_ID}`)
  if (!container) return { notes: [], hasMore: false }

  const items = Array.from(container.querySelectorAll('li.note, .note'))
    // `.note` can match a wrapper as well as its children; keep only leaf entries.
    .filter((el) => !el.querySelector('.note'))

  return {
    notes: items.map(parseNote),
    hasMore: container.querySelector('.more_notes_link, .notes_loading') !== null,
  }
}

/** Notes live on the permalink page only, so the drawer goes and gets it. */
export async function fetchNotes(permalink: string): Promise<NotesResult> {
  const response = await fetch(permalink)
  if (!response.ok) throw new Error(`Notes request failed: ${response.status}`)

  const doc = new DOMParser().parseFromString(await response.text(), 'text/html')
  return parseNotes(doc)
}
