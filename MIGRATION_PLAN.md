# Migracija: single-file Tumblr tema → React + TypeScript

Grana: `feature/restruct` (iz `main`). Bez merge-a — ide kroz PR.

## Cilj

Prepisati `theme 3 2 3.txt` (1916 linija HTML/CSS/JS u jednom fajlu) u React + TypeScript,
sa **identičnom funkcionalnošću i identičnim izgledom**, i dalje kao **Tumblr tema**.

`index.html` iz `main` grane je bila okrnjena statička varijanta (CSS obrisan,
FILTER_DICTIONARY skraćen sa 90 na 6 unosa, lightbox/sort/quest sistemi izostavljeni) —
theme fajl je izvor istine. Statička/Cloudflare meta i `posts.json` se brišu.

## Kako React radi na Tumblr-u

Tumblr renderuje postove serverski kroz `{block:Posts}` i ne dozvoljava build korak. Rešenje:

1. **Tema (`theme/theme.html`)** — dokument koji se nalepi u Tumblr theme editor. Sadrži
   `{block:Posts}` markup u **skrivenom** `#tumblr-source` kontejneru (podaci), `#tumblr-config`
   sa `{Title}` / `{Description}` / `{block:Pages}`, `<a id="nextPageLink" href="{NextPage}">`
   za paginaciju, prazan `<div id="root">`, i `<script src>` na bundle.
2. **Bundle** — React app pročita `#tumblr-source` pri startu, pretvori ga u `TumblrPost[]`
   i od tada **on** renderuje kompletan UI u `#root`. Server-rendered markup je samo transport.
3. **Infinite scroll** ostaje nepromenjen po logici: `fetch(nextPageUrl)` → `DOMParser` →
   pročitaj `#tumblr-source` i `#nextPageLink` sa te stranice → dodaj postove. Isti algoritam
   kao original `fetchNextPage()`, samo tipizovan i vezan za React state.

### Isporuka bundle-a

`dist/theme.js` + `dist/theme.css` se pushuju u repo i učitavaju sa jsDelivr-a. `theme.html`
ostaje ~4KB i lepi se u Tumblr **jednom**; sve kasnije promene idu push-om (uz bump verzije u
URL-u da se probije CDN keš). Detalji i alternative su u README-u.

### Preact/compat

Izvorni kod je običan React + TS (`@types/react`, `jsx: react-jsx`). Vite alias-uje
`react`/`react-dom` na `preact/compat` pri build-u, pa bundle padne sa ~190KB na ~15KB —
bitno jer se učitava na svakom page view-u Tumblr bloga. Alias je jedina razlika; ništa u
`src/` ne zna za Preact.

## Struktura

```
├── theme/theme.html          # ono što ide u Tumblr theme editor
├── index.html                # dev harness — isti #tumblr-source format sa par mock postova
├── vite.config.ts            # lib build → dist/theme.js + dist/theme.css, preact alias
└── src/
    ├── main.tsx, App.tsx, types.ts
    ├── config/
    │   ├── site.ts                 # verzija, hotkey pragovi, batch parametri
    │   ├── assets.ts               # quest ikonica, kursori, YouTube ID-jevi
    │   └── filterDictionary.ts     # svih 90 lokacija → Kalimdor / EK / Dungeons
    ├── tumblr/
    │   ├── parseSource.ts          # #tumblr-source DOM → TumblrPost[]
    │   └── fetchNextPage.ts        # paginacija preko DOMParser-a
    ├── utils/location.ts           # port regexa /-\s*(.+)$/
    ├── hooks/                      # usePosts, useInfiniteScroll, useFilters, useMenus,
    │                               # useLightbox, useYouTubePlayer, useQuestIcon,
    │                               # useBackToTop, useKeyboardShortcuts
    ├── components/                 # BlogHeader, ControlsBar, Dropdown, FilterMenu,
    │                               # LoadAllButton, SortButton, ViewToggle, PostList,
    │                               # PostArticle, Lightbox, MusicControl, BackToTop, VersionTag
    └── styles/                     # base, header, controls, dropdown, posts, music, cursors
```

## Mapiranje: staro → novo

| Original (imperativni DOM) | React |
|---|---|
| `container.classList.add('grid-view')` | `viewMode` state → `className` |
| `post.style.display = 'none'` | filtriranje liste pre rendera |
| `generateGridThumbnails()` | `thumbnailSrc` izveden pri parsiranju posta |
| `buildCaptionFilters()` (ručno gradi DOM) | `useMemo` nad postovima → `<FilterMenu>` |
| `fetchNextPage()` | isti algoritam u `tumblr/fetchNextPage.ts`, rezultat ide u state |
| MutationObserver za "Please wait..." | uslovni render `<div>` umesto `<a>` |
| MutationObserver koji otkriva Sort dugme | `{allLoaded && <SortButton/>}` |
| `posts.reverse().forEach(appendChild)` | `sortOldestFirst` state → `.slice().reverse()` |
| `onclick="toggleMenu()"` globali | `onClick` handleri + `useMenus` |
| `interceptTumblrMice` (capture listeneri) | `onClick` na `<img>` → `useLightbox` |
| localStorage quest sistem | `useQuestIcon`, isti ključ `serbeeni_guide_quest_completed` |

## Odluke koje menjaju ponašanje (namerno)

1. **`extractLocation` radi nad `textContent.trim()`.** Original zove
   `post.textContent.match(/-\s*(.+)$/)` nad sirovim tekstom. U Tumblr template-u iza `{Body}`
   stoji `\n` + indentacija, pa `$` (bez `m` flaga) nikad ne poklopi — regex pada na fallback i
   cela sadržina posta postaje "lokacija", zbog čega `FILTER_DICTIONARY` nikad ne uhvati
   kategoriju. Trim pre regexa vraća ponašanje za koje je dictionary i pisan. Fallback na ceo
   tekst kad nema `-` ostaje.
2. **Lightbox se veže na klik na sliku.** Original je presretao Tumblr-ov ugrađeni lightbox
   (`.tmblr-lightbox`). Pošto sada React vlada DOM-om, taj lightbox se više ne pojavljuje;
   klik na sliku direktno otvara isti fullscreen overlay.
3. **Duplirani CSS blokovi se spajaju.** Theme fajl tri puta definiše `.music-control-wrapper`
   i dva puta ceo cursor sistem (kasnija pravila gaze ranija). Zadržane su finalne vrednosti.
4. **Nema `onclick=""` atributa** — Tumblr ih dozvoljava, ali React ih ne koristi; globalne
   funkcije na `window` nestaju.

## Šta ostaje bit-identično

Svi `border-image` ramovi, kursori (`.cur` sa catbox.moe), animirani WebP background,
Cinzel/Inter tipografija, zlatna paleta, `!important` lanci, breakpointi (992px / 768px),
quest bounce animacija, hotkey-evi (M / F / L / G / S / Ctrl+M), v3.2.3 tag.
CSS je **globalni** (ne CSS Modules) jer selektori zavise od ID-jeva i kaskade
(`#contentContainer.grid-view article.post`) — modules bi tražili preimenovanje i rizikovali
vizuelne razlike.

## Koraci

1. Vite + React 19 + TS scaffold, lib build, preact alias
2. Prenos CSS-a u `src/styles/`
3. Tipovi, config (pun FILTER_DICTIONARY), Tumblr adapter
4. Hooks → komponente
5. `theme/theme.html` + dev harness
6. README: kako se tema instalira i kako se bundle ažurira
7. `npm run typecheck` + `npm run build` + provera u browseru
8. Commit + push + PR (bez merge-a)
