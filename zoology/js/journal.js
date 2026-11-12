/* ============================================================
   journal.js — Field Journal
   Dated field notes with location, weather, species, free text,
   a finger sketch, and tallies that matter later: a life list and
   a log of hours with animals (vet schools ask). Stored locally;
   exportable as text.
   ============================================================ */
(function () {
  var esc = Media.esc;
  function render(el, args) {
    if (args[0] === 'new' || (args[0] === 'edit' && args[1])) return form(el, args[1]);
    var J = (Store.data.journal || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var life = {}; var hours = 0; J.forEach(function (e) { (e.species || '').split(/[,;\n]+/).forEach(function (s) { s = s.trim(); if (s) life[s.toLowerCase()] = s; }); hours += +e.hours || 0; });
    el.innerHTML = '<section class="hero"><h1>Field Journal</h1><p class="lede">Roosevelt kept one from age nine. Date, place, weather, what you saw and what it was doing. A sketch beats a photo for learning; a photo beats nothing. The tallies at the bottom are the ones a vet school or a graduate advisor will ask for.</p><a class="btn monarch" href="#/journal/new">＋ New entry</a></section>' +
      '<div class="row"><div class="card stat"><b>' + J.length + '</b><span>entries</span></div><div class="card stat"><b>' + Object.keys(life).length + '</b><span>species on your life list</span></div><div class="card stat"><b>' + hours + '</b><span>logged hours with animals</span></div><button class="btn sm" id="expTxt">⬇︎ Export as text</button></div>' +
      (J.length ? '<div class="grid" style="margin-top:14px">' + J.map(function (e, i) { return '<div class="card"><div class="row between"><b>' + esc(e.date) + '</b><span class="small muted">' + esc(e.weather || '') + '</span></div><div class="small muted">' + esc(e.place || '') + (e.lat ? ' · ' + (+e.lat).toFixed(3) + ', ' + (+e.lng).toFixed(3) : '') + '</div>' + (e.sketch ? '<img src="' + e.sketch + '" alt="sketch" style="width:100%;border-radius:10px;margin:8px 0;border:1px solid var(--line)">' : '') + (e.species ? '<p class="small"><b>Seen:</b> ' + esc(e.species) + '</p>' : '') + '<p class="small" style="white-space:pre-wrap">' + esc(e.text || '') + '</p>' + (e.hours ? '<span class="tag">' + esc(e.hours) + ' h with animals' + (e.kind ? ' · ' + esc(e.kind) : '') + '</span>' : '') + '<div class="row" style="margin-top:8px"><a class="btn sm" href="#/journal/edit/' + e.id + '">Edit</a></div></div>'; }).join('') + '</div>' : '<div class="card" style="margin-top:14px"><p>No entries yet. The first one can be today: what is outside the window?</p></div>') +
      '<h2>Life list</h2><div class="card small">' + (Object.keys(life).length ? Object.keys(life).sort().map(function (k) { return esc(life[k]); }).join(' · ') : 'Species you list in entries appear here.') + '</div>';
    document.getElementById('expTxt').onclick = function () {
      var txt = J.map(function (e) { return e.date + ' — ' + (e.place || '') + (e.weather ? ' (' + e.weather + ')' : '') + '\n' + (e.species ? 'Seen: ' + e.species + '\n' : '') + (e.text || '') + (e.hours ? '\nHours with animals: ' + e.hours + (e.kind ? ' (' + e.kind + ')' : '') : '') + '\n'; }).join('\n---\n\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })); a.download = 'field-journal-' + Store.today() + '.txt'; document.body.appendChild(a); a.click(); a.remove();
    };
  }
  function form(el, id) {
    var J = Store.data.journal || []; var e = id ? J.filter(function (x) { return x.id === id; })[0] : null;
    e = e || { id: 'j' + Date.now(), date: Store.today(), place: 'Rice Creek Field Station, Oswego, NY', weather: '', species: '', text: '', hours: '', kind: '', sketch: '' };
    el.innerHTML = '<p><a href="#/journal">← Journal</a></p><div class="grid"><div class="card">' +
      '<div class="field"><label>Date</label><input id="jd" type="date" value="' + esc(e.date) + '"></div><div class="field"><label>Place</label><input id="jp" value="' + esc(e.place) + '"><div class="row" style="margin-top:6px"><button class="btn sm" id="geo">📍 Use my location</button><span class="small muted" id="geoMsg">' + (e.lat ? (+e.lat).toFixed(4) + ', ' + (+e.lng).toFixed(4) : '') + '</span></div></div>' +
      '<div class="field"><label>Weather (temperature, wind, sky)</label><input id="jw" value="' + esc(e.weather) + '"></div><div class="field"><label>Species seen (comma-separated; these build your life list)</label><textarea id="js" style="min-height:60px">' + esc(e.species) + '</textarea></div>' +
      '<div class="field"><label>Notes: what it was doing, where exactly, how many, what you wondered</label><textarea id="jt">' + esc(e.text) + '</textarea></div>' +
      '<div class="row"><div class="field" style="flex:1"><label>Hours with animals today</label><input id="jh" type="number" min="0" step="0.5" value="' + esc(e.hours) + '"></div><div class="field" style="flex:2"><label>Kind (vet shadowing, banding, zoo volunteer, rearing…)</label><input id="jk" value="' + esc(e.kind) + '"></div></div>' +
      '</div><div class="card"><label>Sketch (finger or stylus)</label><canvas class="sketch" id="jc" width="640" height="480"></canvas><div class="row" style="margin-top:8px"><button class="btn sm" id="clr">Clear</button><span class="row" style="gap:4px">' + ['#1f2a22', '#6b5436', '#2f6b4f', '#e07a1f', '#b8402f', '#4a4a7a'].map(function (c) { return '<button class="btn sm" data-c="' + c + '" style="background:' + c + ';width:34px;min-height:34px;padding:0;border-color:transparent" aria-label="colour"></button>'; }).join('') + '</span></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn primary" id="save">Save entry</button>' + (id ? '<button class="btn" id="del" style="color:var(--bad)">Delete</button>' : '') + '</div></div></div>';
    var c = document.getElementById('jc'), ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#1f2a22';
    if (e.sketch) { var im = new Image(); im.onload = function () { ctx.drawImage(im, 0, 0, c.width, c.height); }; im.src = e.sketch; }
    var drawing = false, last = null;
    function pos(ev) { var r = c.getBoundingClientRect(); return { x: (ev.clientX - r.left) * c.width / r.width, y: (ev.clientY - r.top) * c.height / r.height }; }
    c.addEventListener('pointerdown', function (ev) { drawing = true; last = pos(ev); c.setPointerCapture(ev.pointerId); });
    c.addEventListener('pointermove', function (ev) { if (!drawing) return; var p = pos(ev); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
    c.addEventListener('pointerup', function () { drawing = false; }); c.addEventListener('pointercancel', function () { drawing = false; });
    document.getElementById('clr').onclick = function () { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); };
    el.querySelectorAll('[data-c]').forEach(function (b) { b.onclick = function () { ctx.strokeStyle = b.getAttribute('data-c'); }; });
    document.getElementById('geo').onclick = function () {
      if (!navigator.geolocation) { App.toast('No location on this device'); return; }
      navigator.geolocation.getCurrentPosition(function (p) { e.lat = p.coords.latitude; e.lng = p.coords.longitude; document.getElementById('geoMsg').textContent = e.lat.toFixed(4) + ', ' + e.lng.toFixed(4); }, function () { App.toast('Location not available'); });
    };
    document.getElementById('save').onclick = function () {
      e.date = document.getElementById('jd').value || Store.today(); e.place = document.getElementById('jp').value; e.weather = document.getElementById('jw').value; e.species = document.getElementById('js').value; e.text = document.getElementById('jt').value; e.hours = document.getElementById('jh').value; e.kind = document.getElementById('jk').value;
      var blank = document.createElement('canvas'); blank.width = c.width; blank.height = c.height; var bc = blank.getContext('2d'); bc.fillStyle = '#fff'; bc.fillRect(0, 0, c.width, c.height);
      e.sketch = c.toDataURL('image/png') === blank.toDataURL('image/png') ? '' : c.toDataURL('image/jpeg', 0.6);
      var idx = J.findIndex(function (x) { return x.id === e.id; }); if (idx >= 0) J[idx] = e; else J.push(e);
      Store.data.journal = J; Store.touch(); Store.save(); App.checkBadges(); location.hash = '#/journal';
    };
    var del = document.getElementById('del'); if (del) del.onclick = function () { if (confirm('Delete this entry?')) { Store.data.journal = J.filter(function (x) { return x.id !== e.id; }); Store.save(); location.hash = '#/journal'; } };
  }
  App.register({ id: 'journal', title: 'Field Journal', icon: '📓', blurb: 'Dated notes, sketches, a life list and a log of hours with animals.', render: render });
})();
