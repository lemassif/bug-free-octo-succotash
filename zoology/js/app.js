/* ============================================================
   app.js — shell: sections, hash routing, home dashboard, settings.
   Each section registers itself with App.register(). Views are
   plain functions that render HTML into the main element.
   ============================================================ */
window.App = (function () {
  var sections = [];
  var current = null;
  var view = document.getElementById('view');
  var esc = function (s) { return window.Media ? Media.esc(s) : String(s); };

  function register(sec) { sections.push(sec); }
  function nav() {
    var el = document.getElementById('nav');
    el.innerHTML = sections.map(function (s) {
      return '<a href="#/' + s.id + '" data-id="' + s.id + '">' + s.icon + ' ' + esc(s.title) + '</a>';
    }).join('');
  }
  function route() {
    var h = location.hash.replace(/^#\/?/, '') || 'home';
    var parts = h.split('/');
    var sec = sections.filter(function (s) { return s.id === parts[0]; })[0] || sections[0];
    if (current && current.unmount) { try { current.unmount(); } catch (e) {} }
    current = sec;
    document.querySelectorAll('#nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-id') === sec.id); });
    var active = document.querySelector('#nav a.active'); if (active && active.scrollIntoView) active.scrollIntoView({ inline: 'center', block: 'nearest' });
    view.innerHTML = '';
    window.scrollTo(0, 0);
    try { sec.render(view, parts.slice(1)); } catch (e) { view.innerHTML = '<div class="card"><h3>Something went wrong in this section</h3><p class="muted">' + esc(e.message) + '</p></div>'; console.error(e); }
    Media.hydrate(view);
    Store.touch(); Store.save();
    document.title = (sec.id === 'home' ? "Katie's Field Station" : sec.title + " — Katie's Field Station");
  }
  function go(hash) { location.hash = hash; }
  function toast(msg, ms) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, ms || 2200);
  }
  function modal(html) {
    var m = document.getElementById('modal'); document.getElementById('modalBody').innerHTML = html; m.hidden = false; Media.hydrate(m);
    document.body.style.overflow = 'hidden';
  }
  function closeModal() { document.getElementById('modal').hidden = true; document.getElementById('modalBody').innerHTML = ''; document.body.style.overflow = ''; }
  document.getElementById('modalX').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ------------------------------------------------------------
     Species detail: real photos, summary, where it sits on the tree.
     Used by several sections. */
  function speciesModal(sp) {
    var st = Store.get('species.' + sp.id, {});
    modal('<h2 style="margin-top:0">' + esc(sp.common) + '</h2><p class="sci muted" style="margin-top:-6px">' + esc(sp.sci) + '</p>' +
      '<div class="ranks" style="margin-bottom:10px">' + ['kingdom', 'phylum', 'cls', 'order', 'family', 'genus'].map(function (r) { return '<span class="rank"><b>' + (r === 'cls' ? 'class' : r) + '</b>' + esc(sp[r]) + '</span>'; }).join('') + '</div>' +
      '<p>' + esc(sp.note) + '</p>' +
      (st.done ? '<p class="tag ok">Pinned in your cabinet on ' + esc(st.date) + '</p>' : '<p><a class="btn primary sm" href="#/taxonomy/project/' + sp.id + '" onclick="App.closeModal()">Classify this specimen</a></p>') +
      '<div id="galleryBox"><p class="muted small">Loading photographs from iNaturalist…</p></div>' +
      '<div id="wikiBox"></div>');
    Media.gallery(sp.sci).then(function (g) {
      var box = document.getElementById('galleryBox'); if (!box) return;
      if (!g.photos.length) { box.innerHTML = '<p class="muted small">No photographs could be loaded (offline?). Try again when connected.</p>'; return; }
      box.innerHTML = '<div class="gallery">' + g.photos.map(function (p, i) {
        return '<div class="photo" data-i="' + i + '"><img src="' + esc(p.url) + '" alt="' + esc(sp.common) + '" class="loaded" loading="lazy"><span class="credit">' + esc((p.attr || '').replace(/^\(c\)\s*/, '© ')) + '</span></div>';
      }).join('') + '</div><p class="small muted">Photographs by iNaturalist contributors, credited on each image. ' + (g.wiki ? '<a href="' + esc(g.wiki) + '" target="_blank" rel="noopener">Wikipedia ↗</a> · ' : '') + '<a href="https://www.inaturalist.org/taxa/search?q=' + encodeURIComponent(sp.sci) + '" target="_blank" rel="noopener">iNaturalist ↗</a></p>';
      box.querySelectorAll('.photo').forEach(function (el) {
        el.addEventListener('click', function () {
          var p = g.photos[+el.getAttribute('data-i')];
          var big = document.createElement('div'); big.className = 'modal'; big.style.zIndex = 70; big.innerHTML = '<img src="' + esc(p.large || p.url) + '" alt="" style="max-width:96vw;max-height:92vh;border-radius:12px">';
          big.addEventListener('click', function () { big.remove(); }); document.body.appendChild(big);
        });
      });
      if (g.summary) document.getElementById('wikiBox').innerHTML = '<h3>About</h3><div class="small">' + g.summary + '</div>';
    });
  }

  /* ------------------------------------------------------------
     Badges */
  var BADGES = [
    { id: 'first', icon: '📌', name: 'First pin', test: function (d) { return d.cabinet.length >= 1; } },
    { id: 'ten', icon: '🗂️', name: '10 specimens', test: function (d) { return d.cabinet.length >= 10; } },
    { id: 'fifty', icon: '🏛️', name: '50 specimens', test: function (d) { return d.cabinet.length >= 50; } },
    { id: 'hundred', icon: '🎖️', name: 'Centurion', test: function (d) { return d.cabinet.length >= 100; } },
    { id: 'all', icon: '👑', name: 'Curator', test: function (d) { return d.cabinet.length >= SPECIES.length; } },
    { id: 'owls', icon: '🦉', name: 'Owl drawer', test: function (d) { return setDone(d, 'owls'); } },
    { id: 'insects', icon: '🪲', name: 'Insect drawer', test: function (d) { return setDone(d, 'insects'); } },
    { id: 'monarch', icon: '🦋', name: 'Monarch drawer', test: function (d) { return setDone(d, 'monarch'); } },
    { id: 'africa', icon: '🦁', name: 'Africa drawer', test: function (d) { return setDone(d, 'africa'); } },
    { id: 'streak7', icon: '🔥', name: '7-day streak', test: function () { return Store.streak() >= 7; } },
    { id: 'streak30', icon: '🌋', name: '30-day streak', test: function () { return Store.streak() >= 30; } },
    { id: 'pinned', icon: '📍', name: 'Pinned a beetle', test: function (d) { return !!(d.studio && d.studio.Coleoptera); } },
    { id: 'spread', icon: '🦋', name: 'Spread a butterfly', test: function (d) { return !!(d.studio && d.studio.Lepidoptera); } },
    { id: 'uv', icon: '🔦', name: 'Aged an owl', test: function (d) { return !!(d.owls && d.owls.uv); } },
    { id: 'pellet', icon: '🦴', name: 'Pellet lab', test: function (d) { return !!(d.owls && d.owls.pellet); } },
    { id: 'journal5', icon: '📓', name: '5 field notes', test: function (d) { return (d.journal || []).length >= 5; } },
    { id: 'plan', icon: '🗺️', name: 'Made a plan', test: function (d) { return Object.keys(d.plan || {}).length >= 3; } }
  ];
  function setDone(d, setId) {
    return SPECIES.filter(function (s) { return s.set === setId; }).every(function (s) { return d.species[s.id] && d.species[s.id].done; });
  }
  function checkBadges() {
    var d = Store.data;
    BADGES.forEach(function (b) { if (!d.badges[b.id] && b.test(d)) { Store.award(b.id); toast('Badge earned: ' + b.icon + ' ' + b.name, 3200); } });
  }

  /* ------------------------------------------------------------
     Home */
  function specimenOfDay() {
    var d = Store.today(); var n = 0; for (var i = 0; i < d.length; i++) n = (n * 31 + d.charCodeAt(i)) >>> 0;
    var todo = SPECIES.filter(function (s) { return !(Store.data.species[s.id] && Store.data.species[s.id].done); });
    var pool = todo.length ? todo : SPECIES;
    return pool[n % pool.length];
  }
  function renderHome(el) {
    var d = Store.data; var done = d.cabinet.length; var total = SPECIES.length; var pct = Math.round(100 * done / total);
    var sod = specimenOfDay();
    var name = esc(d.settings.name || 'Katie');
    el.innerHTML =
      '<section class="hero"><h1>Welcome back, ' + name + '.</h1>' +
      '<p class="lede">A field station in your pocket: the tree of life in 3D and across deep time, a long-term classification project, an insect display studio, the monarch’s whole world, Theodore Roosevelt and the Smithsonian, owls and bird banding, and a map of every door worth knocking on between here and a career with animals.</p>' +
      '<div class="row"><a class="btn monarch" href="#/taxonomy/project">Continue the project</a><a class="btn ghost" style="color:#fff;border-color:rgba(255,255,255,.5)" href="#/explore">Open the map</a></div></section>' +
      '<div class="grid">' +
      '<div class="card"><div class="row"><div class="ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div><h3 style="margin:0">Classification project</h3><p class="muted small" style="margin:0">' + done + ' of ' + total + ' specimens pinned across ' + SPECIES_SETS.length + ' expeditions. Seven ranks each; this is a project for a season, not an afternoon.</p></div></div>' +
      '<div class="row" style="margin-top:10px"><div class="stat"><b>' + Store.streak() + '</b><span>day streak</span></div><div class="stat"><b>' + Object.keys(d.badges).length + '</b><span>badges</span></div><div class="stat"><b>' + (d.journal || []).length + '</b><span>field notes</span></div><div class="stat"><b>' + Object.keys(d.plan || {}).length + '</b><span>places planned</span></div></div></div>' +
      '<div class="card spec" id="sodCard"><div style="position:relative">' + Media.photoHTML(sod.sci, { icon: '🔍', alt: sod.common }) + '</div><div><span class="tag star">Specimen of the day</span></div><div class="nm">' + esc(sod.common) + '</div><div class="sc">' + esc(sod.sci) + '</div><p class="small muted" style="margin:0">' + esc(sod.note) + '</p><a class="btn primary sm" href="#/taxonomy/project/' + sod.id + '">Classify it</a></div>' +
      '</div>' +
      '<h2>Sections</h2><div class="grid">' + sections.filter(function (s) { return s.id !== 'home'; }).map(function (s) {
        return '<a class="card" href="#/' + s.id + '" style="text-decoration:none;color:inherit"><div style="font-size:34px">' + s.icon + '</div><h3 style="margin:6px 0 4px">' + esc(s.title) + '</h3><p class="small muted" style="margin:0">' + esc(s.blurb) + '</p></a>';
      }).join('') + '</div>' +
      '<h2>Badges</h2><div class="row">' + BADGES.map(function (b) { return '<div class="badge ' + (d.badges[b.id] ? 'earned' : '') + '"><i>' + b.icon + '</i>' + esc(b.name) + '</div>'; }).join('') + '</div>' +
      '<h2>Seen near Rice Creek this week</h2><p class="muted small">Live research-grade observations from iNaturalist within 25 km of the field station. Tap one to open it.</p><div class="grid tight" id="nearby"><p class="muted small">Loading…</p></div>' +
      '<p class="small muted" style="margin-top:28px">Built for Katie. Works in any browser; add it to your Home Screen for an app icon. Your progress stays in this browser; use ⚙︎ to back it up or move it to another device.</p>';
    Media.nearby({ lat: 43.4311, lng: -76.5565, radius: 25, n: 12 }).then(function (obs) {
      var box = document.getElementById('nearby'); if (!box) return;
      if (!obs.length) { box.innerHTML = '<p class="muted small">Nothing loaded. iNaturalist needs an internet connection.</p>'; return; }
      box.innerHTML = obs.map(function (o) {
        return '<a class="card spec" href="' + esc(o.link) + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="photo sq"><img class="loaded" src="' + esc(o.url) + '" alt="" loading="lazy"><span class="credit">' + esc((o.attr || '').replace(/^\(c\)\s*/, '© ')) + '</span></div><div class="nm">' + esc(o.common || o.sci) + '</div><div class="sc">' + esc(o.sci) + '</div><div class="small muted">' + esc(o.date) + ' · ' + esc(o.place) + '</div></a>';
      }).join('');
    });
  }

  /* ------------------------------------------------------------
     Settings / backup */
  function settings() {
    var s = Store.data.settings;
    modal('<h2 style="margin-top:0">Settings &amp; backup</h2>' +
      '<div class="field"><label>Your name (for the greeting)</label><input id="setName" value="' + esc(s.name) + '"></div>' +
      '<div class="field"><label>Collector name for specimen labels (as it would appear on a museum label, e.g. “K. Smith”)</label><input id="setColl" value="' + esc(s.collector) + '"></div>' +
      '<div class="field"><label>Theme</label><select id="setTheme"><option value="auto">Match device</option><option value="light">Light</option><option value="dark">Dark</option></select></div>' +
      '<div class="row"><button class="btn primary" id="setSave">Save</button></div><hr>' +
      '<h3>Back up or move your progress</h3><p class="small muted">Everything (pinned specimens, field notes, plans, college notes) lives in this browser only. Export a file to keep it safe or to carry it to another phone or laptop, then import it there.</p>' +
      '<div class="row"><button class="btn" id="expBtn">⬇︎ Export backup file</button><label class="btn" style="margin:0">⬆︎ Import backup <input type="file" id="impFile" accept="application/json" style="display:none"></label></div>' +
      '<hr><details><summary>Danger zone</summary><p class="small">Clear cached photographs (they reload when needed) or erase all progress.</p><div class="row"><button class="btn sm" id="clrMedia">Clear photo cache</button><button class="btn sm" id="resetAll" style="color:var(--bad)">Erase all progress</button></div></details>');
    document.getElementById('setTheme').value = s.theme || 'auto';
    document.getElementById('setSave').onclick = function () {
      Store.set('settings.name', document.getElementById('setName').value.trim() || 'Katie');
      Store.set('settings.collector', document.getElementById('setColl').value.trim() || 'K. Collector');
      Store.set('settings.theme', document.getElementById('setTheme').value); applyTheme(); closeModal(); route(); toast('Saved');
    };
    document.getElementById('expBtn').onclick = function () {
      var blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'field-station-backup-' + Store.today() + '.json'; document.body.appendChild(a); a.click(); a.remove();
    };
    document.getElementById('impFile').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () { try { Store.importJSON(r.result); closeModal(); route(); toast('Backup imported'); } catch (err) { toast('That file is not a Field Station backup'); } };
      r.readAsText(f);
    };
    document.getElementById('clrMedia').onclick = function () { Media.clearCache(); toast('Photo cache cleared'); };
    document.getElementById('resetAll').onclick = function () { if (confirm('Erase every pinned specimen, note and plan on this device? Export a backup first if you want to keep them.')) { Store.reset(); closeModal(); route(); } };
  }
  function applyTheme() {
    var t = Store.data.settings.theme || 'auto';
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  }
  document.getElementById('settingsBtn').addEventListener('click', settings);

  register({ id: 'home', title: 'Home', icon: '🏡', blurb: 'Dashboard', render: renderHome });

  window.addEventListener('hashchange', route);
  window.addEventListener('load', function () { applyTheme(); nav(); route(); });

  return { register: register, go: go, toast: toast, modal: modal, closeModal: closeModal, speciesModal: speciesModal, checkBadges: checkBadges, BADGES: BADGES, route: route, esc: esc };
})();
