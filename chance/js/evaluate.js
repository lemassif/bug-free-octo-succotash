/* ============================================================
   evaluate.js — the real-time reasoning evaluator

   A normal quiz app knows one thing: right or wrong. That is not
   useful for a 7-year-old, because *why* he picked an answer is
   the whole story. "12" can be a careful answer or a tap.

   So every wrong choice in the curriculum data carries a TAG: the
   specific thinking error that leads to that choice. The evaluator
   watches the tags, plus how long he took and how many tries, and
   reacts inside the same second:

     - it speaks a coaching line aimed at that exact error
       (not "wrong", not "try again")
     - it drops a live signal into the Thinking Meter at the top
     - it logs the event so the grown-up report can say
       "he is sound on multiplication, but bigger-number-bias
       showed up 6 times in speed problems this week"

   Behaviour signals it also catches, which no answer key can:
     fast-guess     answered faster than the question can be read
     hesitation     long freeze — the item is above his level today
     thrash         three tries on one item, needs the scaffold
     repeat-tag     the same thinking error twice in one sitting
   ============================================================ */

window.Evaluate = (function () {

  /* ---------------- the thinking-error dictionary ----------------
     say   : spoken to Chance immediately, in his language
     label : what the grown-up report calls it
     fix   : what to practice, for the report
     Tags are shared across science, math and reading on purpose —
     the same habit shows up in all three, and seeing that is the
     point of the report. */
  var TAGS = {
    'bigger-number-bias': {
      label: 'Picks the bigger number',
      say: "You grabbed the biggest number. Big numbers aren't always the answer. What is the question really asking?",
      fix: 'Ask "what is being counted?" out loud before choosing.'
    },
    'additive-for-multiplicative': {
      label: 'Adds when it should be groups-of',
      say: "That looks like adding. This one is groups. How many groups, and how many in each group?",
      fix: 'Draw the groups as circles with dots before answering.'
    },
    'unit-mixup': {
      label: 'Mixes up the units',
      say: "Check the words next to the number. Minutes and hours are not the same size, and neither are feet and miles.",
      fix: 'Read the unit out loud with every number.'
    },
    'reversed-relation': {
      label: 'Flips the relationship backwards',
      say: "You turned it around. Going faster means the trip takes LESS time, not more. Say it out loud both ways.",
      fix: 'Practice "faster means less time" with two real trips.'
    },
    'surface-feature': {
      label: 'Matches a word instead of the meaning',
      say: "That answer copies a word from the question, but it doesn't answer it. What is the question actually asking?",
      fix: 'Cover the choices, answer in your own words first, then look.'
    },
    'literal-appearance': {
      label: 'Trusts how it looks over how it works',
      say: "That's how it LOOKS. Scientists ask what is really happening. What is really going on here?",
      fix: 'Name the appearance and the reality separately.'
    },
    'ignored-condition': {
      label: 'Skips a detail in the story',
      say: "There's a clue in the story you flew past. Let's read it again and hunt for the number you missed.",
      fix: 'Underline every number and every "each/every/both" in the story.'
    },
    'off-by-one': {
      label: 'Off by one',
      say: "So close! You're one away. Count it again slowly, with your finger.",
      fix: 'Count aloud and touch each item once.'
    },
    'part-whole-mixup': {
      label: 'Confuses the part with the whole',
      say: "Careful — is that the whole thing, or just one piece of it?",
      fix: 'Say "whole" and "part" out loud before choosing.'
    },
    'perimeter-area-mixup': {
      label: 'Confuses around-the-edge with inside',
      say: "Are we walking around the outside, or covering the inside? Those are two different jobs.",
      fix: 'Trace the edge with a finger, then tap the inside squares.'
    },
    'shape-orientation': {
      label: 'Thinks a turned shape is a new shape',
      say: "Turning a shape doesn't change what it is. A square tipped on its corner is still a square.",
      fix: 'Rotate a cut-out shape by hand and re-name it each turn.'
    },
    'sequence-error': {
      label: 'Gets the order of steps wrong',
      say: "Right pieces, wrong order. What has to happen FIRST?",
      fix: 'Number the steps 1-2-3 before answering.'
    },
    'animism': {
      label: 'Gives objects wants and feelings',
      say: "Rocks and planets don't want anything — they just follow rules. What rule is making this happen?",
      fix: 'Replace "it wants to" with "the force that pushes it is…"'
    },
    'overgeneralize': {
      label: 'Uses a rule where it does not apply',
      say: "That rule works sometimes, but not here. What is different about this one?",
      fix: 'Hunt for the exception on purpose.'
    },
    'guess-plausible': {
      label: 'Picks the sensible-sounding answer without checking',
      say: "That sounds right, but let's prove it. Show me the numbers you used.",
      fix: 'Say the calculation out loud before tapping.'
    },
    'letter-look': {
      label: 'Reads by the shape of the word',
      say: "That word starts the same, but look at the middle sounds. Let's sound the whole word out.",
      fix: 'Touch each sound chunk while saying it.'
    },
    'vowel-swap': {
      label: 'Swaps the vowel sound',
      say: "Check the vowel in the middle. That one little letter changes the whole word.",
      fix: 'Short-vowel drill with the five vowel cards.'
    }
  };

  var BEHAVIOR = {
    'fast-guess': {
      label: 'Answered before reading',
      say: "Whoa, speedy! That was faster than the question. Read it with me once, then choose.",
      fix: 'Require him to say the question back before answering.'
    },
    'hesitation': {
      label: 'Long freeze',
      say: "This one's tricky. Want me to read it again? There's no clock here.",
      fix: 'This item is above his level today — scaffold it or come back later.'
    },
    'thrash': {
      label: 'Three tries on one item',
      say: "Let's take two answers off the board and think about the two that are left.",
      fix: 'Break the problem into two smaller questions.'
    },
    'repeat-tag': {
      label: 'Same thinking error twice in one sitting',
      say: "That's the same trap as before! Remember what we said? Let's use it.",
      fix: 'Do a 2-minute drill on this habit before the next mission.'
    }
  };

  var PRAISE = [
    "Yes! That's exactly the reasoning.",
    "Nailed it. You used the numbers, not a guess.",
    "That's it. Good, careful thinking.",
    "Correct — and you found it on the first try.",
    "Right! You caught the important detail."
  ];
  var PRAISE_RECOVER = [
    "There it is. You fixed it yourself — that's what scientists do.",
    "Yes! Second look, better answer.",
    "That's the one. Slowing down worked."
  ];

  /* thresholds, in milliseconds */
  var FAST_MS = 1900;      // faster than a 7-year-old can read the question
  var SLOW_MS = 32000;     // frozen

  var session = null;

  function startSession(dayId) {
    session = {
      dayId: dayId,
      started: Date.now(),
      events: [],
      tagCounts: {},
      firstTry: 0,
      items: 0,
      focus: 72          // drives the Thinking Meter, 0..100
    };
    return session;
  }

  function currentSession() { return session; }

  /* ---------------------------------------------------------------
     judge() is called the instant a choice is tapped.
     Returns everything the UI needs to react:
       { correct, speak, tone, flags, focus, reveal, eliminate }
     --------------------------------------------------------------- */
  function judge(o) {
    // o: {itemId, station, domain, choice, attempt, ms, item}
    if (!session) startSession(o.dayId || 'free');
    var correct = !!o.choice.correct;
    var tag = o.choice.tag || null;
    var flags = [];
    var speak = '';
    var tone = correct ? 'good' : 'coach';
    var reveal = false, eliminate = false;

    if (o.attempt === 1) session.items++;

    /* --- behaviour first: how he answered matters as much as what --- */
    if (!correct && o.ms < FAST_MS) flags.push('fast-guess');
    if (correct && o.ms < 900 && (o.item && o.item.multiStep)) flags.push('lucky-fast');
    if (o.ms > SLOW_MS) flags.push('hesitation');
    if (!correct && o.attempt >= 3) { flags.push('thrash'); eliminate = true; }

    /* --- the specific thinking error --- */
    if (tag) {
      session.tagCounts[tag] = (session.tagCounts[tag] || 0) + 1;
      if (session.tagCounts[tag] >= 2) flags.push('repeat-tag');
    }

    /* --- what the owl says, most specific message wins --- */
    if (correct) {
      speak = o.attempt === 1 ? pick(PRAISE) : pick(PRAISE_RECOVER);
      if (o.attempt === 1) session.firstTry++;
      session.focus = clamp(session.focus + (o.attempt === 1 ? 8 : 4));
      if (flags.indexOf('lucky-fast') !== -1) {
        speak += " Tell me how you got it?";
      }
    } else if (flags.indexOf('fast-guess') !== -1) {
      speak = BEHAVIOR['fast-guess'].say;
      tone = 'slow-down';
      session.focus = clamp(session.focus - 16);
    } else if (flags.indexOf('repeat-tag') !== -1 && tag) {
      speak = BEHAVIOR['repeat-tag'].say + ' ' + TAGS[tag].say;
      tone = 'pattern';
      session.focus = clamp(session.focus - 10);
    } else if (tag && TAGS[tag]) {
      speak = TAGS[tag].say;
      session.focus = clamp(session.focus - 7);
    } else {
      speak = "Not that one. Read it with me one more time.";
      session.focus = clamp(session.focus - 6);
    }

    if (!correct && o.attempt >= 3) {
      reveal = true;
      speak = "Let's do this one together. " + (o.item && o.item.hint ? o.item.hint : '');
    } else if (!correct && o.item && o.item.hint && o.attempt === 2) {
      speak += ' ' + o.item.hint;
    }

    if (flags.indexOf('hesitation') !== -1 && !correct) {
      speak = BEHAVIOR.hesitation.say + ' ' + speak;
    }

    var ev = {
      t: Date.now(), dayId: session.dayId, itemId: o.itemId, station: o.station,
      domain: o.domain || o.station, correct: correct, tag: tag,
      attempt: o.attempt, ms: o.ms, flags: flags
    };
    session.events.push(ev);
    if (window.Progress) Progress.logEvent(ev);

    return {
      correct: correct, speak: speak, tone: tone, flags: flags,
      focus: session.focus, reveal: reveal, eliminate: eliminate,
      tag: tag, tagLabel: tag && TAGS[tag] ? TAGS[tag].label : null
    };
  }

  /* Reading station: judge a spoken word instead of a tap. */
  function judgeSpoken(o) {
    // o: {word, parts, confidence, attempt, heard, itemId}
    var c = o.confidence;
    var ok = c >= 0.72;
    var close = !ok && c >= 0.45;
    var speak, tone = ok ? 'good' : 'coach', flags = [];

    if (ok) {
      speak = c >= 0.95
        ? 'That is exactly right. ' + o.word + '.'
        : 'Yes — ' + o.word + '. You got it.';
    } else if (close) {
      speak = 'Close! I heard something like that. Listen to the sounds again.';
      flags.push('letter-look');
    } else if (!o.heard) {
      speak = Phrases.micOff;
      tone = 'retry';
    } else {
      speak = 'I heard "' + o.heard + '". The word is ' + o.word + '. Let me break it up for you.';
      flags.push('vowel-swap');
    }

    var ev = {
      t: Date.now(), dayId: session ? session.dayId : 'free', itemId: o.itemId,
      station: 'reading', domain: 'phonics', correct: ok,
      tag: ok ? null : (close ? 'letter-look' : 'vowel-swap'),
      attempt: o.attempt, ms: o.ms || 0, flags: flags, heard: o.heard || ''
    };
    if (session) {
      session.events.push(ev);
      session.items += o.attempt === 1 ? 1 : 0;
      if (ok && o.attempt === 1) session.firstTry++;
      session.focus = clamp(session.focus + (ok ? 6 : -5));
    }
    if (window.Progress) Progress.logEvent(ev);

    return { correct: ok, close: close, speak: speak, tone: tone, focus: session ? session.focus : 70 };
  }

  /* --------------------- session-level read-out --------------------- */
  function sessionSummary() {
    if (!session) return null;
    var s = session;
    var times = s.events.filter(function (e) { return e.attempt === 1 && e.ms; }).map(function (e) { return e.ms; });
    var topTag = Object.keys(s.tagCounts).sort(function (a, b) { return s.tagCounts[b] - s.tagCounts[a]; })[0] || null;
    return {
      dayId: s.dayId,
      items: s.items,
      firstTry: s.firstTry,
      firstTryPct: s.items ? Math.round(100 * s.firstTry / s.items) : 0,
      medianMs: median(times),
      focus: s.focus,
      topTag: topTag,
      topTagLabel: topTag ? TAGS[topTag].label : null,
      topTagCount: topTag ? s.tagCounts[topTag] : 0,
      cleanRun: s.items > 0 && s.firstTry === s.items,
      events: s.events.slice()
    };
  }

  function tagInfo(tag) { return TAGS[tag] || BEHAVIOR[tag] || null; }
  function allTags() { return TAGS; }

  function clamp(n) { return Math.max(5, Math.min(100, Math.round(n))); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function median(a) {
    if (!a.length) return 0;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  }

  return {
    startSession: startSession, currentSession: currentSession,
    judge: judge, judgeSpoken: judgeSpoken, sessionSummary: sessionSummary,
    tagInfo: tagInfo, allTags: allTags, BEHAVIOR: BEHAVIOR,
    // the recording studio lists these so they can be said in a real voice
    praiseLines: function () { return PRAISE.concat(PRAISE_RECOVER); }
  };
})();
