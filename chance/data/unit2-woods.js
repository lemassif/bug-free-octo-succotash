/* ============================================================
   UNIT 2 — WOODS & WATER (days 21-40)
   Everything in this unit is something he can walk outside and
   check: salamanders under logs, the creek running downhill, a
   bobber floating, leaves turning. The science is real field
   biology and physics; the math measures the same creek.
   Most days end with a "go look" so the iPad sends him outside
   instead of keeping him on it.
   ============================================================ */
(function () {
  var C = Curriculum.C, W = Curriculum.W;

  Curriculum.addDays(2, [

  /* ---------------- WEEK 5 · Salamanders and Frogs ---------------- */
  {
    icon: '🦎', title: 'What Makes a Salamander an Amphibian',
    discover: {
      intro: [
        'A salamander is an amphibian: it starts life in water and later can live on land.',
        'Its skin is thin and damp, with no scales and no fur, and it drinks and breathes right through that skin.',
        'It is cold-blooded, so its body is as warm or as cold as the place it is sitting.'
      ],
      word: { w: 'amphibian', say: 'am-FIB-ee-un', mean: 'an animal that lives in water first, then on land' },
      check: {
        q: 'You find a small animal with wet smooth skin, four legs, and no scales, under a log by the creek. What is it most likely?',
        choices: [
          C('An amphibian, like a salamander', 1),
          C('A lizard, because it has four legs', 'surface-feature'),
          C('A fish that crawled out', 'guess-plausible')
        ],
        hint: 'Lizards are dry and covered in scales. Feel the difference in your mind.',
        show: 'Smooth, wet, scaleless skin is the amphibian clue. Lizards are reptiles: dry, scaly, and they stay out in the sun.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'Chance finds 3 logs. Under each log there are 4 salamanders.',
          q: 'How many salamanders did he find?',
          choices: [C('12 salamanders', 1), C('7 salamanders', 'additive-for-multiplicative'), C('4 salamanders', 'surface-feature')],
          hint: '3 groups, 4 in each group.',
          show: '4 × 3 = 12. Always roll the log back exactly how you found it — that is somebody\'s roof.'
        },
        {
          story: 'A spotted salamander is 6 inches long. A tiny red-backed salamander is 2 inches long.',
          q: 'How many times longer is the spotted one?',
          multiStep: 1,
          choices: [C('3 times longer', 1), C('4 times longer', 'additive-for-multiplicative'), C('8 times longer', 'additive-for-multiplicative')],
          hint: 'How many 2-inch salamanders would you line up to match 6 inches?',
          show: '6 ÷ 2 = 3 times longer. "How many times" is division; "how much longer" would be 6 − 2 = 4 inches.'
        },
        {
          story: 'Salamanders have 4 legs. Chance counts 5 salamanders.',
          q: 'How many legs in all?',
          choices: [C('20 legs', 1), C('9 legs', 'additive-for-multiplicative'), C('16 legs', 'off-by-one')],
          hint: '4 legs each, 5 animals.',
          show: '4 × 5 = 20 legs.'
        }
      ]
    },
    reading: {
      words: [
        W('shed', ['sh', 'e', 'd'], ['sh', 'eh', 'd'], 'to drop off an old covering'),
        W('damp', ['d', 'a', 'mp'], ['d', 'a', 'mp'], 'a little bit wet'),
        W('thin', ['th', 'in'], ['th', 'in'], 'not thick')
      ],
      sentence: 'A salamander has thin damp skin, and it can shed the old skin as it grows.',
      comp: {
        q: 'Why does a salamander shed its skin?',
        choices: [C('Because it is growing', 1), C('Because the skin is damp', 'surface-feature'), C('To scare away birds', 'guess-plausible')],
        hint: 'Find the last three words of the sentence.',
        show: '"As it grows" is the reason. A bigger body needs a bigger skin.'
      }
    }
  },

  {
    icon: '🥚', title: 'From Egg to Salamander',
    discover: {
      intro: [
        'In early spring, salamanders lay clumps of jelly-covered eggs in still water.',
        'A larva hatches out with feathery gills on the outside of its neck, and it swims like a tiny fish.',
        'Over weeks it grows legs, loses the outside gills, and walks out onto the land. That change is called metamorphosis.'
      ],
      word: { w: 'larva', say: 'LAR-vuh', mean: 'the young water stage of an amphibian or insect' },
      check: {
        q: 'A salamander larva has feathery gills on the outside. What does that tell you about where it lives?',
        choices: [
          C('In the water — gills only work underwater', 1),
          C('On land, gills keep it cool', 'surface-feature'),
          C('Both, gills work anywhere', 'overgeneralize')
        ],
        hint: 'What do fish use to breathe? Where do fish live?',
        show: 'Gills pull oxygen out of water. Out in the air they collapse and dry, so gills mean water living.'
      }
    },
    numbers: {
      domain: 'time',
      problems: [
        {
          story: 'Salamander eggs hatch about 4 weeks after they are laid.',
          q: 'How many days is that?',
          multiStep: 1,
          choices: [C('28 days', 1), C('11 days', 'additive-for-multiplicative'), C('4 days', 'unit-mixup')],
          hint: '7 days in a week, 4 weeks.',
          show: '7 × 4 = 28 days. Watch your units — weeks and days are not the same size.'
        },
        {
          story: 'Eggs are laid on March 1. They hatch 28 days later.',
          q: 'What month do they hatch in?',
          choices: [C('March, near the end', 1), C('April', 'off-by-one'), C('February', 'reversed-relation')],
          hint: 'March has 31 days. Is 28 more or less than 31?',
          show: '28 days is still inside March, since March has 31 days. Barely made it.'
        },
        {
          story: 'One egg mass has 5 rows with 10 eggs in each row.',
          q: 'How many eggs?',
          choices: [C('50 eggs', 1), C('15 eggs', 'additive-for-multiplicative'), C('5 eggs', 'surface-feature')],
          hint: '5 rows of 10.',
          show: '10 × 5 = 50 eggs. Most will not survive — that is why she lays so many.'
        }
      ]
    },
    reading: {
      words: [
        W('hatch', ['h', 'a', 'tch'], ['h', 'a', 'ch'], 'to break out of an egg'),
        W('chin', ['ch', 'in'], ['ch', 'in'], 'the part below your mouth'),
        W('shell', ['sh', 'e', 'll'], ['sh', 'eh', 'l'], 'a hard outer cover')
      ],
      sentence: 'The eggs hatch in the pond, and each shell splits as the larva swims out.',
      comp: {
        q: 'What happens FIRST?',
        choices: [C('The shell splits', 1), C('The larva swims out', 'sequence-error'), C('The larva grows legs', 'sequence-error')],
        hint: 'The larva cannot swim out until something happens to the shell.',
        show: 'Shell splits, then it swims out, then weeks later it grows legs. Order matters in science.'
      }
    }
  },

  {
    icon: '💦', title: 'Why Salamanders Stay Damp',
    discover: {
      intro: [
        'A salamander breathes through its skin, and skin can only pass oxygen when it is wet.',
        'That is why you find them under logs, in leaf litter and beside the creek — the damp shady places.',
        'A dry salamander is a suffocating salamander, which is why you wet your hands before you ever hold one.'
      ],
      word: { w: 'oxygen', say: 'OX-ih-jen', mean: 'the gas in air and water that animals need to live' },
      check: {
        q: 'Why should Chance wet his hands before picking up a salamander?',
        choices: [
          C('Dry hands pull the moisture it breathes through off its skin', 1),
          C('Wet hands are easier to grip with', 'surface-feature'),
          C('So it does not bite', 'guess-plausible')
        ],
        hint: 'Its skin is its lungs. What would dry hands do to its lungs?',
        show: 'Wet hands protect the moist layer it breathes through. Dry hands, sunscreen and bug spray all hurt it.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'Chance checks 10 spots. He finds salamanders in 7 damp spots and 0 in the 3 dry sunny spots.',
          q: 'What is the best conclusion?',
          choices: [
            C('Salamanders prefer damp spots', 1),
            C('There were no salamanders anywhere that day', 'ignored-condition'),
            C('Damp spots have more logs', 'surface-feature')
          ],
          hint: 'Compare the two kinds of spots. Where were they and where were they not?',
          show: '7 out of 7 finds were in damp spots. Comparing the two groups is what makes it an experiment.'
        },
        {
          story: 'It rained 3 inches this week. Last week it rained 1 inch.',
          q: 'How much more rain this week?',
          choices: [C('2 inches more', 1), C('4 inches more', 'additive-for-multiplicative'), C('3 inches more', 'surface-feature')],
          hint: 'The gap between 3 and 1.',
          show: '3 − 1 = 2 inches more. Wet weeks are good salamander hunting weeks.'
        },
        {
          story: 'Chance walks the creek looking under logs. He checks 6 logs each trip and takes 4 trips.',
          q: 'How many logs did he check?',
          choices: [C('24 logs', 1), C('10 logs', 'additive-for-multiplicative'), C('12 logs', 'guess-plausible')],
          hint: '6 logs each trip, 4 trips. Groups of 6.',
          show: '6 × 4 = 24 logs checked.'
        }
      ]
    },
    reading: {
      words: [
        W('moth', ['m', 'o', 'th'], ['mmm', 'o', 'th'], 'a night-flying insect'),
        W('chip', ['ch', 'i', 'p'], ['ch', 'i', 'p'], 'a small broken piece'),
        W('shade', ['sh', 'ade'], ['sh', 'ayd'], 'a spot out of the sun')
      ],
      sentence: 'In the cool shade under the log, a moth and a wood chip lay in the damp dirt.',
      comp: {
        q: 'Why would a salamander like this spot?',
        choices: [C('It is cool and damp', 1), C('There is a moth to look at', 'surface-feature'), C('It is out in the sun', 'reversed-relation')],
        hint: 'What two words describe the spot under the log?',
        show: 'Cool and damp is exactly what skin-breathing needs. (Although a moth makes a fine snack.)'
      }
    }
  },

  {
    icon: '🪵', title: 'Under the Log Is Its Own Little World',
    discover: {
      intro: [
        'A rotting log is a whole neighborhood: beetles, worms, centipedes, fungus and salamanders all live there.',
        'The log holds water like a sponge, so it stays damp even when the ground dries out.',
        'Scientists call a small special living place like that a microhabitat.'
      ],
      word: { w: 'habitat', say: 'HAB-ih-tat', mean: 'the place where an animal lives and finds what it needs' },
      check: {
        q: 'Chance rolls a log, looks, then puts it back exactly how it was. Why does that matter?',
        choices: [
          C('The log is the roof and the water supply for everything under it', 1),
          C('So nobody knows he was there', 'surface-feature'),
          C('It does not really matter, logs are everywhere', 'overgeneralize')
        ],
        hint: 'If someone took the roof off your house and left it in the yard, what would happen inside?',
        show: 'A rolled-away log dries out in hours and the whole microhabitat dies. Roll it, look, roll it back. Field scientist rule.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'A log is 6 feet long and 1 foot wide.',
          q: 'How much ground does it cover?',
          choices: [C('6 square feet', 1), C('7 square feet', 'additive-for-multiplicative'), C('14 feet around', 'perimeter-area-mixup')],
          hint: 'Length times width covers the inside.',
          show: '6 × 1 = 6 square feet of covered, damp ground. That is the whole apartment building.'
        },
        {
          story: 'Chance marks a study square in the woods: 3 feet on each side.',
          q: 'How much area is inside the square?',
          multiStep: 1,
          choices: [C('9 square feet', 1), C('12 feet', 'perimeter-area-mixup'), C('6 square feet', 'additive-for-multiplicative')],
          hint: '3 rows of 3 one-foot squares.',
          show: '3 × 3 = 9 square feet inside. 12 feet would be the walk AROUND the edge — different question.'
        },
        {
          story: 'In that 3-by-3 square Chance counts 18 creatures.',
          q: 'On average, how many creatures per square foot?',
          multiStep: 1,
          choices: [C('2 per square foot', 1), C('18 per square foot', 'part-whole-mixup'), C('9 per square foot', 'surface-feature')],
          hint: '18 creatures spread over 9 squares. How many per square?',
          show: '18 ÷ 9 = 2 per square foot. Sharing a total out evenly is division — and it is how real ecologists count.'
        }
      ]
    },
    reading: {
      words: [
        W('chunk', ['ch', 'u', 'nk'], ['ch', 'uh', 'nk'], 'a thick piece'),
        W('path', ['p', 'a', 'th'], ['p', 'a', 'th'], 'a track to walk on'),
        W('brush', ['br', 'u', 'sh'], ['br', 'uh', 'sh'], 'thick low bushes')
      ],
      sentence: 'A chunk of bark fell on the path beside the thick brush.',
      comp: {
        q: 'Where did the bark land?',
        choices: [C('On the path', 1), C('In the brush', 'surface-feature'), C('In the creek', 'guess-plausible')],
        hint: 'Look for the word "on".',
        show: 'On the path, beside the brush. Little words like "on" and "beside" carry the whole picture.'
      }
    }
  },

  {
    icon: '🐸', title: 'Frogs and Salamanders: Same Family, Different Plan',
    discover: {
      intro: [
        'Frogs and salamanders are both amphibians, but their bodies solve different problems.',
        'A frog has long folded back legs for jumping, no tail as an adult, and it calls out loud.',
        'A salamander keeps its tail, has four short even legs for walking and hiding, and stays quiet.'
      ],
      word: { w: 'compare', say: 'kum-PAIR', mean: 'to look for what is the same and what is different' },
      check: {
        q: 'Chance sees a wet-skinned animal with a long tail and four short legs, moving slowly. Frog or salamander?',
        choices: [
          C('Salamander — the tail and short even legs give it away', 1),
          C('Frog, because its skin is wet', 'surface-feature'),
          C('Cannot tell without hearing it', 'ignored-condition')
        ],
        hint: 'Both have wet skin, so wet skin cannot be the deciding clue. What is different?',
        show: 'Wet skin is shared, so it decides nothing. The tail and the four matched short legs are the deciding clues.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'In the pond Chance counts 4 frogs and 6 salamanders.',
          q: 'How many amphibians altogether?',
          choices: [C('10 amphibians', 1), C('24 amphibians', 'additive-for-multiplicative'), C('2 amphibians', 'part-whole-mixup')],
          hint: 'Frogs and salamanders are both amphibians, so add the two groups.',
          show: '4 + 6 = 10. Both belong to the bigger group, so both get counted.'
        },
        {
          story: 'Every frog has 2 long back legs. Chance counts 12 long back legs.',
          q: 'How many frogs?',
          multiStep: 1,
          choices: [C('6 frogs', 1), C('24 frogs', 'reversed-relation'), C('12 frogs', 'surface-feature')],
          hint: '2 legs per frog. How many 2s make 12?',
          show: '12 ÷ 2 = 6 frogs. Working backwards from the total is inverse thinking — real algebra.'
        },
        {
          story: 'A frog can jump 20 times its own body length. Chance\'s frog is 3 inches long.',
          q: 'How far could it jump?',
          multiStep: 1,
          choices: [C('60 inches', 1), C('23 inches', 'additive-for-multiplicative'), C('20 inches', 'surface-feature')],
          hint: '20 groups of 3 inches. Try 3 × 2 = 6, then add the zero back for tens.',
          show: '3 × 20 = 60 inches — five whole feet. If Chance could do that, he would jump about 80 feet.'
        }
      ]
    },
    reading: {
      words: [
        W('splash', ['spl', 'a', 'sh'], ['spl', 'a', 'sh'], 'the sound water makes when hit'),
        W('chase', ['ch', 'ase'], ['ch', 'ayss'], 'to run after'),
        W('thick', ['th', 'i', 'ck'], ['th', 'i', 'k'], 'not thin')
      ],
      sentence: 'The frog made a splash in the thick weeds, and the fish did not chase it.',
      comp: {
        q: 'What did the fish NOT do?',
        choices: [C('Chase the frog', 1), C('Make a splash', 'surface-feature'), C('Swim in the weeds', 'guess-plausible')],
        hint: 'Find the words "did not" and read what comes after.',
        show: 'The fish did not chase. "Did not" flips the meaning of whatever follows it — read those two words carefully.'
      }
    }
  },

  /* ---------------- WEEK 6 · Water and Streams ---------------- */
  {
    icon: '💧', title: 'The Same Water Goes Around Forever',
    discover: {
      intro: [
        'Sun heats water in the creek until it turns to invisible vapor and rises. That is evaporation.',
        'High up it cools, turns back into tiny droplets and makes clouds. That is condensation.',
        'The droplets join, get heavy, and fall as rain. Then the creek carries it away and it all starts over.'
      ],
      word: { w: 'evaporate', say: 'ee-VAP-uh-rayt', mean: 'to turn from liquid into invisible vapor' },
      check: {
        q: 'A puddle in the driveway disappears on a sunny day. Where did the water go?',
        choices: [
          C('It evaporated into the air as vapor', 1),
          C('It vanished — water can just disappear', 'literal-appearance'),
          C('It soaked into the concrete and stayed there', 'guess-plausible')
        ],
        hint: 'Water does not get destroyed. It changes form. Where can invisible water hide?',
        show: 'It went up into the air as vapor. That water is now in a cloud somewhere, waiting to fall on somebody.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'A puddle is 12 cups of water. Half of it evaporates on Monday.',
          q: 'How much is left?',
          choices: [C('6 cups', 1), C('12 cups', 'part-whole-mixup'), C('2 cups', 'guess-plausible')],
          hint: 'Half of 12.',
          show: '12 ÷ 2 = 6 cups left. And that 6 cups is now in the sky.'
        },
        {
          story: 'On Tuesday half of the 6 remaining cups evaporates too.',
          q: 'How much is left now?',
          multiStep: 1,
          choices: [C('3 cups', 1), C('4 cups', 'guess-plausible'), C('0 cups', 'sequence-error')],
          hint: 'Half of 6.',
          show: '6 ÷ 2 = 3 cups. Halving over and over is a pattern: 12, 6, 3… it shrinks fast but never quite hits zero on paper.'
        },
        {
          story: 'It rains 2 inches. Chance has 4 buckets out, and each catches the same amount.',
          q: 'If the buckets caught 12 cups in total, how much did each catch?',
          choices: [C('3 cups each', 1), C('48 cups each', 'reversed-relation'), C('12 cups each', 'part-whole-mixup')],
          hint: 'Share 12 cups fairly among 4 buckets.',
          show: '12 ÷ 4 = 3 cups each. Sharing a total equally is division.'
        }
      ]
    },
    reading: {
      words: [
        W('soaking', ['soak', 'ing'], ['sohk', 'ing'], 'getting very wet'),
        W('floated', ['float', 'ed'], ['floht', 'id'], 'stayed on top of water'),
        W('dripping', ['drip', 'ping'], ['drip', 'ing'], 'falling in drops')
      ],
      sentence: 'The soaking leaf floated by while rain was dripping off the branch.',
      comp: {
        q: 'Which word tells you something already happened, not that it is happening now?',
        choices: [C('floated', 1), C('soaking', 'letter-look'), C('dripping', 'letter-look')],
        hint: 'The ending -ed means it is finished. The ending -ing means it is still going.',
        show: '"Floated" ends in -ed, so it is done. "Soaking" and "dripping" end in -ing — still happening.'
      }
    }
  },

  {
    icon: '🏞️', title: 'Why Water Always Runs Downhill',
    discover: {
      intro: [
        'Gravity pulls water toward the center of Earth, so water always finds the lowest path it can.',
        'A stream is just the winning path — the lowest, easiest line down the hill.',
        'That is why you can stand in the woods, find the creek, and know for certain which way is downhill.'
      ],
      word: { w: 'slope', say: 'slohp', mean: 'how steeply the ground tilts' },
      check: {
        q: 'Chance is lost in the woods and finds a creek. What does the creek tell him?',
        choices: [
          C('Which direction is downhill', 1),
          C('Which direction is north', 'overgeneralize'),
          C('How deep the woods are', 'surface-feature')
        ],
        hint: 'What force decides which way a stream flows?',
        show: 'Water flows downhill, always. Downhill usually leads to bigger water, and bigger water usually leads to people.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Chance pours water on a steep slope and on a gentle slope.',
          q: 'Where does the water run faster?',
          choices: [C('The steep slope', 1), C('The gentle slope', 'reversed-relation'), C('Exactly the same on both', 'overgeneralize')],
          hint: 'Think about riding a bike down a steep hill versus a small bump.',
          show: 'Steeper means faster, because more of gravity\'s pull points along the path of travel.'
        },
        {
          story: 'A stick floats 10 feet down the creek in 5 seconds.',
          q: 'How fast is the water moving?',
          multiStep: 1,
          choices: [C('2 feet every second', 1), C('50 feet every second', 'additive-for-multiplicative'), C('5 feet every second', 'surface-feature')],
          hint: 'Split the 10 feet across the 5 seconds.',
          show: '10 ÷ 5 = 2 feet per second. Distance divided by time IS speed. You just measured a creek like a scientist.'
        },
        {
          story: 'The water moves 2 feet every second.',
          q: 'How far does the stick travel in 8 seconds?',
          choices: [C('16 feet', 1), C('10 feet', 'additive-for-multiplicative'), C('4 feet', 'reversed-relation')],
          hint: '2 feet each second, 8 seconds. Groups of 2.',
          show: '2 × 8 = 16 feet. Speed times time gives distance — the same formula turned around.'
        }
      ]
    },
    reading: {
      words: [
        W('rushing', ['rush', 'ing'], ['rush', 'ing'], 'moving fast'),
        W('slipped', ['slip', 'ped'], ['slip', 't'], 'slid by accident'),
        W('running', ['run', 'ning'], ['run', 'ing'], 'moving quickly')
      ],
      sentence: 'The rushing creek was running fast when Chance slipped on a wet rock.',
      comp: {
        q: 'What happened to Chance?',
        choices: [C('He slipped on a rock', 1), C('He was running', 'surface-feature'), C('He fell in the creek', 'guess-plausible')],
        hint: 'Careful — the creek is the thing that was running. What did CHANCE do?',
        show: 'He slipped. The creek was running — read who is doing what, because the sentence has two actors.'
      }
    }
  },

  {
    icon: '🪨', title: 'Water Moves Rocks',
    discover: {
      intro: [
        'Moving water carries sand and pebbles, and those bits scrape the creek bed like sandpaper. That is erosion.',
        'Faster water carries bigger rocks. When the water slows down, it drops what it was carrying.',
        'That is why you find smooth round stones in the creek and never square ones — years of tumbling wore the corners off.'
      ],
      word: { w: 'erosion', say: 'ee-ROH-zhun', mean: 'the slow wearing away of rock and soil by water or wind' },
      check: {
        q: 'Why are creek stones smooth and round instead of sharp?',
        choices: [
          C('Years of tumbling in water wore the sharp edges off', 1),
          C('They grew that way', 'animism'),
          C('Water is soft, so it makes rocks soft', 'literal-appearance')
        ],
        hint: 'Rub two rocks together hard. What happens to the pointy parts?',
        show: 'Tumbling grinds the corners away. A round creek stone has been in there a very long time.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Fast water carries pebbles. Slow water drops them.',
          q: 'The creek slows down where it widens out. What do you expect to find there?',
          choices: [C('A pile of dropped sand and pebbles', 1), C('The deepest, fastest channel', 'reversed-relation'), C('No rocks at all', 'guess-plausible')],
          hint: 'Water carrying rocks slows down. It cannot hold them anymore. Then what?',
          show: 'Slow water drops its load, so wide slow spots build up sandbars. Fish like the edge of those bars.'
        },
        {
          story: 'The creek moves 4 pounds of sand each hour during a storm.',
          q: 'How much sand in 6 hours?',
          choices: [C('24 pounds', 1), C('10 pounds', 'additive-for-multiplicative'), C('4 pounds', 'surface-feature')],
          hint: '4 pounds each hour, 6 hours.',
          show: '4 × 6 = 24 pounds of sand moved by one storm.'
        },
        {
          story: 'A stone loses 1 inch of its width every 100 years of tumbling. It has lost 3 inches.',
          q: 'About how long has it been tumbling?',
          multiStep: 1,
          choices: [C('300 years', 1), C('103 years', 'additive-for-multiplicative'), C('33 years', 'reversed-relation')],
          hint: '100 years for each inch, and it lost 3 inches.',
          show: '100 × 3 = 300 years. That rock in his hand is older than the country.'
        }
      ]
    },
    reading: {
      words: [
        W('tumbled', ['tum', 'bled'], ['tum', 'bld'], 'rolled over and over'),
        W('cracking', ['crack', 'ing'], ['krak', 'ing'], 'breaking apart'),
        W('washed', ['wash', 'ed'], ['wosh', 't'], 'carried away by water')
      ],
      sentence: 'The stone tumbled and washed downstream while the ice was cracking above.',
      comp: {
        q: 'Which direction did the stone go?',
        choices: [C('Downstream', 1), C('Upstream', 'reversed-relation'), C('It stayed still', 'surface-feature')],
        hint: 'Find the word that ends in "-stream".',
        show: 'Downstream. Water only carries things the way it is already going — downhill.'
      }
    }
  },

  {
    icon: '🧊', title: 'Why Ice Floats',
    discover: {
      intro: [
        'Almost everything shrinks when it gets cold. Water is strange — it expands when it freezes.',
        'The same water takes up more room as ice, so ice is less dense than water, and less dense things float.',
        'That is lucky for fish. Ice forms on top like a lid, and the water underneath stays liquid all winter.'
      ],
      word: { w: 'density', say: 'DEN-sih-tee', mean: 'how much stuff is packed into a space' },
      check: {
        q: 'Why is it good for the creek\'s fish that ice floats?',
        choices: [
          C('The ice makes a lid and the water below stays liquid', 1),
          C('The fish can sit on the ice to rest', 'guess-plausible'),
          C('Ice feeds the fish in winter', 'animism')
        ],
        hint: 'If ice sank instead, what would happen to the pond from the bottom up?',
        show: 'Floating ice insulates the water below. If ice sank, ponds would freeze solid and everything in them would die.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'Chance freezes 10 cups of water. As ice, it takes up 11 cups of space.',
          q: 'How much extra room did the water need once it froze?',
          choices: [C('1 cup more', 1), C('21 cups more', 'additive-for-multiplicative'), C('10 cups more', 'surface-feature')],
          hint: 'The gap between 11 and 10.',
          show: '11 − 10 = 1 cup more. That is exactly why a full water bottle cracks in the freezer.'
        },
        {
          story: 'Water freezes at 32 degrees. This morning it is 20 degrees.',
          q: 'How many degrees BELOW freezing is it?',
          choices: [C('12 degrees below', 1), C('52 degrees below', 'additive-for-multiplicative'), C('20 degrees below', 'surface-feature')],
          hint: '32 take away 20.',
          show: '32 − 20 = 12 degrees below freezing. Cold enough to skate, if the ice is thick.'
        },
        {
          story: 'Pond ice gets 1 inch thicker each freezing night. Safe ice needs 4 inches.',
          q: 'After 3 freezing nights, is it safe?',
          multiStep: 1,
          choices: [C('No — only 3 inches, one short', 1), C('Yes, 3 nights is enough', 'ignored-condition'), C('Yes, because 3 plus 4 is 7', 'additive-for-multiplicative')],
          hint: '3 nights makes 3 inches. Compare that to the 4 inches needed.',
          show: '3 inches is less than 4, so not yet. Comparing to a rule instead of just calculating is careful thinking — and here it matters.'
        }
      ]
    },
    reading: {
      words: [
        W('freezing', ['freez', 'ing'], ['freez', 'ing'], 'turning to ice'),
        W('cracked', ['crack', 'ed'], ['krak', 't'], 'split open'),
        W('floating', ['float', 'ing'], ['floht', 'ing'], 'resting on top of water')
      ],
      sentence: 'The freezing pond had cracked ice floating on the still water.',
      comp: {
        q: 'Where was the ice?',
        choices: [C('Floating on top of the water', 1), C('At the bottom of the pond', 'reversed-relation'), C('Beside the pond', 'surface-feature')],
        hint: 'The word "floating" tells you. Floating things sit where?',
        show: 'On top. Ice always floats, and that keeps the pond alive underneath.'
      }
    }
  },

  {
    icon: '🚰', title: 'Measuring the Creek',
    discover: {
      intro: [
        'Scientists do not guess "a lot of water." They measure, so they can compare one day to another.',
        'You can measure how deep it is with a stick, how fast it flows with a floating stick and a count, and how much it carries with a bucket.',
        'Numbers turn a nice walk into real data.'
      ],
      word: { w: 'volume', say: 'VOL-yoom', mean: 'how much space something takes up' },
      check: {
        q: 'Chance says "the creek is really high today." How could he prove it?',
        choices: [
          C('Measure the depth at the same rock every visit and write it down', 1),
          C('Look at it and remember how it seemed last time', 'guess-plausible'),
          C('Count the fish he can see', 'surface-feature')
        ],
        hint: 'To compare two days, you need the same measurement in the same place both days.',
        show: 'Same spot, same measurement, written down. That is a data set — and it beats memory every time.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'The creek was 8 inches deep on Monday and 14 inches deep after Tuesday\'s rain.',
          q: 'How much did it rise?',
          choices: [C('6 inches', 1), C('22 inches', 'additive-for-multiplicative'), C('14 inches', 'surface-feature')],
          hint: 'The gap between 14 and 8.',
          show: '14 − 8 = 6 inches of rise.'
        },
        {
          story: 'A bucket holds 4 gallons. Chance fills it 5 times to water the garden.',
          q: 'How many gallons did he carry?',
          choices: [C('20 gallons', 1), C('9 gallons', 'additive-for-multiplicative'), C('4 gallons', 'surface-feature')],
          hint: '4 gallons per trip, 5 trips.',
          show: '4 × 5 = 20 gallons. A gallon weighs about 8 pounds, so that was 160 pounds of hauling.'
        },
        {
          story: 'A pipe fills a 24-gallon tub. It pours 3 gallons every minute.',
          q: 'How long to fill the tub?',
          multiStep: 1,
          choices: [C('8 minutes', 1), C('72 minutes', 'reversed-relation'), C('21 minutes', 'additive-for-multiplicative')],
          hint: 'How many 3-gallon minutes fit in 24 gallons?',
          show: '24 ÷ 3 = 8 minutes. Total divided by rate gives time — same shape as distance ÷ speed.'
        }
      ]
    },
    reading: {
      words: [
        W('filling', ['fill', 'ing'], ['fil', 'ing'], 'putting in until full'),
        W('measured', ['meas', 'ured'], ['mezh', 'urd'], 'found the exact amount'),
        W('marked', ['mark', 'ed'], ['mark', 't'], 'made a sign to remember a spot')
      ],
      sentence: 'Chance measured the creek and marked the rock while filling his notebook.',
      comp: {
        q: 'Why would he mark the rock?',
        choices: [
          C('So he can measure the same spot next time', 1),
          C('So other people stay away', 'guess-plausible'),
          C('Because the rock was pretty', 'surface-feature')
        ],
        hint: 'Think about yesterday\'s lesson: what makes two measurements comparable?',
        show: 'A marked rock is a fixed reference point. Same spot every time is what makes the numbers mean something.'
      }
    }
  },

  /* ---------------- WEEK 7 · Fish and Food Webs ---------------- */
  {
    icon: '🐟', title: 'How Fish Breathe Underwater',
    discover: {
      intro: [
        'There is oxygen dissolved in water, and gills are built to pull it out.',
        'A fish gulps water in its mouth and pushes it out over its gills, where the oxygen crosses into its blood.',
        'Cold fast water holds more oxygen than warm still water — which is exactly why trout live in cold rushing creeks.'
      ],
      word: { w: 'gills', say: 'gilz', mean: 'the body part fish use to take oxygen out of water' },
      check: {
        q: 'Why can a fish not breathe in a bucket of warm still water for very long?',
        choices: [
          C('Warm still water holds less oxygen', 1),
          C('Fish need to swim fast or they die', 'guess-plausible'),
          C('Warm water burns their gills', 'literal-appearance')
        ],
        hint: 'Which kind of water holds more oxygen — cold and moving, or warm and still?',
        show: 'Less oxygen in warm still water. That is why you keep a catch in cool moving water, or release it fast.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'Cold water holds about 10 units of oxygen. Warm water holds about 7.',
          q: 'How many more units does cold water hold?',
          choices: [C('3 more', 1), C('17 more', 'additive-for-multiplicative'), C('7 more', 'surface-feature')],
          hint: 'The gap between 10 and 7.',
          show: '10 − 7 = 3 more units. Small difference, huge deal for a trout.'
        },
        {
          story: 'A trout takes 60 gill breaths a minute.',
          q: 'How many breaths in 3 minutes?',
          choices: [C('180 breaths', 1), C('63 breaths', 'additive-for-multiplicative'), C('20 breaths', 'reversed-relation')],
          hint: '60 each minute, 3 minutes. Think 6 × 3, then add the zero.',
          show: '60 × 3 = 180 breaths.'
        },
        {
          story: 'Chance counts a fish\'s gill movements: 15 in 15 seconds.',
          q: 'How many in a whole minute?',
          multiStep: 1,
          choices: [C('60', 1), C('15', 'surface-feature'), C('30', 'part-whole-mixup')],
          hint: 'How many 15-second chunks are in one minute? Four. So four times as many.',
          show: '15 × 4 = 60 per minute. Scaling a short count up to a longer time is how scientists measure heart and breath rates.'
        }
      ]
    },
    reading: {
      words: [
        W('brook', ['br', 'oo', 'k'], ['br', 'ook', ''], 'a small creek'),
        W('trout', ['tr', 'ou', 't'], ['tr', 'owt', ''], 'a cold-water fish'),
        W('cool', ['c', 'oo', 'l'], ['k', 'oool', ''], 'a little bit cold')
      ],
      sentence: 'A trout will hold still in the cool brook where the water runs fast.',
      comp: {
        q: 'Why does the trout pick the fast cool water?',
        choices: [
          C('More oxygen is there', 1),
          C('It likes to hold still', 'surface-feature'),
          C('It is hiding from the sun', 'guess-plausible')
        ],
        hint: 'Remember today\'s science. What does cold fast water have more of?',
        show: 'Cold fast water is oxygen-rich. That is why anglers fish the riffles and the shady runs.'
      }
    }
  },

  {
    icon: '🎣', title: 'Why a Bobber Floats and a Sinker Sinks',
    discover: {
      intro: [
        'Water pushes up on anything you put in it. That upward push is called buoyancy.',
        'If an object weighs less than the water it shoves aside, it floats. If it weighs more, it sinks.',
        'A bobber is light and full of air, so it floats. A lead sinker is heavy for its size, so it drops.'
      ],
      word: { w: 'buoyancy', say: 'BOY-un-see', mean: 'the upward push water gives to things in it' },
      check: {
        q: 'A big heavy log floats but a small lead sinker sinks. What decides it?',
        choices: [
          C('How heavy it is for its size, not how heavy it is', 1),
          C('Big things float, small things sink', 'overgeneralize'),
          C('Heavy things always sink', 'bigger-number-bias')
        ],
        hint: 'The log is way heavier than the sinker, and the log is the one that floats. So weight alone cannot be the rule.',
        show: 'Heavy FOR ITS SIZE is the rule — density. A huge steel ship floats because it is mostly air inside.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Chance puts a rock in a full cup of water and 3 spoonfuls spill out.',
          q: 'What do those 3 spoonfuls tell him?',
          choices: [
            C('How much space the rock takes up', 1),
            C('How heavy the rock is', 'part-whole-mixup'),
            C('How hard he dropped it', 'surface-feature')
          ],
          hint: 'The rock pushed water out of the way. The water it pushed out matches what?',
          show: 'Spilled water measures the rock\'s volume — the space it takes up. Archimedes figured this out in a bathtub.'
        },
        {
          story: 'A bobber holds up 2 ounces before it sinks. Chance clips on a 3-ounce sinker.',
          q: 'Does the bobber stay up?',
          choices: [C('No — 3 is more than it can hold', 1), C('Yes, bobbers always float', 'overgeneralize'), C('Yes, because 2 plus 3 is 5', 'additive-for-multiplicative')],
          hint: 'Compare what it can hold to what you hung on it.',
          show: '3 ounces beats its 2-ounce limit, so under it goes. Comparing to a limit is a different job than adding.'
        },
        {
          story: 'Chance has 3 sinkers weighing 2 ounces each.',
          q: 'How much do they weigh together?',
          choices: [C('6 ounces', 1), C('5 ounces', 'additive-for-multiplicative'), C('2 ounces', 'surface-feature')],
          hint: '3 sinkers, 2 ounces each.',
          show: '2 × 3 = 6 ounces.'
        }
      ]
    },
    reading: {
      words: [
        W('down', ['d', 'ow', 'n'], ['d', 'own', ''], 'toward the ground'),
        W('float', ['fl', 'oa', 't'], ['fl', 'oht', ''], 'to rest on top of water'),
        W('hook', ['h', 'oo', 'k'], ['h', 'ook', ''], 'a bent piece of metal for fishing')
      ],
      sentence: 'The hook went down deep, but the float stayed up on top.',
      comp: {
        q: 'Which one went under the water?',
        choices: [C('The hook', 1), C('The float', 'reversed-relation'), C('Both of them', 'surface-feature')],
        hint: 'Find which word has "down" next to it.',
        show: 'The hook went down; the float stayed up. That is the whole point of a float — it tells you what the hook is doing.'
      }
    }
  },

  {
    icon: '🪱', title: 'Who Eats Who in the Creek',
    discover: {
      intro: [
        'Sunlight grows algae and plants. Bugs and snails eat the plants. Small fish eat the bugs. Big fish eat the small fish.',
        'That chain is a food chain, and every single link traces back to sunlight.',
        'Take away one link and the whole chain wobbles — that is why a creek needs its bugs.'
      ],
      word: { w: 'predator', say: 'PRED-uh-ter', mean: 'an animal that hunts and eats other animals' },
      check: {
        q: 'A creek gets sprayed and all its bugs die. What happens to the big fish?',
        choices: [
          C('They go hungry too — their food ate the bugs', 1),
          C('Nothing, big fish do not eat bugs', 'ignored-condition'),
          C('They get bigger, with fewer bugs bothering them', 'reversed-relation')
        ],
        hint: 'Follow the chain up one link at a time. Bugs feed small fish. Small fish feed big fish.',
        show: 'No bugs means no small fish, which means no food for the big fish. Damage at the bottom travels all the way up.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'It takes 10 bugs to feed 1 small fish. It takes 4 small fish to feed 1 big fish.',
          q: 'How many bugs does it take to feed 1 big fish?',
          multiStep: 1,
          choices: [C('40 bugs', 1), C('14 bugs', 'additive-for-multiplicative'), C('10 bugs', 'ignored-condition')],
          hint: 'Each of the 4 small fish needs its own 10 bugs.',
          show: '10 × 4 = 40 bugs. Chains multiply — that is why big predators need enormous territories.'
        },
        {
          story: 'A creek has 5 big fish. Each needs 40 bugs\' worth of food.',
          q: 'How many bugs does the creek need to support them?',
          multiStep: 1,
          choices: [C('200 bugs', 1), C('45 bugs', 'additive-for-multiplicative'), C('40 bugs', 'part-whole-mixup')],
          hint: '40 for each of the 5 fish. Think 4 × 5, then add the zero.',
          show: '40 × 5 = 200 bugs. Now you see why a healthy creek is loud with insects.'
        },
        {
          story: 'Chance nets 12 creatures: 8 are bugs and the rest are snails.',
          q: 'How many snails?',
          choices: [C('4 snails', 1), C('20 snails', 'additive-for-multiplicative'), C('8 snails', 'surface-feature')],
          hint: '12 in all, 8 are bugs. The rest are snails.',
          show: '12 − 8 = 4 snails. "The rest" always means subtract.'
        }
      ]
    },
    reading: {
      words: [
        W('mouth', ['m', 'ou', 'th'], ['mmm', 'owth', ''], 'the opening you eat with'),
        W('food', ['f', 'oo', 'd'], ['fff', 'oood', ''], 'what living things eat'),
        W('crowd', ['cr', 'ow', 'd'], ['kr', 'owd', ''], 'a lot of them in one place')
      ],
      sentence: 'A crowd of small fish took food into each mouth down in the shade.',
      comp: {
        q: 'What were the small fish doing?',
        choices: [C('Eating', 1), C('Crowding the shade', 'surface-feature'), C('Hiding from a predator', 'guess-plausible')],
        hint: 'Find the words "took food into".',
        show: 'They were eating. Watch for the action word — that is what the sentence is really about.'
      }
    }
  },

  {
    icon: '🌡️', title: 'Cold Water, Slow Fish',
    discover: {
      intro: [
        'Fish are cold-blooded, so the water\'s temperature sets their body temperature.',
        'In cold water everything inside them runs slower: they move less, eat less and grow slower.',
        'That is why winter fishing is patient, slow fishing — and why a warm spring afternoon wakes the whole creek up.'
      ],
      word: { w: 'cold-blooded', say: 'kohld-BLUD-id', mean: 'having a body that matches the temperature around it' },
      check: {
        q: 'The creek is 40 degrees. Should Chance reel his bait fast or slow?',
        choices: [
          C('Slow — cold fish will not chase a fast bait', 1),
          C('Fast, to get their attention', 'guess-plausible'),
          C('It makes no difference to a fish', 'overgeneralize')
        ],
        hint: 'Cold means slow bodies. Would a slow fish chase something quick?',
        show: 'Slow bait in cold water. Match your speed to the fish\'s speed — that is applied biology on a fishing rod.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'At 70 degrees a fish eats 6 bugs an hour. At 40 degrees it eats 2 an hour.',
          q: 'How many fewer bugs per hour in the cold?',
          choices: [C('4 fewer', 1), C('8 fewer', 'additive-for-multiplicative'), C('3 fewer', 'off-by-one')],
          hint: 'The gap between 6 and 2.',
          show: '6 − 2 = 4 fewer bugs an hour. One third of its summer appetite.'
        },
        {
          story: 'In warm water a fish eats 6 bugs an hour.',
          q: 'How many bugs in 5 hours?',
          choices: [C('30 bugs', 1), C('11 bugs', 'additive-for-multiplicative'), C('6 bugs', 'surface-feature')],
          hint: '6 an hour, 5 hours.',
          show: '6 × 5 = 30 bugs.'
        },
        {
          story: 'Warm water fish: 6 bugs an hour. Cold water fish: 2 bugs an hour.',
          q: 'The cold fish eats 12 bugs. How long did that take?',
          multiStep: 1,
          choices: [C('6 hours', 1), C('2 hours', 'surface-feature'), C('24 hours', 'reversed-relation')],
          hint: 'How many 2-bug hours make 12 bugs?',
          show: '12 ÷ 2 = 6 hours. The warm fish would have finished that in 2 hours flat.'
        }
      ]
    },
    reading: {
      words: [
        W('slow', ['sl', 'ow'], ['sl', 'oh'], 'not fast'),
        W('cool', ['c', 'oo', 'l'], ['k', 'oool', ''], 'a bit cold'),
        W('south', ['s', 'ou', 'th'], ['sss', 'owth', ''], 'the warm direction, away from north')
      ],
      sentence: 'When the cool days come, the slow fish move to the deep south end of the pond.',
      comp: {
        q: 'Why would fish move to the deep end when it gets cool?',
        choices: [
          C('Deep water stays warmer in the cold', 1),
          C('Because they are slow', 'surface-feature'),
          C('To get closer to the south', 'letter-look')
        ],
        hint: 'Think about swimming in a lake: the top is cold in fall, and the bottom holds its heat longer.',
        show: 'Deep water holds its warmth. Cold-blooded animals hunt for the warmest water they can find.'
      }
    }
  },

  {
    icon: '🪝', title: 'The Physics of a Cast',
    discover: {
      intro: [
        'A fishing rod is a lever and a spring. You bend it, it stores energy, and it snaps forward and throws the lure.',
        'A longer rod moves the tip faster, and a faster tip throws the lure farther.',
        'The lure flies in a curved path called an arc: up, over, and down. Aim above your target, not at it.'
      ],
      word: { w: 'arc', say: 'ark', mean: 'the curved path a thrown object follows' },
      check: {
        q: 'Chance wants to cast farther. Which change helps most?',
        choices: [
          C('Load the rod so the tip whips through faster', 1),
          C('Hold the rod tighter', 'guess-plausible'),
          C('Use a heavier line', 'reversed-relation')
        ],
        hint: 'What actually throws the lure — your grip, or the speed of the rod tip?',
        show: 'Tip speed throws the lure. A tight grip and thick line both cost you distance.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Chance casts 20 feet. Grandpa casts 60 feet.',
          q: 'How many times farther does Grandpa cast?',
          multiStep: 1,
          choices: [C('3 times farther', 1), C('40 times farther', 'additive-for-multiplicative'), C('80 times farther', 'additive-for-multiplicative')],
          hint: 'How many 20-foot casts fit in 60 feet?',
          show: '60 ÷ 20 = 3 times farther. "How many times" is division; 40 feet is "how much farther."'
        },
        {
          story: 'A lure flies through the air for 2 seconds and travels 30 feet.',
          q: 'How fast was it going, on average?',
          multiStep: 1,
          choices: [C('15 feet per second', 1), C('60 feet per second', 'reversed-relation'), C('32 feet per second', 'additive-for-multiplicative')],
          hint: 'Split 30 feet across 2 seconds.',
          show: '30 ÷ 2 = 15 feet per second. Distance divided by time is speed, on a creek bank or in orbit.'
        },
        {
          story: 'Chance makes 8 casts at each of 4 spots on the pond.',
          q: 'How many casts in all?',
          choices: [C('32 casts', 1), C('12 casts', 'additive-for-multiplicative'), C('8 casts', 'surface-feature')],
          hint: '8 casts per spot, 4 spots.',
          show: '8 × 4 = 32 casts.'
        }
      ]
    },
    reading: {
      words: [
        W('throw', ['thr', 'ow'], ['thr', 'oh'], 'to send through the air'),
        W('loop', ['l', 'oo', 'p'], ['lll', 'oooop', ''], 'a circle of line'),
        W('out', ['ou', 't'], ['owt', ''], 'away from where you are')
      ],
      sentence: 'He let the loop of line throw the lure out over the deep pool.',
      comp: {
        q: 'What went out over the pool?',
        choices: [C('The lure', 1), C('The loop of line', 'surface-feature'), C('Chance', 'guess-plausible')],
        hint: 'The loop did the throwing. What got thrown?',
        show: 'The lure went out; the loop threw it. Two things in one sentence — figure out who does what.'
      }
    }
  },

  /* ---------------- WEEK 8 · Trees, Leaves and Soil ---------------- */
  {
    icon: '🌳', title: 'How a Tree Drinks',
    discover: {
      intro: [
        'Roots pull water out of the soil, and thin tubes inside the trunk carry it all the way to the top leaves.',
        'Leaves let water escape as vapor, and that escaping water pulls the next water up behind it, like sipping through a straw.',
        'A big oak can lift over a hundred gallons a day, with no pump and no motor anywhere.'
      ],
      word: { w: 'roots', say: 'roots', mean: 'the underground parts that soak up water' },
      check: {
        q: 'What pulls water up a 60-foot tree?',
        choices: [
          C('Water escaping from the leaves drags more up behind it', 1),
          C('A pump in the trunk', 'guess-plausible'),
          C('The tree pushes it up from the roots because it wants to', 'animism')
        ],
        hint: 'Think about drinking through a straw. What is at the top making it work?',
        show: 'Evaporation at the leaves does the pulling. Trees have no pumps — they use physics.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'A tree lifts 20 gallons of water a day.',
          q: 'How much in a week?',
          multiStep: 1,
          choices: [C('140 gallons', 1), C('27 gallons', 'additive-for-multiplicative'), C('20 gallons', 'surface-feature')],
          hint: '20 gallons each day, 7 days. Think 2 × 7, then add the zero.',
          show: '20 × 7 = 140 gallons. That is over a thousand pounds of water, lifted with no engine.'
        },
        {
          story: 'A young tree is 6 feet tall and grows 2 feet every year.',
          q: 'How tall in 4 years?',
          multiStep: 1,
          choices: [C('14 feet', 1), C('8 feet', 'ignored-condition'), C('12 feet', 'ignored-condition')],
          hint: 'Growth is 2 × 4. Then do not forget the 6 feet it started with.',
          show: '2 × 4 = 8 feet of growth, plus the 6 it already had, is 14 feet. Never drop the starting amount.'
        },
        {
          story: 'A tree ring forms every year. Chance counts 25 rings on a cut stump.',
          q: 'How old was that tree?',
          choices: [C('25 years', 1), C('50 years', 'additive-for-multiplicative'), C('12 years', 'part-whole-mixup')],
          hint: 'One ring per year.',
          show: '25 rings = 25 years. Thick rings mean rainy years — you can read the weather in a stump.'
        }
      ]
    },
    reading: {
      words: [
        W('cell', ['c', 'e', 'll'], ['sss', 'eh', 'l'], 'the tiny building block of living things'),
        W('juice', ['j', 'ui', 'ce'], ['j', 'ooo', 'ss'], 'liquid from a plant'),
        W('center', ['cen', 'ter'], ['sen', 'ter'], 'the middle')
      ],
      sentence: 'Each cell in the center of the trunk can hold juice and water.',
      comp: {
        q: 'What is in the center of the trunk?',
        choices: [C('Cells that hold water', 1), C('Juice from fruit', 'surface-feature'), C('Roots', 'guess-plausible')],
        hint: 'Read the beginning: "Each ___ in the center…"',
        show: 'Cells. When the letter c comes before e or i, it usually says "sss" — cell, center, city.'
      }
    }
  },

  {
    icon: '🍃', title: 'Leaves Are Food Factories',
    discover: {
      intro: [
        'A leaf takes in sunlight, water from the roots, and carbon dioxide from the air.',
        'It builds sugar out of those three things and gives off oxygen as leftovers. That is photosynthesis.',
        'So a tree does not eat food from the soil. It makes its own food out of light.'
      ],
      word: { w: 'photosynthesis', say: 'foh-toh-SIN-thuh-sis', mean: 'making food out of light, water and air' },
      check: {
        q: 'Where does a tree get most of the material for its wood?',
        choices: [
          C('From air and water, using sunlight to build it', 1),
          C('From soil it eats through its roots', 'guess-plausible'),
          C('From other dead plants it absorbs', 'overgeneralize')
        ],
        hint: 'If trees ate soil, the ground around every big tree would be a deep empty hole.',
        show: 'Mostly air and water. A tree is built out of sky, which is one of the strangest true facts in science.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'One leaf makes 2 units of sugar an hour in full sun.',
          q: 'How much do 10 leaves make in one hour?',
          choices: [C('20 units', 1), C('12 units', 'additive-for-multiplicative'), C('2 units', 'surface-feature')],
          hint: '2 units each, 10 leaves.',
          show: '2 × 10 = 20 units.'
        },
        {
          story: 'A branch has 10 leaves making 2 units an hour each.',
          q: 'How much sugar after 3 hours of sun?',
          multiStep: 1,
          choices: [C('60 units', 1), C('23 units', 'additive-for-multiplicative'), C('20 units', 'ignored-condition')],
          hint: 'First one hour: 2 × 10 = 20. Then 3 hours of that.',
          show: '20 per hour × 3 hours = 60 units. Two steps: leaves first, then time.'
        },
        {
          story: 'Sugar machine rule: sunlight hours in, sugar units out. Put in 1, get 20. Put in 2, get 40. Put in 3, get 60.',
          q: 'Put in 5 hours. What comes out?',
          multiStep: 1,
          choices: [C('100 units', 1), C('80 units', 'off-by-one'), C('65 units', 'additive-for-multiplicative')],
          hint: 'What is the hidden rule? Each hour adds 20.',
          show: '20 × 5 = 100 units. Spotting the rule and jumping ahead to a new number is exactly what algebra is for.'
        }
      ]
    },
    reading: {
      words: [
        W('edge', ['e', 'dge'], ['eh', 'j'], 'the outside line of something'),
        W('gentle', ['gen', 'tle'], ['jen', 'tul'], 'soft and careful'),
        W('space', ['sp', 'ace'], ['sp', 'ayss'], 'an empty place')
      ],
      sentence: 'A gentle wind moved the edge of the leaf into the open space.',
      comp: {
        q: 'What moved the leaf?',
        choices: [C('A gentle wind', 1), C('The open space', 'surface-feature'), C('The edge', 'surface-feature')],
        hint: 'Who or what is doing the moving? Look at the start of the sentence.',
        show: 'The wind moved it. In "gentle" and "edge" the letter g says "juh" — that happens before e, i and y.'
      }
    }
  },

  {
    icon: '🍂', title: 'Why Leaves Change Color',
    discover: {
      intro: [
        'Leaves are green because of chlorophyll, the stuff that catches sunlight to make food.',
        'The yellows and oranges were hiding in the leaf the whole time, covered up by all that green.',
        'In fall the tree stops making chlorophyll, the green fades, and the hidden colors finally show.'
      ],
      word: { w: 'chlorophyll', say: 'KLOR-uh-fil', mean: 'the green stuff in leaves that catches sunlight' },
      check: {
        q: 'Where do the yellow and orange colors come from in the fall?',
        choices: [
          C('They were already in the leaf, hidden under the green', 1),
          C('The cold paints them on', 'literal-appearance'),
          C('The tree makes new colors for fall', 'guess-plausible')
        ],
        hint: 'The green did not turn into yellow. Something stopped covering something up.',
        show: 'The yellows were there all summer. Losing the green is what reveals them.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'Chance collects 24 leaves: 12 are red, 8 are yellow, and the rest are brown.',
          q: 'How many are brown?',
          multiStep: 1,
          choices: [C('4 brown', 1), C('20 brown', 'part-whole-mixup'), C('12 brown', 'surface-feature')],
          hint: 'Add the red and yellow first, then take that away from 24.',
          show: '12 + 8 = 20 accounted for. 24 − 20 = 4 brown. "The rest" means whatever is left over.'
        },
        {
          story: 'A tree drops about 30 leaves a day in October.',
          q: 'About how many in 10 days?',
          choices: [C('300 leaves', 1), C('40 leaves', 'additive-for-multiplicative'), C('30 leaves', 'surface-feature')],
          hint: '30 a day, 10 days. Think 3 × 10, then add zeros.',
          show: '30 × 10 = 300 leaves.'
        },
        {
          story: 'Chance sorts 24 leaves into 4 equal piles.',
          q: 'How many in each pile?',
          choices: [C('6 leaves', 1), C('28 leaves', 'additive-for-multiplicative'), C('4 leaves', 'surface-feature')],
          hint: 'Share 24 fairly among 4 piles.',
          show: '24 ÷ 4 = 6 leaves per pile.'
        }
      ]
    },
    reading: {
      words: [
        W('ridge', ['ri', 'dge'], ['rih', 'j'], 'a long raised line, like a hilltop'),
        W('city', ['ci', 'ty'], ['sih', 'tee'], 'a big town'),
        W('change', ['ch', 'ange'], ['ch', 'aynj'], 'to become different')
      ],
      sentence: 'On the ridge above the city, the leaves change color first.',
      comp: {
        q: 'Where do the leaves change color first?',
        choices: [C('Up on the ridge', 1), C('In the city', 'surface-feature'), C('In the valley', 'guess-plausible')],
        hint: 'Find the word "On" at the start.',
        show: 'On the ridge — it is colder up high, so fall arrives there first.'
      }
    }
  },

  {
    icon: '🍄', title: 'Rotting Is Somebody\'s Job',
    discover: {
      intro: [
        'When a log or a leaf rots, it is being eaten — by fungus, bacteria and bugs called decomposers.',
        'They break the dead stuff into tiny pieces that mix into the soil and feed new plants.',
        'Without decomposers the woods would be buried under thousands of years of dead leaves.'
      ],
      word: { w: 'decompose', say: 'dee-kum-POHZ', mean: 'to break down dead things into soil' },
      check: {
        q: 'What is really happening when a log "rots away"?',
        choices: [
          C('Living things are eating it and turning it into soil', 1),
          C('It disappears into nothing', 'literal-appearance'),
          C('Water washes it away', 'guess-plausible')
        ],
        hint: 'Nothing vanishes. If the log left, where did it go?',
        show: 'It got eaten and became soil. Matter never disappears — it just changes owners.'
      }
    },
    numbers: {
      domain: 'time',
      problems: [
        {
          story: 'A leaf takes about 12 months to fully decompose.',
          q: 'How many years is that?',
          choices: [C('1 year', 1), C('12 years', 'unit-mixup'), C('6 years', 'part-whole-mixup')],
          hint: '12 months in a year.',
          show: '12 months = 1 year. Watch units: 12 years would be a long-lasting leaf.'
        },
        {
          story: 'A log takes about 10 years to decompose. A leaf takes 1 year.',
          q: 'How many times longer for the log?',
          choices: [C('10 times longer', 1), C('9 times longer', 'off-by-one'), C('11 times longer', 'additive-for-multiplicative')],
          hint: 'How many 1-year leaves fit into 10 years?',
          show: '10 ÷ 1 = 10 times longer. Thicker and denser means slower to break down.'
        },
        {
          story: 'Chance starts a compost pile in March. It is ready in 6 months.',
          q: 'What month is it ready?',
          multiStep: 1,
          choices: [C('September', 1), C('June', 'part-whole-mixup'), C('March again', 'sequence-error')],
          hint: 'Count 6 months forward from March: April, May, June…',
          show: 'March + 6 months = September. Counting forward on a calendar is adding on a number line.'
        }
      ]
    },
    reading: {
      words: [
        W('juicy', ['jui', 'cy'], ['joo', 'see'], 'full of liquid'),
        W('bridge', ['bri', 'dge'], ['brih', 'j'], 'something you cross over water on'),
        W('circle', ['cir', 'cle'], ['sur', 'kul'], 'a round shape')
      ],
      sentence: 'Under the bridge a circle of juicy mushrooms grew in the wet dirt.',
      comp: {
        q: 'What were the mushrooms doing there?',
        choices: [
          C('Growing in the wet dirt', 1),
          C('Crossing the bridge', 'surface-feature'),
          C('Making a circle on purpose', 'animism')
        ],
        hint: 'Find the action word near the end.',
        show: 'They grew. In "bridge" and "juicy" watch the soft sounds: dge says "j" and c before y says "sss".'
      }
    }
  },

  {
    icon: '🪱', title: 'What Soil Is Made Of',
    discover: {
      intro: [
        'Soil is not just dirt. It is broken rock, rotted plants, water, air, and millions of living things.',
        'Earthworms tunnel through it, which lets air and water reach plant roots.',
        'One handful of good soil holds more living creatures than there are people on Earth.'
      ],
      word: { w: 'soil', say: 'soyl', mean: 'the living mix of rock bits, rotted plants, air and water' },
      check: {
        q: 'Why do gardeners want earthworms in their soil?',
        choices: [
          C('Their tunnels let air and water down to the roots', 1),
          C('They eat the bugs that hurt plants', 'guess-plausible'),
          C('They make the soil look better', 'surface-feature')
        ],
        hint: 'What does a tunnel let through that solid packed dirt will not?',
        show: 'Tunnels carry air and water to roots. Worms are free plumbing for a garden.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'Chance digs a square garden bed 5 feet on each side.',
          q: 'How many square feet of planting space is that?',
          choices: [C('25 square feet', 1), C('20 feet', 'perimeter-area-mixup'), C('10 square feet', 'additive-for-multiplicative')],
          hint: '5 rows of 5 one-foot squares.',
          show: '5 × 5 = 25 square feet inside. 20 feet would be the fence around it — that is perimeter.'
        },
        {
          story: 'The same 5-by-5 bed needs a little fence around the outside.',
          q: 'How many feet of fence?',
          multiStep: 1,
          choices: [C('20 feet', 1), C('25 feet', 'perimeter-area-mixup'), C('10 feet', 'part-whole-mixup')],
          hint: 'Four sides, 5 feet each. Walk around the edge.',
          show: '5 × 4 = 20 feet of fence. Around the edge is perimeter; covering the inside is area. Two different jobs.'
        },
        {
          story: 'Chance plants seeds 1 foot apart in rows across the 25-square-foot bed, one seed per square foot.',
          q: 'How many seeds fit?',
          choices: [C('25 seeds', 1), C('20 seeds', 'perimeter-area-mixup'), C('5 seeds', 'part-whole-mixup')],
          hint: 'One per square foot, and you already know the area.',
          show: '25 squares, so 25 seeds. Area tells you how much fits INSIDE.'
        }
      ]
    },
    reading: {
      words: [
        W('dig', ['d', 'i', 'g'], ['d', 'i', 'g'], 'to make a hole'),
        W('gently', ['gen', 'tly'], ['jent', 'lee'], 'in a soft careful way'),
        W('space', ['sp', 'ace'], ['sp', 'ayss'], 'room between things')
      ],
      sentence: 'Dig gently and give each seed some space in the rich soil.',
      comp: {
        q: 'Why should you give each seed space?',
        choices: [
          C('So each one has room to grow', 1),
          C('So the soil stays rich', 'surface-feature'),
          C('So you can dig gently', 'sequence-error')
        ],
        hint: 'What happens to plants crowded on top of each other?',
        show: 'Room to grow. Crowded roots fight each other for water and food.'
      }
    }
  }

  ]);
})();
