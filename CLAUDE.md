# CLAUDE.md — hlasmith.co.uk

Rules of engagement for any Claude session working in this repo, including the
daily scheduled improvement task. These rules are binding. When in doubt, do
less, not more.

## Project

- Personal site / work blog at https://hlasmith.co.uk
- Stack: plain HTML, CSS, JS. No framework, no build step.
- Host: Cloudflare Pages, Git-connected. Production branch is `main`.
  Pushing to `main` deploys to production automatically. Pull requests get a
  Cloudflare preview deployment.
- Pages: index.html (Home), about.html (About), writing.html (Writing),
  work.html (Work), contact.html (Contact), plus individual blog post HTML files.
- Content categories: Delivery, Agile & Tech; University & Life; Sports.

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

## Design tokens (do not break these)

- Accent / amber: `#D4A853`
- Muted text: `#9E9E97`  ← flagged: verify contrast on `#FAFAF7` background vs WCAG AA
- Light background: `#FAFAF7`; dark theme is charcoal-based with a dark/light toggle
- Fonts: DM Serif Display (headings), DM Sans (body)
- Layout width: 1100px, left-aligned navigation
- Footer tagline: "Managing life and writing about it."

## Standing accessibility backlog (good early wins)

1. Verify and fix muted-text contrast (`#9E9E97` on `#FAFAF7`) to pass WCAG AA.
2. Add a skip-to-content link.
3. Add excerpt text to blog cards.

## Voice (only relevant to review-lane content edits)

Personal, honest, self-deprecating, conversational — talking to a mate, not
submitting a report. **No em dashes**; use commas or restructure. Every piece has
a forward-looking element. Do not make it sound like AI or like a corporate memo.

## Git

- Work only on `claude/`-prefixed branches. Never push to `main`.
- Never enable unrestricted branch pushes.
