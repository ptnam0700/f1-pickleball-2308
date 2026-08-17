# Design

<!-- impeccable:design-doc -->

## World

Sports-scoreboard system extending the official event poster (`assets/poster.png`), not an invented identity — brand was pinned by that asset, so no open world roll ran.

## Palette (sampled from poster.png)

- `--sky` `#008BDC` / `--sky-deep` `#0072B8` — primary field color, page background
- `--navy` `#0D3D61` / `--navy-deep` `#082B4B` / `--navy-ink` `#082A44` — panels, header/footer, ink
- `--lime` `#D3FF34` / `--lime-deep` `#B8E01C` — accent: CTAs, scores, rank highlights, focus rings
- White for body copy on dark panels; `--sky-tint` `#E7F5FF` for light info surfaces

Strategy: Committed (sky carries most of the surface at page scale; lime and navy as high-contrast accent/panel colors), matching the poster's own commitment.

## Type

- Display: **Anton** (Google Fonts) — condensed, all-caps, matches the poster's stenciled "BALL" treatment. `line-height: 1.08` (not tighter — Vietnamese diacritics on multi-line headings clip below ~1.0).
- Body/data: **Inter** — workhorse choice, deliberate: this is an Operate (schedule/admin) and Read (rules) surface where legibility and native feel outrank display personality; Anton carries the world's identity, Inter stays out of the way. Tabular numerals on all scores.

## Components

- Match card: team badges (initials), score or pending state, admin inline edit form (score inputs + Lưu)
- Ranking table: rank badge, top-4 rows tinted lime, tie flag badge
- Bracket: SF → Final columns with CSS connector lines, champion callout card, co-3rd-place note (no playoff match)
- Admin: modal login (lime primary button), navy admin-state pill + logout, all edit affordances conditionally rendered on auth state only

## Motion

Scroll-reveal (opacity/translateY, one authored moment on the home hero + split tiles), respects `prefers-reduced-motion`.

## Known constraints

- Google Fonts loaded via CDN `@import` (not self-hosted) — acceptable for this internal tool; revisit if offline/perf becomes a concern.
- Mobile viewport could not be verified via automated browser resize in this environment (tool limitation); responsive rules follow standard mobile-first breakpoints at 860px (nav collapses, split band and match cards stack, countdown grid goes 2×2) and should be spot-checked on a real phone before the event.
