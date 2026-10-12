/* Island Dreams — the family camp journal.

   Screens (the part of the address after #):
     #/            the journal, newest first
     #/new         write an entry
     #/entry/<id>  read one entry
     #/edit/<id>   change or delete an entry
     #/settings    family list, drop-down lists, sharing

   Everything a person typed is put on the page with textContent,
   never as HTML. */

import { createStore } from './store.js';
import { preparePhoto } from './photos.js';

export const VERSION = '1.0.0';
const REPO_GUIDE = 'https://github.com/lemassif/bug-free-octo-succotash/blob/main/ISLAND.md';
const DRAFT_KEY = 'island-dreams-draft';
const PENDING_EMAIL_KEY = 'island-dreams-email';

const ICONS = {
  'Fish caught': '🎣', 'Campfire': '🔥', 'Boating': '🚤', 'Boat sightings': '🚢',
  'Tubing': '🛟', 'Swimming': '🏊', 'Cooking on the boat': '🍳', 'Geocaching': '🧭',
  'Sightseeing': '📸', 'Fireworks': '🎆'
};
const icon = (label) => ICONS[label] || '⭐';

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

function fmtDate(entry, opts) {
  const d = parseDate(entry.entry_date);
  let s = d.toLocaleDateString(undefined, {
    weekday: (opts && opts.short) ? 'short' : 'long',
    month: (opts && opts.short) ? 'short' : 'long',
    day: 'numeric',
    year: 'numeric'
  });
  if (entry.entry_time) {
    const [hh, mm] = entry.entry_time.split(':').map(Number);
    const t = new Date(d);
    t.setHours(hh, mm);
    s += ' · ' + t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
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
    String(b.entry_time || '').localeCompare(String(a.entry_time || '')) ||
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
    if (event === 'SIGNED_OUT' || (event === 'SIGNED_IN' && !state.signedIn)) authCheck();
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
  try { session = await store.session(); } catch (e) { session = null; }
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
  $('fabNew').hidden = true;
  $('btnBack').hidden = true;
}

function renderSignIn() {
  let pending = '';
  try { pending = sessionStorage.getItem(PENDING_EMAIL_KEY) || ''; } catch (e) { /* ignore */ }
  const hashError = /error_description=([^&]+)/.exec(location.hash);
  if (hashError) toast(decodeURIComponent(hashError[1].replace(/\+/g, ' ')), true);

  const remember = (v) => { try { v ? sessionStorage.setItem(PENDING_EMAIL_KEY, v) : sessionStorage.removeItem(PENDING_EMAIL_KEY); } catch (e) { /* ignore */ } };

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
    if (!confirm('Leave without saving this entry?')) {
      ignoreHash = true;
      location.hash = currentHash;
      return;
    }
    state.dirty = false;
  }
  currentHash = location.hash;
  const hash = location.hash || '#/';
  let m;
  const top = hash === '#/' || hash === '#' || hash === '' || !hash.startsWith('#/');
  $('btnBack').hidden = top;
  $('fabNew').hidden = !top;
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
    return [e.title, e.body, ...e.people, ...e.activities, nameFor(e.author_email), fmtDate(e)]
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
  const shown = e.photos.slice(0, 4);
  return h('a', { class: 'entry-card', href: '#/entry/' + e.id },
    h('div', { class: 'when' }, fmtDate(e, { short: true })),
    e.title ? h('h3', null, e.title) : null,
    firstLine ? h('p', { class: 'preview' }, firstLine) : null,
    chipRow(e),
    shown.length ? h('div', { class: 'thumbs' }, shown.map((p, i) => {
      const img = h('img', { alt: '', loading: 'lazy' });
      thumbs.push([p, img]);
      const extra = i === 3 && e.photos.length > 4 ? h('span', { class: 'more' }, '+' + (e.photos.length - 4)) : null;
      return h('div', { class: 'thumb' }, img, extra);
    })) : null);
}

function chipRow(e) {
  if (!e.people.length && !e.activities.length) return null;
  return h('div', { class: 'chips' },
    ordered('person', e.people).map((p) => h('span', { class: 'chip person' }, p)),
    ordered('activity', e.activities).map((a) => h('span', { class: 'chip activity' }, icon(a) + ' ' + a)));
}

async function fillThumbs(pairs) {
  if (!pairs.length) return;
  try {
    const urls = await store.photoUrls(pairs.map(([p]) => p), 'thumb');
    pairs.forEach(([p, img]) => { if (urls.has(p.id)) img.src = urls.get(p.id); });
  } catch (e) { /* thumbnails stay blank offline */ }
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

function entryText(e) {
  const lines = ['Island Dreams — ' + fmtDate(e)];
  if (e.title) lines.push(e.title);
  lines.push('');
  if (e.people.length) lines.push('Who: ' + ordered('person', e.people).join(', '));
  if (e.activities.length) lines.push('What: ' + ordered('activity', e.activities).join(', '));
  if (e.people.length || e.activities.length) lines.push('');
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
  const withPhotos = h('button', { class: 'btn', type: 'button' }, e.photos.length ? '📤 Share with photos' : '📤 Share…');
  withPhotos.addEventListener('click', async () => {
    if (files || !e.photos.length) {
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
      const urls = await store.photoUrls(e.photos, 'full');
      files = await Promise.all(e.photos.map(async (p, i) => {
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
    const urls = await store.photoUrls([p], 'full');
    if (lb.photos[lb.index] === p) img.src = urls.get(p.id);
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
    entry_time: (src.entry_time || (existing ? '' : now.time) || '').slice(0, 5),
    title: src.title || '',
    body: src.body || '',
    people: new Set(src.people || []),
    activities: new Set(src.activities || [])
  };
  const photos = existing ? [...existing.photos] : []; // already saved
  const removed = [];                                  // saved, marked for removal
  const pending = [];                                  // new: { key, img, url }

  const markDirty = () => {
    state.dirty = true;
    if (!form.id) {
      writeDraft({
        entry_date: form.entry_date, entry_time: form.entry_time, title: form.title, body: form.body,
        people: [...form.people], activities: [...form.activities]
      });
    }
  };

  const date = h('input', { type: 'date', id: 'fDate', required: true, value: form.entry_date, max: '2100-12-31',
    oninput: () => { form.entry_date = date.value; markDirty(); } });
  const time = h('input', { type: 'time', id: 'fTime', value: form.entry_time,
    oninput: () => { form.entry_time = time.value; markDirty(); } });
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

  const save = h('button', { class: 'btn primary big', type: 'submit' }, existing ? 'Save changes' : 'Save entry');

  async function onSave(ev) {
    ev.preventDefault();
    if (!form.entry_date) { toast('Please pick a date.'); date.focus(); return; }
    save.disabled = true;
    save.textContent = 'Saving…';
    try {
      const saved = await store.saveEntry({
        id: form.id, entry_date: form.entry_date, entry_time: form.entry_time,
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
    if (!confirm('Delete this entry and its photos for everyone? This cannot be undone.')) return;
    try {
      await store.deleteEntry({ ...existing, photos: [...photos, ...removed] });
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
      h('div', null, h('label', { for: 'fDate' }, 'Date'), date),
      h('div', null, h('label', { for: 'fTime' }, 'Time'), time)),
    h('label', { for: 'msPeople' }, 'Who was there?'),
    multiSelect({ kind: 'person', id: 'msPeople', prompt: 'Choose people', addPrompt: 'Add someone new',
      selected: form.people, onChange: markDirty }),
    h('label', { for: 'msActivities' }, 'What did we do?'),
    multiSelect({ kind: 'activity', id: 'msActivities', prompt: 'Choose activities', addPrompt: 'Add a new activity',
      selected: form.activities, onChange: markDirty }),
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
        try { await navigator.clipboard.writeText(appUrl); toast('Link copied.'); } catch (e) { prompt('Copy this link:', appUrl); }
      } }, '🔗 Copy the app link'))));

  if (store.mode === 'cloud') {
    sections.push(h('section', { class: 'card' },
      h('p', null, 'Signed in as ', h('strong', null, state.email)),
      h('button', { class: 'btn', type: 'button', onclick: async () => {
        if (state.dirty && !confirm('Sign out without saving?')) return;
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
          if (!confirm(`Remove ${m.name || m.email} from the family list? They will no longer be able to open the journal. Their entries stay.`)) return;
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
        if (!confirm(`Take “${l}” off the list? Entries that already have it keep it.`)) return;
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
