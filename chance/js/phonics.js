/* ============================================================
   phonics.js — how a letter chunk gets said out loud

   THE PROBLEM THIS FIXES
   Speech synthesis reads *words*. It cannot say an isolated
   phoneme. Feed it "fff" and you get a mess; feed it "f" and you
   get the letter name "eff"; feed it "str" and you get noise. The
   first version of this app invented spellings like "fff" and
   "rrr" and handed them to the synthesizer, so "far" came out as
   two disconnected noises instead of a blend. That was wrong.

   THE FIX
   Say it the way a reading teacher says it: name the letter, then
   anchor it in a real word the synthesizer can definitely
   pronounce.

       far  ->  "far"
                "f, like in fan"      [f highlighted]
                "ar, like in car"     [ar highlighted]
                "Now blend it: far"

   Every token in that script is a real English word, so no engine
   on any device can mangle it. It is also exactly the language he
   already hears at school.

   THE UPGRADE PATH
   A recorded human voice CAN say a true isolated phoneme, and the
   recording booth stores clips against these same chunk keys. So
   when Grandpa has recorded /f/, his /f/ plays instead of the "f,
   like in fan" script — and because the key is the letter chunk
   and not the word, recording the ~90 letter sounds once covers
   all 180 words in the course.

   Keys are the SPELLING chunks from the curriculum ("f", "ar",
   "sh", "str", "ee"), not invented phonetic spellings. Real
   syllables and whole-word chunks ("han", "bridge", "light") need
   no entry — the synthesizer already says those correctly, so
   anything not in this table is simply spoken as it is written.
   ============================================================ */

window.Phonics = (function () {

  /* a    : the anchor word — a real word the engine will pronounce
     a2   : a spare anchor, used when `a` IS the word being decoded
            ("s p, like in spin" teaches nothing while reading "spin")
     lead : what to say before ", like in ___". Defaults to the chunk
            spelled out letter by letter, which is how it is taught.
            Overridden where the letter names would mislead — every
            vowel, and any grapheme whose letters lie about its sound. */
  var CHUNKS = {
    /* ---- single consonants ---- */
    b: { a: 'bat', a2: 'bed' }, c: { a: 'cat', a2: 'cup' }, d: { a: 'dog', a2: 'dad' },
    f: { a: 'fan', a2: 'fun' }, g: { a: 'goat', a2: 'gum' }, h: { a: 'hat', a2: 'hop' },
    j: { a: 'jam', a2: 'jet' }, k: { a: 'kite', a2: 'key' }, l: { a: 'leaf', a2: 'lamp' },
    m: { a: 'map', a2: 'mom' }, n: { a: 'net', a2: 'nap' }, p: { a: 'pig', a2: 'pot' },
    r: { a: 'run', a2: 'red' }, s: { a: 'sun', a2: 'sit' }, t: { a: 'top', a2: 'ten' },
    v: { a: 'van', a2: 'vet' }, w: { a: 'win', a2: 'wet' }, y: { a: 'yes', a2: 'yard' },
    z: { a: 'zip', a2: 'zoo' },

    /* ---- consonant digraphs ---- */
    sh: { a: 'ship', a2: 'shop' }, ch: { a: 'chip', a2: 'chin' },
    th: { a: 'thin', a2: 'thumb' }, ng: { a: 'ring', a2: 'song' },
    ck: { a: 'duck', a2: 'sock', lead: 'c k says k' },
    ph: { a: 'phone', a2: 'graph', lead: 'p h says f' },
    kn: { a: 'knot', a2: 'knife', lead: 'k n, with a silent k, says n' },
    wr: { a: 'wrap', a2: 'write', lead: 'w r, with a silent w, says r' },
    tch: { a: 'catch', a2: 'match', lead: 't c h says ch' },
    dge: { a: 'bridge', a2: 'edge', lead: 'd g e says j' },
    ge: { a: 'edge', a2: 'cage', lead: 'g e says j' },
    ce: { a: 'ice', a2: 'race', lead: 'c e says s' },
    ci: { a: 'city', a2: 'circle', lead: 'c i says s' },
    cy: { a: 'icy', a2: 'juicy', lead: 'c y says s' },
    ght: { a: 'night', a2: 'light', lead: 'g h t says t' },
    ve: { a: 'give', a2: 'have' }, ll: { a: 'bell', a2: 'hill' }, ss: { a: 'grass', a2: 'miss' },
    mp: { a: 'lamp', a2: 'camp' }, nk: { a: 'sink', a2: 'bank' },
    nt: { a: 'tent', a2: 'hunt' }, nch: { a: 'lunch', a2: 'branch' },
    st: { a: 'stop', a2: 'stem' }, sp: { a: 'spot', a2: 'speak' },

    /* ---- consonant blends ---- */
    bl: { a: 'black', a2: 'blue' }, br: { a: 'brick', a2: 'bring' },
    cl: { a: 'clap', a2: 'clock' }, cr: { a: 'crab', a2: 'cross' },
    dr: { a: 'drum', a2: 'dress' }, fl: { a: 'flag', a2: 'floor' },
    gl: { a: 'glad', a2: 'glue' }, gr: { a: 'grab', a2: 'green' },
    pl: { a: 'plan', a2: 'plus' }, sl: { a: 'sled', a2: 'slid' },
    sw: { a: 'swim', a2: 'sweet' }, tr: { a: 'tree', a2: 'truck' },
    scr: { a: 'scrap', a2: 'scrub' }, spl: { a: 'split', a2: 'splint' },
    spr: { a: 'sprint', a2: 'spray' }, str: { a: 'street', a2: 'string' },
    thr: { a: 'three', a2: 'throw' },

    /* ---- short vowels. The letter NAME is the long sound, so
            saying "a" here would teach the wrong thing outright. ---- */
    a: { a: 'cat', a2: 'hat', lead: 'short a' },
    e: { a: 'bed', a2: 'red', lead: 'short e' },
    i: { a: 'pig', a2: 'sit', lead: 'short i' },
    o: { a: 'hot', a2: 'pot', lead: 'short o' },
    u: { a: 'cup', a2: 'bug', lead: 'short u' },

    /* ---- vowel teams ---- */
    ee: { a: 'feet', a2: 'green', lead: 'e e says ee' },
    ea: { a: 'eat', a2: 'beach', lead: 'e a says ee' },
    oa: { a: 'boat', a2: 'road', lead: 'o a says oh' },
    ai: { a: 'rain', a2: 'train', lead: 'a i says ay' },
    ay: { a: 'day', a2: 'play', lead: 'a y says ay' },
    ew: { a: 'new', a2: 'flew', lead: 'e w says oo' },
    ui: { a: 'fruit', a2: 'suit', lead: 'u i says oo' },
    oo: { a: 'moon', a2: 'soon', lead: 'o o says oo' },
    ou: { a: 'cloud', a2: 'shout', lead: 'o u says ow' },
    ow: { a: 'snow', a2: 'yellow', lead: 'o w says oh' },
    aigh: { a: 'rain', a2: 'eight', lead: 'a i g h says ay' },
    igh: { a: 'night', a2: 'high', lead: 'i g h says long i' },

    /* ---- r-controlled ---- */
    ar: { a: 'car', a2: 'barn', lead: 'a r says ar' },
    or: { a: 'fork', a2: 'storm', lead: 'o r says or' },
    er: { a: 'her', a2: 'water', lead: 'e r says er' },
    ur: { a: 'fur', a2: 'turn', lead: 'u r says er' },
    ir: { a: 'bird', a2: 'shirt', lead: 'i r says er' },
    ear: { a: 'hear', a2: 'near', lead: 'e a r says eer' },

    /* ---- magic-e rimes: the e on the end makes the vowel long ---- */
    ace: { a: 'race', a2: 'place' }, ade: { a: 'made', a2: 'shade' },
    ame: { a: 'game', a2: 'name' }, ape: { a: 'tape', a2: 'grape' },
    ase: { a: 'chase', a2: 'base' }, ave: { a: 'cave', a2: 'gave' },
    ide: { a: 'ride', a2: 'slide' }, ife: { a: 'life', a2: 'wife' },
    ise: { a: 'wise', a2: 'noise' }, ite: { a: 'kite', a2: 'white' },
    obe: { a: 'robe', a2: 'globe' }, one: { a: 'bone', a2: 'stone' },
    ounce: { a: 'bounce', a2: 'ounce' }, ange: { a: 'change', a2: 'orange' },

    /* ---- syllable endings that garble on their own ---- */
    le: { a: 'candle', a2: 'apple', lead: 'l e says ul' },
    tle: { a: 'little', a2: 'turtle', lead: 't l e says ul' },
    dle: { a: 'handle', a2: 'candle', lead: 'd l e says dul' },
    cle: { a: 'circle', a2: 'uncle', lead: 'c l e says kul' },
    ley: { a: 'valley', a2: 'pulley', lead: 'l e y says lee' },
    ty: { a: 'city', a2: 'party', lead: 't y says tee' },
    tly: { a: 'softly', a2: 'gently', lead: 't l y says tlee' },
    ed: { a: 'landed', a2: 'floated', lead: 'the ending e d' },
    ing: { a: 'going', a2: 'jumping' },

    /* ---- odd fragments this curriculum happens to need ---- */
    wei: { a: 'way', a2: 'weigh', lead: 'w e i says way' },
    jui: { a: 'juice', a2: 'juicy', lead: 'j u i says joo' },
    pho: { a: 'photo', a2: 'phone', lead: 'p h o says foh' },
    meas: { a: 'measure', a2: 'treasure', lead: 'm e a s says mezh' },
    ured: { a: 'measured', a2: 'treasured', lead: 'u r e d says urd' },
    ure: { a: 'sure', a2: 'pure' }
  };

  /* A grapheme can say two different things depending on the word:
     the oo in "moon" is not the oo in "brook". Rather than pick one
     anchor and be wrong half the time, the exceptions are listed
     per word. Key is "word:chunkIndex". */
  var OVERRIDES = {
    // oo: the book sound, not the moon sound
    'brook:1': { a: 'book', a2: 'look', lead: 'o o says oo' },
    'hook:1': { a: 'book', a2: 'look', lead: 'o o says oo' },
    'wood:1': { a: 'book', a2: 'good', lead: 'o o says oo' },
    // ow: the cow sound, not the snow sound
    'down:1': { a: 'cow', a2: 'now', lead: 'o w says ow' },
    'crowd:1': { a: 'cow', a2: 'now', lead: 'o w says ow' },
    // ou: already the ow sound, but anchor away from the word itself
    'mouth:1': { a: 'cloud', a2: 'shout', lead: 'o u says ow' },
    'south:1': { a: 'cloud', a2: 'shout', lead: 'o u says ow' },
    'trout:1': { a: 'cloud', a2: 'shout', lead: 'o u says ow' },
    // ea: the bread sound, not the eat sound
    'spread:1': { a: 'bread', a2: 'head', lead: 'e a says short e' },
    // unstressed a at the start of a word
    'apart:0': { a: 'about', a2: 'ago', lead: 'a says uh' }
  };

  function key(chunk) { return String(chunk || '').toLowerCase(); }

  function entryFor(chunk, word, index) {
    var o = OVERRIDES[String(word || '').toLowerCase() + ':' + index];
    if (o) return o;
    return CHUNKS[key(chunk)] || null;
  }

  /* Pick the anchor, avoiding the word we are currently decoding.
     "s p, like in spin" is worthless while he is reading "spin". */
  function anchorFor(e, word) {
    var w = String(word || '').toLowerCase();
    if (e.a && e.a.toLowerCase() !== w) return e.a;
    if (e.a2 && e.a2.toLowerCase() !== w) return e.a2;
    return e.a || e.a2 || '';
  }

  /* What to say for one chunk: a string made only of real words, so
     no speech engine on any device can mangle it. Chunks that are
     already pronounceable syllables are simply spoken as written. */
  function chunkPhrase(chunk, word, index) {
    var e = entryFor(chunk, word, index);
    if (!e) return String(chunk);                  // real syllable: say it
    var lead = e.lead || spellOut(chunk);
    var anchor = anchorFor(e, word);
    return anchor ? lead + ', like in ' + anchor + '.' : lead + '.';
  }

  /* Multi-letter graphemes are taught letter by letter: "a-r says ar".
     Single letters are just themselves. */
  function spellOut(chunk) {
    var c = String(chunk);
    return c.length === 1 ? c : c.split('').join(' ');
  }

  /* The full sound-out script for a word, as an ordered list of
     steps. Each step is either a recorded-clip lookup (a chunk) or
     a phrase to speak, plus which chunk to highlight.

       { chunk, index, phrase, highlight }
       { phrase, highlight: -1 }                */
  function script(word, parts) {
    var steps = [];
    steps.push({ phrase: String(word), highlight: -1, whole: true });
    (parts || []).forEach(function (p, i) {
      steps.push({
        chunk: p, index: i, highlight: i,
        phrase: chunkPhrase(p, word, i)
      });
    });
    if ((parts || []).length > 1) {
      steps.push({ phrase: 'Now blend it.', highlight: -1 });
      steps.push({ phrase: String(word), highlight: -1, whole: true });
    }
    return steps;
  }

  /* Every distinct chunk in the whole course, for the recording
     booth: record these ~90 once and every word benefits. */
  function allChunks() {
    var seen = Object.create(null), out = [];
    Curriculum.allDays().forEach(function (d) {
      d.reading.words.forEach(function (w) {
        w.parts.forEach(function (p, i) {
          var k = key(p);
          if (seen[k]) return;
          seen[k] = true;
          out.push({
            chunk: p,
            phrase: chunkPhrase(p, w.w, i),
            anchor: (entryFor(p, w.w, i) || {}).a || '',
            example: w.w
          });
        });
      });
    });
    return out.sort(function (a, b) {
      return a.chunk.length - b.chunk.length || a.chunk.localeCompare(b.chunk);
    });
  }

  /* Audit hook, used by the test suite. A chunk is "risky" if the
     synthesizer cannot be trusted to say it: a single letter, or
     any chunk with no vowel in it. Every risky chunk must have an
     anchor word, or somebody will hear "eff eff eff" again. */
  function audit() {
    var problems = [];
    Curriculum.allDays().forEach(function (d) {
      d.reading.words.forEach(function (w) {
        if (w.parts.join('').toLowerCase().replace(/-/g, '') !== w.w.toLowerCase().replace(/-/g, '')) {
          problems.push(w.w + ': chunks spell "' + w.parts.join('') + '"');
        }
        w.parts.forEach(function (p, i) {
          if (!p || !String(p).trim()) {
            problems.push(w.w + ': empty chunk at ' + i);
            return;
          }
          var e = entryFor(p, w.w, i);
          var risky = p.length === 1 || !/[aeiouy]/i.test(p);
          if (risky && !e) {
            problems.push(w.w + ': chunk "' + p + '" has no anchor word');
            return;
          }
          if (!e) return;
          // an anchor that IS the word being decoded teaches nothing
          if (anchorFor(e, w.w).toLowerCase() === w.w.toLowerCase()) {
            problems.push(w.w + ': chunk "' + p + '" anchors to the word itself — needs an a2');
          }
          // and the phrase must not contain the answer either
          var phrase = chunkPhrase(p, w.w, i).toLowerCase();
          if (p.length < w.w.length && new RegExp('\\b' + w.w.toLowerCase() + '\\b').test(phrase)) {
            problems.push(w.w + ': chunk "' + p + '" phrase gives the word away: "' + phrase + '"');
          }
        });
      });
    });
    return problems;
  }

  return {
    script: script, chunkPhrase: chunkPhrase, allChunks: allChunks,
    audit: audit, entryFor: entryFor
  };
})();
