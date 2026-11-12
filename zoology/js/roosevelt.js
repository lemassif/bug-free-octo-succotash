/* ============================================================
   roosevelt.js — Roosevelt & the Smithsonian
   The boy with a museum in his bedroom, the 1909–10 Smithsonian–
   Roosevelt African Expedition (with a month-by-month route map),
   the haul, the people, and the conservation legacy, told straight,
   including the part modern zoologists argue about.
   ============================================================ */
(function () {
  var esc = Media.esc;
  var ROUTE = [
    { d: 'Mar 23, 1909', lat: 40.7, lng: -74.0, t: 'Leaves New York on the Hamburg, nineteen days after handing the presidency to Taft. In the hold: the “pigskin library”, sixty books bound in pigskin to survive the field, and crates of tin-lined salt for skins.' },
    { d: 'Apr 21, 1909', lat: -4.05, lng: 39.67, t: 'Lands at Mombasa, British East Africa (Kenya). Takes the Uganda Railway inland, riding on a seat bolted to the front of the engine to watch the game.' },
    { d: 'May 1909', lat: -1.6, lng: 37.1, t: 'Kapiti Plains, Kitanga: first lions, with the Nairobi settlers. The scientists start skinning; the Smithsonian wants not trophies but complete series, male, female, young, of every species.' },
    { d: 'Jun 1909', lat: -0.77, lng: 36.35, t: 'Lake Naivasha: hippos from a rowboat; Kermit photographs; Mearns shoots birds at dawn; Loring runs trap lines for mice and shrews every night.' },
    { d: 'Jul 1909', lat: -0.6, lng: 35.1, t: 'The Sotik and the Guaso Nyiro: eland, topi, cheetah, giant forest hog, the plains fauna that will fill the Smithsonian’s African hall.' },
    { d: 'Aug–Sep 1909', lat: -0.15, lng: 37.3, t: 'Mount Kenya and Meru: bongo in the bamboo, colobus in the forest, and elephants. Carl Akeley, collecting elephants for the American Museum, joins the party.' },
    { d: 'Oct–Nov 1909', lat: 0.8, lng: 35.2, t: 'Uasin Gishu plateau and the Nzoia River: more series for the museum, and the counting begins in the field notebooks.' },
    { d: 'Dec 1909', lat: 0.05, lng: 32.46, t: 'Across Lake Victoria to Entebbe and Kampala, Uganda. Grey crowned cranes, shoebills, new birds for Mearns.' },
    { d: 'Jan 1910', lat: 1.82, lng: 31.33, t: 'Lake Albert and the Lado Enclave: the white rhinoceros series. Roosevelt later writes that he is not sure they should have taken so many of an animal already rare.' },
    { d: 'Feb 1910', lat: 4.9, lng: 31.66, t: 'Down the White Nile by foot and steamer: Nimule, Gondokoro. Crocodiles, marabous, the last skins packed.' },
    { d: 'Mar 14, 1910', lat: 15.6, lng: 32.53, t: 'Khartoum. Edith Roosevelt is waiting. The expedition is over: about 11,400 animal specimens and thousands of plants are on their way to Washington.' },
    { d: 'Jun 18, 1910', lat: 40.7, lng: -74.0, t: 'Back in New York after a tour of Europe. African Game Trails is published that year; the Smithsonian spends eight years cataloguing.' }
  ];
  var TIMELINE = [
    ['Oct 27, 1858', 'Born in New York City, asthmatic and near-sighted. His father, Theodore Sr., helps found the American Museum of Natural History eleven years later.'],
    ['1865–67', 'Aged seven he sees a dead seal on a Broadway market stall, obtains its skull and starts the “Roosevelt Museum of Natural History” in his bedroom with two cousins. Mice, birds, insects follow; the family housekeepers complain.'],
    ['1872', 'Learns taxidermy from John G. Bell, who had prepared birds for Audubon. Gets his first gun and his first spectacles the same year, and realises he had never actually seen a bird clearly.'],
    ['1876–80', 'Harvard, intending to be a naturalist. Publishes “The Summer Birds of the Adirondacks” (1877) with Henry Minot, a real scientific checklist from New York’s north woods, at eighteen. Finds the new lab-bound biology dull and turns to politics.'],
    ['1882', 'Gives most of his boyhood collection, 622 bird skins among them, to the Smithsonian; others go to the American Museum, where his snowy owl still is.'],
    ['1887', 'Founds the Boone and Crockett Club: the first American conservation group to push for game laws, Yellowstone’s protection and, later, national forests.'],
    ['1901–09', 'President. Protects about 230 million acres: 150 national forests, 5 national parks, 18 national monuments (the Grand Canyon in 1908), 51 federal bird reservations starting with Pelican Island (1903), 4 game preserves. Creates the US Forest Service (1905). Signs the Antiquities Act (1906).'],
    ['1909–10', 'The Smithsonian–Roosevelt African Expedition (map below).'],
    ['1913–14', 'The Roosevelt–Rondon Scientific Expedition descends Brazil’s unmapped River of Doubt for the American Museum; he nearly dies of infection and fever. The river is now the Rio Roosevelt.'],
    ['Jan 6, 1919', 'Dies at Sagamore Hill. The AMNH’s Theodore Roosevelt Memorial opens in 1936.']
  ];
  var PEOPLE = [
    ['Edgar A. Mearns', 'Edgar Alexander Mearns', 'Army surgeon and the expedition’s ornithologist; shot and skinned most of the 4,000 birds and collected the plants.'],
    ['Edmund Heller', 'Edmund Heller', 'Smithsonian mammalogist and taxidermist in charge of the big skins; later described dozens of new mammals from the haul, including Roosevelt’s sable antelope.'],
    ['J. Alden Loring', 'John Alden Loring', 'Small-mammal specialist from Owego, New York. Ran the trap lines: rodents, shrews, bats, the animals nobody shoots but every ecologist needs.'],
    ['Kermit Roosevelt', 'Kermit Roosevelt', 'Nineteen-year-old son, Harvard student, photographer and the party’s best shot on foot.'],
    ['Carl Akeley', 'Carl Akeley', 'Taxidermist-sculptor of the American Museum, inventor of the modern diorama; joined for the elephant hunt. His African Hall at the AMNH is where Katie can see the result.'],
    ['R. J. Cuninghame & Leslie Tarlton', 'Richard John Cuninghame', 'Professional hunters who ran the safari: 250 porters, gun-bearers, tent-men, skinners, each with a job, walking 15–20 miles a day.']
  ];
  var map = null, timer = null;
  function render(el, args) {
    var tab = args[0] || 'story';
    var tabs = [['story', 'The story'], ['map', 'Expedition map'], ['haul', 'The haul & the people'], ['legacy', 'Legacy & the argument'], ['videos', 'Films']];
    el.innerHTML = '<section class="hero bark"><h1>Roosevelt &amp; the Smithsonian</h1><p class="lede">A sickly boy with a museum in his bedroom became the president who protected 230 million acres, then spent a year in East Africa collecting 11,400 animals for the Smithsonian and opening the whole continent’s fauna to taxonomy. Here is how, where, with whom, and why zoologists still argue about it.</p></section>' +
      '<div class="chips" style="margin-bottom:14px">' + tabs.map(function (t) { return '<a class="chip ' + (tab === t[0] ? 'on' : '') + '" href="#/roosevelt/' + t[0] + '" style="text-decoration:none">' + t[1] + '</a>'; }).join('') + '</div><div id="rbody"></div>';
    var b = document.getElementById('rbody');
    if (tab === 'map') mapTab(b); else if (tab === 'haul') haul(b); else if (tab === 'legacy') legacy(b); else if (tab === 'videos') b.innerHTML = Media.videoGrid(VIDEOS.roosevelt); else story(b);
  }
  function story(b) {
    b.innerHTML = '<div class="grid" style="grid-template-columns: minmax(200px,1fr) 2fr"><div class="card">' + Media.photoHTML('', { wiki: 'Theodore Roosevelt', alt: 'Theodore Roosevelt', icon: '🎩' }) + '<p class="small muted" style="margin-top:8px">Photograph via Wikipedia.</p></div><div class="card"><h3 style="margin-top:0">The young naturalist</h3><p>Before he was anything else, Theodore Roosevelt was a bird skinner. He kept notebooks of every species he saw, learned taxidermy from Audubon’s own preparator, and at eighteen co-wrote a checklist of Adirondack birds that ornithologists still cite. He went to Harvard to become a zoologist and found that the new biology lived in laboratories, not in the field; he left science for politics but never stopped collecting. The habits of the field, the notebook and the label stayed with him into the White House, where he kept a list of the birds on the grounds.</p><p>The African expedition was his return to the trade. It was planned with the Smithsonian’s secretary, Charles Walcott, as a collecting expedition first and a safari second: every animal measured, skinned, labelled, salted and crated for Washington.</p></div></div>' +
      '<h2>Timeline</h2><div class="timeline">' + TIMELINE.map(function (t) { return '<div class="tl"><div class="yr">' + esc(t[0]) + '</div><div>' + esc(t[1]) + '</div></div>'; }).join('') + '</div>';
  }
  function mapTab(b) {
    b.innerHTML = '<div class="card"><div class="map" id="rmap"><p class="muted small" style="padding:12px">Loading map…</p></div><div class="row" style="margin-top:10px"><button class="btn sm" id="rplay">▶ Play the year</button><input type="range" id="rrange" min="0" max="' + (ROUTE.length - 1) + '" value="0" style="flex:1" aria-label="Expedition stage"><b id="rdate" style="min-width:110px"></b></div><p id="rcap" style="margin-top:8px"></p></div>' +
      '<h2>Walk it today</h2><div class="grid"><div class="card"><h3>Laikipia and Mpala</h3><p class="small">Much of Roosevelt’s Kenyan route runs through what is now Laikipia county. The Mpala Research Centre there is run with the Smithsonian and Princeton, and takes undergraduates for field courses: the scientific heir of the expedition.</p></div><div class="card"><h3>Nairobi National Museum</h3><p class="small">Holds East Africa’s own collections, and the Nairobi railway museum has the engine seat Roosevelt rode on.</p></div><div class="card"><h3>Lake Naivasha and Mount Kenya</h3><p class="small">Still the hippo lake and the bongo mountain. Walking safaris and the Mount Kenya forest are within reach of a two-week Kenya program.</p></div></div><p><a class="btn" href="#/explore/safari">Safari programs on the Explore map →</a></p>';
    var range = document.getElementById('rrange'), date = document.getElementById('rdate'), cap = document.getElementById('rcap'), play = document.getElementById('rplay');
    var marker = null, trail = null;
    function setI(i) { i = +i; range.value = i; var r = ROUTE[i]; date.textContent = r.d; cap.textContent = r.t; if (map && marker) { marker.setLatLng([r.lat, r.lng]); trail.setLatLngs(ROUTE.slice(1, Math.max(1, i + 1)).map(function (p) { return [p.lat, p.lng]; })); if (i > 0 && i < ROUTE.length - 1) map.panTo([r.lat, r.lng]); } }
    range.addEventListener('input', function () { stop(); setI(range.value); });
    function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Play the year'; }
    play.onclick = function () { if (timer) { stop(); return; } var i = 0; setI(0); play.textContent = '⏸ Pause'; timer = setInterval(function () { i++; if (i >= ROUTE.length) { stop(); return; } setI(i); }, 2200); };
    setI(0);
    window.loadLeaflet().then(function (L) {
      var box = document.getElementById('rmap'); if (!box) return; box.innerHTML = '';
      map = L.map(box, { scrollWheelZoom: false }).setView([2, 34], 5);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
      L.polyline(ROUTE.slice(1, ROUTE.length - 1).map(function (p) { return [p.lat, p.lng]; }), { color: '#6b5436', weight: 3, opacity: .35, dashArray: '6 8' }).addTo(map);
      trail = L.polyline([], { color: '#6b5436', weight: 5 }).addTo(map);
      marker = L.circleMarker([ROUTE[0].lat, ROUTE[0].lng], { radius: 10, color: '#1a1208', fillColor: '#e07a1f', fillOpacity: 1, weight: 2 }).addTo(map);
      ROUTE.slice(1, ROUTE.length - 1).forEach(function (p) { L.marker([p.lat, p.lng]).addTo(map).bindPopup('<b>' + esc(p.d) + '</b><br>' + esc(p.t)); });
      setI(range.value);
    }).catch(function () { var box = document.getElementById('rmap'); if (box) box.style.height = 'auto'; box.innerHTML = '<p class="muted small" style="padding:12px">The map needs an internet connection. The slider and captions still work.</p>'; });
  }
  function haul(b) {
    b.innerHTML = '<div class="grid"><div class="card stat"><b>11,400</b><span>zoological specimens, about: the figure the Smithsonian uses</span></div><div class="card stat"><b>~5,000</b><span>mammals (Roosevelt’s own count 4,897)</span></div><div class="card stat"><b>~4,000</b><span>birds</span></div><div class="card stat"><b>~2,000</b><span>reptiles and amphibians</span></div><div class="card stat"><b>~500</b><span>fish, plus insects, crabs, millipedes, molluscs</span></div><div class="card stat"><b>thousands</b><span>of plants (Mearns): sources say 5,000 to 10,000</span></div><div class="card stat"><b>512</b><span>big-game animals shot by Theodore (296) and Kermit (216), by his own tally in African Game Trails</span></div><div class="card stat"><b>8 years</b><span>for the Smithsonian to catalogue it all</span></div></div>' +
      '<h2>The people</h2><div class="grid">' + PEOPLE.map(function (p) { return '<div class="card">' + Media.photoHTML('', { wiki: p[1], alt: p[0], icon: '👤', cls: 'sq' }) + '<h3 style="margin:8px 0 4px">' + esc(p[0]) + '</h3><p class="small">' + esc(p[2]) + '</p></div>'; }).join('') + '</div>' +
      '<h2>What a series is</h2><div class="card"><p>The expedition’s instructions were not “shoot a lion” but “collect a <b>series</b>”: adult males, adult females, young, from several places, with the skull and the measurements and the exact locality. Only a series lets a taxonomist see what varies within a species and what separates two species. That is why Heller could describe new subspecies from the crates, and why those same skins answer new questions a century later: pre-colonial diets from isotopes, historical ranges, genetics of populations that no longer exist. Your classification project asks for the same discipline in miniature: the label is the science.</p></div>' +
      '<h2>Species from the expedition in your project</h2><div class="grid tight">' + SPECIES.filter(function (s) { return s.set === 'africa'; }).slice(0, 12).map(function (s) { return '<div class="card spec" onclick="App.speciesModal(SPECIES[' + s.index + '])">' + Media.photoHTML(s.sci, { cls: 'sq', alt: s.common }) + '<div class="nm">' + esc(s.common) + '</div></div>'; }).join('') + '</div><p><a class="btn" href="#/taxonomy/project/set/africa">Open the Africa drawer →</a></p>';
  }
  function legacy(b) {
    b.innerHTML = '<div class="grid"><div class="card"><h3>What he opened</h3><p class="small">Before 1909 the Smithsonian’s African collection fit in a few cases. After it, Washington held one of the great reference collections of African mammals and birds, and American zoologists could work on a continent’s fauna without going to London or Berlin. The expedition also set a template: scientific collecting attached to field expeditions, every specimen with data, published quickly. Akeley’s dioramas, built from the same safaris, taught a century of city children what a savanna looked like.</p></div>' +
      '<div class="card"><h3>The argument</h3><p class="small">The expedition killed over five hundred large animals, and Roosevelt enjoyed the hunting. Critics said so in 1909 and say so now. His defence was that nearly everything went to science and that game laws, which he championed, would protect the rest. Both things were true at once: he was a hunter, and he created more protected land than any president before or since. Modern collecting is different in degree, not kind: museums still collect, under permits, in small series, for the same reasons, and the debate about which species and how many is a live one Katie will take part in.</p></div>' +
      '<div class="card"><h3>Conservation by the numbers</h3><ul class="small"><li>About 230 million acres protected.</li><li>Pelican Island, Florida, 1903: the first federal bird reservation, the seed of the National Wildlife Refuge System (Montezuma NWR near Oswego is one of its 570-plus refuges).</li><li>51 bird reservations, 5 national parks, 18 national monuments, 150 national forests.</li><li>US Forest Service, 1905; Antiquities Act, 1906.</li></ul></div></div>' +
      '<h2>For a zoologist-actor</h2><div class="card"><p>Roosevelt was also a performer: the speeches, the big stick, the charge up the hill, the cowboy hat. The dioramas Akeley built from his safaris are theatre, staged light and painted backdrops and a frozen moment. Museum halls, nature documentaries and zoo shows all descend from that marriage of specimen and stagecraft. It is one answer to the question of what a person who loves both zoology and the stage does for a living: she builds the exhibit, writes the script and runs the show.</p></div>';
  }
  App.register({ id: 'roosevelt', title: 'Roosevelt', icon: '🦁', blurb: 'The boy naturalist, the 1909 Smithsonian expedition on a month-by-month map, the 11,400 specimens, and the legacy.',
    render: render, unmount: function () { clearInterval(timer); timer = null; if (map) { try { map.remove(); } catch (e) {} map = null; } } });
})();
