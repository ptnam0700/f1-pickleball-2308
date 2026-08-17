# Pickleball F1 Club Open 2026 — site

Static site (no build step, no backend). Four pages:

- **`index.html`** — event landing: poster, countdown, venue (links to Google Maps),
  CTA tiles into the schedule and rules.
- **`schedule.html`** — live match list per category (Đôi Hỗn Hợp / Đôi Nam Open),
  grouped by round, with a search box to filter by player name or team code.
- **`standings.html`** — live ranking table per category.
- **`rules.html`** — tournament format/rules, transcribed from the club's official
  rules image.

## Live data: Google Sheet, read-only

Match results and standings are **not** stored in this repo — they're fetched at page
load straight from the club's Google Sheet, via its public `gviz` CSV export (no API
key, no Apps Script backend):

- `js/sheet-data.js` — fetches + parses two tabs from the sheet:
  - **`Phân bổ sân`** (gid `2001005`) — the resolved 58-match table (teams, court,
    time, score, status) that `schedule.html` renders.
  - **`Dashboard`** (gid `1628836208`) — the auto-computed ranking tables that
    `standings.html` renders.
- `js/schedule.js` / `js/standings.js` — render those into the page and wire up the
  category tabs / search filter.

**Admin workflow:** the tournament organizer edits scores directly in the Google
Sheet (not through this site). Every visitor sees the update on their next page
load/refresh — no real-time push, no write API, nothing to deploy when scores change.

The sheet ID is hardcoded in `js/sheet-data.js` (`SHEET_ID`). It must stay shared as
**"Anyone with the link → Viewer"** — if that's ever tightened, the live pages will
fail to load data and fall back to an inline error message.

## Run locally

```
python3 -m http.server 8000
```

Open http://localhost:8000.

## Deploy

Plain static files — push to any static host. Currently deployed via GitHub Pages
from this repo's `main` branch (root).

## Notes

- No build step, no npm, no framework — just HTML/CSS/vanilla JS.
- `assets/logos/` — sponsor logos (FPT Software, DCE, F1.YU), cropped from the event
  poster with transparent backgrounds for use in the site footer.
- `assets/poster.png` — the official event poster, used as-is in the hero.
- `docs/references/` — visual reference material (PPA Tour screenshots, the club's
  official rules image) used while designing the schedule/results pages — not used
  at runtime.
- Brand system (colors, type, court-texture motif) documented in `DESIGN.md`; product
  scope/positioning in `PRODUCT.md`.
