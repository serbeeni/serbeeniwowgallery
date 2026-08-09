# Serbeeni WoW Gallery — Tumblr tema (React + TypeScript)

WoW Classic Tumblr tema v3.2.3, prepisana iz jednog HTML fajla u React + TypeScript.
Funkcionalnost i izgled su nepromenjeni — vidi [MIGRATION_PLAN.md](MIGRATION_PLAN.md) za
detaljno mapiranje starog koda na novi i za spisak namernih odstupanja.

## Kako radi

Tumblr ne dozvoljava build korak, pa je tema podeljena na dva dela:

1. **`theme/theme.html`** — dokument koji se nalepi u Tumblr theme editor. Ne sadrži UI:
   samo skrivene `{block:Posts}` / `{block:Pages}` blokove kao izvor podataka, prazan
   `<div id="root">` i `<script src>` na bundle.
2. **`dist/theme.js` + `dist/theme.css`** — buildovana React aplikacija. Pri startu pročita
   skriveni markup, pretvori ga u `TumblrPost[]` i od tada renderuje kompletan UI.

Paginacija radi kao i ranije: `fetch` sledeće Tumblr stranice → `DOMParser` → pročitaj postove
sa nje. Zato infinite scroll i "Load All" i dalje vuku prave Tumblr stranice.

Bundle koristi `preact/compat` (alias u `vite.config.ts`) — izvorni kod je običan React + TS,
ali runtime je ~15KB umesto ~190KB, što je bitno jer se učitava na svakom page view-u.

## Komentari (notes)

Svaki post ima u donjem desnom uglu ikonicu; klik otvara panel sa komentarima, sa tabovima
**All**, **Replies** i **Comments**.

Na širokim ekranima (≥1200px) otvoreni post se proširi izvan kolone od 900px i panel stane
desno od sadržaja — slika ostaje iste veličine kao pre otvaranja. Ispod te širine panel pada
pod post, preko cele širine.

Tumblr u temi daje notes samo na permalink stranici (`{block:PermalinkPage}{block:PostNotes}`),
pa fioka pri prvom otvaranju fetch-uje `{Permalink}` tog posta i pročita `#tumblr-notes` iz
odgovora — isti pristup koji već koristi paginacija. Rezultat se kešira po post id-u, tako da
se svaki post povlači najviše jednom po učitavanju stranice.

Treći tab, **Comments**, je nešto drugo: Tumblr notes su samo za čitanje jer reply može da
napiše isključivo ulogovan Tumblr korisnik iz Tumblr-ovog interfejsa. Comments tab ugrađuje
[Cusdis](https://cusdis.com) — posetiocu ne treba nalog, upiše ime i komentar.

App ID stoji u `src/config/cusdis.ts`. Moderacija ide preko Cusdis dashboard-a — novi komentari
čekaju odobrenje, pa uključi obaveštenja da ti ne stoje neprimećeni.

Cusdis se renderuje u iframe-u napravljenom preko `srcdoc`, koji po specifikaciji nasleđuje
origin roditelja — zato `src/cusdis/` ume da uđe unutra i da:

- ubaci zlatni stylesheet (`iframeStyle.ts`) preko Cusdis-ovih Tailwind klasa
- ukloni polje za email
- premesti formu ispod postojećih komentara

Strukturne izmene se ponavljaju kroz `MutationObserver`, jer je Cusdis Svelte aplikacija koja
se sama prerenderuje. Widget koristi **jedan iframe za sve niti**, pa je otvorena najviše jedna
fioka — otvaranje druge zatvara prethodnu.

Dva ograničenja koja dolaze od Tumblr-a:

- **Samo prva strana notes-a.** Ostatak stoji iza Tumblr-ovog "Show more notes" endpointa.
  Kad ih ima više, fioka to eksplicitno napiše i ponudi link na permalink.
- **Tekst odgovora se sanitizuje.** Dolazi sa tuđih blogova, pa prolazi kroz allowlist
  (`src/utils/sanitize.ts`): preživljavaju samo bezbedni inline tagovi, svi atributi osim
  `href` se brišu.

## Razvoj

```bash
npm install
npm run dev        # http://localhost:5173 — index.html glumi Tumblr sa par mock postova
npm run typecheck
npm run build      # → dist/theme.js + dist/theme.css
```

`index.html` je isključivo dev harness i ne ulazi u build; sadrži isti `#tumblr-source`
format koji `theme/theme.html` generiše, pa `npm run dev` koristi pravi parser. `dev/notes.html`
glumi permalink stranicu sa notes-ima, da bi fioka sa komentarima radila lokalno.

## Deploy preko Vercel-a (preporučeno)

`vercel.json` je već u repou — build komanda, output folder i keš zaglavlja. Ostaje da se
projekat poveže, što se radi jednom u browseru:

1. Prijava na [vercel.com](https://vercel.com) preko GitHub naloga
2. **Add New → Project** → import `serbeeni/serbeeniwowgallery`
3. Podešavanja ostavi kako ih Vercel pročita iz `vercel.json` (Build `npm run build`,
   Output `dist`); env varijable nisu potrebne
4. Deploy, pa u `theme/theme.html` upiši dobijeni domen:

```
https://<projekat>.vercel.app/theme.css
https://<projekat>.vercel.app/theme.js
```

Od tog trenutka **push na `main` je deploy** — nema tagova ni ponovnog lepljenja teme u
Tumblr. Zauzvrat, pokvaren build ide u produkciju istog trena, pa `npm run build` pre push-a
prestaje da bude opcion.

Keš je namerno postavljen na `must-revalidate`: imena fajlova se ne menjaju, pa bi dugačak
keš značio da izmena visi nevidljiva.

## Deploy preko githack-a (trenutno u upotrebi)

Bundle se servira preko [githack](https://raw.githack.com/) direktno iz ovog repozitorijuma.
`raw.githubusercontent.com` ne dolazi u obzir — šalje `text/plain` uz
`X-Content-Type-Options: nosniff`, pa browser odbija da izvrši skriptu. `rawcdn.githack.com`
je varijanta koja keširа trajno i namenjena je produkciji.

Repo mora da bude **javan** — svaki CDN koji proksira GitHub čita anonimno.

1. `npm run build`
2. Commituj `dist/` i pushuj
3. Napravi git tag i GitHub release, npr. `v3.3.0`
4. U `theme/theme.html` podesi obe URL-e na taj tag i nalepi fajl u
   Tumblr → Edit Theme → Edit HTML

Kasnije promene: build → commit `dist/` → **novi tag** → izmeni verziju u obe URL-e u temi.
Keš je vezan za tag, pa bez bump-a verzije stari bundle ostaje na sajtu.

Za brzo testiranje bez novog taga koristi `raw.githack.com` (ista putanja, kratak keš) umesto
`rawcdn.githack.com`. Za produkciju uvek tag — grana se menja pod nogama.

## Struktura

```
theme/theme.html        # ono što ide u Tumblr
index.html              # dev harness
src/
  tumblr/               # čitanje {block:Posts} markupa i paginacija
  hooks/                # podaci, filteri, meniji, lightbox, muzika, hotkey-evi, quest
  components/           # UI
  config/               # verzija, asset URL-ovi, FILTER_DICTIONARY (90 lokacija)
  styles/               # CSS iz originalne teme, podeljen po celinama
```

## Hotkey-evi

| Taster | Radnja |
|---|---|
| `M` | Menu dropdown |
| `F` | Filter dropdown |
| `L` | Load All |
| `G` | Grid / Column |
| `S` | Newest / Oldest first (tek kad je sve učitano) |
| `Ctrl+M` | Muzika |

## Podešavanje

- **Lokacije i kategorije filtera** — `src/config/filterDictionary.ts`. Filter čita tekst posta
  i uzima sve iza prve crte (`... - Ashenvale`), pa lokacija u opisu posta mora da se poklopi
  sa ključem iz ovog fajla da bi upala u pravu kategoriju.
- **Muzika** — `src/config/assets.ts` (`DARNASSUS_VIDEO_ID`, `WOW_PLAYLIST_ID`).
- **Verzija u donjem desnom uglu** — `src/config/site.ts`.
- **Naslov, opis i stranice u meniju** dolaze iz samog Tumblr-a; ne diraju se u kodu.
