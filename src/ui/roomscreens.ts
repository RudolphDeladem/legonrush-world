// The room's full-screen moments (the owner, 2026-10-16): sleeping in one's bed, studying at the desk on a laptop that
// fills the screen (a monitor with its frame showing, a desktop with files about the University of Ghana's history to
// open and read, and "Shut down"), taking a bath, and a phone's messaging app for a real roommate who is in the room.
// Each is a `.room-screen` (the controller's D-pad moves between its buttons, the face button chooses; padmenu.ts).
import { esc } from '../features/host';

const screen = (cls: string, html: string) => {
  const el = document.createElement('div');
  el.className = `room-screen ${cls}`;
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
};

/** asleep: the room dims, the hours pass; Wake up gets up again */
export function sleepScreen(onWake: () => void) {
  const el = screen('rs-sleep', `<div class="rs-mid"><div class="rs-moon">☾</div><p class="rs-big">Sleeping…</p><p class="rs-clock" id="rsClock"></p><button class="btn btn-primary" id="rsWake">Wake up</button></div>`);
  const start = Date.now(), clock = el.querySelector<HTMLElement>('#rsClock')!;
  // seven hours pass in about twenty seconds
  const t0 = 22 * 60 + 30;
  const tick = setInterval(() => {
    const m = Math.min(7 * 60, ((Date.now() - start) / 20000) * 7 * 60), mm = Math.round(t0 + m) % (24 * 60);
    clock.textContent = `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}${m >= 7 * 60 ? ' · rested' : ''}`;
  }, 200);
  el.querySelector('#rsWake')!.addEventListener('click', () => { clearInterval(tick); el.remove(); onWake(); });
  return el;
}

/** a bath: the shower runs a few seconds (the shared washroom: down the corridor and back) */
export function bathScreen(shared: boolean, onDone: () => void) {
  const el = screen('rs-bath', `<div class="rs-drops">${Array.from({ length: 40 }, (_, i) => `<i style="left:${(i * 37) % 100}%;animation-delay:${(i * 0.13) % 1.2}s"></i>`).join('')}</div>
    <div class="rs-mid"><p class="rs-big">${shared ? 'At the washroom down the corridor…' : 'Taking a bath…'}</p><div class="rs-bar"><b id="rsBar"></b></div><button class="btn btn-primary" id="rsDone" disabled>Done</button></div>`);
  const bar = el.querySelector<HTMLElement>('#rsBar')!, done = el.querySelector<HTMLButtonElement>('#rsDone')!, start = Date.now();
  const tick = setInterval(() => {
    const k = Math.min(1, (Date.now() - start) / 6000);
    bar.style.width = `${k * 100}%`;
    if (k >= 1) { clearInterval(tick); done.disabled = false; done.textContent = 'Fresh: back to the room'; done.focus(); }
  }, 100);
  done.addEventListener('click', () => { clearInterval(tick); el.remove(); onDone(); });
  return el;
}

// ---------- the laptop ----------
interface Doc { name: string; icon: string; title: string; body: string }
/** the desktop's files: an introduction to the university's history (more files can be added here) */
const DOCS: Doc[] = [
  { name: 'Founding.txt', icon: '📄', title: 'How the University began',
    body: `<p>The University of Ghana began as the <b>University College of the Gold Coast</b>, set up by an ordinance in <b>August 1948</b> to provide university teaching and research.</p>
<p>It followed the British government's post-war commissions on higher education in the colonies. The Elliot Commission's report had recommended fewer universities in West Africa than were wanted; people across the Gold Coast pressed for a university college of their own, and got it.</p>
<p>Like other colonial university colleges of the time it was in a "special relationship" with the <b>University of London</b>: students sat London's examinations and received London degrees.</p>
<p>Teaching began in temporary buildings at Achimota while a permanent home was built on <b>Legon Hill</b>, a few kilometres north of Accra.</p>` },
  { name: 'Legon Hill.txt', icon: '📄', title: 'The move to Legon',
    body: `<p>The campus was laid out on Legon Hill in the 1950s. Its white walls, red tiled roofs, courtyards and arcades give the older part of the campus its look, still seen in the traditional halls and the Balme Library.</p>
<p>The <b>Balme Library</b>, the main university library, is named after <b>David Mowbray Balme</b>, the University College's first principal, who led it through its first years.</p>
<p>The <b>Great Hall</b> on the hill holds the university's congregations (graduations) and other ceremonies.</p>` },
  { name: 'University status.txt', icon: '📄', title: 'Becoming the University of Ghana',
    body: `<p>Ghana became independent in 1957. In <b>1961</b>, by an Act of Parliament, the University College became the <b>University of Ghana</b>, a full university able to award its own degrees.</p>
<p>The new university's first Chancellor was the President of Ghana, <b>Dr Kwame Nkrumah</b>.</p>
<p>Today it is Ghana's oldest and largest university, organised in colleges, schools, institutes and centres.</p>` },
  { name: 'Halls of residence.txt', icon: '📄', title: 'The halls',
    body: `<p>Students live in halls of residence, each with its own traditions, colours and rivalries. The five traditional halls are <b>Legon Hall</b>, <b>Akuafo Hall</b>, <b>Commonwealth Hall</b>, <b>Mensah Sarbah Hall</b> and <b>Volta Hall</b>, built round courtyards entered through a gate with a porter's lodge.</p>
<p>Newer halls and hostels followed as the university grew: the Diaspora halls (Jean Nelson Aka, Elizabeth Frances Sey, Hilla Limann, Alexander Kwapong), Jubilee Hall, the International Students' Hostels, Evandy, TF, Bani and others.</p>` },
  { name: 'Motto.txt', icon: '📄', title: 'Motto',
    body: `<p>The university's motto is <b>Integri Procedamus</b>, Latin for "let us proceed with integrity".</p>` },
  { name: 'About these files.txt', icon: '🗒️', title: 'About these files',
    body: `<p>This laptop holds short notes on the University of Ghana's history. More files will be added. The notes are a general introduction: check dates and details against the university's own published history.</p>` },
];

/** the laptop: the monitor's frame round the screen, a desktop of files, a window per file, the clock, Shut down */
export function laptopScreen(onShutdown: () => void) {
  const el = screen('rs-laptop', `<div class="lp-frame"><div class="lp-cam"></div>
      <div class="lp-screen" id="lpScreen">
        <div class="lp-desk" id="lpDesk">${DOCS.map((d, i) => `<button class="lp-icon" data-i="${i}"><span>${d.icon}</span><small>${esc(d.name)}</small></button>`).join('')}</div>
        <div class="lp-wins" id="lpWins"></div>
        <div class="lp-bar"><span class="lp-start">UG</span><span class="grow" id="lpTasks"></span><span id="lpTime"></span><button class="btn btn-sm lp-off" id="lpOff">⏻ Shut down</button></div>
      </div>
      <div class="lp-brand">LEGON</div></div>
      <div class="lp-base"></div>`);
  const wins = el.querySelector<HTMLElement>('#lpWins')!, tasks = el.querySelector<HTMLElement>('#lpTasks')!, time = el.querySelector<HTMLElement>('#lpTime')!;
  const clock = () => { const d = new Date(); time.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  clock();
  const tick = setInterval(clock, 10000);
  let z = 1;
  const open = (i: number) => {
    const d = DOCS[i];
    const ex = wins.querySelector<HTMLElement>(`[data-w="${i}"]`);
    if (ex) { ex.style.zIndex = String(++z); return; }
    const w = document.createElement('div');
    w.className = 'lp-win'; w.dataset.w = String(i); w.style.zIndex = String(++z);
    w.style.left = `${8 + (i % 4) * 6}%`; w.style.top = `${6 + (i % 4) * 5}%`;
    w.innerHTML = `<div class="lp-title"><b>${esc(d.name)}</b><button class="lp-x" aria-label="Close">×</button></div><div class="lp-body"><h3>${esc(d.title)}</h3>${d.body}</div>`;
    w.querySelector('.lp-x')!.addEventListener('click', () => { w.remove(); drawTasks(); });
    w.addEventListener('pointerdown', () => { w.style.zIndex = String(++z); });
    // drag by the title bar
    const bar = w.querySelector<HTMLElement>('.lp-title')!;
    bar.addEventListener('pointerdown', (e) => {
      const r = w.getBoundingClientRect(), host = wins.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
      const mv = (ev: PointerEvent) => { w.style.left = `${ev.clientX - host.left - ox}px`; w.style.top = `${Math.max(0, ev.clientY - host.top - oy)}px`; };
      const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
      addEventListener('pointermove', mv); addEventListener('pointerup', up);
    });
    wins.appendChild(w);
    drawTasks();
  };
  const drawTasks = () => {
    tasks.innerHTML = [...wins.querySelectorAll<HTMLElement>('.lp-win')].map((w) => `<button class="lp-task" data-t="${w.dataset.w}">${esc(DOCS[+w.dataset.w!].name)}</button>`).join('');
    tasks.querySelectorAll<HTMLElement>('[data-t]').forEach((b) => b.addEventListener('click', () => open(+b.dataset.t!)));
  };
  el.querySelectorAll<HTMLElement>('.lp-icon').forEach((b) => b.addEventListener('click', () => open(+b.dataset.i!)));
  el.querySelector('#lpOff')!.addEventListener('click', () => {
    clearInterval(tick);
    const scr = el.querySelector<HTMLElement>('#lpScreen')!;
    scr.innerHTML = '<div class="lp-bye">Shutting down…</div>';
    setTimeout(() => { scr.classList.add('off'); scr.innerHTML = ''; }, 900);
    setTimeout(() => { el.remove(); onShutdown(); }, 1600);
  });
  return el;
}

// ---------- the phone ----------
export interface ChatLine { me: boolean; text: string; at: number }
/** a phone's messaging app with one roommate; `send` posts a line, `lines` is the conversation so far */
export function phoneScreen(name: string, lines: ChatLine[], send: (text: string) => void, onClose: () => void) {
  const el = screen('rs-phone', `<div class="ph"><div class="ph-notch"></div>
      <div class="ph-head"><button class="ph-back" id="phX" aria-label="Close">‹</button><span class="ph-av">${esc(name.charAt(0).toUpperCase())}</span><b>${esc(name)}</b><small>in your room</small></div>
      <div class="ph-msgs" id="phMsgs"></div>
      <form class="ph-in" id="phForm"><input id="phText" maxlength="240" placeholder="Message" autocomplete="off"><button class="btn btn-primary btn-sm">Send</button></form></div>`);
  const box = el.querySelector<HTMLElement>('#phMsgs')!, input = el.querySelector<HTMLInputElement>('#phText')!;
  const draw = () => {
    box.innerHTML = lines.length ? lines.map((l) => `<p class="ph-m ${l.me ? 'me' : ''}">${esc(l.text)}<small>${new Date(l.at).toTimeString().slice(0, 5)}</small></p>`).join('') : `<p class="muted small ph-empty">Say hello to ${esc(name)}. Messages here are not saved.</p>`;
    box.scrollTop = box.scrollHeight;
  };
  draw();
  el.querySelector('#phForm')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = input.value.trim();
    if (!t) return;
    lines.push({ me: true, text: t, at: Date.now() });
    send(t);
    input.value = '';
    draw();
  });
  el.querySelector('#phX')!.addEventListener('click', () => { el.remove(); onClose(); });
  setTimeout(() => input.focus(), 50);
  return { el, redraw: draw };
}
