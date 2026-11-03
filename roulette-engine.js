/* Roulette rules engine: pure logic, no DOM. Play money only.
   Pocket 37 stands for the double zero (00). Browser: window.Roulette. Node: module.exports. */
(function (root) {
  'use strict';

  const r2 = x => Math.round(x * 100 + 1e-9) / 100;
  const AMERICAN = [0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 37, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2];
  const EUROPEAN = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const PAY = { straight: 35, split: 17, street: 11, trio: 11, corner: 8, first4: 8, six: 5, basket: 6, column: 2, dozen: 2, even: 1 };
  const KIND_NAME = { straight: 'Straight up', split: 'Split', street: 'Street', trio: 'Trio', corner: 'Corner', first4: 'First four', six: 'Six line', basket: 'Basket', column: 'Column', dozen: 'Dozen', even: 'Even money' };

  const label = n => n === 37 ? '00' : String(n);
  const color = n => (n === 0 || n === 37) ? 'green' : REDS.has(n) ? 'red' : 'black';
  const pockets = type => type === 'american' ? AMERICAN : EUROPEAN;

  function spin(type, rng) { const w = pockets(type); const index = Math.floor((rng || Math.random)() * w.length); return { index, n: w[index] }; }

  const rangeNums = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
  const NUMS_36 = rangeNums(1, 36);

  /* build a bet spec; key makes identical bets merge */
  function spec(kind, nums, name) {
    nums = nums.slice().sort((a, b) => a - b);
    return { kind, nums, name: name || (KIND_NAME[kind] + ' ' + nums.map(label).join('-')), key: kind + ':' + (name || '') + ':' + nums.join(',') };
  }
  const straight = n => spec('straight', [n], 'Straight ' + label(n));
  const outside = {
    red: () => spec('even', NUMS_36.filter(n => color(n) === 'red'), 'Red'),
    black: () => spec('even', NUMS_36.filter(n => color(n) === 'black'), 'Black'),
    odd: () => spec('even', NUMS_36.filter(n => n % 2 === 1), 'Odd'),
    even: () => spec('even', NUMS_36.filter(n => n % 2 === 0), 'Even'),
    low: () => spec('even', rangeNums(1, 18), '1 to 18'),
    high: () => spec('even', rangeNums(19, 36), '19 to 36'),
    dozen: d => spec('dozen', rangeNums(d * 12 + 1, d * 12 + 12), ['1st 12', '2nd 12', '3rd 12'][d]),
    column: c => spec('column', NUMS_36.filter(n => (n - 1) % 3 === c), ['Column 1', 'Column 2', 'Column 3'][c])
  };
  const basket = () => spec('basket', [0, 37, 1, 2, 3], 'Basket 0-00-1-2-3');
  const first4 = () => spec('first4', [0, 1, 2, 3], 'First four 0-1-2-3');

  /* Call bets on the European wheel: lists of chips (each chip is its own bet) */
  const CALLS = {
    'Voisins du zéro': [[spec('trio', [0, 2, 3]), 2], [spec('split', [4, 7]), 1], [spec('split', [12, 15]), 1], [spec('split', [18, 21]), 1], [spec('split', [19, 22]), 1], [spec('corner', [25, 26, 28, 29]), 2], [spec('split', [32, 35]), 1]],
    'Orphelins': [[spec('straight', [1], 'Straight 1'), 1], [spec('split', [6, 9]), 1], [spec('split', [14, 17]), 1], [spec('split', [17, 20]), 1], [spec('split', [31, 34]), 1]],
    'Tiers du cylindre': [[spec('split', [5, 8]), 1], [spec('split', [10, 11]), 1], [spec('split', [13, 16]), 1], [spec('split', [23, 24]), 1], [spec('split', [27, 30]), 1], [spec('split', [33, 36]), 1]],
    'Jeu zéro': [[spec('split', [0, 3]), 1], [spec('split', [12, 15]), 1], [spec('split', [32, 35]), 1], [spec('straight', [26], 'Straight 26'), 1]]
  };

  function create(players, type) { return { players, type: type || 'american', bets: [], last: [], history: [], nextId: 1, spins: 0 }; }

  function addBet(t, p, s, amt) {
    amt = r2(+amt); const pl = t.players[p];
    if (!(amt > 0)) return { ok: false, error: 'Pick a chip first.' };
    if (s.nums.some(n => n === 37) && t.type !== 'american') return { ok: false, error: 'There is no double zero on this wheel.' };
    if (pl.bank + 1e-9 < amt) return { ok: false, error: 'Not enough chips.' };
    const ex = t.bets.find(b => b.p === p && b.spec.key === s.key);
    const total = r2((ex ? ex.amt : 0) + amt);
    if (total > 1000) return { ok: false, error: 'Table maximum on one spot is $1,000.' };
    pl.bank = r2(pl.bank - amt);
    if (ex) ex.amt = total; else t.bets.push({ id: t.nextId++, p, spec: s, amt });
    return { ok: true };
  }
  function undo(t, p, stack) {
    // stack: array of {key, amt} the UI keeps, last entry removed first
    const e = stack.pop(); if (!e) return false;
    const i = t.bets.findIndex(b => b.p === p && b.spec.key === e.key); if (i < 0) return false;
    const b = t.bets[i], back = Math.min(b.amt, e.amt); b.amt = r2(b.amt - back); t.players[p].bank = r2(t.players[p].bank + back);
    if (b.amt <= 0) t.bets.splice(i, 1); return true;
  }
  /* take back chips from one spot (used by Undo) */
  function reduce(t, p, key, amt) {
    const i = t.bets.findIndex(b => b.p === p && b.spec.key === key); if (i < 0) return false;
    const b = t.bets[i], back = Math.min(b.amt, r2(amt)); b.amt = r2(b.amt - back); t.players[p].bank = r2(t.players[p].bank + back);
    if (b.amt <= 0.001) t.bets.splice(i, 1); return true;
  }
  function clear(t, p) {
    let back = 0; t.bets = t.bets.filter(b => { if (b.p === p) { back += b.amt; return false; } return true; });
    t.players[p].bank = r2(t.players[p].bank + back); return back;
  }
  const total = (t, p) => r2(t.bets.filter(b => b.p === p).reduce((s, b) => s + b.amt, 0));

  /* resolve all bets for the pocket number n. Returns per-bet results and per-player net. */
  function settle(t, n) {
    const net = t.players.map(() => 0), results = [];
    for (const b of t.bets) {
      const hit = b.spec.nums.includes(n);
      const profit = hit ? r2(b.amt * PAY[b.spec.kind]) : 0;
      const ret = hit ? r2(b.amt + profit) : 0;
      t.players[b.p].bank = r2(t.players[b.p].bank + ret);
      net[b.p] = r2(net[b.p] + (hit ? profit : -b.amt));
      results.push({ p: b.p, spec: b.spec, amt: b.amt, hit, profit, ret });
    }
    t.last = t.bets.map(b => ({ p: b.p, spec: b.spec, amt: b.amt }));
    t.bets = []; t.history.unshift(n); if (t.history.length > 60) t.history.pop(); t.spins++;
    return { n, results, net };
  }

  /* expected value per unit staked, over every pocket of the chosen wheel */
  function ev(type, s) {
    const w = pockets(type); let sum = 0;
    for (const n of w) sum += s.nums.includes(n) ? PAY[s.kind] : -1;
    return sum / w.length;
  }

  /* computer bettors */
  const STYLES = ['Red Rita', 'Lucky-number Lou', 'Dozens Dana', 'Column Carl', 'Corner Connie', 'Spread Sam'];
  function cpuBets(t, p, style, rng) {
    rng = rng || Math.random; const pl = t.players[p]; style = ((style % 6) + 6) % 6;
    const put = (s, a) => { if (pl.bank >= a) addBet(t, p, s, a); };
    const pick = () => 1 + Math.floor(rng() * 36);
    if (pl.bank < 20) return;
    switch (style) {
      case 0: put(rng() < 0.5 ? outside.red() : outside.black(), 10); break;
      case 1: put(straight(pick()), 5); put(straight(pick()), 5); put(straight(pick()), 5); break;
      case 2: put(outside.dozen(Math.floor(rng() * 3)), 10); put(outside.dozen(Math.floor(rng() * 3)), 10); break;
      case 3: put(outside.column(Math.floor(rng() * 3)), 15); put(rng() < 0.5 ? outside.odd() : outside.even(), 10); break;
      case 4: { const r = Math.floor(rng() * 11), c = Math.floor(rng() * 2); const a = r * 3 + c + 1; put(spec('corner', [a, a + 1, a + 3, a + 4]), 8); put(straight(pick()), 3); break; }
      case 5: put(outside.red(), 5); put(outside.odd(), 5); put(straight(pick()), 3); put(spec('split', (() => { const a = pick(); return a % 3 ? [a, a + 1] : [a, a - 1]; })()), 4); break;
    }
  }

  const api = { AMERICAN, EUROPEAN, PAY, KIND_NAME, CALLS, STYLES, label, color, pockets, spin, spec, straight, outside, basket, first4,
    create, addBet, undo, reduce, clear, total, settle, ev, cpuBets, r2 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Roulette = api;
})(typeof window !== 'undefined' ? window : globalThis);
