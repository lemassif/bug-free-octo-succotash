/* Craps rules engine: pure logic, no DOM. Play money only.
   Works in the browser (window.Craps) and in Node (module.exports) for testing. */
(function (root) {
  'use strict';

  const r2 = x => Math.round(x * 100 + 1e-9) / 100;   // to cents
  const f2 = x => Math.round(x * 100 + 1e-9) / 100;   // payouts round to the nearest cent
  const c2 = x => Math.ceil(x * 100 - 1e-9) / 100;    // commissions round up

  const POINTS = [4, 5, 6, 8, 9, 10];
  const TRUE_PAY = { 4: 2, 5: 1.5, 6: 1.2, 8: 1.2, 9: 1.5, 10: 2 };       // odds behind pass / come, buy bets
  const LAY_PAY = { 4: 1 / 2, 5: 2 / 3, 6: 5 / 6, 8: 5 / 6, 9: 2 / 3, 10: 1 / 2 }; // odds behind don't pass / lay bets
  const PLACE_PAY = { 4: 9 / 5, 5: 7 / 5, 6: 7 / 6, 8: 7 / 6, 9: 7 / 5, 10: 9 / 5 };
  const HARD_PAY = { 4: 7, 6: 9, 8: 9, 10: 7 };
  const ODDS_MULT = { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 };               // 3-4-5x odds
  const LAY_MULT = 6;                                                        // lay up to 6x the flat bet
  const VIG = 0.05;
  const WAYS = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };

  const DEFS = {
    pass:     { label: 'Pass Line',    comeOutOnly: true },
    dp:       { label: "Don't Pass",   comeOutOnly: true },
    come:     { label: 'Come',         pointOnly: true },
    dc:       { label: "Don't Come",   pointOnly: true },
    place:    { label: 'Place',        nums: POINTS },
    buy:      { label: 'Buy',          nums: POINTS },
    lay:      { label: 'Lay',          nums: POINTS },
    field:    { label: 'Field' },
    big6:     { label: 'Big 6' },
    big8:     { label: 'Big 8' },
    hard:     { label: 'Hard',         nums: [4, 6, 8, 10], min: 1 },
    any7:     { label: 'Any 7',        min: 1 },
    anycraps: { label: 'Any Craps',    min: 1 },
    two:      { label: 'Aces (2)',     min: 1 },
    three:    { label: 'Ace-Deuce (3)', min: 1 },
    yo:       { label: 'Yo (11)',      min: 1 },
    twelve:   { label: 'Boxcars (12)', min: 1 },
    ce:       { label: 'C & E',        min: 1 },
    horn:     { label: 'Horn',         min: 1 },
    hop:      { label: 'Hop',          min: 1 }
  };

  function create(players, opts) {
    opts = opts || {};
    const dist = {}; for (let i = 2; i <= 12; i++) dist[i] = 0;
    return { players, point: null, bets: [], nextId: 1, rolls: 0, shooter: 0,
      keep: players.map(() => false), minBet: opts.minBet || 5, maxBet: opts.maxBet || 5000,
      dist, history: [], sevenOuts: 0 };
  }

  const err = msg => ({ ok: false, error: msg });
  const money = n => '$' + (Math.abs(n - Math.round(n)) < 0.005 ? Math.round(n) : n.toFixed(2));

  function findMerge(t, p, type, num, hop) {
    const n = num == null ? null : num;
    return t.bets.find(b => b.p === p && b.type === type && b.num === n &&
      (type !== 'hop' || (b.hop[0] === hop[0] && b.hop[1] === hop[1])));
  }

  function addBet(t, p, type, amt, num, hop) {
    const d = DEFS[type]; if (!d) return err('Unknown bet.');
    amt = r2(+amt); if (!(amt > 0)) return err('Pick a chip first.');
    if (d.comeOutOnly && t.point !== null) return err(d.label + ' is made before the point is set.');
    if (d.pointOnly && t.point === null) return err(d.label + ' bets start once a point is set.');
    if (d.nums && !d.nums.includes(num)) return err('Pick a number for this bet.');
    if (type === 'hop') {
      if (!hop || hop.length !== 2) return err('Pick two dice.');
      hop = [Math.min(hop[0], hop[1]), Math.max(hop[0], hop[1])];
    }
    const pl = t.players[p];
    const ex = findMerge(t, p, type, num, hop);
    const total = r2((ex ? ex.amt : 0) + amt);
    const min = d.min !== undefined ? d.min : t.minBet;
    if (total < min) return err('Minimum for ' + d.label + ' is ' + money(min) + '.');
    if (total > t.maxBet) return err('Table maximum is ' + money(t.maxBet) + '.');
    let vig = 0;
    if (type === 'buy') vig = c2(amt * VIG);
    else if (type === 'lay') vig = c2(amt * LAY_PAY[num] * VIG);
    const cost = r2(amt + vig);
    if (pl.bank + 1e-9 < cost) return err('Not enough chips.');
    pl.bank = r2(pl.bank - cost);
    let b = ex;
    if (ex) { ex.amt = total; ex.vig = r2(ex.vig + vig); }
    else { b = { id: t.nextId++, p, type, num: num == null ? null : num, hop: hop || null, amt, odds: 0, vig }; t.bets.push(b); }
    return { ok: true, bet: b, cost, vig };
  }

  const isTake = b => b.type === 'pass' || b.type === 'come';
  const oddsNumber = (t, b) => (b.type === 'pass' || b.type === 'dp') ? t.point : b.num;
  const hasOdds = b => b.type === 'pass' || b.type === 'dp' || b.type === 'come' || b.type === 'dc';

  function maxOdds(t, b) {
    const n = oddsNumber(t, b); if (n == null) return 0;
    return r2(b.amt * (isTake(b) ? ODDS_MULT[n] : LAY_MULT));
  }

  function addOdds(t, id, amt) {
    const b = t.bets.find(x => x.id === id);
    if (!b || !hasOdds(b)) return err('There is no line bet to back up.');
    const n = oddsNumber(t, b); if (n == null) return err('Odds need a point or a come number.');
    amt = r2(+amt); if (!(amt > 0)) return err('Pick a chip first.');
    const max = maxOdds(t, b);
    if (r2(b.odds + amt) > max + 1e-9) return err(isTake(b) ? 'Max odds on ' + n + ' is ' + ODDS_MULT[n] + 'x (' + money(max) + ').' : 'Max lay odds is ' + LAY_MULT + 'x (' + money(max) + ').');
    const pl = t.players[b.p];
    if (pl.bank + 1e-9 < amt) return err('Not enough chips.');
    pl.bank = r2(pl.bank - amt); b.odds = r2(b.odds + amt);
    return { ok: true, bet: b };
  }

  function removeOdds(t, id) {
    const b = t.bets.find(x => x.id === id); if (!b || !b.odds) return err('No odds to take down.');
    t.players[b.p].bank = r2(t.players[b.p].bank + b.odds); const back = b.odds; b.odds = 0;
    return { ok: true, refund: back };
  }

  function canRemove(t, b) {
    if (b.type === 'pass') return t.point === null;     // locked once a point is set
    if (b.type === 'come') return b.num === null;       // locked once on a number
    return true;
  }

  function removeBet(t, id) {
    const i = t.bets.findIndex(x => x.id === id); if (i < 0) return err('Bet not found.');
    const b = t.bets[i];
    if (!canRemove(t, b)) return err('That bet is locked in until it resolves.');
    const back = r2(b.amt + b.odds);
    t.players[b.p].bank = r2(t.players[b.p].bank + back);
    t.bets.splice(i, 1);
    return { ok: true, refund: back, bet: b };
  }

  /* take back part of a bet (used by Undo). vigBack refunds the commission when undoing in the same betting round. */
  function reduceBet(t, id, amt, vigBack) {
    const b = t.bets.find(x => x.id === id); if (!b) return err('Bet not found.');
    if (!canRemove(t, b)) return err('That bet is locked in until it resolves.');
    amt = Math.min(r2(+amt), b.amt); vigBack = vigBack || 0;
    let back = r2(amt + vigBack); b.amt = r2(b.amt - amt); b.vig = r2(Math.max(0, b.vig - vigBack));
    if (b.amt <= 0.0001) { back = r2(back + b.odds); t.bets.splice(t.bets.indexOf(b), 1); }
    t.players[b.p].bank = r2(t.players[b.p].bank + back);
    return { ok: true, refund: back };
  }
  function reduceOdds(t, id, amt) {
    const b = t.bets.find(x => x.id === id); if (!b || !b.odds) return err('No odds to take down.');
    amt = Math.min(r2(+amt), b.odds); b.odds = r2(b.odds - amt); t.players[b.p].bank = r2(t.players[b.p].bank + amt);
    return { ok: true, refund: amt };
  }

  const RECOGNISED = { any7: 1, anycraps: 1, two: 1, three: 1, yo: 1, twelve: 1, ce: 1, horn: 1, hop: 1, field: 1 };

  function roll(t, d1, d2) {
    const total = d1 + d2, hard = d1 === d2, comeOut = t.point === null, pt = t.point;
    const sorted = [Math.min(d1, d2), Math.max(d1, d2)];
    const res = { d1, d2, total, hard, comeOut, pointBefore: pt, events: [], pointSet: null, pointMade: false, sevenOut: false, net: t.players.map(() => 0) };
    const keep = [];

    for (const b of t.bets) {
      const live = !comeOut || t.keep[b.p];          // bets that are "off" on the come-out unless kept working
      let outcome = 'none', stays = true, profit = 0, oddsProfit = 0, oddsBack = false;
      const W = (pr, st) => { outcome = 'win'; profit = f2(pr); stays = !!st; };
      const L = () => { outcome = 'lose'; stays = false; };
      const P = () => { outcome = 'push'; stays = false; };

      switch (b.type) {
        case 'pass':
          if (comeOut) { if (total === 7 || total === 11) W(b.amt, false); else if (total === 2 || total === 3 || total === 12) L(); }
          else if (total === pt) { W(b.amt, false); oddsProfit = f2(b.odds * TRUE_PAY[pt]); }
          else if (total === 7) L();
          break;
        case 'dp':
          if (comeOut) { if (total === 2 || total === 3) W(b.amt, false); else if (total === 7 || total === 11) L(); else if (total === 12) P(); }
          else if (total === 7) { W(b.amt, false); oddsProfit = f2(b.odds * LAY_PAY[pt]); }
          else if (total === pt) L();
          break;
        case 'come':
          if (b.num === null) {
            if (total === 7 || total === 11) W(b.amt, false);
            else if (total === 2 || total === 3 || total === 12) L();
            else { b.num = total; outcome = 'move'; }
          } else if (total === b.num) { W(b.amt, false); if (live) oddsProfit = f2(b.odds * TRUE_PAY[b.num]); }
          else if (total === 7) { L(); oddsBack = !live; }
          break;
        case 'dc':
          if (b.num === null) {
            if (total === 2 || total === 3) W(b.amt, false);
            else if (total === 7 || total === 11) L();
            else if (total === 12) P();
            else { b.num = total; outcome = 'move'; }
          } else if (total === 7) { W(b.amt, false); if (live) oddsProfit = f2(b.odds * LAY_PAY[b.num]); }
          else if (total === b.num) { L(); oddsBack = !live; }
          break;
        case 'place':
          if (live) { if (total === b.num) W(f2(b.amt * PLACE_PAY[b.num]), true); else if (total === 7) L(); }
          break;
        case 'buy':
          if (live) { if (total === b.num) W(f2(b.amt * TRUE_PAY[b.num]), false); else if (total === 7) L(); }
          break;
        case 'lay':
          if (total === 7) W(f2(b.amt * LAY_PAY[b.num]), false); else if (total === b.num) L();
          break;
        case 'field':
          if (total === 2) W(b.amt * 2, false);
          else if (total === 12) W(b.amt * 3, false);
          else if (total === 3 || total === 4 || total === 9 || total === 10 || total === 11) W(b.amt, false);
          else L();
          break;
        case 'big6': if (total === 6) W(b.amt, true); else if (total === 7) L(); break;
        case 'big8': if (total === 8) W(b.amt, true); else if (total === 7) L(); break;
        case 'hard':
          if (live) {
            if (total === b.num) { if (hard) W(f2(b.amt * HARD_PAY[b.num]), true); else L(); }
            else if (total === 7) L();
          }
          break;
        case 'any7':     if (total === 7) W(b.amt * 4, false); else L(); break;
        case 'anycraps': if (total === 2 || total === 3 || total === 12) W(b.amt * 7, false); else L(); break;
        case 'two':      if (total === 2) W(b.amt * 30, false); else L(); break;
        case 'twelve':   if (total === 12) W(b.amt * 30, false); else L(); break;
        case 'three':    if (total === 3) W(b.amt * 15, false); else L(); break;
        case 'yo':       if (total === 11) W(b.amt * 15, false); else L(); break;
        case 'ce':       // half on craps (7:1), half on eleven (15:1)
          if (total === 2 || total === 3 || total === 12) W(b.amt * 3, false);
          else if (total === 11) W(b.amt * 7, false); else L();
          break;
        case 'horn':     // quarter each on 2, 3, 11, 12
          if (total === 2 || total === 12) W(b.amt * 6.75, false);
          else if (total === 3 || total === 11) W(b.amt * 3, false); else L();
          break;
        case 'hop':
          if (sorted[0] === b.hop[0] && sorted[1] === b.hop[1]) W(b.amt * (b.hop[0] === b.hop[1] ? 30 : 15), false); else L();
          break;
      }
      if (outcome === 'none') { keep.push(b); continue; }
      if (outcome === 'move') { keep.push(b); res.events.push({ id: b.id, p: b.p, type: b.type, num: b.num, outcome, amt: b.amt, odds: b.odds, net: 0, ret: 0 }); continue; }

      let ret = 0, net = 0;
      if (outcome === 'win') { ret = r2(profit + oddsProfit + (stays ? 0 : b.amt + b.odds)); net = r2(profit + oddsProfit); }
      else if (outcome === 'lose') { ret = oddsBack ? b.odds : 0; net = -r2(b.amt + (oddsBack ? 0 : b.odds)); }
      else { ret = r2(b.amt + b.odds); net = 0; }
      t.players[b.p].bank = r2(t.players[b.p].bank + ret);
      res.net[b.p] = r2(res.net[b.p] + net);
      res.events.push({ id: b.id, p: b.p, type: b.type, num: b.num, hop: b.hop, outcome, amt: b.amt, odds: b.odds, profit: r2(profit + oddsProfit), ret, net, stays });
      if (outcome === 'win' && stays) keep.push(b);
    }
    t.bets = keep;

    if (comeOut) {
      if (POINTS.includes(total)) { t.point = total; res.pointSet = total; }
    } else if (total === pt) { res.pointMade = true; t.point = null; }
    else if (total === 7) { res.sevenOut = true; t.point = null; t.sevenOuts++; }

    t.rolls++; t.dist[total]++; t.history.push(total); if (t.history.length > 60) t.history.shift();
    return res;
  }

  function nextShooter(t) { t.shooter = (t.shooter + 1) % t.players.length; return t.shooter; }
  function exposure(t, p) { return r2(t.bets.filter(b => b.p === p).reduce((s, b) => s + b.amt + b.odds, 0)); }

  const NAMES = {
    2: ['Snake eyes!', 'Aces. Two craps.'], 3: ['Ace-deuce!', 'Three craps.'], 4: ['Four', ''], 5: ['Five, no field five', ''],
    6: ['Six', ''], 7: ['Seven!', ''], 8: ['Eight', ''], 9: ['Nine, center field', ''], 10: ['Ten', ''],
    11: ['Yo-leven!', 'Eleven!'], 12: ['Boxcars!', 'Twelve, craps.']
  };
  function callFor(d1, d2) {
    const total = d1 + d2, hard = d1 === d2;
    if (hard && [4, 6, 8, 10].includes(total)) return 'Hard ' + total + '!';
    if (!hard && [4, 6, 8, 10].includes(total)) return 'Easy ' + total;
    return NAMES[total][0];
  }

  /* ---------- computer shooters and bettors ---------- */
  const STYLES = ['Pass-line Pete', 'Dark-side Dana', 'Field Freddie', 'Place-it Paul', 'Prop Penny', 'Come Carl'];
  function cpuBets(t, p, style) {
    const pl = t.players[p]; style = ((style % 6) + 6) % 6;
    const mine = (type, num) => t.bets.find(b => b.p === p && b.type === type && (num === undefined || b.num === num));
    const tryAdd = (type, amt, num) => { if (pl.bank - amt >= 0) addBet(t, p, type, amt, num); };
    const co = t.point === null;
    const odds = (type, mult) => { const b = mine(type); if (b && b.odds === 0 && t.point !== null) { const a = Math.min(r2(b.amt * mult), maxOdds(t, b)); if (pl.bank >= a) addOdds(t, b.id, a); } };
    if (pl.bank < 25) return;
    switch (style) {
      case 0: if (co && !mine('pass')) tryAdd('pass', 10); odds('pass', 2); break;
      case 1: if (co && !mine('dp')) tryAdd('dp', 10); odds('dp', 2); break;
      case 2: if (co && !mine('pass')) tryAdd('pass', 5); if (!mine('field')) tryAdd('field', 10); break;
      case 3:
        if (co && !mine('pass')) tryAdd('pass', 10);
        if (!co) { if (t.point !== 6 && !mine('place', 6)) tryAdd('place', 12, 6); if (t.point !== 8 && !mine('place', 8)) tryAdd('place', 12, 8); if (!mine('place', 5) && t.point !== 5) tryAdd('place', 10, 5); odds('pass', 1); }
        break;
      case 4:
        if (co && !mine('pass')) tryAdd('pass', 5);
        if (!mine('hard', 6)) tryAdd('hard', 2, 6); if (!mine('hard', 8)) tryAdd('hard', 2, 8);
        if (!mine('horn')) tryAdd('horn', 4); if (!co && !mine('any7')) tryAdd('any7', 1);
        break;
      case 5:
        if (co && !mine('pass')) tryAdd('pass', 10); odds('pass', 2);
        if (!co && t.bets.filter(b => b.p === p && (b.type === 'come')).length < 2) tryAdd('come', 10);
        t.bets.filter(b => b.p === p && b.type === 'come' && b.num !== null && b.odds === 0).forEach(b => { if (pl.bank >= b.amt * 2) addOdds(t, b.id, Math.min(b.amt * 2, maxOdds(t, b))); });
        break;
    }
  }

  /* ---------- reference data for the odds sheet ---------- */
  const REFERENCE = [
    { group: 'Line bets', rows: [
      ['Pass Line / Come', '1:1', 'Wins on 7 or 11 first roll, loses on 2, 3, 12; then the point beats the 7', '1.41%'],
      ["Don't Pass / Don't Come", '1:1', 'Wins on 2 or 3, loses on 7 or 11, 12 pushes; then the 7 beats the point', '1.36%'],
      ['Odds behind Pass / Come', '2:1 on 4, 10 · 3:2 on 5, 9 · 6:5 on 6, 8', 'True odds, up to 3x / 4x / 5x', '0%'],
      ["Lay odds behind Don't", '1:2 on 4, 10 · 2:3 on 5, 9 · 5:6 on 6, 8', 'True odds, up to 6x', '0%']
    ] },
    { group: 'Number bets', rows: [
      ['Place 6 or 8', '7:6', '5 ways vs 6 ways of a 7', '1.52%'],
      ['Place 5 or 9', '7:5', '4 ways vs 6', '4.00%'],
      ['Place 4 or 10', '9:5', '3 ways vs 6', '6.67%'],
      ['Buy 4 to 10', 'True odds, 5% commission up front', 'Comes down after it wins', '4.76%'],
      ['Lay 4 or 10', '1:2, 5% of the win up front', '7 before the number', '2.44%'],
      ['Lay 5 or 9', '2:3, 5% of the win up front', '7 before the number', '3.23%'],
      ['Lay 6 or 8', '5:6, 5% of the win up front', '7 before the number', '4.00%']
    ] },
    { group: 'Center bets', rows: [
      ['Field', '1:1 · 2 pays 2:1 · 12 pays 3:1', 'One roll: 2, 3, 4, 9, 10, 11, 12', '2.78%'],
      ['Big 6 / Big 8', '1:1', '6 (8) before a 7', '9.09%'],
      ['Hard 6 or 8', '9:1', 'The hard way before an easy way or a 7', '9.09%'],
      ['Hard 4 or 10', '7:1', 'The hard way before an easy way or a 7', '11.11%']
    ] },
    { group: 'One-roll proposition bets', rows: [
      ['Any 7', '4:1', '6 of 36', '16.67%'],
      ['Any Craps (2, 3, 12)', '7:1', '4 of 36', '11.11%'],
      ['Aces (2) or Boxcars (12)', '30:1', '1 of 36', '13.89%'],
      ['Ace-Deuce (3) or Yo (11)', '15:1', '2 of 36', '11.11%'],
      ['C & E', 'Craps 3:1 net · Eleven 7:1 net', 'Half craps, half eleven', '11.11%'],
      ['Horn', '2 or 12: 6.75:1 net · 3 or 11: 3:1 net', 'A quarter on each of 2, 3, 11, 12', '12.50%'],
      ['Easy hop (e.g. 1-2)', '15:1', '2 of 36', '11.11%'],
      ['Hard hop (e.g. 3-3)', '30:1', '1 of 36', '13.89%']
    ] }
  ];

  const api = { POINTS, TRUE_PAY, LAY_PAY, PLACE_PAY, HARD_PAY, ODDS_MULT, LAY_MULT, VIG, WAYS, DEFS, STYLES, REFERENCE,
    create, addBet, addOdds, removeOdds, removeBet, reduceBet, reduceOdds, canRemove, maxOdds, hasOdds, oddsNumber, roll, nextShooter, exposure, callFor, cpuBets, r2, money };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Craps = api;
})(typeof window !== 'undefined' ? window : globalThis);
