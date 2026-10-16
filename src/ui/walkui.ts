// The walking interface (the owner's Volume A): walking controls, "Ride bicycle", the nearby-buildings list for the
// local area, the small top-corner entrance popup (only on foot and only at an entrance), the hall's actions (Enter my
// room, Walk around the open common area, Leave), the blur into the allocated room, and in the room (2026-10-16):
// walking and looking, one action at a time for the part within reach, the room's residents, Leave room.
// Three things stay separate, as the brief asks: discovering a building (the list), targeting it (a marker), and
// entering at its entrance (the popup).
import type { Game } from '../game/Game';
import { ACCESS, PLACES, type PlaceKind } from '../game/campusmap';
import { RESIDENCES, allocate, categoriesFor, categoryById, residenceOfPlace, validAccommodation, type Accommodation, type Residence } from '../game/residence';
import { accommodationLabel } from './accommodation';
import { esc } from '../features/host';
import { localPlace, occupantsOf, type RoomPlace } from '../features/rooms';
import { bathScreen, laptopScreen, phoneScreen, sleepScreen, type ChatLine } from './roomscreens';
import * as live from '../live';
import * as cloud from '../cloud';
import type { Occupant } from '../game/roomplay';
import { LODGE_PLACEMENTS } from '../game/lodges';
import { COURT_HALLS } from '../game/gateways';
import { pad } from '../gamepad';
import { padPointer } from '../padpointer';

/** a place one can walk up to: a residence's entrance, or another building's mapped entrance */
interface Spot { key: string; name: string; at: [number, number]; residence?: Residence; entranceIndex?: number; kind: PlaceKind | 'residence' }
const OTHER_KINDS = new Set<PlaceKind>(['academic', 'landmark', 'hall', 'worship', 'food', 'bank', 'health', 'sport', 'other']);
let SPOTS: Spot[] | null = null;
function spots() {
  if (SPOTS) return SPOTS;
  SPOTS = [];
  for (const r of RESIDENCES) r.entrances.forEach((e, i) => SPOTS!.push({ key: e.id, name: r.entrances.length > 1 ? `${r.name} · ${e.label}` : r.name, at: e.at, residence: r, entranceIndex: i, kind: 'residence' }));
  for (const p of PLACES) {
    if (!OTHER_KINDS.has(p.kind) || residenceOfPlace(p.name)) continue;
    const a = ACCESS.get(p.name);
    if (!a || a.confidence === 'low') continue;
    SPOTS.push({ key: `place:${p.name}`, name: p.name, at: [a.entrance[0], a.entrance[1]], kind: p.kind });
  }
  return SPOTS;
}
/** the local area: the configurable radius round the walker the nearby list covers (a working value) */
export const LOCAL_RADIUS = 150;
const POPUP_IN = 4.5, POPUP_OUT = 7;

export interface WalkContext {
  app: HTMLElement;
  game: Game;
  accommodation: () => Accommodation | null | undefined;
  /** opens the accommodation chooser; calls back when saved */
  chooseAccommodation: (done: () => void) => void;
  /** back on the bike: the caller restores its riding controls */
  onRemount: () => void;
  toast: (text: string) => void;
  /** the player's place in their room (the shared allocation when signed in); saves an updated accommodation */
  claim: (acc: Accommodation) => Promise<{ acc: Accommodation; place: RoomPlace }>;
  /** the player's display name, for the residents list */
  youName: string;
  /** the character's id (the stable test room in each hall) */
  characterId?: string;
}
/** testing (the owner, 2026-10-16): every account can enter a room at every hall and hostel, whatever it chose at
 *  sign-up, to check each one. Turn off before the public launch. */
export const TEST_ALL_ROOMS = true;

export function startWalking(ctx: WalkContext) {
  const { app, game } = ctx;
  const root = document.createElement('div');
  root.className = 'walk-ui';
  root.innerHTML = `
    <div class="walk-pop" id="wPop" hidden><span class="grow" id="wPopT"></span><button class="btn btn-primary btn-sm" id="wPopGo">Enter</button><button class="wp-x" id="wPopX" aria-label="Dismiss">×</button></div>
    <div class="walk-pad" id="wPad">
      <p class="fp-hint">Walk: hold ↑ (W) · turn ← → (A / D) · ↓ (S) back</p>
      <div class="wp-top"><button class="fp-btn" id="wNear">Nearby</button><button class="fp-btn" id="wRide">Ride bicycle</button></div>
      <div class="fp-steer"><button class="fp-btn" id="wL" aria-label="Turn left">◀</button><button class="fp-btn" id="wR" aria-label="Turn right">▶</button></div>
      <div class="fp-feet"><button class="fp-btn" id="wB">Back</button><button class="fp-btn fp-go" id="wF">Walk</button></div>
    </div>
    <div class="walk-list" id="wList" hidden></div>
    <div class="walk-hall" id="wHall" hidden></div>
    <div class="walk-room" id="wRoom" hidden></div>`;
  app.appendChild(root);
  const $ = <T extends HTMLElement>(id: string) => root.querySelector<T>('#' + id)!;
  const held = { f: false, b: false, l: false, r: false, sl: false, sr: false };
  const apply = () => { game.walkInput.fwd = (held.f ? 1 : 0) - (held.b ? 1 : 0); game.walkInput.turn = (held.r ? 1 : 0) - (held.l ? 1 : 0); game.walkInput.strafe = (held.sr ? 1 : 0) - (held.sl ? 1 : 0); };
  const hold = (id: string, k: keyof typeof held) => {
    const b = $(id), set = (v: boolean) => (e: Event) => { e.preventDefault(); e.stopPropagation(); held[k] = v; b.classList.toggle('on', v); apply(); };
    b.addEventListener('pointerdown', set(true));
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, set(false));
  };
  hold('wF', 'f'); hold('wB', 'b'); hold('wL', 'l'); hold('wR', 'r');
  for (const ev of ['pointerdown', 'touchstart'] as const) root.addEventListener(ev, (e) => e.stopPropagation());

  // ----- state -----
  let mode: 'walk' | 'hall' | 'room' = 'walk';
  let near: Spot | null = null, dismissed: string | null = null, target: Spot | null = null, busy = false;
  let hallSpot: Spot | null = null;

  const keys = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    const on = e.type === 'keydown';
    if (mode === 'room' && screenOpen) return;
    if (mode === 'room') {
      // W / S or ↑ / ↓ walk, A / D step sideways, ← / → turn, PageUp / PageDown look up and down, E or Enter: the action
      if (e.code === 'ArrowUp' || e.code === 'KeyW') held.f = on;
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') held.b = on;
      else if (e.code === 'KeyA') held.sl = on;
      else if (e.code === 'KeyD') held.sr = on;
      else if (e.code === 'ArrowLeft' || e.code === 'KeyQ') held.l = on;
      else if (e.code === 'ArrowRight') held.r = on;
      else if (e.code === 'PageUp') game.roomLook.y = on ? -1 : 0;
      else if (e.code === 'PageDown') game.roomLook.y = on ? 1 : 0;
      else if (on && !e.repeat && (e.code === 'KeyE' || e.code === 'Enter')) act();
      else if (on && !e.repeat && e.code === 'KeyV') toggleRoomView();
      else if (on && !e.repeat && e.code === 'KeyF') doActivity();
      else return;
      e.preventDefault(); apply(); return;
    }
    if (mode !== 'walk') return;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') held.f = on;
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') held.b = on;
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA') held.l = on;
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') held.r = on;
    else if (on && e.code === 'Enter' && near && !$('wPop').hidden) { enter(); }
    else return;
    e.preventDefault(); apply();
  };
  addEventListener('keydown', keys); addEventListener('keyup', keys);

  // drag to look round the room
  let drag: { x: number; y: number } | null = null;
  const canvas = app.querySelector('canvas') ?? document.querySelector('canvas');
  let pressAt: { x: number; y: number } | null = null;
  const down = (e: PointerEvent) => { if (mode === 'room' && !screenOpen && e.target === canvas) { drag = { x: e.clientX, y: e.clientY }; pressAt = { x: e.clientX, y: e.clientY }; } };
  const move = (e: PointerEvent) => { if (!drag || mode !== 'room') return; game.turnRoom((e.clientX - drag.x) * 0.006, (e.clientY - drag.y) * 0.005); drag = { x: e.clientX, y: e.clientY }; };
  const up = (e: PointerEvent) => {
    drag = null;
    if (pressAt && mode === 'room' && Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) < 6) { const o = game.roomOccupantAt(e.clientX, e.clientY); if (o) openPhone(o); }
    pressAt = null;
  };
  addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up);

  // ----- the nearby list (the local area) -----
  const rel = (s: Spot) => {
    const p = game.footXZ!, yaw = game.footYaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const tx = s.at[0] - p[0], tz = s.at[1] - p[1], d = Math.hypot(tx, tz) || 1;
    const ahead = (fx * tx + fz * tz) / d, right = (-fz * tx + fx * tz) / d;
    const dir = ahead > 0.7 ? 'ahead' : ahead < -0.7 ? 'behind you' : right > 0 ? 'on your right' : 'on your left';
    return { d, dir };
  };
  const listNearby = () => {
    const p = game.footXZ; if (!p) return [];
    return spots().map((s) => ({ s, d: Math.hypot(s.at[0] - p[0], s.at[1] - p[1]) })).filter((x) => x.d < LOCAL_RADIUS).sort((a, b) => a.d - b.d).slice(0, 12).map((x) => x.s);
  };
  const showList = () => {
    const L = $('wList'), items = listNearby();
    L.hidden = false;
    L.innerHTML = `<div class="wl-head"><b>Nearby</b><button class="wp-x" id="wLX" aria-label="Close">×</button></div>
      ${items.length ? items.map((s) => { const r = rel(s); return `<button class="wl-item ${target?.key === s.key ? 'on' : ''}" data-k="${esc(s.key)}"><b>${esc(s.name)}</b><small>${s.residence ? 'Hall / hostel' : s.kind === 'academic' ? 'Department' : 'Building'} · ${Math.round(r.d)} m ${r.dir}</small></button>`; }).join('') : '<p class="muted small">No mapped entrances in this area.</p>'}
      <p class="muted small">Choosing one marks it: walk to its entrance to go in.</p>`;
    L.querySelector('#wLX')!.addEventListener('click', () => { L.hidden = true; });
    L.querySelectorAll<HTMLElement>('[data-k]').forEach((b) => b.addEventListener('click', () => {
      const s = items.find((x) => x.key === b.dataset.k)!;
      target = target?.key === s.key ? null : s;
      game.setBeacon(target ? target.at : null);
      showList();
    }));
  };
  $('wNear').addEventListener('click', () => ($('wList').hidden ? showList() : ($('wList').hidden = true)));
  $('wRide').addEventListener('click', () => {
    const r = game.rideBike();
    if (!r.ok) return ctx.toast(r.reason ?? 'Walk back to your bike.');
    stop();
    ctx.onRemount();
  });

  // ----- the entrance popup -----
  const enter = () => {
    if (!near || busy) return;
    const s = near;
    $('wPop').hidden = true;
    if (!s.residence) {
      // a department or other building: no interior is modelled (the brief excludes departmental interiors)
      ctx.toast(`${s.name}: there is no interior to visit here. You can walk round the outside.`);
      dismissed = s.key;
      return;
    }
    hallSpot = s;
    mode = 'hall';
    held.f = held.b = held.l = held.r = held.sl = held.sr = false; apply();
    if (s.residence.lodge === 'L01') game.showLobby(true);
    hallPanel();
  };
  $('wPopGo').addEventListener('click', enter);
  $('wPopX').addEventListener('click', () => { if (near) dismissed = near.key; $('wPop').hidden = true; });

  // ----- the hall's actions -----
  const hallPanel = () => {
    const s = hallSpot!, r = s.residence!, acc = ctx.accommodation(), H = $('wHall');
    $('wPad').hidden = true; $('wList').hidden = true;
    const mine = acc && validAccommodation(acc) && acc.buildingId === r.id;
    const blockOf = r.blocks && r.entrances.length === r.blocks.length && s.entranceIndex !== undefined ? r.blocks[s.entranceIndex] : null;
    const wrongBlock = mine && blockOf && acc!.blockId !== blockOf.id ? r.blocks!.find((b) => b.id === acc!.blockId) : null;
    // what the entrance has, as built: the reception, a modelled or placed lodge, the main hall's lodge, or none yet
    const lp = LODGE_PLACEMENTS.find((x) => x.residence === r.id && x.entrance === r.entrances[s.entranceIndex ?? 0]?.id);
    const lodge = r.lodge === 'L01' ? "the porter's reception (L01)"
      : r.lodgeAt ? `the annex: its porter's lodge is at ${RESIDENCES.find((x) => x.id === r.lodgeAt)?.name ?? 'the main hall'}'s main entrance`
      : lp?.status === 'existing gatehouse reused' || lp?.status === 'built' ? "the gate: the porter's lodge is just inside"
      : 'the entrance (its porter\'s lodge position is not confirmed yet)';
    // testing: a room of each type this entrance offers, for every account
    const block = blockOf?.id ?? (r.blocks ? r.blocks[0].id : undefined);
    const testCats = TEST_ALL_ROOMS ? categoriesFor(r, block).filter((c) => !c.unresolved) : [];
    H.hidden = false;
    H.innerHTML = `<div class="panel">
      <p class="kicker">${esc(r.name)}</p>
      <h2 class="title" style="font-size:1.25rem">What would you like to do?</h2>
      <p class="muted small">You are at ${esc(lodge)}.</p>
      ${mine && !wrongBlock ? `<button class="btn btn-primary" id="hRoom">Enter my room</button><p class="muted small">${esc(accommodationLabel(acc))}</p>`
        : wrongBlock ? `<p class="small">Your room is in ${esc(wrongBlock.name)}: walk to its entrance.</p>`
        : `<p class="small">${acc ? `Your accommodation is ${esc(accommodationLabel(acc))}, not here.` : 'You have not chosen where you stay yet.'}</p>${TEST_ALL_ROOMS ? '' : '<button class="btn btn-ghost" id="hSet">Set my accommodation</button>'}`}
      ${testCats.length ? `<div class="hall-test"><p class="muted small">Testing: every hall's rooms are open to you.</p>
        <label class="small">Room type <select id="hCat">${testCats.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('')}</select></label>
        <button class="btn ${mine && !wrongBlock ? 'btn-ghost' : 'btn-primary'}" id="hTest">Enter a room here</button></div>` : ''}
      <button class="btn btn-ghost" id="hCommon">Walk in through the gate</button>
      <button class="btn btn-link" id="hLeave">Leave</button></div>`;
    H.querySelector('#hRoom')?.addEventListener('click', () => enterRoom(acc!));
    H.querySelector('#hSet')?.addEventListener('click', () => ctx.chooseAccommodation(() => hallPanel()));
    H.querySelector('#hTest')?.addEventListener('click', () => {
      const cat = (H.querySelector('#hCat') as HTMLSelectElement).value;
      const a = allocate(ctx.characterId ?? 'tester', r.id, cat, block);
      if (!a) return ctx.toast('That room type has no room here.');
      enterRoom(a, true);
    });
    H.querySelector('#hCommon')!.addEventListener('click', () => {
      backToWalk();
      if (hallSpot) dismissed = hallSpot.key;
      ctx.toast(COURT_HALLS.has(r.id) ? `The gate opens as you come near: walk on through the passage, past the porter's lodge, into the courtyard.` : `The gate opens as you come near: walk on in.`);
    });
    H.querySelector('#hLeave')!.addEventListener('click', () => { backToWalk(); if (hallSpot) dismissed = hallSpot.key; });
    requestAnimationFrame(() => (H.querySelector<HTMLElement>('#hRoom, #hTest') ?? null)?.focus({ preventScroll: true }));
  };
  const backToWalk = () => {
    game.showLobby(false);
    mode = 'walk';
    $('wHall').hidden = true; $('wRoom').hidden = true; $('wPad').hidden = false;
  };

  // ----- the room: blur out, swap, blur in -----
  const blur = (on: boolean) => { if (canvas instanceof HTMLElement) { canvas.style.transition = 'filter .35s ease'; canvas.style.filter = on ? 'blur(14px) brightness(1.1)' : ''; } };
  let place: RoomPlace | null = null;
  const enterRoom = (acc0: Accommodation, test = false) => {
    if (busy) return;
    busy = true;
    $('wHall').hidden = true;
    blur(true);
    // the place (and the roommates) first: the shared allocation when signed in (a test room is local: the player's
    // real place is not moved)
    const claimed = test ? Promise.resolve({ acc: acc0, place: localPlace(acc0, 'Testing: this room is not your allocated one; its other beds are NPCs.') }) : ctx.claim(acc0);
    Promise.all([claimed, new Promise((r) => setTimeout(r, 380))]).then(([res]) => {
      const { acc } = res as { acc: Accommodation; place: RoomPlace };
      place = (res as { place: RoomPlace }).place;
      game.showLobby(false);
      const key = `${acc.buildingId}|${acc.blockId ?? ''}|${place.roomId}`;
      const r = game.enterRoom({ ...acc, roomId: place.roomId }, occupantsOf(place, key, ctx.youName), key);
      if (!r.ok) { blur(false); busy = false; ctx.toast(r.reason ?? 'The room could not be shown.'); hallPanel(); return; }
      mode = 'room';
      held.f = held.b = held.l = held.r = held.sl = held.sr = false; apply();
      roomKey = key;
      roomHud(acc);
      if (place.source === 'cloud') void joinRoomChannel(key);
      requestAnimationFrame(() => requestAnimationFrame(() => { blur(false); busy = false; }));
    });
  };
  // ----- the room's activities and people -----
  let roomKey = '', screenOpen: HTMLElement | null = null;
  const act = () => {
    if (screenOpen || busy) return;
    const label = game.roomInteract();
    if (label) { $('rAct').textContent = label; return; }
    doActivity();
  };
  /** the activity in reach (sleep, study, bath): its own button beside the use button */
  const doActivity = () => {
    if (screenOpen || busy) return;
    const a = game.roomAction;
    if (!a) return;
    held.f = held.b = held.l = held.r = held.sl = held.sr = false; apply();
    game.roomBegin(a);
    const done = () => { screenOpen = null; game.roomBegin(null); };
    if (a.kind === 'sleep') screenOpen = sleepScreen(done);
    else if (a.kind === 'bath') screenOpen = bathScreen(a.spot?.kind === 'door', done);
    else if (a.kind === 'study') {
      // the character sits down at the desk; then the laptop fills the screen
      screenOpen = document.createElement('div');
      setTimeout(() => { screenOpen = laptopScreen(done); }, 900);
    }
  };
  const toggleRoomView = () => {
    const v = game.toggleRoomView();
    const b = root.querySelector<HTMLElement>('#rView');
    if (v && b) b.textContent = v === 'eye' ? 'Character view' : 'Eye view';
  };
  // a real roommate who is in the room: their presence on the room's live channel, and messages by phone
  let chan: live.Channel | null = null, present = new Set<string>();
  const chats = new Map<string, ChatLine[]>();
  let phone: { id: string; redraw: () => void } | null = null;
  const occupants = (): Occupant[] => occupantsOf(place!, roomKey, ctx.youName).map((o) => (o.kind === 'player' ? { ...o, online: !!o.id && present.has(o.id) } : o));
  const joinRoomChannel = async (key: string) => {
    const me = cloud.account?.id;
    if (!me) return;
    chan = await live.join(`room:${key}`, me, { name: ctx.youName });
    if (!chan || mode !== 'room') { chan?.leave(); chan = null; return; }
    chan.onPeers((peers) => { present = new Set(peers.map((p) => p.key)); game.setRoomOccupants(occupants()); drawWho(); });
    chan.on('msg', (m: { from: string; to: string; text: string }) => {
      if (m.to !== me) return;
      const lines = chats.get(m.from) ?? []; lines.push({ me: false, text: m.text, at: Date.now() }); chats.set(m.from, lines);
      if (phone?.id === m.from) phone.redraw();
      else ctx.toast(`${place?.residents.find((r) => r.id === m.from)?.name ?? 'Your roommate'}: ${m.text.slice(0, 60)} (tap them to reply)`);
    });
  };
  const openPhone = (o: Occupant) => {
    if (!o.id || screenOpen || !chan) return;
    const lines = chats.get(o.id) ?? []; chats.set(o.id, lines);
    const me = cloud.account?.id;
    const ph = phoneScreen(o.name, lines, (text) => chan?.send('msg', { from: me, to: o.id, text }), () => { phone = null; screenOpen = null; });
    phone = { id: o.id, redraw: ph.redraw };
    screenOpen = ph.el;
  };
  const leaveChannel = () => { chan?.leave(); chan = null; present = new Set(); };
  const ACT_TEXT: Record<string, string> = { sleep: 'sleeping', study: 'studying at the desk', cook: 'cooking', bath: 'having a bath', read: 'reading in bed', stand: 'in the room' };
  const drawWho = () => {
    const ul = root.querySelector<HTMLElement>('#rWho'), p = place;
    if (!ul || !p) return;
    const acts = game.roomActivities;
    ul.innerHTML = Array.from({ length: p.capacity }, (_, bed) => {
      const r = p.residents.find((x) => x.bed === bed);
      if (r?.you) return `<li>Bed ${bed + 1}: <b>You</b></li>`;
      if (r) { const here = !!r.id && present.has(r.id); return `<li>Bed ${bed + 1}: ${esc(r.name)} <small class="muted">(player${here ? ', in the room' : ', away'})</small>${here ? ` <button class="btn btn-sm btn-ghost" data-msg="${esc(r.id!)}">Message</button>` : ''}</li>`; }
      return `<li>Bed ${bed + 1}: <span class="muted">NPC roommate · ${ACT_TEXT[acts?.get(bed) ?? 'sleep']}</span></li>`;
    }).join('');
    ul.querySelectorAll<HTMLElement>('[data-msg]').forEach((b) => b.addEventListener('click', () => { const o = occupants().find((x) => x.id === b.dataset.msg); if (o) openPhone(o); }));
  };
  const roomHud = (acc: Accommodation) => {
    const R = $('wRoom'), c = categoryById(acc.categoryId)!, p = place!;
    R.hidden = false;
    R.innerHTML = `<div class="wr-top"><b>Room ${esc(p.roomId)}</b><small>${esc(accommodationLabel({ ...acc, roomId: p.roomId }).replace(/ · Room \S+$/, ''))}</small>
        <details class="wr-who"><summary>${p.capacity === 1 ? 'Single room' : `${p.capacity} residents`}${p.source === 'local' ? ' · NPC roommates' : ''}</summary><ul id="rWho"></ul>${p.note ? `<p class="muted small">${esc(p.note)}</p>` : ''}</details>
        <small class="muted">${c.evidence === 'adapted' ? 'Adapted design' : 'Reference-led design'} · W/S walk · A/D step · ←/→ turn · drag to look · E: use · F: sleep / study / bath · V: view · click a roommate to message them</small></div>
      <button class="fp-btn wr-act" id="rAct" hidden></button>
      <button class="fp-btn wr-do" id="rDo" hidden></button>
      <button class="fp-btn wr-view" id="rView">Character view</button>
      <div class="walk-pad wr-pad">
        <div class="fp-steer"><button class="fp-btn" id="rL" aria-label="Turn left">◀</button><button class="fp-btn" id="rR" aria-label="Turn right">▶</button></div>
        <div class="fp-feet"><button class="fp-btn" id="rB">Back</button><button class="fp-btn fp-go" id="rF">Walk</button></div>
      </div>
      <div class="wr-foot"><button class="fp-btn" id="rLeave">Leave room</button></div>`;
    hold2(R, 'rF', 'f'); hold2(R, 'rB', 'b'); hold2(R, 'rL', 'l'); hold2(R, 'rR', 'r');
    R.querySelector('#rAct')!.addEventListener('click', act);
    R.querySelector('#rDo')!.addEventListener('click', doActivity);
    R.querySelector('#rView')!.addEventListener('click', toggleRoomView);
    R.querySelector('#rLeave')!.addEventListener('click', leaveRoom);
    drawWho();
  };
  const hold2 = (host: HTMLElement, id: string, k: keyof typeof held) => {
    const b = host.querySelector<HTMLElement>('#' + id)!, set = (v: boolean) => (e: Event) => { e.preventDefault(); e.stopPropagation(); held[k] = v; b.classList.toggle('on', v); apply(); };
    b.addEventListener('pointerdown', set(true));
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, set(false));
  };
  const leaveRoom = () => {
    if (busy) return;
    busy = true;
    blur(true);
    leaveChannel();
    screenOpen?.remove(); screenOpen = null; phone = null;
    setTimeout(() => {
      game.leaveRoom();
      game.roomLook.x = game.roomLook.y = 0;
      held.f = held.b = held.l = held.r = held.sl = held.sr = false; apply();
      $('wRoom').hidden = true;
      mode = 'hall';
      hallPanel();
      requestAnimationFrame(() => { blur(false); busy = false; });
    }, 380);
  };

  // ----- the controller (gamepad.ts, so the dead zones and any remap apply): on foot the left stick walks (pushed
  // forward forward, pulled back backwards) and turns; in the room it walks and steps sideways, the right stick looks,
  // the bottom face button uses the part in reach, the camera button switches between the eyes and the character ----
  let padUsed = false;
  const padOff = pad.onFrame((f) => {
    if (!f || pad.capturing || pad.mode !== 'pad') { if (padUsed) { padUsed = false; apply(); } return; }
    const free = !held.f && !held.b && !held.l && !held.r && !held.sl && !held.sr;
    if (mode === 'walk' && free) { game.walkInput.fwd = -f.ly; game.walkInput.turn = f.lx; game.walkInput.strafe = 0; padUsed = true; }
    if (mode === 'room') {
      if (free) { game.walkInput.fwd = -f.ly; game.walkInput.strafe = f.lx; game.walkInput.turn = 0; padUsed = true; }
      game.roomLook.x = f.rx; game.roomLook.y = f.ry;
      const screen = document.querySelector('.room-screen:not([hidden])');
      if (!screen && !padPointer.overClickable() && f.actPressed('confirm')) act();
      if (!screen && f.pressed('west')) doActivity();
      if (!screen && f.actPressed('camera')) toggleRoomView();
    }
  });
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (mode === 'room') {
      // the use button (open or close what is in reach) and, beside it, the activity (sleep, study, bath)
      const f = game.roomInfo?.focus, a = game.roomAction, b = root.querySelector<HTMLElement>('#rAct'), d = root.querySelector<HTMLElement>('#rDo');
      const use = f ?? a;
      if (b) { b.hidden = !use || !!screenOpen; if (use && b.textContent !== use.label) b.textContent = use.label; }
      if (d) { d.hidden = !f || !a || !!screenOpen; if (f && a && d.textContent !== a.label) d.textContent = a.label; }
    }
    if (mode !== 'walk' || !game.walking) { $('wPop').hidden = true; return; }
    const p = game.footXZ!;
    // the nearest entrance within reach; hysteresis so the popup does not flicker at the edge
    let best: Spot | null = null, bd = Infinity;
    for (const s of spots()) { const d = Math.hypot(s.at[0] - p[0], s.at[1] - p[1]); if (d < bd) { bd = d; best = s; } }
    if (near && Math.hypot(near.at[0] - p[0], near.at[1] - p[1]) > POPUP_OUT) { if (dismissed === near.key) dismissed = null; near = null; }
    if (!near && best && bd < POPUP_IN) near = best;
    const show = !!near && dismissed !== near.key;
    if (show) $('wPopT').textContent = `Enter ${near!.name}?`;
    $('wPop').hidden = !show;
    // the ride-bicycle button only beside the bike
    const [bx, bz] = game.bikeXZ;
    $('wRide').classList.toggle('dim', Math.hypot(bx - p[0], bz - p[1]) > 3);
  };
  raf = requestAnimationFrame(tick);

  function stop() {
    cancelAnimationFrame(raf);
    padOff();
    leaveChannel();
    screenOpen?.remove();
    removeEventListener('keydown', keys); removeEventListener('keyup', keys);
    removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up);
    game.walkInput.fwd = game.walkInput.turn = game.walkInput.strafe = 0;
    game.setBeacon(null);
    blur(false);
    root.remove();
  }
  return { stop, get mode() { return mode; } };
}
