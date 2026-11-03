/* Lucky Seven Casino: shared roster, sound and UI helpers. Play money only. */
(function () {
  'use strict';
  const ROSTER_KEY = 'luckyseven.roster.v1', MUTE_KEY = 'luckyseven.muted', SEATS_KEY = 'luckyseven.seats.';
  const START_BANK = 1000, MAX_PLAYERS = 6;
  const CHIPS = [1, 5, 25, 100, 500];
  const PCOLORS = ['#ffd34d', '#5ec8ff', '#ff7aa0', '#7dffa0', '#c79bff', '#ff9a4d'];
  const CPU_NAMES = ['Lucky Lou', 'Dice Dana', 'Penny Pitboss', 'High-Roll Hank', 'Cora Cards', 'Reel Rita', 'Big Tony', 'Vegas Vic', 'Sly Sam', 'Nina Nickels'];
  const r2 = x => Math.round(x * 100 + 1e-9) / 100;

  function money(n) {
    const neg = n < 0; n = Math.abs(n);
    const s = Math.abs(n - Math.round(n)) < 0.005 ? Math.round(n).toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (neg ? '-$' : '$') + s;
  }
  const signed = n => (n > 0 ? '+' : n < 0 ? '-' : '') + money(Math.abs(n));

  /* ---------- tiny DOM helper ---------- */
  function h(tag, props) {
    const e = document.createElement(tag);
    for (const k in (props || {})) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.slice(0, 2) === '--') e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; } }
      else if (k === 'html') e.innerHTML = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, v);
    }
    for (let i = 2; i < arguments.length; i++) {
      const kids = [].concat(arguments[i]);
      for (const c of kids) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
    }
    return e;
  }

  /* ---------- roster (shared by every table) ---------- */
  let roster = null;
  function defaultRoster() {
    return [
      { id: 'p1', name: 'You', human: true, bank: START_BANK, peak: START_BANK, rebuys: 0, color: PCOLORS[0], style: 0 },
      { id: 'p2', name: 'Lucky Lou', human: false, bank: START_BANK, peak: START_BANK, rebuys: 0, color: PCOLORS[1], style: 0 },
      { id: 'p3', name: 'Dice Dana', human: false, bank: START_BANK, peak: START_BANK, rebuys: 0, color: PCOLORS[2], style: 1 }
    ];
  }
  function load() {
    if (roster) return roster;
    try { const d = JSON.parse(localStorage.getItem(ROSTER_KEY)); if (Array.isArray(d) && d.length) roster = d.filter(p => p && p.id && typeof p.bank === 'number'); } catch (e) { /* storage blocked */ }
    if (!roster || !roster.length) roster = defaultRoster();
    return roster;
  }
  function save() { try { localStorage.setItem(ROSTER_KEY, JSON.stringify(roster)); } catch (e) { /* ignore */ } }
  function list() { return load(); }
  function byId(id) { return load().find(p => p.id === id); }
  function nextColor() { const used = new Set(load().map(p => p.color)); return PCOLORS.find(c => !used.has(c)) || PCOLORS[load().length % PCOLORS.length]; }
  function addPlayer(name, human) {
    const r = load(); if (r.length >= MAX_PLAYERS) return null;
    const used = new Set(r.map(p => p.name));
    const nm = (name || '').trim() || (human ? 'Player ' + (r.length + 1) : (CPU_NAMES.find(n => !used.has(n)) || 'Guest ' + (r.length + 1)));
    const p = { id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 99), name: nm.slice(0, 14), human: !!human, bank: START_BANK, peak: START_BANK, rebuys: 0, color: nextColor(), style: Math.floor(Math.random() * 6) };
    r.push(p); save(); return p;
  }
  function removePlayer(id) { const r = load(); const i = r.findIndex(p => p.id === id); if (i >= 0 && r.length > 1) { r.splice(i, 1); save(); return true; } return false; }
  function rebuy(p) { p.bank = r2(p.bank + START_BANK); p.rebuys = (p.rebuys || 0) + 1; save(); }
  function touch(p) { if (p.bank > (p.peak || 0)) p.peak = p.bank; }
  function resetAll() { roster = defaultRoster(); save(); return roster; }

  /* ---------- sound ---------- */
  let AC = null, muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* ignore */ }
  function ctxA() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function tone(f, d, type, v, slide, delay) {
    const a = ctxA(); if (!a || muted) return; const t = a.currentTime + (delay || 0);
    const o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v || .1, t); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
  }
  function noise(d, v, fc, delay, hp) {
    const a = ctxA(); if (!a || muted) return; const n = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = hp ? 'highpass' : 'lowpass'; f.frequency.value = fc || 2000;
    const g = a.createGain(); g.gain.value = v; s.connect(f); f.connect(g); g.connect(a.destination); s.start(a.currentTime + (delay || 0));
  }
  function sfx(n) {
    switch (n) {
      case 'click': tone(700, .04, 'triangle', .07); break;
      case 'chip': tone(1900, .05, 'square', .035); tone(1250, .07, 'triangle', .06, 0, .02); break;
      case 'chips': for (let i = 0; i < 4; i++) { tone(1700 + i * 130, .05, 'square', .03, 0, i * .05); tone(1100, .06, 'triangle', .05, 0, i * .05 + .01); } break;
      case 'dice': for (let i = 0; i < 8; i++) noise(.05, .22, 2600 + Math.random() * 1500, i * .09 + Math.random() * .03, true); break;
      case 'land': noise(.08, .3, 1800); tone(180, .08, 'sine', .14, -80); break;
      case 'card': noise(.07, .24, 2400, 0, true); break;
      case 'tick': tone(1400, .02, 'square', .04); break;
      case 'spin': noise(.9, .1, 700); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, 'triangle', .12, 0, i * .07)); break;
      case 'big': [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, .2, 'triangle', .13, 0, i * .08)); break;
      case 'lose': [330, 294, 262].forEach((f, i) => tone(f, .2, 'sawtooth', .05, 0, i * .1)); break;
      case 'push': tone(500, .12, 'triangle', .08); break;
      case 'bell': tone(1320, .5, 'sine', .1); tone(1980, .4, 'sine', .05, 0, .02); break;
    }
  }
  function setMuted(m) { muted = !!m; try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ } }
  const isMuted = () => muted;

  /* ---------- toast / modal ---------- */
  let toastEl = null, toastT = 0;
  function toast(msg) {
    if (toastEl) toastEl.remove(); toastEl = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(toastEl);
    clearTimeout(toastT); toastT = setTimeout(() => { if (toastEl) { toastEl.remove(); toastEl = null; } }, 2600);
  }
  function modal(title, body, buttons) {
    const m = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    m.addEventListener('click', e => { if (e.target === m) close(); });
    const sheet = h('div', { class: 'sheet' }, h('h2', null, title), body);
    const bar = h('div', { class: 'row c', style: { marginTop: '14px' } });
    (buttons || [{ label: 'Close' }]).forEach(b => bar.append(h('button', { class: 'btn sm ' + (b.cls || 'ghost'), type: 'button', onclick: () => { if (!b.keep) close(); if (b.fn) b.fn(); } }, b.label)));
    sheet.append(bar); m.append(sheet); document.body.append(m);
    return { close, el: m, sheet };
  }
  function pop(el, text, kind) {
    const s = h('span', { class: 'pop ' + (kind || 'win') }, text); el.append(s); setTimeout(() => s.remove(), 1700);
  }

  /* ---------- who is sitting at this table? ---------- */
  function seatKey(game) { return SEATS_KEY + game; }
  function pickSeats(container, opts) {
    const r = load();
    let chosen = [];
    try { chosen = JSON.parse(localStorage.getItem(seatKey(opts.game))) || []; } catch (e) { /* ignore */ }
    chosen = chosen.filter(id => r.some(p => p.id === id));
    if (!chosen.length) chosen = r.slice(0, Math.min(opts.max, r.length)).map(p => p.id);
    function paint() {
      container.innerHTML = '';
      const hasHuman = chosen.some(id => byId(id) && byId(id).human);
      const box = h('div', { class: 'picker panel' },
        h('h2', null, opts.title),
        h('p', { class: 'sub' }, opts.blurb),
        h('div', { class: 'plist' }, r.map((p, i) => {
          const on = chosen.includes(p.id);
          return h('button', { class: 'pcard', type: 'button', 'aria-pressed': on, style: { '--pc': p.color }, onclick: () => {
            if (on) chosen = chosen.filter(x => x !== p.id);
            else if (chosen.length < opts.max) chosen.push(p.id); else { toast('This table seats ' + opts.max + '.'); return; }
            sfx('click'); paint();
          } },
            h('span', { class: 'sw' }, p.name[0].toUpperCase()),
            h('span', null, h('b', null, p.name), h('small', null, (p.human ? 'Human' : 'Computer') + (p.bank < 5 ? ' · out of chips' : ''))),
            h('span', { style: { textAlign: 'right' } }, h('div', { class: 'bk' }, money(p.bank)), h('span', { class: 'sit' }, on ? 'Seated' : 'Stand')));
        })),
        h('div', { class: 'row c' },
          r.length < MAX_PLAYERS ? h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { const p = addPlayer('', false); if (p && chosen.length < opts.max) chosen.push(p.id); sfx('click'); paint(); } }, '+ Add a computer player') : null,
          h('a', { class: 'btn sm ghost', href: 'casino.html' }, 'Cashier & players')),
        h('p', { class: 'sub', style: { marginTop: '12px' } }, hasHuman ? 'Pass the phone around: every human player bets on their own turn.' : 'Seat at least one human player to bet.'),
        h('div', { class: 'row c' }, h('button', { class: 'btn big', type: 'button', disabled: !hasHuman || chosen.length < 1, onclick: () => {
          try { localStorage.setItem(seatKey(opts.game), JSON.stringify(chosen)); } catch (e) { /* ignore */ }
          sfx('chips'); opts.onStart(chosen.map(byId)); } }, 'Take your seats')),
        h('p', { class: 'sub', style: { fontSize: '11px', marginTop: '12px' } }, 'Play money only. No real money, no prizes, no purchases.'));
      container.append(box);
    }
    paint();
  }

  /* chips drawn from CSS */
  function chipEl(v, extra) { return h('span', { class: 'chip c' + v + (extra ? ' ' + extra : '') }, h('span', null, v >= 1000 ? (v / 1000) + 'K' : String(v))); }
  function chipTray(selected, onPick) {
    const tray = h('div', { class: 'tray', role: 'group', 'aria-label': 'Chip size' });
    CHIPS.forEach(v => tray.append(h('button', { type: 'button', 'aria-label': money(v) + ' chip', 'aria-pressed': v === selected, onclick: () => onPick(v) }, chipEl(v))));
    return tray;
  }

  function registerSW() { if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { })); }

  window.Casino = { START_BANK, MAX_PLAYERS, CHIPS, PCOLORS, money, signed, h, list, byId, save, addPlayer, removePlayer, rebuy, touch, resetAll,
    sfx, setMuted, isMuted, toast, modal, pop, pickSeats, chipEl, chipTray, registerSW, r2 };
})();
