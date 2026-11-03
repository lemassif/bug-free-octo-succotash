/* Island Dreams — the family camp journal.

   Screens (the part of the address after #):
     #/            the journal, newest first
     #/new         write an entry
     #/entry/<id>  read one entry
     #/edit/<id>   change or delete an entry
     #/fish        the Fish Board: The Big One and the Kings of the Little Fish
     #/settings    family list, drop-down lists, sharing

   Everything a person typed is put on the page with textContent,
   never as HTML. */

import { createStore } from './store.js';
import { preparePhoto } from './photos.js';

export const VERSION = '1.3.3';
const REPO_GUIDE = 'https://github.com/lemassif/bug-free-octo-succotash/blob/main/ISLAND.md';
const DRAFT_KEY = 'island-dreams-draft';
const PENDING_EMAIL_KEY = 'island-dreams-email';

const ICONS = {
  'Fish caught': '🎣', 'Campfires': '🔥', 'Ship sightings': '🚢', 'Work on the house': '🔨',
  'Open camp': '🔑', 'Close camp': '🔒', 'Get boat out of water': '⚓',
  'Tubing': '🛟', 'Swimming': '🏊', 'Cooking on the boat': '🍳', 'Geocaching': '🧭',
  'Sightseeing': '📸', 'Fireworks': '🎆'
};
const icon = (label) => ICONS[label] || '⭐';
const FISH_ACTIVITY = 'Fish caught';
const SPECIES = [
  'Yellow perch', 'Rock bass', 'Pumpkinseed (sunfish)', 'Bluegill', 'Smallmouth bass',
  'Largemouth bass', 'Northern pike', 'Muskellunge (muskie)', 'Walleye', 'Brown bullhead',
  'Channel catfish', 'Black crappie', 'Freshwater drum (sheepshead)', 'Common carp', 'American eel', 'Round goby'
];

const store = createStore(window.ISLAND_CONFIG);
const state = {
  signedIn: false,
  email: '',
  entries: [],
  options: [],
  members: [],
  filter: { q: '', year: '' },
  dirty: false
};

const $ = (id) => document.getElementById(id);
const app = $('app');

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function show(...nodes) {
  app.replaceChildren(...nodes);
  window.scrollTo(0, 0);
}

let toastTimer;
function toast(msg, long) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, long ? 7000 : 3500);
}

/* An in-page "Are you sure?" box. Browser confirm() boxes are tiny on a
   phone and some places (like an embedded preview) block them. */
function askConfirm(text, yesLabel, danger) {
  const box = $('ask');
  $('askText').textContent = text;
  const yes = $('askYes');
  const no = $('askNo');
  yes.textContent = yesLabel || 'OK';
  yes.className = 'btn ' + (danger ? 'danger-fill' : 'primary');
  box.hidden = false;
  no.focus();
  return new Promise((resolve) => {
    const done = (answer) => {
      box.hidden = true;
      yes.onclick = no.onclick = box.onkeydown = null;
      resolve(answer);
    };
    yes.onclick = () => done(true);
    no.onclick = () => done(false);
    box.onkeydown = (e) => { if (e.key === 'Escape') done(false); };
  });
}

function errorText(e) {
  const m = (e && (e.message || e.error_description)) || String(e);
  if (/Failed to fetch|NetworkError|Load failed|network/i.test(m)) {
    return 'No connection right now. Nothing was lost — try again when you have signal.';
  }
  return m;
}

function parseDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
}

/* When a visit happened. entry_date is the arrive date; a missing
   depart date means they left the same day.
   Long:  "Sunday, July 14, 2024 · Arrived 4:30 PM · Left 7:05 PM", or for
          a stay of several days two lines, "Arrived Friday, July 11, 2025
          at 4:30 PM" and "Left Monday, July 14, 2025 at 10:00 AM".
   Short: "Sun, Jul 14, 2024 · 4:30 PM – 7:05 PM", or "Fri, Jul 11 – Mon,
          Jul 14, 2025" for several days. */
function fmtDate(entry, opts) {
  const short = !!(opts && opts.short);
  const a = parseDate(entry.entry_date);
  const multi = !!entry.depart_date && entry.depart_date !== entry.entry_date;
  const day = (d, withYear) => d.toLocaleDateString(undefined, {
    weekday: short ? 'short' : 'long', month: short ? 'short' : 'long', day: 'numeric',
    year: withYear ? 'numeric' : undefined
  });
  const clock = (hhmm) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    const t = new Date(2000, 0, 1, hh, mm);
    return t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };
  const arrive = entry.arrive_time ? clock(entry.arrive_time) : '';
  const depart = entry.depart_time ? clock(entry.depart_time) : '';

  if (multi) {
    const d = parseDate(entry.depart_date);
    if (short) {
      return `${day(a, a.getFullYear() !== d.getFullYear())} – ${day(d, true)}`;
    }
    return `Arrived ${day(a, true)}${arrive ? ' at ' + arrive : ''}\nLeft ${day(d, true)}${depart ? ' at ' + depart : ''}`;
  }
  let s = day(a, true);
  if (short) {
    if (arrive || depart) s += ' · ' + (arrive && depart ? `${arrive} – ${depart}` : arrive ? 'arrived ' + arrive : 'left ' + depart);
  } else {
    if (arrive) s += ' · Arrived ' + arrive;
    if (depart) s += ' · Left ' + depart;
  }
  return s;
}

function todayParts() {
  const n = new Date();
  const pad = (x) => String(x).padStart(2, '0');
  return {
    date: `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`,
    time: `${pad(n.getHours())}:${pad(n.getMinutes())}`
  };
}

function sortEntries() {
  state.entries.sort((a, b) =>
    b.entry_date.localeCompare(a.entry_date) ||
    String(b.arrive_time || '').localeCompare(String(a.arrive_time || '')) ||
    String(b.created_at).localeCompare(String(a.created_at)));
}

function nameFor(email) {
  if (!email) return '';
  const m = state.members.find((x) => x.email === email);
  return (m && m.name) || email;
}

function optionLabels(kind) {
  return state.options.filter((o) => o.kind === kind).map((o) => o.label);
}

/* in list order, with anything no longer on the list at the end */
function ordered(kind, labels) {
  const list = optionLabels(kind);
  const set = new Set(labels);
  return [...list.filter((l) => set.has(l)), ...labels.filter((l) => !list.includes(l))];
}

function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (e) { return null; }
}
function writeDraft(d) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch (e) { /* private mode */ }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* private mode */ }
}

function entryUrl(id) {
  return location.origin + location.pathname + '#/entry/' + id;
}

const withPhoto = (list) => list.filter((p) => p.path);
const pictures = (e) => [...e.photos, ...withPhoto(e.fish)];

function fishLine(f) {
  return (f.species || 'fish') + (f.caught_by ? ' — ' + f.caught_by : '');
}

/* Every fish with its entry, for the Fish Board. year '' means all summers. */
function allFish(year) {
  const out = [];
  state.entries.forEach((e) => {
    if (year && !e.entry_date.startsWith(year)) return;
    e.fish.forEach((f) => out.push({ ...f, entry: e }));
  });
  return out;
}

/* Chance's rule. At four years old he caught a six-pound smallmouth
   bass: that fish is The Big One. Next to it every other fish is a
   little fish, so the PERSON who catches any other fish is King of the
   Little Fish. The crown goes on the catcher, never on the fish.
   Nobody measures anything. */
function fishBadge(f) {
  if (f.big_one) return h('span', { class: 'badge big' }, '🏆 The Big One');
  if (f.caught_by) return h('span', { class: 'badge king' }, `👑 ${f.caught_by}, King of the Little Fish`);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Start-up and sign-in                                               */
/* ------------------------------------------------------------------ */

async function boot() {
  try {
    await store.init();
  } catch (e) {
    show(h('section', { class: 'card' }, h('h2', null, 'The journal could not start'), h('p', null, errorText(e))));
    return;
  }
  $('localBanner').hidden = store.mode !== 'local';
  store.onAuthChange((event) => {
    if (event === 'SIGNED_OUT' || (!state.signedIn && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED'))) authCheck();
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
  });
  await authCheck();
}

let checking = null;
function authCheck() {
  checking = checking || doAuthCheck().finally(() => { checking = null; });
  return checking;
}

async function doAuthCheck() {
  let session;
  try {
    session = await store.session();
  } catch (e) {
    if (e && e.stillSignedIn) return renderReconnecting();
    session = null;
  }
  reconnect.tries = 0;
  state.signedIn = !!session;
  chrome(false);
  if (!session) {
    state.entries = [];
    state.members = [];
    return renderSignIn();
  }
  state.email = session.email;
  try {
    if (!(await store.isMember())) return renderNotMember();
    await loadAll();
  } catch (e) {
    return show(h('section', { class: 'card' },
      h('h2', null, 'Could not open the journal'),
      h('p', null, errorText(e)),
      h('button', { class: 'btn primary', onclick: authCheck }, 'Try again')));
  }
  chrome(true);
  route();
}

async function loadAll() {
  const [entries, options, members] = await Promise.all([
    store.listEntries(), store.listOptions(), store.listMembers()
  ]);
  state.entries = entries;
  state.options = options;
  state.members = members;
  sortEntries();
}

function chrome(on) {
  $('btnSettings').hidden = !on;
  $('tabs').hidden = true;
  $('fabNew').hidden = true;
  $('btnBack').hidden = true;
}

function renderSignIn() {
  let pending = '';
  // Kept in localStorage, not sessionStorage: an iPhone Home Screen app is
  // often closed while the person is in Mail fetching the code, and comes
  // back as a fresh start that has lost sessionStorage. Codes expire after
  // an hour, so an older pending sign-in is dropped.
  try {
    const saved = JSON.parse(localStorage.getItem(PENDING_EMAIL_KEY) || 'null');
    if (saved && Date.now() - saved.at < 60 * 60 * 1000) pending = saved.email;
  } catch (e) { /* ignore */ }
  const hashError = /error_description=([^&]+)/.exec(location.hash);
  if (hashError) toast(decodeURIComponent(hashError[1].replace(/\+/g, ' ')), true);

  const remember = (v) => {
    try {
      if (v) localStorage.setItem(PENDING_EMAIL_KEY, JSON.stringify({ email: v, at: Date.now() }));
      else localStorage.removeItem(PENDING_EMAIL_KEY);
    } catch (e) { /* ignore */ }
  };

  if (!pending) {
    const email = h('input', { type: 'email', id: 'signinEmail', autocomplete: 'email', required: true, placeholder: 'name@example.com' });
    const btn = h('button', { class: 'btn primary big', type: 'submit' }, 'Email me a sign-in code');
    const form = h('form', {
      class: 'card signin',
      onsubmit: async (ev) => {
        ev.preventDefault();
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
          await store.sendCode(email.value);
          remember(email.value.trim().toLowerCase());
          renderSignIn();
        } catch (e) {
          toast(errorText(e), true);
          btn.disabled = false;
          btn.textContent = 'Email me a sign-in code';
        }
      }
    },
    h('h2', null, 'Welcome to Island Dreams'),
    h('p', null, 'Our family journal from camp. Sign in with your email address — no password needed.'),
    h('label', { for: 'signinEmail' }, 'Your email'),
    email, btn);
    show(heroArt(), form);
    return;
  }

  const code = h('input', {
    id: 'signinCode', inputmode: 'numeric', autocomplete: 'one-time-code',
    pattern: '[0-9 ]*', maxlength: 10, required: true, placeholder: '123456', class: 'code'
  });
  const btn = h('button', { class: 'btn primary big', type: 'submit' }, 'Sign in');
  show(heroArt(), h('form', {
    class: 'card signin',
    onsubmit: async (ev) => {
      ev.preventDefault();
      btn.disabled = true;
      btn.textContent = 'Checking…';
      try {
        await store.verifyCode(pending, code.value);
        remember('');
        await authCheck();
      } catch (e) {
        toast(/expired|invalid/i.test(errorText(e))
          ? 'That code did not work. Check the newest email, or send a new code.' : errorText(e), true);
        btn.disabled = false;
        btn.textContent = 'Sign in';
      }
    }
  },
  h('h2', null, 'Check your email'),
  h('p', null, 'We sent a sign-in code to ', h('strong', null, pending), '. Type the code here, or just tap the link in that email.'),
  h('label', { for: 'signinCode' }, 'Code from the email'),
  code, btn,
  h('div', { class: 'row' },
    h('button', { class: 'btn link', type: 'button', onclick: async () => {
      try { await store.sendCode(pending); toast('A new code is on its way.'); } catch (e) { toast(errorText(e), true); }
    } }, 'Send a new code'),
    h('button', { class: 'btn link', type: 'button', onclick: () => { remember(''); renderSignIn(); } }, 'Use a different email'))));
}

/* Still signed in, but the sign-in couldn't be renewed yet. Keep trying
   for about two minutes (supabase-js waits a minute before retrying a
   failed renewal), then leave it to a button. */
const reconnect = { tries: 0, timer: null };

function renderReconnecting() {
  state.signedIn = false;
  chrome(false);
  clearTimeout(reconnect.timer);
  const waiting = reconnect.tries < 24;
  if (waiting) {
    reconnect.tries++;
    reconnect.timer = setTimeout(authCheck, 5000);
  }
  show(h('section', { class: 'card', id: 'reconnecting' },
    h('h2', null, waiting ? 'Connecting to the journal…' : 'Can’t reach the journal'),
    h('p', null, 'You’re still signed in. ', waiting
      ? 'The phone hasn’t reached the internet yet. This usually takes a few seconds.'
      : 'Check that Wi-Fi or cell signal is on, then tap Try again.'),
    h('button', { class: 'btn primary', type: 'button', onclick: () => { reconnect.tries = 0; authCheck(); } }, 'Try again')));
}

function renderNotMember() {
  show(h('section', { class: 'card' },
    h('h2', null, 'Almost there'),
    h('p', null, 'You are signed in as ', h('strong', null, state.email), ', but that address is not on the family list yet.'),
    h('p', null, 'Ask someone in the family to add it: in Island Dreams, tap ⚙︎ then “Add a family member”.'),
    h('div', { class: 'row' },
      h('button', { class: 'btn primary', onclick: authCheck }, 'I’ve been added — try again'),
      h('button', { class: 'btn', onclick: () => store.signOut() }, 'Sign out'))));
}

function heroArt() {
  return h('div', { class: 'hero' }, h('img', { src: 'icon-512.png', alt: '', width: 120, height: 120 }));
}

/* ------------------------------------------------------------------ */
/*  Routing                                                            */
/* ------------------------------------------------------------------ */

let currentHash = location.hash;
let ignoreHash = false;

function route() {
  if (ignoreHash) { ignoreHash = false; return; }
  if (!state.signedIn) return;
  if (state.dirty && location.hash !== currentHash) {
    // stay on the form while asking; go on only if they say so
    const target = location.hash;
    ignoreHash = true;
    location.hash = currentHash;
    askConfirm('Leave without saving this entry?', 'Leave', true).then((ok) => {
      if (!ok) return;
      state.dirty = false;
      location.hash = target;
    });
    return;
  }
  currentHash = location.hash;
  const hash = location.hash || '#/';
  let m;
  const fish = hash === '#/fish';
  const top = fish || hash === '#/' || hash === '#' || hash === '' || !hash.startsWith('#/');
  $('btnBack').hidden = top;
  $('fabNew').hidden = !top;
  $('tabs').hidden = !top;
  document.querySelectorAll('#tabs a').forEach((a) => a.setAttribute('aria-current', String(a.dataset.tab === (fish ? 'fish' : 'journal'))));
  if (fish) return renderFishBoard();
  if (top) return renderList();
  if (hash === '#/new') return renderEdit(null);
  if (hash === '#/settings') return renderSettings();
  if ((m = /^#\/entry\/(.+)$/.exec(hash))) return renderView(m[1]);
  if ((m = /^#\/edit\/(.+)$/.exec(hash))) return renderEdit(m[1]);
  location.hash = '#/';
}

$('btnBack').addEventListener('click', () => {
  const m = /^#\/edit\/(.+)$/.exec(location.hash);
  location.hash = m ? '#/entry/' + m[1] : '#/';
});
$('btnSettings').addEventListener('click', () => { location.hash = '#/settings'; });

/* ------------------------------------------------------------------ */
/*  The journal                                                        */
/* ------------------------------------------------------------------ */

function renderList() {
  const results = h('div', { class: 'results' });
  const years = [...new Set(state.entries.map((e) => e.entry_date.slice(0, 4)))];

  if (!state.entries.length) {
    show(h('section', { class: 'card welcome' },
      h('h2', null, 'Our camp journal'),
      h('p', null, 'Nothing written yet. Tap ', h('strong', null, '＋ New entry'), ' to start.'),
      h('p', null, 'Copying in pages from the paper journal? Just set the date they happened — every entry back to July 2023 fits right in.')));
    return;
  }

  const search = h('input', {
    type: 'search', placeholder: 'Search the journal', 'aria-label': 'Search the journal',
    value: state.filter.q,
    oninput: () => { state.filter.q = search.value; draw(); }
  });
  const yearSel = h('select', {
    'aria-label': 'Year',
    onchange: () => { state.filter.year = yearSel.value; draw(); }
  }, h('option', { value: '' }, 'All years'), years.map((y) => h('option', { value: y, selected: y === state.filter.year }, y)));

  function matches(e) {
    if (state.filter.year && !e.entry_date.startsWith(state.filter.year)) return false;
    const q = state.filter.q.trim().toLowerCase();
    if (!q) return true;
    return [e.title, e.body, ...e.people, ...e.activities, nameFor(e.author_email), fmtDate(e),
      ...e.fish.flatMap((f) => [f.species, f.caught_by])]
      .join(' \n ').toLowerCase().includes(q);
  }

  function draw() {
    const list = state.entries.filter(matches);
    const groups = new Map();
    list.forEach((e) => {
      const y = e.entry_date.slice(0, 4);
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y).push(e);
    });
    const thumbs = [];
    const nodes = [];
    for (const [year, entries] of groups) {
      nodes.push(h('h2', { class: 'year' }, year, h('span', null, `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`)));
      entries.forEach((e) => nodes.push(entryCard(e, thumbs)));
    }
    if (!list.length) nodes.push(h('p', { class: 'muted center' }, 'No entries match.'));
    results.replaceChildren(...nodes);
    fillThumbs(thumbs);
  }

  show(h('div', { class: 'filters' }, search, yearSel), results);
  draw();
}

function entryCard(e, thumbs) {
  const firstLine = e.body.split('\n').find((l) => l.trim()) || '';
  const pics = pictures(e);
  const shown = pics.slice(0, 4);
  return h('a', { class: 'entry-card', href: '#/entry/' + e.id },
    h('div', { class: 'when' }, fmtDate(e, { short: true })),
    e.title ? h('h3', null, e.title) : null,
    firstLine ? h('p', { class: 'preview' }, firstLine) : null,
    chipRow(e),
    shown.length ? h('div', { class: 'thumbs' }, shown.map((p, i) => {
      const img = h('img', { alt: '', loading: 'lazy' });
      thumbs.push([p, img]);
      const extra = i === 3 && pics.length > 4 ? h('span', { class: 'more' }, '+' + (pics.length - 4)) : null;
      return h('div', { class: 'thumb' }, img, extra);
    })) : null);
}

function chipRow(e) {
  if (!e.people.length && !e.activities.length) return null;
  return h('div', { class: 'chips' },
    ordered('person', e.people).map((p) => h('span', { class: 'chip person' }, p)),
    ordered('activity', e.activities).map((a) => h('span', { class: 'chip activity' }, icon(a) + ' ' + a)));
}

/* Links for photos in the size asked for. If that copy of a photo is
   missing from storage, use its other copy, so a picture never shows
   as a blank square or an empty full-screen view. */
async function pictureUrls(photos, size) {
  const urls = await store.photoUrls(photos, size);
  const missing = photos.filter((p) => !urls.has(p.id));
  if (missing.length) {
    const other = await store.photoUrls(missing, size === 'thumb' ? 'full' : 'thumb');
    other.forEach((url, id) => urls.set(id, url));
  }
  return urls;
}

async function fillThumbs(pairs) {
  if (!pairs.length) return;
  try {
    const urls = await pictureUrls(pairs.map(([p]) => p), 'thumb');
    pairs.forEach(([p, img]) => { if (urls.has(p.id)) img.src = urls.get(p.id); });
  } catch (e) { /* thumbnails stay blank offline */ }
}

/* ------------------------------------------------------------------ */
/*  Fish Board                                                         */
/* ------------------------------------------------------------------ */

/* The Big One at the top, then every King of the Little Fish, newest
   first, a summer at a time. */
function renderFishBoard() {
  const fish = allFish('');
  const bigOnes = fish.filter((f) => f.big_one);
  const little = fish.filter((f) => !f.big_one);
  const thumbs = [];
  const gallery = withPhoto([...bigOnes, ...little]);
  const tile = (f, noCrown) => fishTile(f, f.entry, thumbs, gallery, { showDate: true, noCrown });
  const nodes = [];

  nodes.push(bigOnes.length
    ? h('section', { class: 'card big-one' },
      h('h2', null, '🏆 The Big One'),
      h('p', { class: 'muted small' }, 'Every other fish is a little fish next to this one.'),
      h('div', { class: 'fish-list' }, bigOnes.map((f) => tile(f))))
    : h('section', { class: 'card big-one' },
      h('h2', null, '🏆 The Big One'),
      h('p', null, 'Chance’s six-pound smallmouth bass, caught when he was four, belongs here.'),
      h('p', { class: 'small muted' }, 'Write an entry for the day he caught it, tap ＋ Add a fish, add the photo, and tick 🏆 The Big One.')));

  const byYear = new Map();
  little.forEach((f) => {
    const y = f.entry.entry_date.slice(0, 4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(f);
  });
  const years = [...byYear.keys()].sort().reverse();

  if (!years.length) {
    nodes.push(h('section', { class: 'card crown' },
      h('h2', null, '👑 Kings of the Little Fish'),
      h('p', null, 'Catch any fish and you’re King of the Little Fish. Add it to an entry with ＋ Add a fish, and pick who caught it.')));
  }
  // each summer: every catcher is crowned, with the little fish that won it
  for (const y of years) {
    const byCatcher = new Map();
    byYear.get(y).forEach((f) => {
      const who = f.caught_by || '';
      if (!byCatcher.has(who)) byCatcher.set(who, []);
      byCatcher.get(who).push(f);
    });
    nodes.push(h('section', { class: 'card crown' },
      h('h2', null, `👑 Kings of the Little Fish ${y}`),
      [...byCatcher].map(([who, list]) => h('div', { class: 'king-group' },
        h('h3', null, who ? `👑 ${who}` : 'Caught by someone'),
        h('p', { class: 'muted small' }, who
          ? `King of the Little Fish · ${list.length} little ${list.length === 1 ? 'fish' : 'fish'}`
          : 'Pick who caught these in their entry to crown them.'),
        h('div', { class: 'fish-list' }, list.map((f) => tile(f, true)))))));
  }

  show(...nodes);
  fillThumbs(thumbs);
}

/* ------------------------------------------------------------------ */
/*  One entry                                                          */
/* ------------------------------------------------------------------ */

function renderView(id) {
  const e = state.entries.find((x) => x.id === id);
  if (!e) {
    show(h('section', { class: 'card' }, h('h2', null, 'Entry not found'),
      h('p', null, 'It may have been deleted.'), h('a', { class: 'btn primary', href: '#/' }, 'Back to the journal')));
    return;
  }
  const thumbs = [];
  const shareBox = h('div', { class: 'share-box', hidden: true });
  const author = nameFor(e.author_email);

  show(h('article', { class: 'card entry' },
    h('div', { class: 'when' }, fmtDate(e)),
    e.title ? h('h2', null, e.title) : null,
    e.people.length ? h('div', { class: 'section' }, h('h4', null, 'Who was there'),
      h('div', { class: 'chips' }, ordered('person', e.people).map((p) => h('span', { class: 'chip person' }, p)))) : null,
    e.activities.length ? h('div', { class: 'section' }, h('h4', null, 'What we did'),
      h('div', { class: 'chips' }, ordered('activity', e.activities).map((a) => h('span', { class: 'chip activity' }, icon(a) + ' ' + a)))) : null,
    e.body ? h('div', { class: 'body' }, e.body) : null,
    e.fish.length ? h('div', { class: 'section' }, h('h4', null, `Fish caught (${e.fish.length})`),
      h('div', { class: 'fish-list' }, e.fish.map((f) => fishTile(f, e, thumbs, withPhoto(e.fish))))) : null,
    e.photos.length ? h('div', { class: 'photo-grid' }, e.photos.map((p, i) => {
      const img = h('img', { alt: `Photo ${i + 1}`, loading: 'lazy' });
      thumbs.push([p, img]);
      return h('button', { class: 'thumb', type: 'button', 'aria-label': `Open photo ${i + 1}`, onclick: () => openLightbox(e.photos, i) }, img);
    })) : null,
    author ? h('p', { class: 'muted small' }, 'Written by ' + author) : null,
    h('div', { class: 'row actions' },
      h('a', { class: 'btn primary', href: '#/edit/' + e.id }, '✏️ Edit'),
      h('button', { class: 'btn', type: 'button', onclick: () => { shareBox.hidden = !shareBox.hidden; } }, '✉️ Share')),
    shareBox));
  buildShareBox(shareBox, e);
  fillThumbs(thumbs);
}

/* One fish: its photo (tap for full screen), kind, catcher and title. */
/* opts.showDate links to the entry; opts.noCrown leaves the catcher's
   crown off when a heading above already crowns them. */
function fishTile(f, e, thumbs, gallery, opts) {
  const { showDate, noCrown } = opts || {};
  let pic;
  if (f.path) {
    const img = h('img', { alt: fishLine(f), loading: 'lazy' });
    thumbs.push([f, img]);
    pic = h('button', { class: 'thumb', type: 'button', 'aria-label': 'Open photo of ' + fishLine(f),
      onclick: () => openLightbox(gallery, gallery.indexOf(gallery.find((g) => g.id === f.id))) }, img);
  } else {
    pic = h('div', { class: 'thumb empty', 'aria-hidden': 'true' }, '🐟');
  }
  return h('div', { class: 'fish-tile' }, pic,
    h('div', { class: 'fish-info' },
      h('div', { class: 'fish-kind' }, f.species || 'Fish'),
      // a little fish's crown already names its catcher; under a king's
      // heading on the board the catcher is the heading
      f.caught_by && f.big_one ? h('div', { class: 'muted small' }, 'Caught by ' + f.caught_by) : null,
      showDate ? h('a', { class: 'small', href: '#/entry/' + e.id }, fmtDate(e, { short: true })) : null,
      noCrown && !f.big_one ? null : fishBadge(f)));
}

function entryText(e) {
  const lines = ['Island Dreams — ' + fmtDate(e)];
  if (e.title) lines.push(e.title);
  lines.push('');
  if (e.people.length) lines.push('Who: ' + ordered('person', e.people).join(', '));
  if (e.activities.length) lines.push('What: ' + ordered('activity', e.activities).join(', '));
  if (e.people.length || e.activities.length) lines.push('');
  if (e.fish.length) lines.push('Fish: ' + e.fish.map(fishLine).join('; '), '');
  if (e.body) lines.push(e.body, '');
  const author = nameFor(e.author_email);
  if (author) lines.push('— ' + author);
  if (store.mode === 'cloud') lines.push('', 'Open it in Island Dreams: ' + entryUrl(e.id));
  return lines.join('\n');
}

function buildShareBox(box, e) {
  const subject = 'Island Dreams — ' + fmtDate(e, { short: true });
  const mail = h('a', {
    class: 'btn',
    href: 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(entryText(e))
  }, '✉️ Email the words');
  const canShare = !!navigator.share;
  let files = null;
  const hasPics = pictures(e).length > 0;
  const withPhotos = h('button', { class: 'btn', type: 'button' }, hasPics ? '📤 Share with photos' : '📤 Share…');
  withPhotos.addEventListener('click', async () => {
    if (files || !hasPics) {
      try {
        const data = { title: subject, text: entryText(e) };
        if (files && files.length && navigator.canShare && navigator.canShare({ files })) data.files = files;
        await navigator.share(data);
      } catch (err) {
        if (err.name !== 'AbortError') toast('Sharing did not work here. Try “Email the words”.');
      }
      return;
    }
    // Gathering the photos takes a moment, and phones only allow the share
    // sheet right after a tap, so this takes two taps.
    withPhotos.disabled = true;
    withPhotos.textContent = 'Getting photos ready…';
    try {
      const pics = pictures(e);
      const urls = await pictureUrls(pics, 'full');
      const ready = pics.filter((p) => urls.has(p.id));
      files = await Promise.all(ready.map(async (p, i) => {
        const blob = await (await fetch(urls.get(p.id))).blob();
        return new File([blob], `island-dreams-${e.entry_date}-${i + 1}.jpg`, { type: 'image/jpeg' });
      }));
      withPhotos.textContent = '📤 Ready — tap to share';
    } catch (err) {
      files = [];
      withPhotos.textContent = '📤 Share words only';
      toast('Could not get the photos ready. ' + errorText(err));
    }
    withPhotos.disabled = false;
  });
  box.append(
    h('p', { class: 'small muted' }, store.mode === 'cloud'
      ? 'The email includes a link to this entry. Family members on the list can open it.'
      : 'Sends a copy of this entry.'),
    h('div', { class: 'row' }, mail, canShare ? withPhotos : null));
}

/* ------------------------------------------------------------------ */
/*  Lightbox                                                           */
/* ------------------------------------------------------------------ */

const lb = { photos: [], index: 0 };

async function openLightbox(photos, index) {
  lb.photos = photos;
  lb.index = index;
  $('lightbox').hidden = false;
  document.body.classList.add('no-scroll');
  await showLightboxPhoto();
}

async function showLightboxPhoto() {
  const p = lb.photos[lb.index];
  const img = $('lbImg');
  img.removeAttribute('src');
  $('lbCount').textContent = `${lb.index + 1} of ${lb.photos.length}`;
  $('lbPrev').hidden = lb.photos.length < 2;
  $('lbNext').hidden = lb.photos.length < 2;
  try {
    const urls = await pictureUrls([p], 'full');
    if (lb.photos[lb.index] !== p) return;
    if (urls.has(p.id)) img.src = urls.get(p.id);
    else toast('This photo’s file is missing. Edit the entry to add it again.', true);
  } catch (e) {
    toast(errorText(e));
  }
}

function closeLightbox() {
  $('lightbox').hidden = true;
  document.body.classList.remove('no-scroll');
}

function stepLightbox(d) {
  if (lb.photos.length < 2) return;
  lb.index = (lb.index + d + lb.photos.length) % lb.photos.length;
  showLightboxPhoto();
}

$('lbClose').addEventListener('click', closeLightbox);
$('lbPrev').addEventListener('click', () => stepLightbox(-1));
$('lbNext').addEventListener('click', () => stepLightbox(1));
$('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if ($('lightbox').hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});
let touchX = null;
$('lightbox').addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
$('lightbox').addEventListener('touchend', (e) => {
  if (touchX == null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
});

/* ------------------------------------------------------------------ */
/*  Multi-select drop-down                                             */
/* ------------------------------------------------------------------ */

/* A button that opens a checklist below it. Ticked items also show as
   chips (tap a chip to untick it). The bottom of the list has a box
   for adding a new choice, which is saved for the whole family. */
function multiSelect({ kind, id, prompt, addPrompt, selected, onChange }) {
  let open = false;
  const toggle = h('button', { type: 'button', class: 'ms-toggle', id, 'aria-expanded': 'false' });
  const chips = h('div', { class: 'chips' });
  const panel = h('div', { class: 'ms-panel', hidden: true });
  const wrap = h('div', { class: 'ms' }, toggle, panel, chips);

  toggle.addEventListener('click', () => { open = !open; draw(); });

  function labels() {
    const list = optionLabels(kind);
    return [...list, ...[...selected].filter((l) => !list.includes(l))];
  }

  function set(label, on) {
    on ? selected.add(label) : selected.delete(label);
    onChange();
    draw();
  }

  async function add(input) {
    const label = input.value.trim().replace(/\s+/g, ' ');
    if (!label) return;
    if (label.length > 40) { toast('Please keep it under 40 letters.'); return; }
    const existing = labels().find((l) => l.toLowerCase() === label.toLowerCase());
    if (existing) { set(existing, true); input.value = ''; return; }
    input.value = '';
    selected.add(label);
    onChange();
    try {
      await store.addOption(kind, label);
      state.options = await store.listOptions();
      toast(`“${label}” added to the list for everyone.`);
    } catch (e) {
      toast(`“${label}” is on this entry, but could not be added to the list: ${errorText(e)}`, true);
    }
    draw();
  }

  function draw() {
    const n = selected.size;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.replaceChildren(
      h('span', null, n ? `${n} selected` : prompt),
      h('span', { class: 'caret', 'aria-hidden': 'true' }, open ? '▴' : '▾'));
    const all = labels();
    chips.replaceChildren(...ordered(kind, [...selected]).map((l) =>
      h('button', { type: 'button', class: 'chip ' + kind + ' removable', 'aria-label': `Remove ${l}`, onclick: () => set(l, false) },
        (kind === 'activity' ? icon(l) + ' ' : '') + l, h('span', { 'aria-hidden': 'true' }, '✕'))));
    panel.hidden = !open;
    if (!open) { panel.replaceChildren(); return; }
    const addInput = h('input', {
      type: 'text', maxlength: 40, placeholder: addPrompt, 'aria-label': addPrompt,
      onkeydown: (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); add(addInput); } }
    });
    panel.replaceChildren(
      h('div', { class: 'ms-quick' },
        h('button', { type: 'button', class: 'btn link', onclick: () => { all.forEach((l) => selected.add(l)); onChange(); draw(); } }, 'Select all'),
        h('button', { type: 'button', class: 'btn link', onclick: () => { selected.clear(); onChange(); draw(); } }, 'Clear')),
      h('div', { class: 'ms-options' }, all.map((l) => h('label', { class: 'ms-opt' },
        h('input', { type: 'checkbox', checked: selected.has(l), onchange: (ev) => set(l, ev.target.checked) }),
        h('span', null, (kind === 'activity' ? icon(l) + ' ' : '') + l)))),
      h('div', { class: 'ms-add' }, addInput,
        h('button', { type: 'button', class: 'btn', onclick: () => add(addInput) }, 'Add')),
      h('button', { type: 'button', class: 'btn primary ms-done', onclick: () => { open = false; draw(); toggle.focus(); } }, 'Done'));
  }

  draw();
  wrap.refresh = draw;
  return wrap;
}

/* ------------------------------------------------------------------ */
/*  Write or change an entry                                           */
/* ------------------------------------------------------------------ */

function renderEdit(id) {
  const existing = id ? state.entries.find((x) => x.id === id) : null;
  if (id && !existing) return renderView(id);

  const now = todayParts();
  const draft = !existing ? readDraft() : null;
  const src = existing || draft || {};
  const form = {
    id: existing ? existing.id : null,
    entry_date: src.entry_date || now.date,
    arrive_time: (src.arrive_time || (existing ? '' : now.time) || '').slice(0, 5),
    depart_date: src.depart_date || (src.depart_time && src.entry_date) || '',
    depart_time: (src.depart_time || '').slice(0, 5),
    title: src.title || '',
    body: src.body || '',
    people: new Set(src.people || []),
    activities: new Set(src.activities || [])
  };
  const photos = existing ? [...existing.photos] : []; // already saved
  const removed = [];                                  // saved, marked for removal
  const pending = [];                                  // new: { key, img, url }
  const fishItems = (existing ? existing.fish : []).map((f) => ({
    key: f.id, saved: f, caught_by: f.caught_by, species: f.species, big_one: !!f.big_one, img: null, url: null
  }));
  const fishRemoved = [];                              // saved fish marked for removal

  const markDirty = () => {
    state.dirty = true;
    if (!form.id) {
      writeDraft({
        entry_date: form.entry_date, arrive_time: form.arrive_time,
        depart_date: form.depart_date, depart_time: form.depart_time,
        title: form.title, body: form.body,
        people: [...form.people], activities: [...form.activities]
      });
    }
  };

  const date = h('input', { type: 'date', id: 'fDate', required: true, value: form.entry_date, max: '2100-12-31',
    oninput: () => { form.entry_date = date.value; markDirty(); } });
  const arrive = h('input', { type: 'time', id: 'fArrive', value: form.arrive_time,
    oninput: () => { form.arrive_time = arrive.value; markDirty(); } });
  const departDate = h('input', { type: 'date', id: 'fDepartDate', value: form.depart_date, max: '2100-12-31',
    oninput: () => { form.depart_date = departDate.value; markDirty(); } });
  const depart = h('input', { type: 'time', id: 'fDepart', value: form.depart_time,
    oninput: () => {
      form.depart_time = depart.value;
      // a depart time with no date yet most likely means the same day
      if (depart.value && !form.depart_date) { form.depart_date = form.entry_date; departDate.value = form.entry_date; }
      markDirty();
    } });
  const title = h('input', { type: 'text', id: 'fTitle', maxlength: 200, value: form.title, placeholder: 'e.g. Chance’s first pike',
    oninput: () => { form.title = title.value; markDirty(); } });
  const body = h('textarea', { id: 'fBody', rows: 8, placeholder: 'What happened today?',
    oninput: () => { form.body = body.value; markDirty(); grow(); } });
  body.value = form.body;
  const grow = () => { body.style.height = 'auto'; body.style.height = Math.max(body.scrollHeight, 180) + 'px'; };

  const grid = h('div', { class: 'photo-grid edit' });
  const status = h('p', { class: 'small muted', 'aria-live': 'polite' });

  async function drawPhotos() {
    const tiles = [];
    const thumbs = [];
    photos.forEach((p) => {
      const img = h('img', { alt: '' });
      thumbs.push([p, img]);
      tiles.push(h('div', { class: 'thumb' }, img, h('button', {
        type: 'button', class: 'remove', 'aria-label': 'Remove photo',
        onclick: () => { photos.splice(photos.indexOf(p), 1); removed.push(p); markDirty(); drawPhotos(); }
      }, '✕')));
    });
    pending.forEach((p) => {
      tiles.push(h('div', { class: 'thumb new' }, h('img', { alt: '', src: p.url }), h('button', {
        type: 'button', class: 'remove', 'aria-label': 'Remove photo',
        onclick: () => { URL.revokeObjectURL(p.url); pending.splice(pending.indexOf(p), 1); drawPhotos(); }
      }, '✕')));
    });
    grid.replaceChildren(...tiles);
    grid.hidden = !tiles.length;
    fillThumbs(thumbs);
  }

  async function addFiles(fileList) {
    const files = [...fileList];
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      status.textContent = `Preparing photo ${i + 1} of ${files.length}…`;
      try {
        const img = await preparePhoto(files[i]);
        pending.push({ key: crypto.randomUUID(), img, url: URL.createObjectURL(img.thumb) });
        markDirty();
        drawPhotos();
      } catch (e) {
        failed++;
      }
    }
    status.textContent = failed
      ? `${failed} photo${failed > 1 ? 's' : ''} could not be read. Try choosing ${failed > 1 ? 'them' : 'it'} again, or take a new one.`
      : '';
  }

  const camera = h('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true,
    onchange: () => { addFiles(camera.files); camera.value = ''; } });
  const library = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true,
    onchange: () => { addFiles(library.files); library.value = ''; } });

  const fishBox = h('div', { class: 'fish-edits' });
  let activities; // the "What did we do?" drop-down, ticked when a fish is added

  function drawFish() {
    fishBox.replaceChildren(...fishItems.map((it, i) => fishEditor(it, i, {
      people: () => [...new Set([...ordered('person', [...form.people]), ...optionLabels('person')])],
      onChange: markDirty,
      onRemove: () => {
        if (it.url) URL.revokeObjectURL(it.url);
        fishItems.splice(fishItems.indexOf(it), 1);
        if (it.saved) fishRemoved.push(it.saved);
        markDirty();
        drawFish();
      }
    })));
  }

  function addFish() {
    fishItems.push({
      key: crypto.randomUUID(), saved: null, species: '', img: null, url: null, big_one: false,
      caught_by: form.people.size === 1 ? [...form.people][0] : ''
    });
    if (!form.activities.has(FISH_ACTIVITY)) {
      form.activities.add(FISH_ACTIVITY);
      activities.refresh();
    }
    markDirty();
    drawFish();
    const cards = fishBox.querySelectorAll('.fish-edit');
    cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const save = h('button', { class: 'btn primary big', type: 'submit' }, existing ? 'Save changes' : 'Save entry');

  async function onSave(ev) {
    ev.preventDefault();
    if (!form.entry_date) { toast('Please pick the arrive date.'); date.focus(); return; }
    const leftAt = (form.depart_date || form.entry_date) + 'T' + (form.depart_time || '23:59');
    const cameAt = form.entry_date + 'T' + (form.arrive_time || '00:00');
    if ((form.depart_date || form.depart_time) && leftAt < cameAt) {
      toast('The depart date and time are before the arrival. Please check them.', true);
      departDate.focus();
      return;
    }
    save.disabled = true;
    save.textContent = 'Saving…';
    try {
      const saved = await store.saveEntry({
        id: form.id, entry_date: form.entry_date, arrive_time: form.arrive_time,
        depart_date: form.depart_date && form.depart_date !== form.entry_date ? form.depart_date : null,
        depart_time: form.depart_time,
        title: form.title.trim(), body: form.body.replace(/\s+$/, ''),
        people: ordered('person', [...form.people]), activities: ordered('activity', [...form.activities])
      });
      form.id = saved.id; // a retry after a failed photo updates, never duplicates
      clearDraft();
      while (removed.length) {
        await store.deletePhoto(removed[0]);
        removed.shift();
      }
      const total = pending.length;
      let done = 0;
      while (pending.length) {
        save.textContent = `Uploading photo ${++done} of ${total}…`;
        const added = await store.addPhoto(saved.id, pending[0].img);
        URL.revokeObjectURL(pending[0].url);
        pending.shift();
        photos.push(added);
      }
      saved.photos = photos;
      while (fishRemoved.length) {
        await store.deleteFish(fishRemoved[0]);
        fishRemoved.shift();
      }
      for (let i = 0; i < fishItems.length; i++) {
        const it = fishItems[i];
        if (it.saved && !fishChanged(it)) continue;
        save.textContent = `Saving fish ${i + 1} of ${fishItems.length}…`;
        it.saved = it.saved
          ? await store.updateFish(it.saved, it, it.img)
          : await store.addFish(saved.id, it, it.img);
        it.img = null;
      }
      saved.fish = fishItems.map((it) => it.saved);
      state.entries = state.entries.filter((x) => x.id !== saved.id).concat(saved);
      sortEntries();
      state.dirty = false;
      toast('Saved.');
      location.hash = '#/entry/' + saved.id;
    } catch (e) {
      toast('Not saved yet: ' + errorText(e), true);
      save.disabled = false;
      save.textContent = existing ? 'Save changes' : 'Save entry';
      drawPhotos();
    }
  }

  async function onDelete() {
    if (!(await askConfirm('Delete this entry and its photos for everyone? This cannot be undone.', 'Delete', true))) return;
    try {
      await store.deleteEntry({
        ...existing,
        photos: [...photos, ...removed],
        fish: [...fishItems.filter((it) => it.saved).map((it) => it.saved), ...fishRemoved]
      });
      state.entries = state.entries.filter((x) => x.id !== existing.id);
      state.dirty = false;
      toast('Entry deleted.');
      location.hash = '#/';
    } catch (e) {
      toast(errorText(e), true);
    }
  }

  const restored = draft && (draft.body || draft.title || (draft.people || []).length || (draft.activities || []).length);

  show(h('form', { class: 'card edit', onsubmit: onSave },
    h('h2', null, existing ? 'Change this entry' : 'New entry'),
    restored ? h('p', { class: 'note' }, 'We kept what you started last time. ',
      h('button', { type: 'button', class: 'btn link', onclick: () => { clearDraft(); state.dirty = false; renderEdit(null); } }, 'Start over')) : null,
    h('div', { class: 'two' },
      h('div', null, h('label', { for: 'fDate' }, 'Arrive date'), date),
      h('div', null, h('label', { for: 'fArrive' }, 'Arrive time'), arrive)),
    h('div', { class: 'two' },
      h('div', null, h('label', { for: 'fDepartDate' }, 'Depart date'), departDate),
      h('div', null, h('label', { for: 'fDepart' }, 'Depart time'), depart)),
    h('label', { for: 'msPeople' }, 'Who was there?'),
    multiSelect({ kind: 'person', id: 'msPeople', prompt: 'Choose people', addPrompt: 'Add someone new',
      selected: form.people, onChange: markDirty }),
    h('label', { for: 'msActivities' }, 'What did we do?'),
    (activities = multiSelect({ kind: 'activity', id: 'msActivities', prompt: 'Choose activities', addPrompt: 'Add a new activity',
      selected: form.activities, onChange: markDirty })),
    h('label', null, 'Fish 🎣'),
    h('p', { class: 'small muted hint' }, 'Snap every fish and pick who caught it. Next to Chance’s six-pound smallmouth, every fish is a little fish, so whoever catches one is 👑 King of the Little Fish.'),
    fishBox,
    h('button', { type: 'button', class: 'btn add-fish', onclick: addFish }, '＋ Add a fish'),
    h('datalist', { id: 'speciesList' }, SPECIES.map((sp) => h('option', { value: sp }))),
    h('label', { for: 'fTitle' }, 'Headline ', h('span', { class: 'muted' }, '(optional)')),
    title,
    h('label', { for: 'fBody' }, 'Journal entry'),
    body,
    h('label', null, 'Photos'),
    h('div', { class: 'row photo-buttons' },
      h('button', { type: 'button', class: 'btn', onclick: () => camera.click() }, '📷 Take a photo'),
      h('button', { type: 'button', class: 'btn', onclick: () => library.click() }, '🖼️ Choose photos')),
    camera, library, status, grid,
    h('div', { class: 'save-bar' }, save),
    existing ? h('button', { type: 'button', class: 'btn danger', onclick: onDelete }, 'Delete this entry') : null));

  if (restored) state.dirty = true;
  grow();
  drawPhotos();
  drawFish();
}

function fishChanged(it) {
  const f = it.saved;
  return !!it.img || it.big_one !== !!f.big_one || it.caught_by.trim() !== f.caught_by || it.species.trim() !== f.species;
}

/* One fish in the entry form: photo, who caught it, kind. */
function fishEditor(it, index, { people, onChange, onRemove }) {
  const n = index + 1;
  const pic = h('div', { class: 'fish-photo' });
  const status = h('p', { class: 'small muted', 'aria-live': 'polite' });

  function drawPic() {
    if (it.url) {
      pic.replaceChildren(h('img', { alt: `Fish ${n}`, src: it.url }));
    } else if (it.saved && it.saved.path) {
      const img = h('img', { alt: `Fish ${n}` });
      pic.replaceChildren(img);
      fillThumbs([[it.saved, img]]);
    } else {
      pic.replaceChildren(h('span', { 'aria-hidden': 'true' }, '🐟'));
    }
  }

  async function usePhoto(file) {
    if (!file) return;
    status.textContent = 'Preparing photo…';
    try {
      const img = await preparePhoto(file);
      if (it.url) URL.revokeObjectURL(it.url);
      it.img = img;
      it.url = URL.createObjectURL(img.thumb);
      status.textContent = '';
      onChange();
      drawPic();
    } catch (e) {
      status.textContent = 'That photo could not be read. Try again, or take a new one.';
    }
  }

  const camera = h('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true,
    onchange: () => { usePhoto(camera.files[0]); camera.value = ''; } });
  const library = h('input', { type: 'file', accept: 'image/*', hidden: true,
    onchange: () => { usePhoto(library.files[0]); library.value = ''; } });

  const names = people();
  if (it.caught_by && !names.includes(it.caught_by)) names.push(it.caught_by);
  const who = h('select', { id: `fishWho${n}`, onchange: () => { it.caught_by = who.value; onChange(); } },
    h('option', { value: '' }, 'Choose…'),
    names.map((p) => h('option', { value: p, selected: p === it.caught_by }, p)));
  const kind = h('input', { type: 'text', id: `fishKind${n}`, list: 'speciesList', maxlength: 40, value: it.species,
    placeholder: 'e.g. Yellow perch', oninput: () => { it.species = kind.value; onChange(); } });

  drawPic();
  return h('div', { class: 'fish-edit' },
    h('div', { class: 'fish-edit-head' }, h('strong', null, `Fish ${n}`),
      h('button', { type: 'button', class: 'btn link danger', onclick: onRemove }, 'Remove')),
    pic,
    h('div', { class: 'row photo-buttons' },
      h('button', { type: 'button', class: 'btn', onclick: () => camera.click() }, '📷 Take photo'),
      h('button', { type: 'button', class: 'btn', onclick: () => library.click() }, '🖼️ Choose photo')),
    camera, library, status,
    h('label', { for: `fishWho${n}` }, 'Who caught it?'), who,
    h('label', { for: `fishKind${n}` }, 'Kind of fish'), kind,
    h('label', { class: 'crown-pick' },
      h('input', { type: 'checkbox', checked: it.big_one, onchange: (ev) => { it.big_one = ev.target.checked; onChange(); } }),
      h('span', null, '🏆 This is The Big One')));
}

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

function renderSettings() {
  const appUrl = location.origin + location.pathname;
  const sections = [];

  if (store.mode === 'local') {
    sections.push(h('section', { class: 'card' },
      h('h2', null, 'Sharing with the family'),
      h('p', null, 'Right now this journal is saved only in this browser on this device. To share one journal with everyone, it needs to be connected to a free online database. It takes one set-up, once.'),
      h('a', { class: 'btn primary', href: REPO_GUIDE, target: '_blank', rel: 'noopener' }, 'Open the setup guide')));
  } else {
    sections.push(familySection(appUrl));
  }

  sections.push(listSection('person', 'Who was there? — the list', 'Add someone new'));
  sections.push(listSection('activity', 'What did we do? — the list', 'Add a new activity'));

  sections.push(h('section', { class: 'card' },
    h('h2', null, 'Put it on your Home Screen'),
    h('p', null, 'On iPhone or iPad: open this page in Safari, tap the Share button, then “Add to Home Screen”. On Android: tap ⋮ then “Add to Home screen”.'),
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', onclick: async () => {
        try { await navigator.clipboard.writeText(appUrl); toast('Link copied.'); } catch (e) { toast('Copy this link: ' + appUrl, true); }
      } }, '🔗 Copy the app link'))));

  if (store.mode === 'cloud') {
    sections.push(h('section', { class: 'card' },
      h('p', null, 'Signed in as ', h('strong', null, state.email)),
      h('button', { class: 'btn', type: 'button', onclick: async () => {
        if (state.dirty && !(await askConfirm('Sign out without saving?', 'Sign out', true))) return;
        state.dirty = false;
        await store.signOut();
      } }, 'Sign out')));
  }
  sections.push(h('p', { class: 'muted small center' }, 'Island Dreams ' + VERSION));
  show(...sections);
}

function familySection(appUrl) {
  const list = h('ul', { class: 'members' });
  const inviteBox = h('div', { class: 'note', hidden: true });

  function draw() {
    list.replaceChildren(...state.members.map((m) => h('li', null,
      h('div', null, h('strong', null, m.name || m.email), m.name ? h('div', { class: 'small muted' }, m.email) : null),
      m.email === state.email ? h('span', { class: 'small muted' }, 'you') : h('button', {
        type: 'button', class: 'btn link danger', onclick: async () => {
          if (!(await askConfirm(`Remove ${m.name || m.email} from the family list? They will no longer be able to open the journal. Their entries stay.`, 'Remove', true))) return;
          try {
            await store.removeMember(m.email);
            state.members = await store.listMembers();
            draw();
          } catch (e) { toast(errorText(e), true); }
        }
      }, 'Remove'))));
  }

  const name = h('input', { type: 'text', id: 'mName', placeholder: 'Name', maxlength: 60, autocomplete: 'off' });
  const email = h('input', { type: 'email', id: 'mEmail', placeholder: 'name@example.com', required: true, autocomplete: 'off' });
  const form = h('form', {
    class: 'add-member',
    onsubmit: async (ev) => {
      ev.preventDefault();
      const who = name.value.trim() || email.value.trim();
      const address = email.value.trim().toLowerCase();
      try {
        await store.addMember(address, name.value);
        state.members = await store.listMembers();
        draw();
        name.value = '';
        email.value = '';
        const body = `Hi ${who},\n\nYou're invited to Island Dreams, our family journal from camp.\n\n` +
          `1. Open ${appUrl}\n2. Type this email address: ${address}\n3. We'll email you a code — type it in and you're in.\n\n` +
          `On an iPhone, tap Share then "Add to Home Screen" to keep it handy.`;
        inviteBox.replaceChildren(
          h('p', null, `${who} can sign in now. Let them know:`),
          h('a', { class: 'btn primary', href: `mailto:${encodeURIComponent(address)}?subject=${encodeURIComponent('Join our Island Dreams journal')}&body=${encodeURIComponent(body)}` }, '✉️ Email them an invitation'));
        inviteBox.hidden = false;
      } catch (e) { toast(errorText(e), true); }
    }
  },
  h('label', { for: 'mName' }, 'Name'), name,
  h('label', { for: 'mEmail' }, 'Email address'), email,
  h('button', { class: 'btn primary', type: 'submit' }, 'Add a family member'));

  draw();
  return h('section', { class: 'card' },
    h('h2', null, 'Family'),
    h('p', { class: 'small muted' }, 'Everyone on this list can sign in with their email and read and write the journal.'),
    list, form, inviteBox);
}

function listSection(kind, heading, addPrompt) {
  const chips = h('div', { class: 'chips' });
  function draw() {
    chips.replaceChildren(...optionLabels(kind).map((l) => h('button', {
      type: 'button', class: 'chip ' + kind + ' removable', 'aria-label': `Remove ${l} from the list`,
      onclick: async () => {
        if (!(await askConfirm(`Take “${l}” off the list? Entries that already have it keep it.`, 'Take it off', true))) return;
        try {
          await store.removeOption(kind, l);
          state.options = await store.listOptions();
          draw();
        } catch (e) { toast(errorText(e), true); }
      }
    }, (kind === 'activity' ? icon(l) + ' ' : '') + l, h('span', { 'aria-hidden': 'true' }, '✕'))));
  }
  const input = h('input', { type: 'text', maxlength: 40, placeholder: addPrompt, 'aria-label': addPrompt });
  const form = h('form', {
    class: 'ms-add',
    onsubmit: async (ev) => {
      ev.preventDefault();
      const label = input.value.trim().replace(/\s+/g, ' ');
      if (!label) return;
      try {
        await store.addOption(kind, label);
        state.options = await store.listOptions();
        input.value = '';
        draw();
      } catch (e) { toast(errorText(e), true); }
    }
  }, input, h('button', { class: 'btn', type: 'submit' }, 'Add'));
  draw();
  return h('section', { class: 'card' }, h('h2', null, heading),
    h('p', { class: 'small muted' }, 'Tap a name to take it off the list.'), chips, form);
}

boot();
