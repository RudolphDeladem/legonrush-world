# LEGONRUSH — product requirements and decisions

Labels: [VERIFIED] checked in code on 2026-10-11 · [DECISION] owner decision · [PROPOSAL] Claude's suggestion, not
approved · [INCOMPLETE] partly done · [ASSUMPTION] unchecked belief.

## 1. Vision

- "The Campus Lifestyle Reimagined. Ride. Race. Connect." [VERIFIED in `index.html`].
- A social 3D cycling experience that turns the University of Ghana, Legon campus into a living, interactive
  playground (the landing page's description) [VERIFIED].
- Audience: UG students (freshers learning the campus first), alumni, visitors; phones and computers; students on data
  bundles (small offline install) [VERIFIED in `vite.config.ts` comments].
- The campus must be **recognisably the real Legon**: real roads, real building positions, real entrances, buildings
  rebuilt from the owner's photographs [DECISION, standing since account 1].

## 2. Core requirements

### 2.1 Riding and navigation
- **Explore**: pick a start and a destination from real campus places; the real shortest route; ride it with a
  direction banner, place labels, mini map; arrival card with **Drone view**, **Ride it yourself**, **Learn more**,
  **Done** [VERIFIED; `docs/LEGON_BUILDINGS.md` → Explore sections].
- **Ride it yourself / free ride**: steer anywhere a bike can go; every mapped road rideable end to end; buildings,
  walls, fences, parked cars, trunks stop the bike; grass in woods rideable between trunks [DECISION].
- **Bike speed**: Normal or Faster (+30%) in Explore and Vibe rides, remembered [DECISION 2026-10-11, done].
- Keyboard, touch and game controllers (PS5 DualSense, PS4, Xbox, generic) [DECISION, done].
- **Controllers on a computer only; nothing controller-related drawn on screen** [DECISION 2026-10-10: "i don't want to
  see any controller on my screen … forget about people who use phones"].
- Invert look left/right and up/down options for the controller [DECISION, done].
- Rumble on crashes and hits when Vibration is on [DECISION, done; untested on hardware].

### 2.2 Campus fidelity (see `GEOGRAPHY_AND_CAMPUS_FIDELITY.md`)
- Entrances must be the real doors/gates; routes end at them [DECISION].
- Every building the owner marks is rebuilt from the photos: storeys, paint and weathering, windows (wood vs glass,
  colour), doors, open entrances (open passages the bike can ride through), balconies, stairs, roofs, stone walls,
  ground relief [DECISION].
- No invented clutter; remove what the owner marks for removal; do not add what was not asked [DECISION].
- Trees are trees (trunk + crown), not grass; forest trees with short stems hidden by low leafy crowns [DECISION
  2026-10-11].
- Roads flat unless marked; no asphalt over stairs; relief must never tilt a road by accident [DECISION].
- No paint flicker (z-fighting) [DECISION 2026-10-11, fixed with log depth + near plane].
- The camera must not see through or move through buildings [DECISION 2026-10-11, done].

### 2.3 Social, races, events, economy [VERIFIED present in code; maturity not verified in production]
- **Challenges** (`src/features/challenges/`): daily race, time, weekly, treasure hunt, distance, location, skills,
  hall, inter-hall, limited time; lobbies, codes, leaderboards (Supabase RPCs).
- **Events** (`src/features/events/`): catalogue, schedule, detail, event spaces, passport, a creation wizard, mini
  games "Campus Quiz" and "Target Tap".
- **Community** (`src/features/community/`): feed, news, people, groups, crews, chat, presence, **dating (opt-in,
  18+, mutual likes only)**.
- **Live** (`src/live.ts`): Supabase Realtime presence + broadcast for who is online, Quick Match, Vibe Ride and its
  chat (nothing stored).
- **Garage/store** (`src/features/garage/`), coins, XP, levels, missions, achievements, treasure.
- **Money** (`supabase/functions/`): Paystack coin purchase, weekly prize race (free entry), wallet cash-out of prize
  money only. Switched off ("Coming soon") until the owner sets the Paystack public key and deploys the functions
  [VERIFIED]. The functions README advises legal/accounting review before real prizes [VERIFIED].

## 3. Planned / requested, NOT implemented

| Item | Status |
|---|---|
| **Football and tennis event games** | [DECISION] to be developed **separately** and integrated later. Not implemented. Only map content exists (pitches, courts, the stadium, the "I want to play football" intent). See `FEATURE_AND_ROADMAP_STATUS.md` §4. |
| **10,000+ concurrent players; real-time multiplayer races and sports matches** | [DECISION] a **target**, not a demonstrated capability. Today's live features use Supabase Realtime channels; no load test, no authoritative game server, no netcode for synchronised physics exists. Needs an architectural assessment (see `FEATURE_AND_ROADMAP_STATUS.md` §5). |
| Remaining campus areas | Continue batch by batch from the owner's photos. |

## 4. Standing owner decisions (process)

- Work comes in batches of marked pictures or PDF briefs; each batch is answered completely: inspect, model, render,
  test, commit, push to branch and `main`, confirm CI + Pages, report with renders [DECISION].
- No pull requests; push the same commit to `main` [DECISION, account 1 and 2].
- "Always push and deploy after testing whenever a prompt of updates is sent" (2026-10-12): every batch goes to the
  working branch and to `main`, and the reply states the CI and Pages results [DECISION, account 1's return].
- PDF/Word briefs with game/real pairs and aerials: read every page and image, register the aerials on the mapped
  outlines, write an evidence audit, render each pair before and after, list what stays estimated or unresolved;
  never guess an identity, a name or sign text [DECISION, 2026-10-12/13].
- In-ride tools stay off the screen during riding: speed is in the pause menu, the full map is the pause menu's
  "View map" [DECISION, 2026-10-11/13].
- No model names in commits, code or docs [DECISION/system rule].
- The handover images and account 1's text conversation log were put in the public repo by the owner's earlier
  decision (account 1, `ef2123c`) [VERIFIED]. For **this** migration the owner ruled: **do not upload full chat
  histories or private image archives to the public repo**; no commit/push without approval [DECISION 2026-10-11].
- The original repo `legonrush` is not synchronised and must not be replaced [DECISION].

## 5. Proposals awaiting the owner [PROPOSAL]

1. Update `README.md`: it still says "Deploys to Netlify" and lists Race/Events as "coming soon"; the real deploy is
   GitHub Pages and both exist. (Docs-only change; not made, because the migration task forbids changes beyond the
   handover package.)
2. Decide whether `docs/handover/images/` (754 files, 112 MB, some with third-party watermarks such as stock-photo or
   Street View marks) should stay public. See `OPEN_ISSUES_AND_NEXT_ACTIONS.md`.
3. Decide whether `netlify.toml` is still wanted.
4. Before any 10,000-player push, commission the assessment in `FEATURE_AND_ROADMAP_STATUS.md` §5.
