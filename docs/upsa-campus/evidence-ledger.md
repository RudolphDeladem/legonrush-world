# UPSA campus: evidence ledger and what was built (batch 127)

Two packs, kept separate as the owner asked:

**Pack 1** (`docs/handover/uploads/UPSA_Campus_Visual_Survey_Claude_Reference_Pack.zip`):
- the DroneStories video survey (3 min 34 s);
- its five contact sheets, cited as *P1 mm:ss*;
- its brief, prompt, frame index and source links.

Its `frames/` folder was not in the zip.

**Pack 2** has three parts.

1. `UPSA_campus_photos_and_video_New_folder_2.zip`:
   - the owner's 40 photos (`photo_N`), cited as *P2 photo_N*;
   - 31 web pictures, cited by filename;
   - the AeroVision drone post, cited as *P2 AeroVision s*.
2. `UPSA_Additional_Layer_Visual_Reference_and_Claude_Brief_2.docx` and
   `UPSA_Building_Identification_and_Map_Check.docx`.
3. Two clips from the DroneStories video, `IMG_9677.MOV` and `IMG_9677j.MOV`, cited as *P2 IMG_9677 s* and
   *P2 IMG_9677j s*. They show the towers finished, so they are later than Pack 1's construction frames. Pack 2's
   documents describe "one MP4"; these two clips came with them.

**Map** sources:
- the owner's Apple hybrid aerial, registered at 2.42 px/m, north up; anchors in `analysis.md`;
- the repository's master geography.

**Official pages**: upsa.edu.gh and Google Maps cannot be opened from this environment. Names and storeys come from the
packs' quotations of them.

Labels: [VERIFIED] [DECISION] [ASSUMPTION] [INCOMPLETE].

## Ledger

| ID | Feature | Sources | Cues | Storeys | Position / map match | Confidence | Action |
|---|---|---|---|---|---|---|---|
| A1 | Rev. J. K. Antwi Astro Turf | aerial; P2 IMG_9677j 0–46 s; P2 AeroVision 17–25 s; P2 photo_17, 26, 28, 29, 33, 35, 36; web `upsapark` | striped synthetic pitch, full white lines, goals, red edge, welded-mesh fence on grey posts, floodlight masts | – | aerial: turf x 2206–2275, z −1237..−1134. The map had no pitch and five machine-detected outlines on it | high | built; the outlines and the service road across it excluded (corrections.json) |
| A2 | Stand on the turf's west side | aerial (blue and white rows); P2 IMG_9677j 8 s | blue and white seat rows, a small white and blue pavilion | pavilion 2 [ASSUMPTION] | aerial x 2189–2203. Kept east of the mapped walkway osm:way/1009392428 | medium | built: six tiers, the pavilion |
| A3 | Hard courts (four) | aerial; P2 IMG_9677j 8–16 s; P2 photo_22, 23; web `images (28)` | red surround, green courts: basketball posts north, nets south; chain-link fence | – | aerial x 2143–2188, z −1209..−1120. Mapped as two grass pitches and outline osm:way/1009392429 | high | built; the outline excluded |
| A4 | Court beside the towers | aerial; P2 IMG_9677 34–38 s | red surround, one teal court with a net, fence | – | aerial x 2146–2186, z −975..−952. Mapped as a grass pitch | high | built |
| B1 | **Professional Christian Union Building** | P2 IMG_9677j 20–46 s (sign readable); P1 01:32; P2 photo_27–29; Annual Report 2024 photo (owner's second document) | long white block; open ground floor behind navy raking columns; blue windows; dark band on the top storey under the name; blue glass bay at the east end | 3 over the colonnade [VERIFIED by count]; total height an estimate | **behind the turf's north goal**, not its south end. The clips look north across the pitch at it, KOKA's blue glass to its right; its roof is the long roof cut off at the aerial's top edge (x 2228–2288 from z −1247.5). Not mapped. Its depth (12.5 m) is an estimate kept clear of the mapped road 17 m north | name high; position medium-high; depth low | built |
| B2 | Six-storey block north of the courts (the "Western Union" pin; P1's U-01) | aerial; P2 IMG_9677j 18 s | white frame, curved fins between bays, blue windows | 6 [VERIFIED by count] | aerial roof less the lean of a 20 m block: x 2144–2170, z −1240..−1214 [ASSUMPTION]. Replaces outline osm:way/1009392430 | identity unknown; form high | built, unnamed |
| B3 | Long low block south of the courts | aerial (light grey metal roof); P2 IMG_9677j 8 s | grey metal roof, white walls | 2 [ASSUMPTION] | aerial x 2149–2215. Shortened to x 2194 to keep the walkway clear. Not mapped | medium | built, unnamed |
| B4 | The four-storey group with galleries round a courtyard (P1's U-05; the "UPSA book shop" pin) | aerial; P2 IMG_9677 40–50 s; P2 IMG_9677j 0–6 s | white blocks with balcony galleries; a red pitched roof, a green flat roof, a tan flat roof, a slate roof at the west end; a round fountain in the courtyard | 4 [VERIFIED by count] | mapped outlines 521, 1988, 1986, 1987, 3044 kept. The slate block x 2140–2163, z −1075..−1041 is not mapped, from the aerial. A machine-detected outline in the courtyard excluded | form high; names unknown | finished from the clips; slate block and fountain built |
| B5 | Abednego F. O. Amartey Twin Towers | P2 photo_1–5, 7, 12; web `Twin-Towers`, `images (12)`, `(13)`; P2 IMG_9677 16–38 s (finished; one carries UNIVERSITY OF PROFESSIONAL STUDIES ACCRA on the roof) | two linked 10-storey blocks, blue glass corner, the name on the roof | 10 (official) | **conflict**, see below | – | unchanged |
| B6 | Opoku Ampomah Building / Central Administration | earlier batches | the round drum | – | unchanged | high | unchanged. P1 names the tall tower with the roof sign as an "Administration candidate"; P2 IMG_9677 shows that sign on a twin tower. The two are not confused here |
| C1 | Ewuntoma Medical Centre | P2 photo_18 (sign); owner's second document: plus code MR7M+4RF | white three-storey block, a canopy with the name, a red cross | 3 visible | the plus code decodes to x 2398, z −1218: inside KOKA's mapped outline, beside machine-detected outline 63, which the aerial shows as KOKA's roof | low | **not placed** |
| C2 | CIMG building | P2 photo_13–15 (CIMG sign, "…J.N. MARTEY") | white, blue stair tower, blue windows | 4 visible | no pin, no footprint | low | not placed |
| D1 | Other campus blocks | aerial (flat white roofs); all clips | white, blue windows, flat roofs | estimates by footprint: 1–4 | mapped outlines inside the campus (the mapped outline widened to the campus wall and round the turf) | finish high; storeys low | finished: white walls, blue windows, flat roofs behind a parapet (generic builder, `upsaStyle`) |
| E1 | Woodland and bush west of the campus wall | aerial; every clip | dense bush and trees to the wall, bare red patches | – | x 2028–2135, the aerial's extent (it continues west beyond the picture: not drawn there) | high | built (batch 128): the aerial's cover painted over the grass, crowns by its dense green (`upsagreen.ts`) |
| E2 | Shade trees on the campus | aerial; P2 photo_31, 32; web `images (14)`, `(16)` | broad crowns on the lawns, round the quadrangle | – | where the aerial's crowns are, off roads, paths, buildings, car-park bays and the models | medium (heights and trunks estimated) | built (batch 128) |

## Conflicts recorded before any change

1. **Pack 1 and Pack 2 on the tall white-and-blue tower.** Pack 1 calls it the Central Administration candidate. Pack 2
   (IMG_9677 16–38 s) shows its roof sign beside the gate, on one of the two linked towers. The Administration stays the
   round drum (batch 115).
2. **The towers' footprint.** The game's towers stand on osm:way/885510985, outline 3043 (x 2220–2272,
   z −958..−943), which the owner confirmed in batch 114. The aerial shows two larger blocks further west and north:
   - the north block's roof at about x 2191–2249;
   - the south block at about x 2198–2242, z −951..−917 after correcting the lean.

   A mapped service road crosses where the north block would stand. **Not changed**: a confirmed decision and route
   geometry are involved. Put to the owner.
3. **The PCU building's side.** The owner's second document repeats the question "south end". The clips put it at the
   north end. The evidence is followed.
4. **The turf's stripes.** Pack 1's brief says "longitudinal". IMG_9677j 46 s and the aerial show bands parallel to the
   goal line. The images are followed.
5. **The service road across the turf** (osm:way/626139046). It is mapped, but the aerial and every drone view show the
   pitch there. It is excluded with its reason in `corrections.json`. The walkway along the turf's west side
   (osm:way/1009392428) is kept.

## Changes, visual and geometric

- **Geometry** (`data/geography/registry/corrections.json` `exclude`, regenerated with `npm run geo`):
  - excluded from the game map: seven outlines (five machine-detected boxes on the turf, one on the courts, one in the
    courtyard), OSM outline osm:way/1009392429 on the courts, and the service road osm:way/626139046 across the turf;
  - the master keeps them, flagged;
  - access points are unchanged; route lengths are identical; the route tests pass.
- **Visual only:**
  - `src/game/upsawest.ts` and `upsawestplan.ts`: the turf, stand, courts, PCU building, the three unmapped blocks and
    the fountain;
  - the six-storey block replaces outline osm:way/1009392430 for drawing only;
  - `world.ts` `upsaStyle` with `facades.ts`'s new `blue`, `flat` and `storeys` options and `textures.ts`
    `upsaFacadeTexture`.

## Open questions for the owner

1. **The towers.** Move them to the two blocks the aerial shows? This would change outline 3043 and needs care with the
   service road there.
2. **Ewuntoma Medical Centre and CIMG.** Which buildings are they? A pin on the aerial would settle both.
3. **The six-storey block north of the courts and the four-storey group.** What are their names?
4. **The stand.** Does it have a roof?

Comparison sheets: `sheet-top.jpg` (the aerial, the game before, the game after) and `sheet-views.jpg` (six clip frames
against the game from about the same viewpoints; the camera positions are approximate).

## Batch 129: layout and facade corrections (the owner: "check and make correction to the upsa building layout and facade")

Every outline was checked again on the aerial, enlarged with a 10 m grid (`sheet-corrections.jpg`, `sheet-corrections-views.jpg`).

**The towers.**
- *Finding.* The map has two parallel slabs north of IPS Road, 18 m apart: osm:way/885510985 (south) and
  osm:way/885510984 (north), with the small osm:way/1009392391 at the north one's west end. The aerial shows two towers
  there, each with its own roof and plant. The game drew both blocks side by side on the south slab, and the north slab
  as a generic four-storey block.
- *Correction.* Two ten-storey blocks, one on each slab, with glazed bridges over five levels between them. The
  bridges' spot along the gap is an estimate. The blue curtain wall covers the west part of the south block's road face
  and turns its west corner. The LED screen stands at its south-east corner.
- *Names.* The university's name runs along the south block's roof edge (IMG_9677 16-38 s). The towers' name sits on a
  raised frame on the north block (RW10, RW11).
- *Conflict 2 above.* Settled without moving any outline.

**The four-storey group.**
- *Finding.* Its OSM outlines lay 17-25 m east of the roofs.
- *Correction.* Reshaped on the aerial in `corrections.json`:
  - the red-roofed north block, osm:way/1009392437;
  - the green-roofed south block with its gallery wing, osm:way/394252216;
  - the long tan-roofed block, osm:way/394252217.
- *Excluded.* osm:way/394252218, which lay on the courtyard's lawn.
- *Moved.* The slate block (x 2141-2163, z -1077..-1043) and the fountain (2181, -1062) moved to the aerial's
  positions.
- *Facade.* White with open galleries and railings, doors and blue windows set back in their shade (IMG_9677 40-50 s),
  instead of plain blue windows.

**The stand and the grey-roofed block.**
- *Finding.* The mapped service way osm:way/1009392428 ran through the stand's seats and the grey-roofed block. With
  the road across the pitch gone, it was a dead end.
- *Correction.* The way is excluded. The stand stands against the courts' fence (x 2190.5-2201.4) with the walk
  between it and the pitch fence, as in the aerial. The grey-roofed block has its full length (x 2149-2215).

**Left as they are.**
- *KOKA.* The aerial shows a facade strip north of its roof, which may mean a lean of about 13 m. Its outline was not
  moved on that alone.
- *The small hipped house by the tower court.* Its roof is about 13 m west of its outline, but moving it would put it
  on the mapped road loop round it.

Route lengths identical, access unchanged. The route tests, the build and the smoke ride pass.

