# LEGONRUSH — feature and roadmap status

Status at `303aff7` (2026-10-11). Labels: [VERIFIED] present in code / checked · [DECISION] · [PROPOSAL] ·
[INCOMPLETE] · [ASSUMPTION]. "Present in code" does not mean tested in production with real users.

**Added 2026-10-11 → 10-13 (`7e114a0`)** [VERIFIED present, CI green, deployed]:
- **View map** in the pause menu: the campus map full screen over the paused ride, the rider's arrow and heading, the
  route and destination pin (not in races); drag, pinch, wheel, zoom buttons, back to the rider; Back to ride, Escape
  or M close it and the ride resumes where it was; controller: left stick pans, R2/L2 zoom, R3 recentres, Options,
  Create or Circle close (`src/features/map/ridemap.ts`, `src/main.ts`).
- **Fly-over camera**: Triangle / Y cycles chase, far, close, fly-over (about 30 m up, 11 m behind, turning with the
  heading) in free rides, guided rides and races (`Game.ts` VIEWS, `flyOver`).
- **Destination and FINISH banners** at ride ends (`9fc65ea`).
- **Bike speed** only in the pause menu, kept after "Ride it yourself" (`8fffda5`).
- **Map extension to UPSA**: a provenance-tagged OSM/Overture extension with the roundabout, divided IPS Road, the
  Main Gate and campus, and the UPSA ride (`85bdade`).
- **N4 cutting** under the main gate interchange with layered heights (`9061865`).
- **Rendering**: flicker fix under the log depth buffer, ground tiles and smaller life cells (triangles per frame
  1.51M → 0.36M on the guest ride) (`cd057db`).
- Building reconstruction now at **121 batches** (`docs/handover/TASKS.md`).

## 1. Riding and world

| Feature | Status | Where |
|---|---|---|
| Real campus map: roads, footpaths, ~1,600 footprints, places | [VERIFIED] | `src/data/legon-map.json`, `world.ts` |
| Explore: route, banner, mini map, arrival card (Drone view, Ride it yourself, Learn more, Done) | [VERIFIED] | `main.ts`, `Game.ts`, `features/map/` |
| Freshers' Tour, Quick Ride runner, "Where is it?" | [VERIFIED in README; code present] | `routes.ts`, `main.ts` |
| Free ride with collisions (outlines, trunks, walls, cars, fences via `meshcollide.ts`) | [VERIFIED; owner-tested before the latest fix, latest fix not yet confirmed by owner] | `Game.ts`, `solids.ts`, `meshcollide.ts` |
| Open passages rideable | [VERIFIED] | `blocks.ts` `y`, PASSAGES |
| Bike speed Normal / Faster (+30%) in Explore and Vibe | [VERIFIED] | `state.ts`, `main.ts`, `Game.ts` |
| Camera kept out of buildings; no paint flicker | [VERIFIED in renders; owner confirmation pending] | `Game.ts` |
| Weather FX, day/night, life (bots, venues) | [VERIFIED present] | `weatherfx.ts`, `features/life/` |
| Building reconstruction, 96 batches | [VERIFIED as docs + code] | `docs/handover/TASKS.md`, `docs/LEGON_BUILDINGS.md` |
| Main entrance precinct (37 pairs) | [VERIFIED deployed; measurements listed as unresolved] | section 74 |

## 2. Controls

| Feature | Status |
|---|---|
| Keyboard, touch | [VERIFIED] |
| Gamepad (PS5/PS4/Xbox/generic), menus by D-pad, remapping, dead zones, invert X/Y, rumble | [VERIFIED with a **simulated** controller only (`scripts/gamepad-test.mjs` 31 checks, `gamepad-card-test.mjs` 10 checks). **Not verified on physical hardware.**] |
| Controls PDF for the owner | Delivered in the conversation (2026-10-10); not stored in the repo |

## 3. Social, competition, economy (present in code)

| Feature | Status |
|---|---|
| Accounts, profiles, halls, XP, levels, coins, missions, achievements | [VERIFIED present; Supabase auth] |
| Challenges: daily race, time, weekly, treasure hunt, distance, location, skills, hall, inter-hall, limited time | [VERIFIED present] |
| Events: catalogue, schedule, spaces, passport, wizard; mini games Campus Quiz and Target Tap | [VERIFIED present] |
| Community: feed, news, people, groups, crews, chat, presence, opt-in 18+ dating | [VERIFIED present] |
| Live channels: presence, Quick Match, Vibe Ride + chat (Supabase Realtime) | [VERIFIED present] |
| Garage / store, bike rotation | [VERIFIED present] |
| Paystack coins, weekly prize race, wallet cash-out | [INCOMPLETE] code present, **switched off** until the owner configures keys and deploys Edge Functions (`supabase/functions/README.md`) |
| Supabase schema deployed to the live project | [ASSUMPTION] not checked in this audit (no database access from here) |

## 4. Football and tennis event games [DECISION: develop separately, integrate later — NOT implemented]

What exists today: map content only — pitches and courts (Athletic Oval, Sarbah field, the soccer park, UG Stadium,
tennis courts), the "I want to play football" search intent, and the Events framework that can host mini games
(`src/features/events/games.ts` uses a `GameId` union and an overlay that returns a score).

[PROPOSAL] integration path, for when the separate games are ready:
1. Build each game as its own module/package with a small contract: `start(container, options) → Promise<score>`
   plus optional live-match hooks.
2. Register it in `GAMES` (`events/games.ts`) or as a challenge kind (`challenges/kinds.ts`), and place a venue entry
   on the real pitch/court so riders can ride there and start it.
3. Leaderboards through the existing event/challenge tables; live matches through the multiplayer layer in §5.

## 5. 10,000+ concurrent players; real-time multiplayer races and sports matches

[DECISION] This is a **target**. It is **not a demonstrated capability**. No load test has been run; no
authoritative game server exists; races today are lobby-started rides compared on time, and live features are
Supabase Realtime presence/broadcast channels.

[PROPOSAL] questions the architectural assessment must answer before any claim:
- Supabase plan limits for concurrent Realtime connections and messages per second; per-channel fan-out (a 10,000-rider
  single channel is not realistic; shard by race/match/area).
- Authoritative state for races and sports (server-side tick, anti-cheat — `submit-run`'s ride-recording check is a
  start) vs peer broadcast.
- A dedicated real-time server (e.g. WebSocket/WebRTC service with interest management) for matches; Supabase kept for
  accounts, persistence and leaderboards.
- Client performance on low-end phones with many visible riders (instancing, LOD, update rates).
- Load testing plan (synthetic clients), cost model, and observability.

## 6. Roadmap (in the owner's working order)

1. [DECISION] Keep rebuilding the campus batch by batch from the owner's photos/briefs.
2. [DECISION] Owner to test on a physical controller and report.
3. [PROPOSAL] Resolve the open measurements of section 74 when the owner can supply the photos named there.
4. [DECISION] Football and tennis games developed separately, integrated later (§4).
5. [DECISION] Scale target 10,000+ players → assessment first (§5).
6. [PROPOSAL] Money features: only after legal/accounting review (functions README).
