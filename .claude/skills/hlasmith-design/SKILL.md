---
name: hlasmith-design
description: The design system for hlasmith.co.uk. Use for ANY change to how the site looks or behaves (pages, components, colours, type, motion, layout, new posts, story diagrams), and before writing or reviewing HTML/CSS in this repo.
---

# hlasmith.co.uk design system

The site is an editorial, newspaper-inspired blog with an Apple "Liquid Glass" layer
on top. It should feel like a modern broadsheet: confident Bodoni headlines, generous
reading columns, bright Ocean & coral colour, and clear glass navigation. It must never
look like a generic AI-made template.

Approved design canvas (source of truth for visuals):
https://claude.ai/artifact/MkYFz1KjXTMsg1oP4HGzh6
(boards: Homepage v4, Blog post page, Writing page, About v2, Work v2, Contact v2, each
with a 390px mobile board).

## Non-negotiables

1. **Mobile-first.** Base CSS is the phone layout. Desktop is added with
   `@media (min-width: 821px)`. Never write "shrink for mobile" overrides.
2. **WCAG 2.2 AA.** Text contrast 4.5:1 (3:1 for 24px+ or 18.66px+ bold). Every
   interactive target at least 44 x 44px. Real `<a>`, `<button>`, `<input>` + `<label>`.
   Visible focus on everything. Verify with axe + Lighthouse (`.lighthouserc.json`).
3. **Only clickable things look clickable.** Hover lift, underline and pointer are
   reserved for links and buttons. Never put a hover effect on a non-interactive card.
4. **Consistency over decoration.** Items in the same group share one style. No
   random highlighting of some chips or some cards.
5. **No fixed page heights.** Page roots never get `min-height` in px. Pages are as
   tall as their content.

## Colour: Ocean & coral

Define these as CSS custom properties on `:root`, and redefine them for dark mode under
`[data-theme="dark"]`. **Light is the default for everyone** (it ignores the device setting);
dark only applies when the visitor taps the dark-mode toggle, and that choice is remembered.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#EEF3F6` | `#0C1824` | Page background |
| `--ink` | `#0F2233` | `#EAF2F7` | Body text, headings, borders |
| `--muted` | `#3C5063` | `#B3C4D2` | Secondary text |
| `--a1` (ocean) | `#1E5AA8` | `#6FA8F5` | Primary accent, links, primary buttons |
| `--a1-text` | `#FFFFFF` | `#0C1824` | Text on `--a1` |
| `--a2` (coral) | `#FF7F66` | `#FF8F79` | Highlights, quote marks, progress bar |
| `--a2-text-safe` | `#B23A22` | `#FF8F79` | Coral used AS text on light backgrounds (passes AA) |
| `--a3` (seafoam) | `#A8E0D1` | `#A8E0D1` | Soft accent, footer CTA |
| `--on-bright` | `#0F2233` | `#0C1824` | Text on `--a2` / `--a3` |
| `--card` | `#FFFFFF` | `#142333` | Cards |
| `--deep` | `#0F2233` | `#070F17` | Dark panels, footer |
| `--on-deep` | `#EEF3F6` | `#EAF2F7` | Text on `--deep` |
| `--deep-muted` | `#BCCAD6` | `#9FB2C2` | Secondary text on `--deep` |
| `--line` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.16)` | Hairlines |

**Never use coral `#FF7F66` as small text on a light background** (fails contrast). Use
`--a2-text-safe`.

### Shelf (category) colours: fixed everywhere

| Shelf | Colour | Text on it |
|---|---|---|
| Delivery, Agile & Tech | `--deep` (navy) | `--on-deep` |
| University | `--a1` (ocean) | `--a1-text` |
| Life | `--a3` (seafoam) | `--on-bright` |
| Sports | `--a2` (coral) | `--on-bright` |

Use the same mapping for thumbnails, shelf headers, timeline dots and the About page.

### Banned

Amber, cream or parchment backgrounds (the old `#D4A853` / `#FAFAF7` look), purple-blue
gradient washes, glowing dark bento grids, emoji as icons.

## Typography

Three families only (Google Fonts, `display=swap`):

- **Bodoni Moda** 500/700 + italics: headlines, section titles, pull quotes, logo
  (`hlasmith.` in italic 700, the full stop in `--a1`).
- **Newsreader** 400/600 + italic: body copy and excerpts. Articles 20px / 1.7.
- **Public Sans** 400-800: UI, labels, buttons, nav, meta, numbers/stats
  (`font-variant-numeric: lining-nums tabular-nums`, weight 800).

Rules:
- Labels/kickers: Public Sans 13px, 700, `letter-spacing: .1em`, uppercase, in `--a1`.
- Headline sizes use `clamp()`. Long titles step down in size (see Homepage lead logic:
  up to 32 chars `clamp(48px,7vw,96px)`, up to 64 `clamp(40px,5.2vw,72px)`, longer
  `clamp(34px,4.2vw,58px)`), and use `text-wrap: balance`.
- Do not set statistics in Bodoni (its numerals read oddly). Use Public Sans 800.
- Reading column max about 68ch (680px).
- Banned fonts: Fraunces, Instrument Sans/Serif, Inter as a display face, DM Serif
  Display (old site).

## Liquid Glass

Glass is for floating UI (nav islands, search, menus, a single highlighted card over
art), never for whole page sections. It must be clear, not milky.

```css
.glass {
  position: relative; isolation: isolate;
  background: rgba(255,255,255,.16);            /* dark: rgba(0,0,0,.22) */
  backdrop-filter: blur(24px) saturate(1.9) brightness(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(1.9) brightness(1.05);
  border: 1px solid rgba(255,255,255,.55);      /* dark: rgba(255,255,255,.2) */
  box-shadow: inset 1px 1px 0 rgba(255,255,255,.9), inset -1px -1px 0 rgba(255,255,255,.35),
              inset 0 0 20px rgba(255,255,255,.22), 0 12px 32px -14px rgba(0,0,0,.35);
}
.glass::before {  /* specular sheen */
  content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: -1; pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,.5), transparent 40% 62%, rgba(255,255,255,.22));
}
.glass--strong { background: rgba(255,255,255,.32); } /* text over busy art */
@media (prefers-reduced-transparency: reduce) {
  .glass { background: var(--bg); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
```

Text on glass over art must still pass contrast against the blended colour behind it.
Use `.glass--strong` for that, and panels with lots of text (search results, menu
sheet) use about 74% `--bg`.

## Layout and components

- **Container:** `max-width: 1180px; margin: 0 auto; padding: 0 20px`.
- **Radii:** pills 999px, cards 24px, large panels 28-32px, thumbnails 16px.
- **Spacing:** sections 56-80px apart on desktop, 48-72px on mobile.

### Navigation: "Islands"
Sticky `top: 16px`. Three separate glass pieces: logo island, link island (Writing,
Work, About, Contact, current page as an `--ink` filled pill with `aria-current="page"`),
and round 56px buttons for Search and Dark mode.
**Mobile (base):** link island hidden. Logo + Search + Dark + a Menu button that opens a
glass sheet with big Bodoni links (Home, Writing, Work, About, Contact).
**Search:** the button turns the link island into an in-bar search field. Semantic
results (from `/api/search`) drop down in a glass panel. Escape closes it and focus
returns to the search button. Fallback link to `search.html`.

### Buttons
Primary: `--a1` pill, min-height 48px, Public Sans 700. Secondary: transparent, 1px
`--ink` border. On dark panels: `--a3` fill with `--on-bright` text.
Read-time CTA format: **"Read it ~ 6 min"** (tilde with a space either side, no bullet).

### Filter chips
`<div role="group" aria-label="Filter by ...">` of `<button aria-pressed>`. Selected =
`--ink` fill. Show counts. Mobile: one scrolling row (hidden scrollbar). Desktop: wrap.
Announce results with an `aria-live="polite"` status line. Every filter needs a designed
empty state.

### Cards and rows
- Link cards are whole `<a>` elements with hover lift (`translateY(-5px)`).
- Container cards holding several links do NOT lift.
- Expandable rows (Work projects) are `<button aria-expanded aria-controls>`.
- Long lists show 6 items then a "Show all N" button.

### Homepage sections (in order)
Islands nav, lead story (category collage + glass quote/badge, headline right on
desktop, headline FIRST on mobile), "The last few weeks" timeline + "See all writing" CTA,
Delivery Desk feature (Kanban), The Shelves (4 shelf cards), dark footer.
The scrolling "From the archive" banner exists but is OFF (repeats content with only a
few posts).

### Footer: "Back Page, simplified"
`--deep` background. Big Bodoni tagline "Managing life and *writing about it.*" (italic
part in `--a3`), a small card with "I post new stuff regularly. Come say hello." +
Connect on LinkedIn / Get in touch, a row of footer links + three 44px social icon
buttons, then name/role/location, Privacy and Back to top. No decorative shapes.

## Posts

- Header: "All writing" back link, kicker, Bodoni H1, standfirst, author byline
  (initials or photo, name, `<time>`, "~ N min read").
- **Every post gets its own Story Diagram cover** (see below).
- Body: drop cap on the first paragraph, Bodoni H2s, pull quotes between 2px rules with
  a coral quote mark.
- "On this page" contents: sticky glass island beside the article on desktop,
  `<details>` above it on mobile.
- Coral reading progress bar (CSS scroll-driven animation, progressive enhancement).
- End: tags, author card, "Join the conversation" (Comment on LinkedIn), Keep reading.
- **Authors are per-post data** (name, initials/photo, one-line bio, LinkedIn). Guest
  authors are planned. Never hard-code Harrison into templates.

### Story Diagrams
- Each post's cover is a small diagram of that post's actual story (e.g. Scrum to
  Kanban: Before, tickets piled in "Ready for QA", then After, a board with WIP limits).
  Never generic decorative shapes.
- It must look right at **three sizes**: wide desktop cover (about 1140 x 320), stacked
  mobile cover (Before above After, arrow pointing down), and a **purpose-made simple
  thumbnail** (88px square on mobile, 220 x 140 on desktop). Never just crop the big one.
- Built from HTML/CSS or inline SVG using palette tokens, so it follows dark mode.
- `role="img"` with an `aria-label` that describes what the diagram shows.

## Motion

Gentle and purposeful.
- Easing `cubic-bezier(.22,1,.36,1)`. No bounce/elastic easing.
- Allowed: fade/slide-in on load, hover lift on clickable cards, underline growth,
  one-off sway on hero shapes, Kanban cards wobble on hover, menu/search drop-in.
- Not allowed: anything that loops forever on its own. Moving content over 5 seconds
  needs a pause control (WCAG 2.2.2).
- Everything wrapped in `@media (prefers-reduced-motion: reduce)` fallbacks.
- Underlines use `text-decoration` with `text-underline-offset`, never a background
  image (it clips the next line).

## Accessibility checklist (every page)

- Skip link to `<main id="content" tabindex="-1">`, with all page content inside `<main>`.
- `html { scroll-padding-top: 120px }` so the sticky nav never hides focused elements.
- Focus outline `3px solid currentColor; offset 3px`.
- Dialog-like panels (search, menu): Escape closes them and focus returns to the opener.
- Decorative art `aria-hidden="true"`. Meaningful diagrams `role="img"` + label.
- Dark mode toggle is a `<button aria-pressed>`. Dark tokens tested for contrast too.

## Voice (copy)

Personal, honest, self-deprecating, conversational, like talking to a mate. **No em
dashes** (use commas or restructure). Forward-looking. Not corporate, not AI-sounding.
Never edit the body text of a published post without asking.

## Current facts to keep right

- Harrison Smith, Delivery Manager, Wakefield, West Yorkshire.
- Joining **Hippo Digital as a Delivery Manager on 9 November 2026**. Previously CDS
  (nearly 4 years, about £2.5m of projects). Present CDS work in the past tense.
- Level 6 Project Management Degree Apprenticeship, Northumbria University: completed
  2026, results pending. PRINCE2 Practitioner, Certified Scrum Master.
- Favicon is the pixel-art portrait (`favicon-32.png` etc.). Do not replace it.
- Hosting: Cloudflare Pages free plan. Stay at £0.
