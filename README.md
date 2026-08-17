# Pickleball F1 Club Open 2026 — site

Static site (no build step). Right now it runs fully on `data/schedule.json` and
`data/players.json` (the real roster, hardcoded) — open `index.html` locally or deploy
the folder to any static host and it just works, with admin edits kept in your browser's
`localStorage` until a Google Sheet backend is wired up.

## Run locally

```
python3 -m http.server 8000
```

Open http://localhost:8000. Admin password (demo): see `data/admin-config.json`.

## Go live with real data (Google Sheet)

1. Create a Google Sheet with two tabs:
   - **Teams**: columns `TeamID | TeamName | Category | ManualRank` (`Category` is
     `NamOpen` or `HonHop`; leave `ManualRank` blank unless breaking a tie manually).
   - **Matches**: columns `MatchID | Category | Round | Slot | Team1ID | Team2ID | Score1 | Score2 | Status`
     (`Round` is `RR` / `SF` / `F`; `Status` is `scheduled` / `completed`). No 3rd-place
     match — the two semifinal losers are co-3rd place, shown automatically once both
     semifinals are done.
   - `data/schedule.json` already has the real draw (team codes + exact round-robin
     pairings from the club's bốc thăm) with placeholder team names — swap in real team
     names later, and empty SF/F rows the admin UI fills in once ranking/semis resolve.
   - **Players**: columns `PairID | Account1 | Account2 | Category | PhotoURL`
     (`Category` is `NamOpen` or `HonHop`, same as Teams/Matches; leave `PhotoURL` blank —
     the admin roster page fills it in, or paste a path/URL directly). Use
     `data/players.json` as a template; it already has the real pairs transcribed from
     `đôi nam.png` / `đôi hỗn hợp.png`.
2. Extensions → Apps Script, paste in `apps-script/Code.gs`.
3. Project Settings → Script Properties → add `ADMIN_SECRET` = the same password you
   put in `data/admin-config.json`.
4. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**. Copy the
   `/exec` URL.
5. In `js/api.js`, set `APPS_SCRIPT_URL` to that URL.
6. Change `data/admin-config.json`'s password to the real one before the event.

Score updates then persist to the Sheet and every visitor sees them on next load —
no server to run or maintain.

## Notes

- Admin auth is a single fixed password checked client-side against
  `data/admin-config.json` (and re-sent as the `secret` on writes) — a deliberate
  simplicity tradeoff for an internal club event, not a hardened auth scheme.
- No real-time push; scores update on page load/refresh.
- Player photos: the roster page's file picker converts the chosen image straight to a
  base64 data URL and stores that string in the `PhotoURL` cell. Fine for small headshots
  and a roster this size; if photos get large or numerous, switch to hosting them
  somewhere (Drive, Photos, etc.) and paste the resulting URL into `PhotoURL` instead.
