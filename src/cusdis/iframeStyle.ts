/**
 * Stylesheet injected into the Cusdis iframe.
 *
 * Cusdis renders through an iframe built with `srcdoc`, which inherits the embedding page's
 * origin — so its document is reachable and can be restyled. Its own sheet is Tailwind
 * utilities, hence the `!important` throughout: we are overriding utility classes, not
 * cooperating with them.
 *
 * The font has to be imported here as well; the iframe document does not inherit the parent's.
 */
export const CUSDIS_IFRAME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;700&display=swap');

:root {
  color-scheme: dark !important;
}

html, body {
  background: transparent !important;
  color: #ffffff !important;
  font-family: 'Arial Narrow', Arial, sans-serif !important;
  margin: 0 !important;
  padding: 0 !important;
  height: auto !important;
}

/*
 * The iframe's height is driven from the parent (see enhance.ts), so the frame is always
 * tall enough for its content and must never grow a scrollbar of its own — the rail scrolls.
 */
html {
  overflow: hidden !important;
}

body {
  overflow: visible !important;
}

/* Nothing inside may scroll on its own — the iframe grows to fit instead. */
#root, #root * {
  max-height: none !important;
  overflow: visible !important;
}

/* Labels and headings pick up the gold Cinzel treatment. */
label {
  color: #ffcc00 !important;
  font-family: 'Cinzel', serif !important;
  font-size: 11px !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  text-shadow: 1px 1px 0 #000 !important;
  margin-bottom: 6px !important;
}

input, textarea {
  background: rgba(14, 15, 18, 0.75) !important;
  border: 1px solid rgba(255, 204, 0, 0.4) !important;
  border-radius: 3px !important;
  color: #ffffff !important;
  font-family: 'Arial Narrow', Arial, sans-serif !important;
  font-size: 0.95rem !important;
  padding: 8px 10px !important;
  outline: none !important;
  box-shadow: none !important;
}

input:focus, textarea:focus {
  border-color: #ffcc00 !important;
  box-shadow: 0 0 8px rgba(255, 204, 0, 0.25) !important;
}

textarea {
  min-height: 90px !important;
  resize: vertical !important;
}

::placeholder {
  color: rgba(216, 195, 157, 0.5) !important;
}

/* The email field is removed outright; this keeps the row from leaving a gap. */
.grid.grid-cols-2 {
  grid-template-columns: 1fr !important;
}

input[name="email"],
label[for="email"] {
  display: none !important;
}

button {
  background: rgba(14, 15, 18, 0.8) !important;
  border: 1px solid rgba(255, 204, 0, 0.5) !important;
  border-radius: 3px !important;
  color: #ffcc00 !important;
  font-family: 'Cinzel', serif !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  text-shadow: 1px 1px 0 #000 !important;
  padding: 8px 16px !important;
  cursor: pointer !important;
  transition: border-color 0.15s ease, filter 0.15s ease !important;
}

button:hover {
  border-color: #ffcc00 !important;
  color: #ffffff !important;
  filter: brightness(1.2) drop-shadow(0 0 5px rgba(255, 204, 0, 0.4)) !important;
}

/* Posted comments: gold rail on the left, matching the reply notes in the drawer. */
.border-l-2 {
  border-left: 2px solid rgba(255, 204, 0, 0.5) !important;
  background: rgba(255, 204, 0, 0.05) !important;
  padding-left: 10px !important;
}

.font-bold, .font-medium {
  color: #ffcc00 !important;
  font-family: 'Cinzel', serif !important;
  font-size: 11px !important;
  letter-spacing: 0.05em !important;
}

.text-gray-500, .text-xs {
  color: #9aa0a6 !important;
}

.text-gray-900 {
  color: #ffffff !important;
}

a {
  color: #ffcc00 !important;
  text-decoration: none !important;
}

a:hover {
  color: #ffffff !important;
  text-shadow: 0 0 8px rgba(255, 209, 0, 0.8) !important;
}

/* "MOD" badge */
.bg-blue-500 {
  background: rgba(255, 204, 0, 0.85) !important;
  color: #0e0f12 !important;
  font-family: 'Cinzel', serif !important;
}

.bg-gray-100, .bg-gray-200 {
  background: transparent !important;
}

.border-gray-200 {
  border-color: rgba(255, 204, 0, 0.25) !important;
}
`
