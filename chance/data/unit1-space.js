/* ============================================================
   UNIT 1 — SPACE (days 1-20)
   Starts on the solar system because that is the hook that
   already worked for him. Math rides along inside it: hours of
   daylight, orbit laps, jump heights on the Moon, signal delay
   to Mars. Reading words come from the same lesson so decoding
   practice and science vocabulary are the same practice.
   ============================================================ */
(function () {
  var C = Curriculum.C, W = Curriculum.W;

  Curriculum.addDays(1, [

  /* ---------------- WEEK 1 · Sun, Earth and Shadows ---------------- */
  {
    icon: '🌍', title: 'Why We Have Day and Night',
    discover: {
      intro: [
        'Earth is a giant ball spinning in space, and it never stops.',
        'One whole spin takes 24 hours. That is one day and one night.',
        'When your side of Earth faces the Sun it is daytime. When it spins away, it is night.'
      ],
      word: { w: 'rotate', say: 'ROH-tayt', mean: 'to spin around, like a top' },
      check: {
        q: 'It is dark outside your window right now. What is the Sun doing?',
        choices: [
          C('Still shining — your side of Earth just turned away', 1),
          C('The Sun turned off for the night', 'literal-appearance'),
          C('The Sun went behind Earth to rest', 'animism')
        ],
        hint: 'The Sun is a star. Stars have no switch and they do not sleep.',
        show: 'The Sun shines all the time. Night happens because your side of the spinning ball turned away from it.'
      }
    },
    numbers: {
      domain: 'time',
      problems: [
        {
          story: 'One full spin of Earth takes 24 hours.',
          q: 'Half a spin is half a day. How many hours is that?',
          choices: [C('12 hours', 1), C('24 hours', 'bigger-number-bias'), C('6 hours', 'part-whole-mixup')],
          hint: 'Cut 24 into two equal pieces. What is one piece?',
          show: '24 split into 2 equal parts is 12. That is why daylight is about 12 hours long.'
        },
        {
          story: 'The Sun went down at 8 o\'clock at night. Chance woke up at 7 o\'clock the next morning.',
          q: 'About how many hours was it dark?',
          multiStep: 1,
          choices: [C('11 hours', 1), C('15 hours', 'unit-mixup'), C('1 hour', 'reversed-relation')],
          hint: 'Count from 8 up to 12, then from 12 up to 7. Add the two pieces.',
          show: '8 to 12 is 4 hours. 12 to 7 is 7 more hours. 4 + 7 = 11 hours of darkness.'
        },
        {
          story: 'Earth spins one time every single day.',
          q: 'How many spins does Earth make in 4 days?',
          choices: [C('4 spins', 1), C('24 spins', 'surface-feature'), C('96 spins', 'unit-mixup')],
          hint: 'One spin per day. Count the days.',
          show: 'One spin each day means 4 spins in 4 days. 96 would be the hours: 24 × 4 = 96.'
        }
      ]
    },
    reading: {
      words: [
        W('spin', ['sp', 'in'], 'to turn around fast'),
        W('sun', ['s', 'un'], 'the star that lights our sky'),
        W('rock', ['r', 'o', 'ck'], 'hard stone')
      ],
      sentence: 'Earth is a big rock that spins in the light of the sun.',
      comp: {
        q: 'What does the word "spins" tell you about Earth?',
        choices: [
          C('How Earth moves', 1),
          C('How big Earth is', 'surface-feature'),
          C('That Earth is made of rock', 'surface-feature')
        ],
        hint: 'Spin is something you DO. It is a movement word.',
        show: '"Spins" is the movement. "Big" is the size and "rock" is what it is made of.'
      }
    }
  },

  {
    icon: '☀️', title: 'The Sun Is a Star',
    discover: {
      intro: [
        'The Sun looks bigger than every other star, but it is not the biggest.',
        'It only looks huge because it is the closest star to us.',
        'Every other star you see at night is far, far away — so it looks like a tiny dot.'
      ],
      word: { w: 'distance', say: 'DISS-tunss', mean: 'how far away something is' },
      check: {
        q: 'Why does the Sun look so much bigger than the stars at night?',
        choices: [
          C('It is much closer to us', 1),
          C('It is the biggest star there is', 'literal-appearance'),
          C('It is brighter because it is daytime', 'surface-feature')
        ],
        hint: 'Hold your thumb up close, then far away. Did your thumb grow?',
        show: 'Close things look big. The Sun is 4 light-years closer than the next nearest star, so it looks like a giant.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'A car on the road looks tiny when it is far away and big when it is close.',
          q: 'Two cars are the same size. One looks smaller. What is true?',
          choices: [C('The smaller-looking one is farther away', 1), C('The smaller-looking one really is smaller', 'literal-appearance'), C('The bigger-looking one is going faster', 'surface-feature')],
          hint: 'Same size cars. So the difference has to be how far away they are.',
          show: 'Same real size + looks smaller = farther away. Scientists use this to measure space.',
        },
        {
          story: 'You could fit about 100 Earths in a line across the Sun.',
          q: 'How many Earths would fit across HALF of the Sun?',
          choices: [C('50 Earths', 1), C('100 Earths', 'bigger-number-bias'), C('200 Earths', 'reversed-relation')],
          hint: 'Half of 100.',
          show: 'Half of 100 is 50. Half of a distance is always the smaller number.'
        },
        {
          story: 'Chance counts 6 stars in one patch of sky. He looks at 5 patches that each have 6 stars.',
          q: 'How many stars did he count in all?',
          choices: [C('30 stars', 1), C('11 stars', 'additive-for-multiplicative'), C('56 stars', 'surface-feature')],
          hint: 'Five groups. Six in each group. That is a times problem.',
          show: '6 × 5 = 30. When every group is the same size, use multiplication instead of adding one at a time.'
        }
      ]
    },
    reading: {
      words: [
        W('star', ['st', 'ar'], 'a huge ball of burning gas'),
        W('hot', ['h', 'o', 't'], 'very warm'),
        W('gas', ['g', 'a', 's'], 'not solid and not liquid — like air')
      ],
      sentence: 'The sun is a hot ball of gas, and it is the star that is closest to us.',
      comp: {
        q: 'The sentence says the sun is "closest to us." What does that explain?',
        choices: [
          C('Why the sun looks so big and bright', 1),
          C('Why the sun is made of gas', 'surface-feature'),
          C('Why the sun is hot', 'surface-feature')
        ],
        hint: 'Closest is about distance. What does distance change — the size, or how big it LOOKS?',
        show: 'Being closest explains how big it looks to us. It would be hot and gassy no matter where it sat.'
      }
    }
  },

  {
    icon: '🌗', title: 'Shadows Tell You Where the Sun Is',
    discover: {
      intro: [
        'A shadow is just a place where something blocks the light.',
        'When the Sun is low in the morning, shadows stretch out long.',
        'When the Sun is high at lunchtime, shadows shrink down short.'
      ],
      word: { w: 'shadow', say: 'SHAD-oh', mean: 'the dark shape where light is blocked' },
      check: {
        q: 'Chance\'s shadow is very long. Where is the Sun?',
        choices: [
          C('Low in the sky — early or late in the day', 1),
          C('High overhead at lunchtime', 'reversed-relation'),
          C('Behind a cloud', 'surface-feature')
        ],
        hint: 'Shine a flashlight from the side of a toy, then from straight above. Which shadow is longer?',
        show: 'Low Sun = long shadow. High Sun = short shadow. Your shadow is a Sun-position clock.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'At 8 in the morning Chance\'s shadow is 9 feet long. At noon it is 3 feet long.',
          q: 'How much shorter did the shadow get?',
          choices: [C('6 feet shorter', 1), C('12 feet shorter', 'additive-for-multiplicative'), C('3 feet shorter', 'surface-feature')],
          hint: 'Take the small number away from the big number.',
          show: '9 − 3 = 6. The shadow lost 6 feet as the Sun climbed higher.'
        },
        {
          story: 'A fence post is 4 feet tall. Early in the day its shadow is 3 times as long as the post.',
          q: 'How long is the shadow?',
          choices: [C('12 feet', 1), C('7 feet', 'additive-for-multiplicative'), C('4 feet', 'surface-feature')],
          hint: '"3 times as long" means 3 groups of 4.',
          show: '4 × 3 = 12 feet. "Times as long" is multiplication; "3 more" would have been adding.'
        },
        {
          story: 'Chance is 4 feet tall. His shadow is exactly as long as he is tall.',
          q: 'What is the Sun doing right then?',
          multiStep: 1,
          choices: [C('Sitting halfway up the sky', 1), C('Straight overhead', 'reversed-relation'), C('Just touching the horizon', 'reversed-relation')],
          hint: 'Straight overhead gives almost NO shadow. On the horizon gives a giant one. Equal is in between.',
          show: 'When your shadow matches your height, the Sun is about halfway up — a 45 degree angle.'
        }
      ]
    },
    reading: {
      words: [
        W('shadow', ['sha', 'dow'], 'dark shape made by blocked light'),
        W('block', ['bl', 'o', 'ck'], 'to stop something from passing'),
        W('long', ['l', 'o', 'ng'], 'stretched out far')
      ],
      sentence: 'When you block the sun, you make a long dark shadow on the grass.',
      comp: {
        q: 'What has to happen FIRST to make a shadow?',
        choices: [
          C('Something must block the light', 1),
          C('The grass must be dark', 'sequence-error'),
          C('The shadow must get long', 'sequence-error')
        ],
        hint: 'A shadow cannot exist until something gets in the light\'s way.',
        show: 'Order matters: light shines, something blocks it, THEN the shadow appears.'
      }
    }
  },

  {
    icon: '🌡️', title: 'Why Summer Is Hotter Than Winter',
    discover: {
      intro: [
        'Earth is tilted, like a spinning top leaning to one side.',
        'In summer your half of Earth leans toward the Sun, so the light hits straight on and cooks you.',
        'In winter your half leans away, the light comes in slanted and spread out, and it feels cold.'
      ],
      word: { w: 'tilt', say: 'tilt', mean: 'to lean to one side' },
      check: {
        q: 'Some people think summer happens because Earth gets closer to the Sun. What is really going on?',
        choices: [
          C('Our half of Earth is tilted toward the Sun', 1),
          C('Earth moves much closer to the Sun in summer', 'overgeneralize'),
          C('The Sun burns hotter in the summer months', 'literal-appearance')
        ],
        hint: 'When it is summer here, it is winter in Australia. Could Earth be close and far at the same time?',
        show: 'It is the tilt. Proof: our summer is Australia\'s winter, on the very same day, on the very same planet.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'On a June morning it is 58 degrees. By afternoon it warms up to 84 degrees.',
          q: 'How many degrees did it climb?',
          choices: [C('26 degrees', 1), C('142 degrees', 'additive-for-multiplicative'), C('16 degrees', 'off-by-one')],
          hint: 'Take away: 84 take away 58.',
          show: '84 − 58 = 26 degrees warmer.'
        },
        {
          story: 'Fill in the missing number:  35 + ? = 60 degrees.',
          q: 'What number goes in the box?',
          choices: [C('25', 1), C('95', 'additive-for-multiplicative'), C('30', 'guess-plausible')],
          hint: 'You are hunting for the gap between 35 and 60.',
          show: '35 + 25 = 60. A missing-number box is a subtraction in disguise: 60 − 35 = 25. That is algebra.'
        },
        {
          story: 'Summer days are long. On June 21 there are about 15 hours of daylight.',
          q: 'How many hours of darkness are left in that 24-hour day?',
          multiStep: 1,
          choices: [C('9 hours', 1), C('15 hours', 'surface-feature'), C('39 hours', 'additive-for-multiplicative')],
          hint: 'A whole day is 24 hours. Daylight took 15 of them.',
          show: '24 − 15 = 9 hours of night. Daylight plus darkness always has to add back up to 24.'
        }
      ]
    },
    reading: {
      words: [
        W('tilt', ['t', 'il', 't'], 'to lean over'),
        W('warm', ['w', 'ar', 'm'], 'a little bit hot'),
        W('sun-light', ['sun', 'light'], 'light that comes from the sun')
      ],
      sentence: 'When our half of Earth has a tilt toward the sun, the sunlight feels warm.',
      comp: {
        q: 'According to the sentence, what makes the sunlight feel warm?',
        choices: [
          C('Our half is tilted toward the sun', 1),
          C('The sun gets bigger', 'literal-appearance'),
          C('Earth stops spinning', 'surface-feature')
        ],
        hint: 'Find the word "tilt" in the sentence and read what comes right after it.',
        show: 'The tilt toward the sun is the cause. Warm sunlight is the effect.'
      }
    }
  },

  {
    icon: '🧭', title: 'The Sun Always Rises in the East',
    discover: {
      intro: [
        'The Sun comes up in the east every single morning and sets in the west every single evening.',
        'The Sun is not really travelling across your sky — Earth is turning underneath you.',
        'You are on a merry-go-round, and the Sun is the tree you keep passing.'
      ],
      word: { w: 'east', say: 'eest', mean: 'the direction where the Sun comes up' },
      check: {
        q: 'You watch the Sun move slowly across the sky all day. What is actually moving?',
        choices: [
          C('You are — Earth is rotating you along', 1),
          C('The Sun is flying over Earth', 'literal-appearance'),
          C('Both are standing still, the light just changes', 'surface-feature')
        ],
        hint: 'On a merry-go-round the trees seem to slide past. Are the trees walking?',
        show: 'Earth\'s rotation carries you eastward, so the Sun appears to slide westward. Your eyes see motion; the cause is your own spin.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'The Sun comes up at 6 in the morning and goes down at 8 at night.',
          q: 'How many hours of daylight is that?',
          choices: [C('14 hours', 1), C('2 hours', 'reversed-relation'), C('20 hours', 'additive-for-multiplicative')],
          hint: '6 to 12 is 6 hours. Then 12 to 8 is 8 more.',
          show: '6 + 8 = 14 hours of daylight.'
        },
        {
          story: 'Chance walks 2 miles every hour. The creek is 4 miles away.',
          q: 'How long does the walk take?',
          multiStep: 1,
          choices: [C('2 hours', 1), C('4 hours', 'surface-feature'), C('8 hours', 'additive-for-multiplicative')],
          hint: 'How many 2-mile chunks fit inside 4 miles?',
          show: '4 miles ÷ 2 miles each hour = 2 hours. Distance divided by speed gives you time.'
        },
        {
          story: 'Chance walks 2 miles an hour. Grandpa\'s truck goes 30 miles an hour.',
          q: 'Who takes MORE time to reach the same creek?',
          choices: [C('Chance walking', 1), C('The truck, because 30 is bigger', 'bigger-number-bias'), C('They take the same time', 'reversed-relation')],
          hint: 'Faster means you get there sooner. Slower means it takes longer.',
          show: 'Same distance: the slower traveller always takes more time. A bigger speed number means a smaller time number.'
        }
      ]
    },
    reading: {
      words: [
        W('east', ['ea', 'st'], 'the sunrise direction'),
        W('west', ['w', 'e', 'st'], 'the sunset direction'),
        W('map', ['m', 'a', 'p'], 'a picture of a place from above')
      ],
      sentence: 'The sun comes up in the east and goes down in the west, just like the map shows.',
      comp: {
        q: 'If you face the sunrise, which direction are you facing?',
        choices: [C('East', 1), C('West', 'reversed-relation'), C('Down', 'surface-feature')],
        hint: 'Sunrise is the coming-up one. Which word goes with coming up?',
        show: 'Sunrise = east. Sunset = west. Facing a sunrise means you are facing east.'
      }
    }
  },

  /* ---------------- WEEK 2 · The Moon and Gravity ---------------- */
  {
    icon: '🌙', title: 'Why the Moon Changes Shape',
    discover: {
      intro: [
        'The Moon is always a whole round ball. It never actually changes shape.',
        'Half of it is always lit by the Sun, like a ball with a flashlight on one side.',
        'As the Moon travels around us, we see different amounts of its sunny side. That is a phase.'
      ],
      word: { w: 'phase', say: 'fayz', mean: 'how much of the Moon\'s sunny side we can see' },
      check: {
        q: 'Tonight the Moon looks like a thin curved sliver. What is really happening?',
        choices: [
          C('We can only see a sliver of its sunny side from here', 1),
          C('The Moon shrank down to a sliver', 'literal-appearance'),
          C('A cloud is covering most of the Moon', 'surface-feature')
        ],
        hint: 'The Moon is a ball. Balls do not get thinner.',
        show: 'The whole ball is still there. Our angle changed, so we only catch a sliver of the lit half.'
      }
    },
    numbers: {
      domain: 'time',
      problems: [
        {
          story: 'The Moon takes about 28 days to go through all its phases.',
          q: 'About how many weeks is that?',
          multiStep: 1,
          choices: [C('4 weeks', 1), C('28 weeks', 'unit-mixup'), C('7 weeks', 'surface-feature')],
          hint: 'A week is 7 days. How many 7s fit in 28?',
          show: '28 ÷ 7 = 4 weeks. Watch the units: days and weeks are different sizes.'
        },
        {
          story: 'A full moon was Monday. Half of the 28-day cycle later, the Moon looks completely dark.',
          q: 'How many days after Monday is the dark new moon?',
          choices: [C('14 days', 1), C('28 days', 'part-whole-mixup'), C('7 days', 'part-whole-mixup')],
          hint: 'Half of 28.',
          show: 'Half of 28 is 14. Full moon and new moon sit on opposite sides of the cycle.'
        },
        {
          story: 'Chance draws the Moon in his notebook every night for 3 weeks.',
          q: 'How many drawings will he have?',
          choices: [C('21 drawings', 1), C('10 drawings', 'additive-for-multiplicative'), C('3 drawings', 'surface-feature')],
          hint: '7 nights in a week, 3 weeks. Groups of 7.',
          show: '7 × 3 = 21 drawings. Real astronomers keep notebooks exactly like this.'
        }
      ]
    },
    reading: {
      words: [
        W('shape', ['sh', 'ape'], 'the outline of a thing'),
        W('side', ['s', 'ide'], 'one face or edge of something'),
        W('globe', ['gl', 'obe'], 'a ball, often a model of a world')
      ],
      sentence: 'The moon is a globe, and we see one side of its bright shape each night.',
      comp: {
        q: 'The word "globe" tells you the moon is what?',
        choices: [C('Round like a ball', 1), C('Bright', 'surface-feature'), C('Only visible at night', 'surface-feature')],
        hint: 'Think about a globe on a teacher\'s desk. What shape is it?',
        show: 'Globe means ball-shaped. That is why the moon can never really be a sliver.'
      }
    }
  },

  {
    icon: '🌓', title: 'The Moon Shows Us the Same Face',
    discover: {
      intro: [
        'Everyone on Earth always sees the same side of the Moon. Nobody has ever seen the far side from the ground.',
        'That happens because the Moon turns one time for every one trip around us.',
        'It is like walking around a tree while always keeping your face pointed at the trunk.'
      ],
      word: { w: 'orbit', say: 'OR-bit', mean: 'the path one space object travels around another' },
      check: {
        q: 'Does the Moon spin?',
        choices: [
          C('Yes — exactly once per trip around Earth', 1),
          C('No, it is frozen in place', 'literal-appearance'),
          C('Yes, but it spins backwards on purpose', 'animism')
        ],
        hint: 'To keep your face on a tree while you circle it, do you have to turn your body?',
        show: 'It spins once per orbit. That matched pair is why the same face is aimed at us forever.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'Chance stands facing north, then makes a quarter turn to the right.',
          q: 'How many degrees did he turn?',
          choices: [C('90 degrees', 1), C('360 degrees', 'part-whole-mixup'), C('4 degrees', 'surface-feature')],
          hint: 'A whole turn is 360. A quarter of a whole turn.',
          show: '360 ÷ 4 = 90 degrees. A quarter turn is a right angle — the corner of a square.'
        },
        {
          story: 'Chance walks all the way around a big oak, always facing the trunk.',
          q: 'How many full turns did his body make by the time he got back to the start?',
          multiStep: 1,
          choices: [C('1 full turn', 1), C('No turns at all', 'literal-appearance'), C('4 full turns', 'guess-plausible')],
          hint: 'Point at something and walk a circle around it. Notice which way your nose ends up pointing.',
          show: 'One lap facing inward = one full body turn. That is exactly what the Moon does.'
        },
        {
          story: 'Chance makes 3 quarter-turns in a row, all to the right.',
          q: 'How many degrees is that altogether?',
          choices: [C('270 degrees', 1), C('90 degrees', 'part-whole-mixup'), C('360 degrees', 'bigger-number-bias')],
          hint: '90 for each turn. Three of them.',
          show: '90 × 3 = 270 degrees — three quarters of the way around.'
        }
      ]
    },
    reading: {
      words: [
        W('face', ['f', 'ace'], 'the front side of something'),
        W('same', ['s', 'ame'], 'not different'),
        W('side', ['s', 'ide'], 'one surface of a thing')
      ],
      sentence: 'We always see the same face of the moon, and the far side stays hidden.',
      comp: {
        q: 'Why has nobody on the ground ever seen the far side?',
        choices: [
          C('It is always turned away from Earth', 1),
          C('It is too dark to see', 'guess-plausible'),
          C('It is on the other side of the Sun', 'overgeneralize')
        ],
        hint: 'Reread the sentence. What word describes the far side?',
        show: 'Hidden means turned away. The far side gets plenty of sunlight — it just never points at us.'
      }
    }
  },

  {
    icon: '⬇️', title: 'Gravity Pulls on Everything',
    discover: {
      intro: [
        'Gravity is an invisible pull. Every single thing with stuff in it pulls on everything else.',
        'Earth is huge, so its pull is strong enough to hold you, the oceans and the air right onto the ground.',
        'Gravity is also the reason the Moon keeps circling us instead of drifting away.'
      ],
      word: { w: 'gravity', say: 'GRAV-ih-tee', mean: 'the invisible pull between things with mass' },
      check: {
        q: 'You drop a heavy rock and a light pebble at the same time from the same height. What happens?',
        choices: [
          C('They land at almost exactly the same moment', 1),
          C('The heavy rock lands way first because it is heavier', 'guess-plausible'),
          C('The pebble lands first because it is easier to pull', 'reversed-relation')
        ],
        hint: 'Try it outside with a rock and a pebble. Watch closely. Do not use a feather — air pushes on feathers.',
        show: 'Gravity speeds up everything at the same rate. Only air resistance changes it, which is why a feather is the exception.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'A dropped rock falls about 16 feet in the first second, and it keeps speeding up.',
          q: 'In the second second, does it fall more, less, or the same?',
          choices: [C('More — it is going faster now', 1), C('The same 16 feet', 'overgeneralize'), C('Less, because it is running out of pull', 'animism')],
          hint: 'It is speeding up the whole way down. Faster means it covers more ground.',
          show: 'It falls farther each second because gravity keeps adding speed. That is acceleration.'
        },
        {
          story: 'Chance drops a stone off a bridge and counts 2 seconds before the splash.',
          q: 'If he counts 4 seconds off a taller bridge, that bridge is…',
          choices: [C('Much more than twice as tall', 1), C('Exactly twice as tall', 'guess-plausible'), C('Half as tall', 'reversed-relation')],
          hint: 'The stone keeps speeding up, so later seconds cover way more distance than early ones.',
          show: 'Doubling the fall TIME more than doubles the height, because the stone is moving faster in those later seconds.'
        },
        {
          story: 'Chance and Grandpa each drop 5 acorns off the porch. Every acorn takes 1 second to land.',
          q: 'How many acorns fell in all?',
          choices: [C('10 acorns', 1), C('5 acorns', 'part-whole-mixup'), C('25 acorns', 'additive-for-multiplicative')],
          hint: 'Two people, 5 each.',
          show: '5 × 2 = 10 acorns. And every one of them took the same 1 second, no matter its size.'
        }
      ]
    },
    reading: {
      words: [
        W('pull', ['p', 'ull'], 'to drag toward you'),
        W('drop', ['dr', 'o', 'p'], 'to let something fall'),
        W('weight', ['wei', 'ght'], 'how heavy something is')
      ],
      sentence: 'Gravity is a pull, so when you drop a stone its weight brings it down fast.',
      comp: {
        q: 'What does gravity do in this sentence?',
        choices: [C('It pulls things down', 1), C('It makes things heavy on purpose', 'animism'), C('It drops the stone from your hand', 'surface-feature')],
        hint: 'Find the word right after "Gravity is a…"',
        show: 'Gravity pulls. You are the one who let go — gravity did the rest.'
      }
    }
  },

  {
    icon: '🌊', title: 'The Moon Pulls the Ocean',
    discover: {
      intro: [
        'The Moon\'s gravity tugs on Earth\'s oceans and lifts the water into a bulge.',
        'As Earth spins, your beach passes through that bulge, and the water climbs up the sand. That is high tide.',
        'Then you spin out of the bulge, and the water slides back down. Low tide.'
      ],
      word: { w: 'tide', say: 'tide', mean: 'the daily rise and fall of the ocean' },
      check: {
        q: 'Why does high tide come back around twice a day?',
        choices: [
          C('There is a water bulge on each side of Earth, and we spin through both', 1),
          C('The Moon comes closer twice a day', 'literal-appearance'),
          C('The ocean gets refilled twice a day', 'guess-plausible')
        ],
        hint: 'The Moon pulls the near water up AND lets the far water swing out. Two bulges, one spin.',
        show: 'Two bulges, one rotation: your beach passes through both, so you get two high tides roughly every 24 hours.'
      }
    },
    numbers: {
      domain: 'time',
      problems: [
        {
          story: 'High tide comes about every 12 hours.',
          q: 'High tide is at 6 in the morning. When is the next one?',
          choices: [C('6 at night', 1), C('12 at night', 'surface-feature'), C('7 in the morning', 'off-by-one')],
          hint: 'Add 12 hours onto 6 in the morning.',
          show: '6 in the morning + 12 hours = 6 in the evening.'
        },
        {
          story: 'Low tide falls halfway between two high tides. High tides are at 6 in the morning and 6 at night.',
          q: 'When is low tide?',
          multiStep: 1,
          choices: [C('12 noon', 1), C('6 at night', 'surface-feature'), C('3 in the afternoon', 'guess-plausible')],
          hint: 'Halfway between 6 in the morning and 6 at night. Count 6 hours forward.',
          show: '6 + 6 = 12 noon, right in the middle of the two high tides.'
        },
        {
          story: 'The tide rises 2 feet every hour on this beach.',
          q: 'How high will the water climb in 4 hours?',
          choices: [C('8 feet', 1), C('6 feet', 'additive-for-multiplicative'), C('2 feet', 'surface-feature')],
          hint: '2 feet each hour, for 4 hours. Groups of 2.',
          show: '2 × 4 = 8 feet. A rate times a time gives you a total — the same math as speed and distance.'
        }
      ]
    },
    reading: {
      words: [
        W('tide', ['t', 'ide'], 'rising and falling ocean water'),
        W('wave', ['w', 'ave'], 'water that rolls and lifts'),
        W('rise', ['r', 'ise'], 'to go up')
      ],
      sentence: 'The tide makes the waves rise up the sand twice in one day.',
      comp: {
        q: 'How many times a day does the tide come up, according to the sentence?',
        choices: [C('Twice', 1), C('One time', 'off-by-one'), C('Every hour', 'guess-plausible')],
        hint: 'Find the number word near the end of the sentence.',
        show: 'Twice — because Earth spins through two water bulges every day.'
      }
    }
  },

  {
    icon: '👣', title: 'Jumping on the Moon',
    discover: {
      intro: [
        'The Moon is much smaller than Earth, so its gravity pull is about six times weaker.',
        'That means the very same jump would carry you about six times higher up there.',
        'Astronauts did not walk on the Moon — they bounced, because bouncing was easier.'
      ],
      word: { w: 'weaker', say: 'WEE-ker', mean: 'not as strong' },
      check: {
        q: 'On the Moon, Chance jumps with the exact same leg push. Why does he go higher?',
        choices: [
          C('Weaker gravity pulls him back down more slowly', 1),
          C('His legs get stronger in space', 'guess-plausible'),
          C('There is no gravity at all on the Moon', 'overgeneralize')
        ],
        hint: 'Astronauts came back down, so there IS gravity. It is just weaker.',
        show: 'Same push, weaker pull, higher jump. The Moon has gravity — about one sixth of ours.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'Chance can jump 1 foot high on Earth. On the Moon he would go 6 times higher.',
          q: 'How high is the Moon jump?',
          choices: [C('6 feet', 1), C('7 feet', 'additive-for-multiplicative'), C('1 foot', 'surface-feature')],
          hint: '6 times as high as 1 foot.',
          show: '1 × 6 = 6 feet. Six times taller than the doorway you walk through.'
        },
        {
          story: 'Grandpa jumps 2 feet high on Earth.',
          q: 'How high would Grandpa jump on the Moon?',
          choices: [C('12 feet', 1), C('8 feet', 'additive-for-multiplicative'), C('3 feet', 'guess-plausible')],
          hint: 'Multiply his jump by 6.',
          show: '2 × 6 = 12 feet. The rule stays the same; only the starting number changed. That is a function.'
        },
        {
          story: 'A moon rule machine: whatever you put in, it multiplies by 6. Put in 3, you get 18. Put in 4, you get 24.',
          q: 'Put in 5. What comes out?',
          multiStep: 1,
          choices: [C('30', 1), C('29', 'off-by-one'), C('11', 'additive-for-multiplicative')],
          hint: 'The machine\'s rule is "times 6." Use it on 5.',
          show: '5 × 6 = 30. Finding the machine\'s hidden rule and using it on a new number is real algebra.'
        }
      ]
    },
    reading: {
      words: [
        W('jump', ['j', 'u', 'mp'], 'to push off the ground'),
        W('space', ['sp', 'ace'], 'the huge empty place beyond our air'),
        W('bounce', ['b', 'ounce'], 'to spring up after landing')
      ],
      sentence: 'In space on the moon you can jump high and bounce with every step.',
      comp: {
        q: 'Why could you bounce with every step on the moon?',
        choices: [
          C('Gravity is weaker there', 1),
          C('The moon ground is springy like a trampoline', 'literal-appearance'),
          C('Space suits have springs in the boots', 'guess-plausible')
        ],
        hint: 'Think back to the lesson. What is six times weaker on the Moon?',
        show: 'Weaker gravity means each push lifts you farther and brings you down slower.'
      }
    }
  },

  /* ---------------- WEEK 3 · Planets and Orbits ---------------- */
  {
    icon: '🪐', title: 'Eight Planets in Order',
    discover: {
      intro: [
        'Eight planets orbit our Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
        'The first four are small and rocky. The last four are giant and made mostly of gas and ice.',
        'The closer a planet is to the Sun, the shorter its trip around, and the hotter it usually is.'
      ],
      word: { w: 'planet', say: 'PLAN-it', mean: 'a big round world that orbits a star' },
      check: {
        q: 'Which planet is the 3rd one out from the Sun?',
        choices: [C('Earth', 1), C('Mars', 'off-by-one'), C('Mercury', 'sequence-error')],
        hint: 'Count them out loud: Mercury one, Venus two…',
        show: 'Mercury, Venus, Earth. Earth is third — and Mars, our neighbor, is fourth.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'There are 8 planets. The first 4 are rocky.',
          q: 'How many are NOT rocky?',
          choices: [C('4', 1), C('8', 'part-whole-mixup'), C('12', 'additive-for-multiplicative')],
          hint: '8 total, take away the 4 rocky ones.',
          show: '8 − 4 = 4 giant planets.'
        },
        {
          story: 'Chance builds a model with 8 planets. He gives each planet 3 moons out of clay.',
          q: 'How many clay moons does he need?',
          choices: [C('24 moons', 1), C('11 moons', 'additive-for-multiplicative'), C('8 moons', 'surface-feature')],
          hint: '8 groups, 3 in each group.',
          show: '8 × 3 = 24 moons. (Real life is wilder — Saturn alone has over 100.)'
        },
        {
          story: 'Pattern: Mercury is 1, Venus is 2, Earth is 3, Mars is 4.',
          q: 'Saturn is the 6th planet. Which number is Jupiter?',
          multiStep: 1,
          choices: [C('5', 1), C('7', 'reversed-relation'), C('6', 'off-by-one')],
          hint: 'Jupiter comes right BEFORE Saturn, so it is one less.',
          show: 'Saturn is 6, so Jupiter is 6 − 1 = 5. Going inward means counting down.'
        }
      ]
    },
    reading: {
      words: [
        W('planet', ['plan', 'et'], 'a world orbiting a star'),
        W('Mars', ['M', 'ar', 's'], 'the red planet next door'),
        W('order', ['or', 'der'], 'the arrangement, first to last')
      ],
      sentence: 'Mars is the fourth planet in order, and it is the next one out from Earth.',
      comp: {
        q: 'What position does Mars have?',
        choices: [C('Fourth from the Sun', 1), C('First from the Sun', 'sequence-error'), C('The last planet', 'surface-feature')],
        hint: 'Find the number word in the sentence.',
        show: 'Fourth. Earth is third, so Mars is our next-door neighbor going outward.'
      }
    }
  },

  {
    icon: '⭕', title: 'Orbits Are Paths, Not Strings',
    discover: {
      intro: [
        'Nothing ties a planet to the Sun. Gravity does the whole job, with no rope at all.',
        'A planet is falling toward the Sun and moving sideways fast at the same time — so it keeps curving around and never arrives.',
        'That endless curved path is an orbit. Most are slightly squashed circles called ellipses.'
      ],
      word: { w: 'ellipse', say: 'ee-LIPS', mean: 'a circle that has been gently squashed' },
      check: {
        q: 'What keeps Earth from flying off in a straight line into deep space?',
        choices: [
          C('The Sun\'s gravity keeps bending its path', 1),
          C('Earth is stuck in its groove in space', 'literal-appearance'),
          C('Earth wants to stay near the Sun', 'animism')
        ],
        hint: 'Swing a ball on a string, then let go. What bends the path while you hold on?',
        show: 'Gravity is the invisible string. Cut it, and Earth would fly off perfectly straight.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'Chance draws an orbit path around the Sun as a big circle.',
          q: 'How many corners does a circle have?',
          choices: [C('None at all', 1), C('4 corners', 'shape-orientation'), C('1 corner', 'guess-plausible')],
          hint: 'Run your finger around a circle. Does it ever turn sharply?',
          show: 'A circle has zero corners and zero straight edges — just one smooth curve.'
        },
        {
          story: 'A running track loop is 100 feet all the way around.',
          q: 'Chance runs 3 full laps. How far did he run?',
          choices: [C('300 feet', 1), C('103 feet', 'additive-for-multiplicative'), C('100 feet', 'part-whole-mixup')],
          hint: '3 groups of 100.',
          show: '100 × 3 = 300 feet. Laps around a loop are just repeated distance — same as planets counting years.'
        },
        {
          story: 'A square garden is 4 feet on every side.',
          q: 'How far do you walk to go all the way around the outside?',
          multiStep: 1,
          choices: [C('16 feet', 1), C('8 feet', 'part-whole-mixup'), C('16 squares of grass', 'perimeter-area-mixup')],
          hint: 'Four sides, 4 feet each. Add all four, or multiply.',
          show: '4 × 4 = 16 feet around the edge. That distance around is called the perimeter.'
        }
      ]
    },
    reading: {
      words: [
        W('orbit', ['or', 'bit'], 'the curved path around something'),
        W('circle', ['cir', 'cle'], 'a perfectly round shape'),
        W('curve', ['c', 'ur', 've'], 'a bend with no corners')
      ],
      sentence: 'Earth follows a curve, so its orbit is almost a perfect circle.',
      comp: {
        q: 'What shape is Earth\'s orbit closest to?',
        choices: [C('A circle', 1), C('A square', 'guess-plausible'), C('A straight line', 'literal-appearance')],
        hint: 'The sentence says "almost a perfect ___".',
        show: 'Almost a circle — really a gently squashed one, an ellipse.'
      }
    }
  },

  {
    icon: '🏃', title: 'Inner Planets Race Around Faster',
    discover: {
      intro: [
        'Mercury is closest to the Sun and finishes a whole orbit in only 88 days.',
        'Earth takes 365 days. Neptune, way out on the edge, needs about 165 Earth years for one lap.',
        'Closer planets have shorter paths AND move faster, so their years are much shorter.'
      ],
      word: { w: 'year', say: 'yeer', mean: 'one full trip around the Sun' },
      check: {
        q: 'Why is a year on Neptune so much longer than a year on Earth?',
        choices: [
          C('Its path is far bigger and it travels slower', 1),
          C('Neptune is lazy and takes its time', 'animism'),
          C('Neptune spins more slowly', 'surface-feature')
        ],
        hint: 'A year means one lap around the Sun. What makes a lap take longer — a bigger track, or a slower runner? Here it is both.',
        show: 'Bigger track plus slower speed equals a very long year. Spin speed is a different thing — that sets the DAY, not the year.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'A year on Mercury is 88 days. A year on Earth is 365 days.',
          q: 'Which planet finishes more laps in the same amount of time?',
          choices: [C('Mercury', 1), C('Earth, because 365 is bigger', 'bigger-number-bias'), C('They tie', 'reversed-relation')],
          hint: 'Shorter time per lap means MORE laps get finished.',
          show: 'Fewer days per lap = more laps. 88 is smaller than 365, so Mercury laps us again and again.'
        },
        {
          story: 'Mercury takes about 88 days for one orbit.',
          q: 'About how many days for 2 orbits?',
          choices: [C('176 days', 1), C('88 days', 'part-whole-mixup'), C('90 days', 'guess-plausible')],
          hint: 'Double 88. Try 80 + 80, then 8 + 8.',
          show: '88 + 88 = 176 days. (80+80=160, 8+8=16, 160+16=176.)'
        },
        {
          story: 'Two toy cars each go around a track. The red car takes 4 seconds a lap. The blue car takes 8 seconds a lap.',
          q: 'In 24 seconds, how many MORE laps does the red car finish?',
          multiStep: 1,
          choices: [C('3 more laps', 1), C('6 more laps', 'part-whole-mixup'), C('4 more laps', 'off-by-one')],
          hint: 'Red: 24 ÷ 4. Blue: 24 ÷ 8. Then find the difference.',
          show: 'Red does 6 laps, blue does 3 laps. 6 − 3 = 3 more laps. This is exactly how Mercury outruns Earth.'
        }
      ]
    },
    reading: {
      words: [
        W('faster', ['fast', 'er'], 'moving more quickly'),
        W('far', ['f', 'ar'], 'a long way off'),
        W('year', ['y', 'ear'], 'one lap around the Sun')
      ],
      sentence: 'A planet that is far from the sun moves slower, so its year is long.',
      comp: {
        q: 'What happens to a planet\'s year when the planet is farther out?',
        choices: [C('The year gets longer', 1), C('The year gets shorter', 'reversed-relation'), C('The year stays the same', 'overgeneralize')],
        hint: 'Farther, slower, so the lap takes… more time or less time?',
        show: 'Farther out means a longer year. Neptune\'s year is 165 of ours.'
      }
    }
  },

  {
    icon: '📏', title: 'Space Is Mostly Empty',
    discover: {
      intro: [
        'In pictures the planets look crowded together, but that is only to fit them on the page.',
        'If Earth were a marble, the Sun would be a beach ball a whole football field away.',
        'Space is almost all empty space, which is why the planets never bump into each other.'
      ],
      word: { w: 'scale', say: 'skayl', mean: 'shrinking real sizes down so they fit on a page' },
      check: {
        q: 'A poster shows the planets side by side, all touching. Is that how space really looks?',
        choices: [
          C('No — they are drawn close so they fit on the paper', 1),
          C('Yes, the planets are lined up like that', 'literal-appearance'),
          C('Yes, but only in summer', 'guess-plausible')
        ],
        hint: 'How big would the paper have to be to show the real distances?',
        show: 'Posters squeeze the distances. In reality you could fit all eight planets in the gap between Earth and the Moon.'
      }
    },
    numbers: {
      domain: 'measure',
      problems: [
        {
          story: 'In Chance\'s model, 1 step equals 10 million miles. He walks 9 steps to reach model Earth.',
          q: 'How many million miles does that stand for?',
          choices: [C('90 million', 1), C('19 million', 'additive-for-multiplicative'), C('10 million', 'surface-feature')],
          hint: '9 groups of 10 million.',
          show: '10 × 9 = 90 million miles — very close to Earth\'s real 93 million.'
        },
        {
          story: 'Model Mars sits 14 steps out. Model Earth sits 9 steps out.',
          q: 'How many steps between Earth and Mars in the model?',
          choices: [C('5 steps', 1), C('23 steps', 'additive-for-multiplicative'), C('14 steps', 'surface-feature')],
          hint: 'The gap between 9 and 14.',
          show: '14 − 9 = 5 steps. Finding a gap is always subtraction.'
        },
        {
          story: 'Chance paces out the model in the yard. He can walk 2 steps every second.',
          q: 'How long to walk all 14 steps to model Mars?',
          multiStep: 1,
          choices: [C('7 seconds', 1), C('28 seconds', 'additive-for-multiplicative'), C('14 seconds', 'surface-feature')],
          hint: 'How many pairs of steps are in 14?',
          show: '14 ÷ 2 = 7 seconds. Distance divided by speed gives time — every single time.'
        }
      ]
    },
    reading: {
      words: [
        W('far', ['f', 'ar'], 'a long way away'),
        W('start', ['st', 'ar', 't'], 'the beginning'),
        W('apart', ['a', 'par', 't'], 'separated, not touching')
      ],
      sentence: 'The planets are so far apart that the start of the walk feels long.',
      comp: {
        q: 'What does "far apart" tell you about the planets?',
        choices: [C('There is a lot of empty space between them', 1), C('They are all the same size', 'surface-feature'), C('They are close together', 'reversed-relation')],
        hint: 'Apart is the opposite of together.',
        show: 'Far apart means big gaps of empty space — that is why space feels so lonely and huge.'
      }
    }
  },

  {
    icon: '🔴', title: 'Mars: The Rusty Neighbor',
    discover: {
      intro: [
        'Mars looks red because its dust is full of iron that rusted, just like an old nail left in the rain.',
        'A day on Mars is 24 hours and 37 minutes — almost exactly like ours.',
        'But Mars is smaller and colder, its air is too thin to breathe, and it has two little lumpy moons.'
      ],
      word: { w: 'rust', say: 'rust', mean: 'the reddish crust iron gets when air and water touch it' },
      check: {
        q: 'Why is Mars red?',
        choices: [
          C('Its iron dust is rusted', 1),
          C('It is closer to the Sun so it got burned', 'overgeneralize'),
          C('It is red hot like a fire', 'literal-appearance')
        ],
        hint: 'Think about a rusty nail or an old bike chain. What color?',
        show: 'Rusted iron dust. Mars is actually freezing cold — red does not mean hot.'
      }
    },
    numbers: {
      domain: 'time',
      problems: [
        {
          story: 'A day on Mars is 24 hours and 37 minutes. A day on Earth is 24 hours.',
          q: 'How much longer is the Mars day?',
          choices: [C('37 minutes', 1), C('37 hours', 'unit-mixup'), C('24 minutes', 'surface-feature')],
          hint: 'The hours match. Only the extra minutes are different.',
          show: '37 minutes longer. Careful with units — 37 hours would be a whole extra day and a half.'
        },
        {
          story: 'A radio message takes about 4 minutes to fly from Earth to Mars.',
          q: 'You send a question and your friend answers instantly. How long until you hear back?',
          multiStep: 1,
          choices: [C('8 minutes', 1), C('4 minutes', 'part-whole-mixup'), C('0 minutes, radio is instant', 'overgeneralize')],
          hint: 'The message goes there AND the answer comes back. Two trips.',
          show: '4 there + 4 back = 8 minutes. That is why rovers have to drive themselves — you cannot steer with an 8-minute delay.'
        },
        {
          story: 'Mars has 2 moons. Earth has 1 moon.',
          q: 'If 5 planets each had 2 moons like Mars, how many moons total?',
          choices: [C('10 moons', 1), C('7 moons', 'additive-for-multiplicative'), C('2 moons', 'surface-feature')],
          hint: '5 groups of 2.',
          show: '2 × 5 = 10 moons.'
        }
      ]
    },
    reading: {
      words: [
        W('Mars', ['M', 'ar', 's'], 'the fourth planet'),
        W('hard', ['h', 'ar', 'd'], 'not soft'),
        W('dark', ['d', 'ar', 'k'], 'without light')
      ],
      sentence: 'The hard red dirt on Mars looks dark when the sun goes down.',
      comp: {
        q: 'Why would the Mars dirt look dark?',
        choices: [C('Because the sun went down', 1), C('Because the dirt is hard', 'surface-feature'), C('Because Mars is far away', 'guess-plausible')],
        hint: 'Look for the word "when" — it points at the cause.',
        show: 'No sunlight means no color to see. Same reason your yard looks gray at night.'
      }
    }
  },

  /* ---------------- WEEK 4 · Rockets and Telescopes ---------------- */
  {
    icon: '🚀', title: 'Why a Rocket Pushes Down to Go Up',
    discover: {
      intro: [
        'Every push comes in a pair. Push a wall while wearing skates and YOU roll backwards.',
        'A rocket throws hot gas down really hard, and that same push shoves the rocket up.',
        'It does not need air to push against. It pushes against its own gas, which is why rockets work in space.'
      ],
      word: { w: 'thrust', say: 'thrust', mean: 'the pushing force a rocket makes' },
      check: {
        q: 'A rocket is way out in space where there is no air. Can it still steer and speed up?',
        choices: [
          C('Yes — it pushes on the gas it throws out', 1),
          C('No, it needs air to push against', 'overgeneralize'),
          C('Only if it is going downhill', 'guess-plausible')
        ],
        hint: 'On skates, do you need air to push against — or just the wall?',
        show: 'The gas is the thing being pushed. Push it back hard, and it pushes you forward just as hard.'
      }
    },
    numbers: {
      domain: 'physics',
      problems: [
        {
          story: 'Chance sits on a skateboard and throws a heavy ball forward.',
          q: 'What happens to Chance?',
          choices: [C('He rolls backwards', 1), C('He rolls forward with the ball', 'reversed-relation'), C('Nothing, he is too heavy', 'guess-plausible')],
          hint: 'Pushes come in pairs, in opposite directions.',
          show: 'Ball goes forward, Chance goes backward. That is a rocket, built out of a skateboard.'
          },
        {
          story: 'A rocket needs 8 seconds of engine burn to clear the tower. It has been burning for 3 seconds.',
          q: 'How many more seconds?',
          choices: [C('5 seconds', 1), C('11 seconds', 'additive-for-multiplicative'), C('8 seconds', 'surface-feature')],
          hint: '8 needed, 3 done.',
          show: '8 − 3 = 5 seconds left.'
        },
        {
          story: 'A rocket climbs 2 miles every 10 seconds.',
          q: 'How high after 30 seconds?',
          multiStep: 1,
          choices: [C('6 miles', 1), C('2 miles', 'surface-feature'), C('60 miles', 'unit-mixup')],
          hint: 'How many 10-second chunks are in 30 seconds? Then 2 miles for each chunk.',
          show: '30 ÷ 10 = 3 chunks. 2 × 3 = 6 miles up.'
        }
      ]
    },
    reading: {
      words: [
        W('speed', ['sp', 'ee', 'd'], 'how fast something moves'),
        W('need', ['n', 'ee', 'd'], 'must have'),
        W('seat', ['s', 'ea', 't'], 'a place to sit')
      ],
      sentence: 'You need to stay in your seat when the rocket picks up speed.',
      comp: {
        q: 'Why would you need to stay in your seat?',
        choices: [
          C('The rocket is speeding up hard', 1),
          C('The seat is comfortable', 'surface-feature'),
          C('There is no gravity yet', 'guess-plausible')
        ],
        hint: 'What is happening in the second half of the sentence?',
        show: 'Speeding up hard presses you into the seat — astronauts feel three times their own weight.'
      }
    }
  },

  {
    icon: '⛽', title: 'A Rocket Gets Lighter As It Flies',
    discover: {
      intro: [
        'Most of a rocket on the launch pad is fuel, not rocket.',
        'As the fuel burns, the rocket gets lighter and lighter, so the same engine can push it faster.',
        'Big rockets even drop empty pieces on the way up. Why haul an empty tank to space?'
      ],
      word: { w: 'fuel', say: 'FYOO-ul', mean: 'the stuff that burns to make power' },
      check: {
        q: 'A rocket speeds up more and more as it climbs, even with the same engine. Why?',
        choices: [
          C('It keeps getting lighter as fuel burns away', 1),
          C('The engine gets stronger the higher it goes', 'guess-plausible'),
          C('Gravity gives up once you are high enough', 'overgeneralize')
        ],
        hint: 'Push an empty wagon, then a wagon full of rocks. Which one speeds up faster?',
        show: 'Same push on less mass means more speed. That is why the last minute of a launch is the fastest.'
      }
    },
    numbers: {
      domain: 'algebra',
      problems: [
        {
          story: 'A model rocket starts with 20 units of fuel and burns 4 units every second.',
          q: 'How much fuel is left after 3 seconds?',
          multiStep: 1,
          choices: [C('8 units', 1), C('12 units', 'off-by-one'), C('16 units', 'ignored-condition')],
          hint: 'Burned so far: 4 × 3. Then take that away from 20.',
          show: '4 × 3 = 12 burned. 20 − 12 = 8 units left.'
        },
        {
          story: 'Same rocket: 20 units of fuel, 4 units burned each second.',
          q: 'How many seconds until the tank is empty?',
          choices: [C('5 seconds', 1), C('4 seconds', 'surface-feature'), C('20 seconds', 'surface-feature')],
          hint: 'How many 4s fit into 20?',
          show: '20 ÷ 4 = 5 seconds. Total divided by rate gives time.'
        },
        {
          story: 'Pattern of fuel left each second: 20, 16, 12, 8, …',
          q: 'What comes next?',
          choices: [C('4', 1), C('6', 'guess-plausible'), C('0', 'sequence-error')],
          hint: 'How much does it drop each step? Take that off of 8.',
          show: 'It drops 4 each time, so 8 − 4 = 4. Then the step after that is 0 — empty.'
        }
      ]
    },
    reading: {
      words: [
        W('heat', ['h', 'ea', 't'], 'hotness'),
        W('leak', ['l', 'ea', 'k'], 'to let liquid escape'),
        W('clean', ['cl', 'ea', 'n'], 'not dirty')
      ],
      sentence: 'The team keeps the fuel tank clean so it will not leak in the heat.',
      comp: {
        q: 'Why does the team keep the tank clean?',
        choices: [C('So it will not leak', 1), C('So it looks nice', 'surface-feature'), C('To make it lighter', 'guess-plausible')],
        hint: 'The word "so" tells you the reason. Read what comes after it.',
        show: '"So it will not leak" is the reason. Engineers check for leaks before every single launch.'
      }
    }
  },

  {
    icon: '🔭', title: 'Telescopes Catch Light',
    discover: {
      intro: [
        'A telescope is really a light bucket. The wider it is, the more starlight it can catch.',
        'More light caught means you can see fainter, farther things.',
        'It also bends that light to make the picture bigger — that is magnifying.'
      ],
      word: { w: 'magnify', say: 'MAG-nih-fye', mean: 'to make something look bigger than it is' },
      check: {
        q: 'Two telescopes are pointed at the same faint star. One has a wide mirror, one narrow. Which sees the star better?',
        choices: [
          C('The wide one — it catches more light', 1),
          C('The narrow one, because the light is squeezed together', 'reversed-relation'),
          C('They are the same if both are clean', 'overgeneralize')
        ],
        hint: 'Set out a wide bucket and a narrow cup in the rain. Which catches more?',
        show: 'Wider means more light collected, so fainter objects show up. That is why the giant telescopes are on mountaintops.'
      }
    },
    numbers: {
      domain: 'geometry',
      problems: [
        {
          story: 'Chance covers a mirror with paper squares to measure it. It takes 3 rows of 4 squares.',
          q: 'How many squares cover the mirror?',
          choices: [C('12 squares', 1), C('7 squares', 'additive-for-multiplicative'), C('14 squares around the edge', 'perimeter-area-mixup')],
          hint: '3 rows, 4 in each row. Rows and columns make a rectangle.',
          show: '4 × 3 = 12 squares. Covering the inside is called area, and rows-times-columns is how you find it.'
        },
        {
          story: 'A second mirror needs 6 rows of 4 squares.',
          q: 'How many more squares than the first mirror (which needed 12)?',
          multiStep: 1,
          choices: [C('12 more', 1), C('24 more', 'part-whole-mixup'), C('2 more', 'surface-feature')],
          hint: 'First find 6 × 4, then take away 12.',
          show: '6 × 4 = 24. 24 − 12 = 12 more squares. Doubling the rows doubled the light-catching area.'
        },
        {
          story: 'A telescope makes things look 10 times bigger. A crater looks 30 units wide through the eyepiece.',
          q: 'How wide would it look with just your eyes?',
          choices: [C('3 units', 1), C('300 units', 'reversed-relation'), C('20 units', 'additive-for-multiplicative')],
          hint: 'The telescope multiplied by 10. To undo that, divide by 10.',
          show: '30 ÷ 10 = 3 units. Undoing a multiplication is division — that is inverse thinking.'
        }
      ]
    },
    reading: {
      words: [
        W('see', ['s', 'ee'], 'to look at with your eyes'),
        W('deep', ['d', 'ee', 'p'], 'going far in'),
        W('beam', ['b', 'ea', 'm'], 'a narrow line of light')
      ],
      sentence: 'With a telescope you can see a beam of light from deep in space.',
      comp: {
        q: 'What does the telescope help you do?',
        choices: [C('See light from far away', 1), C('Make light brighter in space', 'literal-appearance'), C('Travel deep into space', 'surface-feature')],
        hint: 'Find the verb — the doing word — right after "you can".',
        show: 'It helps you SEE. It does not change the star at all; it just gathers the light that was already coming.'
      }
    }
  },

  {
    icon: '📡', title: 'Even Light Takes Time',
    discover: {
      intro: [
        'Light is the fastest thing there is, but it is not instant. It still takes time to travel.',
        'Sunlight needs about 8 minutes to reach your face from the Sun.',
        'So when you look up at the Sun, you are seeing 8-minute-old news.'
      ],
      word: { w: 'delay', say: 'dee-LAY', mean: 'the waiting time before something arrives' },
      check: {
        q: 'If the Sun suddenly went dark, when would we notice?',
        choices: [
          C('About 8 minutes later', 1),
          C('Instantly', 'overgeneralize'),
          C('The next morning', 'guess-plausible')
        ],
        hint: 'The last light already on its way still has to finish the trip.',
        show: 'About 8 minutes. Light in flight keeps flying — the sky would stay bright until the last of it arrived.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'Sunlight takes 8 minutes to reach Earth. Light to Mars takes about 12 minutes.',
          q: 'How much longer to reach Mars?',
          choices: [C('4 minutes longer', 1), C('20 minutes longer', 'additive-for-multiplicative'), C('12 minutes longer', 'surface-feature')],
          hint: 'The gap between 8 and 12.',
          show: '12 − 8 = 4 minutes longer, because Mars sits farther out.'
        },
        {
          story: 'Thunder is sound, and sound is much slower than light. Sound travels about 1 mile every 5 seconds.',
          q: 'Chance sees lightning and counts 10 seconds before the thunder. How far away was it?',
          multiStep: 1,
          choices: [C('2 miles', 1), C('10 miles', 'surface-feature'), C('50 miles', 'additive-for-multiplicative')],
          hint: 'How many 5-second chunks are in 10 seconds? One mile per chunk.',
          show: '10 ÷ 5 = 2 miles. You see it first because light wins the race every time.'
        },
        {
          story: 'Sound needs 5 seconds per mile.',
          q: 'How many seconds for thunder from 4 miles away?',
          choices: [C('20 seconds', 1), C('9 seconds', 'additive-for-multiplicative'), C('4 seconds', 'surface-feature')],
          hint: '5 seconds for each of the 4 miles.',
          show: '5 × 4 = 20 seconds. Rate times distance gives the time.'
        }
      ]
    },
    reading: {
      words: [
        W('reach', ['r', 'ea', 'ch'], 'to arrive at'),
        W('team', ['t', 'ea', 'm'], 'a group working together'),
        W('week', ['w', 'ee', 'k'], 'seven days')
      ],
      sentence: 'It can take a week for the team to reach the far side of the desert.',
      comp: {
        q: 'How long does the trip take?',
        choices: [C('A week', 1), C('A day', 'guess-plausible'), C('Forever', 'surface-feature')],
        hint: 'Find the time word in the sentence.',
        show: 'A week. Even fast things need time to cover big distances — light included.'
      }
    }
  },

  {
    icon: '👩‍🚀', title: 'Living in Orbit',
    discover: {
      intro: [
        'The space station circles Earth about once every 90 minutes, so astronauts see 16 sunrises a day.',
        'They are not weightless because gravity stopped. They are falling around Earth, and everything falls with them.',
        'Floating means falling together. Nothing to press against means nothing feels heavy.'
      ],
      word: { w: 'astronaut', say: 'ASS-truh-nawt', mean: 'a person trained to live and work in space' },
      check: {
        q: 'Why do astronauts float inside the space station?',
        choices: [
          C('They are falling around Earth, and their station falls with them', 1),
          C('There is no gravity that high up', 'overgeneralize'),
          C('Space suits are filled with something lighter than air', 'guess-plausible')
        ],
        hint: 'If gravity were gone up there, what would keep the station in orbit at all?',
        show: 'Gravity is still pulling — that is what holds the orbit. Falling together is what floating actually is.'
      }
    },
    numbers: {
      domain: 'time-distance-speed',
      problems: [
        {
          story: 'One orbit takes 90 minutes.',
          q: 'How long for 2 orbits?',
          choices: [C('180 minutes', 1), C('90 minutes', 'part-whole-mixup'), C('92 minutes', 'additive-for-multiplicative')],
          hint: 'Double 90.',
          show: '90 + 90 = 180 minutes, which is 3 hours.'
        },
        {
          story: 'One orbit is 90 minutes. There are 60 minutes in an hour.',
          q: 'How many hours and minutes is one orbit?',
          multiStep: 1,
          choices: [C('1 hour 30 minutes', 1), C('9 hours', 'unit-mixup'), C('90 hours', 'unit-mixup')],
          hint: 'Pull one 60-minute hour out of 90. What is left over?',
          show: '90 − 60 = 30, so it is 1 hour and 30 minutes. Always check which unit you are in.'
        },
        {
          story: 'Astronauts see a sunrise every 90 minutes. A day is 24 hours, which is 1440 minutes.',
          q: 'About how many sunrises in one day?',
          multiStep: 1,
          choices: [C('16 sunrises', 1), C('1 sunrise', 'overgeneralize'), C('24 sunrises', 'surface-feature')],
          hint: 'How many 90s fit in 1440? Try counting by 90s, or think 90 × 16.',
          show: '1440 ÷ 90 = 16 sunrises. Sixteen mornings in one Earth day.'
        }
      ]
    },
    reading: {
      words: [
        W('sleep', ['sl', 'ee', 'p'], 'to rest with your eyes closed'),
        W('meal', ['m', 'ea', 'l'], 'food you sit down to eat'),
        W('sea', ['s', 'ea'], 'a big body of salt water')
      ],
      sentence: 'The crew eat a meal and then sleep while they float high over the sea.',
      comp: {
        q: 'Where is the crew while they sleep?',
        choices: [C('Floating in orbit above the ocean', 1), C('In a boat on the sea', 'surface-feature'), C('On the Moon', 'guess-plausible')],
        hint: 'The words "float high over" tell you where they are.',
        show: 'They are in orbit, above the sea — sleeping strapped down so they do not drift into a wall.'
      }
    }
  }

  ]);
})();
