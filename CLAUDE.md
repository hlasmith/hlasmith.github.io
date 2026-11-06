# CLAUDE.md — hlasmith.co.uk

Rules of engagement for any Claude session working in this repo. These rules are
binding. When in doubt, do less, not more.

## Project

- Personal site / work blog at https://hlasmith.co.uk
- Stack: plain HTML, CSS, JS. No framework, no build step.
- Host: Cloudflare Pages, Git-connected. Production branch is `main`.
  Pushing to `main` deploys to production automatically. Pull requests get a
  Cloudflare preview deployment.
- Pages: index.html (Home), about.html (About), writing.html (Writing),
  work.html (Work), contact.html (Contact), search.html, privacy.html, plus
  individual blog posts in blog/.
- Content shelves: Delivery, Agile & Tech; University; Life; Sports.
- Search: Pages Functions in functions/api (Workers AI + Vectorize). The indexer
  reads `.post-hero-meta` (category) and `.post-content` (body) in each post, so
  keep those class names.

## Prime directive: small and surgical

- One logical change per branch. Never bundle unrelated edits.
- Make targeted edits to existing files. **Never regenerate a whole HTML file**
  from context — that risks overwriting live content.
- Hard ceiling: avoid diffs larger than roughly 40 changed lines. If a worthwhile
  fix is genuinely bigger than that, open a draft PR and stop (see lanes below).
- Never touch the body content of a published blog post. Metadata around it
  (title tag, meta description, OG tags, structured data) is fine.
- If there is no worthwhile, in-scope improvement to make on a given run, make no
  change at all. A no-op day is a valid and good outcome.

## Two lanes

**Auto-merge lane** — machine-verifiable hygiene. Safe to open as a normal PR:
- Security headers (`_headers` file), meta / canonical / Open Graph tags
- Image alt text, heading order, ARIA correctness, the accessibility backlog below
- Performance (image compression, lazy-loading, `defer`/`async`, preconnect)
- Sitemap.xml, robots.txt, structured data (JSON-LD)
- Broken-link and redirect fixes

**Review lane** — anything subjective. Open as a DRAFT PR prefixed `[REVIEW]`:
- Any change to copy or content a reader actually reads
- Visual, layout, spacing, or design-token changes
- Anything you are not confident a CI check can fully verify

## Caching: bump the asset version

`_headers` caches `/css/*` and `/js/*` for 7 days at Cloudflare and in browsers.
Every page loads them as `css/style.css?v=XXXX` and `js/main.js?v=XXXX`. **Whenever
you change `css/style.css` or `js/main.js`, change the `?v=` value on every page**
(all root pages and every file in `blog/`), or visitors get the old file with the
new HTML.

## RSS feed

`feed.xml` is generated from the posts' JSON-LD. **After adding or editing a post,
run `node tools/build-feed.js`** and commit the updated `feed.xml`. Never edit
`feed.xml` by hand. The post's JSON-LD `author.name` is used as the feed author,
so guest posts are credited correctly.

## Design system

The design system lives in `.claude/skills/hlasmith-design/SKILL.md`. Read it
before any visual or layout change. Its colour tokens, fonts and rules are the
source of truth (Ocean & coral palette, Bodoni Moda / Newsreader / Public Sans,
Liquid Glass nav, mobile-first, WCAG 2.2 AA). Footer tagline stays
"Managing life and writing about it."

## Voice (only relevant to review-lane content edits)

Personal, honest, self-deprecating, conversational — talking to a mate, not
submitting a report. **No em dashes**; use commas or restructure. Every piece has
a forward-looking element. Do not make it sound like AI or like a corporate memo.

## Git

- Work only on `claude/`-prefixed branches. Never push to `main`.
- Never enable unrestricted branch pushes.
