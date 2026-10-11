/* ============================================================
   READING LEVEL: GRADE 2

   Same 60 days, same science, same math — harder words to decode.
   Chance is going into second grade, and the first-grade set
   started at "sun", "hot" and "map". This layer replaces each day's
   three words, the sentence built from them, and the question about
   that sentence.

   The progression follows the second-grade reading standard
   (Common Core RF.2.3): distinguish long and short vowels in
   two-syllable words, more vowel teams, r-controlled vowels in
   longer words, prefixes and suffixes, and inconsistent spellings
   like silent letters. Words are split mostly by SYLLABLE rather
   than by single sound, because reading by syllable is the
   second-grade skill.

   Every word is still tied to that day's science, and every
   sentence uses the words, so decoding and vocabulary stay the
   same practice. The first-grade set is kept: Grown-Ups → Settings
   → Reading level steps back if a week is too hard.

   Same rules as the unit files: every wrong answer carries the tag
   of the mistake that produces it.
   ============================================================ */
(function () {
  var C = Curriculum.C, W = Curriculum.W;

  function R(words, sentence, q, choices, hint, show) {
    return { words: words, sentence: sentence, comp: { q: q, choices: choices, hint: hint, show: show } };
  }

  Curriculum.addReadingLevel(2, {
    weeks: {
      1: 'long and short vowels in two-syllable words (sunset, sunrise, inside)',
      2: 'vowel teams ai, ay, ee, ea, oa, igh (halfway, between, float)',
      3: 'r-controlled vowels in longer words (orbit, farther, circle)',
      4: 'suffixes -er, -est, -ful, -less, -ly (brighter, careful, quickly)',
      5: 'endings -ed and -ing, doubling and dropping e (hopping, hiding)',
      6: 'vowel sounds oi, oy and ou (moist, enjoy, cloud)',
      7: 'oo, au and aw (brook, food, launch, claw)',
      8: 'soft c, soft g and -le endings (giant, gentle, circle)',
      9: 'prefixes un- and re-, three-letter blends (unload, restart, strong)',
      10: 'two-syllable words ending in -er, -le and -y (lever, handle, pulley)',
      11: 'silent letters kn, wr, mb, and ph that says f (knob, wrap, thumb, photo)',
      12: 'compound words (footbridge, sailboat, notebook)'
    },

    days: {

    /* ===================== UNIT 1 · SPACE ===================== */

    /* week 1 — long and short vowels in two-syllable words */
    d01: R([
        W('sunset', ['sun', 'set'], 'when the sun goes down'),
        W('sunrise', ['sun', 'rise'], 'when the sun comes up'),
        W('rotate', ['ro', 'tate'], 'to spin around')
      ],
      'Earth will rotate all night long, and the sunset slowly turns into a sunrise.',
      'What does Earth do to turn a sunset into a sunrise?',
      [C('It rotates, like a spinning top', 1),
       C('The sun drives across the sky', 'literal-appearance'),
       C('The sun wakes up in the morning', 'animism')],
      'Find the word right after "Earth will".',
      'Earth rotates. The sun stays put — we spin away from it at sunset and toward it at sunrise.'),

    d02: R([
        W('sunshine', ['sun', 'shine'], 'light from the sun'),
        W('distance', ['dis', 'tance'], 'how far away something is'),
        W('inside', ['in', 'side'], 'in the middle of something')
      ],
      'The sun looks big because the distance to it is small, and its sunshine fills the sky.',
      'Why does the sun look so big?',
      [C('The distance to it is small', 1),
       C('Its sunshine is yellow', 'surface-feature'),
       C('It is the biggest star there is', 'literal-appearance')],
      'Look for the word "because". It points at the reason.',
      'The sun is close, so it looks big. Other stars are far away, so they look like dots.'),

    d03: R([
        W('shadow', ['shad', 'ow'], 'the dark shape where light is blocked'),
        W('sideways', ['side', 'ways'], 'toward the side'),
        W('noontime', ['noon', 'time'], 'the middle of the day')
      ],
      'At noontime your shadow is short, but late in the day it stretches out sideways.',
      'When is your shadow the shortest?',
      [C('At noontime', 1),
       C('Late in the day', 'reversed-relation'),
       C('When it stretches sideways', 'surface-feature')],
      'Find the word "short" in the sentence.',
      'At noontime the sun is high, so shadows are short. Late in the day the sun is low and they stretch.'),

    d04: R([
        W('summer', ['sum', 'mer'], 'the warmest season'),
        W('winter', ['win', 'ter'], 'the coldest season'),
        W('sunbeam', ['sun', 'beam'], 'a line of light from the sun')
      ],
      'In summer each sunbeam hits us straight on, but in winter the light comes in at a slant.',
      'Why does a summer sunbeam feel hotter than a winter one?',
      [C('It hits us straight on', 1),
       C('Summer sunbeams are bigger', 'literal-appearance'),
       C('Winter has no sunbeams at all', 'overgeneralize')],
      'Compare the two halves of the sentence.',
      'Straight-on light is packed tight and hot. Slanted light spreads out thin and feels cold.'),

    d05: R([
        W('compass', ['com', 'pass'], 'a tool that shows which way is north'),
        W('westward', ['west', 'ward'], 'toward the west'),
        W('bedtime', ['bed', 'time'], 'the time to go to sleep')
      ],
      'A compass shows that the sun comes up in the east and drifts westward before bedtime.',
      'Which way does the sun seem to drift before bedtime?',
      [C('Westward', 1),
       C('Eastward', 'reversed-relation'),
       C('Toward the compass', 'surface-feature')],
      'Find the word that ends in -ward.',
      'Up in the east, down in the west — because Earth spins toward the east.'),

    /* week 2 — vowel teams */
    d06: R([
        W('halfway', ['half', 'way'], 'in the middle'),
        W('between', ['be', 'tween'], 'in the space that separates two things'),
        W('gleaming', ['gleam', 'ing'], 'shining brightly')
      ],
      'Halfway between new moon and full moon, we see half of the moon gleaming in the sky.',
      'What do we see halfway between a new moon and a full moon?',
      [C('Half of the moon gleaming', 1),
       C('No moon at all', 'part-whole-mixup'),
       C('Two moons', 'guess-plausible')],
      'Read what comes after "we see".',
      'Halfway through the cycle we see half of the moon\'s lit side — a half moon.'),

    d07: R([
        W('always', ['al', 'ways'], 'every single time'),
        W('keeps', ['keep', 's'], 'holds on to'),
        W('remain', ['re', 'main'], 'to stay the same')
      ],
      'The moon always keeps the same face toward us, so its far side will remain hidden.',
      'What stays hidden from us?',
      [C('The far side of the moon', 1),
       C('The face of the moon', 'reversed-relation'),
       C('The whole moon', 'part-whole-mixup')],
      'Find the word "hidden". What comes before it?',
      'One side always faces us. The far side always faces away.'),

    d08: R([
        W('leaf', ['l', 'ea', 'f'], 'a flat green part of a plant'),
        W('speeds', ['speed', 's'], 'makes something go faster'),
        W('reach', ['r', 'ea', 'ch'], 'to get to')
      ],
      'Gravity speeds a rock and a leaf toward the ground, but air slows the leaf before it can reach the dirt.',
      'What slows the leaf down?',
      [C('The air', 1),
       C('Gravity', 'reversed-relation'),
       C('The rock', 'surface-feature')],
      'Find the word "slows". What comes right before it?',
      'Gravity pulls them both the same. Air pushes back on the wide, flat leaf.'),

    d09: R([
        W('coast', ['c', 'oa', 'st'], 'where the land meets the sea'),
        W('beach', ['b', 'ea', 'ch'], 'sand by the water'),
        W('daily', ['d', 'ai', 'ly'], 'every day')
      ],
      'Twice daily the tide slides up the beach and then slips back down the coast.',
      'How often does the tide slide up the beach?',
      [C('Twice a day', 1),
       C('Once a day', 'off-by-one'),
       C('Every minute', 'guess-plausible')],
      'Find the word right before "daily".',
      'Twice daily — two high tides every day, because Earth spins through two water bulges.'),

    d10: R([
        W('leap', ['l', 'ea', 'p'], 'a big jump'),
        W('float', ['fl', 'oa', 't'], 'to drift gently'),
        W('higher', ['h', 'igh', 'er'], 'farther up')
      ],
      'On the moon you can leap six times higher and float back down instead of landing with a thump.',
      'How high can you leap on the moon?',
      [C('Six times higher than on Earth', 1),
       C('The same as on Earth', 'overgeneralize'),
       C('Not at all', 'guess-plausible')],
      'Find the number word in the sentence.',
      'Six times higher, because the moon\'s pull is six times weaker than Earth\'s.'),

    /* week 3 — r-controlled vowels in longer words */
    d11: R([
        W('order', ['or', 'der'], 'one after another, in a line'),
        W('Saturn', ['Sat', 'urn'], 'the sixth planet, with rings'),
        W('farther', ['far', 'ther'], 'more far away')
      ],
      'In order from the sun, Saturn is sixth, so it sits farther out than Earth.',
      'Which is farther from the sun, Saturn or Earth?',
      [C('Saturn', 1),
       C('Earth', 'reversed-relation'),
       C('They are the same distance', 'overgeneralize')],
      'Find the word "farther". Which planet is it talking about?',
      'Saturn is sixth and Earth is third, so Saturn is much farther out.'),

    d12: R([
        W('orbit', ['or', 'bit'], 'the path around something'),
        W('circle', ['cir', 'cle'], 'a perfectly round shape'),
        W('turning', ['turn', 'ing'], 'going around')
      ],
      'Earth\'s orbit is almost a circle, with the planet turning around the sun the whole way.',
      'What shape is Earth\'s orbit close to?',
      [C('A circle', 1),
       C('A square', 'guess-plausible'),
       C('A straight line', 'literal-appearance')],
      'Find the word "almost".',
      'Almost a circle — really a gently squashed one.'),

    d13: R([
        W('shorter', ['short', 'er'], 'less long'),
        W('year', ['y', 'ear'], 'one trip around the sun'),
        W('circling', ['cir', 'cling'], 'going around and around')
      ],
      'Mercury is circling close to the sun, so its path is shorter and its year is only 88 days.',
      'Why is a year on Mercury so short?',
      [C('Its path around the sun is shorter', 1),
       C('Mercury spins very fast', 'overgeneralize'),
       C('Mercury is the smallest planet', 'guess-plausible')],
      'Find the word "so". What comes before it?',
      'A shorter trip around the sun means a shorter year. Spinning sets the day, not the year.'),

    d14: R([
        W('marble', ['mar', 'ble'], 'a small glass ball'),
        W('apart', ['a', 'par', 't'], 'far from each other'),
        W('stars', ['star', 's'], 'the shining dots in the night sky')
      ],
      'If Earth were a marble, the stars and planets would sit so far apart that space is mostly empty.',
      'What is most of space like?',
      [C('Empty', 1),
       C('Crowded with planets', 'reversed-relation'),
       C('Full of marbles', 'literal-appearance')],
      'Read the last three words of the sentence.',
      'Mostly empty — the planets are tiny and the gaps between them are huge.'),

    d15: R([
        W('Mars', ['M', 'ar', 's'], 'the red planet'),
        W('dirt', ['d', 'ir', 't'], 'loose soil'),
        W('colder', ['cold', 'er'], 'more cold')
      ],
      'The dirt on Mars is red with rust, and the planet is much colder than Earth.',
      'Why is the dirt on Mars red?',
      [C('It has rust in it', 1),
       C('Mars is very hot', 'reversed-relation'),
       C('Because it is colder', 'surface-feature')],
      'Find the word "with".',
      'Rusted iron makes it red — and Mars is freezing, not hot.'),

    /* week 4 — suffixes */
    d16: R([
        W('powerful', ['pow', 'er', 'ful'], 'very strong'),
        W('quickly', ['quick', 'ly'], 'fast'),
        W('strongest', ['strong', 'est'], 'more strong than all the others')
      ],
      'A powerful rocket pushes hot gas down so hard that it quickly shoots up into the sky.',
      'Which way does a rocket push its hot gas?',
      [C('Down', 1),
       C('Up', 'reversed-relation'),
       C('Sideways', 'guess-plausible')],
      'Find the word "pushes".',
      'It pushes gas down, and the gas pushes the rocket up. Every push comes in a pair.'),

    d17: R([
        W('lighter', ['light', 'er'], 'weighing less'),
        W('faster', ['fast', 'er'], 'more quickly'),
        W('useful', ['use', 'ful'], 'helpful')
      ],
      'As the fuel burns, the rocket gets lighter, and a lighter rocket can go faster.',
      'Why can the rocket go faster as it flies?',
      [C('It gets lighter', 1),
       C('The engine gets stronger', 'guess-plausible'),
       C('There is no gravity up high', 'overgeneralize')],
      'Read the second half of the sentence.',
      'The same push on less weight makes more speed.'),

    d18: R([
        W('brighter', ['bright', 'er'], 'giving more light'),
        W('faintest', ['faint', 'est'], 'the hardest to see'),
        W('helpful', ['help', 'ful'], 'giving help')
      ],
      'A wide telescope is helpful because it catches more light, so even the faintest stars look brighter.',
      'Why does a wide telescope help you see faint stars?',
      [C('It catches more light', 1),
       C('It moves the stars closer', 'literal-appearance'),
       C('It makes the stars bigger', 'guess-plausible')],
      'Find the word "because".',
      'Wider means more light caught — that is what makes faint stars show up.'),

    d19: R([
        W('quickest', ['quick', 'est'], 'faster than all the others'),
        W('sunlight', ['sun', 'light'], 'light from the sun'),
        W('eight', ['eigh', 't'], 'the number 8')
      ],
      'Light is the quickest thing there is, but sunlight still takes about eight minutes to reach Earth.',
      'How long does sunlight take to reach Earth?',
      [C('About eight minutes', 1),
       C('No time at all', 'overgeneralize'),
       C('About eight hours', 'unit-mixup')],
      'Find the number word.',
      'Eight minutes. Light is fast, but space is enormous.'),

    d20: R([
        W('weightless', ['weight', 'less'], 'not feeling any weight'),
        W('careful', ['care', 'ful'], 'paying close attention'),
        W('safely', ['safe', 'ly'], 'without getting hurt')
      ],
      'Astronauts feel weightless, so they move with careful hands and sleep safely strapped in.',
      'Why do astronauts sleep strapped in?',
      [C('So they do not float around', 1),
       C('Because the beds are too small', 'guess-plausible'),
       C('Because they are careful', 'surface-feature')],
      'What would a weightless astronaut do without straps?',
      'Weightless means floating. Straps keep them from drifting into the walls.'),

    /* ================== UNIT 2 · WOODS & WATER ================== */

    /* week 5 — -ed and -ing, doubling and dropping e */
    d21: R([
        W('hiding', ['hid', 'ing'], 'staying out of sight'),
        W('crawling', ['crawl', 'ing'], 'moving slowly on legs'),
        W('soaked', ['soak', 'ed'], 'very wet')
      ],
      'A salamander was hiding under a soaked log, crawling slowly through the wet leaves.',
      'Where was the salamander hiding?',
      [C('Under a soaked log', 1),
       C('In the sunny grass', 'reversed-relation'),
       C('On top of the log', 'guess-plausible')],
      'Find the word "under".',
      'Under a wet log — damp, shady places are where salamanders live.'),

    d22: R([
        W('hatched', ['hatch', 'ed'], 'came out of an egg'),
        W('swimming', ['swim', 'ming'], 'moving through water'),
        W('changed', ['change', 'd'], 'became different')
      ],
      'The larva hatched in the pond, went swimming with its gills, and later changed into a salamander.',
      'What happened FIRST?',
      [C('The larva hatched', 1),
       C('It changed into a salamander', 'sequence-error'),
       C('It went swimming', 'sequence-error')],
      'The first thing in the sentence happened first.',
      'Hatch, then swim, then change. Order matters in a life cycle.'),

    d23: R([
        W('dipped', ['dip', 'ped'], 'put into water for a moment'),
        W('drying', ['dry', 'ing'], 'losing its water'),
        W('resting', ['rest', 'ing'], 'staying still')
      ],
      'We dipped our hands in the creek before we held the salamander, so its skin would not start drying out.',
      'Why did we dip our hands in the creek?',
      [C('So the salamander\'s skin would not dry out', 1),
       C('To wash the salamander', 'guess-plausible'),
       C('To catch a fish', 'surface-feature')],
      'Find the word "so".',
      'Wet hands protect the damp skin a salamander breathes through.'),

    d24: R([
        W('rolled', ['roll', 'ed'], 'turned over'),
        W('digging', ['dig', 'ging'], 'making a hole'),
        W('living', ['liv', 'ing'], 'being alive')
      ],
      'We rolled the log over and found beetles digging and worms living in the damp dirt.',
      'What did WE do to find the beetles?',
      [C('Rolled the log over', 1),
       C('Dug a hole', 'surface-feature'),
       C('Climbed a tree', 'guess-plausible')],
      'Find what we did — it is the first thing in the sentence.',
      'We rolled the log. The beetles were the ones digging.'),

    d25: R([
        W('hopping', ['hop', 'ping'], 'jumping along'),
        W('jumped', ['jump', 'ed'], 'pushed off the ground'),
        W('creeping', ['creep', 'ing'], 'moving slowly and quietly')
      ],
      'The frog went hopping away and jumped into the pond, while the salamander kept creeping under the leaves.',
      'Which animal went hopping?',
      [C('The frog', 1),
       C('The salamander', 'reversed-relation'),
       C('Both of them', 'overgeneralize')],
      'Find the word "hopping" and see who is doing it.',
      'The frog hopped and the salamander crept. Long back legs make the difference.'),

    /* week 6 — oi, oy, ou */
    d26: R([
        W('cloud', ['cl', 'ou', 'd'], 'a floating mass of tiny water drops'),
        W('moist', ['m', 'oi', 'st'], 'a little wet'),
        W('around', ['a', 'round'], 'in a circle')
      ],
      'Water rises into a cloud, falls as moist rain, and goes around and around forever.',
      'What happens to water after it rises into a cloud?',
      [C('It falls as rain', 1),
       C('It disappears forever', 'literal-appearance'),
       C('It stays in the cloud', 'guess-plausible')],
      'Read what comes right after "cloud".',
      'It falls as rain — and the same water goes around again and again.'),

    d27: R([
        W('downhill', ['down', 'hill'], 'toward the bottom of a hill'),
        W('flowing', ['flow', 'ing'], 'moving like water'),
        W('ground', ['gr', 'ou', 'nd'], 'the land under your feet')
      ],
      'The creek keeps flowing downhill, finding the lowest path across the ground.',
      'Which way does the creek flow?',
      [C('Downhill', 1),
       C('Uphill', 'reversed-relation'),
       C('In a circle', 'guess-plausible')],
      'Split "downhill" into two words.',
      'Down + hill. Water always takes the lowest path.'),

    d28: R([
        W('pounding', ['pound', 'ing'], 'hitting hard again and again'),
        W('rounded', ['round', 'ed'], 'made round'),
        W('point', ['p', 'oi', 'nt'], 'a sharp tip')
      ],
      'Pounding water wears every sharp point off a rock until it is smooth and rounded.',
      'What makes creek rocks smooth and rounded?',
      [C('Pounding water wears them down', 1),
       C('They grew that way', 'animism'),
       C('Someone sanded them', 'guess-plausible')],
      'Find the first two words of the sentence.',
      'Water and sand pound the corners off, a little at a time, for years.'),

    d29: R([
        W('outside', ['out', 'side'], 'not in a building'),
        W('enjoy', ['en', 'joy'], 'to like doing something'),
        W('boiling', ['boil', 'ing'], 'so hot it bubbles')
      ],
      'When it is freezing outside, ice floats on top of the pond and kids enjoy skating on it — but nobody skates on boiling water!',
      'Why can kids skate on a frozen pond?',
      [C('Ice floats on top of the water', 1),
       C('The pond is boiling', 'reversed-relation'),
       C('The pond is empty', 'guess-plausible')],
      'Find the word "floats".',
      'Ice floats, so it makes a solid lid on top and the water underneath stays liquid.'),

    d30: R([
        W('counting', ['count', 'ing'], 'finding out how many'),
        W('pounds', ['pound', 's'], 'a way to measure weight'),
        W('about', ['a', 'bout'], 'close to, not exactly')
      ],
      'We measured the creek by counting gallons, and each gallon of water weighs about eight pounds.',
      'How much does one gallon of water weigh?',
      [C('About eight pounds', 1),
       C('About one pound', 'guess-plausible'),
       C('Eight gallons', 'unit-mixup')],
      'Find the word "pounds".',
      'About eight pounds — that is why a full bucket is so heavy.'),

    /* week 7 — oo, au, aw */
    d31: R([
        W('pool', ['p', 'oo', 'l'], 'a deep, still part of a creek'),
        W('cool', ['c', 'oo', 'l'], 'a little cold'),
        W('brook', ['br', 'oo', 'k'], 'a small creek')
      ],
      'A trout rests in the cool pool of the brook, pulling oxygen out of the water with its gills.',
      'Why does the trout pick the cool pool?',
      [C('Cool water holds more oxygen', 1),
       C('The pool is quiet', 'guess-plausible'),
       C('Fish only live in pools', 'overgeneralize')],
      'Think back to today\'s science: what does cool water hold more of?',
      'Cool water holds more oxygen, and gills need oxygen.'),

    d32: R([
        W('hook', ['h', 'oo', 'k'], 'a bent piece of metal for fishing'),
        W('launched', ['launch', 'ed'], 'sent flying'),
        W('shook', ['sh', 'oo', 'k'], 'moved back and forth fast')
      ],
      'I launched my hook past the weeds, and when a fish bit, the bobber shook and went under.',
      'How did I know a fish bit?',
      [C('The bobber shook and went under', 1),
       C('The hook floated', 'reversed-relation'),
       C('The weeds moved', 'surface-feature')],
      'Read what happened "when a fish bit".',
      'The bobber is the signal — it shakes and dives when a fish pulls.'),

    d33: R([
        W('food', ['f', 'oo', 'd'], 'what living things eat'),
        W('jaws', ['j', 'aw', 's'], 'the bones that hold the teeth'),
        W('because', ['be', 'cause'], 'for the reason that')
      ],
      'Big fish catch small fish in their jaws because every living thing in the creek needs food.',
      'Why do big fish catch small fish?',
      [C('They need food', 1),
       C('They do not like small fish', 'animism'),
       C('To play a game', 'guess-plausible')],
      'Find the word "because".',
      'Every animal needs food — that is what links a food chain together.'),

    d34: R([
        W('thaw', ['th', 'aw'], 'to melt'),
        W('scoot', ['sc', 'oo', 't'], 'to move quickly'),
        W('paused', ['pause', 'd'], 'stopped for a while')
      ],
      'In cold water the fish paused near the bottom, but after the spring thaw they began to scoot around again.',
      'When did the fish start to scoot around again?',
      [C('After the spring thaw', 1),
       C('In the coldest water', 'reversed-relation'),
       C('When they paused', 'sequence-error')],
      'Find the word "after".',
      'Warmer water after the thaw speeds them back up — fish are cold-blooded.'),

    d35: R([
        W('draw', ['dr', 'aw'], 'to pull back'),
        W('loop', ['l', 'oo', 'p'], 'a curve that bends back around'),
        W('swoop', ['sw', 'oo', 'p'], 'to fly down in a curve')
      ],
      'Draw the rod back, let the line make a loop, and watch the lure swoop out over the water.',
      'What does the lure do at the end?',
      [C('It swoops out over the water', 1),
       C('It stays in the boat', 'reversed-relation'),
       C('It makes a loop', 'surface-feature')],
      'Read the last part of the sentence.',
      'The rod throws the line, and the lure swoops out in an arc.'),

    /* week 8 — soft c, soft g, -le */
    d36: R([
        W('giant', ['gi', 'ant'], 'very, very big'),
        W('cells', ['c', 'ell', 's'], 'the tiny parts living things are made of'),
        W('little', ['lit', 'tle'], 'small')
      ],
      'A giant oak drinks through tubes made of little cells that carry water all the way to the top.',
      'How does water get to the top of a giant tree?',
      [C('Through tubes made of little cells', 1),
       C('A pump pushes it up', 'guess-plausible'),
       C('The tree wants it there', 'animism')],
      'Find the word "through".',
      'Tiny tubes of cells carry it up, pulled by water escaping from the leaves.'),

    d37: R([
        W('gentle', ['gen', 'tle'], 'soft and calm'),
        W('center', ['cen', 'ter'], 'the middle'),
        W('simple', ['sim', 'ple'], 'easy, not fancy')
      ],
      'In the center of a leaf, gentle sunlight helps it make sugar out of simple air and water.',
      'What does a leaf make its sugar out of?',
      [C('Air and water, using sunlight', 1),
       C('Dirt from the ground', 'guess-plausible'),
       C('Other leaves', 'overgeneralize')],
      'Find the words "out of".',
      'Air, water and sunlight — a tree is built mostly out of air.'),

    d38: R([
        W('orange', ['or', 'ange'], 'the color of a pumpkin'),
        W('purple', ['pur', 'ple'], 'the color of a grape'),
        W('change', ['ch', 'ange'], 'to become different')
      ],
      'In fall, leaves change color: the green fades away and hidden orange and purple colors show through.',
      'Where do the orange and purple colors come from?',
      [C('They were hidden in the leaf all along', 1),
       C('The cold paints them on', 'literal-appearance'),
       C('The tree makes brand new colors', 'guess-plausible')],
      'Find the word "hidden".',
      'They were there all summer, covered up by the green.'),

    d39: R([
        W('nibble', ['nib', 'ble'], 'to take small bites'),
        W('edge', ['e', 'dge'], 'the outside line of something'),
        W('crumble', ['crum', 'ble'], 'to fall apart in little pieces')
      ],
      'Bugs nibble at the edge of a dead log until it starts to crumble into soil.',
      'What happens to the log as bugs nibble it?',
      [C('It crumbles into soil', 1),
       C('It grows bigger', 'reversed-relation'),
       C('It turns back into a tree', 'guess-plausible')],
      'Find the word "until".',
      'Nibbling breaks it into crumbs, and the crumbs become new soil.'),

    d40: R([
        W('wiggle', ['wig', 'gle'], 'to twist back and forth'),
        W('gently', ['gent', 'ly'], 'in a soft way'),
        W('space', ['sp', 'ace'], 'an open area')
      ],
      'Worms wiggle through the dirt and gently make space for air and water to reach the roots.',
      'How do worms help plant roots?',
      [C('They make space for air and water', 1),
       C('They eat the roots', 'reversed-relation'),
       C('They wiggle for fun', 'animism')],
      'Find the words "make space for".',
      'Worm tunnels let air and water reach the roots.'),

    /* ================ UNIT 3 · FORCES & MACHINES ================ */

    /* week 9 — un-, re-, three-letter blends */
    d41: R([
        W('stronger', ['strong', 'er'], 'having more power'),
        W('unmoved', ['un', 'moved'], 'not moved at all'),
        W('straight', ['str', 'aigh', 't'], 'not bent or curved')
      ],
      'When two pulls are equal the wagon stays unmoved, but a stronger pull wins and moves it straight ahead.',
      'What happens when one pull is stronger?',
      [C('The wagon moves toward the stronger pull', 1),
       C('Nothing happens', 'overgeneralize'),
       C('The wagon moves toward the weaker pull', 'reversed-relation')],
      'Find the word "stronger".',
      'Unequal pulls don\'t cancel out — the stronger one wins.'),

    d42: R([
        W('scrape', ['scr', 'ape'], 'to rub roughly'),
        W('unstuck', ['un', 'stuck'], 'free again'),
        W('scratch', ['scr', 'a', 'tch'], 'to rub a line into something')
      ],
      'Rough ground will scrape and scratch a sled to a stop, and you have to push to get it unstuck.',
      'What stops the sled on rough ground?',
      [C('Rubbing against the rough ground', 1),
       C('Going downhill', 'reversed-relation'),
       C('Pushing it', 'sequence-error')],
      'What do "scrape" and "scratch" have in common?',
      'Rubbing is friction. Rough ground grabs the sled and slows it.'),

    d43: R([
        W('unload', ['un', 'load'], 'to take things off'),
        W('reload', ['re', 'load'], 'to put things back on'),
        W('strain', ['str', 'ai', 'n'], 'too much hard work')
      ],
      'A ramp makes it easy to unload a heavy box and reload it later without a strain on your back.',
      'What does the ramp make easier?',
      [C('Moving a heavy box up and down', 1),
       C('Making the box lighter', 'literal-appearance'),
       C('Breaking the box', 'guess-plausible')],
      'Find "unload" and "reload".',
      'The ramp trades a hard lift for an easy long push. The box weighs the same.'),

    d44: R([
        W('restart', ['re', 'start'], 'to start again'),
        W('strap', ['str', 'a', 'p'], 'a band that holds things'),
        W('screech', ['scr', 'ee', 'ch'], 'a loud, high sound')
      ],
      'When the car stopped with a screech, the strap held him in his seat, and then the car could restart.',
      'What held him in his seat?',
      [C('The strap', 1),
       C('The screech', 'surface-feature'),
       C('The car restarting', 'sequence-error')],
      'Find what "held him".',
      'His body kept moving when the car stopped — the strap caught him.'),

    d45: R([
        W('unsafe', ['un', 'safe'], 'not safe'),
        W('spread', ['spr', 'ea', 'd'], 'to open out wide'),
        W('restack', ['re', 'stack'], 'to pile up again')
      ],
      'A tall skinny tower is unsafe, so spread the blocks out wide and restack them on a bigger base.',
      'How do you make the tower safer?',
      [C('Spread the blocks out on a wide base', 1),
       C('Make it taller', 'reversed-relation'),
       C('Use fewer blocks', 'guess-plausible')],
      'Find the word "so".',
      'A wide, low base keeps the tower\'s weight over it, so it does not tip.'),

    /* week 10 — two-syllable words ending in -er, -le, -y */
    d46: R([
        W('lever', ['lev', 'er'], 'a bar that lifts things'),
        W('handle', ['han', 'dle'], 'the part you hold'),
        W('boulder', ['boul', 'der'], 'a very big rock')
      ],
      'Push down on the handle of a long lever, and you can lift a boulder much bigger than you.',
      'What can a long lever help you lift?',
      [C('A boulder bigger than you', 1),
       C('Only very small things', 'reversed-relation'),
       C('The handle', 'surface-feature')],
      'Read to the end of the sentence.',
      'A lever multiplies your push — a little force lifts a big load.'),

    d47: R([
        W('bigger', ['bigg', 'er'], 'larger'),
        W('smaller', ['small', 'er'], 'less big'),
        W('slower', ['slow', 'er'], 'less fast')
      ],
      'A small gear turns a bigger gear, and the bigger gear spins slower but pushes harder than the smaller one.',
      'Which gear spins slower?',
      [C('The bigger gear', 1),
       C('The smaller gear', 'reversed-relation'),
       C('They spin at the same speed', 'overgeneralize')],
      'Find the word "slower".',
      'Bigger gear: slower and stronger. Smaller gear: faster.'),

    d48: R([
        W('pulley', ['pul', 'ley'], 'a wheel with a rope'),
        W('bucket', ['buck', 'et'], 'a pail for carrying things'),
        W('water', ['wa', 'ter'], 'what fills a creek')
      ],
      'Pull down on the rope, and the pulley lifts the bucket of water up out of the well.',
      'Which way do you pull the rope?',
      [C('Down', 1),
       C('Up', 'reversed-relation'),
       C('Sideways', 'guess-plausible')],
      'Find the word right after "Pull".',
      'Pull down and the bucket goes up — the pulley flips the direction.'),

    d49: R([
        W('metal', ['met', 'al'], 'hard, shiny material like iron'),
        W('tighter', ['tight', 'er'], 'held more firmly'),
        W('sharper', ['sharp', 'er'], 'better at cutting')
      ],
      'Turn a metal screw and it goes in tighter, and a sharper wedge splits a log with less push.',
      'What helps a wedge split a log with less push?',
      [C('Being sharper', 1),
       C('Being heavier', 'guess-plausible'),
       C('Turning it', 'surface-feature')],
      'Find the word "sharper".',
      'A sharper wedge is a longer, thinner ramp: less force, more distance.'),

    d50: R([
        W('pedal', ['ped', 'al'], 'the part your foot pushes'),
        W('bicycle', ['bi', 'cy', 'cle'], 'a bike'),
        W('puddle', ['pud', 'dle'], 'a little pool of rainwater')
      ],
      'Push each pedal of your bicycle hard, and you can zoom right over a puddle.',
      'What makes the bicycle go?',
      [C('Pushing the pedals', 1),
       C('The puddle', 'surface-feature'),
       C('Riding downhill', 'guess-plausible')],
      'Find the first word of the sentence.',
      'The pedals are levers that turn the gears and the wheels.'),

    /* week 11 — silent letters */
    d51: R([
        W('knob', ['kn', 'o', 'b'], 'a round handle'),
        W('thumb', ['th', 'u', 'mb'], 'the short, thick finger'),
        W('magnet', ['mag', 'net'], 'metal that pulls on iron')
      ],
      'Hold the magnet by its knob with your thumb, and it will grab the paperclip without touching it.',
      'How does the magnet pick up the paperclip?',
      [C('It pulls without touching', 1),
       C('You push it with your thumb', 'surface-feature'),
       C('The knob grabs it', 'literal-appearance')],
      'Find the words "without touching".',
      'A magnet\'s pull reaches right through the air.'),

    d52: R([
        W('wrap', ['wr', 'a', 'p'], 'to wind around'),
        W('know', ['kn', 'ow'], 'to be sure about something'),
        W('wire', ['w', 'ire'], 'a thin metal thread')
      ],
      'Wrap the wire into a full loop, and you will know it works when the bulb lights up.',
      'How do you know the loop is finished?',
      [C('The bulb lights up', 1),
       C('The wire gets longer', 'guess-plausible'),
       C('You wrap it twice', 'surface-feature')],
      'Find the word "when".',
      'Electricity only flows around a complete loop. The light proves it.'),

    d53: R([
        W('photo', ['pho', 'to'], 'a picture from a camera'),
        W('kneel', ['kn', 'ee', 'l'], 'to rest on your knees'),
        W('wrong', ['wr', 'o', 'ng'], 'not right')
      ],
      'Kneel down behind a wall and you cannot snap a photo of the yard, because light will not bend around corners.',
      'Why can\'t you snap a photo of the yard from behind the wall?',
      [C('Light does not bend around corners', 1),
       C('It is too dark behind the wall', 'guess-plausible'),
       C('Your knees are in the way', 'surface-feature')],
      'Find the word "because".',
      'Light travels straight. To see around a corner you need a mirror.'),

    d54: R([
        W('knock', ['kn', 'o', 'ck'], 'to hit and make a sound'),
        W('whistle', ['whis', 'tle'], 'a high sound you can blow'),
        W('listen', ['lis', 'ten'], 'to pay attention to sound')
      ],
      'Listen closely: a knock on the door and a whistle both come from something shaking the air.',
      'What makes the sound of a knock and a whistle?',
      [C('Something shaking the air', 1),
       C('The door is loud', 'literal-appearance'),
       C('Listening closely', 'surface-feature')],
      'Find the words "come from".',
      'All sound is a shake — a vibration traveling through the air.'),

    d55: R([
        W('rainbow', ['rain', 'b', 'ow'], 'an arc of colors in the sky'),
        W('prism', ['pr', 'is', 'm'], 'clear glass that splits light'),
        W('knew', ['kn', 'ew'], 'was sure about')
      ],
      'He knew the white light held every color when the prism made a rainbow on the wall.',
      'What did the prism make on the wall?',
      [C('A rainbow', 1),
       C('White light', 'part-whole-mixup'),
       C('Another prism', 'surface-feature')],
      'Find the word "made".',
      'The prism split white light into all its colors — a rainbow.'),

    /* week 12 — compound words */
    d56: R([
        W('footbridge', ['foot', 'bridge'], 'a bridge for walking'),
        W('triangle', ['tri', 'an', 'gle'], 'a shape with three sides'),
        W('railroad', ['rail', 'road'], 'a track for trains')
      ],
      'A footbridge and a railroad bridge both use a triangle shape, because a triangle cannot be squashed.',
      'Why do bridges use triangles?',
      [C('A triangle cannot be squashed', 1),
       C('Triangles look nice', 'surface-feature'),
       C('Triangles are lighter', 'guess-plausible')],
      'Find the word "because".',
      'Push a square and it folds over. A triangle holds its shape.'),

    d57: R([
        W('sailboat', ['sail', 'boat'], 'a boat pushed by wind'),
        W('driftwood', ['drift', 'wood'], 'wood floating in water'),
        W('waterproof', ['wa', 'ter', 'proof'], 'keeps water out')
      ],
      'A sailboat and a piece of driftwood both float because they push aside enough water to hold them up.',
      'Why does a sailboat float?',
      [C('It pushes aside enough water', 1),
       C('Because it is small', 'overgeneralize'),
       C('Because it is made of wood', 'guess-plausible')],
      'Find the word "because".',
      'Push aside enough water and the water pushes you back up.'),

    d58: R([
        W('slingshot', ['sling', 'shot'], 'a Y-shaped thrower with a rubber band'),
        W('backyard', ['back', 'yard'], 'the yard behind a house'),
        W('rubber', ['rub', 'ber'], 'stretchy material')
      ],
      'Pull the rubber band back on a slingshot, and the stored energy sends a marshmallow across the backyard.',
      'Where does the energy come from?',
      [C('Pulling the rubber band back', 1),
       C('The marshmallow', 'animism'),
       C('The backyard', 'surface-feature')],
      'Find the first thing you do.',
      'Stretching the band stores energy; letting go turns it into motion.'),

    d59: R([
        W('notebook', ['note', 'book'], 'a book you write in'),
        W('workbench', ['work', 'bench'], 'a table for building'),
        W('something', ['some', 'thing'], 'a thing you are not naming')
      ],
      'When something breaks, an engineer writes it in a notebook and goes back to the workbench to fix it.',
      'What does an engineer do when something breaks?',
      [C('Writes it down and goes back to fix it', 1),
       C('Gives up', 'reversed-relation'),
       C('Throws it away', 'guess-plausible')],
      'Find the word "when".',
      'A broken design is data: write it down, change one thing, test again.'),

    d60: R([
        W('waterfall', ['wa', 'ter', 'fall'], 'water dropping over a ledge'),
        W('flashlight', ['flash', 'light'], 'a light you carry'),
        W('everything', ['every', 'thing'], 'all of it')
      ],
      'Before sunrise he took a flashlight to the waterfall and used everything he had learned to measure the flow.',
      'Why did he need a flashlight?',
      [C('It was still dark before sunrise', 1),
       C('The waterfall was loud', 'surface-feature'),
       C('To see the fish', 'guess-plausible')],
      'What is the sky like before sunrise?',
      'Before sunrise means dark. Real scientists start early.')

    }
  });
})();
