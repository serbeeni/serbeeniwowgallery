# Tumblr theme → Static site (Cloudflare Pages)

This repository contains a static website version of your Tumblr theme adapted for Cloudflare Pages.

Files:
- `index.html` — the converted theme. Edit the SITE config inside it to set the title, description, favicon, and RSS link.
- `posts.json` — list of posts rendered by client-side JavaScript. Add posts here or generate this file from your Tumblr export.
  - Each post is an object with:
    - `id` (string)
    - `type` ("text" or "photo")
    - For text posts: `body` (HTML string)
    - For photo posts: `photoUrl` (image URL), `caption` (optional), `alt` (optional)
- Any images and other static files can be placed in an `assets/` folder. Update `index.html` to reference them if you want to host assets in this repo.

Deploy on Cloudflare Pages:
1. Create a GitHub repository (or use this one if you already have it).
2. Commit `index.html`, `posts.json`, and `README.md` to the repo root.
3. In Cloudflare Pages: Create a new project and connect the repository.
   - Build command: (leave blank)
   - Build output directory: `/` (the repository root)
4. Save and deploy. Pages will serve the static site.

Optional improvements:
- Use a Static Site Generator (Eleventy, Hugo, Jekyll) if you'd like a more robust workflow (Markdown posts, templating, permalinks, RSS generation).
- Download externally hosted assets (cursors/backgrounds) into `/assets/` and update references to avoid hotlinking.
- Convert your Tumblr post export into `posts.json` automatically with a small script (I can help with that if you can provide the export).

If you want me to push these files into your repo:
- Make the repository public or add access so I can commit. Tell me whether to:
  - Commit directly to the default branch, or
  - Create a new branch (please provide the branch name), and open a PR.

If you prefer to do it yourself, paste the following commands locally:
```bash
git init
git add index.html posts.json README.md
git commit -m "Convert Tumblr theme to static site for Cloudflare Pages"
git remote add origin <your-github-repo-url>
git push -u origin main