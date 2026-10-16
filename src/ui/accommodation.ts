// The accommodation choice in signup and the profile (the owner's Volume A section 17: hall or hostel first, then its
// block, then only the room categories that place offers). Changing the hall or block clears an incompatible choice;
// the saved value is the validated stable category ID, resolved to a stable private room (residence.ts allocate).
import { RESIDENCES, allocate, categoriesFor, categoryById, residenceById, type Accommodation, type RoomCategory } from '../game/residence';
import { esc } from '../features/host';

const facilities = (c: RoomCategory) => [
  c.bath === 'private' ? 'own bathroom' : c.bath === 'shared' ? 'shared bathrooms' : '',
  c.kitchen === 'private' ? 'kitchenette' : c.kitchen === 'communal' ? 'communal kitchen' : '',
  c.ac === 'with' ? 'AC' : c.ac === 'without' ? 'no AC' : '',
  c.balcony ? 'balcony' : '',
].filter(Boolean).join(' · ');

/** a one-line summary of an accommodation, for the profile and the room view */
export function accommodationLabel(a: Accommodation | null | undefined) {
  if (!a) return 'Not set';
  const r = residenceById(a.buildingId), c = categoryById(a.categoryId), b = r?.blocks?.find((x) => x.id === a.blockId);
  return `${r?.name ?? '?'}${b ? `, ${b.name}` : ''} · ${c?.label ?? '?'} · Room ${a.roomId}`;
}

/**
 * Renders the three choices into `host`. `onChange` gets the resolved accommodation (or null while incomplete).
 * characterId: the stable identity the room is derived from (the same character and choice give the same room).
 */
export function accommodationForm(host: HTMLElement, current: Accommodation | null | undefined, characterId: string, onChange: (a: Accommodation | null) => void) {
  let building = current?.buildingId ?? '', block = current?.blockId ?? '', category = current?.categoryId ?? '';
  const draw = () => {
    const r = residenceById(building);
    const cats = r ? categoriesFor(r, r.blocks ? block || undefined : undefined) : [];
    // a stale choice the newly chosen place does not offer is cleared, never saved
    if (category && !cats.some((c) => c.id === category && !c.unresolved)) category = '';
    host.innerHTML = `
      <label class="ob-field"><span class="grow"><span class="ob-l">Hall or hostel</span>
        <select id="acB"><option value="">I don't stay in a hall or hostel</option>${RESIDENCES.map((x) => `<option value="${x.id}" ${x.id === building ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></span></label>
      ${r?.blocks ? `<label class="ob-field"><span class="grow"><span class="ob-l">Block</span>
        <select id="acK"><option value="">Choose the block</option>${r.blocks.map((b) => `<option value="${b.id}" ${b.id === block ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></span></label>` : ''}
      ${r && (!r.blocks || block) ? `<p class="ob-label">Room type</p><div class="opt-grid" id="acC">${cats.map((c) => `<button type="button" class="opt row ${c.id === category ? 'on' : ''}" data-v="${c.id}" ${c.unresolved ? 'disabled' : ''}>
          <span class="grow" style="text-align:left"><b>${esc(c.label)}</b><small class="muted" style="display:block">${c.unresolved ? esc(c.unresolved) : `${c.capacity} ${c.capacity === 1 ? 'person' : 'people'}${facilities(c) ? ' · ' + facilities(c) : ''}`}</small></span></button>`).join('')}</div>` : ''}
      ${r?.note ? `<p class="muted small">${esc(r.note)}</p>` : ''}`;
    host.querySelector('#acB')?.addEventListener('change', (e) => { building = (e.target as HTMLSelectElement).value; block = ''; category = ''; draw(); });
    host.querySelector('#acK')?.addEventListener('change', (e) => { block = (e.target as HTMLSelectElement).value; category = ''; draw(); });
    host.querySelectorAll<HTMLElement>('#acC [data-v]').forEach((el) => el.addEventListener('click', () => { category = el.dataset.v!; draw(); }));
    onChange(building && category ? allocate(characterId, building, category, block || undefined) : null);
  };
  draw();
  /** whether the form is complete or deliberately empty ("I don't stay in a hall or hostel") */
  return { empty: () => !building, complete: () => !!(building && category) };
}
