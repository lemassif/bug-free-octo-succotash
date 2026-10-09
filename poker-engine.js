/* Lucky Seven Casino: poker rules engine for Face Up Pai Gow Poker and Texas Hold'em.
   Pure logic, no DOM. Browser: window.Poker. Node: module.exports. Play money only. */
(function (root) {
  'use strict';
  const SUITS = ['S', 'H', 'D', 'C'];
  const RN = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const rankName = r => RN[r] || String(r);
  const r2 = x => Math.round(x * 100 + 1e-9) / 100;
  function rngFrom(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function deck(joker) { const d = []; let id = 0; for (const s of SUITS) for (let r = 2; r <= 14; r++) d.push({ r, s, id: id++ }); if (joker) d.push({ r: 14, s: 'J', joker: true, id: id++ }); return d; }
  function shuffle(a, rng) { rng = rng || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------------- hand ranking ----------------
     score = [category, ...tiebreak ranks]; compare lexicographically.
     0 high card, 1 pair, 2 two pair, 3 trips, 4 straight, 5 flush, 6 full house, 7 quads, 8 straight flush, 9 five aces */
  const CAT = ['High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush', 'Five aces'];
  function cmp(a, b) { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; }
  function evalPlain(cs) {   // exactly 5 natural cards
    const rs = cs.map(c => c.r).sort((a, b) => b - a), flush = cs.every(c => c.s === cs[0].s);
    const cnt = {}; rs.forEach(r => cnt[r] = (cnt[r] || 0) + 1);
    const groups = Object.keys(cnt).map(Number).sort((a, b) => cnt[b] - cnt[a] || b - a), shape = groups.map(g => cnt[g]);
    let straightHi = 0;
    if (groups.length === 5) { if (rs[0] - rs[4] === 4) straightHi = rs[0]; else if (rs[0] === 14 && rs[1] === 5) straightHi = 5; }
    if (shape[0] === 5) return [9, groups[0]];
    if (straightHi && flush) return [8, straightHi];
    if (shape[0] === 4) return [7, groups[0], groups[1]];
    if (shape[0] === 3 && shape[1] === 2) return [6, groups[0], groups[1]];
    if (flush) return [5].concat(rs);
    if (straightHi) return [4, straightHi];
    if (shape[0] === 3) return [3].concat(groups);
    if (shape[0] === 2 && shape[1] === 2) return [2].concat(groups);
    if (shape[0] === 2) return [1].concat(groups);
    return [0].concat(rs);
  }
  /* pai gow joker: counts as an ace, or completes a straight, flush or straight flush */
  function eval5(cs) {
    const j = cs.findIndex(c => c.joker); if (j < 0) return evalPlain(cs);
    const rest = cs.filter((c, i) => i !== j);
    let best = evalPlain(rest.concat([{ r: 14, s: 'X' }]));
    if (rest.filter(c => c.r === 14).length === 4) return [9, 14];
    for (let r = 2; r <= 14; r++) for (const s of SUITS) {
      const e = evalPlain(rest.concat([{ r, s }]));
      if ((e[0] === 4 || e[0] === 5 || e[0] === 8) && cmp(e, best) > 0) best = e;
    }
    return best;
  }
  function eval2(cs) {   // pai gow low hand: [1, pair] or [0, high, low]; joker plays as an ace
    const rs = cs.map(c => c.joker ? 14 : c.r).sort((a, b) => b - a);
    return rs[0] === rs[1] ? [1, rs[0]] : [0, rs[0], rs[1]];
  }
  function combos(n, k) { const out = [], cur = []; (function go(i) { if (cur.length === k) { out.push(cur.slice()); return; } for (let j = i; j < n; j++) { cur.push(j); go(j + 1); cur.pop(); } })(0); return out; }
  const C75 = combos(7, 5), C72 = combos(7, 2);
  function best5(cards) {   // best five of seven (or fewer)
    if (cards.length <= 5) return { score: eval5(cards), cards: cards.slice() };
    let best = null, bc = null;
    for (const ix of (cards.length === 7 ? C75 : combos(cards.length, 5))) { const cs = ix.map(i => cards[i]), e = eval5(cs); if (!best || cmp(e, best) > 0) { best = e; bc = cs; } }
    return { score: best, cards: bc };
  }
  function describe(score) {
    const c = score[0], n = rankName, pl = plural;
    switch (c) {
      case 9: return 'Five aces'; case 8: return score[1] === 14 ? 'Royal flush' : 'Straight flush, ' + n(score[1]) + ' high';
      case 7: return 'Four ' + pl(score[1]); case 6: return 'Full house, ' + pl(score[1]) + ' over ' + pl(score[2]);
      case 5: return 'Flush, ' + n(score[1]) + ' high'; case 4: return 'Straight, ' + n(score[1]) + ' high';
      case 3: return 'Three ' + pl(score[1]); case 2: return 'Two pair, ' + pl(score[1]) + ' and ' + pl(score[2]);
      case 1: return 'Pair of ' + pl(score[1]); default: return n(score[1]) + ' high';
    }
  }
  function plural(r) { return { 14: 'Aces', 13: 'Kings', 12: 'Queens', 11: 'Jacks', 6: 'Sixes' }[r] || r + 's'; }
  const describe2 = e => e[0] ? 'Pair of ' + plural(e[1]) : rankName(e[1]) + '-' + rankName(e[2]);

  /* ================= Face Up Pai Gow Poker ================= */
  // the five-card hand must outrank the two-card hand
  function validSet(high, low) {
    const h = eval5(high), l = eval2(low);
    if (l[0] === 1) { if (h[0] >= 2) return true; return h[0] === 1 && h[1] > l[1]; }
    if (h[0] >= 1) return true;
    return cmp(h.slice(1), l.slice(1)) > 0;
  }
  // rough chance each hand wins against a typical dealer hand, used to set hands the house way
  function pHigh(e) {
    switch (e[0]) { case 0: return .03 + Math.max(0, e[1] - 8) * .025 + (e[1] === 14 ? .05 : 0); case 1: return .2 + (e[1] - 2) / 12 * .38; case 2: return .62 + (e[1] - 3) / 11 * .14;
      case 3: return .8 + (e[1] - 2) / 12 * .04; case 4: return .87; case 5: return .9; case 6: return .95; case 7: return .985; default: return .997; }
  }
  function pLow(e) { if (e[0]) return .74 + (e[1] - 2) / 12 * .25; const v = ((e[1] - 2) * 13 + (e[2] - 2)) / (12 * 13 + 11); return Math.min(.7, Math.pow(v, 2.2) * .74); }
  function splits(cards) {
    const out = [];
    for (const lo of C72) { const low = lo.map(i => cards[i]), high = cards.filter((c, i) => lo.indexOf(i) < 0); if (validSet(high, low)) out.push({ high, low }); }
    return out;
  }
  // house way: the split with the best expected result (win both +1, lose both -1, otherwise push)
  function houseWay(cards) {
    let best = null, bv = -9;
    for (const sp of splits(cards)) { const ph = pHigh(eval5(sp.high)), pl = pLow(eval2(sp.low)), v = ph * pl - (1 - ph) * (1 - pl) + ph * .001; if (v > bv) { bv = v; best = sp; } }
    return best;
  }
  // with the dealer's hand face up, the best possible setting can be found exactly
  function bestVsDealer(cards, dealer) {
    let best = null, bv = -9;
    for (const sp of splits(cards)) {
      const o = outcome(sp, dealer), v = (o === 'win' ? 1 : o === 'lose' ? -1 : 0) + (pHigh(eval5(sp.high)) * pLow(eval2(sp.low))) * .01;
      if (v > bv) { bv = v; best = sp; }
    }
    return best;
  }
  // a dealer "pai gow" with an ace on top: in Face Up Pai Gow every bet pushes
  function dealerAceHighPaiGow(cards7) { const b = best5(cards7).score; return b[0] === 0 && b[1] === 14; }
  function outcome(player, dealer) {   // copies (ties) go to the dealer
    const hi = cmp(eval5(player.high), eval5(dealer.high)) > 0, lo = cmp(eval2(player.low), eval2(dealer.low)) > 0;
    return hi && lo ? 'win' : !hi && !lo ? 'lose' : 'push';
  }
  /* Fortune bonus side bet on the best hand in all seven cards */
  const FORTUNE = [['7-card straight flush', 8000], ['Five aces', 400], ['Royal flush', 150], ['Straight flush', 50], ['Four of a kind', 25], ['Full house', 5], ['Flush', 4], ['Three of a kind', 3], ['Straight', 2]];
  function fortune(cards7) {
    const nat = cards7.filter(c => !c.joker);
    if (nat.length === 7 && nat.every(c => c.s === nat[0].s)) { const rs = nat.map(c => c.r).sort((a, b) => a - b); if (rs[6] - rs[0] === 6 && new Set(rs).size === 7) return { name: FORTUNE[0][0], pay: 8000 }; }
    const b = best5(cards7).score;
    const map = { 9: 1, 8: b[1] === 14 ? 2 : 3, 7: 4, 6: 5, 5: 6, 3: 7, 4: 8 }, k = map[b[0]];
    return k ? { name: FORTUNE[k][0], pay: FORTUNE[k][1] } : null;
  }
  function paiGowDeal(nPlayers, rng) { const d = shuffle(deck(true), rng), hands = []; for (let i = 0; i < nPlayers; i++) hands.push(d.slice(i * 7, i * 7 + 7)); return { hands, dealer: d.slice(nPlayers * 7, nPlayers * 7 + 7) }; }

  /* ================= Texas Hold'em (no limit) ================= */
  function heNew(players, opts) {
    opts = opts || {};
    return { seats: players.map(p => ({ p, hole: [], folded: true, allIn: false, bet: 0, total: 0, acted: false, last: '', out: false })),
      sb: opts.sb || 5, bb: opts.bb || 10, button: -1, board: [], deck: [], street: 'idle', toAct: -1, curBet: 0, minRaise: 0, pots: [], result: null, hands: 0, log: [] };
  }
  const live = t => t.seats.filter(s => !s.folded);
  const canAct = s => !s.folded && !s.allIn && !s.out;
  function nextIdx(t, i, pred) { const n = t.seats.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (pred(t.seats[j], j)) return j; } return -1; }
  function heStart(t, rng) {
    t.seats.forEach(s => { s.out = s.p.bank < t.bb; s.hole = []; s.folded = s.out; s.allIn = false; s.bet = 0; s.total = 0; s.acted = false; s.last = s.out ? 'Sitting out' : ''; });
    const inHand = t.seats.filter(s => !s.out);
    if (inHand.length < 2) { t.street = 'idle'; return false; }
    t.hands++; t.board = []; t.result = null; t.log = []; t.deck = shuffle(deck(false), rng);
    t.button = nextIdx(t, t.button < 0 ? -1 : t.button, s => !s.out);
    const heads = inHand.length === 2;
    const sbI = heads ? t.button : nextIdx(t, t.button, s => !s.out), bbI = nextIdx(t, sbI, s => !s.out);
    t.sbI = sbI; t.bbI = bbI;
    post(t, sbI, t.sb, 'Small blind'); post(t, bbI, t.bb, 'Big blind');
    for (let r = 0; r < 2; r++) for (let k = 1; k <= t.seats.length; k++) { const j = (t.button + k) % t.seats.length; if (!t.seats[j].out) t.seats[j].hole.push(t.deck.pop()); }
    t.street = 'preflop'; t.curBet = t.bb; t.minRaise = t.bb;
    t.toAct = nextIdx(t, bbI, canAct);
    if (t.toAct < 0 || !needsAction(t)) runOut(t);
    return true;
  }
  function post(t, i, amt, label) { const s = t.seats[i], a = Math.min(amt, s.p.bank); s.p.bank = r2(s.p.bank - a); s.bet += a; s.total += a; if (s.p.bank <= 0) s.allIn = true; s.last = label; t.log.push(s.p.name + ' posts ' + label.toLowerCase()); }
  const potTotal = t => r2(t.seats.reduce((a, s) => a + s.total, 0));
  function heLegal(t) {
    const s = t.seats[t.toAct]; if (!s || !canAct(s)) return null;
    const toCall = Math.min(r2(t.curBet - s.bet), s.p.bank), maxTo = r2(s.bet + s.p.bank);
    const minTo = Math.min(maxTo, r2(t.curBet + t.minRaise));
    return { fold: toCall > 0, check: toCall <= 0, call: toCall > 0 ? toCall : 0, canRaise: maxTo > t.curBet, minTo, maxTo, pot: potTotal(t) };
  }
  // action: 'fold' | 'check' | 'call' | 'raise' (to = total bet this street)
  function heAct(t, a, to) {
    const L = heLegal(t); if (!L) return false; const s = t.seats[t.toAct], name = s.p.name;
    if (a === 'fold') { if (!L.fold) a = 'check'; else { s.folded = true; s.last = 'Fold'; t.log.push(name + ' folds'); } }
    if (a === 'check') { if (!L.check) return false; s.last = 'Check'; t.log.push(name + ' checks'); }
    if (a === 'call') { if (!L.call) { if (L.check) { s.last = 'Check'; t.log.push(name + ' checks'); } else return false; } else { pay(s, L.call); s.last = s.allIn ? 'All in' : 'Call ' + L.call; t.log.push(name + ' calls ' + L.call); } }
    if (a === 'raise') {
      if (!L.canRaise) return false; to = Math.round(Math.max(L.minTo, Math.min(L.maxTo, to || L.minTo)));
      if (to < L.minTo && to < L.maxTo) to = L.minTo;
      const add = r2(to - s.bet), raiseBy = r2(to - t.curBet);
      pay(s, add);
      if (raiseBy >= t.minRaise) t.minRaise = raiseBy;
      const wasBet = t.curBet === 0; t.curBet = Math.max(t.curBet, s.bet);
      t.seats.forEach(o => { if (o !== s && canAct(o)) o.acted = false; });
      s.last = s.allIn ? 'All in ' + s.bet : (wasBet ? 'Bet ' : 'Raise to ') + s.bet; t.log.push(name + (s.allIn ? ' goes all in for ' + s.bet : (wasBet ? ' bets ' : ' raises to ') + s.bet));
    }
    s.acted = true;
    advance(t);
    return true;
  }
  function pay(s, amt) { amt = Math.min(amt, s.p.bank); s.p.bank = r2(s.p.bank - amt); s.bet = r2(s.bet + amt); s.total = r2(s.total + amt); if (s.p.bank <= 0.0001) { s.p.bank = 0; s.allIn = true; } }
  function needsAction(t) {
    if (live(t).length < 2) return false; const acts = t.seats.filter(canAct);
    return acts.length >= 2 || acts.some(s => s.bet < t.curBet);
  }
  function advance(t) {
    if (live(t).length === 1) return finish(t);
    const pending = t.seats.some(s => canAct(s) && (!s.acted || s.bet < t.curBet));
    if (pending) { t.toAct = nextIdx(t, t.toAct, s => canAct(s) && (!s.acted || s.bet < t.curBet)); return; }
    nextStreet(t);
  }
  function nextStreet(t) {
    t.seats.forEach(s => { s.bet = 0; s.acted = false; if (!s.folded && !s.allIn) s.last = ''; });
    t.curBet = 0; t.minRaise = t.bb;
    if (t.street === 'river') return finish(t);
    t.deck.pop();   // burn
    if (t.street === 'preflop') { t.board.push(t.deck.pop(), t.deck.pop(), t.deck.pop()); t.street = 'flop'; }
    else if (t.street === 'flop') { t.board.push(t.deck.pop()); t.street = 'turn'; }
    else { t.board.push(t.deck.pop()); t.street = 'river'; }
    if (t.seats.filter(canAct).length < 2) { return runOut(t); }
    t.toAct = nextIdx(t, t.button, canAct);
  }
  function runOut(t) {   // everyone left is all in: deal the rest of the board
    t.seats.forEach(s => { s.bet = 0; });
    while (t.board.length < 5) { t.deck.pop(); if (t.board.length === 0) t.board.push(t.deck.pop(), t.deck.pop(), t.deck.pop()); else t.board.push(t.deck.pop()); }
    t.street = 'river'; t.runout = true; finish(t);
  }
  function finish(t) {
    t.toAct = -1; const L = live(t), pots = [];
    // side pots from each player's total contribution
    const levels = [...new Set(t.seats.filter(s => s.total > 0).map(s => s.total))].sort((a, b) => a - b); let prev = 0;
    for (const lv of levels) {
      const amt = r2(t.seats.reduce((a, s) => a + Math.max(0, Math.min(s.total, lv) - prev), 0));
      const elig = t.seats.map((s, i) => i).filter(i => !t.seats[i].folded && t.seats[i].total >= lv);
      if (amt > 0) { if (elig.length) pots.push({ amt, elig }); else if (pots.length) pots[pots.length - 1].amt = r2(pots[pots.length - 1].amt + amt); }
      prev = lv;
    }
    // merge pots with the same players
    const merged = []; for (const p of pots) { const m = merged.find(q => q.elig.join() === p.elig.join()); if (m) m.amt = r2(m.amt + p.amt); else merged.push(p); }
    const showdown = L.length > 1;
    const scores = t.seats.map(s => !s.folded && showdown ? best5(s.hole.concat(t.board)) : null);
    const won = t.seats.map(() => 0);
    merged.forEach(pot => {
      let w = pot.elig;
      if (showdown) { let best = null; for (const i of pot.elig) { const sc = scores[i].score; if (!best || cmp(sc, best) > 0) { best = sc; w = [i]; } else if (cmp(sc, best) === 0) w.push(i); } }
      const share = Math.floor(pot.amt / w.length * 100) / 100; let rem = r2(pot.amt - share * w.length);
      const order = w.slice().sort((a, b) => ((a - t.button + t.seats.length) % t.seats.length) - ((b - t.button + t.seats.length) % t.seats.length));
      order.forEach(i => { let a = share; if (rem > 0) { a = r2(a + rem); rem = 0; } won[i] = r2(won[i] + a); t.seats[i].p.bank = r2(t.seats[i].p.bank + a); });
      pot.winners = w; pot.hand = showdown ? describe(scores[w[0]].score) : null;
    });
    t.pots = merged; t.street = 'done';
    t.result = { showdown, won, pots: merged, scores: scores.map(x => x && { name: describe(x.score), cards: x.cards, score: x.score }) };
    t.seats.forEach((s, i) => { s.net = r2(won[i] - s.total); if (won[i] > 0) s.last = 'Wins ' + won[i]; });
    return t.result;
  }

  /* computer players */
  function chen(h) {   // pre-flop strength (Chen formula), roughly -1..20
    const [a, b] = h.map(c => c.r).sort((x, y) => y - x), base = { 14: 10, 13: 8, 12: 7, 11: 6 }[a] || a / 2;
    if (a === b) return Math.max(5, base * 2);
    let s = base; if (h[0].s === h[1].s) s += 2;
    const gap = a - b - 1; s -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
    if (gap <= 1 && a < 12) s += 1;
    return s;
  }
  function equity(t, i, iters, rng) {
    rng = rng || Math.random; const me = t.seats[i], opp = t.seats.filter((s, j) => j !== i && !s.folded).length;
    if (!opp) return 1;
    const known = new Set(me.hole.concat(t.board).map(c => c.id)), pool = deck(false).filter(c => !known.has(c.id));
    let win = 0;
    for (let it = 0; it < iters; it++) {
      shuffle(pool, rng); let k = 0;
      const board = t.board.concat(pool.slice(k, k + 5 - t.board.length)); k += 5 - t.board.length;
      const mine = best5(me.hole.concat(board)).score; let beat = true, tie = 0;
      for (let o = 0; o < opp; o++) { const sc = best5([pool[k], pool[k + 1]].concat(board)).score; k += 2; const c = cmp(mine, sc); if (c < 0) { beat = false; break; } if (c === 0) tie++; }
      if (beat) win += tie ? 1 / (tie + 1) : 1;
    }
    return win / iters;
  }
  const STYLE = [{ tight: .1, aggr: .5, bluff: .04 }, { tight: 0, aggr: .7, bluff: .08 }, { tight: .15, aggr: .35, bluff: .02 }, { tight: -.05, aggr: .6, bluff: .1 }, { tight: .05, aggr: .45, bluff: .05 }, { tight: .1, aggr: .8, bluff: .06 }];
  function heBot(t, rng) {
    rng = rng || Math.random; const i = t.toAct, s = t.seats[i], L = heLegal(t); if (!L) return null;
    const st = STYLE[(s.p.style || 0) % STYLE.length], opp = live(t).length - 1, pot = L.pot;
    let eq;
    if (t.street === 'preflop') { const c = chen(s.hole); eq = Math.min(.9, Math.max(.05, (c + 2) / 22)) * (opp > 2 ? .85 : 1); }
    else eq = equity(t, i, 160, rng);
    eq -= st.tight * .5;
    const odds = L.call ? L.call / (pot + L.call) : 0, fair = 1 / (opp + 1);
    const raiseTo = f => Math.round(Math.max(L.minTo, Math.min(L.maxTo, t.curBet + Math.max(t.bb, pot * f))));
    if (L.canRaise && (eq > fair + .25 || (eq > fair + .12 && rng() < st.aggr) || rng() < st.bluff)) return { a: 'raise', to: raiseTo(eq > .8 ? 1 : .6) };
    if (L.check) return { a: 'check' };
    if (eq >= odds + .03 || (L.call <= t.bb && eq > .2) || L.call < pot * .1) return { a: 'call' };
    return { a: 'fold' };
  }

  const api = { SUITS, CAT, deck, shuffle, rngFrom, rankName, cmp, evalPlain, eval5, eval2, best5, describe, describe2,
    validSet, splits, houseWay, bestVsDealer, outcome, dealerAceHighPaiGow, fortune, FORTUNE, paiGowDeal, pHigh, pLow,
    heNew, heStart, heLegal, heAct, heBot, equity, chen, potTotal, r2 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Poker = api;
})(typeof window !== 'undefined' ? window : globalThis);
