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

## Stream overlay: OBS

`overlay.html` is a broadcast scoreboard for OBS, driven live by `referee.html` —
no server, no account, no relay.

**How the link works.** OBS ships its own Chromium (CEF). A Custom Browser Dock and
a Browser Source run in the *same* CEF profile, so two same-origin pages loaded in
them share `localStorage` and a `BroadcastChannel`. `js/obs-bridge.js` writes both on
every score change; the overlay is a pure renderer of whatever it receives.

**Setup (once):**

1. OBS → **Docks → Custom Browser Docks…** → add
   `https://<your-pages-url>/referee.html`. Dock it beside the OBS controls — this
   is where the scorer taps.
2. OBS → **Sources → + → Browser** → same base URL, `/overlay.html`,
   1920×1080, background transparent. Leave "Shutdown source when not visible"
   **off** so the overlay keeps its state.

Both URLs must share an origin — same scheme, host and port — or the browser will
not let them talk. Mixing `localhost` in one and `127.0.0.1` in the other breaks it.

**Notes:**

- The scorer must be at the OBS machine. Scoring from a phone at courtside would
  need a cloud relay (Supabase Realtime or similar), which this setup deliberately
  avoids.
- **One live match at a time.** Referees on other devices are invisible to OBS —
  their state never leaves their own browser — so any number of them can use
  `referee.html` without touching the stream. But two referee docks inside the same
  OBS window would write over each other and make the overlay flip between matches.
  Streaming several courts at once would need a per-court key (e.g. `?court=1` on
  both URLs, namespacing the storage key in `js/obs-bridge.js`); the current build
  does not have it because the event streams a single show court.
- `?scale=1.4` on the overlay URL resizes the whole card — one knob for 4K or 720p
  canvases.
- The overlay fades out whenever the referee leaves the play screen, and reads the
  last published state from `localStorage` on start, so refreshing the Browser
  Source mid-match restores the live score instead of blanking it.
- It mirrors the referee's left/right swap, so the card reads in the same order as
  the camera.

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
- Anton has no Vietnamese glyphs — it silently drops the diacritics on names like
  "ĐỘI SẤM SÉT". `overlay.html` therefore sets Vietnamese text in Oswald (same
  condensed register, full Vietnamese coverage) and keeps Anton for the digits.
- Brand system (colors, type, court-texture motif) documented in `DESIGN.md`; product
  scope/positioning in `PRODUCT.md`.
