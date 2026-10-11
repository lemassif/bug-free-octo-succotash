/* Blackjack rules engine: pure logic, no DOM. Play money only.
   Browser: window.Blackjack. Node: module.exports (for testing). */
(function (root) {
  'use strict';

  const r2 = x => Math.round(x * 100 + 1e-9) / 100;
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUITS = ['S', 'H', 'D', 'C'];
  const RULES = { decks: 6, h17: false, das: true, maxHands: 4, resplitAces: false, hitSplitAces: false,
    surrender: true, bjPays: 1.5, penetration: 0.75, insurancePays: 2 };
  let CID = 1;

  const val = c => c.r === 'A' ? 11 : (c.r === 'K' || c.r === 'Q' || c.r === 'J' || c.r === '10') ? 10 : +c.r;

  function handValue(cards) {
    let total = 0, aces = 0;
    for (const c of cards) { total += val(c); if (c.r === 'A') aces++; }
    while (total > 21 && aces) { total -= 10; aces--; }
    return { total, soft: aces > 0 };
  }

  function newShoe(decks, rng, pen) {
    const cards = [];
    for (let d = 0; d < decks; d++) for (const s of SUITS) for (const r of RANKS) cards.push({ id: CID++, r, s });
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = cards[i]; cards[i] = cards[j]; cards[j] = t; }
    return { cards, idx: 0, decks, cut: Math.floor(cards.length * pen) };
  }

  function newGame(rules, seatRefs, rng) {
    rules = Object.assign({}, RULES, rules || {});
    return { rules, rng: rng || Math.random, shoe: newShoe(rules.decks, rng || Math.random, rules.penetration),
      seats: seatRefs.map(ref => ({ ref, hands: [], insurance: 0, bet: 0 })),
      dealer: [], phase: 'bet', turn: null, dealerBJ: false, revealed: false, dealLog: [], reshuffled: false };
  }

  function draw(g) {
    if (g.shoe.idx >= g.shoe.cards.length) { g.shoe = newShoe(g.rules.decks, g.rng, g.rules.penetration); g.reshuffled = true; }
    return g.shoe.cards[g.shoe.idx++];
  }
  const newHand = bet => ({ cards: [], bet, doubled: false, fromSplit: false, splitAces: false, done: false, bj: false, surrendered: false });
  const cardsLeft = g => g.shoe.cards.length - g.shoe.idx;

  /* bets: array aligned with seats (0 = sit out). Returns false if nobody bet. */
  function startRound(g, bets) {
    g.dealer = []; g.dealerBJ = false; g.revealed = false; g.dealLog = []; g.reshuffled = false; g.turn = null; g.results = [];
    if (g.shoe.idx >= g.shoe.cut) { g.shoe = newShoe(g.rules.decks, g.rng, g.rules.penetration); g.reshuffled = true; }
    const active = [];
    g.seats.forEach((s, i) => {
      s.hands = []; s.insurance = 0; s.bet = 0;
      const b = r2(bets[i] || 0);
      if (b > 0 && s.ref.bank + 1e-9 >= b) { s.ref.bank = r2(s.ref.bank - b); s.hands = [newHand(b)]; s.bet = b; active.push(i); }
    });
    if (!active.length) { g.phase = 'bet'; return false; }
    for (let pass = 0; pass < 2; pass++) {
      for (const i of active) { const c = draw(g); g.seats[i].hands[0].cards.push(c); g.dealLog.push(c.id); }
      const c = draw(g); g.dealer.push(c); g.dealLog.push(c.id);
    }
    for (const i of active) { const h = g.seats[i].hands[0]; h.bj = handValue(h.cards).total === 21; h.done = h.bj; }
    const up = g.dealer[0];
    if (up.r === 'A') g.phase = 'insurance';
    else if (val(up) === 10) peek(g);
    else beginPlay(g);
    return true;
  }

  function canInsure(g, i) {
    const s = g.seats[i]; return g.phase === 'insurance' && s.hands.length > 0 && s.insurance === 0 && s.ref.bank + 1e-9 >= r2(s.bet / 2);
  }
  function takeInsurance(g, i) {
    if (!canInsure(g, i)) return false;
    const s = g.seats[i], amt = r2(s.bet / 2); s.ref.bank = r2(s.ref.bank - amt); s.insurance = amt; return true;
  }
  function finishInsurance(g) { if (g.phase === 'insurance') peek(g); }

  function peek(g) {
    if (handValue(g.dealer).total === 21 && g.dealer.length === 2) { g.dealerBJ = true; g.revealed = true; g.phase = 'dealer'; return settle(g); }
    beginPlay(g);
  }
  function beginPlay(g) {
    g.phase = 'play'; g.turn = null; advance(g, -1, 0);
  }

  /* move the turn to the next hand that still needs an action */
  function advance(g, fromSeat, fromHand) {
    for (let si = Math.max(fromSeat, 0); si < g.seats.length; si++) {
      const s = g.seats[si];
      for (let hi = (si === fromSeat ? fromHand : 0); hi < s.hands.length; hi++) {
        const h = s.hands[hi];
        if (h.cards.length === 1) {                       // second card of a split hand
          h.cards.push(draw(g)); g.dealLog.push(h.cards[1].id);
          const t = handValue(h.cards).total; if (t === 21 || (h.splitAces && !g.rules.hitSplitAces)) h.done = true;
        }
        if (!h.done) { g.turn = { seat: si, hand: hi }; return; }
      }
    }
    g.turn = null; g.phase = 'dealer';
  }

  function legal(g) {
    const none = { hit: false, stand: false, double: false, split: false, surrender: false };
    if (g.phase !== 'play' || !g.turn) return none;
    const s = g.seats[g.turn.seat], h = s.hands[g.turn.hand], two = h.cards.length === 2;
    const canMoney = s.ref.bank + 1e-9 >= h.bet;
    return {
      hit: true, stand: true,
      double: two && canMoney && (g.rules.das || !h.fromSplit) && !(h.splitAces),
      split: two && canMoney && s.hands.length < g.rules.maxHands && val(h.cards[0]) === val(h.cards[1]) &&
        (!h.splitAces || g.rules.resplitAces),
      surrender: g.rules.surrender && two && !h.fromSplit && s.hands.length === 1
    };
  }

  function act(g, a) {
    const L = legal(g); if (!L[a]) return false;
    const si = g.turn.seat, hi = g.turn.hand, s = g.seats[si], h = s.hands[hi];
    if (a === 'hit') {
      const c = draw(g); h.cards.push(c); g.dealLog.push(c.id);
      if (handValue(h.cards).total >= 21) h.done = true;
    } else if (a === 'stand') { h.done = true; }
    else if (a === 'double') {
      s.ref.bank = r2(s.ref.bank - h.bet); h.bet = r2(h.bet * 2); h.doubled = true;
      const c = draw(g); h.cards.push(c); g.dealLog.push(c.id); h.done = true;
    } else if (a === 'split') {
      s.ref.bank = r2(s.ref.bank - h.bet);
      const moved = h.cards.pop(); const nh = newHand(h.bet); nh.cards = [moved];
      const aces = moved.r === 'A';
      h.fromSplit = nh.fromSplit = true; h.splitAces = nh.splitAces = aces;
      s.hands.splice(hi + 1, 0, nh);
      const c = draw(g); h.cards.push(c); g.dealLog.push(c.id);
      if (handValue(h.cards).total === 21 || (aces && !g.rules.hitSplitAces)) h.done = true;
    } else if (a === 'surrender') { h.surrendered = true; h.done = true; }
    if (h.done) advance(g, si, hi);
    return true;
  }

  function dealerPlay(g) {
    g.revealed = true;
    const live = g.seats.some(s => s.hands.some(h => !h.surrendered && !h.bj && handValue(h.cards).total <= 21));
    if (live) {
      for (;;) {
        const v = handValue(g.dealer);
        if (v.total < 17 || (v.total === 17 && v.soft && g.rules.h17)) { const c = draw(g); g.dealer.push(c); g.dealLog.push(c.id); } else break;
      }
    }
    return settle(g);
  }

  function settle(g) {
    g.revealed = true;
    const dv = handValue(g.dealer).total, dBust = dv > 21, out = [];
    g.seats.forEach((s, si) => {
      s.hands.forEach((h, hi) => {
        const v = handValue(h.cards).total; let outcome, ret = 0;
        if (h.surrendered) { outcome = 'surrender'; ret = r2(h.bet / 2); }
        else if (g.dealerBJ) { if (h.bj) { outcome = 'push'; ret = h.bet; } else outcome = 'lose'; }
        else if (h.bj) { outcome = 'blackjack'; ret = r2(h.bet + h.bet * g.rules.bjPays); }
        else if (v > 21) outcome = 'bust';
        else if (dBust || v > dv) { outcome = 'win'; ret = r2(h.bet * 2); }
        else if (v === dv) { outcome = 'push'; ret = h.bet; }
        else outcome = 'lose';
        s.ref.bank = r2(s.ref.bank + ret);
        h.outcome = outcome; h.ret = ret; h.net = r2(ret - h.bet);
        out.push({ seat: si, hand: hi, outcome, bet: h.bet, ret, net: h.net });
      });
      if (s.insurance) {
        const ret = g.dealerBJ ? r2(s.insurance * (1 + g.rules.insurancePays)) : 0;
        s.ref.bank = r2(s.ref.bank + ret); s.insNet = r2(ret - s.insurance);
        out.push({ seat: si, hand: -1, outcome: g.dealerBJ ? 'insurance-win' : 'insurance-lose', bet: s.insurance, ret, net: s.insNet });
      }
    });
    g.phase = 'done'; g.results = out; return out;
  }

  /* ---------- basic strategy (6 decks, S17, double after split, late surrender) ---------- */
  function basic(cards, up, can, rules) {
    rules = rules || RULES; can = can || {};
    const v = handValue(cards), t = v.total, soft = v.soft;
    const pair = cards.length === 2 && val(cards[0]) === val(cards[1]) ? val(cards[0]) : 0;
    const dbl = (alt) => can.double ? 'double' : alt;
    const h17 = rules.h17;
    if (can.split && pair) {
      switch (pair) {
        case 11: return 'split';
        case 8: return 'split';
        case 9: if (up !== 7 && up !== 10 && up !== 11) return 'split'; break;
        case 7: if (up <= 7) return 'split'; break;
        case 6: if (up >= (rules.das ? 2 : 3) && up <= 6) return 'split'; break;
        case 4: if (rules.das && (up === 5 || up === 6)) return 'split'; break;
        case 3: case 2: if (up <= 7 && (rules.das || up >= 4)) return 'split'; break;
      }
    }
    if (can.surrender && !soft) {
      if (t === 16 && (up === 9 || up === 10 || up === 11)) return 'surrender';
      if (t === 15 && up === 10) return 'surrender';
      if (h17 && ((t === 15 || t === 17) && up === 11)) return 'surrender';
    }
    if (soft) {
      if (t >= 20) return 'stand';
      if (t === 19) return (h17 && up === 6) ? dbl('stand') : 'stand';
      if (t === 18) {
        if (up >= 3 && up <= 6) return dbl('stand');
        if (up === 2) return h17 ? dbl('stand') : 'stand';
        if (up === 7 || up === 8) return 'stand';
        return 'hit';
      }
      if (t === 17) return (up >= 3 && up <= 6) ? dbl('hit') : 'hit';
      if (t === 16 || t === 15) return (up >= 4 && up <= 6) ? dbl('hit') : 'hit';
      return (up >= 5 && up <= 6) ? dbl('hit') : 'hit';      // soft 13, 14
    }
    if (t >= 17) return 'stand';
    if (t >= 13) return up <= 6 ? 'stand' : 'hit';
    if (t === 12) return (up >= 4 && up <= 6) ? 'stand' : 'hit';
    if (t === 11) return (up === 11 && !h17) ? 'hit' : dbl('hit');
    if (t === 10) return up <= 9 ? dbl('hit') : 'hit';
    if (t === 9) return (up >= 3 && up <= 6) ? dbl('hit') : 'hit';
    return 'hit';
  }
  const upValue = g => val(g.dealer[0]);

  /* play one finished round using basic strategy for every seat (used by CPU players and tests) */
  function autoPlay(g, strategy) {
    strategy = strategy || basic;
    let guard = 0;
    while (g.phase === 'play' && g.turn && guard++ < 400) {
      const s = g.seats[g.turn.seat], h = s.hands[g.turn.hand];
      const L = legal(g);
      let a = strategy(h.cards, upValue(g), L, g.rules);
      if (!L[a]) a = a === 'double' ? (L.hit ? 'hit' : 'stand') : a === 'surrender' ? 'hit' : a === 'split' ? 'hit' : 'stand';
      act(g, a);
    }
    if (g.phase === 'dealer') dealerPlay(g);
  }

  const api = { RULES, RANKS, SUITS, val, handValue, newShoe, newGame, draw, startRound, canInsure, takeInsurance, finishInsurance,
    legal, act, dealerPlay, settle, basic, upValue, autoPlay, cardsLeft, r2 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Blackjack = api;
})(typeof window !== 'undefined' ? window : globalThis);
