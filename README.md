# LEGONRUSH

**The Campus Lifestyle Reimagined. Ride. Race. Connect.**

A browser-based 3D cycling game set on the University of Ghana, Legon campus, delivered as an installable Progressive Web App (PWA). This repository holds the MVP prototype (phase 1 of the product spec).

## Site

Live on GitHub Pages: **https://rudolphdeladem.github.io/legonrush-world/**

- `/` is the landing page (DELA's design and logo)
- `/play/` is the game; every "Get started" button leads there, and the installed app opens straight into it
- `/geo/` is the geography inspector: the campus map over satellite imagery, for checking buildings and testing routes

## What's in the game

### Riding the real campus

- **The real University of Ghana, Legon campus**: every road and footpath, about 1,600 building footprints at their real
  positions and 400+ named places, from the authoritative geography described below
- **Buildings rebuilt from photographs**: building by building, from the owner's photos, street views and marked
  aerials (storeys, paint and weathering, wooden or glass windows, doors, open entrances, balconies, stairs, stone walls,
  roofs, trees and the lie of the ground). Each batch is recorded in [docs/LEGON_BUILDINGS.md](docs/LEGON_BUILDINGS.md)
- **Explore**: pick where you are and where you need to be, see the real shortest way with distance, walking and
  cycling time and turn-by-turn directions, then ride it with a direction banner, place labels and a heading-up mini map.
  Routes end at the buildings' real entrances. On arrival: **Drone view**, **Ride it yourself** (free ride anywhere a
  bike can go), **Learn more** and **Done**. Routes can be shared as a link or on WhatsApp and opened in Google Maps
- **Free ride**: buildings, walls, fences, parked cars and tree trunks stop the bike; open passages and the grass
  between trees can be ridden; the bike slows uphill. Normal or Faster (+30%) bike speed
- **Freshers' Tour**, **Where is it?** and **Quick Ride** (a three-lane runner on the real roads with traffic,
  obstacles, Rush Coins and boost)
- Day and night, weather and campus life

### Playing with others

- **Challenges**: daily race, time trial, weekly, treasure hunt, distance, location, skills, hall and inter-hall,
  limited-time; lobbies with codes and leaderboards
- **Events**: catalogue, schedule, event spaces, passport, an event-creation wizard, and two mini games (Campus Quiz and
  Target Tap)
- **Community**: feed, news, people, groups, crews, chat and presence, and opt-in 18+ dating (mutual likes only)
- **Live**: who is online, Quick Match and Vibe Ride with its chat (Supabase Realtime)
- **Garage and store**, coins, XP, levels, missions, achievements, treasure; your hall's jersey colour
- Accounts and cloud saves through Supabase; guest play without signing up

Coin purchases, the weekly prize race and wallet cash-out (Paystack) are in the code but switched off ("Coming soon")
until the Paystack key is set and the Edge Functions are deployed (see `supabase/functions/README.md`).

The game is an installable PWA and works offline after the first load.

## Controls

**Quick Ride (the runner)**

| | Keyboard | Touch |
|---|---|---|
| Change lane | ← → or A D | Swipe left / right |
| Jump | ↑, W or Space | Swipe up |
| Boost | B or Shift | Tap, or the Boost button |
| Brake | Hold ↓ or S | Brake button |
| Pause | Esc or P | Pause button |

**Free ride (Ride it yourself)**

| | Keyboard | Touch |
|---|---|---|
| Pedal (one tap keeps pedalling) | ↑, W or Space | Pedal button |
| Steer | ← → or A D | ◀ ▶ buttons |
| Brake; hold when stopped to reverse | ↓ or S | Brake button |

**Game controllers** on a computer: PS5 DualSense, PS4, Xbox and generic pads (steering, pedal and brake on the
triggers, look, camera views, bell, map, pause; menus by D-pad). The Controller panel in the pause menu sets dead
zones, sensitivity, inversion, vibration and button mapping. Nothing controller-related is drawn on screen during a
ride. See "Game controllers" in [docs/LEGON_BUILDINGS.md](docs/LEGON_BUILDINGS.md).

## Run it

```bash
npm install
npm run dev          # http://localhost:5173 (also on your LAN for testing on a phone)
npm run build        # typecheck + production build in dist/
npm run preview      # serve the production build (PWA/service worker active)
npm run geo          # rebuild the campus geography from data/geography/ (see below)
npm run test:routes  # destination access and route checks
npm run smoke        # a short ride in a headless browser (needs Playwright's Chromium)
```

Requires Node 20+ (CI uses Node 22).

## Deployment

Every push to `main` runs two GitHub Actions workflows:

- **CI** (`.github/workflows/ci.yml`): build, smoke test, regenerate the geography and check it matches what is
  committed, route tests
- **Deploy to GitHub Pages** (`.github/workflows/deploy-pages.yml`): builds with `BASE_PATH=/legonrush-world/` and
  publishes `dist/` to GitHub Pages (Settings → Pages → Source: GitHub Actions)

`netlify.toml` is left over from an earlier Netlify setup and is not used by the live site.

## Project layout

```
src/
  main.ts            screens and app flow (onboarding, hub, ride HUD, Explore, results)
  tabs/              the menu tabs: challenges, events, community, map, garage
  features/          challenges, events, community, garage, map, life, missions, achievements, money, vibe ...
  game/              the 3D campus and the ride
    Game.ts          game loop, rider physics, collisions, camera
    world.ts         the 3D campus (roads, buildings, areas, trees) and the route layer
    campusmap.ts     loads the map, road graph, shortest path, turn-by-turn directions
    routes.ts        rides along real roads (Quick Ride, Explore)
    blocks.ts        the block engine the rebuilt buildings are made with
    sites.ts         the list of rebuilt building sites (one file per area: balme.ts, physics.ts, entrance.ts ...)
    relief.ts        hills, terraces and stairs
    solids.ts, meshcollide.ts   what stops the free-ridden bike
  gamepad.ts, padmenu.ts        game controller support
  live.ts            Supabase Realtime presence, Quick Match, Vibe Ride
  cloud.ts           accounts and cloud saves (Supabase)
  state.ts           profile, levels, rewards (on the device)
  data/legon-map.json  campus roads, buildings, areas and places (generated by npm run geo)
  geo/               the geography inspector (/geo/)
  landing/           landing page script and styles
index.html, play/index.html, geo/index.html   the three pages
public/              logo, icons, landing photos and art, marketing screenshots
data/geography/      geography sources and the curated registries (corrections, entrances)
scripts/             geography pipeline, route tests, smoke test, gamepad tests, brand and marketing assets
supabase/            database schema and Edge Functions
tools/preview/       camera views and render scripts for comparing the game with photos (copy to .preview/)
docs/                building records, geography and access docs, handover notes for new contributors
```

## The campus map

The campus geography is rebuilt from several independent sources and documented in [docs/LEGON_MASTER_GEOGRAPHY.md](docs/LEGON_MASTER_GEOGRAPHY.md): OpenStreetMap (`data/legon.osm` plus OSM features outside that extract via Overture Maps), Google Open Buildings and Microsoft ML footprints, Overture places, the [UG Campus Map](https://enkayyy97.github.io/ug-campus-map/) by enkayyy97, ESA WorldCover, the Copernicus DEM, a Sentinel-2 composite and the curated registries in `data/geography/registry/`. `npm run geo` builds the authoritative dataset (`data/geography/legon-master.geojson`, with a reconciliation report) and then the game's `src/data/legon-map.json`. `scripts/geography/fetch_sources.py` refreshes the source snapshots. Destination access (which entrance, where a ride stops) and campus routing are documented in [docs/LEGON_DESTINATION_ACCESS.md](docs/LEGON_DESTINATION_ACCESS.md); `npm run test:routes` checks them. Open `/geo/` on the dev server or the live site to compare the map with satellite imagery from above and to test routes. Missing or misplaced buildings are best fixed on OpenStreetMap itself, which also helps everyone else.

## Status and roadmap

- **Done**: the real campus layout and routing, Explore with free ride and drone view, buildings rebuilt from photos
  (96 batches so far), accounts, garage and store, challenges, events, community, live presence, Quick Match and Vibe
  Ride, game controllers
- **In progress**: rebuilding the rest of the campus from the owner's photos, batch by batch
- **Switched off until configured**: Paystack payments, prize races and cash-out
- **Planned**: football and tennis event games (developed separately, then integrated); real-time multiplayer at large
  scale (10,000+ concurrent players is a target that needs an architecture assessment first)

Details: [docs/migration/FEATURE_AND_ROADMAP_STATUS.md](docs/migration/FEATURE_AND_ROADMAP_STATUS.md).
