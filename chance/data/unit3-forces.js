/* ============================================================
   UNIT 3 — FORCES & MACHINES (days 41-60)
   This is the engineering unit. Every lesson is something he can
   build or test with stuff from the garage: a ramp, a lever, a
   pulley, a paper bridge, a boat, a catapult. The last week runs
   the real design cycle — build, test, measure, fix — and closes
   with a capstone that pulls all three units together.
   ============================================================ */
(function () {
  var C = Curriculum.C, W = Curriculum.W;

  Curriculum.addDays(3, [

  /* ---------------- WEEK 9 · Push, Pull and Friction ---------------- */
  {
    icon: '💪', title: 'Every Force Has a Direction',
    discover: {
      intro: [
        'A force is a push or a pull, and it always points somewhere.',
        'When two forces point opposite ways and match in strength, they cancel out and nothing moves.',
        'That is why a heavy box can sit still with gravity pulling down on it — the floor is pushing up just as hard.'
      ],
      word: { w: 'force', say: 'forss', mean: 'a push or a pull on something' },
      check: {
        q: 'A book is sitting still on a table. What forces are on it?',
        choices: [
          C('Gravity pulling down and the table pushing up, evenly matched', 1),
          C('No forces at all, since it is not moving', 'literal-appearance'),
          C('Only gravity, pulling down', 'ignored-condition')
        ],
        hint: 'If only gravity were acting, what would the book be doing right now?',
        show: 'Two balanced forces. Not moving does not mean no forces — it means the forces cancel.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Chance pulls a wagon with 10 pounds of force. Grandpa pulls the other way with 10 pounds.',
          q: 'What happens to the wagon?',
          choices: [C('It stays still — the pulls cancel', 1), C('It moves toward Chance', 'guess-plausible'), C('It moves 20 pounds worth', 'additive-for-multiplicative')],
          hint: 'Equal pulls in opposite directions. Which way could it possibly go?',
          show: '10 against 10 cancels to zero. Direction matters as much as size with forces.'
        },
        {
          story: 'Now Chance pulls with 10 pounds and Grandpa pulls the other way with 6 pounds.',
          q: 'How much force is left over, and which way?',
          multiStep: 1,
          choices: [C('4 pounds toward Chance', 1), C('16 pounds toward Chance', 'additive-for-multiplicative'), C('4 pounds toward Grandpa', 'reversed-relation')],
          hint: 'Take the smaller pull away from the bigger pull. The winner is the bigger one.',
          show: '10 − 6 = 4 pounds, and it goes toward the stronger pull — Chance.'
        },
        {
          story: 'Four kids each pull a rope with 5 pounds of force, all in the same direction.',
          q: 'How much total force?',
          choices: [C('20 pounds', 1), C('9 pounds', 'additive-for-multiplicative'), C('5 pounds', 'surface-feature')],
          hint: '4 kids, 5 pounds each, all pointing the same way.',
          show: '5 × 4 = 20 pounds. Forces in the same direction add up.'
        }
      ]
    },
    reading: {
      words: [
        W('strong', ['str', 'o', 'ng'], ['str', 'aw', 'ng'], 'powerful'),
        W('string', ['str', 'i', 'ng'], ['str', 'ih', 'ng'], 'thin cord'),
        W('stretch', ['str', 'e', 'tch'], ['str', 'eh', 'ch'], 'to pull longer')
      ],
      sentence: 'A strong pull will stretch the string until it is straight.',
      comp: {
        q: 'What makes the string straight?',
        choices: [C('A strong pull', 1), C('The string being long', 'surface-feature'), C('Letting it go loose', 'reversed-relation')],
        hint: 'Find what is doing the stretching.',
        show: 'The pull straightens it. Let go and it goes slack — no force, no stretch.'
      }
    }
  },

  {
    icon: '🛷', title: 'Friction Slows Things Down',
    discover: {
      intro: [
        'When two surfaces rub, they grab at each other and slow each other down. That grabbing is friction.',
        'Rough surfaces make lots of friction. Smooth and wet ones make very little.',
        'Friction is not the enemy — without it your shoes would not grip and your bike brakes would do nothing.'
      ],
      word: { w: 'friction', say: 'FRIK-shun', mean: 'the grabbing force between two rubbing surfaces' },
      check: {
        q: 'A sled flies down a snowy hill but barely moves on grass. Why?',
        choices: [
          C('Grass has much more friction than snow', 1),
          C('Snow is steeper than grass', 'surface-feature'),
          C('The sled is heavier on grass', 'guess-plausible')
        ],
        hint: 'Same sled, same hill, same weight. So what is different about the surface?',
        show: 'Snow is slick — low friction. Grass grabs — high friction. Change the surface, change the ride.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'On ice a puck slides 20 feet. On carpet the same push sends it 4 feet.',
          q: 'How many times farther on ice?',
          multiStep: 1,
          choices: [C('5 times farther', 1), C('16 times farther', 'additive-for-multiplicative'), C('24 times farther', 'additive-for-multiplicative')],
          hint: 'How many 4-foot slides fit into 20 feet?',
          show: '20 ÷ 4 = 5 times farther. "How many times" is division; 16 feet is "how much farther."'
        },
        {
          story: 'A toy car rolls 12 feet on wood, 6 feet on carpet, and 3 feet on a towel.',
          q: 'Which surface has the MOST friction?',
          choices: [C('The towel — it stopped the car soonest', 1), C('The wood, because 12 is biggest', 'bigger-number-bias'), C('They all have the same friction', 'overgeneralize')],
          hint: 'More friction means the car stops sooner, so it travels a shorter distance.',
          show: 'Shortest distance means most friction. The biggest number here means the LEAST friction — careful.'
        },
        {
          story: 'A cart loses 2 miles per hour of speed every second because of friction. It starts at 10 miles per hour.',
          q: 'How fast is it after 3 seconds?',
          multiStep: 1,
          choices: [C('4 miles per hour', 1), C('6 miles per hour', 'off-by-one'), C('16 miles per hour', 'reversed-relation')],
          hint: 'It loses 2 × 3 = 6. Take that off of 10.',
          show: '2 × 3 = 6 lost. 10 − 6 = 4 miles per hour. Friction subtracts speed the whole time it acts.'
        }
      ]
    },
    reading: {
      words: [
        W('scrape', ['scr', 'ape'], ['skr', 'ayp'], 'to rub roughly'),
        W('scratch', ['scr', 'a', 'tch'], ['skr', 'a', 'ch'], 'to scrape a line into something'),
        W('splash', ['spl', 'a', 'sh'], ['spl', 'a', 'sh'], 'water thrown up')
      ],
      sentence: 'The sled will scrape and scratch the dirt, then stop with a splash.',
      comp: {
        q: 'What makes the sled stop on dirt?',
        choices: [C('Rubbing against the ground', 1), C('The splash', 'sequence-error'), C('Going downhill', 'reversed-relation')],
        hint: 'Scrape and scratch are both rubbing words. What force is that?',
        show: 'Friction from the rubbing. The splash happened after it stopped, not the reason it stopped.'
      }
    }
  },

  {
    icon: '⛰️', title: 'A Ramp Makes Work Easier',
    discover: {
      intro: [
        'Lifting a heavy box straight up is hard. Pushing it up a ramp is much easier.',
        'The ramp does not make the box lighter. It spreads the same work over a longer distance, so you need less force at any moment.',
        'That is the trade every machine makes: less force, more distance.'
      ],
      word: { w: 'ramp', say: 'ramp', mean: 'a slanted surface that makes lifting easier' },
      check: {
        q: 'Chance pushes a barrel up a long gentle ramp instead of lifting it. What did the ramp change?',
        choices: [
          C('How hard he has to push at any moment', 1),
          C('How heavy the barrel is', 'literal-appearance'),
          C('Nothing — it just looks easier', 'guess-plausible')
        ],
        hint: 'Weigh the barrel at the top of the ramp. Did it lose weight on the way up?',
        show: 'The push got easier; the barrel weighs the same. He traded a hard short lift for an easy long push.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Lifting a box straight up 2 feet needs 20 pounds of force. A ramp 4 feet long to the same height needs only 10 pounds.',
          q: 'What did the ramp trade away?',
          choices: [
            C('Distance — you push farther but easier', 1),
            C('Weight — the box got lighter', 'literal-appearance'),
            C('Nothing, you get it for free', 'overgeneralize')
          ],
          hint: 'Compare the numbers: half the force, but twice the distance.',
          show: 'Half the force over twice the distance. Machines trade; they never give something for nothing.'
        },
        {
          story: 'A ramp is 6 feet long and rises 2 feet.',
          q: 'How much longer is the ramp than the height it climbs?',
          choices: [C('4 feet longer', 1), C('8 feet longer', 'additive-for-multiplicative'), C('3 feet longer', 'part-whole-mixup')],
          hint: 'The gap between 6 and 2.',
          show: '6 − 2 = 4 feet longer. That extra length is what buys you the easier push.'
        },
        {
          story: 'Chance pushes 5 barrels up the ramp. Each one takes 10 pushes.',
          q: 'How many pushes altogether?',
          choices: [C('50 pushes', 1), C('15 pushes', 'additive-for-multiplicative'), C('10 pushes', 'surface-feature')],
          hint: '10 pushes each, 5 barrels.',
          show: '10 × 5 = 50 pushes.'
        }
      ]
    },
    reading: {
      words: [
        W('straight', ['str', 'aigh', 't'], ['str', 'ay', 't'], 'not bent or curved'),
        W('screw', ['scr', 'ew'], ['skr', 'ooo'], 'a spiral fastener'),
        W('spring', ['spr', 'i', 'ng'], ['spr', 'ih', 'ng'], 'a coil that pushes back')
      ],
      sentence: 'Push the screw in straight, and the spring will hold the ramp up.',
      comp: {
        q: 'What holds the ramp up?',
        choices: [C('The spring', 1), C('The screw', 'surface-feature'), C('Chance', 'guess-plausible')],
        hint: 'Read the second half of the sentence.',
        show: 'The spring holds it. The screw goes in straight — that is a different job in the same sentence.'
      }
    }
  },

  {
    icon: '🚗', title: 'Moving Things Do Not Want to Stop',
    discover: {
      intro: [
        'A moving object keeps moving in a straight line until some force stops it. That stubbornness is called inertia.',
        'Heavier and faster things have more of it, so they need more force and more distance to stop.',
        'That is why a loaded truck takes far longer to stop than a bicycle, even with great brakes.'
      ],
      word: { w: 'inertia', say: 'in-UR-shuh', mean: 'the tendency of things to keep doing what they are doing' },
      check: {
        q: 'Why do you slide forward when a car brakes hard?',
        choices: [
          C('Your body was moving and keeps moving until the belt stops it', 1),
          C('The car pushes you forward', 'reversed-relation'),
          C('Braking creates a forward force', 'guess-plausible')
        ],
        hint: 'The car slowed down. Did anything slow YOU down?',
        show: 'You keep going at the old speed until something catches you. That something is the seat belt.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'A bike going 10 miles an hour stops in 5 feet. Going 20 miles an hour it takes 20 feet.',
          q: 'Doubling the speed did what to the stopping distance?',
          multiStep: 1,
          choices: [C('Made it 4 times longer', 1), C('Doubled it', 'guess-plausible'), C('Added 15 feet, so it doubled', 'additive-for-multiplicative')],
          hint: 'How many 5-foot pieces are in 20 feet?',
          show: '20 ÷ 5 = 4 times longer. Double the speed, quadruple the stopping distance. This is why speed limits exist.'
        },
        {
          story: 'A truck needs 3 seconds to stop. It is going 30 feet every second.',
          q: 'How far does it travel while stopping?',
          multiStep: 1,
          choices: [C('90 feet', 1), C('33 feet', 'additive-for-multiplicative'), C('10 feet', 'reversed-relation')],
          hint: '30 feet each second, 3 seconds.',
          show: '30 × 3 = 90 feet — most of a football field, after the driver hits the brake.'
        },
        {
          story: 'Chance rolls a ball at 4 feet per second across a smooth floor.',
          q: 'Where is it after 7 seconds, if nothing stops it?',
          choices: [C('28 feet away', 1), C('11 feet away', 'additive-for-multiplicative'), C('4 feet away', 'surface-feature')],
          hint: '4 feet each second, 7 seconds.',
          show: '4 × 7 = 28 feet. With no friction it would just keep going forever — that is inertia.'
        }
      ]
    },
    reading: {
      words: [
        W('strap', ['str', 'a', 'p'], ['str', 'a', 'p'], 'a band that holds things'),
        W('street', ['str', 'ee', 't'], ['str', 'eee', 't'], 'a road in town'),
        W('spread', ['spr', 'ea', 'd'], ['spr', 'eh', 'd'], 'to open out wide')
      ],
      sentence: 'The strap kept him in his seat when the truck stopped in the street.',
      comp: {
        q: 'What did the strap do?',
        choices: [C('Kept him from sliding forward', 1), C('Stopped the truck', 'surface-feature'), C('Spread out', 'letter-look')],
        hint: 'The truck stopped itself. What did the strap stop?',
        show: 'The strap stopped HIM. Brakes stop the truck; belts stop the passengers.'
      }
    }
  },

  {
    icon: '⚖️', title: 'Balance and the Tipping Point',
    discover: {
      intro: [
        'Every object has one spot where its weight seems to be centered — its center of gravity.',
        'If that spot stays above the base it is standing on, the object stands. If it moves outside the base, it tips.',
        'That is why a wide low base is stable and a tall skinny one falls over.'
      ],
      word: { w: 'balance', say: 'BAL-unss', mean: 'when weight is spread so nothing tips' },
      check: {
        q: 'Chance builds two towers with the same blocks: one tall and skinny, one short and wide. Which tips easier?',
        choices: [
          C('The tall skinny one', 1),
          C('The short wide one, it has more blocks on the ground', 'reversed-relation'),
          C('Same — they weigh the same', 'ignored-condition')
        ],
        hint: 'You only need to lean a tall tower a tiny bit before its middle hangs off the edge of the base.',
        show: 'Tall and skinny tips first. Same weight, different base — shape decides stability, not weight.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'A seesaw balances when both sides match. Chance weighs 50 pounds and sits 4 feet from the middle.',
          q: 'His cousin weighs 100 pounds. How far from the middle should the cousin sit to balance?',
          multiStep: 1,
          choices: [C('2 feet', 1), C('8 feet', 'reversed-relation'), C('4 feet', 'guess-plausible')],
          hint: 'Twice the weight needs half the distance. 50 × 4 has to equal 100 × what?',
          show: '50 × 4 = 200. So 100 × 2 = 200. Heavier sits closer. That is a balanced equation — real algebra on a playground.'
        },
        {
          story: 'A balance scale has 12 ounces on the left and 7 ounces on the right.',
          q: 'How much do you add to the right to balance it?',
          choices: [C('5 ounces', 1), C('19 ounces', 'additive-for-multiplicative'), C('12 ounces', 'surface-feature')],
          hint: 'The gap between 12 and 7.',
          show: '12 − 7 = 5 ounces. Both sides must end up equal — that is what the = sign means.'
        },
        {
          story: 'Balance puzzle: 3 identical blocks on the left balance 12 ounces on the right.',
          q: 'How much does one block weigh?',
          multiStep: 1,
          choices: [C('4 ounces', 1), C('12 ounces', 'part-whole-mixup'), C('36 ounces', 'reversed-relation')],
          hint: 'Three equal blocks share the 12 ounces evenly.',
          show: '12 ÷ 3 = 4 ounces each. You just solved 3 × ? = 12, which is what algebra looks like in second grade.'
        }
      ]
    },
    reading: {
      words: [
        W('stack', ['st', 'a', 'ck'], ['st', 'a', 'k'], 'a pile'),
        W('splint', ['spl', 'i', 'nt'], ['spl', 'ih', 'nt'], 'a stiff strip that supports something'),
        W('strap', ['str', 'a', 'p'], ['str', 'a', 'p'], 'a holding band')
      ],
      sentence: 'He put a splint and a strap on the tall stack so it would not tip.',
      comp: {
        q: 'Why did he add the splint and strap?',
        choices: [C('To keep the stack from tipping', 1), C('To make it taller', 'reversed-relation'), C('Because the stack was heavy', 'guess-plausible')],
        hint: 'Read the very end: "so it would not…"',
        show: '"So it would not tip." The word "so" always points at the reason.'
      }
    }
  },

  /* ---------------- WEEK 10 · Simple Machines ---------------- */
  {
    icon: '🪝', title: 'The Lever: A Little Push, A Big Lift',
    discover: {
      intro: [
        'A lever is a stiff bar resting on a pivot point called a fulcrum.',
        'Push down far from the fulcrum, and you can lift something heavy that is close to it.',
        'A crowbar, a seesaw, a wheelbarrow, a bottle opener and your own forearm are all levers.'
      ],
      word: { w: 'fulcrum', say: 'FULL-krum', mean: 'the pivot point a lever turns on' },
      check: {
        q: 'Chance is prying up a rock with a bar. Where should he put the fulcrum for the easiest lift?',
        choices: [
          C('Close to the rock, so his end of the bar is long', 1),
          C('Close to his hands, so he is near the work', 'reversed-relation'),
          C('Exactly in the middle every time', 'overgeneralize')
        ],
        hint: 'Long side for your hands, short side for the load. Try it with a spoon and a book.',
        show: 'Fulcrum near the load. The longer your side, the less force you need — and the farther you have to push.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Chance pushes down with 10 pounds on the long end of a lever and lifts a 30-pound rock.',
          q: 'How many times stronger did the lever make him?',
          multiStep: 1,
          choices: [C('3 times stronger', 1), C('20 times stronger', 'additive-for-multiplicative'), C('40 times stronger', 'additive-for-multiplicative')],
          hint: 'How many 10-pound pushes fit into 30 pounds of lifting?',
          show: '30 ÷ 10 = 3 times. A lever multiplies your force by trading distance for it.'
        },
        {
          story: 'A lever gives 3 times the force. Chance pushes with 15 pounds.',
          q: 'How heavy a load can he lift?',
          choices: [C('45 pounds', 1), C('18 pounds', 'additive-for-multiplicative'), C('5 pounds', 'reversed-relation')],
          hint: '3 times as much as 15.',
          show: '15 × 3 = 45 pounds. Same rule, new number — that is a function machine again.'
        },
        {
          story: 'To lift the rock 1 inch, Chance has to push his end down 3 inches.',
          q: 'How far must he push to lift it 4 inches?',
          multiStep: 1,
          choices: [C('12 inches', 1), C('7 inches', 'additive-for-multiplicative'), C('4 inches', 'ignored-condition')],
          hint: '3 inches of push for every 1 inch of lift, and he wants 4 inches of lift.',
          show: '3 × 4 = 12 inches. There is the trade: three times the force, three times the distance.'
        }
      ]
    },
    reading: {
      words: [
        W('lever', ['le', 'ver'], ['lee', 'ver'], 'a bar that lifts on a pivot'),
        W('handle', ['han', 'dle'], ['han', 'dul'], 'the part you hold'),
        W('little', ['lit', 'tle'], ['lit', 'ul'], 'small')
      ],
      sentence: 'A little pull on the handle of the lever can lift a heavy load.',
      comp: {
        q: 'What can a little pull do?',
        choices: [C('Lift something heavy', 1), C('Make the handle bigger', 'surface-feature'), C('Nothing much, it is little', 'literal-appearance')],
        hint: 'Read to the end of the sentence.',
        show: 'A little pull lifts a heavy load — that is the whole magic of the lever.'
      }
    }
  },

  {
    icon: '⚙️', title: 'Wheels and Gears',
    discover: {
      intro: [
        'A wheel beats dragging because it rolls instead of scraping, so there is far less friction.',
        'Gears are wheels with teeth. When one turns, it turns the next one the opposite way.',
        'A small gear driving a big gear turns slower but pushes harder. A big gear driving a small one goes faster.'
      ],
      word: { w: 'gear', say: 'geer', mean: 'a wheel with teeth that turns another wheel' },
      check: {
        q: 'Chance turns a small gear that is connected to a big gear. What does the big gear do?',
        choices: [
          C('Turns slower than the small one, but with more force', 1),
          C('Turns faster, because it is bigger', 'bigger-number-bias'),
          C('Turns at exactly the same speed', 'overgeneralize')
        ],
        hint: 'The big gear has more teeth to get through for each full turn.',
        show: 'Big gear: slower, stronger. Small gear: faster, weaker. Bikes let you pick which trade you want.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'A small gear has 5 teeth. A big gear has 20 teeth.',
          q: 'How many times does the small gear spin for one full turn of the big gear?',
          multiStep: 1,
          choices: [C('4 times', 1), C('15 times', 'additive-for-multiplicative'), C('25 times', 'additive-for-multiplicative')],
          hint: 'How many 5-tooth gears fit around a 20-tooth gear?',
          show: '20 ÷ 5 = 4 spins. That ratio, 4 to 1, is what "gearing" means.'
        },
        {
          story: 'The small gear spins 4 times for each turn of the big gear.',
          q: 'The big gear turns 3 times. How many times did the small gear spin?',
          choices: [C('12 times', 1), C('7 times', 'additive-for-multiplicative'), C('4 times', 'surface-feature')],
          hint: '4 spins for each of the 3 big turns.',
          show: '4 × 3 = 12 spins.'
        },
        {
          story: 'A bike wheel goes 6 feet forward with each full turn.',
          q: 'How far after 9 turns?',
          choices: [C('54 feet', 1), C('15 feet', 'additive-for-multiplicative'), C('6 feet', 'surface-feature')],
          hint: '6 feet for each of the 9 turns.',
          show: '6 × 9 = 54 feet. Counting wheel turns is how a bike computer measures distance.'
        }
      ]
    },
    reading: {
      words: [
        W('rudder', ['rud', 'der'], ['rud', 'er'], 'the flap that steers a boat'),
        W('circle', ['cir', 'cle'], ['sur', 'kul'], 'a round shape'),
        W('middle', ['mid', 'dle'], ['mid', 'ul'], 'the center')
      ],
      sentence: 'The gear turns in a circle around a pin in the middle.',
      comp: {
        q: 'Where is the pin?',
        choices: [C('In the middle of the gear', 1), C('On the outside teeth', 'surface-feature'), C('On the rudder', 'letter-look')],
        hint: 'Find the last two words.',
        show: 'In the middle. That center pin is the axle — the same idea as a lever\'s fulcrum.'
      }
    }
  },

  {
    icon: '🪢', title: 'Pulleys Change the Direction of Your Pull',
    discover: {
      intro: [
        'A pulley is a wheel with a groove for a rope. Pull down on one side, and the load goes up on the other.',
        'One fixed pulley does not make the load lighter — it just lets you pull down, which is easier for a body to do.',
        'Add more pulleys and you really do share the weight, so it takes less force but more rope.'
      ],
      word: { w: 'pulley', say: 'PULL-ee', mean: 'a grooved wheel that redirects a rope' },
      check: {
        q: 'A flagpole has one pulley at the top. Does it make the flag lighter to lift?',
        choices: [
          C('No — it just lets you pull down instead of climbing up', 1),
          C('Yes, one pulley cuts the weight in half', 'overgeneralize'),
          C('Yes, pulleys always make things lighter', 'overgeneralize')
        ],
        hint: 'Count how many rope sections are actually holding the flag. Just one.',
        show: 'One fixed pulley changes direction only. You need two or more supporting ropes to share the load.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'A pulley system with 2 supporting ropes cuts the force in half. The load is 40 pounds.',
          q: 'How hard must Chance pull?',
          choices: [C('20 pounds', 1), C('80 pounds', 'reversed-relation'), C('40 pounds', 'surface-feature')],
          hint: 'Half of 40.',
          show: '40 ÷ 2 = 20 pounds. Two ropes each carry half the load.'
        },
        {
          story: 'With 2 ropes sharing the load, Chance must pull 2 feet of rope for every 1 foot the load rises.',
          q: 'How much rope to raise it 5 feet?',
          multiStep: 1,
          choices: [C('10 feet of rope', 1), C('5 feet of rope', 'ignored-condition'), C('7 feet of rope', 'additive-for-multiplicative')],
          hint: '2 feet of rope for each 1 foot of lift, 5 feet of lift.',
          show: '2 × 5 = 10 feet of rope. Half the force, twice the rope. Machines always trade.'
        },
        {
          story: 'A 4-rope system cuts the force to one fourth. The load is 40 pounds.',
          q: 'How hard must he pull?',
          multiStep: 1,
          choices: [C('10 pounds', 1), C('4 pounds', 'surface-feature'), C('36 pounds', 'additive-for-multiplicative')],
          hint: 'One fourth of 40. Split 40 into 4 equal parts.',
          show: '40 ÷ 4 = 10 pounds. More ropes, less force, much more rope to pull.'
        }
      ]
    },
    reading: {
      words: [
        W('pulley', ['pul', 'ley'], ['pul', 'ee'], 'a rope wheel'),
        W('paddle', ['pad', 'dle'], ['pad', 'ul'], 'a flat blade for rowing'),
        W('over', ['o', 'ver'], ['oh', 'ver'], 'above or across')
      ],
      sentence: 'Run the rope over the pulley, then pull it down with a steady grip.',
      comp: {
        q: 'Which way do you pull the rope?',
        choices: [C('Down', 1), C('Up', 'reversed-relation'), C('Sideways', 'guess-plausible')],
        hint: 'Find the direction word after "pull it".',
        show: 'Down. The pulley flips your downward pull into an upward lift.'
      }
    }
  },

  {
    icon: '🔩', title: 'The Screw and the Wedge',
    discover: {
      intro: [
        'A wedge is a ramp you push into something — an axe, a knife, a nail point, a shovel blade.',
        'A screw is a ramp wrapped around a post. Each turn walks it a tiny bit deeper.',
        'Both take a small force spread over a long distance and turn it into a big force in a small place.'
      ],
      word: { w: 'wedge', say: 'wej', mean: 'a slanted blade that splits things apart' },
      check: {
        q: 'Why is a screw so much harder to pull out than a nail?',
        choices: [
          C('Its spiral ramp grips the wood the whole way around', 1),
          C('Screws are made of stronger metal', 'guess-plausible'),
          C('Screws are longer than nails', 'surface-feature')
        ],
        hint: 'Trace the thread with your finger. How much of it is touching wood?',
        show: 'The thread is a long ramp gripping wood along its whole length. A nail only has its smooth sides.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'A screw goes 2 millimeters deeper with every full turn.',
          q: 'How deep after 8 turns?',
          choices: [C('16 millimeters', 1), C('10 millimeters', 'additive-for-multiplicative'), C('4 millimeters', 'reversed-relation')],
          hint: '2 mm each turn, 8 turns.',
          show: '2 × 8 = 16 millimeters.'
        },
        {
          story: 'A screw sinks 2 millimeters per turn. The board is 20 millimeters thick.',
          q: 'How many turns to go all the way through?',
          multiStep: 1,
          choices: [C('10 turns', 1), C('40 turns', 'reversed-relation'), C('18 turns', 'additive-for-multiplicative')],
          hint: 'How many 2-millimeter turns fit in 20 millimeters?',
          show: '20 ÷ 2 = 10 turns. Total divided by rate gives the count — same math as filling a tub.'
        },
        {
          story: 'Chance drives 4 screws into each of 6 boards.',
          q: 'How many screws does he need?',
          choices: [C('24 screws', 1), C('10 screws', 'additive-for-multiplicative'), C('4 screws', 'surface-feature')],
          hint: '4 per board, 6 boards.',
          show: '4 × 6 = 24 screws.'
        }
      ]
    },
    reading: {
      words: [
        W('wedge', ['we', 'dge'], ['weh', 'j'], 'a splitting blade'),
        W('metal', ['me', 'tal'], ['meh', 'tul'], 'hard shiny material like iron'),
        W('sharper', ['sharp', 'er'], ['sharp', 'er'], 'more able to cut')
      ],
      sentence: 'A sharper metal wedge will split the log with a smaller push.',
      comp: {
        q: 'What does a sharper wedge let you do?',
        choices: [C('Split the log with less force', 1), C('Make the log bigger', 'surface-feature'), C('Push harder', 'reversed-relation')],
        hint: 'Read the last three words.',
        show: 'A smaller push does the same job. Sharp means the ramp is longer and thinner, so it trades more distance for more force.'
      }
    }
  },

  {
    icon: '🚲', title: 'A Bicycle Is Six Machines at Once',
    discover: {
      intro: [
        'Look closely at a bike: wheels and axles, gears, levers in the brakes and pedals, screws holding it together.',
        'The pedals are levers, the chain and sprockets are gears, the brake handles are levers pulling cables.',
        'Real machines are almost always simple machines stacked together.'
      ],
      word: { w: 'machine', say: 'muh-SHEEN', mean: 'a tool that changes how a force works' },
      check: {
        q: 'Chance shifts to an easier gear to climb a hill. What is he trading away?',
        choices: [
          C('Speed — he pedals more turns to go the same distance', 1),
          C('Nothing, easy gears are just better', 'overgeneralize'),
          C('Strength — his legs get weaker', 'guess-plausible')
        ],
        hint: 'Remember the rule for every machine: less force always costs more distance or more turns.',
        show: 'He trades speed for ease: more pedal turns, less push each turn. Same trade as the ramp and the pulley.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'In an easy gear Chance pedals 3 turns to move the bike 6 feet.',
          q: 'How far does the bike go for each pedal turn?',
          multiStep: 1,
          choices: [C('2 feet per turn', 1), C('18 feet per turn', 'reversed-relation'), C('3 feet per turn', 'surface-feature')],
          hint: 'Split 6 feet across 3 turns.',
          show: '6 ÷ 3 = 2 feet per turn.'
        },
        {
          story: 'In a hard gear the bike goes 8 feet per pedal turn.',
          q: 'How far in 7 turns?',
          choices: [C('56 feet', 1), C('15 feet', 'additive-for-multiplicative'), C('8 feet', 'surface-feature')],
          hint: '8 feet each turn, 7 turns.',
          show: '8 × 7 = 56 feet. Harder to push, but you cover a lot more ground per turn.'
        },
        {
          story: 'Chance rides 12 miles an hour. The lake is 6 miles away.',
          q: 'How long to get there?',
          multiStep: 1,
          choices: [C('Half an hour', 1), C('2 hours', 'reversed-relation'), C('6 hours', 'surface-feature')],
          hint: '12 miles would take a whole hour. He is only going half that far.',
          show: '6 is half of 12, so it takes half an hour — 30 minutes. Distance ÷ speed = time.'
        }
      ]
    },
    reading: {
      words: [
        W('pedal', ['pe', 'dal'], ['ped', 'ul'], 'the part your foot pushes'),
        W('handlebar', ['han', 'dle', 'bar'], ['han', 'dul', 'bar'], 'the steering bar'),
        W('faster', ['fast', 'er'], ['fast', 'er'], 'more quickly')
      ],
      sentence: 'Hold the handlebar and push the pedal harder to go faster.',
      comp: {
        q: 'What makes the bike go faster?',
        choices: [C('Pushing the pedal harder', 1), C('Holding the handlebar', 'surface-feature'), C('The gear being easy', 'reversed-relation')],
        hint: 'Two things happen in this sentence. Which one is about speed?',
        show: 'Pushing the pedal harder. The handlebar steers — a different job.'
      }
    }
  },

  /* ---------------- WEEK 11 · Magnets, Light and Sound ---------------- */
  {
    icon: '🧲', title: 'Magnets Push and Pull Without Touching',
    discover: {
      intro: [
        'A magnet has two ends, a north pole and a south pole, and an invisible field around it.',
        'Opposite poles pull together. Matching poles push apart, and you can feel that push through the air.',
        'Magnets only grab iron, steel, nickel and cobalt — not aluminum, not copper, not gold.'
      ],
      word: { w: 'magnetic', say: 'mag-NET-ik', mean: 'able to be pulled by a magnet' },
      check: {
        q: 'Chance holds two magnets close and feels them shove apart. Why?',
        choices: [
          C('He is holding matching poles together', 1),
          C('The magnets are broken', 'guess-plausible'),
          C('They do not like each other', 'animism')
        ],
        hint: 'Flip one magnet around and try again. What changes?',
        show: 'Matching poles repel. Flip one and they snap together — no feelings involved, just a rule.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'Chance tests 10 objects with a magnet. It sticks to 6 of them.',
          q: 'How many were not magnetic?',
          choices: [C('4 objects', 1), C('16 objects', 'additive-for-multiplicative'), C('6 objects', 'surface-feature')],
          hint: '10 in all, 6 stuck.',
          show: '10 − 6 = 4 not magnetic. Most metals in a kitchen drawer are not, which surprises people.'
        },
        {
          story: 'A magnet picks up a paperclip from 2 inches away. A magnet twice as strong reaches 4 inches.',
          q: 'What happens to the reach when the magnet gets stronger?',
          choices: [C('It reaches farther', 1), C('It reaches less far', 'reversed-relation'), C('The reach stays the same', 'overgeneralize')],
          hint: 'Compare the two numbers: 2 inches and 4 inches.',
          show: 'Stronger reaches farther. The field is still invisible, but you can measure it with a paperclip.'
        },
        {
          story: 'Chance lines up 3 magnets. Each one holds 5 paperclips.',
          q: 'How many paperclips in all?',
          choices: [C('15 paperclips', 1), C('8 paperclips', 'additive-for-multiplicative'), C('5 paperclips', 'surface-feature')],
          hint: '5 clips each, 3 magnets.',
          show: '5 × 3 = 15 paperclips.'
        }
      ]
    },
    reading: {
      words: [
        W('knot', ['kn', 'o', 't'], ['nnn', 'o', 't'], 'a tied lump in rope'),
        W('knee', ['kn', 'ee'], ['nnn', 'eee'], 'the joint in the middle of your leg'),
        W('wrench', ['wr', 'e', 'nch'], ['rrr', 'eh', 'nch'], 'a tool for turning bolts')
      ],
      sentence: 'He put the wrench on his knee and pulled the knot loose.',
      comp: {
        q: 'What did he pull loose?',
        choices: [C('The knot', 1), C('The wrench', 'surface-feature'), C('His knee', 'surface-feature')],
        hint: 'Read the last three words.',
        show: 'The knot. Notice that k and w go silent in knot, knee and wrench — you hear "not", "nee", "rench".'
      }
    }
  },

  {
    icon: '🔌', title: 'Electricity Needs a Complete Loop',
    discover: {
      intro: [
        'Electricity only flows if there is a full path out of the battery and all the way back into it. That loop is a circuit.',
        'Break the loop anywhere and everything stops instantly. A switch is just a nice way to break it on purpose.',
        'Metal wires let electricity through — they are conductors. Rubber and plastic block it — insulators.'
      ],
      word: { w: 'circuit', say: 'SUR-kit', mean: 'a complete loop that electricity can flow around' },
      check: {
        q: 'A bulb is wired to a battery with one wire loose. The bulb is dark. Why?',
        choices: [
          C('The loop is broken, so nothing can flow', 1),
          C('The battery ran out', 'guess-plausible'),
          C('The bulb needs more wires', 'surface-feature')
        ],
        hint: 'Follow the path with your finger. Can you get from the battery all the way back to the battery?',
        show: 'A break anywhere stops everything. Check your connections before you blame the battery.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'Each battery gives 2 units of push. Chance stacks 3 batteries in a row.',
          q: 'How much push in total?',
          choices: [C('6 units', 1), C('5 units', 'additive-for-multiplicative'), C('2 units', 'surface-feature')],
          hint: '2 units each, 3 batteries.',
          show: '2 × 3 = 6 units. Batteries in a line add their push together.'
        },
        {
          story: 'A bulb needs 6 units of push. Each battery gives 2 units.',
          q: 'How many batteries does he need?',
          multiStep: 1,
          choices: [C('3 batteries', 1), C('12 batteries', 'reversed-relation'), C('4 batteries', 'off-by-one')],
          hint: 'How many 2s make 6?',
          show: '6 ÷ 2 = 3 batteries. Working backwards from what you need is inverse thinking.'
        },
        {
          story: 'Chance builds 4 circuits. Each one uses 3 wires.',
          q: 'How many wires in all?',
          choices: [C('12 wires', 1), C('7 wires', 'additive-for-multiplicative'), C('3 wires', 'surface-feature')],
          hint: '3 wires each, 4 circuits.',
          show: '3 × 4 = 12 wires.'
        }
      ]
    },
    reading: {
      words: [
        W('wrap', ['wr', 'a', 'p'], ['rrr', 'a', 'p'], 'to wind around'),
        W('know', ['kn', 'ow'], ['nnn', 'oh'], 'to have something in your mind'),
        W('phone', ['ph', 'one'], ['fff', 'ohn'], 'a thing you talk into')
      ],
      sentence: 'Wrap the wire and you will know why the phone lights up.',
      comp: {
        q: 'What do you do to the wire?',
        choices: [C('Wrap it', 1), C('Cut it', 'guess-plausible'), C('Know it', 'letter-look')],
        hint: 'Find the very first word.',
        show: 'Wrap. The w is silent in wrap and the k is silent in know — and ph says "fff" in phone.'
      }
    }
  },

  {
    icon: '💡', title: 'Light Travels in Straight Lines',
    discover: {
      intro: [
        'Light goes perfectly straight until it hits something. That is why a flashlight beam is a straight line.',
        'Block it and you get a shadow with a sharp edge shaped like whatever blocked it.',
        'Mirrors bounce light at a matching angle. That bouncing is called reflection.'
      ],
      word: { w: 'reflect', say: 'ree-FLEKT', mean: 'to bounce light off a surface' },
      check: {
        q: 'Why can you not see around a corner without a mirror?',
        choices: [
          C('Light only travels straight, so it cannot bend around the wall', 1),
          C('The corner is too dark', 'guess-plausible'),
          C('Your eyes are not strong enough', 'guess-plausible')
        ],
        hint: 'Point a flashlight at a wall. Does the beam curve around it?',
        show: 'Light will not bend around a corner. A mirror works because it bounces the straight line into a new straight line.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'A flashlight shines straight at a mirror and bounces off at the same angle.',
          q: 'The light comes in at 45 degrees. What angle does it leave at?',
          choices: [C('45 degrees', 1), C('90 degrees', 'guess-plausible'), C('180 degrees', 'bigger-number-bias')],
          hint: 'The rule is: the angle in equals the angle out.',
          show: 'In at 45, out at 45. That equal-angle rule is how periscopes and mirror mazes work.'
        },
        {
          story: 'Chance stands 3 feet from a mirror.',
          q: 'How far away does his reflection look?',
          multiStep: 1,
          choices: [C('3 feet behind the mirror, so 6 feet from him', 1), C('3 feet from him', 'part-whole-mixup'), C('Right on the glass', 'literal-appearance')],
          hint: 'The image sits as far behind the glass as you are in front of it. Then add both parts.',
          show: '3 feet to the mirror + 3 feet behind it = 6 feet of total distance. Two parts make the whole.'
        },
        {
          story: 'A shadow puppet is 4 inches tall. Moving the light closer doubles the shadow\'s size.',
          q: 'How tall is the shadow now?',
          choices: [C('8 inches', 1), C('6 inches', 'additive-for-multiplicative'), C('2 inches', 'reversed-relation')],
          hint: 'Double 4.',
          show: '4 × 2 = 8 inches. Closer light means the beam spreads more, so the shadow grows.'
        }
      ]
    },
    reading: {
      words: [
        W('knock', ['kn', 'o', 'ck'], ['nnn', 'o', 'k'], 'to hit and make a sound'),
        W('write', ['wr', 'ite'], ['rrr', 'ite'], 'to make letters'),
        W('graph', ['gr', 'a', 'ph'], ['gr', 'a', 'fff'], 'a picture that shows numbers')
      ],
      sentence: 'Write what you see on the graph, then knock on the door when you finish.',
      comp: {
        q: 'What should you do first?',
        choices: [C('Write on the graph', 1), C('Knock on the door', 'sequence-error'), C('Open the door', 'guess-plausible')],
        hint: 'Look for the word "then" — everything before it comes first.',
        show: 'Write first, then knock. "Then" is a time-order word, and order matters.'
      }
    }
  },

  {
    icon: '🔊', title: 'Sound Is a Shiver in the Air',
    discover: {
      intro: [
        'Sound happens when something vibrates and shakes the air around it in waves.',
        'Those waves reach your ear, shake your eardrum, and your brain turns the shaking into sound.',
        'Faster shaking makes a higher pitch. Bigger shaking makes a louder sound.'
      ],
      word: { w: 'vibrate', say: 'VYE-brayt', mean: 'to shake back and forth very fast' },
      check: {
        q: 'A guitar string is plucked hard, then softly. What changed?',
        choices: [
          C('How big the shaking is — the loudness', 1),
          C('The pitch got higher', 'surface-feature'),
          C('The string got longer', 'guess-plausible')
        ],
        hint: 'Same string, same length, so the pitch is the same. What is different about the shaking?',
        show: 'Bigger shake means louder, not higher. Pitch changes when you change the string\'s length or tightness.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'Sound travels about 1 mile every 5 seconds. Light is nearly instant.',
          q: 'Chance sees lightning and hears thunder 15 seconds later. How far away is the storm?',
          multiStep: 1,
          choices: [C('3 miles', 1), C('15 miles', 'surface-feature'), C('75 miles', 'additive-for-multiplicative')],
          hint: 'How many 5-second chunks are in 15 seconds? One mile per chunk.',
          show: '15 ÷ 5 = 3 miles. You have a storm-distance calculator built into your own ears.'
        },
        {
          story: 'The last count was 15 seconds. The next flash gives a count of 10 seconds.',
          q: 'Is the storm coming closer or moving away?',
          multiStep: 1,
          choices: [C('Closer — a shorter count means less distance', 1), C('Away, because 10 is smaller', 'reversed-relation'), C('You cannot tell', 'ignored-condition')],
          hint: '15 seconds was 3 miles. What is 10 seconds worth? Compare them.',
          show: '10 ÷ 5 = 2 miles, down from 3. Shrinking count means the storm is closing in — time to head home.'
        },
        {
          story: 'A string vibrates 200 times a second.',
          q: 'How many vibrations in 3 seconds?',
          choices: [C('600 vibrations', 1), C('203 vibrations', 'additive-for-multiplicative'), C('67 vibrations', 'reversed-relation')],
          hint: '200 each second, 3 seconds. Think 2 × 3, then add the zeros.',
          show: '200 × 3 = 600 vibrations.'
        }
      ]
    },
    reading: {
      words: [
        W('knew', ['kn', 'ew'], ['nnn', 'ooo'], 'understood in the past'),
        W('wrong', ['wr', 'o', 'ng'], ['rrr', 'aw', 'ng'], 'not correct'),
        W('photo', ['pho', 'to'], ['foh', 'toh'], 'a picture from a camera')
      ],
      sentence: 'He knew the photo was wrong when he heard the sound again.',
      comp: {
        q: 'What told him the photo was wrong?',
        choices: [C('Hearing the sound again', 1), C('Looking at the photo', 'surface-feature'), C('Knowing it already', 'letter-look')],
        hint: 'Find the word "when" and read what comes after it.',
        show: 'The sound told him. Notice the silent letters: knew sounds like "new", wrong sounds like "rong".'
      }
    }
  },

  {
    icon: '🌈', title: 'White Light Is Every Color at Once',
    discover: {
      intro: [
        'Sunlight looks white, but it is really every color mixed together.',
        'A prism or a raindrop bends each color by a slightly different amount, so they fan out and separate.',
        'That is a rainbow: sunlight sorted into its colors by millions of raindrops.'
      ],
      word: { w: 'prism', say: 'PRIZ-um', mean: 'clear glass that splits light into colors' },
      check: {
        q: 'Where do the colors in a rainbow come from?',
        choices: [
          C('They were already inside the sunlight, just mixed together', 1),
          C('The raindrops are colored', 'literal-appearance'),
          C('The sky paints them on', 'animism')
        ],
        hint: 'A glass prism makes a rainbow with no rain at all. So what is doing the coloring?',
        show: 'The colors were in the light all along. Water just sorts them out — same as a prism.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'A rainbow has 7 named colors: red, orange, yellow, green, blue, indigo, violet.',
          q: 'Chance draws 4 rainbows. How many color stripes does he draw?',
          choices: [C('28 stripes', 1), C('11 stripes', 'additive-for-multiplicative'), C('7 stripes', 'surface-feature')],
          hint: '7 colors in each of the 4 rainbows.',
          show: '7 × 4 = 28 stripes.'
        },
        {
          story: 'Red is always on the outside of a rainbow and violet on the inside.',
          q: 'Green is the 4th color from the outside. Which color is 3rd?',
          multiStep: 1,
          choices: [C('Yellow', 1), C('Blue', 'reversed-relation'), C('Red', 'sequence-error')],
          hint: 'Count from the outside: red, orange, yellow, green…',
          show: 'Red 1, orange 2, yellow 3, green 4. Counting in order carefully is the whole trick.'
        },
        {
          story: 'A rainbow always makes the same shape: a piece of a circle.',
          q: 'A full circle is 360 degrees. A rainbow arc is about half of one. How many degrees?',
          choices: [C('180 degrees', 1), C('90 degrees', 'part-whole-mixup'), C('360 degrees', 'part-whole-mixup')],
          hint: 'Half of 360.',
          show: '360 ÷ 2 = 180 degrees. From an airplane you can sometimes see the whole circle.'
        }
      ]
    },
    reading: {
      words: [
        W('knife', ['kn', 'ife'], ['nnn', 'ife'], 'a cutting tool'),
        W('wrist', ['wr', 'i', 'st'], ['rrr', 'ih', 'st'], 'the joint at your hand'),
        W('phase', ['ph', 'ase'], ['fff', 'ayz'], 'a stage of change')
      ],
      sentence: 'He turned his wrist and the knife caught the light in a bright phase.',
      comp: {
        q: 'What caught the light?',
        choices: [C('The knife', 1), C('His wrist', 'surface-feature'), C('The phase', 'letter-look')],
        hint: 'Find what comes right before "caught the light".',
        show: 'The knife caught it. Silent-letter check: knife is "nife", wrist is "rist", phase starts with an f sound.'
      }
    }
  },

  /* ---------------- WEEK 12 · Design and Build ---------------- */
  {
    icon: '🌉', title: 'Bridges: Shape Beats Strength',
    discover: {
      intro: [
        'A flat piece of paper sags under a penny. Fold it into a zigzag and it will hold a stack of them.',
        'Nothing was added — the shape changed, and shape decides where the force goes.',
        'Triangles are the strongest shape because you cannot squash a triangle without breaking a side.'
      ],
      word: { w: 'support', say: 'suh-PORT', mean: 'to hold a weight up' },
      check: {
        q: 'Why do bridges have triangles all over them?',
        choices: [
          C('A triangle cannot change shape unless a side breaks', 1),
          C('Triangles look nice', 'surface-feature'),
          C('Triangles are lighter than squares', 'guess-plausible')
        ],
        hint: 'Make a square out of four straws and push a corner. Now try it with a triangle.',
        show: 'A square folds over; a triangle does not budge. That rigidity is why every truss bridge is full of them.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'Chance builds a truss out of triangles. Each triangle needs 3 straws.',
          q: 'How many straws for 6 triangles?',
          choices: [C('18 straws', 1), C('9 straws', 'additive-for-multiplicative'), C('6 straws', 'surface-feature')],
          hint: '3 straws each, 6 triangles.',
          show: '3 × 6 = 18 straws (real trusses share sides, so they use even fewer).'
        },
        {
          story: 'Flat paper holds 2 pennies. Folded into a zigzag it holds 20.',
          q: 'How many times stronger is the folded shape?',
          multiStep: 1,
          choices: [C('10 times stronger', 1), C('18 times stronger', 'additive-for-multiplicative'), C('22 times stronger', 'additive-for-multiplicative')],
          hint: 'How many 2s fit into 20?',
          show: '20 ÷ 2 = 10 times stronger — from folding, not from adding material.'
        },
        {
          story: 'A bridge deck is 3 feet long and 2 feet wide.',
          q: 'How much surface can he drive toy trucks on?',
          choices: [C('6 square feet', 1), C('10 feet around', 'perimeter-area-mixup'), C('5 square feet', 'additive-for-multiplicative')],
          hint: 'Length times width.',
          show: '3 × 2 = 6 square feet of deck.'
        }
      ]
    },
    reading: {
      words: [
        W('footbridge', ['foot', 'bridge'], ['foot', 'brij'], 'a small bridge for walking'),
        W('sunlight', ['sun', 'light'], ['sun', 'lite'], 'light from the sun'),
        W('riverbank', ['ri', 'ver', 'bank'], ['riv', 'er', 'bank'], 'the edge of a river')
      ],
      sentence: 'The footbridge across the riverbank shines in the sunlight.',
      comp: {
        q: '"Footbridge" is two small words stuck together. What are they?',
        choices: [C('foot and bridge', 1), C('food and bridge', 'vowel-swap'), C('foot and ridge', 'letter-look')],
        hint: 'Cover half the word with your finger, then the other half.',
        show: 'foot + bridge. Splitting a compound word into its two parts makes a long word easy.'
      }
    }
  },

  {
    icon: '⛵', title: 'Boats: Shape Beats Weight',
    discover: {
      intro: [
        'A lump of clay sinks. Flatten the same clay into a bowl shape and it floats.',
        'The bowl pushes aside much more water, and the water pushes back up harder.',
        'That is how a steel ship floats: it is shaped so it shoves aside more water than it weighs.'
      ],
      word: { w: 'hull', say: 'hull', mean: 'the body of a boat that sits in the water' },
      check: {
        q: 'Chance\'s clay ball sinks. He wants it to float without removing any clay. What should he do?',
        choices: [
          C('Shape it into a wide bowl so it pushes aside more water', 1),
          C('Squeeze it tighter and smaller', 'reversed-relation'),
          C('Nothing can be done — clay always sinks', 'overgeneralize')
        ],
        hint: 'Same clay, different shape. Which shape shoves more water out of the way?',
        show: 'Spread it wide. Same weight, more water pushed aside, more upward push. Shape is the whole answer.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'A boat weighs 6 pounds. To float, it must push aside at least 6 pounds of water.',
          q: 'Chance adds 4 pounds of cargo. How much water must it push aside now?',
          multiStep: 1,
          choices: [C('10 pounds', 1), C('6 pounds', 'ignored-condition'), C('24 pounds', 'additive-for-multiplicative')],
          hint: 'Add the cargo to the boat, then match that total.',
          show: '6 + 4 = 10 pounds of water. Load a boat and it settles deeper — that is it finding new balance.'
        },
        {
          story: 'A boat can carry 12 pounds safely. Each rock Chance loads weighs 3 pounds.',
          q: 'How many rocks can he load?',
          multiStep: 1,
          choices: [C('4 rocks', 1), C('36 rocks', 'reversed-relation'), C('9 rocks', 'additive-for-multiplicative')],
          hint: 'How many 3-pound rocks fit in a 12-pound limit?',
          show: '12 ÷ 3 = 4 rocks. A fifth rock sinks the boat — limits matter in engineering.'
        },
        {
          story: 'Chance races 2 boat designs. The wide one crosses in 8 seconds, the narrow one in 5.',
          q: 'How much faster is the narrow one?',
          choices: [C('3 seconds faster', 1), C('13 seconds faster', 'additive-for-multiplicative'), C('5 seconds faster', 'surface-feature')],
          hint: 'The gap between 8 and 5.',
          show: '8 − 5 = 3 seconds faster. Narrow hulls cut water better; wide hulls carry more. Every design trades.'
        }
      ]
    },
    reading: {
      words: [
        W('sailboat', ['sail', 'boat'], ['sayl', 'boht'], 'a boat pushed by wind'),
        W('driftwood', ['drift', 'wood'], ['drift', 'wood'], 'wood floating in water'),
        W('downstream', ['down', 'stream'], ['down', 'streem'], 'the way the water flows')
      ],
      sentence: 'The sailboat and the driftwood both moved downstream in the wind.',
      comp: {
        q: 'Which way did they move?',
        choices: [C('Downstream', 1), C('Upstream', 'reversed-relation'), C('Into the wind', 'surface-feature')],
        hint: 'Split "downstream" into its two words.',
        show: 'Down + stream = the way the water goes. Compound words tell you their own meaning if you split them.'
      }
    }
  },

  {
    icon: '🏹', title: 'Catapults Store Energy and Let It Go',
    discover: {
      intro: [
        'When you bend a stick or stretch a rubber band you store energy in it. That stored energy is potential energy.',
        'Let go, and it turns into motion energy all at once and throws whatever is loaded.',
        'Pull back farther and you store more energy, so the shot flies farther.'
      ],
      word: { w: 'energy', say: 'EN-ur-jee', mean: 'the ability to make something move or change' },
      check: {
        q: 'Where does the energy in a launched catapult ball come from?',
        choices: [
          C('From Chance\'s arm, stored in the bent arm of the catapult', 1),
          C('The catapult makes new energy', 'guess-plausible'),
          C('The ball has energy inside it already', 'animism')
        ],
        hint: 'Nothing moves until somebody pulls it back. Who did the work?',
        show: 'He put the energy in when he pulled it back. Machines store and redirect energy — they never create it.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Pulled back 2 inches, the catapult throws 10 feet. Pulled back 4 inches, it throws 20 feet.',
          q: 'How far at 6 inches of pull?',
          multiStep: 1,
          choices: [C('About 30 feet', 1), C('About 22 feet', 'additive-for-multiplicative'), C('About 40 feet', 'off-by-one')],
          hint: 'Every 2 inches of pull adds 10 feet of distance. Keep the pattern going.',
          show: '2 in = 10 ft, 4 in = 20 ft, 6 in = 30 ft. Spotting a pattern and extending it is exactly what scientists do with data.'
        },
        {
          story: 'Chance takes 5 shots at each of 3 different pull-back distances and records them all.',
          q: 'How many shots does he record?',
          choices: [C('15 shots', 1), C('8 shots', 'additive-for-multiplicative'), C('5 shots', 'surface-feature')],
          hint: '5 shots at each of 3 settings.',
          show: '5 × 3 = 15 shots. Repeating each setting several times is how you know a result is real and not luck.'
        },
        {
          story: 'His 5 shots at one setting went 18, 20, 19, 21 and 22 feet.',
          q: 'What is the best single number to describe that setting?',
          multiStep: 1,
          choices: [C('About 20 feet, the middle of the results', 1), C('22 feet, the best shot', 'bigger-number-bias'), C('100 feet, all of them added up', 'additive-for-multiplicative')],
          hint: 'One lucky shot does not describe the machine. What number sits in the middle of the group?',
          show: 'About 20 — the typical result. Reporting your best shot instead of your typical one is how measurements start lying.'
        }
      ]
    },
    reading: {
      words: [
        W('slingshot', ['sling', 'shot'], ['sling', 'shot'], 'a Y-shaped thrower with rubber'),
        W('pullback', ['pull', 'back'], ['pull', 'bak'], 'how far you draw something back'),
        W('backyard', ['back', 'yard'], ['bak', 'yard'], 'the yard behind a house')
      ],
      sentence: 'A longer pullback on the slingshot sends it across the backyard.',
      comp: {
        q: 'What makes it go farther?',
        choices: [C('A longer pullback', 1), C('A bigger backyard', 'surface-feature'), C('The slingshot itself', 'guess-plausible')],
        hint: 'Find the words at the very start of the sentence.',
        show: 'A longer pullback stores more energy, so the shot travels farther.'
      }
    }
  },

  {
    icon: '🔁', title: 'Engineers Fail on Purpose',
    discover: {
      intro: [
        'Real engineers never get it right the first time, and they do not expect to.',
        'They build one, test it, measure what happened, change ONE thing, and test again.',
        'A design that broke is not a failure. It is data — it told you exactly where the weak spot was.'
      ],
      word: { w: 'design', say: 'dee-ZINE', mean: 'a plan for how to build something' },
      check: {
        q: 'Chance\'s bridge holds 8 pennies, then collapses. He wants a stronger one. What should he do?',
        choices: [
          C('Change one thing, test it again, and compare the two numbers', 1),
          C('Change everything at once so it is definitely better', 'ignored-condition'),
          C('Start over with a whole new idea', 'guess-plausible')
        ],
        hint: 'If you change five things and it improves, which change helped? You would have no idea.',
        show: 'One change at a time. That is the only way to know WHICH change did the work — the heart of a fair test.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'Bridge version 1 held 8 pennies. Version 2 held 14.',
          q: 'How much did it improve?',
          choices: [C('6 more pennies', 1), C('22 more pennies', 'additive-for-multiplicative'), C('14 more pennies', 'surface-feature')],
          hint: 'The gap between 14 and 8.',
          show: '14 − 8 = 6 pennies better. Writing both numbers down is what makes "better" a fact instead of a feeling.'
        },
        {
          story: 'Chance tests 3 bridge designs. He tests each one 4 times.',
          q: 'How many tests in all?',
          choices: [C('12 tests', 1), C('7 tests', 'additive-for-multiplicative'), C('4 tests', 'surface-feature')],
          hint: '4 tests for each of the 3 designs.',
          show: '3 × 4 = 12 tests. Repeating tests is how you tell a real improvement from a lucky one.'
        },
        {
          story: 'Version 1 held 8. Version 2 held 14. Version 3 held 20.',
          q: 'If the pattern keeps up, what should version 4 hold?',
          multiStep: 1,
          choices: [C('26 pennies', 1), C('24 pennies', 'off-by-one'), C('40 pennies', 'additive-for-multiplicative')],
          hint: 'How much does each version add? 8 to 14 to 20…',
          show: 'Each version adds 6, so 20 + 6 = 26. Patterns in your own data let you predict — but you still have to test it.'
        }
      ]
    },
    reading: {
      words: [
        W('notebook', ['note', 'book'], ['noht', 'book'], 'a book you write your data in'),
        W('workbench', ['work', 'bench'], ['wurk', 'bench'], 'a table for building'),
        W('setback', ['set', 'back'], ['set', 'bak'], 'something that slows your progress')
      ],
      sentence: 'He wrote every setback in his notebook and went back to the workbench.',
      comp: {
        q: 'Why would he write down the setbacks?',
        choices: [
          C('So he can learn from what went wrong', 1),
          C('So he remembers to feel bad', 'guess-plausible'),
          C('Because notebooks are for writing', 'surface-feature')
        ],
        hint: 'Think about today\'s lesson. What did we call a design that broke?',
        show: 'Setbacks are data. Written down they make the next version better; forgotten, they get repeated.'
      }
    }
  },

  {
    icon: '🏗️', title: 'Chief Engineer Challenge',
    discover: {
      intro: [
        'Today you use everything: the solar system, the creek, and the machines.',
        'A good scientist notices, measures, explains WHY, and then tests the explanation.',
        'That is the whole job — and you have been doing it for sixty days.'
      ],
      word: { w: 'evidence', say: 'EV-ih-denss', mean: 'the facts you use to show something is true' },
      check: {
        q: 'Chance says "the creek is faster today." What makes that a scientific claim instead of a guess?',
        choices: [
          C('He timed a floating stick over a measured distance, both days', 1),
          C('It looked faster and sounded louder', 'guess-plausible'),
          C('He has been to the creek many times', 'surface-feature')
        ],
        hint: 'What turns an opinion into evidence?',
        show: 'A measurement you can repeat. Same stick, same distance, same stopwatch — now the claim has evidence behind it.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'Chance floats a stick 20 feet down the creek. Monday it took 10 seconds. Today it took 5 seconds.',
          q: 'What was today\'s speed?',
          multiStep: 1,
          choices: [C('4 feet per second', 1), C('2 feet per second', 'sequence-error'), C('100 feet per second', 'additive-for-multiplicative')],
          hint: '20 feet split across 5 seconds.',
          show: '20 ÷ 5 = 4 feet per second today, versus 20 ÷ 10 = 2 on Monday. Twice as fast, and now he can prove it.'
        },
        {
          story: 'A ramp lets Chance lift a 30-pound rock with only 10 pounds of push, but he has to push 3 times as far.',
          q: 'Which sentence describes what the machine did?',
          multiStep: 1,
          choices: [
            C('It traded less force for more distance', 1),
            C('It made the rock lighter', 'literal-appearance'),
            C('It gave him free energy', 'overgeneralize')
          ],
          hint: 'Compare both numbers: force went down 3 times, distance went up 3 times.',
          show: 'Less force, more distance — every machine in this unit made that same trade. The rock never got lighter.'
        },
        {
          story: 'A rocket climbs 3 miles every 10 seconds. The space station orbits 250 miles up.',
          q: 'Roughly how many seconds of climbing is that?',
          multiStep: 1,
          choices: [
            C('A bit more than 800 seconds', 1),
            C('About 250 seconds', 'surface-feature'),
            C('About 30 seconds', 'reversed-relation')
          ],
          hint: 'How many 3-mile chunks in 250 miles? About 83. Each chunk takes 10 seconds.',
          show: '250 ÷ 3 is about 83 chunks, and 83 × 10 is about 830 seconds — right around the 8 or 9 minutes a real launch takes.'
        }
      ]
    },
    reading: {
      words: [
        W('sunrise', ['sun', 'rise'], ['sun', 'rize'], 'when the sun comes up'),
        W('waterfall', ['wa', 'ter', 'fall'], ['waw', 'ter', 'fall'], 'water dropping over a ledge'),
        W('flashlight', ['flash', 'light'], ['flash', 'lite'], 'a light you carry')
      ],
      sentence: 'Before sunrise he took a flashlight down to the waterfall to measure the flow.',
      comp: {
        q: 'Why did he need a flashlight?',
        choices: [
          C('It was still dark before sunrise', 1),
          C('The waterfall was loud', 'surface-feature'),
          C('To see the fish', 'guess-plausible')
        ],
        hint: 'What word tells you the time of day? What is the sky like then?',
        show: 'Before sunrise means dark. Real field scientists are out early — and now that is you.'
      }
    }
  }

  ]);
})();
