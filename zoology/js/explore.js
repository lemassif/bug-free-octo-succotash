/* ============================================================
   explore.js — Explore & Travel
   A map of colleges, field stations, internships, week-long
   programs, owl and monarch sites, museums and safaris, each with
   who it is for and when to act. Katie saves places to a plan with
   a status, and a year planner shows which months matter.
   ============================================================ */
(function () {
  var esc = Media.esc;
  var map = null, markers = {};
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH_RE = { Jan: /januar/i, Feb: /februar/i, Mar: /march/i, Apr: /april/i, May: /\bmay\b/i, Jun: /june/i, Jul: /july/i, Aug: /august/i, Sep: /septem/i, Oct: /octob/i, Nov: /novem/i, Dec: /decem/i };
  function monthsOf(p) { var t = p.when + ' ' + p.what; return MONTHS.filter(function (m) { return MONTH_RE[m].test(t) || (/summer/i.test(p.when) && (m === 'Jun' || m === 'Jul' || m === 'Aug')) || (/winter/i.test(p.when) && (m === 'Jan' || m === 'Feb')) || (/fall/i.test(p.when) && (m === 'Sep' || m === 'Oct' || m === 'Nov')) || (/spring/i.test(p.when) && (m === 'Mar' || m === 'Apr')); }); }
  function dist(p) { var R = 6371, dLat = (p.lat - 43.455) * Math.PI / 180, dLng = (p.lng + 76.54) * Math.PI / 180; var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(43.455 * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2); return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.621); }
  var STATUS = ['Dreaming', 'Researching', 'Applying', 'Booked', 'Done'];

  function placeCard(p, full) {
    var plan = Store.get('plan.' + p.id, null); var k = PLACE_KINDS[p.kind];
    return '<div class="card" id="pc-' + p.id + '"><div class="row between"><span class="tag" style="border-color:' + k.color + ';color:' + k.color + '">' + k.icon + ' ' + esc(k.label) + '</span>' + (p.star ? '<span class="tag star">★ strong fit for Katie now</span>' : '') + '</div><h3 style="margin:8px 0 2px">' + esc(p.name) + '</h3><p class="small muted" style="margin:0 0 8px">' + esc(p.where) + ' · ' + dist(p) + ' mi from Oswego</p>' +
      (full ? '<p class="small">' + esc(p.what) + '</p>' : '<p class="small">' + esc(p.what).slice(0, 160) + '…</p>') +
      '<p class="small"><b>Who:</b> ' + esc(p.age) + '<br><b>When:</b> ' + esc(p.when) + '</p>' +
      '<div class="row"><a class="btn sm" href="' + esc(p.url) + '" target="_blank" rel="noopener">Website ↗</a>' + (p.more || []).map(function (m) { return '<a class="btn sm ghost" href="' + esc(m[1]) + '" target="_blank" rel="noopener">' + esc(m[0]) + ' ↗</a>'; }).join('') + (full ? '' : '<a class="btn sm ghost" href="#/explore/place/' + p.id + '">Details</a>') + '</div>' +
      '<div class="row" style="margin-top:10px"><label style="margin:0">In my plan:</label><select class="planSel" data-id="' + p.id + '" style="width:auto"><option value="">— not yet —</option>' + STATUS.map(function (s) { return '<option ' + (plan && plan.status === s ? 'selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>' +
      (full ? '<div class="field" style="margin-top:8px"><label>My notes (deadline I found, who I emailed, cost)</label><textarea class="planNote" data-id="' + p.id + '">' + esc(plan ? plan.note || '' : '') + '</textarea></div>' : '') +
      '<p class="small muted" style="margin:8px 0 0">Dates, fees and eligibility change every year. Confirm on the organisation’s own page before you plan around it.</p></div>';
  }
  function wirePlan(root) {
    root.querySelectorAll('.planSel').forEach(function (s) { s.onchange = function () { var id = s.getAttribute('data-id'); var cur = Store.get('plan.' + id, {}) || {}; if (!s.value) { delete Store.data.plan[id]; Store.save(); } else { Store.set('plan.' + id, Object.assign(cur, { status: s.value })); } App.checkBadges(); App.toast(s.value ? 'Saved to your plan: ' + s.value : 'Removed from your plan'); }; });
    root.querySelectorAll('.planNote').forEach(function (t) { t.onchange = function () { var id = t.getAttribute('data-id'); var cur = Store.get('plan.' + id, { status: 'Researching' }) || { status: 'Researching' }; Store.set('plan.' + id, Object.assign(cur, { note: t.value })); App.toast('Note saved'); }; });
  }

  function render(el, args) {
    var tab = args[0] || 'map';
    if (tab === 'place' && args[1]) { var p = PLACES.filter(function (x) { return x.id === args[1]; })[0]; if (p) { el.innerHTML = '<p><a href="#/explore">← Map</a></p>' + placeCard(p, true) + '<div class="card" style="margin-top:12px"><div class="map" id="pmap" style="height:260px"></div></div><h2>Seen here lately <span class="tag ok">live</span></h2><p class="small muted">The most recent research-grade wildlife records within 15 km, from iNaturalist.</p><div class="grid tight" id="pseen"><p class="muted small">Loading…</p></div>'; wirePlan(el); Media.nearby({ lat: p.lat, lng: p.lng, radius: 15, n: 12 }).then(function (obs) { var bx = document.getElementById('pseen'); if (!bx) return; bx.innerHTML = obs.length ? obs.map(function (o) { return '<a class="card spec" href="' + esc(o.link) + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="photo sq"><img class="loaded" src="' + esc(o.url) + '" alt="" loading="lazy"><span class="credit">' + esc((o.attr || '').replace(/^\(c\)\s*/, '© ')) + '</span></div><div class="nm">' + esc(o.common || o.sci) + '</div><div class="sc">' + esc(o.sci) + '</div><div class="small muted">' + esc(o.date) + '</div></a>'; }).join('') : '<p class="muted small">Nothing came back (offline, or no recent records here).</p>'; }); window.loadLeaflet().then(function (L) { var m = L.map('pmap', { scrollWheelZoom: false }).setView([p.lat, p.lng], 9); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(m); L.marker([p.lat, p.lng]).addTo(m).bindPopup(esc(p.name)).openPopup(); map = m; }).catch(function () {}); return; } }
    var kinds = Object.keys(PLACE_KINDS); var active = (tab !== 'map' && tab !== 'plan' && tab !== 'year' && PLACE_KINDS[tab]) ? [tab] : kinds.slice();
    el.innerHTML = '<section class="hero sky"><h1>Explore &amp; Travel</h1><p class="lede">Every door between a senior year in New York and a life with animals: colleges to visit, a field station with five miles of trails, paid museum internships, week-long courses on islands and mountains, owl nets an hour away, monarch mountains in Mexico, and the Kenya Roosevelt walked. Save what you want to a plan; the year planner shows when to act.</p></section>' +
      '<div class="chips" style="margin-bottom:10px"><a class="chip ' + (tab === 'map' ? 'on' : '') + '" href="#/explore/map" style="text-decoration:none">🗺️ Everything</a>' + kinds.map(function (k) { return '<a class="chip ' + (tab === k ? 'on' : '') + '" href="#/explore/' + k + '" style="text-decoration:none">' + PLACE_KINDS[k].icon + ' ' + esc(PLACE_KINDS[k].label) + '</a>'; }).join('') + '<a class="chip ' + (tab === 'plan' ? 'on' : '') + '" href="#/explore/plan" style="text-decoration:none">📋 My plan</a><a class="chip ' + (tab === 'year' ? 'on' : '') + '" href="#/explore/year" style="text-decoration:none">📅 Year planner</a></div>' +
      '<div id="ebody"></div>';
    var b = document.getElementById('ebody');
    if (tab === 'plan') return planTab(b);
    if (tab === 'year') return yearTab(b);
    var list = PLACES.filter(function (p) { return active.indexOf(p.kind) >= 0; }).sort(function (a, c) { return (c.star ? 1 : 0) - (a.star ? 1 : 0) || dist(a) - dist(c); });
    b.innerHTML = '<div class="card pad0"><div class="map" id="emap"><p class="muted small" style="padding:12px">Loading map… (needs internet)</p></div></div><p class="small muted" style="margin:8px 0">' + list.length + ' places, nearest first. ★ marks the ones that fit an 18-year-old senior right now.</p><div class="grid" id="elist">' + list.map(function (p) { return placeCard(p, false); }).join('') + '</div>';
    wirePlan(b);
    window.loadLeaflet().then(function (L) {
      var box = document.getElementById('emap'); if (!box) return; box.innerHTML = '';
      map = L.map(box, { scrollWheelZoom: false, worldCopyJump: true }).setView([30, -40], 2);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
      var bounds = [];
      list.forEach(function (p) {
        var k = PLACE_KINDS[p.kind];
        var m = L.circleMarker([p.lat, p.lng], { radius: p.star ? 10 : 7, color: '#1f2a22', weight: 1, fillColor: k.color, fillOpacity: .95 }).addTo(map);
        m.bindPopup('<b>' + esc(p.name) + '</b><br><span style="font-size:12px">' + esc(p.where) + '</span><br><a href="#/explore/place/' + p.id + '">Details →</a>');
        m.on('click', function () { var c = document.getElementById('pc-' + p.id); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.style.outline = '3px solid ' + k.color; setTimeout(function () { c.style.outline = ''; }, 1600); } });
        markers[p.id] = m; bounds.push([p.lat, p.lng]);
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 7 });
    }).catch(function () { var box = document.getElementById('emap'); if (box) box.style.height = 'auto'; box.innerHTML = '<p class="muted small" style="padding:12px">The map needs an internet connection; the list below works offline.</p>'; });
  }
  function planTab(b) {
    var plan = Store.data.plan || {}; var ids = Object.keys(plan);
    if (!ids.length) { b.innerHTML = '<div class="card"><h3>Nothing saved yet</h3><p>Open any place and choose a status under “In my plan”. Suggested first three for this year: the Smithsonian NHRE internship (deadline mid-January), an SCA summer crew (free, ages 15–19 including graduating seniors), and a Braddock Bay owl-banding night (this fall).</p><a class="btn primary" href="#/explore/map">Open the map</a></div>'; return; }
    b.innerHTML = STATUS.map(function (s) {
      var rows = ids.filter(function (id) { return plan[id].status === s; }).map(function (id) { return PLACES.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
      if (!rows.length) return '';
      return '<h2>' + s + '</h2><div class="grid">' + rows.map(function (p) { return placeCard(p, true); }).join('') + '</div>';
    }).join('') + '<p class="small muted" style="margin-top:16px">Your plan is part of the backup file (⚙︎).</p>';
    wirePlan(b);
  }
  function yearTab(b) {
    b.innerHTML = '<p class="lede">Which months matter for which doors. Deadlines are from the most recent cycle; confirm each one.</p><div class="card pad0" style="overflow:auto"><table><tr><th>Place</th>' + MONTHS.map(function (m) { return '<th style="text-align:center">' + m + '</th>'; }).join('') + '</tr>' +
      PLACES.filter(function (p) { return p.kind !== 'college' && p.kind !== 'museum'; }).map(function (p) { var ms = monthsOf(p); var inPlan = Store.get('plan.' + p.id, null); return '<tr><td><a href="#/explore/place/' + p.id + '">' + esc(p.name) + '</a>' + (inPlan ? ' <span class="tag ok">' + esc(inPlan.status) + '</span>' : '') + '<br><span class="small muted">' + esc(p.when) + '</span></td>' + MONTHS.map(function (m) { return '<td style="text-align:center">' + (ms.indexOf(m) >= 0 ? '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + PLACE_KINDS[p.kind].color + '"></span>' : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>' +
      '<h2>This school year, in order</h2><div class="timeline">' + [['Now (fall)', 'Braddock Bay owl-banding night (register). Monarch tagging if any are still flying. College visits: Oswego, ESF, Cornell, Cobleskill; ask the questions in the Colleges section.'], ['December–January', 'Smithsonian NHRE application (deadline has been mid-January; info session early January). College applications.'], ['February', 'Seneca Park Zoo pre-vet internship deadline (end of February) for later years; WCS Youth JIVE expo; Cornell Young Birders applications open (check eligibility).'], ['March', 'SCA National Crew applications; Rosamond Gifford Zoo summer internship packets (March 1); Derby Hill hawk flight begins; spring owl banding at Braddock Bay.'], ['April–May', 'Hawk Mountain and Shoals summer course registration; Rice Creek summer field session sign-up; Monarch Watch tag pre-orders open.'], ['June–August', 'SCA crew, Hawk Mountain Appalachian Ecology, Shoals or Hog Island week, Earthwatch Kenya (18+). Rear a few monarchs from the garden.'], ['September', 'Tag monarchs at Derby Hill and the lakeshore; Point Pelee or Cape May if the car is free. Start college: find the banders.'], ['October–November', 'Saw-whet season. Volunteer net checks. Classify the owl drawer.'], ['January (next)', 'The monarch colonies in Michoacán, if a family trip is in the cards.']].map(function (t) { return '<div class="tl"><div class="yr">' + esc(t[0]) + '</div><div class="small">' + esc(t[1]) + '</div></div>'; }).join('') + '</div>';
  }
  App.register({ id: 'explore', title: 'Explore & Travel', icon: '🗺️', blurb: 'A map of colleges, field stations, internships, week-long programs, owl and monarch sites, and safaris, with a plan and a year planner.',
    render: render, unmount: function () { if (map) { try { map.remove(); } catch (e) {} map = null; } markers = {}; } });
})();
