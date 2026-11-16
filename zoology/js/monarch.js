/* ============================================================
   monarch.js — The Monarch
   Life cycle with real staged photographs (iNaturalist life-stage
   annotations), an animated month-by-month migration map (the 4D
   part), the tag spot, mimicry, the numbers, and how to help.
   ============================================================ */
(function () {
  var esc = Media.esc;
  var STAGES = [
    { id: 'egg', name: 'Egg', term: 7, days: '3–5 days', text: 'A single cream, ribbed egg the size of a pinhead, almost always on the underside of a milkweed leaf. A female lays 300–500 of them, one per leaf.' },
    { id: 'larva', name: 'Caterpillar', term: 6, days: '10–14 days, five instars', text: 'Striped yellow, black and white; two pairs of black filaments. Sheds its skin four times (five instars) and grows about 2,000 times in weight, eating only milkweed and storing its cardenolides.' },
    { id: 'pupa', name: 'Chrysalis', term: 4, days: '10–14 days', text: 'Jade green with a row of gold dots. The caterpillar hangs in a J, sheds a final time, and rebuilds itself inside. The day before emergence the chrysalis turns clear and the orange wings show through.' },
    { id: 'adult', name: 'Adult', term: 2, days: '2–6 weeks in summer; 8–9 months for the migratory generation', text: 'Males have a black scent spot on each hindwing vein and thinner veins; females have thicker black veins and no spots. The September generation does not breed; it flies to Mexico.' }
  ];
  var ROUTE = [ /* month, lat, lng, caption */
    { m: 'Aug', lat: 43.43, lng: -76.56, cap: 'Late August, Oswego: the last summer generation emerges. Shorter days and cooler nights switch off its urge to breed. This is the super generation.' },
    { m: 'Sep', lat: 41.9, lng: -82.5, cap: 'September: monarchs funnel along the Lake Ontario and Lake Erie shores (Derby Hill, Point Pelee), waiting for north winds to cross the water. Tagging season in New York.' },
    { m: 'Sep', lat: 39.0, lng: -76.5, cap: 'Late September: Cape May and the Appalachian ridges. They ride thermals like hawks, gliding to save fat.' },
    { m: 'Oct', lat: 35.5, lng: -89.0, cap: 'October: across Tennessee and Arkansas. They roost in thousands in the same trees year after year.' },
    { m: 'Oct', lat: 30.3, lng: -97.7, cap: 'Mid-October: the Texas funnel. Nectar here (frostweed, goldenrod) is the fuel for the mountains ahead.' },
    { m: 'Nov', lat: 19.6, lng: -100.27, cap: 'Early November: arrival in the oyamel fir forests of Michoacán and the State of Mexico, around Día de los Muertos. Up to 3,000 miles done.' },
    { m: 'Dec', lat: 19.6, lng: -100.27, cap: 'December–February: clustered by the millions at 3,000 m, in cold, damp, foggy forest that keeps them in torpor and stops them burning fat.' },
    { m: 'Mar', lat: 27.5, lng: -99.5, cap: 'March: warming days; they mate, leave the mountains and fly north into Texas, lay eggs on the first milkweed and die. Their job is done.' },
    { m: 'Apr', lat: 32.5, lng: -96.8, cap: 'April: generation one emerges in Texas and Oklahoma and pushes north.' },
    { m: 'May', lat: 38.5, lng: -90.2, cap: 'May: generation two across the Midwest.' },
    { m: 'Jun', lat: 43.43, lng: -76.56, cap: 'June–July: generations three and four reach New York and Ontario. Milkweed in Oswego County raises the butterflies that will fly back to Mexico in August.' }
  ];
  var leaflet = null, map = null, timer = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leaflet) return leaflet;
    leaflet = new Promise(function (res, rej) {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'; s.onload = function () { res(window.L); }; s.onerror = function () { leaflet = null; rej(new Error('no leaflet')); }; document.head.appendChild(s);
    });
    return leaflet;
  }
  window.loadLeaflet = loadLeaflet;

  function render(el, args) {
    var tab = args[0] || 'life';
    var tabs = [['life', 'Life cycle'], ['migration', 'Migration map'], ['tag', 'Tagging'], ['mimics', 'Mimics & poison'], ['help', 'Help & see']];
    el.innerHTML = '<section class="hero monarch"><h1>The Monarch</h1><p class="lede"><span class="sci">Danaus plexippus</span>. A butterfly that weighs half a gram and flies 3,000 miles to a forest its great-grandparents left in March. Here is its whole year, with real photographs, a map you can scrub month by month, and the one thing you can do for it this September.</p></section>' +
      '<div class="chips" style="margin-bottom:14px">' + tabs.map(function (t) { return '<a class="chip monarch ' + (tab === t[0] ? 'on' : '') + '" href="#/monarch/' + t[0] + '" style="text-decoration:none">' + t[1] + '</a>'; }).join('') + '</div><div id="mbody"></div>';
    var b = document.getElementById('mbody');
    if (tab === 'life') life(b); else if (tab === 'migration') migration(b); else if (tab === 'tag') tag(b); else if (tab === 'mimics') mimics(b); else help(b);
  }
  function life(b) {
    b.innerHTML = '<div class="chips" id="stageChips">' + STAGES.map(function (s, i) { return '<button class="chip monarch ' + (i === 0 ? 'on' : '') + '" data-i="' + i + '">' + s.name + '</button>'; }).join('') + '</div><div id="stageBox" style="margin-top:12px"></div>' +
      '<h2>Numbers to carry around</h2><div class="grid"><div class="card stat"><b>4</b><span>generations a year in the North</span></div><div class="card stat"><b>1</b><span>plant family its caterpillar can eat: milkweeds</span></div><div class="card stat"><b>3,000 mi</b><span>longest known insect migration, Ontario to Michoacán</span></div><div class="card stat"><b>0.5 g</b><span>weight of an adult</span></div></div>' +
      '<h2>Videos</h2>' + Media.videoGrid(VIDEOS.monarch) + '<h2>Open-licence monarch film <span class="tag ok">live</span></h2><div id="monCommons"></div>';
    Media.commonsVideoStrip(document.getElementById('monCommons'), 'monarch butterfly Danaus plexippus', 6);
    function show(i) {
      var s = STAGES[i];
      document.querySelectorAll('#stageChips .chip').forEach(function (c, k) { c.classList.toggle('on', k === i); });
      var box = document.getElementById('stageBox');
      box.innerHTML = '<div class="card"><h3 style="margin:0">' + esc(s.name) + ' <span class="tag">' + esc(s.days) + '</span></h3><p>' + esc(s.text) + '</p><div class="grid tight" id="stagePhotos"><p class="muted small">Loading real photographs of this stage from iNaturalist…</p></div></div>';
      Media.taxon('Danaus plexippus').then(function (t) {
        if (!t) throw new Error('offline');
        return Media.nearby({ lat: 40, lng: -90, radius: 3000, n: 8, taxon_id: t.id, extra: '&term_id=1&term_value_id=' + s.term });
      }).then(function (obs) {
        var g = document.getElementById('stagePhotos'); if (!g) return;
        if (!obs.length) { g.innerHTML = '<p class="muted small">No photographs loaded (offline?).</p>'; return; }
        g.innerHTML = obs.map(function (o) { return '<a class="card spec" href="' + esc(o.link) + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="photo sq"><img class="loaded" src="' + esc(o.url) + '" alt="' + esc(s.name) + '" loading="lazy"><span class="credit">' + esc((o.attr || '').replace(/^\(c\)\s*/, '© ')) + '</span></div><div class="small muted">' + esc(o.place) + '<br>' + esc(o.date) + '</div></a>'; }).join('');
      }).catch(function () { var g = document.getElementById('stagePhotos'); if (g) g.innerHTML = '<p class="muted small">Photographs need an internet connection.</p>'; });
    }
    document.querySelectorAll('#stageChips .chip').forEach(function (c) { c.onclick = function () { show(+c.getAttribute('data-i')); }; });
    show(0);
  }
  function migration(b) {
    b.innerHTML = '<div class="card"><div class="map" id="mmap"><p class="muted small" style="padding:12px">Loading map…</p></div><div class="row" style="margin-top:10px"><button class="btn sm" id="mplay">▶ Play the year</button><input type="range" id="mrange" min="0" max="' + (ROUTE.length - 1) + '" value="0" style="flex:1" aria-label="Month"><b id="mmonth" style="min-width:40px">Aug</b></div><p id="mcap" style="margin-top:8px"></p><p class="small" id="mlive" style="margin:0"><span class="tag ok">live</span> <span class="muted">Loading real sightings for this month…</span></p><div class="row" style="margin-top:8px"><button class="btn sm" id="mnow">Show the last 14 days</button><span class="small muted">Orange dots: research-grade monarch records on iNaturalist for the month shown, from every year. Blue dots: this fortnight.</span></div></div>' +
      '<h2>Why it works</h2><div class="grid"><div class="card"><h3>A compass in the antennae</h3><p class="small">Monarchs steer by the sun, corrected by a clock in their antennae, and by a magnetic sense as backup. Fliers from Ontario and from Maine converge on the same 12 mountaintops they have never seen.</p></div><div class="card"><h3>Fat, not food</h3><p class="small">They leave with little fat and arrive with more: they feed on fall nectar along the way and glide on thermals to spend as little as possible. In Mexico they live on stored fat for four months.</p></div><div class="card"><h3>The cold keeps them alive</h3><p class="small">At 3,000 m the oyamel forest is cold enough to slow their metabolism but, under the canopy, not cold enough to freeze them. Thin the forest and the microclimate breaks; that is why logging matters so much.</p></div></div>' +
      '<h2>Milestones in the science</h2><div class="timeline">' + [['1930s–1976', 'Fred and Norah Urquhart in Toronto tag monarchs with paper labels; in January 1975 a volunteer couple find the first colony in Michoacán, announced in National Geographic in 1976.'], ['1986', 'Mexico creates the Monarch Butterfly Biosphere Reserve; UNESCO lists it in 2008.'], ['1992', 'Chip Taylor founds Monarch Watch at the University of Kansas; the modern tagging program begins.'], ['1996–97', 'Peak winter population: about 18 hectares of forest covered.'], ['2013–14', 'Record low: 0.67 ha.'], ['2023–24', '0.9 ha. 2024–25: 1.79 ha, nearly double. Each hectare is roughly 21 million butterflies.'], ['Dec 2024', 'US Fish and Wildlife Service proposes listing the monarch as threatened under the Endangered Species Act. Check the current status before you plan anything that involves handling monarchs commercially.']].map(function (t) { return '<div class="tl"><div class="yr">' + esc(t[0]) + '</div><div class="small">' + esc(t[1]) + '</div></div>'; }).join('') + '</div>';
    var range = document.getElementById('mrange'), month = document.getElementById('mmonth'), cap = document.getElementById('mcap'), play = document.getElementById('mplay');
    var marker = null, trail = null, dots = null, nowDots = null, Lf = null, liveT = null;
    var MN = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }, MNAME = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var BOX = [14, -125, 55, -60];
    function loadMonth(m) {
      clearTimeout(liveT);
      liveT = setTimeout(function () {
        var lv = document.getElementById('mlive'); if (!lv) return;
        Media.points({ taxon_id: 48662, month: m, box: BOX, n: 200 }).then(function (res) {
          if (!document.getElementById('mlive')) return;
          if (dots) { dots.clearLayers(); res.pts.forEach(function (p) { Lf.circleMarker([p[0], p[1]], { radius: 3.5, color: '#b85e0d', weight: 0.5, fillColor: '#f08a1e', fillOpacity: 0.75 }).addTo(dots); }); }
          lv.innerHTML = '<span class="tag ok">live</span> ' + (res.total ? res.total.toLocaleString() + ' research-grade monarch records in ' + MNAME[m] + ' across North America, all years; a random ' + res.pts.length + ' are mapped. Watch the cloud of dots move with the slider.' : '<span class="muted">No live records loaded (offline?). The route still plays.</span>');
        });
      }, 350);
    }
    function setI(i) {
      i = +i; range.value = i; var r = ROUTE[i]; month.textContent = r.m; cap.textContent = r.cap; loadMonth(MN[r.m]);
      if (map && marker) { marker.setLatLng([r.lat, r.lng]); trail.setLatLngs(ROUTE.slice(0, i + 1).map(function (p) { return [p.lat, p.lng]; })); }
    }
    range.addEventListener('input', function () { stop(); setI(range.value); });
    document.getElementById('mnow').onclick = function () {
      var d = new Date(Date.now() - 14 * 24 * 3600 * 1000), d1 = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); var btn = this; btn.textContent = 'Loading…';
      Media.points({ taxon_id: 48662, d1: d1, box: BOX, n: 200 }).then(function (res) {
        btn.textContent = res.total.toLocaleString() + ' monarchs reported since ' + d1;
        if (nowDots) { nowDots.clearLayers(); res.pts.forEach(function (p) { Lf.circleMarker([p[0], p[1]], { radius: 5, color: '#123a6b', weight: 1, fillColor: '#3f8fd9', fillOpacity: 0.85 }).addTo(nowDots).bindPopup('Monarch, ' + esc(p[2]) + '<br><a href="https://www.inaturalist.org/observations/' + p[3] + '" target="_blank" rel="noopener">open record</a>'); }); }
      });
    };
    function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Play the year'; }
    play.onclick = function () { if (timer) { stop(); return; } var i = 0; setI(0); play.textContent = '⏸ Pause'; timer = setInterval(function () { i++; if (i >= ROUTE.length) { stop(); return; } setI(i); }, 1600); };
    setI(0);
    loadLeaflet().then(function (L) {
      var box = document.getElementById('mmap'); if (!box) return; box.innerHTML = '';
      map = L.map(box, { scrollWheelZoom: false }).setView([32, -92], 4);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
      L.polyline(ROUTE.map(function (p) { return [p.lat, p.lng]; }), { color: '#e07a1f', weight: 3, opacity: .35, dashArray: '6 8' }).addTo(map);
      Lf = L; dots = L.layerGroup().addTo(map); nowDots = L.layerGroup().addTo(map);
      trail = L.polyline([], { color: '#e07a1f', weight: 5 }).addTo(map);
      marker = L.circleMarker([ROUTE[0].lat, ROUTE[0].lng], { radius: 10, color: '#1a1208', fillColor: '#f4a24a', fillOpacity: 1, weight: 2 }).addTo(map);
      [['Oswego / Rice Creek', 43.43, -76.56], ['Point Pelee', 41.96, -82.52], ['Cape May', 38.95, -74.94], ['El Rosario & Sierra Chincua', 19.6, -100.27]].forEach(function (p) { L.marker([p[1], p[2]]).addTo(map).bindPopup(p[0]); });
      setI(range.value);
    }).catch(function () { var box = document.getElementById('mmap'); if (box) box.style.height = 'auto'; box.innerHTML = '<p class="muted small" style="padding:12px">The map needs an internet connection. The slider and captions still work.</p>'; });
  }
  function tag(b) {
    var tagged = Store.get('monarchTag', false);
    b.innerHTML = '<div class="grid"><div class="card"><h3>Where does the tag go?</h3><p class="small">Tap the <b>discal cell</b> of the hindwing: the large cell in the middle of the hindwing, over the centre of gravity, so the tag does not unbalance the flight.</p>' +
      '<div class="studio-stage"><svg viewBox="0 0 600 400" id="tagSvg"><rect width="600" height="400" fill="#efe6cf"/>' +
      '<g transform="translate(300 170)"><path d="M0 8 C 60 -20, 150 -50, 160 -20 C 170 20, 100 70, 0 45 Z" fill="#f08a1e" stroke="#1a1208" stroke-width="7"/><path d="M0 20 C 50 30, 95 80, 85 120 C 70 150, 15 130, 0 80 Z" fill="#e8781a" stroke="#1a1208" stroke-width="7"/>' +
      '<path d="M18 40 C 40 40, 60 60, 62 85 C 50 95, 30 92, 20 75 Z" fill="none" stroke="#1a1208" stroke-width="2" stroke-dasharray="4 4" id="discal"/>' +
      '<path d="M0 -40 C 40 -60, 120 -70, 150 -40 M15 -5 C 60 -20, 110 -35, 150 -30 M20 60 C 40 80, 60 110, 70 130" stroke="#1a1208" stroke-width="3" fill="none" opacity=".5"/>' +
      '<path d="M-12 -60 C -60 -100, -80 -120, -100 -140" stroke="#1a1208" stroke-width="3" fill="none"/><ellipse cx="-8" cy="30" rx="10" ry="60" fill="#1a1208"/><circle cx="-8" cy="-40" r="10" fill="#1a1208"/></g>' +
      '<g id="tagMark"></g><text x="300" y="370" text-anchor="middle" font-size="16" fill="#1f2a22">right wings of a monarch seen from above, head at the top, forewing above, hindwing below</text></svg></div><p id="tagMsg" class="small">' + (tagged ? '✅ You have placed a tag correctly before.' : '') + '</p></div>' +
      '<div class="card"><h3>How to tag, Monarch Watch style</h3><div class="steps"><div class="step"><div><b>Order a kit</b> from Monarch Watch in spring or summer (they ship from July, only east of the Rockies, only for fall tagging). Each tag is a lightweight polypropylene disc with a code of four letters and three numbers.</div></div><div class="step"><div><b>Catch</b> a monarch gently in a net during peak migration for your latitude. Oswego sits near 43.4° N; peak is roughly the first three weeks of September.</div></div><div class="step"><div><b>Hold</b> all four wings closed between thumb and forefinger over the back, near the body.</div></div><div class="step"><div><b>Press the tag</b> on the discal cell of the hindwing, firmly, for a few seconds. One tag per butterfly.</div></div><div class="step"><div><b>Record</b> the tag code, date, sex (scent spots = male), whether it was wild or reared, and the place. 2026 kits add a wing ruler for condition.</div></div><div class="step"><div><b>Release</b> and submit your datasheet (or use the Monarch Watch app) at the end of the season. If a tag is found in Mexico, you will be told where.</div></div></div><p class="small muted">Found a tagged monarch? Report the code at monarchwatch.org. Do not tag outside the fall migration, and never tag other species.</p><a class="btn monarch" href="https://monarchwatch.org/tagging/" target="_blank" rel="noopener">Monarch Watch tagging ↗</a></div></div>';
    var svg = document.getElementById('tagSvg');
    svg.addEventListener('pointerdown', function (e) {
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      var cx = 300 + 40, cy = 170 + 70; var d = Math.hypot(p.x - cx, p.y - cy);
      var mark = document.getElementById('tagMark'), msg = document.getElementById('tagMsg');
      if (d < 26) { mark.innerHTML = '<circle cx="' + cx + '" cy="' + cy + '" r="14" fill="#fff" stroke="#1a1208" stroke-width="2"/><text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="8" font-family="monospace">ABC123</text>'; msg.textContent = '✅ On the discal cell of the hindwing. The butterfly flies normally.'; if (!tagged) { Store.set('monarchTag', true); } }
      else { mark.innerHTML = '<circle cx="' + p.x + '" cy="' + p.y + '" r="9" fill="none" stroke="#b8402f" stroke-width="3"/>'; msg.textContent = p.y < 190 ? 'That is the forewing. Tags go on the hindwing so the forewing can still beat freely.' : 'Closer to the middle of the hindwing: the big discal cell, over the centre of gravity.'; }
    });
  }
  function mimics(b) {
    b.innerHTML = '<div class="grid"><div class="card">' + Media.photoHTML('Danaus plexippus', { alt: 'Monarch' }) + '<h3>Monarch</h3><p class="small">No black line across the hindwing. Larger, slower, floating flight. Toxic: cardenolides from milkweed make birds vomit.</p></div><div class="card">' + Media.photoHTML('Limenitis archippus', { alt: 'Viceroy' }) + '<h3>Viceroy</h3><p class="small"><b>A black line crossing the hindwing veins.</b> Smaller, faster, flaps-and-glides. Once called a harmless mimic (Batesian); it turns out viceroys taste bad too (Müllerian), so both species profit from looking alike.</p></div><div class="card">' + Media.photoHTML('Danaus gilippus', { alt: 'Queen' }) + '<h3>Queen</h3><p class="small">Same genus, browner, white spots on the forewing. Southern. Also milkweed-fed and toxic.</p></div></div>' +
      '<h2>The chemistry</h2><div class="card"><p>Milkweed makes <b>cardenolides</b> (cardiac glycosides), poisons that stop the sodium-potassium pump in animal cells. The monarch caterpillar has a mutated pump that the poison cannot bind, so it eats the leaf and stores the poison in its body. A blue jay that eats one monarch vomits within minutes and never touches the orange-and-black pattern again. That is <b>aposematism</b>, a warning colour, the same deal the poison frog in your Showstoppers drawer makes.</p><p class="small muted">In Mexico, two birds beat the system: black-headed grosbeaks tolerate the poison and black-backed orioles slit the body open and eat only the low-poison insides. They take tens of thousands of monarchs a winter. Both are in your Monarch drawer.</p></div>';
  }
  function help(b) {
    b.innerHTML = '<div class="grid"><div class="card"><h3>Plant the only food</h3><p class="small">Common milkweed (<span class="sci">Asclepias syriaca</span>), swamp milkweed (<span class="sci">A. incarnata</span>) and butterfly milkweed (<span class="sci">A. tuberosa</span>) are native to Oswego County. Add fall nectar: goldenrod, asters, zinnias. Skip tropical milkweed in the North; it holds the parasite OE through the season.</p></div>' +
      '<div class="card"><h3>Count, tag, report</h3><ul class="small"><li><b>Monarch Watch</b>: tagging in September.</li><li><b>Journey North</b>: report first sightings, roosts and milkweed each spring and fall.</li><li><b>Monarch Larva Monitoring Project</b> (University of Wisconsin–Madison Arboretum): weekly milkweed checks for eggs and larvae, real research you can run on Rice Creek’s old fields.</li><li><b>iNaturalist</b>: every photo with a date and place is a record.</li></ul></div>' +
      '<div class="card"><h3>Go and see them</h3><ul class="small"><li><b>Derby Hill</b> and the Lake Ontario shore, early September, 20 minutes from campus.</li><li><b>Point Pelee</b>, Ontario, mid-September: the crossing.</li><li><b>Cape May</b>, New Jersey, late September: counts and tagging demos.</li><li><b>El Rosario / Sierra Chincua</b>, Michoacán, late January: the colonies themselves. Four hours from Mexico City; go on a weekday; walk or take a horse.</li></ul><a class="btn sm" href="#/explore/monarch">These on the map →</a></div></div>' +
      '<h2>Rearing, done right</h2><div class="card small"><p>Rearing a few monarchs from eggs is how most lepidopterists started. Keep it small and clean: collect eggs or tiny caterpillars from your own milkweed, one container per few larvae, fresh leaves daily, wipe frass, and release adults the day they can fly. Do not buy monarchs and do not rear hundreds; mass rearing spreads OE (<span class="sci">Ophryocystis elektroscirrha</span>), a protozoan that cripples wings. Bleach-rinse eggs if you want to be rigorous. If you want specimens for the cabinet, a reared adult that died naturally at the end of its life is a perfect one.</p></div>';
  }
  App.register({ id: 'monarch', title: 'Monarch', icon: '🦋', blurb: 'The whole year of Danaus plexippus: life cycle in real photos, the migration month by month, tagging, mimics and how to help.',
    render: render, unmount: function () { clearInterval(timer); timer = null; if (map) { try { map.remove(); } catch (e) {} map = null; } } });
})();
