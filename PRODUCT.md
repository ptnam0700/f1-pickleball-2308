# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain static HTML/CSS/JS, no framework, no custom backend. Google Sheets as the data store, accessed through a Google Apps Script Web App (doGet/doPost) as a free JSON API. Deployable to any static host.

## Users

Employees and members of FPT Software's F1 Club (internal community, not the general public) — players who signed up for the tournament checking their bracket/schedule/opponents, and colleagues/spectators following live scores and standings. Secondary: club organizers (admins) who run the tournament day-of and need to enter scores quickly on a laptop or phone between matches.

## Product Purpose

A landing + live-scoreboard site for "PICKLEBALL F1 CLUB OPEN 2026" (Aug 23, 2026, Sunflower Arena Pickleball, 6 Hoang Trong Mau). It announces the event, publishes official rules, and — the core utility — lets anyone track round-robin results, standings, and bracket progress live during the tournament, while a password-gated admin view lets organizers enter scores and advance teams into the bracket.

## Positioning

Purpose-built for this club's exact format (5-round round robin → top-4 ranking → tennis-style semifinal/final bracket, two categories run in parallel) rather than a generic tournament tool — the ranking, tie-break, and bracket-advancement logic are wired to this club's specific rules document, not a configurable general system.

## Operating Context

Runs live during a single-day event (08:00–12:00). Organizers update scores court-side, likely on a phone, between matches under time pressure. Two categories run simultaneously (Đôi Nam Open, Đôi Hỗn Hợp), each with its own round-robin, ranking, and bracket, viewable via tabs. Data flows: admin enters a score → Google Sheet updates → all visitors' next page load/refresh sees updated standings (no real-time push required).

## Capabilities and Constraints

- Two categories, each: 5-round round robin (random draw, no repeat pairing) → ranking board → top 4 seeded into semifinals (1v4, 2v3) → final. The two semifinal losers are co-3rd place — no 3rd-place playoff match.
- Scoring: round-robin matches race to 11, no cap; semifinal/final race to 15, no cap. Win = 1 standings point.
- Tie-break order: standings points → point differential → head-to-head (only when exactly two teams are tied and already played each other) → manual draw-of-lots (admin override) when still tied.
- Admin auth is a single fixed password checked client-side against a plain JSON file — explicitly chosen by the user over a more secure server-side scheme, accepted as sufficient for an internal club event.
- Team names and the actual round-robin draw are not final yet; build against realistic mock data now, real data gets entered into the Google Sheet once the draw happens.
- No real-time websocket/push — score updates appear on next data fetch/page load, which is acceptable per the user.

## Brand Commitments

- Event name/branding: "PICKLEBALL F1 CLUB OPEN 2026," co-branded with FPT Software, DCE (Diversity Culture Experience), and F1.YU — logos present on the official poster (`poster.png`), must be reused as-is.
- Existing poster (`poster.png`) sets the binding visual world: deep sky blue background, navy panel/text blocks, lime/chartreuse accent, bold condensed sporty display type, diagonal court-line and pickleball-paddle motifs. New pages must extend this world, not invent a different one.
- Official rules content exists as an image (`thể thức thi đấu.png`) and must be transcribed faithfully (not paraphrased or altered) into the rules page.

## Evidence on Hand

- `poster.png` — official event poster (date, time, venue, sponsor logos, visual identity).
- `thể thức thi đấu.png` — official tournament format/rules document (round robin structure, scoring, tie-break rules), in Vietnamese.
- No real team roster or draw yet — mock data stands in until the user provides it.

## Product Principles

1. Faithful to the club's actual rules — ranking, tie-break, and bracket logic must mirror `thể thức thi đấu.png` exactly, not a generic tournament template.
2. Poster-first visual identity — the site is an extension of the existing poster's world, not a new design language.
3. Court-side usability for admins — score entry must work fast and clearly on a phone screen under time pressure.
4. Radically simple ops — static site + Google Sheet, no server to maintain, so the club can run this with zero DevOps overhead.
5. Graceful with partial data — every view (standings, bracket) must look intentional and correct at 0%, partial, and 100% of results entered, not just the finished state.

## Accessibility & Inclusion

No specific standard mandated by the user; default to solid contrast (poster's navy/lime/blue already reads high-contrast), legible type sizes, and touch-friendly admin controls given phone-based score entry.
