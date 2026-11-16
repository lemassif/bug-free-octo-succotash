/* ============================================================
   owls.js — Owls & Bird Banding
   New York's owls with real photographs, how a banding station
   works, a UV feather-aging lab (saw-whet feathers glow pink), a
   pellet dissection tray, and where to do it for real.
   ============================================================ */
(function () {
  var esc = Media.esc;
  var OWLS = SPECIES.filter(function (s) { return s.set === 'owls'; });
  var OWL_FACTS = {
    'Aegolius acadicus': { len: '18–21 cm', wt: '65–100 g', call: 'a flat, whistled too-too-too, about two per second, all night in March; the alarm is a rasp said to sound like a saw being whetted', ny: 'Breeds in the Adirondacks and Tug Hill; migrates through Oswego County in October–November; some winter here.', aab: 'Northern_Saw-whet_Owl' },
    'Aegolius funereus': { len: '22–27 cm', wt: '90–200 g', call: 'a rapid, hollow winnowing', ny: 'Rare winter visitor from the boreal forest; a few banded at Owlnet stations in irruption years.', aab: 'Boreal_Owl' },
    'Bubo virginianus': { len: '46–63 cm', wt: '0.9–1.9 kg', call: 'deep hoo-h’HOO-hoo-hoo; pairs duet', ny: 'Everywhere. Nests in January in old hawk nests. The only regular predator of skunks.', aab: 'Great_Horned_Owl' },
    'Bubo scandiacus': { len: '52–71 cm', wt: '1.6–2.9 kg', call: 'mostly silent in winter', ny: 'Irruption winters bring them to Lake Ontario’s shore, Oswego harbor and airports; look on breakwaters and dunes.', aab: 'Snowy_Owl' },
    'Strix varia': { len: '43–50 cm', wt: '470–1,050 g', call: '“Who cooks for you, who cooks for you-all”', ny: 'Common in Rice Creek’s swampy woods; calls by day in spring.', aab: 'Barred_Owl' },
    'Strix nebulosa': { len: '61–84 cm', wt: '0.7–1.7 kg', call: 'slow, deep whoo notes', ny: 'Very rare winter visitor to the North Country.', aab: 'Great_Gray_Owl' },
    'Megascops asio': { len: '16–25 cm', wt: '120–240 g', call: 'a descending whinny and a long trill', ny: 'Common in towns, orchards and edges; roosts in cavities and nest boxes. Grey and red morphs.', aab: 'Eastern_Screech-Owl' },
    'Asio flammeus': { len: '34–43 cm', wt: '200–475 g', call: 'barks and a muffled hoot', ny: 'New York endangered. Winters in the big grasslands around Fort Drum and the Finger Lakes; hunts at dusk like a giant moth.', aab: 'Short-eared_Owl' },
    'Asio otus': { len: '35–40 cm', wt: '220–435 g', call: 'low, evenly spaced hoo notes', ny: 'Secretive; winter roosts of several birds in dense conifers. Ear tufts close together, orange face.', aab: 'Long-eared_Owl' },
    'Surnia ulula': { len: '36–45 cm', wt: '240–400 g', call: 'a trilling whistle', ny: 'Rare winter visitor; hunts by day from the top of a spruce.', aab: 'Northern_Hawk_Owl' },
    'Tyto alba': { len: '32–40 cm', wt: '400–700 g', call: 'a long hissing shriek, no hoot', ny: 'Rare in upstate New York now; farmland on Long Island and the Hudson Valley. Heart-shaped face, dark eyes.', aab: 'Barn_Owl' }
  };

  function render(el, args) {
    var tab = args[0] || 'owls';
    var tabs = [['owls', 'New York’s owls'], ['live', 'Reported lately'], ['banding', 'How banding works'], ['uv', 'UV aging lab'], ['pellet', 'Pellet lab'], ['places', 'Do it for real']];
    el.innerHTML = '<section class="hero owl"><h1>Owls &amp; Bird Banding</h1><p class="lede">Eleven owls, one of them the size of a soda can and bright pink under a black light. How a mist net, a tape lure and a numbered aluminium band turn a night in the woods into fifty years of migration data, and where within an hour of Oswego Katie can hold a saw-whet herself.</p></section>' +
      '<div class="chips" style="margin-bottom:14px">' + tabs.map(function (t) { return '<a class="chip ' + (tab === t[0] ? 'on' : '') + '" href="#/owls/' + t[0] + '" style="text-decoration:none">' + t[1] + '</a>'; }).join('') + '</div><div id="obody"></div>';
    var b = document.getElementById('obody');
    if (tab === 'live') live(b); else if (tab === 'banding') banding(b); else if (tab === 'uv') uv(b); else if (tab === 'pellet') pellet(b); else if (tab === 'places') places(b); else owls(b);
  }
  function owls(b) {
    b.innerHTML = '<div class="grid">' + OWLS.map(function (s) {
      var f = OWL_FACTS[s.sci] || {};
      return '<div class="card">' + Media.photoHTML(s.sci, { alt: s.common }) + '<h3 style="margin:10px 0 2px">' + esc(s.common) + '</h3><p class="sci muted small" style="margin:0 0 6px">' + esc(s.sci) + ' · ' + esc(s.family) + '</p><p class="small"><b>Size:</b> ' + esc(f.len || '') + ', ' + esc(f.wt || '') + '<br><b>Voice:</b> ' + esc(f.call || '') + '<br><b>In New York:</b> ' + esc(f.ny || '') + '</p><div class="row"><button class="btn sm primary owlSound" data-sci="' + esc(s.sci) + '">🔊 Hear it</button><button class="btn sm" onclick="App.speciesModal(SPECIES[' + s.index + '])">Photos</button><a class="btn sm ghost" href="https://www.allaboutbirds.org/guide/' + esc(f.aab || '') + '/sounds" target="_blank" rel="noopener">More calls ↗</a></div><div class="owlAudio small" style="margin-top:8px"></div></div>';
    }).join('') + '</div>' +
      '<h2>Owl anatomy, in three facts</h2><div class="grid"><div class="card"><h3>Silent wings</h3><p class="small">A comb of serrations on the leading edge of the outer primaries and a velvet surface on the feathers break up the air; a saw-whet can drop onto a mouse in snow without a sound. Hawk owls and fish-eating owls, which do not need silence, lack the comb.</p></div><div class="card"><h3>Asymmetric ears</h3><p class="small">In saw-whets and barn owls the ear openings sit at different heights, so a sound arrives a fraction of a second apart in each ear and the owl triangulates in the dark. The facial disc is a dish that funnels sound to them.</p></div><div class="card"><h3>Pellets</h3><p class="small">Owls swallow prey whole and compact bones and fur into a pellet they cast up about once a day. A pile of pellets under a roost is a diet study waiting to happen (Pellet lab tab).</p></div></div>' +
      '<h2>The saw-whet, in particular</h2><div class="card"><p>The smallest owl in the East, <span class="sci">Aegolius acadicus</span> weighs about as much as a robin. It breeds in northern and mountain forests and migrates south in October and November, at night, in numbers nobody suspected until banders started playing its call at nets in the 1990s: one station in Pennsylvania caught over a thousand in a single autumn. Big flight years come every four years or so, tracking the boom-and-bust of the deer mice it eats. It caches extra mice on branches in winter and thaws a frozen one by sitting on it as if incubating an egg. It is tame in the hand and will sit on a glove staring at you, which is why it has become the bird that turns students into ornithologists.</p></div>' +
      '<h2>Videos</h2>' + Media.videoGrid(VIDEOS.owls) + '<h2>Open-licence owl film <span class="tag ok">live</span></h2><div id="owlCommons"></div>';
    Media.commonsVideoStrip(document.getElementById('owlCommons'), 'owl', 6);
    b.querySelectorAll('.owlSound').forEach(function (btn) {
      btn.onclick = function () {
        var box = btn.parentNode.nextElementSibling; box.innerHTML = '<span class="muted">Finding recordings on iNaturalist…</span>';
        Media.sounds(btn.getAttribute('data-sci'), 6).then(function (list) {
          if (!list.length) { box.innerHTML = '<span class="muted">No recording came back (offline, or none shared yet). Try “More calls”.</span>'; return; }
          var i = 0;
          var show = function () { var s = list[i]; box.innerHTML = '<audio controls autoplay preload="none" src="' + esc(s.url) + '" style="width:100%"></audio><div class="muted">Recording ' + (i + 1) + ' of ' + list.length + ': ' + esc(s.place) + (s.date ? ', ' + esc(s.date) : '') + '. ' + esc((s.attr || '').replace(/^\(c\)\s*/, '© ')) + ' <a href="' + esc(s.link) + '" target="_blank" rel="noopener">record ↗</a>' + (list.length > 1 ? ' <button class="btn sm ghost nx" style="min-height:28px;padding:2px 8px">another</button>' : '') + '</div>'; var nx = box.querySelector('.nx'); if (nx) nx.onclick = function () { i = (i + 1) % list.length; show(); }; };
          show();
        });
      };
    });
  }
  /* ---- live: what has been reported ---- */
  var lmap = null;
  function live(b) {
    var d = new Date(Date.now() - 75 * 24 * 3600 * 1000), d1 = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    b.innerHTML = '<p class="lede">Read live from iNaturalist: every research-grade owl record within 150 km of Oswego, newest first, and where Northern Saw-whet Owls have been reported across New York and its neighbours in the last ten weeks.</p>' +
      '<div class="card"><div class="map" id="omap" style="height:340px"><p class="muted small" style="padding:12px">Loading map…</p></div><p class="small muted" id="ocount" style="margin:8px 0 0">Counting saw-whets…</p><p class="small muted" style="margin:4px 0 0">iNaturalist deliberately blurs the exact position of many owl records to protect roosting birds, so dots are approximate.</p></div>' +
      '<h2>Owls near Oswego</h2><div class="grid tight" id="olist"><p class="muted small">Loading…</p></div>';
    Media.nearby({ lat: 43.45, lng: -76.5, radius: 150, n: 24, taxon_id: 19350 }).then(function (obs) {
      var box = document.getElementById('olist'); if (!box) return;
      box.innerHTML = obs.length ? obs.map(function (o) { return '<a class="card spec" href="' + esc(o.link) + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="photo sq"><img class="loaded" src="' + esc(o.url) + '" alt="" loading="lazy"><span class="credit">' + esc((o.attr || '').replace(/^\(c\)\s*/, '© ')) + '</span></div><div class="nm">' + esc(o.common || o.sci) + '</div><div class="sc">' + esc(o.sci) + '</div><div class="small muted">' + esc(o.date) + ' · ' + esc(o.place) + '</div></a>'; }).join('') : '<p class="muted small">Nothing loaded. This needs an internet connection.</p>';
    });
    Promise.all([window.loadLeaflet(), Media.taxon('Aegolius acadicus')]).then(function (r) {
      var L = r[0], t = r[1], box = document.getElementById('omap'); if (!box || !t) return; box.innerHTML = '';
      lmap = L.map(box, { scrollWheelZoom: false }).setView([43.0, -76.0], 6);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 14 }).addTo(lmap);
      L.marker([43.4311, -76.5565]).addTo(lmap).bindPopup('Rice Creek Field Station'); L.marker([43.31, -77.72]).addTo(lmap).bindPopup('Braddock Bay Bird Observatory (saw-whet banding)');
      return Media.points({ taxon_id: t.id, d1: d1, box: [39.5, -81, 46.5, -70], n: 200 }).then(function (res) {
        res.pts.forEach(function (p) { L.circleMarker([p[0], p[1]], { radius: 6, color: '#2b2b4a', weight: 1, fillColor: '#f4a24a', fillOpacity: 0.85 }).addTo(lmap).bindPopup('Northern Saw-whet Owl<br>' + esc(p[2]) + '<br><a href="https://www.inaturalist.org/observations/' + p[3] + '" target="_blank" rel="noopener">open record</a>'); });
        var c = document.getElementById('ocount'); if (c) c.textContent = res.total + ' research-grade Northern Saw-whet Owl records in this region since ' + d1 + (res.total > res.pts.length ? ' (' + res.pts.length + ' mapped)' : '') + '. Autumn migration peaks from mid-October to mid-November.';
      });
    }).catch(function () { var box = document.getElementById('omap'); if (box) { box.style.height = 'auto'; box.innerHTML = '<p class="muted small" style="padding:12px">The map needs an internet connection.</p>'; } });
  }
  function banding(b) {
    b.innerHTML = '<div class="grid"><div class="card"><h3>What a band is</h3><p class="small">A light aluminium ring with a unique nine-digit number, issued by the USGS <b>Bird Banding Laboratory</b> in Maryland (Canada’s office is its partner). A saw-whet wears a size 4; a great horned owl a size 8. Every band put on a bird is recorded, and every band found anywhere in the world is reported to the same database: that is how we know a saw-whet banded at Braddock Bay turned up in Alabama.</p><p class="small">Found a banded bird? Report it at <a href="https://www.reportband.gov" target="_blank" rel="noopener">reportband.gov</a>. You get a certificate saying where and when it was banded; the bander gets the recovery.</p></div>' +
      '<div class="card"><h3>Permits</h3><p class="small">Banding is done under a federal Master Permit, which takes years of documented training. The path is: volunteer at a station → sub-permittee under a master bander (this is where undergraduates start) → your own permit. Rice Creek’s banding and Braddock Bay’s owl station are exactly the places that path begins. Handling owls requires an endorsement on top of songbirds.</p></div></div>' +
      '<h2>A saw-whet station, hour by hour</h2><div class="steps"><div class="step"><div><b>Dusk.</b> Open a line of mist nets, usually several 12-metre nets 2.6 metres high in a woodland corridor. The mesh is so fine birds cannot see it.</div></div><div class="step"><div><b>The lure.</b> A speaker in the middle of the nets plays the male saw-whet’s toot call on a loop. Migrating owls come to investigate and hit the net, which pockets them gently. Project Owlnet standardised this protocol so every station’s catch rates can be compared.</div></div><div class="step"><div><b>Net checks every 30–60 minutes,</b> more often in cold or rain, until about midnight or later. Owls come out of the net head first, by the legs, in a few seconds, and go into a cloth bag to calm down.</div></div><div class="step"><div><b>At the table.</b> Band on the leg (right or left by convention). Wing chord with a stopped ruler. Mass on a scale, in a cup. Fat score. Then the black light (UV lab tab) to age the bird, and wing length plus mass to sex it: females are the big ones.</div></div><div class="step"><div><b>Release</b> on a branch or a glove in the dark, away from the nets. A saw-whet usually sits a minute, looks around, and goes. Total time in hand: under ten minutes.</div></div><div class="step"><div><b>Data entry</b> to the Bird Banding Lab and to Project Owlnet. A recapture at another station, sometimes the same week, is what maps the migration.</div></div></div>' +
      '<h2>Songbird banding at Rice Creek</h2><div class="card"><p>Rice Creek Field Station’s banding is songbird banding: chickadees, sparrows, warblers and especially Northern Cardinals, which Daniel Baldassarre’s lab colour-bands so individual birds can be followed by eye to map territories and nesting. Master bander Jim Keefer ran the station’s banding for years under a federal permit, more than a thousand birds by 2014. For a student it is the ideal apprenticeship: nets, extraction, aging by skull and feather wear, data. The Bird Banding at SUNY Oswego video on the Owls tab shows it.</p></div>';
  }

  /* ---- UV aging lab ---- */
  function uv(b) {
    var done = Store.get('owls.uvCount', 0);
    b.innerHTML = '<div class="grid" style="grid-template-columns: 3fr 2fr"><div class="card"><h3 style="margin-top:0">The wing, under white light and black light</h3><div class="studio-stage" id="wingStage"></div><div class="row" style="margin-top:10px"><button class="btn primary" id="uvBtn">🔦 Switch on the UV lamp</button><span class="small muted" id="uvHint"></span></div></div>' +
      '<div class="card"><h3 style="margin-top:0">Age this owl</h3><p class="small">Fresh saw-whet flight feathers carry <b>porphyrin</b> pigments that fluoresce bright pink-magenta under a 365-nm UV lamp. The pigment fades with a year of sunlight. So:</p><ul class="small"><li><b>HY</b> (hatch-year): all flight feathers grew this summer, so the whole wing glows evenly bright.</li><li><b>SY</b> (second-year): the bird replaced some flight feathers in its first moult, leaving a sharp block of bright new feathers next to dull year-old ones. Two generations.</li><li><b>ASY</b> (after-second-year): three generations, bright, faded and nearly dark, in a patchy pattern.</li></ul><div class="choices"><button class="choice" data-a="HY">HY</button><button class="choice" data-a="SY">SY</button><button class="choice" data-a="ASY">ASY</button></div><p id="uvMsg" class="small" style="margin-top:10px"></p><p class="small muted">Correct so far: <b id="uvCount">' + done + '</b> (three earns the badge). The Bird Banding Lab codes are HY, SY, ASY, and AHY (after hatch-year) when SY and ASY cannot be separated.</p><button class="btn sm" id="uvNew">New owl</button></div></div>';
    var stage = document.getElementById('wingStage'); var lamp = false, answer, gens;
    function newOwl() {
      var r = Math.random(); answer = r < 0.4 ? 'HY' : r < 0.75 ? 'SY' : 'ASY';
      gens = []; /* 10 primaries (outer→inner) then 10 secondaries */
      for (var i = 0; i < 20; i++) gens.push(0);
      if (answer === 'SY') { var start = 3 + Math.floor(Math.random() * 6); for (var k = start; k < start + 5 + Math.floor(Math.random() * 6) && k < 20; k++) gens[k] = 1; if (Math.random() < .5) { gens = gens.map(function (g) { return 1 - g; }); } }
      if (answer === 'ASY') { for (var j = 0; j < 20; j++) gens[j] = Math.floor(Math.random() * 3); gens[4] = 2; gens[12] = 1; gens[7] = 0; }
      lamp = false; draw(); document.getElementById('uvMsg').textContent = ''; document.getElementById('uvBtn').textContent = '🔦 Switch on the UV lamp'; document.getElementById('uvHint').textContent = 'Under white light every feather looks the same. Switch on the lamp.';
    }
    function draw() {
      var bg = lamp ? '#120a24' : '#efe6cf';
      var colW = ['#8a7352', '#8a7352', '#8a7352'], colU = ['#ff3fc6', '#b05a90', '#4a2a44'];
      var s = '<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="320" fill="' + bg + '"/>';
      for (var i = 0; i < 20; i++) {
        var x = 40 + i * 26; var h = i < 10 ? 230 - i * 6 : 170 - (i - 10) * 4; var c = (lamp ? colU : colW)[gens[i]];
        s += '<path d="M' + x + ' ' + (300 - h) + ' C ' + (x + 14) + ' ' + (300 - h + 20) + ', ' + (x + 16) + ' ' + (300 - 30) + ', ' + (x + 8) + ' 300 L ' + (x - 6) + ' 300 C ' + (x - 10) + ' ' + (300 - 40) + ', ' + (x - 4) + ' ' + (300 - h + 30) + ', ' + x + ' ' + (300 - h) + ' Z" fill="' + c + '" stroke="' + (lamp ? '#2a1a3a' : '#5a4a32') + '" stroke-width="1.5"/>';
        if (lamp) s += '<path d="M' + x + ' ' + (300 - h + 10) + ' L ' + (x + 2) + ' 290" stroke="' + (gens[i] === 0 ? '#ffd0f0' : gens[i] === 1 ? '#d090c0' : '#6a4a64') + '" stroke-width="1" opacity=".7"/>';
      }
      s += '<text x="40" y="24" font-size="13" fill="' + (lamp ? '#eee' : '#333') + '">P10 (outer primary)</text><text x="300" y="24" font-size="13" fill="' + (lamp ? '#eee' : '#333') + '">P1 | S1</text><text x="500" y="24" font-size="13" fill="' + (lamp ? '#eee' : '#333') + '">S10 (inner)</text>';
      s += '<text x="300" y="316" font-size="12" text-anchor="middle" fill="' + (lamp ? '#ccc' : '#555') + '">' + (lamp ? 'UV: bright magenta = this year’s feather; pale = last year’s; dark = older' : 'White light: underside of the right wing, feathers fanned') + '</text></svg>';
      stage.innerHTML = s;
    }
    document.getElementById('uvBtn').onclick = function () { lamp = !lamp; draw(); this.textContent = lamp ? '💡 Back to white light' : '🔦 Switch on the UV lamp'; document.getElementById('uvHint').textContent = lamp ? 'Look for blocks of contrast.' : ''; };
    document.getElementById('uvNew').onclick = newOwl;
    b.querySelectorAll('.choice').forEach(function (c) {
      c.onclick = function () {
        var a = c.getAttribute('data-a'); var msg = document.getElementById('uvMsg');
        if (!lamp) { msg.textContent = 'Switch the lamp on first; you cannot age a saw-whet by white light alone.'; return; }
        if (a === answer) { done = Store.get('owls.uvCount', 0) + 1; Store.set('owls.uvCount', done); document.getElementById('uvCount').textContent = done; msg.innerHTML = '<b>Correct: ' + answer + '.</b> ' + (answer === 'HY' ? 'Every feather grew this summer, so the wing glows evenly.' : answer === 'SY' ? 'One sharp block of bright new feathers against a block of faded ones: two generations.' : 'Three shades in a patchwork: three generations of feathers, so the bird is at least in its third calendar year.'); if (done >= 3 && !Store.get('owls.uv')) { Store.set('owls.uv', Store.today()); App.checkBadges(); } }
        else msg.textContent = 'Not ' + a + '. Count how many different brightnesses you can see and whether they form one clean block or a patchwork.';
      };
    });
    newOwl();
  }

  /* ---- Pellet lab ---- */
  var BONES = [
    { id: 'skull', name: 'Skull', shape: '<path d="M4 20 C 4 6, 40 4, 44 18 C 46 26, 36 32, 24 32 C 12 32, 4 28, 4 20 Z M12 24 L 20 24 M28 24 L 36 24" fill="#f3ead8" stroke="#6b5436" stroke-width="2"/><circle cx="14" cy="16" r="4" fill="#6b5436"/>' },
    { id: 'jaw', name: 'Lower jaw', shape: '<path d="M4 24 C 10 10, 30 8, 44 14 L 44 20 C 30 18, 14 22, 10 30 Z" fill="#f3ead8" stroke="#6b5436" stroke-width="2"/><path d="M30 12 L 30 8 M34 12 L 34 8 M38 13 L 38 9" stroke="#b8402f" stroke-width="2"/>' },
    { id: 'femur', name: 'Femur', shape: '<path d="M8 8 C 2 8, 2 16, 8 16 L 16 18 L 34 30 C 36 36, 46 34, 44 28 L 38 22 L 18 10 Z" fill="#f3ead8" stroke="#6b5436" stroke-width="2"/>' },
    { id: 'pelvis', name: 'Pelvis', shape: '<path d="M6 10 C 14 4, 22 10, 20 18 C 26 22, 32 22, 40 16 L 44 22 C 34 32, 20 32, 14 24 C 6 26, 2 18, 6 10 Z" fill="#f3ead8" stroke="#6b5436" stroke-width="2"/><circle cx="24" cy="22" r="3" fill="#8a7352"/>' },
    { id: 'scapula', name: 'Scapula', shape: '<path d="M4 30 L 30 6 C 40 2, 46 10, 42 16 L 14 32 Z" fill="#f3ead8" stroke="#6b5436" stroke-width="2"/>' },
    { id: 'vertebra', name: 'Vertebra', shape: '<path d="M14 10 L 34 10 L 38 20 L 30 24 L 30 32 L 18 32 L 18 24 L 10 20 Z" fill="#f3ead8" stroke="#6b5436" stroke-width="2"/><circle cx="24" cy="18" r="4" fill="#8a7352"/>' },
    { id: 'rib', name: 'Rib', shape: '<path d="M8 6 C 30 6, 44 18, 40 34" fill="none" stroke="#6b5436" stroke-width="5" stroke-linecap="round"/><path d="M8 6 C 30 6, 44 18, 40 34" fill="none" stroke="#f3ead8" stroke-width="2.5" stroke-linecap="round"/>' }
  ];
  function pellet(b) {
    var prey = ['vole', 'mouse', 'shrew'][Math.floor(Math.random() * 3)];
    var items = []; BONES.forEach(function (bn) { var n = bn.id === 'rib' ? 3 : bn.id === 'vertebra' ? 3 : 1; for (var i = 0; i < n; i++) items.push(bn); });
    items.sort(function () { return Math.random() - .5; });
    b.innerHTML = '<p class="lede">A pellet soaked and teased apart with forceps. Drag every bone to its tray. Then read the skull to name the prey.</p>' +
      '<div class="card"><h4 style="margin:0 0 6px">The pellet</h4><div class="dragzone" id="pile" style="background:#d8c9a8;min-height:120px">' + items.map(function (bn, i) { return '<div class="dragitem" data-key="' + bn.id + '" style="width:56px;height:56px;padding:4px;background:#e9dfc6"><svg viewBox="0 0 48 40" width="48" height="40">' + bn.shape + '</svg></div>'; }).join('') + '</div></div>' +
      '<div class="grid tight" style="margin-top:12px">' + BONES.map(function (bn) { return '<div class="card pad0"><div class="dragzone" data-key="' + bn.id + '" style="border:0;min-height:90px"><h4>' + esc(bn.name) + '</h4></div></div>'; }).join('') + '</div>' +
      '<div class="card" id="skullRead" style="margin-top:12px" hidden><h3 style="margin-top:0">Read the skull</h3><p class="small" id="skullDesc"></p><div class="choices"><button class="choice" data-p="vole">Vole (<span class="sci">Microtus</span>)</button><button class="choice" data-p="mouse">Deer mouse (<span class="sci">Peromyscus</span>)</button><button class="choice" data-p="shrew">Shrew (<span class="sci">Blarina / Sorex</span>)</button></div><p id="preyMsg" class="small" style="margin-top:8px"></p></div>' +
      '<p class="row" style="margin-top:12px"><button class="btn" id="newPellet">New pellet</button></p>';
    document.getElementById('newPellet').onclick = function () { pellet(b); };
    var DESC = { vole: 'Cheek teeth with flat tops made of zig-zag enamel prisms, no roots, and a short heavy snout. Upper incisors yellow-orange, no groove.', mouse: 'Cheek teeth with rounded cusps in rows, rooted; a longer, finer snout and large eye sockets.', shrew: 'Tiny skull, no cheekbones (zygomatic arches missing), and teeth tipped dark red with iron.' };
    var EXPL = { vole: 'Prism-shaped rootless molars are the vole signature: a grass-eater’s teeth that grow all life. Voles are the saw-whet’s and short-eared owl’s staple in fields.', mouse: 'Cusped, rooted molars mean a seed-eater: a deer mouse, the forest saw-whet’s main prey.', shrew: 'Red-tipped teeth and no cheekbones: a shrew. Barn owls and screech-owls take many; saw-whets occasionally.' };
    var zones = b.querySelectorAll('.dragzone[data-key]'); var placed = 0;
    b.querySelectorAll('.dragitem').forEach(function (it) {
      var ox, oy, dragging = false, ghost = null;
      it.addEventListener('pointerdown', function (e) { e.preventDefault(); it.setPointerCapture(e.pointerId); dragging = true; var r = it.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top; ghost = it.cloneNode(true); ghost.classList.add('dragging'); ghost.style.width = '56px'; ghost.style.left = (e.clientX - ox) + 'px'; ghost.style.top = (e.clientY - oy) + 'px'; document.body.appendChild(ghost); it.style.opacity = .3; });
      it.addEventListener('pointermove', function (e) { if (!dragging) return; ghost.style.left = (e.clientX - ox) + 'px'; ghost.style.top = (e.clientY - oy) + 'px'; zones.forEach(function (z) { var zr = z.getBoundingClientRect(); z.classList.toggle('over', e.clientX > zr.left && e.clientX < zr.right && e.clientY > zr.top && e.clientY < zr.bottom); }); });
      function up(e) {
        if (!dragging) return; dragging = false; ghost.remove(); it.style.opacity = 1; var target = null;
        zones.forEach(function (z) { z.classList.remove('over'); var zr = z.getBoundingClientRect(); if (e.clientX > zr.left && e.clientX < zr.right && e.clientY > zr.top && e.clientY < zr.bottom) target = z; });
        if (!target) return;
        if (target.getAttribute('data-key') === it.getAttribute('data-key')) { target.appendChild(it); it.onpointerdown = null; placed++; if (placed === items.length) { var sr = document.getElementById('skullRead'); sr.hidden = false; document.getElementById('skullDesc').textContent = DESC[prey]; sr.scrollIntoView({ behavior: 'smooth' }); } }
        else App.toast('Not that tray. Look at the shape again: a jaw has teeth on one edge; a femur has a ball at one end; a scapula is a flat blade.');
      }
      it.addEventListener('pointerup', up); it.addEventListener('pointercancel', up);
    });
    b.querySelectorAll('#skullRead .choice').forEach(function (c) {
      c.onclick = function () {
        var p = c.getAttribute('data-p'); var m = document.getElementById('preyMsg');
        if (p === prey) { c.classList.add('right'); m.innerHTML = '<b>Correct.</b> ' + esc(EXPL[prey]); if (!Store.get('owls.pellet')) { Store.set('owls.pellet', Store.today()); App.checkBadges(); } }
        else { c.classList.add('wrong'); m.textContent = 'Not that one. Reread the description of the teeth.'; }
      };
    });
  }
  function places(b) {
    var ids = ['braddock', 'ricecreek', 'owlnet', 'derby', 'ybe', 'hawkmtn'];
    b.innerHTML = '<div class="grid">' + ids.map(function (id) { var p = PLACES.filter(function (x) { return x.id === id; })[0]; if (!p) return ''; return '<div class="card"><h3 style="margin-top:0">' + esc(p.name) + '</h3><p class="small muted">' + esc(p.where) + '</p><p class="small">' + esc(p.what) + '</p><p class="small"><b>When:</b> ' + esc(p.when) + '<br><b>Who:</b> ' + esc(p.age) + '</p><div class="row"><a class="btn sm" href="' + esc(p.url) + '" target="_blank" rel="noopener">Website ↗</a><a class="btn sm" href="#/explore/place/' + p.id + '">On the map</a></div></div>'; }).join('') + '</div>' +
      '<h2>How to get into a banding station</h2><div class="card"><ol><li>Go to a public owl-banding night at Braddock Bay this fall (register early; they cap at about 30).</li><li>Ask the banders how they take volunteers. Most stations want people who will come back weekly through the season and can stay up late and be quiet.</li><li>At Oswego, find the faculty who band (ask about the cardinal study) and ask to help with net checks. Learn extraction on chickadees before owls.</li><li>Log every bird you handle. The Bird Banding Lab wants documented experience when you apply as a sub-permittee.</li><li>Join Project Owlnet’s mailing list; stations post for seasonal help.</li></ol></div>';
  }
  App.register({ id: 'owls', title: 'Owls & Banding', icon: '🦉', blurb: 'New York’s eleven owls with their recorded calls, live sightings, how a banding station works, a UV feather-aging lab, a pellet tray, and where to do it for real.', render: render, unmount: function () { if (lmap) { try { lmap.remove(); } catch (e) {} lmap = null; } } });
})();
