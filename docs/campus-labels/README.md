# Campus labels and generic buildings (owner's two-part UG Campus Map reference, 2026-10-17)

The owner sent a two-part PDF (110 pages: 79 zoom-18 sections of the UG Campus Map site, street map above satellite, and
a table of 533 named places) and the section screenshots as a zip. Scope: inside the site's blue boundary only.

## What was checked

- **Roads and lanes.** All 67 road names of the reference were checked against the game's named roads at the
  reference's label point. 65 lie on a game road of the same name (within 0.8 m). The other two are
  "Haatso-Atomic Goil" (a fuel station mapped as a highway service area, not a road) and **Amerley Lane** (section
  78), which was added to OpenStreetMap after the game's snapshot of 2026-10-04 and could not be downloaded here
  (open item).
- **Places.** Every game place inside the boundary was compared with the reference label at the same spot. None
  carries a different building's name; the differences were spellings and the site's own titles.
- **The site's 95 markers.** The marker names come from the site's own titles, read from the satellite views where
  the PDF table had wrapped them. Every marker has a game place, but some use the map's shorter wording.

## Renamed to the site's titles

These are in `data/geography/registry/naming.json` (`rename`). The game code that looked them up by name (missions,
site models, entrances, corrections) was changed with them:

| was | now |
|---|---|
| Dep't of History | Department of History |
| Dep't of Sociology | Sociology Department |
| Psychology Department | Department of Psychology |
| Information Studies Department | Department of Information Studies |
| Political Science Department | Department of Political Science |
| School of Social Science | School of Social Sciences |
| Mathematics Dept | Department of Mathematics |
| Soil Science | Department of Soil Science |
| Statistics | Department of Statistics |
| Computer Science Dept | Department of Computer Science |
| Distance Education Center | School of Continuing and Distance Education |

## Site titles kept as search names

Where the street map prints another name on the building (for example "Graduate School, Legon" or "Frank Torto
Chemistry Building"), the game keeps that name. The marker's title becomes a search name for it, so typing either
name finds the place.

| marker title | game place |
|---|---|
| Akuafo Hall | Akuafo Hall Main |
| Balme Library | The Balme Library |
| Central Cafeteria | Central Cafeteria, CC |
| Centre for Climate Change and Sustainability Studies-C3SS | Centre for Climate Change and Sustainability Studies, C3SS |
| Department Of Economics | Department of Economics, University of Ghana |
| Department Of Family And Consumer Science | College of Agric and Consumer Science, Legon |
| Department Of History | Department of History |
| Department of Animal Biology | Department of Animal Biology and Conservation Science |
| Department of Chemistry | Frank Torto Chemistry Building |
| Department of Computer Science | Department of Computer Science |
| Department of Geography and Resource Development | Department of Geography and Resource Development, Legon |
| Department of Home Science | Home Science Annex |
| Department of Information Studies | Department of Information Studies |
| Department of Mathematics | Department of Mathematics |
| Department of Physics | Physics Department, University of Ghana |
| Department of Political Science | Department of Political Science |
| Department of Psychology | Department of Psychology |
| Department of Soil Science | Department of Soil Science |
| Department of Statistics | Department of Statistics |
| ECOWAS Coastal & Marine Resources Management Centre | ECOWAS Coastal & Marine Resources |
| Elizabeth Sey Hall | Elizabeth Frances Sey Hall |
| Institute of Statistical, Social and Economic Research(ISSER) | Institute of Statistical and Social and Economic Research (ISSER) Annex |
| International Student Hostel | International Students Hostel 1, ISH 1 |
| Jean Nelson Akah Hall | Jean Nelson Aka Hall |
| Legon Hall Annex | Legon Hall Annex B |
| Legon Hospital | University of Ghana Hospital |
| Mensah Sarbah Annex | Mensah Sarbah Annex C |
| Merian Institute for Advanced Studies in Africa (MIASA) | Merian Institute for Advanced Studies in Africa (MIASA) - Re |
| Mfodwo Complex/ N Block | N Block |
| New N Block | New N Block, NNB |
| Pent Hostel Block C | New Pent Block C |
| RS/GIS Lab | GIS Lab A2 |
| School of Continuing and Distance Education | School of Continuing and Distance Education |
| School of Graduate studies | Graduate School, Legon |
| School of Nursing and Midwifery | School Of Nursing and Midwifery |
| School of Social Sciences | School of Social Sciences |
| Sociology Department | Sociology Department |
| UG Banking Square | University of Ghana banking square |
| UG School of Law | School of Law |
| University of Ghana Business School | Business School |
| University of Ghana Sports Stadium | Sports Complex |
| Valco Trust Hostel | Valco Trust Hostel Phase 2 |

## New destinations (39)

Every non-road label of the reference that the game did not have is now a place. It shows in the start and destination
pickers, on the Map tab and in search. Each one comes from
`data/geography/sources/ug-campus-map-reference.json` and is added by `build-master.mjs` (the "every place the owner's
UG Campus Map reference shows" pass). These include the swimming pool, the courts, the car parks and the bus stops that
the old pipeline skipped as ground. Names are kept as the street map prints them. Two labels were left out: "generator",
which is a wastewater plant, and "Altectic Oval Basket ball court", a misspelt duplicate of the Athletic Oval
Basketball Court beside it.

| place | kind |
|---|---|
| Achimota Forest Reserve | other |
| All Needs Supermarket | other |
| Amazing Green Services | food |
| Association of African Universities | academic |
| Best Buy | other |
| Chartered Institute of Bankers (Ghana) | bank |
| Electricity Company of Ghana Ltd. Legon District | other |
| Filipo | food |
| Food Addict Gh | food |
| GMI Motors | other |
| Ghana Institute of Languages | academic |
| Ghana Standards Authority Head Office | other |
| Ghana Water Company Ltd. | other |
| Gonja Park | sport |
| High Tension | transport |
| Hilla Limann Basketball Court | sport |
| Ideal College | transport |
| International Students Hostel Car Park 2 | other |
| JSQ Sewage Pump Station | other |
| Jean Nelson Volleyball Court | sport |
| Jeason Nelson Basketball Court | sport |
| Kwapong Basketball Court | sport |
| LIC legon interdenominatinal church | other |
| Legon Medium Taxpayer Office | other |
| Legon Pool Side (University of Ghana) | sport |
| Living Room | food |
| Narnia FC Park | sport |
| Pilosoft Services | other |
| Presbyterian Boys' Senior High School | academic |
| Sey frontage | other |
| Shell (near School of Public Health) | other |
| The Institute of Chartered Accountants, Ghana | academic |
| Trinity Theological Seminary | academic |
| UGBS Car Parking Lot | other |
| UPSA | hall |
| University of Ghana Sports Stadium | sport |
| Vice Chancellors Ghana - Office Complex | other |
| Volta Car Park | other |
| lizalex | other |

## Generic buildings inside the boundary

`world.ts` `campusFinish` handles every outline inside the boundary that no site model replaces:

- **Doors.** Every such building gets a door on the wall that faces the nearest road or path. A long wall gets two
  doors. The door has a frame, a dark timber leaf and a step (`facades.ts` `doorsOn`, new `front`).
- **Height.** The order is: the map's or a photo's height first (`corrections.json` `heights`, OSM levels). Without
  one, the storeys follow the outline's size instead of the old random 7 or 10.5 m. Under 60 m² stays 3.6 m. From 60
  to 200 m² is one storey (staff bungalows, stores). From 200 to 1800 m² is two storeys. Over 1800 m² is three
  storeys. These are estimates. A flat map and a satellite photo do not give a building's height, so the owner's
  photos of a building still override them.
- **Shape.** The outlines are the map's own: the OSM footprints the street map draws, plus the satellite footprints
  where OSM has none.

## Open

- Amerley Lane (section 78) is not in the game's map snapshot.
- Building heights from the size rule are estimates until photos give the real number of floors.
