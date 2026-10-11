/* Brain Box puzzle engine: generators and solvers for four logic puzzles.
   No DOM. Works in the browser (window.Logic) and in Node (module.exports).
   Every generated puzzle has exactly one solution, and each one can be solved
   by reasoning alone at its difficulty level (no guessing needed). */
(function (root) {
  'use strict';

  /* ---------------- seeded random ---------------- */
  function rng(seed) {
    let a = seed >>> 0 || 1;
    const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.int = n => Math.floor(r() * n);
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.shuffle = arr => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; };
    return r;
  }
  const range = n => Array.from({ length: n }, (_, i) => i);

  /* =================================================================
     SUDOKU  (4x4, 6x6, 9x9). grid: flat array, 0 = empty.
     ================================================================= */
  const SUDOKU = {
    kids:   { n: 4, br: 2, bc: 2, givens: 6,  logic: 'singles', label: 'Kids 4×4' },
    easy:   { n: 6, br: 2, bc: 3, givens: 14, logic: 'singles', label: 'Easy 6×6' },
    medium: { n: 9, br: 3, bc: 3, givens: 34, logic: 'singles', label: 'Medium 9×9' },
    hard:   { n: 9, br: 3, bc: 3, givens: 27, logic: 'pairs',   label: 'Hard 9×9' },
    expert: { n: 9, br: 3, bc: 3, givens: 22, logic: 'any',     label: 'Expert 9×9' },
  };
  function sudokuUnits(n, br, bc) {
    const units = [], peers = range(n * n).map(() => new Set());
    for (let r = 0; r < n; r++) units.push(range(n).map(c => r * n + c));
    for (let c = 0; c < n; c++) units.push(range(n).map(r => r * n + c));
    for (let R = 0; R < n; R += br) for (let C = 0; C < n; C += bc) { const u = []; for (let r = R; r < R + br; r++) for (let c = C; c < C + bc; c++) u.push(r * n + c); units.push(u); }
    for (const u of units) for (const a of u) for (const b of u) if (a !== b) peers[a].add(b);
    return { units, peers: peers.map(s => [...s]) };
  }
  // count solutions up to `limit` (backtracking with fewest-candidates first)
  function sudokuCount(g, n, U, limit) {
    g = g.slice(); let count = 0;
    const cand = i => { const used = new Set(U.peers[i].map(p => g[p])); const c = []; for (let v = 1; v <= n; v++) if (!used.has(v)) c.push(v); return c; };
    (function go() {
      if (count >= limit) return;
      let best = -1, bc = null;
      for (let i = 0; i < g.length; i++) if (!g[i]) { const c = cand(i); if (!c.length) return; if (!bc || c.length < bc.length) { best = i; bc = c; if (c.length === 1) break; } }
      if (best < 0) { count++; return; }
      for (const v of bc) { g[best] = v; go(); if (count >= limit) break; }
      g[best] = 0;
    })();
    return count;
  }
  /* logical solver: naked singles, hidden singles, and (level 'pairs') naked pairs
     plus pointing. Returns the solved grid or null if it gets stuck. */
  function sudokuLogic(g, n, U, level) {
    const cand = g.map((v, i) => v ? new Set([v]) : new Set(range(n).map(x => x + 1)));
    const place = (i, v) => { cand[i] = new Set([v]); for (const p of U.peers[i]) cand[p].delete(v); };
    g.forEach((v, i) => { if (v) place(i, v); });
    const solved = () => cand.every(s => s.size === 1);
    let changed = true, guard = 0;
    while (changed && guard++ < 500) {
      changed = false;
      for (let i = 0; i < cand.length; i++) {
        if (!cand[i].size) return null;
        if (cand[i].size === 1) { const v = [...cand[i]][0]; for (const p of U.peers[i]) if (cand[p].has(v)) { cand[p].delete(v); changed = true; } }
      }
      for (const u of U.units) for (let v = 1; v <= n; v++) {
        const where = u.filter(i => cand[i].has(v));
        if (!where.length) return null;
        if (where.length === 1 && cand[where[0]].size > 1) { place(where[0], v); changed = true; }
      }
      if (changed || level === 'singles') continue;
      // naked pairs
      for (const u of U.units) {
        const pairs = u.filter(i => cand[i].size === 2);
        for (let a = 0; a < pairs.length; a++) for (let b = a + 1; b < pairs.length; b++) {
          const A = cand[pairs[a]], B = cand[pairs[b]]; if ([...A].every(x => B.has(x))) {
            for (const i of u) if (i !== pairs[a] && i !== pairs[b]) for (const x of A) if (cand[i].has(x)) { cand[i].delete(x); changed = true; }
          }
        }
      }
      // pointing: a digit confined to one row/column inside a box
      const boxes = U.units.slice(2 * n), lines = U.units.slice(0, 2 * n);
      for (const box of boxes) for (let v = 1; v <= n; v++) {
        const where = box.filter(i => cand[i].has(v) && cand[i].size > 1); if (where.length < 2) continue;
        for (const line of lines) if (where.every(i => line.includes(i))) for (const i of line) if (!box.includes(i) && cand[i].has(v)) { cand[i].delete(v); changed = true; }
      }
    }
    return solved() ? cand.map(s => [...s][0]) : null;
  }
  function makeSudoku(level, seed) {
    const cfg = SUDOKU[level] || SUDOKU.easy, { n, br, bc } = cfg, R = rng(seed), U = sudokuUnits(n, br, bc);
    // a full random grid
    const g = new Array(n * n).fill(0);
    (function fill(i) {
      if (i === g.length) return true;
      const used = new Set(U.peers[i].map(p => g[p]));
      for (const v of R.shuffle(range(n).map(x => x + 1))) if (!used.has(v)) { g[i] = v; if (fill(i + 1)) return true; }
      g[i] = 0; return false;
    })(0);
    const sol = g.slice(), puz = g.slice();
    let filled = n * n;
    for (const i of R.shuffle(range(n * n))) {
      if (filled <= cfg.givens) break;
      const keep = puz[i]; puz[i] = 0;
      const ok = sudokuCount(puz, n, U, 2) === 1 && (cfg.logic === 'any' || sudokuLogic(puz, n, U, cfg.logic));
      if (ok) filled--; else puz[i] = keep;
    }
    return { type: 'sudoku', level, seed, n, br, bc, puzzle: puz, solution: sol };
  }

  /* =================================================================
     PICTURE CROSS (nonogram). Line-solvable, so no guessing.
     ================================================================= */
  const NONO = {
    kids:   { w: 5,  h: 5,  label: 'Kids 5×5' },
    easy:   { w: 8,  h: 8,  label: 'Easy 8×8' },
    medium: { w: 10, h: 10, label: 'Medium 10×10' },
    hard:   { w: 12, h: 12, label: 'Hard 12×12' },
    expert: { w: 15, h: 15, label: 'Expert 15×15' },
  };
  const runs = line => { const out = []; let k = 0; for (const v of line) { if (v === 1) k++; else if (k) { out.push(k); k = 0; } } if (k) out.push(k); return out; };
  /* solve one line: cells 1 filled, 0 empty, -1 unknown. Returns the refined line or null.
     DP over (cell index, clue index) to find which states are possible for each cell. */
  function solveLine(cells, clue) {
    const L = cells.length, K = clue.length;
    const canFill = new Array(L).fill(false), canEmpty = new Array(L).fill(false);
    const memo = new Map();
    // can clues k.. be placed starting at position i?
    function ok(i, k) {
      const key = i * 64 + k; if (memo.has(key)) return memo.get(key);
      let res = false;
      if (k === K) { res = true; for (let j = i; j < L; j++) if (cells[j] === 1) { res = false; break; } }
      else {
        const len = clue[k];
        // leave cell i empty and try later
        if (i < L && cells[i] !== 1 && ok(i + 1, k)) res = true;
        // place block k at i
        if (i + len <= L) {
          let fits = true; for (let j = i; j < i + len; j++) if (cells[j] === 0) { fits = false; break; }
          if (fits && (i + len === L || cells[i + len] !== 1)) { if (ok(Math.min(L, i + len + 1), k + 1)) res = true; }
        }
      }
      memo.set(key, res); return res;
    }
    if (!ok(0, 0)) return null;
    // walk all valid placements and mark which cell values occur
    const seen = new Set();
    function mark(i, k) {
      const key = i * 64 + k; if (seen.has(key)) return; seen.add(key);
      if (k === K) { for (let j = i; j < L; j++) canEmpty[j] = true; return; }
      const len = clue[k];
      if (i < L && cells[i] !== 1 && ok(i + 1, k)) { canEmpty[i] = true; mark(i + 1, k); }
      if (i + len <= L) {
        let fits = true; for (let j = i; j < i + len; j++) if (cells[j] === 0) { fits = false; break; }
        if (fits && (i + len === L || cells[i + len] !== 1) && ok(Math.min(L, i + len + 1), k + 1)) {
          for (let j = i; j < i + len; j++) canFill[j] = true;
          if (i + len < L) canEmpty[i + len] = true;
          mark(Math.min(L, i + len + 1), k + 1);
        }
      }
    }
    mark(0, 0);
    return cells.map((v, j) => canFill[j] && canEmpty[j] ? -1 : canFill[j] ? 1 : 0);
  }
  function nonoSolve(rowsC, colsC, w, h) {
    const g = new Array(w * h).fill(-1);
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < h; r++) { const line = g.slice(r * w, r * w + w), s = solveLine(line, rowsC[r]); if (!s) return null; for (let c = 0; c < w; c++) if (s[c] !== line[c]) { g[r * w + c] = s[c]; changed = true; } }
      for (let c = 0; c < w; c++) { const line = range(h).map(r => g[r * w + c]), s = solveLine(line, colsC[c]); if (!s) return null; for (let r = 0; r < h; r++) if (s[r] !== line[r]) { g[r * w + c] = s[r]; changed = true; } }
    }
    return g.includes(-1) ? null : g;
  }
  function makeNonogram(level, seed) {
    const cfg = NONO[level] || NONO.easy, { w, h } = cfg, R = rng(seed);
    for (let tries = 0; tries < 400; tries++) {
      // blobby random picture: smooth noise thresholded, so it looks like shapes, not static
      const dens = .5 + R() * .12, g = new Array(w * h).fill(0);
      const f = range(w * h).map(() => R());
      for (let pass = 0; pass < 2; pass++) for (let i = 0; i < w * h; i++) { const r = Math.floor(i / w), c = i % w; let s = f[i] * 2, n = 2; for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < h && cc >= 0 && cc < w) { s += f[rr * w + cc]; n++; } } f[i] = s / n; }
      const sorted = f.slice().sort((a, b) => b - a), cut = sorted[Math.floor(w * h * dens)];
      for (let i = 0; i < w * h; i++) g[i] = f[i] > cut ? 1 : 0;
      // no empty lines
      let bad = false; for (let r = 0; r < h && !bad; r++) if (!g.slice(r * w, r * w + w).includes(1)) bad = true;
      for (let c = 0; c < w && !bad; c++) if (!range(h).some(r => g[r * w + c])) bad = true;
      if (bad) continue;
      const rowsC = range(h).map(r => runs(g.slice(r * w, r * w + w))), colsC = range(w).map(c => runs(range(h).map(r => g[r * w + c])));
      const s = nonoSolve(rowsC, colsC, w, h);
      if (s && s.every((v, i) => v === g[i])) return { type: 'nonogram', level, seed, w, h, rows: rowsC, cols: colsC, solution: g };
    }
    return null;
  }

  /* =================================================================
     QUEENS: one queen in every row, column and colored region,
     and no two queens touching, not even diagonally.
     ================================================================= */
  const QUEENS = {
    kids:   { n: 5, label: 'Kids 5×5' },
    easy:   { n: 6, label: 'Easy 6×6' },
    medium: { n: 7, label: 'Medium 7×7' },
    hard:   { n: 8, label: 'Hard 8×8' },
    expert: { n: 9, label: 'Expert 9×9' },
  };
  function queensCount(reg, n, limit, out) {
    let count = 0; const col = new Array(n).fill(-1), usedC = new Set(), usedR = new Set();
    (function go(r) {
      if (count >= limit) return;
      if (r === n) { count++; if (out) out.push(col.slice()); return; }
      for (let c = 0; c < n; c++) {
        if (usedC.has(c) || usedR.has(reg[r * n + c])) continue;
        if (r > 0 && Math.abs(col[r - 1] - c) <= 1) continue;
        col[r] = c; usedC.add(c); usedR.add(reg[r * n + c]); go(r + 1); usedC.delete(c); usedR.delete(reg[r * n + c]);
        if (count >= limit) return;
      }
    })(0);
    return count;
  }
  function makeQueens(level, seed) {
    const cfg = QUEENS[level] || QUEENS.easy, n = cfg.n, R = rng(seed);
    for (let tries = 0; tries < 3000; tries++) {
      // a valid queen layout
      const q = []; let ok = true;
      for (let r = 0; r < n && ok; r++) { const opts = R.shuffle(range(n)).filter(c => !q.includes(c) && (r === 0 || Math.abs(q[r - 1] - c) > 1)); if (!opts.length) ok = false; else q.push(opts[0]); }
      if (!ok) continue;
      // grow a region from each queen, one random cell at a time
      const reg = new Array(n * n).fill(-1); q.forEach((c, r) => { reg[r * n + c] = r; });
      let left = n * n - n, guard = 0;
      while (left > 0 && guard++ < 20000) {
        const i = R.int(n * n); if (reg[i] < 0) continue;
        const r = Math.floor(i / n), c = i % n, [dr, dc] = R.pick([[0, 1], [1, 0], [0, -1], [-1, 0]]), rr = r + dr, cc = c + dc;
        if (rr < 0 || rr >= n || cc < 0 || cc >= n || reg[rr * n + cc] >= 0) continue;
        reg[rr * n + cc] = reg[i]; left--;
      }
      if (left > 0) continue;
      // nudge region borders until the intended layout is the only answer
      const connected = (id, without) => { const cells = range(n * n).filter(i => reg[i] === id && i !== without); if (!cells.length) return false; const seen = new Set([cells[0]]), st = [cells[0]];
        while (st.length) { const i = st.pop(), r = Math.floor(i / n), c = i % n; for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const rr = r + dr, cc = c + dc, j = rr * n + cc; if (rr >= 0 && rr < n && cc >= 0 && cc < n && j !== without && reg[j] === id && !seen.has(j)) { seen.add(j); st.push(j); } } }
        return seen.size === cells.length; };
      for (let fix = 0; fix < 80; fix++) {
        const alts = []; const k = queensCount(reg, n, 2, alts);
        if (k === 1) return { type: 'queens', level, seed, n, regions: reg, solution: q };
        const alt = alts.find(a => a.some((c, r) => c !== q[r])); if (!alt) break;
        // move one of the other layout's queen cells into a neighboring region
        const cells = R.shuffle(alt.map((c, r) => r * n + c).filter(i => q[Math.floor(i / n)] !== i % n));
        let moved = false;
        for (const i of cells) {
          const r = Math.floor(i / n), c = i % n;
          for (const [dr, dc] of R.shuffle([[0, 1], [1, 0], [0, -1], [-1, 0]])) {
            const rr = r + dr, cc = c + dc; if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
            const to = reg[rr * n + cc]; if (to === reg[i] || !connected(reg[i], i)) continue;
            reg[i] = to; moved = true; break;
          }
          if (moved) break;
        }
        if (!moved) break;
      }
    }
    return null;
  }

  /* =================================================================
     LOGIC GRID: who has what. A cast of people, two or three more
     categories, and clues. Solved by pure deduction.
     ================================================================= */
  const GRID = {
    kids:   { cats: 2, n: 3, label: 'Kids 3 people' },
    easy:   { cats: 2, n: 4, label: 'Easy 4 people' },
    medium: { cats: 3, n: 4, label: 'Medium 4 people' },
    hard:   { cats: 3, n: 5, label: 'Hard 5 people' },
    expert: { cats: 3, n: 5, label: 'Expert 5 people', lean: true },
  };
  const PEOPLE = ['Ava', 'Ben', 'Cleo', 'Dev', 'Ella', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jack', 'Kai', 'Lena', 'Max', 'Nora', 'Omar', 'Pia', 'Rosa', 'Sam', 'Theo', 'Uma', 'Zoe'];
  // each category: label, values, the phrase used in clues ("the one with the X"), and an optional number scale
  const CATS = [
    { key: 'pet', label: 'Pet', vals: ['cat', 'dog', 'parrot', 'rabbit', 'turtle', 'hamster', 'goldfish'], say: v => 'the ' + v + ' owner', have: v => 'owns the ' + v },
    { key: 'color', label: 'Color', vals: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], say: v => 'the one who likes ' + v, have: v => 'likes ' + v },
    { key: 'snack', label: 'Snack', vals: ['popcorn', 'pretzels', 'grapes', 'cookies', 'nachos', 'apples'], say: v => 'the ' + v + ' fan', have: v => 'brought the ' + v },
    { key: 'sport', label: 'Sport', vals: ['soccer', 'tennis', 'swimming', 'hockey', 'golf', 'karate'], say: v => 'the ' + v + ' player', have: v => 'plays ' + v },
    { key: 'age', label: 'Age', num: true, vals: [7, 8, 9, 10, 11, 12], say: v => 'the ' + v + '-year-old', have: v => 'is ' + v, cmp: ['is younger than', 'is older than'], unit: 'year' },
    { key: 'place', label: 'Place', num: true, vals: [1, 2, 3, 4, 5], fmt: v => ['1st', '2nd', '3rd', '4th', '5th'][v - 1], say: v => 'whoever finished ' + ['1st', '2nd', '3rd', '4th', '5th'][v - 1], have: v => 'finished ' + ['1st', '2nd', '3rd', '4th', '5th'][v - 1], cmp: ['finished ahead of', 'finished behind'], unit: 'place' },
  ];
  /* state: poss[p][c] = Set of value indices still possible for person p in category c.
     Clues: {t:'is', a:[c,v], b:[c,v]}  (a and b belong to the same person; c = -1 means the person category)
            {t:'not', a, b}
            {t:'lt', a, b, k}   a's number is lower than b's (k: number category index)
            {t:'next', a, b, k} numbers differ by exactly 1
            {t:'or', a, b, c2}  a is either b or c2 (and not both) */
  function gridSolve(P) {
    const { n, cats, clues } = P, C = cats.length;
    const poss = range(n).map(() => range(C).map(() => new Set(range(n))));
    // persons who could hold attribute x = [c, v]  (c = -1: the person themself)
    const holders = x => x[0] < 0 ? [x[1]] : range(n).filter(p => poss[p][x[0]].has(x[1]));
    const has = (p, x) => x[0] < 0 ? p === x[1] : poss[p][x[0]].has(x[1]);
    const surely = (p, x) => x[0] < 0 ? p === x[1] : poss[p][x[0]].size === 1 && poss[p][x[0]].has(x[1]);
    let changed;
    const drop = (p, x) => { if (x[0] < 0) return false; if (poss[p][x[0]].delete(x[1])) { changed = true; return true; } return false; };
    const numsOf = (p, k) => [...poss[p][k]].map(v => cats[k].vals[v]);
    let guard = 0;
    do {
      changed = false;
      if (guard++ > 400) break;
      // bijection: singles and hidden singles
      for (let c = 0; c < C; c++) for (let p = 0; p < n; p++) {
        if (!poss[p][c].size) return null;
        if (poss[p][c].size === 1) { const v = [...poss[p][c]][0]; for (let q = 0; q < n; q++) if (q !== p) drop(q, [c, v]); }
      }
      for (let c = 0; c < C; c++) for (let v = 0; v < n; v++) {
        const h = holders([c, v]); if (!h.length) return null;
        if (h.length === 1 && poss[h[0]][c].size > 1) { poss[h[0]][c] = new Set([v]); changed = true; }
      }
      for (const cl of clues) {
        const { a, b } = cl;
        if (cl.t === 'is') for (let p = 0; p < n; p++) { if (!has(p, a)) { if (b[0] < 0 && p === b[1]) return null; drop(p, b); } if (!has(p, b)) { if (a[0] < 0 && p === a[1]) return null; drop(p, a); } }
        else if (cl.t === 'not') for (let p = 0; p < n; p++) { if (surely(p, a)) drop(p, b); if (surely(p, b)) drop(p, a); }
        else if (cl.t === 'or') {
          const c2 = cl.c2;
          for (let p = 0; p < n; p++) { if (!has(p, b) && !has(p, c2)) drop(p, a); if (surely(p, a) && b[0] >= 0) for (const v of [...poss[p][b[0]]]) if (v !== b[1] && v !== c2[1]) drop(p, [b[0], v]); if (surely(p, a)) { if (!has(p, b)) { if (c2[0] >= 0) { poss[p][c2[0]] = new Set([c2[1]]); changed = true; } } else if (!has(p, c2)) { if (b[0] >= 0) { poss[p][b[0]] = new Set([b[1]]); changed = true; } } } }
        }
        else if (cl.t === 'lt' || cl.t === 'next') {
          const k = cl.k, HA = holders(a), HB = holders(b);
          const setA = new Set(), setB = new Set(); HA.forEach(p => numsOf(p, k).forEach(x => setA.add(x))); HB.forEach(p => numsOf(p, k).forEach(x => setB.add(x)));
          const fitsA = x => cl.t === 'lt' ? [...setB].some(y => y > x) : setB.has(x - 1) || setB.has(x + 1);
          const fitsB = y => cl.t === 'lt' ? [...setA].some(x => x < y) : setA.has(y - 1) || setA.has(y + 1);
          for (const p of HA) { if (!numsOf(p, k).some(fitsA)) drop(p, a); else if (surely(p, a)) for (const v of [...poss[p][k]]) if (!fitsA(cats[k].vals[v])) drop(p, [k, v]); }
          for (const p of HB) { if (!numsOf(p, k).some(fitsB)) drop(p, b); else if (surely(p, b)) for (const v of [...poss[p][k]]) if (!fitsB(cats[k].vals[v])) drop(p, [k, v]); }
          // a and b can't be the same person
          if (HA.length === 1) { const p = HA[0]; if (surely(p, a) || a[0] < 0) drop(p, b); }
          if (HB.length === 1) { const p = HB[0]; if (surely(p, b) || b[0] < 0) drop(p, a); }
        }
      }
    } while (changed);
    return poss;
  }
  const gridDone = (poss) => poss && poss.every(row => row.every(s => s.size === 1));
  function makeGrid(level, seed) {
    const cfg = GRID[level] || GRID.easy, R = rng(seed), n = cfg.n;
    for (let tries = 0; tries < 60; tries++) {
      // choose categories: always at least one number category from medium up, so ordering clues appear
      const numCats = CATS.filter(c => c.num && c.vals.length >= n), other = CATS.filter(c => !c.num);
      const chosen = R.shuffle(other).slice(0, cfg.cats - (level === 'kids' ? 0 : 1));
      if (level !== 'kids') chosen.push(R.pick(numCats));
      const cats = chosen.map(c => { let vals = c.num ? c.vals.slice(0, n) : R.shuffle(c.vals).slice(0, n); if (c.num && c.key === 'age' && n < c.vals.length) { const s = R.int(c.vals.length - n + 1); vals = c.vals.slice(s, s + n); } return Object.assign({}, c, { vals }); });
      const people = R.shuffle(PEOPLE).slice(0, n).sort();
      const sol = cats.map(() => R.shuffle(range(n)));   // sol[c][p] = value index of person p in category c
      const C = cats.length, numK = cats.findIndex(c => c.num);
      const who = (c, v) => sol[c].indexOf(v);
      const attr = () => { const c = R.int(C + 1) - 1; return c < 0 ? [-1, R.int(n)] : [c, R.int(n)]; };
      const owner = x => x[0] < 0 ? x[1] : who(x[0], x[1]);
      const sameCat = (x, y) => x[0] === y[0];
      const isNum = x => x[0] === numK && numK >= 0;
      // candidate clue factory, true to the solution
      const mkClue = () => {
        const r = R();
        const a = attr(); let b = attr(); let g2 = 0; while ((sameCat(a, b) || isNum(a) && isNum(b)) && g2++ < 20) b = attr();
        if (sameCat(a, b)) return null;
        if (numK >= 0 && r < (cfg.lean ? .45 : .32) && !isNum(a) && !isNum(b)) {
          const na = cats[numK].vals[sol[numK][owner(a)]], nb = cats[numK].vals[sol[numK][owner(b)]];
          if (owner(a) === owner(b)) return null;
          if (Math.abs(na - nb) === 1 && R() < .4) return { t: 'next', a, b, k: numK };
          return na < nb ? { t: 'lt', a, b, k: numK } : { t: 'lt', a: b, b: a, k: numK };
        }
        if (r < .5) { // positive or negative pairing
          if (owner(a) === owner(b)) return R() < (cfg.lean ? .35 : .6) ? { t: 'is', a, b } : null;
          return { t: 'not', a, b };
        }
        if (r < .62 && owner(a) !== owner(b)) {   // either-or
          let c2 = attr(); let g3 = 0; while ((c2[0] !== b[0] || owner(c2) === owner(b) || sameCat(a, c2)) && g3++ < 30) c2 = [b[0], R.int(n)];
          if (c2[0] === b[0] && owner(c2) !== owner(b) && !sameCat(a, c2) && (owner(a) === owner(b) || owner(a) === owner(c2))) return { t: 'or', a, b, c2 };
          return null;
        }
        return owner(a) === owner(b) ? { t: 'is', a, b } : { t: 'not', a, b };
      };
      const clues = []; const P = { n, cats, clues };
      let g = 0;
      while (!gridDone(gridSolve(P)) && g++ < 400) { const cl = mkClue(); if (cl) { const before = JSON.stringify(gridSolve(P) && gridSolve(P).map(r => r.map(s => s.size))); clues.push(cl); const after = JSON.stringify(gridSolve(P) && gridSolve(P).map(r => r.map(s => s.size))); if (before === after) clues.pop(); } }
      if (!gridDone(gridSolve(P))) continue;
      // drop clues that aren't needed
      for (let i = clues.length - 1; i >= 0; i--) { const c = clues.splice(i, 1)[0]; if (!gridDone(gridSolve(P))) clues.splice(i, 0, c); }
      const minClues = { kids: 3, easy: 4, medium: 6, hard: 8, expert: 8 }[level] || 4;
      if (clues.length < minClues) continue;
      const res = gridSolve(P);
      if (!res.every((row, p) => row.every((s, c) => [...s][0] === sol[c][p]))) continue;   // sanity
      return { type: 'grid', level, seed, n, people, cats: cats.map(c => ({ key: c.key, label: c.label, num: !!c.num, vals: c.vals.map(v => c.fmt ? c.fmt(v) : String(v)) })), clues: R.shuffle(clues).map(c => Object.assign({ text: clueText(c, cats, people) }, c)), solution: sol };
    }
    return null;
  }
  function clueText(cl, cats, people) {
    const say = (x, cap) => { const s = x[0] < 0 ? people[x[1]] : cats[x[0]].say(cats[x[0]].vals[x[1]]); return cap ? s[0].toUpperCase() + s.slice(1) : s; };
    const have = x => x[0] < 0 ? 'is ' + people[x[1]] : cats[x[0]].have(cats[x[0]].vals[x[1]]);
    const haveNot = x => {
      if (x[0] < 0) return 'is not ' + people[x[1]];
      const h = cats[x[0]].have(cats[x[0]].vals[x[1]]);
      if (h.startsWith('is ')) return 'is not ' + h.slice(3);
      const [verb, ...rest] = h.split(' ');
      const base = { owns: 'own', likes: 'like', brought: 'bring', plays: 'play', finished: 'finish' }[verb] || verb;
      return (verb === 'brought' || verb === 'finished' ? "didn't " : "doesn't ") + base + ' ' + rest.join(' ');
    };
    const subj = x => say(x, true);
    if (cl.t === 'is') { const [x, y] = cl.a[0] >= 0 && cl.b[0] < 0 ? [cl.b, cl.a] : [cl.a, cl.b]; return subj(x) + ' ' + have(y) + '.'; }
    if (cl.t === 'not') { const [x, y] = cl.a[0] >= 0 && cl.b[0] < 0 ? [cl.b, cl.a] : [cl.a, cl.b]; return subj(x) + ' ' + haveNot(y) + '.'; }
    if (cl.t === 'or') return subj(cl.a) + ' is either ' + say(cl.b) + ' or ' + say(cl.c2) + '.';
    const k = cats[cl.k];
    if (cl.t === 'lt') return subj(cl.a) + ' ' + k.cmp[0] + ' ' + say(cl.b) + '.';
    if (cl.t === 'next') return k.key === 'age' ? subj(cl.a) + ' and ' + say(cl.b) + ' are exactly 1 year apart.' : subj(cl.a) + ' finished right next to ' + say(cl.b) + '.';
    return '';
  }

  /* ---------------- dispatch ---------------- */
  const TYPES = {
    grid:     { name: 'Logic Grid',    levels: GRID,   make: makeGrid },
    sudoku:   { name: 'Sudoku',        levels: SUDOKU, make: makeSudoku },
    nonogram: { name: 'Picture Cross', levels: NONO,   make: makeNonogram },
    queens:   { name: 'Queens',        levels: QUEENS, make: makeQueens },
  };
  const LEVELS = ['kids', 'easy', 'medium', 'hard', 'expert'];
  function make(type, level, seed) {
    const T = TYPES[type]; let s = seed >>> 0;
    for (let i = 0; i < 20; i++) { const p = T.make(level, s); if (p) return p; s = (s * 1103515245 + 12345) >>> 0; }
    return null;
  }
  const api = { rng, TYPES, LEVELS, make, makeSudoku, makeNonogram, makeQueens, makeGrid, sudokuCount, sudokuUnits, sudokuLogic, nonoSolve, runs, queensCount, gridSolve, gridDone };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Logic = api;
})(typeof window !== 'undefined' ? window : globalThis);
