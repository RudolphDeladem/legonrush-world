// Checks for the walking and accommodation feature's data (the owner's Volume A sections 16-24, Volume B pages 25,
// 75): every category's sleeping places, the two-single and two-bunk rules, brown wood in the traditional groups,
// paint per building, the lodge families, stable allocation and validation of stale selections.
import { CATEGORIES, LAYOUTS, PAINT, RESIDENCES, allocate, categoriesFor, residenceById, sleepingPlaces, validAccommodation } from '../src/game/residence';
const fail: string[] = [];
const ok = (c: unknown, msg: string) => { if (!c) fail.push(msg); };
for (const c of CATEGORIES) {
  const l = LAYOUTS[c.layout], singles = l.objects.filter((o) => o.type === 'bed').length, bunks = l.objects.filter((o) => o.type === 'bunk').length;
  ok(l, `${c.id}: layout ${c.layout} missing`);
  if (c.unresolved) continue;
  ok(sleepingPlaces(l) === c.capacity, `${c.id}: ${sleepingPlaces(l)} places for capacity ${c.capacity}`);
  if (c.capacity === 2) ok(singles === 2 && bunks === 0, `${c.id}: two-person room must have two single beds`);
  if (c.capacity === 4) ok(singles === 0 && bunks === 2, `${c.id}: four-person room must have two bunk units`);
  if (['traditional', 'annex', 'jubilee'].includes(c.catalogue)) ok(c.wood === true, `${c.id}: traditional beds must be brown wood`);
  if (c.id === 'trad-1' || c.id === 'jub-1') ok(c.layout === 'R14', `${c.id}: the traditional single is the small inner chamber`);
  if (c.id === 'trad-3' || c.id === 'jub-3') { const l3 = LAYOUTS[c.layout]; ok(l3.rooms.length === 2, `${c.id}: two outer + one inner`); }
}
const paint = (id: string) => residenceById(id)!.paint;
for (const id of ['jean-nelson', 'limann', 'sey', 'kwapong', 'diamond-jubilee', 'commonwealth', 'new-pent', 'old-pent', 'vikings', 'akuafo', 'akuafo-annexes', 'sarbah', 'sarbah-annexes', 'legon', 'legon-annexes', 'volta', 'volta-annex', 'ish-1', 'ish-2', 'jubilee', 'valco-1', 'valco-2']) ok(paint(id) === 'white', `${id}: white rooms`);
ok(paint('bani') === 'blue', 'Bani blue'); ok(paint('evandy') === 'cream', 'Evandy cream'); ok(paint('tf') === 'pending', 'TF pending');
ok(PAINT.pending !== PAINT.white, 'TF must not inherit white');
const fam = (id: string) => residenceById(id)!.lodge;
ok(['jean-nelson', 'limann', 'sey', 'diamond-jubilee', 'kwapong'].every((i) => fam(i) === 'L01'), 'L01 Diaspora group');
ok(fam('diamond-jubilee') !== fam('jubilee') && fam('jubilee') === 'L10', 'Diamond Jubilee and Jubilee kept apart');
ok(fam('new-pent') === 'L04' && fam('old-pent') === 'L05', 'New / Old Pent apart');
ok(fam('akuafo') === 'L03' && fam('akuafo-annexes') === 'L13' && fam('sarbah') === 'L02' && fam('sarbah-annexes') === 'L13', 'mains and annexes apart');
ok(fam('ish-1') === 'L09' && fam('ish-2') === 'L09', 'ISH 1 and 2 L09');
ok(fam('volta-annex') === null, 'Volta annex lodge pending');
ok(RESIDENCES.every((r) => r.entrances.length > 0), 'every residence has an entrance');
// allocation: stable, validated, stale choices refused
const a1 = allocate('kofi', 'valco-1', 'valco-1'), a2 = allocate('kofi', 'valco-1', 'valco-1');
ok(a1 && a2 && a1.roomId === a2.roomId && a1.kitchenGroupId, 'Valco: stable room and a kitchen group');
ok(!allocate('kofi', 'evandy', 'ev-4', 'annex-a'), 'Evandy Annex A has no four-person category');
ok(!allocate('kofi', 'old-pent', 'np-2'), 'a New Pent category is refused at Old Pent');
ok(!allocate('kofi', 'jubilee', 'jub-flat-2-1', 'main'), '2-1 stays unresolved');
ok(!validAccommodation({ buildingId: 'bani', categoryId: 'bani-4', blockId: 'f', roomId: 'x', v: 1 }), 'block-checked');
ok(categoriesFor(residenceById('new-pent')!, 'a').every((c) => c.capacity !== 3), 'New Pent has no three-person category');
ok(categoriesFor(residenceById('vikings')!).every((c) => c.capacity !== 3), 'Vikings has no three-person category');
ok(categoriesFor(residenceById('jubilee')!, 'w').some((c) => c.capacity === 5), 'Jubilee converted five');
ok(categoriesFor(residenceById('tf')!).some((c) => c.capacity === 8) && categoriesFor(residenceById('ish-1')!).some((c) => c.capacity === 8), 'TF and ISH eight');
ok(!RESIDENCES.filter((r) => !['jubilee', 'tf', 'ish-1', 'ish-2'].includes(r.id)).some((r) => categoriesFor(r, r.blocks?.[0].id).some((c) => c.capacity >= 5)), 'higher occupancies only where the sources give them');
if (fail.length) { console.log('room tests FAILED\n' + fail.join('\n')); process.exit(1); }
console.log(`room tests: ok (${CATEGORIES.length} categories, ${RESIDENCES.length} residences)`);
