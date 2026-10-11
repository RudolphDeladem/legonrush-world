# LEGONRUSH — visual design and asset specification

Labels: [VERIFIED] · [DECISION] · [PROPOSAL] · [INCOMPLETE] · [ASSUMPTION].

## 1. Brand [VERIFIED in code]

- Name **LEGONRUSH**; tagline "The Campus Lifestyle Reimagined."; kicker "Ride. Race. Connect."
- Landing page design and logo by **DELA** (README). Brand files: `public/brand/logo.webp`, `wordmark.webp`,
  `emblem.webp`, `og.jpg`; icons in `public/icons/` cut from the logo by `npm run brand` (`scripts/brand-assets.mjs`).
- Colour tokens (`src/style.css` `:root`): navy `#0a1020` (also PWA theme/background), gold accent `#f5c518`, white,
  muted `#9aa6c4`, line `rgba(255,255,255,0.12)`, glass `rgba(10,16,32,0.72)`, radius 16 px. Light theme in
  `src/light.css`.
- Type: **Sora** (body, `@fontsource/sora`) and **Barlow Condensed** (display, `@fontsource/barlow-condensed`); only
  Latin subsets are cached offline.
- Photography: `public/photos/*.webp` (50 files: onboarding `ob-*`, modes `mode-*`, landmarks `lm-*`, scenes `sc-*`,
  events `ev-*`) cut from DELA's originals by `scripts/landing-photos.mjs`; `public/art/` 20 SVG illustrations;
  `public/shots/` 16 in-game marketing renders (`npm run shots`).

## 2. UI conventions [VERIFIED / DECISION]

- Dark navy glass panels, gold primary buttons, rounded 16 px; HUD minimal during rides.
- **Nothing controller-related drawn during the ride** [DECISION]. D-pad focus ring in menus: yellow outline + dark
  shadow (`explore.css` `.pad-focus`).
- Pause overlay above the HUD (z-index 10) and scrollable on short screens.
- Every stylesheet must have balanced braces — `npm run smoke` checks it since the Map tab freeze (2026-10-10).

## 3. 3D world conventions (how buildings are made) [VERIFIED; details in `docs/handover/HANDOVER.md` §3]

- **Procedural only**: textures are drawn on canvases (`src/game/textures.ts`, `concrete.ts`); no image downloads in
  the game. The owner's photos are references, never textures [DECISION; images with watermarks must not be copied].
- **Block engine** `blocks.ts`: `createSite(name, specs)`; spec fields name, axis, origin, storey, style, roofColor,
  fascia, pitch, blocks, keep, extras(k), replaces, onGround, plinth; block roofs `hip | flat | crossZ | none`;
  `y` lifts a block to make open passages. Facade canvas 256×512 (top half upper storey, bottom half ground storey).
- Kits: `hipRoof` (hip / open gable / boarded gable / gablet), `concrete()` weathering, `stoneMesh` rubble stone,
  `panel`, `breeze`, `pierced` screen walls, `grille`, `rails`, `gardens.ts` trees/palms/bushes/hedges (skip roads),
  `letters.ts` raised letters (A–Z incl. Y B K Q J W, digits, `.` `-`), `modelkit.ts`, `enkit.ts` (entrance kit:
  low wings, openings, chain bollards, flagpoles, fan palms, grass tufts).
- Owner vocabulary → model: "opened entrance" = open passage (no door); "one floor" = one storey; "wooden windows" =
  dark brown/black louvres or lattice; "stone-like slabs/walls" = `stoneMesh`; "uncompleted building" = bare
  blockwork/frame.
- Groups added to a site must be flattened into meshes (the fog cull expects meshes; the entrance crash of
  2026-10-11).
- Trees: species in `life.ts` (incl. `woodland`: short stem, crowns reaching low — 75% of wood areas) and
  `gardens.ts woodTree`; leaves never collide; trunks do.
- Grass: blade tufts, not cones; flower beds muted, not garish (owner reactions during the entrance brief).

## 4. Rendering settings [VERIFIED `Game.ts`]

- Camera near plane 0.3 m; `logarithmicDepthBuffer` on capable devices (not on `lowEnd`). Custom shaders (sky, rain)
  include the log-depth chunks.
- Chase camera pulled in short of buildings (`clearCamera`).
- Shaders precompiled and textures uploaded once after loading (batch 75, guided-ride stutter fix).
- Known heavy items: relief ground mesh (~432k triangles, not culled), shadows of 400 m life cells [INCOMPLETE].

## 5. Reference assets (owner material)

See `ASSET_INVENTORY.md`. Summary: 754 numbered owner images in `docs/handover/images/` indexed by
`IMAGE_INVENTORY.md`; the 14 MB buildings reference zip in `docs/handover/uploads/`; 14 owner PDF briefs kept
**private** (not in the repo).

## 6. Copyright cautions

Some reference images carry third-party marks [VERIFIED for image 754, noted "stock watermark; not to be copied" in `IMAGE_INVENTORY.md`; stock-photo, YouTube-channel and Google Street View marks on other images were seen during the work but were not re-checked image by image in this audit].
They are references only; nothing from them is reproduced in the game (the mural portrait at the main entrance is
generic, not a likeness). Whether these images should remain in a public repository is an open owner decision.
