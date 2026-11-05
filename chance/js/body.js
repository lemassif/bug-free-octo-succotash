/* ============================================================
   body.js — 🩺 My Body: blood, tonsils, and Finn's Tonsil Adventure

   Made for the week before Chance's tonsillectomy. He had blood
   drawn, watched it go into a tube, shook it, and asked whether he
   gets his blood back after surgery. Three little books:

     🩸 My Amazing Blood   real microscope photos of human blood;
                           tap any cell to hear what it does, a
                           find-the-cell game, why they test blood
                           before surgery, and his own question
     👄 My Tonsils         where they are (tap the open mouth), what
                           they do, strep, and why it is fine to
                           live without them
     📖 Finn's Tonsil      a story about a 7-year-old who loves
        Adventure          fishing and soccer, from strep throat to
                           the operating room (tap everything: the
                           lights, the monitor, the masks, the
                           gloves, the laser) to two weeks of ice
                           cream, games and homework, all better in
                           time for Thanksgiving, wrestling, skiing
                           and Christmas

   Written the way hospital child life specialists prepare a child
   his age: honest and concrete, told through another child, no
   scary words ("special sleep", "sleep doctor", "wake-up room"),
   every feeling allowed, and what he will see, hear and feel, in
   order. Every sentence is a fixed line, so all of it can be
   recorded in a grown-up's own voice in the booth.
   ============================================================ */

window.BodyLab = (function () {

  var KEY = 'chance.body.v1';
  var state = { surgery: '', seen: {} };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  if (!state.seen || typeof state.seen !== 'object') state.seen = {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function talk(line) { return Voice.say(line); }
  function photo(k) { return (window.BODY_PHOTOS || {})[k] || null; }

  /* ============================ THE BOOKS ===========================
     A page: title, art (big emoji scene), text (read aloud, one line
     at a time), and taps (pictures he can touch to hear about).
     Special pages: kind 'micro' (a real microscope photo), 'find'
     (a find-the-cell game on one), 'mouth' (the open-mouth picture),
     'calendar' (two weeks of getting better). */

  var CELL_SAY = {
    red: 'A red blood cell! It carries oxygen from your lungs to every part of your body, like a tiny delivery truck. ' +
         'It is shaped like a donut with a dent instead of a hole.',
    white: 'A white blood cell! This one is a germ fighter. It finds germs, like strep germs, and gobbles them up.',
    lympho: 'This round white blood cell is called a lymphocyte. Lim-fo-site. It remembers germs, so your body can fight them faster next time.',
    eosino: 'This white blood cell is full of orange and pink dots. It is called an eosinophil. Ee-oh-sin-oh-fill. It fights bigger germs, even worms!',
    platelet: 'A platelet! Platelets are tiny patch makers. When you get a cut, they stick together to stop the bleeding and make a scab.'
  };

  var BOOKS = [
    {
      id: 'blood', em: '🩸', name: 'My Amazing Blood', color: '#ffe3e3', edge: '#ffb3b3',
      sub: 'Real blood cells under a microscope',
      pages: [
        {
          title: 'The blood test', art: '🧑‍⚕️ 💪 🧪', hero: 'tubes_rack',
          text: ['Today a nurse called a phlebotomist took a little bit of your blood.',
            'Phlebotomist is a big word. Fleh-BOT-oh-mist. It means a blood helper!',
            'She filled some small tubes. All together, it was only about a spoonful of blood.'],
          taps: [
            { em: '🧪', name: 'The tubes', photo: 'tube_blood', say: 'The tubes have different colored caps. Each color tells the lab which test to do.' },
            { em: '💪', name: 'Your arm', say: 'The blood came from a vein in your arm. Veins are the bluish lines you can see under your skin.' },
            { em: '🩹', name: 'The bandage', say: 'The bandage covers the tiny hole while it closes up. Platelets in your blood patch it in just a few minutes.' },
            { em: '🥄', name: 'A spoonful', say: 'A boy your size has about seven cups of blood. The nurse took about a spoonful. Your body hardly missed it!' }
          ]
        },
        {
          title: 'Why shake the tube?', art: '🧪 🔄 🧪',
          text: ['The nurse let you shake the tube. Inside the tube is a special medicine.',
            'Shaking mixes it in. It stops the blood from getting thick and clumpy, so the lab can look at it.',
            'Blood is thicker than water. That is why it made those cool shapes and slid down the sides of the tube!'],
          taps: [
            { em: '🔄', name: 'Gentle shakes', say: 'Nurses tip the tube back and forth gently, about eight times. Not too hard, or the cells get bumped around!' },
            { em: '🧲', name: 'Sticky blood', say: 'Blood is sticky because it is full of cells and proteins. That is why it coated the tube.' },
            { em: '🔴', name: 'Why red?', say: 'Blood is red because of red blood cells. There are so many of them that they make the whole thing red.' }
          ]
        },
        {
          title: 'Under a microscope', kind: 'micro', photo: 'smear1',
          text: ['Scientists put one drop of blood on a piece of glass and look at it through a microscope.',
            'This is a real photo of human blood! The purple color is a dye that helps scientists see the cells.',
            'Tap the cells to find out what they do.'],
          white: function () { return CELL_SAY.white; }
        },
        {
          title: 'A different white cell', kind: 'micro', photo: 'smear2',
          text: ['Here is another real photo. There is a different kind of white blood cell in it.',
            'It is the dark purple round one. Can you find it?',
            'Look for the tiny purple specks, too. Those are platelets.'],
          white: function () { return CELL_SAY.lympho; }
        },
        {
          title: 'Orange dots!', kind: 'micro', photo: 'smear3',
          text: ['This photo has a white blood cell full of orange and pink dots.',
            'Tap it, and tap the other white cell in the corner too.'],
          white: function (c) { return (c[1] + c[3]) / 2 > 200 ? CELL_SAY.eosino : CELL_SAY.white; }
        },
        {
          title: 'Blood in 3D', art: '🔬 🩸 ✨', hero: 'sem_color',
          text: ['Some microscopes are so strong they can take pictures of blood cells in 3D. They are called electron microscopes.',
            'Look at the red blood cell. It really is shaped like a donut with a dent in the middle!',
            'The spiky yellow one is a platelet getting ready to make a patch. The fuzzy ball is a white blood cell.'],
          taps: [
            { em: '🔴', name: 'Lots of red cells', photo: 'sem_bw', say: 'This one has no colors added. Can you find the dented donuts? Those are red blood cells. The two bumpy balls are white blood cells.' },
            { em: '📏', name: 'How small?', say: 'A red blood cell is so small that about sixty of them in a row would fit across the dot on a letter i.' }
          ]
        },
        {
          title: 'Blood detective', kind: 'find', photo: 'smear2',
          text: ['Now you are the blood detective!'],
          goals: [
            { kind: 'white', n: 1, ask: 'Find the white blood cell.', yes: 'You found the white blood cell, the germ fighter!' },
            { kind: 'platelet', n: 3, ask: 'Now find three platelets. They are the tiny purple specks.', yes: 'Three platelets! The patch makers!' },
            { kind: 'red', n: 5, ask: 'Last one. Tap five red blood cells.', yes: 'Five red blood cells! You are a real blood detective!' }
          ]
        },
        {
          title: 'Why test blood before surgery?', art: '🔬 📋 ✅',
          text: ['Why did the doctor want to test your blood?',
            'The lab counts your blood cells. It checks that you have plenty of platelets, the patch makers.',
            'That helps your throat heal well after the surgery.'],
          taps: [
            { em: '🔬', name: 'The lab', say: 'In the lab, a machine counts thousands of blood cells in about a minute. Way faster than counting by hand!' },
            { em: '📋', name: 'The results', say: 'The results go to your doctor. They help the doctor make sure you are ready.' },
            { em: '🩹', name: 'Platelets', say: 'After surgery, platelets make patches in your throat while it heals, just like on a scraped knee.' }
          ]
        },
        {
          title: 'Do I get my blood back?', art: '🤔 🧪 ❓',
          text: ['Chance asked a great question. Do I get my blood back after surgery?',
            'The answer is no. The lab used that blood for the tests, and then it was finished.',
            'But here is something amazing. Your body makes brand new blood every single day, inside your bones.',
            'It makes millions of new red blood cells every second! The little bit the nurse took gets replaced all by itself.'],
          taps: [
            { em: '🦴', name: 'Bone marrow', say: 'The soft middle of a bone is called bone marrow. It is your blood factory!' },
            { em: '⏱️', name: 'Every second', say: 'Count one, two, three. In those three seconds, your body made about six million new red blood cells!' },
            { em: '🥤', name: 'Help it out', say: 'Drinking water and eating good food gives your blood factory what it needs.' }
          ],
          star: 'Blood expert! You earned a star.'
        }
      ]
    },
    {
      id: 'tonsils', em: '👄', name: 'My Tonsils', color: '#ffeef5', edge: '#ffc2dc',
      sub: 'Where they are and what they do',
      pages: [
        {
          title: 'Where are my tonsils?', kind: 'mouth',
          text: ['Open wide and say ahh!',
            'At the back of your mouth there are two pink bumps, one on each side.',
            'Those are your tonsils. Tap the picture to find them.']
        },
        {
          title: 'What do tonsils do?', art: '🛡️ 👄 🦠',
          text: ['Tonsils are like guards at the door of your throat.',
            'They catch germs that come in with your food and with the air you breathe.',
            'They do their most important work when you are a baby.'],
          taps: [
            { em: '🛡️', name: 'Germ guards', say: 'Tonsils are full of white blood cells, the same germ fighters you saw in the microscope!' },
            { em: '👶', name: 'Baby helpers', say: 'Tonsils help babies learn to fight germs. By the time you are seven, the rest of your body knows how.' }
          ]
        },
        {
          title: 'Strep throat', art: '🦠 🔗 🤒',
          text: ['Sometimes germs hide in the tonsils and make them sick.',
            'Strep throat comes from a germ called strep. Strep germs line up in chains, like beads on a necklace.',
            'If the tonsils get strep again and again, doctors may decide it is better to take them out.'],
          taps: [
            { em: '🔗', name: 'Chains', say: 'Strep is short for streptococcus. Strep-toe-cock-us. It means twisted chain!' },
            { em: '🧪', name: 'Strep test', say: 'A doctor checks for strep with a long cotton swab. It tickles the back of your throat for one second.' },
            { em: '💊', name: 'Medicine', say: 'Strep is treated with a medicine called an antibiotic. But when it keeps coming back, taking out the tonsils can stop it.' }
          ]
        },
        {
          title: 'Is it OK not to have tonsils?', art: '👍 🛡️ 💪',
          text: ['Yes! You have lots of other germ guards all over your body.',
            'Your white blood cells keep fighting germs, even without tonsils.',
            'Most kids who have their tonsils out get fewer sore throats.'],
          taps: [
            { em: '🛡️', name: 'More guards', say: 'You have little germ guards called lymph nodes in your neck, under your arms, and in your tummy.' },
            { em: '⚽', name: 'More playing', say: 'Fewer sore throats means fewer sick days, and more days for soccer and fishing!' }
          ],
          star: 'Tonsil expert! You earned a star.'
        }
      ]
    },
    {
      id: 'story', em: '📖', name: 'Finn\'s Tonsil Adventure', color: '#e6f4ff', edge: '#a9d6ff',
      sub: 'A story about a boy just like you',
      pages: [
        {
          title: 'Meet Finn', art: '🧒 🎣 ⚽',
          text: ['This is Finn. Finn is seven years old.',
            'Finn has two favorite sports. He loves to go fishing, and he loves to play soccer.',
            'Once, Finn caught a fish almost as long as his arm!'],
          taps: [
            { em: '🎣', name: 'Fishing', say: 'Finn\'s best fishing trick: be very quiet, and very patient.' },
            { em: '⚽', name: 'Soccer', say: 'Finn\'s favorite thing in soccer is a big kick into the corner of the goal.' },
            { em: '🐟', name: 'The big fish', say: 'Finn let the fish go, so it could grow even bigger.' }
          ]
        },
        {
          title: 'Strep again!', art: '🤒 🛋️ 😞',
          text: ['But Finn kept getting sick. His throat hurt so much that it was hard to swallow.',
            'It was strep throat, again, and again, and again.',
            'He missed soccer games and fishing trips. Finn was tired of being sick.'],
          taps: [
            { em: '🌡️', name: 'Fever', say: 'A fever means your body is heating up to fight the germs.' },
            { em: '🦠', name: 'Strep', say: 'The strep germs kept hiding in Finn\'s tonsils, and coming back.' }
          ]
        },
        {
          title: 'The throat doctor', art: '👩‍⚕️ 🔦 👄',
          text: ['Finn went to a special doctor, called an ear, nose and throat doctor.',
            'She shined a light in his mouth. Your tonsils are big, she said, and they keep catching strep.',
            'We can take them out, so you stop getting sick so often. It is called a tonsillectomy.'],
          taps: [
            { em: '🔦', name: 'The light', say: 'The doctor\'s light helps her see all the way to the back of your throat.' },
            { em: '🗣️', name: 'Tonsillectomy', say: 'Ton-sil-EK-toe-mee. Tonsil, plus ectomy, which means taking out.' },
            { em: '❓', name: 'Questions', say: 'Finn asked lots of questions. Asking questions is smart and brave.' }
          ]
        },
        {
          title: 'Finn\'s feelings', art: '😟 💬 🙂',
          text: ['Finn felt a little worried. That is okay! Lots of kids feel nervous before surgery.',
            'Finn told his mom and dad how he felt. Talking about it helped.',
            'Then he made a list of fun things to do while he got better.'],
          taps: [
            { em: '💬', name: 'Feelings', say: 'Any feeling is okay. Worried, curious, excited, or all three at once!' },
            { em: '🧸', name: 'A friend', say: 'Finn decided to bring his favorite stuffed animal to the hospital.' },
            { em: '📝', name: 'Fun list', say: 'Finn\'s list: ice cream, movies, board games, video games, and building a giant fort.' }
          ]
        },
        {
          title: 'The blood test', art: '🧪 🩸 🔬',
          text: ['A few days before surgery, Finn had a blood test, just like you.',
            'He watched his blood go into a tube, and he got to shake it!',
            'The lab checked that his blood was ready to help him heal.'],
          taps: [
            { em: '🔬', name: 'The lab', say: 'Remember the cells you saw in the microscope? The lab counted Finn\'s cells, too.' }
          ]
        },
        {
          title: 'The night before', art: '🌙 🎒 🧸',
          text: ['The night before surgery, the doctor said: no food after bedtime, and no breakfast in the morning.',
            'An empty tummy keeps you safe during the special sleep.',
            'Finn packed his stuffed animal and his softest pajamas.'],
          taps: [
            { em: '🍳', name: 'No breakfast', say: 'Your doctor tells your grown-ups exactly when to stop eating and drinking. After surgery, you get to eat again!' },
            { em: '🎒', name: 'Packing', say: 'Good things to bring: a stuffed animal, a blanket, comfy clothes, and a tablet or a book.' }
          ]
        },
        {
          title: 'At the hospital', art: '🏥 📛 👕',
          text: ['At the hospital, a nurse gave Finn a bracelet with his name on it.',
            'He changed into hospital pajamas, called a gown.',
            'Then the nurse checked his body. Tap the pictures to see how.'],
          taps: [
            { em: '📛', name: 'Name bracelet', photo: 'wristband', say: 'The name bracelet tells everyone who you are, so they always take care of the right kid.' },
            { em: '👕', name: 'Hospital gown', photo: 'gown', say: 'The hospital gown is soft and loose. It ties or snaps in the back.' },
            { em: '💪', name: 'Arm hug', photo: 'bpcuff', say: 'This band gives your arm a tight hug, then lets go. It measures how hard your heart is pumping.' },
            { em: '☝️', name: 'Finger light', photo: 'oximeter', say: 'This clip has a little red light. It shines through your finger to check how much oxygen is in your blood. It does not hurt at all.' },
            { em: '🌡️', name: 'Thermometer', photo: 'thermometer', say: 'The thermometer checks that you do not have a fever.' },
            { em: '⚖️', name: 'Scale', photo: 'scale', say: 'The nurse checks how much you weigh, so the doctors give you just the right amount of medicine.' }
          ]
        },
        {
          title: 'Meet the team', art: '👩‍⚕️ 🧑‍⚕️ 👨‍⚕️', hero: 'team_tech',
          text: ['Lots of helpers came to say hello.',
            'The sleep doctor gives the medicine for the special sleep, and watches Finn the whole time.',
            'The surgeon is the doctor who takes out the tonsils. The nurses help everybody.'],
          taps: [
            { em: '😴', name: 'Sleep doctor', say: 'The sleep doctor has a big name: anesthesiologist. An-es-thee-zee-OL-oh-jist. The sleep doctor stays right next to you the whole time you are asleep.' },
            { em: '🩺', name: 'Surgeon', say: 'The surgeon does the operation. Finn\'s surgeon used a laser.' },
            { em: '🧑‍⚕️', name: 'Nurses', say: 'Nurses help you get ready, and they are there when you wake up.' },
            { em: '🥤', name: 'Calm medicine', say: 'Some kids get a little drink of medicine before surgery. It makes them feel calm, and a little silly.' }
          ]
        },
        {
          title: 'The operating room', art: '🚪 💡 🛏️', hero: 'or_room',
          text: ['Then Finn rode into the operating room. It looked like a room on a space ship!',
            'It was a little cold, so the nurses tucked him in with a warm blanket.',
            'Tap the pictures to see what is in the operating room.'],
          taps: [
            { em: '💡', name: 'Big lights', photo: 'or_lights', say: 'These giant round lights are super bright, so the doctors can see clearly.' },
            { em: '🛏️', name: 'The bed', photo: 'or_bed', say: 'The operating bed is narrow, just right for a kid. A strap keeps you safe, like a seat belt in a car.' },
            { em: '📈', name: 'Heart monitor', photo: 'or_monitor', say: 'The monitor shows your heartbeat as wiggly lines. Beep, beep, beep. That beeping is your heart\'s song.' },
            { em: '🫁', name: 'Sleep machine', photo: 'sleep_machine', say: 'This is the sleep doctor\'s machine. It gives the sleep medicine through the mask, and helps watch your breathing the whole time.' },
            { em: '❤️', name: 'Heart stickers', say: 'Sticky circles go on your chest. They tell the monitor about your heartbeat. They peel off like stickers.' },
            { em: '🌬️', name: 'Sleep mask', photo: 'or_mask', say: 'The sleep mask goes over your nose and mouth. You just breathe normally. Some hospitals let you pick a smell, like strawberry or bubble gum.' },
            { em: '🔦', name: 'Laser machine', photo: 'laser', say: 'The laser machine makes a very thin, very strong beam of light. You are asleep the whole time it is used.' },
            { em: '🤗', name: 'Warm blanket', say: 'Operating rooms are kept cool. Warm blankets keep you cozy.' }
          ]
        },
        {
          title: 'What everyone wears', art: '🧢 😷 🧤', hero: 'surgeon',
          text: ['Everyone in the operating room wears special clothes. Underneath, they are smiling at you!',
            'Tap each one to find out why.'],
          taps: [
            { em: '🧢', name: 'Hat', photo: 'cap', say: 'The cap keeps hair tucked in, so not even one hair falls where it should not.' },
            { em: '😷', name: 'Mask', photo: 'mask', say: 'Germs can float out in our breath. The mask keeps the doctor\'s germs away from your mouth and throat.' },
            { em: '🥼', name: 'Gown', photo: 'surg_gown', say: 'The gown is super clean. It covers the doctor\'s clothes, which might have germs on them.' },
            { em: '🧤', name: 'Gloves', photo: 'gloves', say: 'The gloves are sterile. That means there are zero germs on them. The doctor scrubs hands for a long time before putting them on.' },
            { em: '🥽', name: 'Goggles', photo: 'goggles', say: 'Laser light can hurt eyes, so everyone in the room wears special goggles. Your eyes get covered too, while you sleep.' },
            { em: '👟', name: 'Shoe covers', say: 'Shoe covers keep dirt from the floor out of the operating room.' }
          ]
        },
        {
          title: 'The special sleep', art: '🌬️ 😴 💤',
          text: ['The sleep doctor held the mask near Finn\'s face. Finn breathed in and out.',
            'He started counting, one, two, three, and fell into the special sleep.',
            'In the special sleep, you do not feel anything, you do not hear anything, and you do not wake up until it is all done.'],
          taps: [
            { em: '🔢', name: 'Counting', say: 'Some kids try to count to ten. Most fall asleep before they get there!' },
            { em: '🧸', name: 'Waiting friend', say: 'Finn\'s stuffed animal waited for him in the wake-up room.' }
          ]
        },
        {
          title: 'How the laser works', art: '🔦 ✨ 🎯',
          text: ['While Finn slept, the surgeon used a laser.',
            'A laser is light squeezed into a very thin, very strong beam.',
            'It can take out the tonsils, and it closes up tiny blood vessels at the same time, so there is less bleeding.',
            'The whole surgery takes less than an hour.'],
          taps: [
            { em: '💡', name: 'Normal light', say: 'Light from a lamp spreads out in every direction.' },
            { em: '✨', name: 'Laser light', say: 'Laser light all goes the same way, in one thin, straight line. That makes it strong enough to do surgery.' },
            { em: '🎯', name: 'Careful aim', say: 'The surgeon aims very carefully, at just the tonsils, and nothing else.' }
          ]
        },
        {
          title: 'The wake-up room', art: '🛏️ 👨‍👩‍👦 🍧',
          text: ['Finn woke up in the wake-up room. His mom and dad were right there.',
            'His throat was sore, and he felt sleepy and a little grumpy. That is normal.',
            'He saw a little tube taped to his hand. It went in while he was asleep, so he did not feel it.',
            'Then a nurse brought him a popsicle!'],
          taps: [
            { em: '🍧', name: 'Popsicle', say: 'Cold things feel great on a sore throat.' },
            { em: '💧', name: 'The little tube', say: 'That little tube is called an I V. It gives your body water and medicine. It comes out before you go home.' },
            { em: '😴', name: 'Sleepy', say: 'The sleep medicine takes a while to wear off. A long nap helps.' }
          ]
        },
        {
          title: 'Home to rest', art: '🏠 🛋️ 🍦',
          text: ['Finn went home to rest on the couch.',
            'He drank lots and lots of cold drinks. Drinking helps a throat heal.',
            'And he could have as much ice cream as he wanted! Tap the soft foods.'],
          taps: [
            { em: '🍦', name: 'Ice cream', say: 'Ice cream is a sore throat\'s best friend. Cold and smooth!' },
            { em: '🍧', name: 'Popsicles', say: 'Popsicles count as drinking, and they feel great.' },
            { em: '🍮', name: 'Pudding', say: 'Pudding slides right down.' },
            { em: '🍎', name: 'Applesauce', say: 'Applesauce is soft and sweet.' },
            { em: '🥔', name: 'Mashed potatoes', say: 'Mashed potatoes are soft and warm, not hot.' },
            { em: '🧀', name: 'Mac and cheese', say: 'Soft mac and cheese is a good dinner.' },
            { em: '🍳', name: 'Scrambled eggs', say: 'Scrambled eggs are soft and give you energy to heal.' },
            { em: '🚫', name: 'Not yet: crunchy', say: 'No chips, crackers or crunchy food for a while. They are scratchy on a healing throat.' }
          ]
        },
        {
          title: 'Games and homework', art: '🎲 🎮 📚',
          text: ['Finn could not play soccer for a while, so he found other fun things to do.',
            'He played board games and video games, built with blocks, and watched movies about fishing.',
            'His school sent homework home, so he did a little bit each day to keep up.'],
          taps: [
            { em: '🎲', name: 'Board games', say: 'Board games are perfect when you need to rest your body.' },
            { em: '🎮', name: 'Video games', say: 'Video games, from the couch. Doctor\'s orders!' },
            { em: '🧱', name: 'Building', say: 'Finn built a fishing boat out of blocks.' },
            { em: '📚', name: 'Homework', say: 'A little homework each day keeps you ready for when you go back to school.' },
            { em: '😴', name: 'Rest', say: 'Sleep is when your body does its best healing work.' }
          ]
        },
        {
          title: 'Two weeks to heal', kind: 'calendar',
          text: ['It takes about two weeks for a throat to heal after a tonsillectomy.',
            'Some days are better than others. Around day five, Finn\'s throat felt extra sore. His medicine and cold drinks helped.',
            'Day by day, Finn got stronger. Tap the days.'],
          taps: [
            { em: '🩹', name: 'White patches', say: 'If you peek in the mirror, you might see white patches at the back of your throat. That is how a throat heals, like a scab on your knee.' },
            { em: '💊', name: 'Medicine', say: 'Your grown-ups give you medicine on a schedule, so your throat stays comfortable.' }
          ]
        },
        {
          title: 'Just in time!', art: '🦃 🤼 ⛷️ 🎄',
          text: ['And then Finn was all better, just in time for Thanksgiving!',
            'He ate turkey and mashed potatoes with his whole family.',
            'Then he was ready for wrestling season, skiing in the snow, and Christmas!'],
          taps: [
            { em: '🦃', name: 'Thanksgiving', say: 'Finn was thankful for his family, his doctors, and a throat that did not hurt anymore.' },
            { em: '🤼', name: 'Wrestling', say: 'Finn\'s throat was healed and strong. Time to wrestle!' },
            { em: '⛷️', name: 'Skiing', say: 'Whoosh! Finn zoomed down the snowy hill.' },
            { em: '🎄', name: 'Christmas', say: 'Merry Christmas, Finn! No strep throat this year.' },
            { em: '⚽', name: 'Spring', say: 'And in the spring, back to soccer and fishing!' }
          ]
        },
        {
          title: 'Your turn, Chance', art: '🦸 🦁 🍦',
          text: ['Chance, just like Finn, you are going to do great.',
            'You already know about blood cells, tonsils, the operating room, and the special sleep.',
            'Be brave, ask lots of questions, and get ready for lots of ice cream!'],
          taps: [
            { em: '❓', name: 'Ask', say: 'You can ask the doctors and nurses anything. They love questions.' },
            { em: '🧸', name: 'Bring a friend', say: 'What will you bring to the hospital? A stuffed animal? A blanket?' },
            { em: '🦁', name: 'Brave', say: 'Being brave does not mean you are not scared. It means you do it anyway.' }
          ],
          star: 'You finished Finn\'s Tonsil Adventure! You earned a star.'
        }
      ]
    }
  ];

  /* Two weeks of getting better, one picture per day. */
  var DAYS = [
    ['🍦', 'Day 1. Rest, cold drinks, and ice cream.'],
    ['🧊', 'Day 2. Lots of sleep and lots of popsicles.'],
    ['🎬', 'Day 3. Movie day on the couch.'],
    ['🎲', 'Day 4. Board games and pudding.'],
    ['😣', 'Day 5. An extra sore day. Medicine and cold drinks help.'],
    ['😣', 'Day 6. Still a little extra sore. Keep drinking!'],
    ['📚', 'Day 7. A little homework, then video games.'],
    ['🙂', 'Day 8. Feeling better!'],
    ['🧩', 'Day 9. Puzzles and building.'],
    ['🍝', 'Day 10. Soft noodles are easier to eat now.'],
    ['🎣', 'Day 11. Reading a fishing book and planning the next trip.'],
    ['🚶', 'Day 12. A short walk outside.'],
    ['💪', 'Day 13. Almost healed!'],
    ['🎉', 'Day 14. All better! Ask the doctor before rough sports.']
  ];

  /* The open mouth, drawn: what each part is when he taps it. */
  var MOUTH = {
    tonsil: 'These are your tonsils! You have two, one on each side of your throat. They are the ones the doctor will take out.',
    uvula: 'This dangly thing in the middle is called the uvula. You-vyou-la. It stays! It helps when you swallow and talk.',
    tongue: 'This is your tongue. It tastes your food and helps you talk and swallow.',
    teeth: 'Your teeth! The surgery does not touch your teeth at all.',
    roof: 'This is the roof of your mouth, called the palate. Pal-it.',
    throat: 'This is the way down your throat, to your tummy and your lungs.'
  };

  /* ============================== SCREENS ============================ */
  var bodyEl = null, book = null, pageIx = 0;

  function render(body) {
    bodyEl = body;
    book = null;
    body.innerHTML = '';
    App.setActions([]);

    var ban = el('div', 'bd-banner');
    ban.appendChild(el('div', 'bd-banner-em', '🩺'));
    var t = el('div');
    t.appendChild(el('h3', null, 'My Body'));
    t.appendChild(el('p', null, 'Blood, tonsils, and Finn\'s trip to the hospital'));
    ban.appendChild(t);
    body.appendChild(ban);

    var list = el('div', 'bd-books');
    BOOKS.forEach(function (b) {
      var c = el('button', 'bd-book');
      c.style.background = b.color; c.style.borderColor = b.edge;
      c.appendChild(el('span', 'bd-book-em', b.em));
      var tx = el('span', 'bd-book-text');
      tx.appendChild(el('b', null, b.name));
      tx.appendChild(el('span', null, b.sub + ' · ' + b.pages.length + ' pages'));
      c.appendChild(tx);
      if (Progress.stationDone('body-' + b.id, 'body')) c.appendChild(el('span', 'bd-done', '⭐'));
      c.addEventListener('click', function () { openBook(b.id, 0); });
      list.appendChild(c);
    });
    body.appendChild(list);

    var cd = countdown();
    if (cd) body.appendChild(el('p', 'bd-countdown', cd));

    // grown-ups: the surgery date, your voice, and what to check
    body.appendChild(el('div', 'week-title', 'GROWN-UPS'));
    var dateRow = el('label', 'bd-date');
    dateRow.appendChild(el('span', null, '📅 Surgery day: '));
    var inp = document.createElement('input');
    inp.type = 'date'; inp.value = state.surgery || '';
    inp.addEventListener('change', function () { state.surgery = inp.value; save(); render(body); });
    dateRow.appendChild(inp);
    body.appendChild(dateRow);
    body.appendChild(el('p', 'rk-note', 'With the date set, the two-week calendar in Finn\'s story turns into Chance\'s own, with today marked.'));
    var g = el('div', 'row');
    g.appendChild(App.ui.btn('🎙️', 'Read it in your own voice', function () { App.go('studio', { group: 'body' }); }));
    body.appendChild(g);
    if (window.Recordings) {
      var lines = voiceLines(), have = lines.filter(function (l) { return Recordings.has(l.text, l.kind); }).length;
      body.appendChild(el('p', 'rk-note', '🎙️ ' + have + ' of ' + lines.length + ' lines are in your voice. Anything not recorded uses the computer voice.'));
    }
    body.appendChild(el('p', 'rk-note', 'Every hospital does things a little differently. Many children\'s hospitals offer a ' +
      'tour before surgery and a child life specialist; ask the surgeon\'s office. Follow the surgeon\'s instructions for ' +
      'eating, drinking, medicine and when sports can start, even where they differ from the story.'));
    var cr = el('details', 'bd-credit');
    cr.appendChild(el('summary', null, '📷 Photo credits'));
    cr.appendChild(el('p', null, 'Microscope photos: BCCD Dataset by Shenggan, MIT licence (github.com/Shenggan/BCCD_Dataset).'));
    var P = window.BODY_PHOTOS || {};
    Object.keys(P).forEach(function (k) { if (P[k].credit) cr.appendChild(el('p', null, P[k].credit)); });
    body.appendChild(cr);
  }

  /* "4 days until surgery" / "Day 3 of getting better" */
  function countdown() {
    if (!state.surgery) return '';
    var d = dayNumber();
    if (d < 0) return '🏥 ' + (-d) + (d === -1 ? ' day' : ' days') + ' until surgery day.';
    if (d === 0) return '🏥 Today is surgery day. You\'ve got this, ' + Progress.data.name + '!';
    if (d <= 14) return '🍦 Day ' + d + ' of getting better.';
    return '';
  }
  function dayNumber() {
    if (!state.surgery) return null;
    var s = new Date(state.surgery + 'T12:00:00'), n = new Date(Progress.today() + 'T12:00:00');
    return Math.round((n - s) / 86400000);
  }
  function thanksgiving(year) {
    var d = new Date(year, 10, 1);
    var first = (4 - d.getDay() + 7) % 7 + 1;      // first Thursday
    return new Date(year, 10, first + 21);
  }

  function openBook(id, ix) {
    book = BOOKS.filter(function (b) { return b.id === id; })[0];
    pageIx = ix || 0;
    showPage();
  }

  function showPage() {
    var body = bodyEl, pg = book.pages[pageIx];
    Voice.stop();
    body.innerHTML = '';
    window.scrollTo(0, 0);
    state.seen[book.id + ':' + pageIx] = 1; save();

    var head = el('div', 'bd-head');
    var back = el('button', 'icon-btn', '📚'); back.setAttribute('aria-label', 'All the books');
    back.addEventListener('click', function () { Voice.stop(); render(body); });
    head.appendChild(back);
    head.appendChild(el('span', 'bd-head-title', book.em + ' ' + book.name));
    var dots = el('span', 'bd-dots');
    book.pages.forEach(function (_, i) { dots.appendChild(el('i', i === pageIx ? 'on' : (i < pageIx ? 'past' : ''))); });
    head.appendChild(dots);
    body.appendChild(head);

    var card = el('div', 'bd-page');
    card.style.borderColor = book.edge;
    card.appendChild(el('h3', 'bd-title', pg.title));

    if (pg.kind === 'micro' || pg.kind === 'find') card.appendChild(microscope(pg));
    else if (pg.kind === 'mouth') card.appendChild(mouth());
    else if (pg.kind === 'calendar') card.appendChild(calendar());
    else if (pg.hero && photo(pg.hero)) card.appendChild(hero(pg.hero));
    else if (pg.art) card.appendChild(el('div', 'bd-art', pg.art));

    var txt = el('div', 'bd-text');
    pg.text.forEach(function (line) {
      var p = el('p', null, line);
      p.addEventListener('click', function () { Voice.stop(); talk(line); });
      txt.appendChild(p);
    });
    card.appendChild(txt);

    if (pg.taps && pg.taps.length) {
      var grid = el('div', 'bd-taps');
      pg.taps.forEach(function (tp) { grid.appendChild(tapCard(tp)); });
      card.appendChild(grid);
    }
    body.appendChild(card);

    var last = pageIx === book.pages.length - 1;
    App.setActions([
      { em: '⬅️', label: 'Back', cls: 'ghost compact', fn: function () { if (pageIx > 0) { pageIx--; showPage(); } else render(body); } },
      { em: '🔊', label: 'Read it', cls: 'ghost compact', fn: function () { readPage(pg); } },
      last ? { em: '⭐', label: 'Finish', fn: finishBook } : { em: '➡️', label: 'Next page', fn: function () { pageIx++; showPage(); } }
    ]);

    if (pg.kind !== 'find') readPage(pg);
  }

  function readPage(pg) {
    Voice.stop();
    pg.text.forEach(talk);
    if (pg.kind === 'find' && G) talk(pg.goals[G.goal] ? pg.goals[G.goal].ask : '');
  }

  /* A picture he can touch. If a real photo of it is in BODY_PHOTOS it
     shows the photo; otherwise the picture is the emoji. */
  /* A real photo across the top of the page. Tapping it says its caption. */
  function hero(k) {
    var ph = photo(k), f = el('figure', 'bd-hero');
    var img = document.createElement('img');
    img.src = ph.src; img.alt = ph.caption || ''; img.draggable = false;
    if (ph.w < 600) img.style.maxWidth = Math.round(ph.w * 1.6) + 'px';
    f.appendChild(img);
    if (ph.caption) {
      f.appendChild(el('figcaption', null, ph.caption));
      f.addEventListener('click', function () { Voice.stop(); showSays(ph.caption); talk(ph.caption); });
    }
    return f;
  }

  function tapCard(tp) {
    var c = el('button', 'bd-tap');
    var ph = tp.photo && photo(tp.photo);
    if (ph) {
      var img = document.createElement('img');
      img.src = ph.src; img.alt = tp.name; img.className = 'bd-tap-img';
      c.appendChild(img);
    } else {
      c.appendChild(el('span', 'bd-tap-em', tp.em));
    }
    c.appendChild(el('span', 'bd-tap-name', tp.name));
    c.addEventListener('click', function () {
      Voice.stop();
      document.querySelectorAll('.bd-tap.lit').forEach(function (x) { x.classList.remove('lit'); });
      c.classList.add('lit');
      showSays(tp.say);
      talk(tp.say);
    });
    return c;
  }

  /* What a tap said, in writing too, under the page text. */
  function showSays(text) {
    var s = bodyEl.querySelector('.bd-says');
    if (!s) {
      s = el('div', 'bd-says');
      var t = bodyEl.querySelector('.bd-text');
      t.parentNode.insertBefore(s, t.nextSibling);
    }
    s.textContent = text;
    s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop');
  }

  function finishBook() {
    Voice.stop();
    var pg = book.pages[book.pages.length - 1];
    var res = Progress.completeStation('body-' + book.id, 'body');
    if (res.star && Progress.checkBadges) Progress.checkBadges();
    App.burst(24);
    var said = res.star ? (pg.star || 'You finished the book! You earned a star.') : 'You finished the book again! Great reading.';
    talk(said);
    var u = App.ui, next = BOOKS[BOOKS.indexOf(book) + 1];
    var btns = [u.btn('📚', 'All the books', function () { App.closeSheet(); render(bodyEl); })];
    if (next) btns.unshift(u.btn(next.em, 'Next: ' + next.name, function () { App.closeSheet(); openBook(next.id, 0); }));
    App.sheet([u.big(res.star ? '⭐' : '🎉'), u.h3(said), u.row(btns)]);
  }

  /* ======================= THE MICROSCOPE PHOTO ======================
     The real photo with every labelled cell tappable. Taps are matched
     to the nearest labelled cell, with platelets (tiny) winning when
     the tap is right on one. */
  var G = null;     // the find game in progress

  function microscope(pg) {
    var ph = photo(pg.photo);
    var wrap = el('div', 'bd-micro');
    if (!ph) { wrap.appendChild(el('div', 'bd-art', '🔬')); return wrap; }
    var img = document.createElement('img');
    img.src = ph.src; img.alt = 'Human blood under a microscope'; img.draggable = false;
    wrap.appendChild(img);
    var ring = el('div', 'bd-ring'); ring.hidden = true;
    wrap.appendChild(ring);
    var lens = el('div', 'bd-lens', '🔬 real photo · tap a cell');
    wrap.appendChild(lens);
    var marks = el('div', 'bd-marks');
    wrap.appendChild(marks);

    G = pg.kind === 'find' ? { goal: 0, got: [] } : null;
    if (G) {
      var ask = el('div', 'bd-ask', pg.goals[0].ask);
      wrap.appendChild(ask);
      G.ask = ask;
      setTimeout(function () { Voice.stop(); pg.text.forEach(talk); talk(pg.goals[0].ask); }, 0);
    }

    wrap.addEventListener('click', function (e) {
      var r = img.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * ph.w, y = (e.clientY - r.top) / r.height * ph.h;
      var c = hitCell(ph.cells, x, y);
      if (!c) return;
      var kind = c[0];
      placeRing(ring, c, ph, kind);
      if (G) return findTap(pg, c, marks, ph);
      Voice.stop();
      var say = kind === 'white' ? pg.white(c) : CELL_SAY[kind];
      showSays(say);
      talk(say);
    });
    return wrap;
  }

  function hitCell(cells, x, y) {
    var best = null, bd = 1e9;
    cells.forEach(function (c) {
      var cx = (c[1] + c[3]) / 2, cy = (c[2] + c[4]) / 2;
      var rad = Math.max(c[3] - c[1], c[4] - c[2]) / 2;
      var d = Math.hypot(x - cx, y - cy);
      var reach = c[0] === 'platelet' ? Math.max(rad, 26) : rad;
      var score = d / reach;                // < 1 is inside
      if (score < 1.05 && score < bd) { bd = score; best = c; }
    });
    return best;
  }

  function placeRing(ring, c, ph, kind) {
    var pad = kind === 'platelet' ? 8 : 2;
    ring.hidden = false;
    ring.className = 'bd-ring ' + kind;
    ring.style.left = ((c[1] - pad) / ph.w * 100) + '%';
    ring.style.top = ((c[2] - pad) / ph.h * 100) + '%';
    ring.style.width = ((c[3] - c[1] + pad * 2) / ph.w * 100) + '%';
    ring.style.height = ((c[4] - c[2] + pad * 2) / ph.h * 100) + '%';
  }

  function findTap(pg, c, marks, ph) {
    var goal = pg.goals[G.goal];
    if (!goal) return;
    if (c[0] !== goal.kind) {
      Voice.stop();
      talk(c[0] === 'red' ? 'That is a red blood cell.' : c[0] === 'white' ? 'That is a white blood cell.' : 'That is a platelet.');
      talk(goal.ask);
      return;
    }
    if (G.got.indexOf(c) !== -1) return;
    G.got.push(c);
    var m = el('i', 'bd-mark ' + c[0], '✓');
    m.style.left = ((c[1] + c[3]) / 2 / ph.w * 100) + '%';
    m.style.top = ((c[2] + c[4]) / 2 / ph.h * 100) + '%';
    marks.appendChild(m);
    var have = G.got.filter(function (x) { return x[0] === goal.kind; }).length;
    Voice.stop();
    if (have < goal.n) { talk(String(have)); return; }
    App.burst(10);
    talk(goal.yes);
    G.goal++;
    var nx = pg.goals[G.goal];
    if (nx) { G.ask.textContent = nx.ask; talk(nx.ask); }
    else { G.ask.textContent = '🕵️ Blood detective! Tap Next page.'; G.done = true; }
  }

  /* ============================ THE MOUTH ===========================
     Drawn, not a photo: a clean front view of an open mouth says
     "where" far better to a seven-year-old than a clinical photo. */
  function mouth() {
    var wrap = el('div', 'bd-mouth');
    wrap.innerHTML =
      '<svg viewBox="0 0 400 300" role="img" aria-label="An open mouth, with the tonsils on each side at the back">' +
      '<ellipse cx="200" cy="150" rx="190" ry="140" fill="#f2b38f"/>' +
      '<ellipse data-part="roof" cx="200" cy="142" rx="160" ry="112" fill="#c94d5b"/>' +
      '<path data-part="roof" d="M70 120 Q200 30 330 120 Q200 95 70 120Z" fill="#e7899a"/>' +
      '<ellipse data-part="throat" cx="200" cy="168" rx="58" ry="62" fill="#5a0f1e"/>' +
      '<path data-part="tonsil" d="M118 120 Q96 165 124 214 Q156 200 150 160 Q146 128 118 120Z" fill="#ff8fa3" stroke="#d14d69" stroke-width="3"/>' +
      '<path data-part="tonsil" d="M282 120 Q304 165 276 214 Q244 200 250 160 Q254 128 282 120Z" fill="#ff8fa3" stroke="#d14d69" stroke-width="3"/>' +
      '<path data-part="uvula" d="M188 100 Q186 140 200 150 Q214 140 212 100Z" fill="#ef7f95" stroke="#c94d5b" stroke-width="2"/>' +
      '<path data-part="tongue" d="M70 236 Q120 176 200 190 Q280 176 330 236 Q300 270 200 272 Q100 270 70 236Z" fill="#ff7b8f"/>' +
      '<path d="M200 196 L200 250" stroke="#e05a72" stroke-width="3" stroke-linecap="round"/>' +
      '<g data-part="teeth" fill="#ffffff" stroke="#e6e6e6" stroke-width="1.5">' +
      [70, 105, 140, 175, 210, 245, 280, 315].map(function (x) { return '<rect x="' + x + '" y="20" width="30" height="34" rx="9"/>'; }).join('') +
      [92, 130, 168, 206, 244, 282].map(function (x) { return '<rect x="' + x + '" y="262" width="30" height="28" rx="9"/>'; }).join('') +
      '</g></svg>';
    var lab = el('div', 'bd-mouth-labels');
    [['tonsil', '👉 tonsils'], ['uvula', 'uvula'], ['tongue', 'tongue']].forEach(function (x) {
      var b = el('button', 'bd-chip', x[1]);
      b.addEventListener('click', function () { flash(wrap, x[0]); Voice.stop(); showSays(MOUTH[x[0]]); talk(MOUTH[x[0]]); });
      lab.appendChild(b);
    });
    wrap.appendChild(lab);
    wrap.querySelector('svg').addEventListener('click', function (e) {
      var p = e.target.closest('[data-part]');
      if (!p) return;
      var part = p.getAttribute('data-part');
      flash(wrap, part);
      Voice.stop();
      showSays(MOUTH[part]);
      talk(MOUTH[part]);
      if (part === 'tonsil') App.burst(6);
    });
    return wrap;
  }
  function flash(wrap, part) {
    wrap.querySelectorAll('[data-part]').forEach(function (n) { n.classList.toggle('lit', n.getAttribute('data-part') === part); });
  }

  /* =========================== THE CALENDAR ==========================
     Finn's two weeks. With a surgery date set it becomes Chance's:
     real dates, today ringed, and Thanksgiving on the end. */
  function calendar() {
    var wrap = el('div', 'bd-cal');
    var start = state.surgery ? new Date(state.surgery + 'T12:00:00') : null, today = dayNumber();
    if (start) wrap.appendChild(el('div', 'bd-cal-head', Progress.data.name + '\'s two weeks'));
    DAYS.forEach(function (d, i) {
      var c = el('button', 'bd-day');
      if (start && today === i + 1) c.classList.add('today');
      if (start && today > i + 1) c.classList.add('past');
      c.appendChild(el('span', 'n', String(i + 1)));
      c.appendChild(el('span', 'em', d[0]));
      if (start) {
        var dt = new Date(start.getTime() + (i + 1) * 86400000);
        c.appendChild(el('span', 'dt', dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })));
      }
      c.addEventListener('click', function () { Voice.stop(); showSays(d[1]); talk(d[1]); });
      wrap.appendChild(c);
    });
    var tg = el('button', 'bd-day thanks');
    tg.appendChild(el('span', 'em', '🦃'));
    var tgLine = 'Then, Thanksgiving!';
    if (start) {
      var t = thanksgiving(start.getFullYear()), gap = Math.round((t - start) / 86400000);
      tg.appendChild(el('span', 'dt', t.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })));
      if (gap > 14) tgLine = 'Then, Thanksgiving! That is ' + gap + ' days after surgery, after all fourteen healing days.';
    }
    tg.appendChild(el('span', 'n', 'Thanksgiving'));
    tg.addEventListener('click', function () { Voice.stop(); showSays(tgLine); talk(tgLine); });
    wrap.appendChild(tg);
    return wrap;
  }

  /* ========================= THE RECORDING BOOTH ===================== */
  function voiceLines() {
    var out = [];
    function add(t, note) { if (t && !out.some(function (x) { return x.text === t; })) out.push({ text: t, kind: 'say', note: note }); }
    BOOKS.forEach(function (b) {
      b.pages.forEach(function (pg, i) {
        var where = b.name + ', page ' + (i + 1);
        pg.text.forEach(function (t) { add(t, where); });
        (pg.taps || []).forEach(function (tp) { add(tp.say, where + ': ' + tp.name); });
        (pg.goals || []).forEach(function (g) { add(g.ask, where); add(g.yes, where); });
        if (pg.star) add(pg.star, where);
      });
    });
    Object.keys(CELL_SAY).forEach(function (k) { add(CELL_SAY[k], 'tapping a cell'); });
    Object.keys(MOUTH).forEach(function (k) { add(MOUTH[k], 'the mouth picture'); });
    var P = window.BODY_PHOTOS || {};
    Object.keys(P).forEach(function (k) { if (P[k].caption) add(P[k].caption, 'photo caption'); });
    DAYS.forEach(function (d) { add(d[1], 'the healing calendar'); });
    ['That is a red blood cell.', 'That is a white blood cell.', 'That is a platelet.',
      'You finished the book! You earned a star.', 'You finished the book again! Great reading.',
      '1', '2', '3', '4'].forEach(function (t) { add(t, 'other'); });
    return out;
  }

  return {
    render: render, voiceLines: voiceLines, openBook: openBook,
    // for the tests
    _books: BOOKS, _state: function () { return state; }, _page: function () { return book ? { book: book.id, page: pageIx } : null; },
    _game: function () { return G; }
  };
})();
