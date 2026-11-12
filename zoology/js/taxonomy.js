/* ============================================================
   taxonomy.js — Taxonomy Lab
     learn    five short lessons with quizzes
     tree     the 3D tree of life, with a deep-time slider (tree3d.js)
     project  the long-term classification project (164 specimens,
              seven ranks each), persisted
     sort     drag-and-drop drawer sorting
     cabinet  her museum cabinet of pinned specimens
   ============================================================ */
(function () {
  var esc = Media.esc;
  var RANKS = ['kingdom', 'phylum', 'cls', 'order', 'family', 'genus', 'epithet'];
  var RANK_LABEL = { kingdom: 'Kingdom', phylum: 'Phylum', cls: 'Class', order: 'Order', family: 'Family', genus: 'Genus', epithet: 'Species' };

  var ORDER_HINTS = {
    Lepidoptera: 'Scale-covered wings; coiled proboscis.', Coleoptera: 'Hardened forewings (elytra) meet in a straight line down the back.', Hymenoptera: 'Two pairs of clear wings hooked together; often a pinched waist.', Diptera: 'Only two wings; the hind pair are tiny halteres.', Hemiptera: 'Piercing beak; forewings half leathery, half membrane.', Odonata: 'Huge eyes, four long wings held out or together.', Orthoptera: 'Big jumping hind legs.', Mantodea: 'Raptorial grabbing forelegs; triangular head.', Phasmatodea: 'Looks like a twig or leaf.', Neuroptera: 'Net-veined, lacy wings held roof-like.', Ephemeroptera: 'Two or three long tail filaments; wings held straight up.', Dermaptera: 'Pincers at the tail.', Megaloptera: 'Big soft wings, long mandibles; aquatic larvae.', Zygentoma: 'Wingless, silvery, three tail filaments.',
    Strigiformes: 'Owls: facial disc, forward eyes, silent flight.', Passeriformes: 'Perching birds: three toes forward, one back; most songbirds.', Accipitriformes: 'Hawks, eagles, vultures: hooked bill, talons.', Anseriformes: 'Waterfowl: ducks, geese, swans.', Galliformes: 'Chicken-like ground birds.', Pelecaniformes: 'Pelicans, herons, ibises (by DNA).', Coraciiformes: 'Kingfishers and rollers.', Piciformes: 'Woodpeckers: two toes forward, two back.', Apodiformes: 'Swifts and hummingbirds.', Gaviiformes: 'Loons.', Charadriiformes: 'Shorebirds, gulls and terns.', Suliformes: 'Cormorants, gannets, frigatebirds.', Struthioniformes: 'Ostriches.', Otidiformes: 'Bustards.', Ciconiiformes: 'Storks.', Gruiformes: 'Cranes and rails.', Psittaciformes: 'Parrots.', Sphenisciformes: 'Penguins.', Phoenicopteriformes: 'Flamingos.',
    Carnivora: 'Meat-eating teeth (carnassials): cats, dogs, bears, weasels, seals.', Artiodactyla: 'Even-toed hoofed mammals (and whales).', Perissodactyla: 'Odd-toed hoofed mammals: horses, rhinos, tapirs.', Rodentia: 'Ever-growing incisors.', Lagomorpha: 'Rabbits and hares: a second pair of small upper incisors.', Chiroptera: 'Bats.', Primates: 'Grasping hands, forward eyes.', Proboscidea: 'Elephants.', Didelphimorphia: 'American opossums (marsupials).', Diprotodontia: 'Kangaroos, koalas, wombats.', Monotremata: 'Egg-laying mammals.',
    Anura: 'Frogs and toads: no tail as adults.', Urodela: 'Salamanders and newts: tail kept.', Testudines: 'Turtles.', Squamata: 'Scaled reptiles: lizards and snakes.', Crocodilia: 'Crocodiles and alligators.',
    Salmoniformes: 'Salmon, trout and char; an adipose fin.', Perciformes: 'Perch-like fishes with spiny fins.', Cypriniformes: 'Carps and minnows; no teeth in the jaws.', Acipenseriformes: 'Sturgeons: bony plates, a shark-like tail.', Esociformes: 'Pikes.', Gobiiformes: 'Gobies: fused pelvic fins make a suction cup.',
    Araneae: 'Spiders.', Decapoda: 'Ten legs: crabs, lobsters, crayfish.', Octopoda: 'Eight arms.', Myida: 'Mussels and clams with siphons.', Gentianales: 'Includes milkweeds, gentians and coffee.', Pinales: 'Conifers: firs, pines, spruces.'
  };
  var CLASS_HINTS = { Mammalia: 'Hair and milk.', Aves: 'Feathers.', Reptilia: 'Scales, eggs laid on land (or live birth), ectothermic.', Amphibia: 'Moist skin; larval stage in water.', Actinopterygii: 'Ray-finned fishes.', Insecta: 'Six legs, three body parts, antennae.', Arachnida: 'Eight legs, two body parts, no antennae.', Malacostraca: 'Crabs, lobsters, crayfish, isopods.', Bivalvia: 'Two hinged shells.', Cephalopoda: 'Head-foot: octopus, squid, nautilus.', Magnoliopsida: 'Flowering plants (broad-leaved).', Pinopsida: 'Conifers.' };
  var PHYLUM_HINTS = { Chordata: 'A notochord or backbone: fishes, amphibians, reptiles, birds, mammals.', Arthropoda: 'Jointed legs and an exoskeleton.', Mollusca: 'Soft body, usually a shell, a muscular foot.', Tracheophyta: 'Vascular plants with roots, stems and leaves.' };

  /* ------------------------------------------------------------
     Lessons */
  var LESSONS = [
    { id: 'names', title: 'Why every animal has two names', icon: '🏷️',
      html: '<p>In 1758 a Swedish botanist, <b>Carl Linnaeus</b>, published the tenth edition of <i>Systema Naturae</i> and gave every known animal a two-part Latin name. Zoologists still count that book as the starting line for all animal names. The monarch butterfly is <span class="sci">Danaus plexippus</span> (Linnaeus, 1758); the northern saw-whet owl is <span class="sci">Aegolius acadicus</span> (Gmelin, 1788).</p>' +
        '<h3>The rules, as a working zoologist uses them</h3><ul><li><b>Genus</b> first, capitalised: <span class="sci">Danaus</span>. <b>Species epithet</b> second, always lowercase: <span class="sci">plexippus</span>. Both in italics (or underlined when handwritten).</li><li>The <b>author and year</b> may follow: Linnaeus, 1758. <b>Parentheses</b> mean the species has since been moved to a different genus. Linnaeus called the monarch <span class="sci">Papilio plexippus</span>; it was moved to <span class="sci">Danaus</span> later, so the name is written (Linnaeus, 1758).</li><li>After the first mention you can abbreviate the genus: <span class="sci">D. plexippus</span>.</li><li>One species, one name. If two names exist for the same animal, the older one wins (<b>priority</b>) and the newer becomes a <b>synonym</b>.</li><li>A <b>subspecies</b> adds a third word: <span class="sci">Danaus plexippus plexippus</span> is the migratory North American monarch.</li></ul>' +
        '<h3>Type specimens</h3><p>Every species name is anchored to a real specimen in a museum drawer, the <b>holotype</b>. If zoologists ever argue about what a name means, they go back to that specimen. This is why collections like the Smithsonian’s matter: they are the dictionary of life, and Roosevelt’s 11,400 African specimens included dozens of types.</p>' +
        '<div class="callout">A specimen without a label is just a dead animal. A specimen <i>with</i> a label (where, when, who) is data that lasts for centuries.</div>',
      quiz: [
        { q: 'Which is written correctly?', a: ['Danaus plexippus', 'danaus Plexippus', 'Danaus Plexippus', 'DANAUS plexippus'], c: 0 },
        { q: 'Parentheses around (Linnaeus, 1758) mean…', a: ['the species has been moved to a new genus since it was named', 'Linnaeus was unsure', 'the name is a synonym', 'the animal is extinct'], c: 0 },
        { q: 'Which part of the name is the genus?', a: ['Aegolius in Aegolius acadicus', 'acadicus in Aegolius acadicus', 'both words', 'the author’s name'], c: 0 },
        { q: 'A holotype is…', a: ['the single specimen a species name is anchored to', 'the most beautiful specimen', 'the first photograph', 'a living animal in a zoo'], c: 0 },
        { q: 'If two names were given to the same animal, which one is used?', a: ['the older one', 'the newer one', 'the shorter one', 'the Latin one'], c: 0 }
      ] },
    { id: 'ranks', title: 'The seven ranks', icon: '🪜',
      html: '<p>Linnaeus sorted life into nested boxes. The modern set of main ranks is <b>Kingdom, Phylum, Class, Order, Family, Genus, Species</b>. A mnemonic: <i>King Philip Came Over For Good Soup</i>. Or Katie’s own: <i>Katie Pins Cool Owls, Fireflies, Grasshoppers, Swallowtails</i>.</p>' +
        '<h3>Two worked examples</h3><table><tr><th>Rank</th><th>Monarch</th><th>Saw-whet owl</th></tr>' +
        '<tr><td>Kingdom</td><td>Animalia</td><td>Animalia</td></tr><tr><td>Phylum</td><td>Arthropoda</td><td>Chordata</td></tr><tr><td>Class</td><td>Insecta</td><td>Aves</td></tr><tr><td>Order</td><td>Lepidoptera</td><td>Strigiformes</td></tr><tr><td>Family</td><td>Nymphalidae</td><td>Strigidae</td></tr><tr><td>Genus</td><td><span class="sci">Danaus</span></td><td><span class="sci">Aegolius</span></td></tr><tr><td>Species</td><td><span class="sci">D. plexippus</span></td><td><span class="sci">A. acadicus</span></td></tr></table>' +
        '<h3>Reading the endings</h3><ul><li>Animal <b>families</b> end in <b>-idae</b> (Strigidae, Nymphalidae, Canidae). Plant families end in -aceae (Apocynaceae, the milkweeds).</li><li>Bird <b>orders</b> end in <b>-iformes</b> (Strigiformes, Passeriformes).</li><li>Insect orders mostly end in <b>-ptera</b>, “wing” (Lepidoptera = scale-wing; Coleoptera = sheath-wing; Diptera = two-wing; Hymenoptera = membrane-wing; Hemiptera = half-wing).</li><li>Subfamilies end in -inae (Danainae, the milkweed butterflies), tribes in -ini.</li></ul>' +
        '<h3>In-between ranks</h3><p>Real classifications use extra levels when they help: subphylum Vertebrata, superfamily Papilionoidea, infraorder Cetacea. Ranks are shelves, not laws of nature. What is real is the branching pattern; the ranks are how we label the shelves.</p>',
      quiz: [
        { q: 'Which rank sits directly above Family?', a: ['Order', 'Class', 'Genus', 'Phylum'], c: 0 },
        { q: 'An animal family name ends in…', a: ['-idae', '-iformes', '-ptera', '-aceae'], c: 0 },
        { q: 'Monarch and saw-whet owl share which ranks?', a: ['Kingdom only', 'Kingdom and Phylum', 'Kingdom, Phylum and Class', 'none'], c: 0 },
        { q: 'Hymenoptera means…', a: ['membrane-wing', 'half-wing', 'two-wing', 'scale-wing'], c: 0 },
        { q: 'Which is a plant family?', a: ['Apocynaceae', 'Strigidae', 'Nymphalidae', 'Canidae'], c: 0 }
      ] },
    { id: 'trees', title: 'Trees, not ladders', icon: '🌳',
      html: '<p>Linnaeus sorted by resemblance. After Darwin, classification took on a second job: it should mirror <b>ancestry</b>. A good group is a <b>clade</b>: an ancestor and <i>all</i> of its descendants (monophyletic). The 3D tree in this app is drawn that way, and the time slider shows roughly when each branch split.</p>' +
        '<h3>Three famous problems</h3><ul><li><b>Birds are dinosaurs.</b> “Reptilia” as taught in school (turtles, lizards, snakes, crocodiles) leaves out birds, yet crocodiles are closer to birds than to lizards. A group that leaves out some descendants is <b>paraphyletic</b>. Many zoologists now say Sauropsida, or simply put Aves inside Reptilia.</li><li><b>Fish</b> is not a clade either: a lungfish is closer to you than to a trout.</li><li><b>Whales are artiodactyls.</b> DNA put whales inside the even-toed hoofed mammals, next to the hippo. The old order Cetacea folded into Artiodactyla.</li></ul>' +
        '<h3>Why names keep changing</h3><p>Not because scientists are fickle. New evidence, mostly DNA, shows that an old group was not a clade, so it is split or merged: the double-crested cormorant went from <span class="sci">Phalacrocorax</span> to <span class="sci">Nannopterum</span>; the mink from <span class="sci">Neovison</span> to <span class="sci">Neogale</span>; skunks got their own family, Mephitidae. When you read an older field guide, expect some names to have moved.</p>' +
        '<h3>Domains</h3><p>In 1990 Carl Woese used ribosomal RNA to show life has three deepest branches: <b>Bacteria, Archaea and Eukarya</b>. Every animal, plant and fungus is a eukaryote.</p>' +
        '<div class="callout moss">DNA barcoding: a short stretch of one gene (COI) identifies most animal species. A field zoologist today uses the key <i>and</i> the barcode.</div>',
      quiz: [
        { q: 'A clade is…', a: ['an ancestor plus all its descendants', 'any group that looks alike', 'a rank below family', 'a kind of key'], c: 0 },
        { q: 'Which living animals are closest to birds?', a: ['crocodiles', 'lizards', 'turtles', 'bats'], c: 0 },
        { q: 'Whales now sit inside which order?', a: ['Artiodactyla', 'Carnivora', 'Cetacea', 'Perissodactyla'], c: 0 },
        { q: 'The three domains are…', a: ['Bacteria, Archaea, Eukarya', 'Animalia, Plantae, Fungi', 'Vertebrata, Invertebrata, Plantae', 'Land, Sea, Air'], c: 0 },
        { q: 'Why did the mink’s genus name change?', a: ['DNA evidence showed the old grouping was wrong', 'the old name was misspelled', 'a vote at a conference', 'it moved to a new habitat'], c: 0 }
      ] },
    { id: 'key', title: 'Keying out an insect', icon: '🔑',
      html: '<p>A <b>dichotomous key</b> is a chain of either/or questions. Below is a working key to the big insect orders. Tap through it with a bug in front of you, then confirm with a photo on iNaturalist.</p><div id="keyBox"></div>' +
        '<h3>The orders at a glance</h3><table><tr><th>Order</th><th>Tell-tale</th><th>Ambassador in your project</th></tr>' + Object.keys(ORDER_HINTS).filter(function (o) { return SPECIES.some(function (s) { return s.order === o && s.cls === 'Insecta'; }); }).map(function (o) { var sp = SPECIES.filter(function (s) { return s.order === o; })[0]; return '<tr><td>' + o + '</td><td>' + esc(ORDER_HINTS[o]) + '</td><td>' + esc(sp.common) + '</td></tr>'; }).join('') + '</table>',
      quiz: [
        { q: 'An insect with only two wings and tiny knobs behind them is…', a: ['Diptera', 'Hymenoptera', 'Hemiptera', 'Odonata'], c: 0 },
        { q: 'Hardened forewings meeting in a straight line down the back:', a: ['Coleoptera', 'Hemiptera', 'Orthoptera', 'Dermaptera'], c: 0 },
        { q: 'A firefly is a…', a: ['beetle', 'fly', 'true bug', 'wasp'], c: 0 },
        { q: 'Forewings half leathery, half clear, and a piercing beak:', a: ['Hemiptera', 'Coleoptera', 'Lepidoptera', 'Neuroptera'], c: 0 },
        { q: 'Katydids are separated from grasshoppers by…', a: ['very long antennae', 'having no wings', 'eight legs', 'a coiled proboscis'], c: 0 }
      ] },
    { id: 'collections', title: 'Why 148 million specimens matter', icon: '🏛️',
      html: '<p>The Smithsonian National Museum of Natural History holds about 148 million objects, and roughly 99% of them are behind the scenes in drawers and jars. Roosevelt’s 1909–10 expedition alone added about 11,400 animals and thousands of plants. Why keep all that?</p>' +
        '<ul><li><b>Names.</b> Types anchor every species name (lesson 1).</li><li><b>Time machines.</b> Eggshells collected in the 1800s let scientists prove DDT was thinning raptor eggs in the 1960s. Bird skins show how ranges have shifted with climate. Insects pinned in 1900 carry the pollen and the chemistry of 1900.</li><li><b>DNA.</b> Old specimens still yield DNA; extinct animals can be sequenced from museum skins.</li><li><b>Distribution.</b> Every label is a dot on a map. Digitising those dots (the museum is photographing hundreds of thousands of insects) turns drawers into data.</li></ul>' +
        '<h3>What a curator does</h3><p>Collections managers like the Smithsonian’s entomology staff keep specimens pest-free, frozen before they enter the collection, catalogued, loaned to scientists worldwide and photographed. It is a job that blends zoology, organisation and, yes, display: the public halls are theatre built on the drawers behind them. A zoologist who can also act and build sets is exactly who museums hire to design exhibits and run live programmes.</p>' +
        '<div class="callout">The classification project in this app is a tiny museum. Every specimen you pin gets a label with your name on it, the way a real drawer would.</div>',
      quiz: [
        { q: 'Roughly how many objects does the NMNH hold?', a: ['148 million', '1.4 million', '14 billion', '148 thousand'], c: 0 },
        { q: 'Old eggshells in collections proved…', a: ['DDT was thinning raptor eggs', 'birds were getting bigger', 'eggs were once blue', 'nothing useful'], c: 0 },
        { q: 'About how many zoological specimens came from Roosevelt’s African expedition?', a: ['11,400', '114', '1.1 million', '40'], c: 0 },
        { q: 'Before a new specimen joins a collection it is usually…', a: ['frozen to kill pests', 'painted', 'photographed only', 'washed'], c: 0 },
        { q: 'Digitising a collection mainly turns…', a: ['labels and photos into searchable data', 'specimens into plastic', 'drawers into display cases', 'insects into robots'], c: 0 }
      ] }
  ];

  var KEY = [ /* dichotomous key: each step: q, yes -> next or result, no -> next or result */
    { q: 'Does it have wings you can see?', y: 1, n: 'r_wingless' },
    { q: 'Are there only two wings (one pair)?', y: 'Diptera', n: 2 },
    { q: 'Are the forewings hardened or leathery, like a shell?', y: 3, n: 5 },
    { q: 'Do the hard forewings meet in a straight line down the middle of the back?', y: 4, n: 'Hemiptera' },
    { q: 'Are there pincers at the tail end?', y: 'Dermaptera', n: 'Coleoptera' },
    { q: 'Are the wings covered in tiny scales (powder comes off on your finger)?', y: 'Lepidoptera', n: 6 },
    { q: 'Does it have big jumping hind legs?', y: 'Orthoptera', n: 7 },
    { q: 'Grabbing (raptorial) forelegs and a triangular head that turns?', y: 'Mantodea', n: 8 },
    { q: 'Does it look like a stick or a leaf?', y: 'Phasmatodea', n: 9 },
    { q: 'Long slender body, huge eyes, four long wings about the same size?', y: 'Odonata', n: 10 },
    { q: 'Wings held straight up at rest with two or three long tail threads?', y: 'Ephemeroptera', n: 11 },
    { q: 'Pinched waist, or clear wings hooked together (bees, wasps, ants)?', y: 'Hymenoptera', n: 12 },
    { q: 'Lacy, net-veined wings held like a roof over the body?', y: 'Neuroptera', n: 13 },
    { q: 'Big soft wings and very long mandibles; found near streams?', y: 'Megaloptera', n: 'r_other' }
  ];
  var KEY_RESULTS = { r_wingless: 'No visible wings. Could be an immature insect, a silverfish (Zygentoma), a worker ant (Hymenoptera), a flea, or not an insect at all: count the legs. Six = insect; eight = arachnid; more = myriapod or crustacean.', r_other: 'A rarer order (caddisflies, stoneflies, true bugs with odd wings, cockroaches…). Photograph it and let iNaturalist’s community help.' };

  function renderKey(box) {
    var i = 0;
    function step() {
      var s = KEY[i];
      box.innerHTML = '<div class="card"><p><b>' + esc(s.q) + '</b></p><div class="row"><button class="btn primary" id="ky">Yes</button><button class="btn" id="kn">No</button><button class="btn ghost sm" id="kr">Start over</button></div></div>';
      box.querySelector('#ky').onclick = function () { go(s.y); }; box.querySelector('#kn').onclick = function () { go(s.n); }; box.querySelector('#kr').onclick = function () { i = 0; step(); };
    }
    function go(t) {
      if (typeof t === 'number') { i = t; step(); return; }
      var sp = SPECIES.filter(function (s) { return s.order === t; });
      box.innerHTML = '<div class="card"><p>' + (KEY_RESULTS[t] ? esc(KEY_RESULTS[t]) : '<b>Order ' + esc(t) + '</b>. ' + esc(ORDER_HINTS[t] || '')) + '</p>' +
        (sp.length ? '<div class="grid tight">' + sp.slice(0, 4).map(function (s) { return '<div class="card spec" onclick="App.speciesModal(SPECIES[' + s.index + '])">' + Media.photoHTML(s.sci, { cls: 'sq', alt: s.common }) + '<div class="nm">' + esc(s.common) + '</div></div>'; }).join('') + '</div>' : '') +
        '<p><button class="btn sm" id="kr">Key another</button></p></div>';
      Media.hydrate(box); box.querySelector('#kr').onclick = function () { i = 0; step(); };
    }
    step();
  }

  function renderLearn(el, id) {
    if (!id) {
      el.innerHTML = '<h2>Lessons</h2><p class="lede">Five short readings, each with a five-question check. Your best scores are kept.</p><div class="grid">' + LESSONS.map(function (L) {
        var best = Store.get('quizzes.' + L.id, null);
        return '<a class="card" href="#/taxonomy/learn/' + L.id + '" style="text-decoration:none;color:inherit"><div style="font-size:30px">' + L.icon + '</div><h3 style="margin:6px 0">' + esc(L.title) + '</h3>' + (best !== null ? '<span class="tag ok">Best ' + best + '/5</span>' : '<span class="tag">Not yet</span>') + '</a>';
      }).join('') + '</div><h2>Videos</h2>' + Media.videoGrid(VIDEOS.taxonomy);
      return;
    }
    var L = LESSONS.filter(function (x) { return x.id === id; })[0]; if (!L) { renderLearn(el); return; }
    el.innerHTML = '<p><a href="#/taxonomy/learn">← All lessons</a></p><h2 style="margin-top:0">' + L.icon + ' ' + esc(L.title) + '</h2><div class="card">' + L.html + '</div><h3>Check yourself</h3><div id="quiz"></div>';
    if (L.id === 'key') renderKey(document.getElementById('keyBox'));
    renderQuiz(document.getElementById('quiz'), L);
  }
  function renderQuiz(box, L) {
    var i = 0, score = 0;
    function shuffle(a) { a = a.slice(); for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
    function q() {
      if (i >= L.quiz.length) {
        var best = Store.get('quizzes.' + L.id, 0); if (score > best) Store.set('quizzes.' + L.id, score);
        box.innerHTML = '<div class="card"><h3>' + score + ' / ' + L.quiz.length + '</h3><p>' + (score === L.quiz.length ? 'Perfect. On to the next lesson.' : 'Reread the parts you missed and try again whenever you like.') + '</p><div class="row"><button class="btn" id="again">Try again</button><a class="btn primary" href="#/taxonomy/learn">All lessons</a></div></div>';
        box.querySelector('#again').onclick = function () { i = 0; score = 0; q(); }; return;
      }
      var Q = L.quiz[i]; var opts = shuffle(Q.a.map(function (t, k) { return { t: t, ok: k === Q.c }; }));
      box.innerHTML = '<div class="card"><p class="muted small">Question ' + (i + 1) + ' of ' + L.quiz.length + '</p><p><b>' + esc(Q.q) + '</b></p><div class="choices">' + opts.map(function (o, k) { return '<button class="choice" data-k="' + k + '">' + esc(o.t) + '</button>'; }).join('') + '</div></div>';
      var answered = false;
      box.querySelectorAll('.choice').forEach(function (b) {
        b.onclick = function () {
          if (answered) return; answered = true; var o = opts[+b.getAttribute('data-k')];
          b.classList.add(o.ok ? 'right' : 'wrong'); if (o.ok) score++;
          box.querySelectorAll('.choice').forEach(function (bb, k) { if (opts[k].ok) bb.classList.add('right'); });
          setTimeout(function () { i++; q(); }, 900);
        };
      });
    }
    q();
  }

  /* ------------------------------------------------------------
     3D tree page */
  var treeCtl = null;
  function renderTree(el) {
    el.innerHTML = '<h2 style="margin-top:0">The tree of life, in 3D and in time</h2><p class="lede">Every specimen in your project, hung on one tree. Drag to spin, pinch or scroll to zoom, tap a node to read about it. Drag the time slider to watch 650 million years of branching, or press play.</p>' +
      '<div class="tree-wrap" id="treeWrap"><div class="tree-legend" id="treeLegend"></div><div class="tree-hud"><div class="tree-info" id="treeInfo">Tap any node.</div><div class="tree-time"><button class="btn sm" id="treePlay" style="min-height:32px">▶ Play</button><span id="treeMya" style="min-width:110px">Today</span><input type="range" id="treeRange" min="0" max="650" value="0" step="1" aria-label="Millions of years ago"></div></div></div>' +
      '<p class="small muted">Branch ages are approximate and rounded; the point is the order of the branching, not the exact numbers. Ranks shown: kingdom → phylum → class → order → family → genus → species. Colors are by class.</p>' +
      '<div class="row"><a class="btn" href="#/taxonomy/project">Add more specimens to the tree</a></div>';
    if (!window.Tree3D) { document.getElementById('treeInfo').textContent = 'The 3D view needs WebGL and a moment to load. If this message stays, your browser may not support it; the rest of the app still works.'; setTimeout(function () { if (window.Tree3D && document.getElementById('treeWrap')) renderTree(el); }, 600); return; }
    var done = Store.data.species;
    treeCtl = Tree3D.mount(document.getElementById('treeWrap'), {
      species: SPECIES, done: done,
      onSelect: function (node) {
        var info = document.getElementById('treeInfo'); if (!info) return;
        if (node.sp) {
          var st = done[node.sp.id];
          info.innerHTML = '<div class="row" style="align-items:flex-start"><div style="width:84px;flex:0 0 auto">' + Media.photoHTML(node.sp.sci, { cls: 'sq', nocredit: true, alt: node.sp.common }) + '</div><div><b>' + esc(node.sp.common) + '</b><br><span class="sci">' + esc(node.sp.sci) + '</span><br><span class="small muted">' + esc(node.sp.note) + '</span><br>' + (st && st.done ? '<span class="tag ok">pinned</span> ' : '') + '<a class="small" href="#/taxonomy/project/' + node.sp.id + '">classify ↗</a> · <a class="small" href="#" onclick="App.speciesModal(SPECIES[' + node.sp.index + ']);return false">photos</a></div></div>';
          Media.hydrate(info);
        } else {
          var hint = ORDER_HINTS[node.name] || CLASS_HINTS[node.name] || PHYLUM_HINTS[node.name] || '';
          info.innerHTML = '<b>' + esc(node.name) + '</b> <span class="tag">' + esc(node.rank) + '</span> <span class="small muted">· branched about ' + node.age + ' Mya · ' + node.leaves + ' specimen' + (node.leaves === 1 ? '' : 's') + ' in your project</span>' + (hint ? '<br><span class="small">' + esc(hint) + '</span>' : '');
        }
      }
    });
    var legend = document.getElementById('treeLegend');
    legend.innerHTML = Object.keys(Tree3D.COLORS).map(function (k) { return '<span><i style="background:' + Tree3D.COLORS[k] + '"></i>' + esc(k) + '</span>'; }).join('');
    var range = document.getElementById('treeRange'), mya = document.getElementById('treeMya'), play = document.getElementById('treePlay'), timer = null;
    function setT(v) { v = +v; range.value = v; mya.textContent = v === 0 ? 'Today' : v + ' million years ago'; treeCtl.setTime(v); }
    range.addEventListener('input', function () { if (timer) stop(); setT(range.value); });
    function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Play'; }
    play.onclick = function () {
      if (timer) { stop(); return; }
      var v = 650; setT(v); play.textContent = '⏸ Pause';
      timer = setInterval(function () { v -= (v > 100 ? 4 : 1); if (v <= 0) { setT(0); stop(); } else setT(v); }, 50);
    };
  }
  function unmountTree() { if (treeCtl) { try { treeCtl.destroy(); } catch (e) {} treeCtl = null; } }

  /* ------------------------------------------------------------
     Classification project */
  function setProgress(setId) {
    var sp = SPECIES.filter(function (s) { return s.set === setId; });
    var d = sp.filter(function (s) { return Store.data.species[s.id] && Store.data.species[s.id].done; }).length;
    return { done: d, total: sp.length };
  }
  function renderProject(el, args) {
    if (args[0] === 'set' && args[1]) return renderSet(el, args[1]);
    if (args[0]) { var sp = SPECIES.filter(function (s) { return s.id === args[0]; })[0]; if (sp) return renderClassify(el, sp); }
    var total = SPECIES.length, done = Store.data.cabinet.length;
    el.innerHTML = '<h2 style="margin-top:0">The classification project</h2><p class="lede">' + total + ' real species in eight expeditions. For each one, you place it rank by rank: kingdom, phylum, class, order, family, genus, species. Get it right and it is pinned into your cabinet with a label in your name. Come back every day; the cabinet remembers.</p>' +
      '<div class="card"><div class="row between"><b>' + done + ' of ' + total + ' pinned</b><span class="muted small">' + Math.round(100 * done / total) + '%</span></div><div class="bar"><i style="width:' + (100 * done / total) + '%"></i></div></div>' +
      '<div class="grid">' + SPECIES_SETS.map(function (S) {
        var p = setProgress(S.id);
        return '<a class="card" href="#/taxonomy/project/set/' + S.id + '" style="text-decoration:none;color:inherit"><div class="row between"><div style="font-size:30px">' + S.icon + '</div>' + (p.done === p.total ? '<span class="tag ok">complete</span>' : '<span class="tag">' + p.done + '/' + p.total + '</span>') + '</div><h3 style="margin:6px 0">' + esc(S.name) + '</h3><p class="small muted" style="margin:0 0 8px">' + esc(S.blurb) + '</p><div class="bar"><i style="width:' + (100 * p.done / p.total) + '%"></i></div></a>';
      }).join('') + '</div>' +
      '<h2>How scoring works</h2><div class="card small"><p>Each rank is a multiple choice drawn from real taxa, so the wrong answers are plausible. A wrong pick lets you try again, but costs a star: three stars for a clean run, two for a couple of slips, one for getting there in the end. Every pinned specimen counts the same toward badges; the stars are for your own pride. You can reopen any pinned specimen to see its photographs and rewrite its label.</p></div>';
  }
  function renderSet(el, setId) {
    var S = SPECIES_SETS.filter(function (x) { return x.id === setId; })[0]; if (!S) return renderProject(el, []);
    var sp = SPECIES.filter(function (s) { return s.set === setId; }); var p = setProgress(setId);
    var next = sp.filter(function (s) { return !(Store.data.species[s.id] && Store.data.species[s.id].done); })[0];
    el.innerHTML = '<p><a href="#/taxonomy/project">← All expeditions</a></p><h2 style="margin-top:0">' + S.icon + ' ' + esc(S.name) + '</h2><p class="lede">' + esc(S.blurb) + '</p>' +
      '<div class="card"><div class="row between"><b>' + p.done + ' of ' + p.total + ' pinned</b>' + (next ? '<a class="btn primary sm" href="#/taxonomy/project/' + next.id + '">Classify next: ' + esc(next.common) + '</a>' : '<span class="tag ok">Drawer complete</span>') + '</div><div class="bar" style="margin-top:8px"><i style="width:' + (100 * p.done / p.total) + '%"></i></div></div>' +
      '<div class="grid tight">' + sp.map(function (s) {
        var st = Store.data.species[s.id] || {};
        return '<div class="card spec ' + (st.done ? 'done' : '') + '" style="position:relative" data-id="' + s.id + '">' + Media.photoHTML(s.sci, { cls: 'sq', alt: s.common }) + (st.done ? '<span class="pin">📌</span>' : '') + '<div class="nm">' + esc(s.common) + '</div><div class="sc">' + esc(s.sci) + '</div>' + (st.done ? '<div class="small">' + '★'.repeat(st.stars || 1) + '</div>' : '') + '</div>';
      }).join('') + '</div>';
    el.querySelectorAll('.spec').forEach(function (c) {
      c.addEventListener('click', function () {
        var s = SPECIES.filter(function (x) { return x.id === c.getAttribute('data-id'); })[0];
        var st = Store.data.species[s.id] || {};
        if (st.done) App.speciesModal(s); else location.hash = '#/taxonomy/project/' + s.id;
      });
    });
  }
  function pick(n, correct, pool, exclude) {
    var set = {}; var out = [correct]; set[correct] = 1; (exclude || []).forEach(function (x) { set[x] = 1; });
    var cand = pool.filter(function (x) { return !set[x]; });
    for (var k = cand.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = cand[k]; cand[k] = cand[j]; cand[j] = t; }
    cand.slice(0, n - 1).forEach(function (x) { out.push(x); });
    for (var k2 = out.length - 1; k2 > 0; k2--) { var j2 = Math.floor(Math.random() * (k2 + 1)); var t2 = out[k2]; out[k2] = out[j2]; out[j2] = t2; }
    return out;
  }
  function uniq(a) { var s = {}; return a.filter(function (x) { if (!x || s[x]) return false; s[x] = 1; return true; }); }
  function choicesFor(sp, rank) {
    var all = SPECIES;
    switch (rank) {
      case 'kingdom': return pick(4, sp.kingdom, TAXON_POOLS.kingdom);
      case 'phylum': return pick(6, sp.phylum, TAXON_POOLS.phylum);
      case 'cls': return pick(6, sp.cls, uniq((TAXON_POOLS.cls[sp.phylum] || []).concat(all.filter(function (s) { return s.phylum === sp.phylum; }).map(function (s) { return s.cls; }))));
      case 'order': return pick(6, sp.order, uniq((TAXON_POOLS.order[sp.cls] || []).concat(all.filter(function (s) { return s.cls === sp.cls; }).map(function (s) { return s.order; }))));
      case 'family': { var same = uniq(all.filter(function (s) { return s.order === sp.order; }).map(function (s) { return s.family; })); var cls = uniq(all.filter(function (s) { return s.cls === sp.cls; }).map(function (s) { return s.family; })); return pick(6, sp.family, uniq(same.concat(cls))); }
      case 'genus': { var fam = uniq(all.filter(function (s) { return s.family === sp.family; }).map(function (s) { return s.genus; })); var ord = uniq(all.filter(function (s) { return s.order === sp.order; }).map(function (s) { return s.genus; })); var cl = uniq(all.filter(function (s) { return s.cls === sp.cls; }).map(function (s) { return s.genus; })); return pick(5, sp.genus, uniq(fam.concat(ord, cl))); }
      case 'epithet': { var gen = uniq(all.filter(function (s) { return s.genus === sp.genus; }).map(function (s) { return s.epithet; })); var fam2 = uniq(all.filter(function (s) { return s.family === sp.family; }).map(function (s) { return s.epithet; })); var any = uniq(all.map(function (s) { return s.epithet; })); return pick(5, sp.epithet, uniq(gen.concat(fam2, any))); }
    }
  }
  function hintFor(sp, rank) {
    switch (rank) {
      case 'kingdom': return sp.kingdom === 'Plantae' ? 'It photosynthesises. Not every specimen in a zoology drawer is an animal.' : 'It moves, eats other organisms and has no cell walls.';
      case 'phylum': return PHYLUM_HINTS[sp.phylum] || '';
      case 'cls': return CLASS_HINTS[sp.cls] || '';
      case 'order': return ORDER_HINTS[sp.order] || sp.note;
      case 'family': return (sp.kingdom === 'Animalia' ? 'Animal families end in -idae. ' : 'Plant families end in -aceae. ') + sp.note;
      case 'genus': return 'The genus is the first word of ' + sp.sci.replace(sp.genus, '____') + '. ' + sp.note;
      case 'epithet': return 'Always lowercase. Full name: ' + sp.genus + ' ' + sp.epithet.slice(0, 2) + '…';
    }
  }
  function renderClassify(el, sp) {
    var st = Store.data.species[sp.id] || {};
    var ri = 0, tries = 0, locked = false;
    function stars() { return tries === 0 ? 3 : tries <= 2 ? 2 : 1; }
    function draw() {
      var rank = RANKS[ri];
      var setObj = SPECIES_SETS.filter(function (x) { return x.id === sp.set; })[0];
      el.innerHTML = '<p><a href="#/taxonomy/project/set/' + sp.set + '">← ' + esc(setObj.name) + '</a></p>' +
        '<div class="grid" style="grid-template-columns: minmax(220px, 1fr) 2fr">' +
        '<div class="card"><div style="position:relative">' + Media.photoHTML(sp.sci, { alt: sp.common }) + '</div><h3 style="margin:10px 0 2px">' + esc(sp.common) + '</h3><p class="small muted">Field note: ' + esc(sp.note) + '</p><button class="btn sm" id="morePhotos">More photographs</button></div>' +
        '<div class="card"><div class="ranks" id="rankStrip">' + RANKS.map(function (r, k) { return '<span class="rank ' + (k < ri ? 'done' : k === ri ? 'now' : '') + '"><b>' + RANK_LABEL[r] + '</b>' + (k < ri ? esc(r === 'epithet' ? sp.genus.charAt(0) + '. ' + sp.epithet : sp[r]) : '?') + '</span>'; }).join('') + '</div>' +
        '<h3>' + (rank === 'epithet' ? 'Which species is it?' : 'Which ' + RANK_LABEL[rank].toLowerCase() + '?') + '</h3>' +
        '<div class="choices" id="choices">' + choicesFor(sp, rank).map(function (c) { return '<button class="choice ' + (rank === 'genus' || rank === 'epithet' ? 'sci' : '') + '" data-v="' + esc(c) + '">' + (rank === 'epithet' ? '<span class="sci">' + esc(sp.genus) + ' ' + esc(c) + '</span>' : esc(c)) + '</button>'; }).join('') + '</div>' +
        '<div class="row" style="margin-top:12px"><button class="btn sm" id="hintBtn">💡 Hint</button><span class="small muted" id="hintTxt"></span></div>' +
        '<p class="small muted" style="margin-top:10px">Stars so far: ' + '★'.repeat(stars()) + '</p></div></div>';
      Media.hydrate(el);
      document.getElementById('morePhotos').onclick = function () { App.speciesModal(sp); };
      document.getElementById('hintBtn').onclick = function () { document.getElementById('hintTxt').textContent = hintFor(sp, rank); };
      el.querySelectorAll('.choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (locked) return;
          var v = b.getAttribute('data-v'); var ok = v === sp[rank];
          if (ok) { locked = true; b.classList.add('right'); setTimeout(function () { locked = false; ri++; if (ri >= RANKS.length) finish(); else draw(); }, 550); }
          else { tries++; b.classList.add('wrong'); b.disabled = true; App.toast('Not ' + v + '. Try again.'); }
        });
      });
    }
    function finish() {
      var d = Store.data; var first = !(d.species[sp.id] && d.species[sp.id].done);
      d.species[sp.id] = Object.assign({}, d.species[sp.id] || {}, { done: true, date: Store.today(), tries: tries, stars: stars() });
      if (d.cabinet.indexOf(sp.id) < 0) d.cabinet.push(sp.id);
      d.lastSpecimen = sp.id; Store.touch(); Store.save(); App.checkBadges();
      var s = d.settings; var label = (d.species[sp.id].label) || { country: 'USA', state: 'New York', locality: 'Oswego Co., Rice Creek Field Station', date: Store.today(), collector: s.collector, det: s.collector };
      var sib = SPECIES.filter(function (x) { return x.set === sp.set && !(d.species[x.id] && d.species[x.id].done); })[0];
      el.innerHTML = '<div class="hero"><h1>Pinned. <span class="sci">' + esc(sp.sci) + '</span></h1><p class="lede">' + '★'.repeat(stars()) + (first ? ' First time in the cabinet.' : ' Re-pinned.') + ' Now write its labels the way a museum would. Two labels go under every pinned insect: locality and date on top, the determination (who identified it, and when) below.</p></div>' +
        '<div class="grid"><div class="card"><h3>Locality label</h3><div class="field"><label>Country</label><input id="lc" value="' + esc(label.country) + '"></div><div class="field"><label>State / province</label><input id="ls" value="' + esc(label.state) + '"></div><div class="field"><label>Locality (county, place, habitat)</label><input id="ll" value="' + esc(label.locality) + '"></div><div class="field"><label>Date</label><input id="ld" value="' + esc(label.date) + '"></div><div class="field"><label>Collector</label><input id="lk" value="' + esc(label.collector) + '"></div></div>' +
        '<div class="card"><h3>How it will look</h3><div class="stack"><div class="label-paper" id="lab1"></div><div class="label-paper" id="lab2"></div></div><p class="small muted" style="margin-top:10px">Real labels are printed tiny (4-point type) on acid-free card and pinned under the specimen, locality label first. “leg.” is Latin for “collected by”; “det.” for “determined (identified) by”. Dates are written day-roman month-year so no one mistakes the month.</p>' +
        '<div class="row"><button class="btn primary" id="saveLab">Save labels</button>' + (sib ? '<a class="btn monarch" href="#/taxonomy/project/' + sib.id + '">Next: ' + esc(sib.common) + '</a>' : '<a class="btn monarch" href="#/taxonomy/project">Next expedition</a>') + '<a class="btn" href="#/taxonomy/cabinet">Open the cabinet</a></div></div></div>';
      function roman(dateStr) { var m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/); if (!m) return dateStr; var R = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii']; return (+m[3]) + '.' + R[+m[2] - 1] + '.' + m[1]; }
      function upd() {
        label = { country: v('lc'), state: v('ls'), locality: v('ll'), date: v('ld'), collector: v('lk'), det: s.collector };
        document.getElementById('lab1').textContent = label.country.toUpperCase() + ': ' + label.state + ': ' + label.locality + '\n' + roman(label.date) + ' ' + label.collector + ' leg.';
        document.getElementById('lab2').innerHTML = '<i>' + esc(sp.sci) + '</i><br>det. ' + esc(label.det) + ' ' + label.date.slice(0, 4);
      }
      function v(id) { return document.getElementById(id).value; }
      ['lc', 'ls', 'll', 'ld', 'lk'].forEach(function (id) { document.getElementById(id).addEventListener('input', upd); }); upd();
      document.getElementById('saveLab').onclick = function () { d.species[sp.id].label = label; Store.save(); App.toast('Labels saved'); };
    }
    if (st.done) {
      el.innerHTML = '<div class="card"><h3>' + esc(sp.common) + ' is already pinned</h3><p>You classified it on ' + esc(st.date) + ' (' + '★'.repeat(st.stars || 1) + '). Classify it again for practice, or open its photographs.</p><div class="row"><button class="btn primary" id="again">Classify again</button><button class="btn" id="photos">Photographs</button><a class="btn" href="#/taxonomy/project/set/' + sp.set + '">Back to the drawer</a></div></div>';
      document.getElementById('again').onclick = draw; document.getElementById('photos').onclick = function () { App.speciesModal(sp); }; return;
    }
    draw();
  }

  /* ------------------------------------------------------------
     Cabinet */
  function renderCabinet(el) {
    var d = Store.data; var ids = d.cabinet.slice().reverse();
    el.innerHTML = '<h2 style="margin-top:0">Your cabinet</h2><p class="lede">' + (ids.length ? ids.length + ' specimens, newest first, each with the label you wrote. Tap one for its photographs.' : 'Empty so far. Every specimen you classify is pinned here with its label.') + '</p>' +
      '<div class="grid tight">' + ids.map(function (id) {
        var s = SPECIES.filter(function (x) { return x.id === id; })[0]; if (!s) return ''; var st = d.species[id] || {}; var L = st.label;
        return '<div class="card spec done" style="position:relative" onclick="App.speciesModal(SPECIES[' + s.index + '])">' + Media.photoHTML(s.sci, { cls: 'sq', alt: s.common }) + '<span class="pin">📌</span><div class="nm">' + esc(s.common) + '</div><div class="sc">' + esc(s.sci) + '</div>' + (L ? '<div class="label-paper">' + esc(L.country.toUpperCase() + ': ' + L.state + ': ' + L.locality) + '<br>' + esc(L.date + ' ' + L.collector + ' leg.') + '</div>' : '') + '<div class="small muted">' + '★'.repeat(st.stars || 1) + ' · ' + esc(st.date || '') + '</div></div>';
      }).join('') + '</div>';
  }

  /* ------------------------------------------------------------
     Drawer sort: drag species photos into the right drawer */
  function renderSort(el) {
    var modes = [
      { name: 'Sort by class', rank: 'cls', filter: function (s) { return s.phylum === 'Chordata'; } },
      { name: 'Sort insects by order', rank: 'order', filter: function (s) { return s.cls === 'Insecta'; } },
      { name: 'Sort mammals by order', rank: 'order', filter: function (s) { return s.cls === 'Mammalia'; } },
      { name: 'Sort birds by order', rank: 'order', filter: function (s) { return s.cls === 'Aves'; } },
      { name: 'Sort by phylum', rank: 'phylum', filter: function () { return true; } }
    ];
    var m = modes[Math.floor(Math.random() * modes.length)];
    var pool = SPECIES.filter(m.filter);
    var groups = {}; pool.forEach(function (s) { (groups[s[m.rank]] = groups[s[m.rank]] || []).push(s); });
    var keys = Object.keys(groups).filter(function (k) { return groups[k].length >= 2; });
    for (var k = keys.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = keys[k]; keys[k] = keys[j]; keys[j] = t; }
    keys = keys.slice(0, 4);
    var items = []; keys.forEach(function (key) { var g = groups[key].slice(); for (var k2 = g.length - 1; k2 > 0; k2--) { var j2 = Math.floor(Math.random() * (k2 + 1)); var t2 = g[k2]; g[k2] = g[j2]; g[j2] = t2; } items = items.concat(g.slice(0, 3)); });
    for (var k3 = items.length - 1; k3 > 0; k3--) { var j3 = Math.floor(Math.random() * (k3 + 1)); var t3 = items[k3]; items[k3] = items[j3]; items[j3] = t3; }
    el.innerHTML = '<h2 style="margin-top:0">Drawer sort</h2><p class="lede">' + esc(m.name) + '. Drag each specimen into the right drawer. Wrong drawers bounce it back.</p>' +
      '<div class="card"><h4 style="margin:0 0 6px">Tray</h4><div class="dragzone" id="tray">' + items.map(function (s) { return '<div class="dragitem" data-id="' + s.id + '" data-key="' + esc(s[m.rank]) + '">' + Media.photoHTML(s.sci, { cls: 'sq', nocredit: true, alt: s.common }) + '<div style="padding:3px 2px">' + esc(s.common) + '</div></div>'; }).join('') + '</div></div>' +
      '<div class="grid" style="margin-top:12px">' + keys.map(function (key) { return '<div class="card pad0"><div class="dragzone" data-key="' + esc(key) + '" style="border:0;min-height:130px"><h4>' + esc(key) + '<br><span class="small muted" style="font-weight:400">' + esc(ORDER_HINTS[key] || CLASS_HINTS[key] || PHYLUM_HINTS[key] || '') + '</span></h4></div></div>'; }).join('') + '</div>' +
      '<p class="row" style="margin-top:12px"><button class="btn" id="newSort">New tray</button></p>';
    document.getElementById('newSort').onclick = function () { renderSort(el); Media.hydrate(el); };
    var zones = el.querySelectorAll('.dragzone[data-key]'); var placed = 0, wrong = 0;
    el.querySelectorAll('.dragitem').forEach(function (it) {
      var sx, sy, ox, oy, dragging = false, ghost = null;
      it.addEventListener('pointerdown', function (e) {
        e.preventDefault(); it.setPointerCapture(e.pointerId); dragging = true;
        var r = it.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top;
        ghost = it.cloneNode(true); ghost.classList.add('dragging'); ghost.style.left = (e.clientX - ox) + 'px'; ghost.style.top = (e.clientY - oy) + 'px'; document.body.appendChild(ghost); it.style.opacity = .3;
      });
      it.addEventListener('pointermove', function (e) { if (!dragging) return; ghost.style.left = (e.clientX - ox) + 'px'; ghost.style.top = (e.clientY - oy) + 'px'; zones.forEach(function (z) { var zr = z.getBoundingClientRect(); z.classList.toggle('over', e.clientX > zr.left && e.clientX < zr.right && e.clientY > zr.top && e.clientY < zr.bottom); }); });
      function up(e) {
        if (!dragging) return; dragging = false; ghost.remove(); it.style.opacity = 1;
        var target = null; zones.forEach(function (z) { z.classList.remove('over'); var zr = z.getBoundingClientRect(); if (e.clientX > zr.left && e.clientX < zr.right && e.clientY > zr.top && e.clientY < zr.bottom) target = z; });
        if (!target) return;
        if (target.getAttribute('data-key') === it.getAttribute('data-key')) { target.appendChild(it); it.style.cursor = 'default'; it.onpointerdown = null; placed++; if (placed === items.length) { Store.set('sorted', (Store.get('sorted', 0) || 0) + 1); App.toast(wrong ? 'Tray sorted with ' + wrong + ' bounce' + (wrong === 1 ? '' : 's') + '.' : 'Perfect tray!', 3000); } }
        else { wrong++; App.toast('Not that drawer. ' + (ORDER_HINTS[it.getAttribute('data-key')] || CLASS_HINTS[it.getAttribute('data-key')] || 'Look again.')); }
      }
      it.addEventListener('pointerup', up); it.addEventListener('pointercancel', up);
    });
  }

  /* ------------------------------------------------------------
     Section */
  App.register({
    id: 'taxonomy', title: 'Taxonomy Lab', icon: '🧬', blurb: 'Lessons, the 3D tree of life across deep time, and the long-term classification project.',
    render: function (el, args) {
      var tab = args[0] || 'overview';
      var tabs = [['overview', 'Overview'], ['project', 'Project'], ['tree', '3D tree'], ['sort', 'Drawer sort'], ['learn', 'Lessons'], ['cabinet', 'Cabinet']];
      var bar = '<div class="chips" style="margin-bottom:14px">' + tabs.map(function (t) { return '<a class="chip ' + (tab === t[0] ? 'on' : '') + '" href="#/taxonomy/' + t[0] + '" style="text-decoration:none">' + t[1] + '</a>'; }).join('') + '</div>';
      var body = document.createElement('div'); el.innerHTML = bar; el.appendChild(body);
      if (tab === 'project') renderProject(body, args.slice(1));
      else if (tab === 'tree') renderTree(body);
      else if (tab === 'sort') renderSort(body);
      else if (tab === 'learn') renderLearn(body, args[1]);
      else if (tab === 'cabinet') renderCabinet(body);
      else {
        var done = Store.data.cabinet.length;
        body.innerHTML = '<section class="hero"><h1>Taxonomy Lab</h1><p class="lede">Taxonomy is the grammar of zoology: the naming and ordering of life. Linnaeus gave it two-part names; Darwin gave it a tree; the Smithsonian gave it drawers. Here you learn the system, see it in three dimensions and across 650 million years, and then build your own cabinet one specimen at a time.</p></section>' +
          '<div class="grid">' +
          '<a class="card" href="#/taxonomy/project" style="text-decoration:none;color:inherit"><h3>📌 The project</h3><p class="small muted">' + done + ' of ' + SPECIES.length + ' specimens pinned. Seven ranks each. The long game.</p><div class="bar"><i style="width:' + (100 * done / SPECIES.length) + '%"></i></div></a>' +
          '<a class="card" href="#/taxonomy/tree" style="text-decoration:none;color:inherit"><h3>🌳 3D tree, with time</h3><p class="small muted">Spin the tree of life, tap any branch, and scrub from 650 million years ago to today.</p></a>' +
          '<a class="card" href="#/taxonomy/sort" style="text-decoration:none;color:inherit"><h3>🗂️ Drawer sort</h3><p class="small muted">Drag real photographs into the right class or order. Quick, touchable, endless.</p></a>' +
          '<a class="card" href="#/taxonomy/learn" style="text-decoration:none;color:inherit"><h3>📖 Lessons</h3><p class="small muted">Names, ranks, trees, keys and why museums keep 148 million things. Five readings with quizzes.</p></a>' +
          '<a class="card" href="#/taxonomy/cabinet" style="text-decoration:none;color:inherit"><h3>🏛️ Your cabinet</h3><p class="small muted">Every pinned specimen with the label you wrote for it.</p></a></div>';
      }
    },
    unmount: unmountTree
  });
})();
