# School of Engineering Sciences: correction brief (batch 132)

The owner's brief `docs/handover/uploads/LEGONRUSH_School_of_Engineering_Sciences_Correction_Brief.docx`
(2026-10-14) asks for five things: placement and orientation, the facade, the aircraft display, the car park and
ground, and a dense bush behind the school.

Its nine pictures are in `refs/` (`brief-1` to `brief-9`):
- the front from the lawn (1);
- the front block close up (2);
- a raised view (3);
- the satellite detail (4) and the wider context (5);
- the jet at its fence (6, 7, 9);
- the entrance (8).

The brief names a picture "current in-game candidate"; that picture is not in the document.
Comparison sheet: `sheet.jpg`. Labels: [VERIFIED] [DECISION] [ASSUMPTION] [INCOMPLETE].

## Placement

- [VERIFIED] The game's map registers on the satellite detail (4) at 4.157 px/m with no rotation:
  px = 330 + (x − 344.5) × 4.157, py = 845 + (z + 340) × 4.157. Three things land on their features within about 2 m:
  - Annie Jiagge Road, the road west of the car park and the road south;
  - ISSER and the Pent blocks;
  - the school's own outline (`registration-overlay.png`: cyan roads, red outlines, magenta the model's blocks,
    yellow the car park, green the wood).
- [DECISION] The building is not moved or rotated. The school's outline (game building 276, the mapped School of
  Engineering Sciences footprint) and the model's blocks already sit on the satellite's roofs:
  - the front block with the entrance on the south;
  - the west, back and east blocks round the light well;
  - the stair towers between them.

  The front block's roof in the satellite reaches about 3 m further south than the outline. That is within the lean
  of a four-storey roof, so it is left alone.
- [VERIFIED] The car park (the mapped parking area, x 376–441, z −446…−381) is where the satellite shows it.
- [VERIFIED] The jet compound. The map has its outline (game building 1026, x 470.5–481.5, z −400.7…−389.5), and the
  satellite shows the pad there. The game drew the pad and fence about 5 m east and 4 m north of it. The outline
  stayed solid, so the bike hit an invisible wall west of the drawn fence. The pad and fence now stand on the outline.

## Facade (`src/game/engineering.ts`)

- [VERIFIED] Photos 1, 2, 3 and 8:
  - dark charcoal window frames (white before);
  - the front block in three bays between pilasters, with floor bands and one wide four-pane window per bay and
    storey;
  - the wings' ends faced with breeze-block panels;
  - the wings' long faces alternating a window and a breeze-block panel (photos 6, 7, 9);
  - the stair towers screened in cream breeze block;
  - an arched breeze-block screen in a white frame on the top floor of each tower front (the glass windows down the
    tower fronts removed);
  - hipped terracotta roofs and black fascias, as before.
- [VERIFIED] The entrance (photo 8):
  - a low gable porch roof in maroon sheet over a pale boarded soffit;
  - square white columns;
  - the white beam lettered SCHOOL OF ENGINEERING SCIENCES (it said SCHOOL OF ENGINEERING);
  - a tiled landing up two steps, dark doors;
  - red-brown herringbone pavers in front.
- [INCOMPLETE] Air-conditioning units (photos 7, 9) are not modelled. Their bays could not be matched to the wings'
  windows without a measured elevation.

## The Aermacchi MB-339

- [VERIFIED] The type comes from the School's donation report, quoted in the brief. The jet is modelled:
  - a slim trainer, its nose and tandem canopy in front;
  - low wings with a slight sweep and tip tanks;
  - a swept fin with the Ghana flag;
  - dark green over tan camouflage, a pale belly and a pale nose tip;
  - yellow jack stands under the wings (photos 7, 9).
- [DECISION] The jet faces the way the building faces: south, nose toward the compound's gate. The owner, 2026-10-14:
  "the jet and the building face same direction". Before this it pointed east (the batch-80 correction).
- [ASSUMPTION] The jet is drawn at 0.85 of its real size: 9.3 m long, 9.2 m over the tip tanks. The real MB-339 is
  10.97 m long and 10.86 m over its tip tanks, and the mapped compound is only about 11 × 11 m. A measured compound
  size would let it go to full size.
- [VERIFIED] The fence (photos 6, 9):
  - chain-link on grey posts with cranked tops, standing on a low concrete kerb;
  - green welded-mesh panels with a double gate along the front (south).

## Car park and ground

- [VERIFIED] The satellite (4) shows about 15 cars in some 70 marked bays. The lot is now filled at 22 % instead of
  65–90 % (`lbplan.ts` `ENG_PARK`).
- A light concrete apron runs along the jet compound, with a kerb where it meets the grass.
- The forecourt and the compound are kept clear of generated trees and tufts.

## The bush behind the school (`src/game/engbush.ts`)

- [DECISION] The owner asks for "dense bush/forest just a few metres behind". The satellite shows scrub and trees
  from the back of the complex to the forest, and trees between the east block and Annie Jiagge Road.
- It is drawn as a dense line of instanced low-poly shrub crowns, with about one in seven a short tree. It uses
  `scrubkit.ts`: instanced per 60 m tile, a fuller crown near the camera and a single blob further off.
- It is kept:
  - 4.5 m clear of the building as a service strip;
  - off the tracks and roads;
  - short of Annie Jiagge Road.
- Only tree trunks are solid; shrubs never block the bike.

## Checks

- Unchanged: route lengths (lens), building ids and the geography files.
- Passing: the type check, the route tests, the build and the smoke ride.
- Views: front, porch, jet fence (two angles), raised, side passage from the car park, top, and rear bush.

## Batch 133: the owner's notes on the satellite picture (`refs/owner-satellite-2.webp`)

The owner, 2026-10-14: "add side walk appropriate ... the car park and all pavement around the school are the same
color as the pavement on the car park ... the thin road that passes behind the school is brown ... the bushes right
behind the building are low ... after the foot path is thick forest ... up to EVANDY". Comparison:
`sheet-ground.jpg`. Code: `src/game/engplan.ts` (numbers), `src/game/engground.ts` (the build).

- [DECISION] **Paving.** All paving round the school uses the car park's concrete (world.ts: `#b9bbbf`, the concrete
  texture at 5 m): the forecourt, the strip between the car park and the front block, the apron before the jet's
  compound, and the strip at the bank's foot. The herringbone brick of batch 132 is gone.
- [VERIFIED] **Sidewalks** where the satellite shows the pale strips round the lawns:
  - the north side of the road south of the lawns;
  - both sides of the access road down to the forecourt;
  - the east side of the road west of the car park;
  - the west side of Annie Jiagge Road beside the school.
  
  They are 1.5–1.7 m wide, 0.12 m above the grass with a kerb face toward the road, and gapped where another road
  comes in. They are not solid.
- [DECISION] **The track behind the school** (the mapped footpath from the road west of the car park to Annie Jiagge
  Road) is drawn as brown earth. Its pale path surface is not drawn (`science.ts` `offAsphalt` → `onEngTrack`). The
  route network is unchanged.
- [DECISION] **The bush between the building and the track is low**: 0.7–1.5 m, with no trees. The 4.5 m service
  strip is kept.
- [DECISION] **Thick forest from the track north to Evandy Hostel's latitude** (z −1250), from x 160 to Annie Jiagge
  Road, with ragged far edges:
  - canopy crowns on solid trunks in staggered, jittered rows; about one in four is a big tree;
  - dense undergrowth for 20 m along the track, thinner through the rest;
  - the forest floor painted dark under the canopy;
  - kept clear of every road, footpath and outline.
  
  About 12,000 instanced crowns in all, per 100 m tile, with a single-blob version past 75 m.
- [ASSUMPTION] West of the brief's wider satellite picture (north of z −666) there is no image evidence for the
  forest; its extent there rests on the owner's word.
- Checks: route lengths identical (lens), route tests, build, smoke ride; the preview loads in about 27 s.
