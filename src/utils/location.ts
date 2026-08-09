/**
 * Port of `post.textContent.match(/-\s*(.+)$/)` from the theme: whatever follows the first
 * dash is the location. Falls back to the whole text when there is no dash, exactly as
 * `buildCaptionFilters` did.
 *
 * The original ran on untrimmed `textContent`. Tumblr's template puts a newline plus
 * indentation after `{Body}`, so `$` (no `m` flag) never matched and every post fell through
 * to the fallback — which is why `FILTER_DICTIONARY` could never categorise anything.
 * Trimming first restores the behaviour the dictionary was written for.
 */
export function extractLocation(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  const match = trimmed.match(/-\s*(.+)$/)
  return match ? match[1].trim() : trimmed
}
