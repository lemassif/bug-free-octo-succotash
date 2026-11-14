/* ============================================================
   media.js — real photographs and videos, fetched live.

   Species photos come from iNaturalist's public API (each one a
   photograph by a named person, credited on the card) and, as a
   second source, Wikipedia's page summaries. Results are cached in
   the browser for a month so the app stays quick and the API stays
   polite. Videos are YouTube embeds that only load when tapped.

   Everything degrades: no network means a placeholder, never a
   broken page.
   ============================================================ */
window.Media = (function () {
  var CKEY = 'katie.media.v1';
  var TTL = 30 * 24 * 3600 * 1000;
  var cache = {};
  try { cache = JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch (e) { cache = {}; }
  var saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(CKEY, JSON.stringify(cache)); } catch (e) { cache = {}; }
    }, 400);
  }
  function fresh(entry) { return entry && entry.t && (Date.now() - entry.t) < TTL; }

  /* polite request queue: three at a time */
  var queue = [], active = 0, MAX = 3;
  function enqueue(fn) {
    return new Promise(function (resolve, reject) {
      queue.push({ fn: fn, resolve: resolve, reject: reject }); pump();
    });
  }
  function pump() {
    while (active < MAX && queue.length) {
      var job = queue.shift(); active++;
      job.fn().then(job.resolve, job.reject).then(function () { active--; pump(); });
    }
  }
  function getJSON(url, tries) {
    tries = tries == null ? 2 : tries;
    return enqueue(function () {
      return fetch(url, { headers: { 'Accept': 'application/json' } }).then(function (r) {
        if (!r.ok) { var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
        return r.json();
      });
    }).catch(function (e) {
      /* busy or rate-limited servers get a short pause and another try */
      if (tries > 0 && (e.status === 429 || e.status >= 500)) return new Promise(function (res) { setTimeout(res, 1500 * (3 - tries)); }).then(function () { return getJSON(url, tries - 1); });
      throw e;
    });
  }
  /* any JSON endpoint, cached in the browser for ttl ms, reduced by map() before storing */
  function cached(key, url, ttl, map) {
    var c = cache[key];
    if (c && c.t && (Date.now() - c.t) < (ttl || TTL)) return Promise.resolve(c.v);
    if (inflight[key]) return inflight[key];
    inflight[key] = getJSON(url).then(function (j) { var v = map ? map(j) : j; cache[key] = { t: Date.now(), v: v }; persist(); delete inflight[key]; return v; })
      .catch(function () { delete inflight[key]; return c ? c.v : null; });
    return inflight[key];
  }

  var inflight = {};
  /* ---- iNaturalist taxon by scientific name ---- */
  function taxon(sci) {
    var k = 'tx:' + sci;
    if (fresh(cache[k])) return Promise.resolve(cache[k].v);
    if (inflight[k]) return inflight[k];
    var url = 'https://api.inaturalist.org/v1/taxa?q=' + encodeURIComponent(sci) + '&per_page=5';
    inflight[k] = getJSON(url).then(function (j) {
      var rs = (j && j.results) || [];
      var hit = rs.filter(function (r) { return r.name && r.name.toLowerCase() === sci.toLowerCase(); })[0] || rs[0];
      var v = null;
      if (hit) {
        var p = hit.default_photo;
        v = {
          id: hit.id, name: hit.name, common: hit.preferred_common_name || '',
          rank: hit.rank, obs: hit.observations_count || 0,
          wiki: hit.wikipedia_url || '',
          photo: p ? { url: (p.medium_url || p.url || '').replace('/square.', '/medium.'), square: p.square_url || p.url, large: (p.medium_url || '').replace('/medium.', '/large.'), attr: p.attribution || '', lic: p.license_code || '' } : null,
          ancestors: (hit.ancestor_ids || [])
        };
      }
      cache[k] = { t: Date.now(), v: v }; persist(); delete inflight[k];
      return v;
    }).catch(function () { delete inflight[k]; return null; });
    return inflight[k];
  }
  /* ---- gallery: several photos for one taxon ---- */
  function gallery(sci) {
    return taxon(sci).then(function (t) {
      if (!t) return [];
      var k = 'gl:' + t.id;
      if (fresh(cache[k])) return cache[k].v;
      return getJSON('https://api.inaturalist.org/v1/taxa/' + t.id).then(function (j) {
        var r = (j.results || [])[0] || {};
        var ps = (r.taxon_photos || []).slice(0, 12).map(function (tp) {
          var p = tp.photo || {};
          return { url: (p.medium_url || p.url || '').replace('/square.', '/medium.'), large: (p.large_url || p.medium_url || '').replace('/medium.', '/large.'), attr: p.attribution || '', lic: p.license_code || '' };
        });
        var v = { photos: ps, summary: r.wikipedia_summary || '', wiki: r.wikipedia_url || '' };
        cache[k] = { t: Date.now(), v: v }; persist();
        return v;
      }).catch(function () { return { photos: t.photo ? [t.photo] : [], summary: '', wiki: t.wiki }; });
    });
  }
  /* ---- recent observations near a point ---- */
  function nearby(opts) {
    var q = 'https://api.inaturalist.org/v1/observations?photos=true&quality_grade=research&order=desc&order_by=observed_on&per_page=' + (opts.n || 12) +
      '&lat=' + opts.lat + '&lng=' + opts.lng + '&radius=' + (opts.radius || 25);
    if (opts.taxon_id) q += '&taxon_id=' + opts.taxon_id;
    if (opts.iconic) q += '&iconic_taxa=' + opts.iconic;
    if (opts.extra) q += opts.extra;
    var k = 'nb:' + q;
    if (fresh(cache[k]) && (Date.now() - cache[k].t) < 6 * 3600 * 1000) return Promise.resolve(cache[k].v);
    return getJSON(q).then(function (j) {
      var v = (j.results || []).map(function (o) {
        var p = (o.photos || [])[0] || {};
        return { id: o.id, sci: o.taxon ? o.taxon.name : '', common: o.taxon ? (o.taxon.preferred_common_name || '') : '', date: o.observed_on || '', place: o.place_guess || '', user: o.user ? (o.user.name || o.user.login) : '', url: (p.url || '').replace('/square.', '/medium.'), attr: p.attribution || '', link: 'https://www.inaturalist.org/observations/' + o.id };
      });
      cache[k] = { t: Date.now(), v: v }; persist(); return v;
    }).catch(function () { return []; });
  }
  /* ---- Wikipedia summary ---- */
  function wiki(title) {
    return cached('wk:' + title, 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.replace(/ /g, '_')), TTL, function (j) {
      return { title: j.title, extract: j.extract || '', url: (j.content_urls && j.content_urls.desktop) ? j.content_urls.desktop.page : 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title), thumb: j.thumbnail ? j.thumbnail.source : '', image: j.originalimage ? j.originalimage.source : '' };
    });
  }

  var DAY = 24 * 3600 * 1000;
  function strip(html) { var d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  /* ---- recorded calls and songs (iNaturalist sounds) ---- */
  function sounds(sci, n) {
    return cached('snd:' + sci, 'https://api.inaturalist.org/v1/observations?sounds=true&quality_grade=research&order_by=votes&per_page=' + (n || 6) + '&taxon_name=' + encodeURIComponent(sci), 14 * DAY, function (j) {
      var out = [];
      (j.results || []).forEach(function (o) { (o.sounds || []).slice(0, 1).forEach(function (sn) { if (sn.file_url) out.push({ url: sn.file_url, type: sn.file_content_type || '', attr: sn.attribution || '', place: o.place_guess || '', date: o.observed_on || '', link: 'https://www.inaturalist.org/observations/' + o.id }); }); });
      return out;
    }).then(function (v) { return v || []; });
  }
  /* ---- observations as map points (month = all years; d1 = since a date) ---- */
  function points(opts) {
    var q = 'https://api.inaturalist.org/v1/observations?quality_grade=research&geo=true&per_page=' + (opts.n || 200) + '&taxon_id=' + opts.taxon_id;
    if (opts.month) q += '&month=' + opts.month + '&order_by=random';
    if (opts.d1) q += '&d1=' + opts.d1 + '&order=desc&order_by=observed_on';
    if (opts.box) q += '&swlat=' + opts.box[0] + '&swlng=' + opts.box[1] + '&nelat=' + opts.box[2] + '&nelng=' + opts.box[3];
    if (opts.lat != null) q += '&lat=' + opts.lat + '&lng=' + opts.lng + '&radius=' + (opts.radius || 100);
    return cached('pts:' + q, q, opts.d1 ? 6 * 3600 * 1000 : 7 * DAY, function (j) {
      return { total: j.total_results || 0, pts: (j.results || []).map(function (o) { var ll = (o.location || '').split(','); return [+(+ll[0]).toFixed(3), +(+ll[1]).toFixed(3), o.observed_on || '', o.id]; }).filter(function (p) { return !isNaN(p[0]) && !isNaN(p[1]); }) };
    }).then(function (v) { return v || { total: 0, pts: [] }; });
  }
  /* ---- species search and current lineage (iNaturalist) ---- */
  function searchSpecies(q) {
    return getJSON('https://api.inaturalist.org/v1/taxa/autocomplete?rank=species&per_page=8&q=' + encodeURIComponent(q)).then(function (j) {
      return (j.results || []).map(function (r) { return { id: r.id, sci: r.name, common: r.preferred_common_name || r.name, group: r.iconic_taxon_name || '', thumb: r.default_photo ? r.default_photo.square_url : '' }; });
    }).catch(function () { return []; });
  }
  function lineage(idOrSci) {
    var byId = typeof idOrSci === 'number' ? Promise.resolve(idOrSci) : taxon(idOrSci).then(function (t) { return t ? t.id : null; });
    return byId.then(function (id) {
      if (!id) return null;
      return cached('lin:' + id, 'https://api.inaturalist.org/v1/taxa/' + id, 30 * DAY, function (j) {
        var r = (j.results || [])[0]; if (!r) return null; var o = { id: r.id, sci: r.name, common: r.preferred_common_name || '', ranks: {} };
        (r.ancestors || []).forEach(function (a) { o.ranks[a.rank] = a.name; }); return o;
      });
    });
  }
  /* ---- museum records (GBIF): path is everything after /v1/ ---- */
  function gbif(path, ttl, map) { return cached('gb:' + path, 'https://api.gbif.org/v1/' + path, ttl || 7 * DAY, map); }
  function specimens(sci, n) {
    return gbif('occurrence/search?basisOfRecord=PRESERVED_SPECIMEN&mediaType=StillImage&limit=' + (n || 12) + '&scientificName=' + encodeURIComponent(sci), 14 * DAY, function (j) {
      return { total: j.count || 0, items: (j.results || []).map(function (r) { var m = (r.media || [])[0] || {}; return { key: r.key, img: m.identifier || '', inst: r.institutionCode || '', holder: m.rightsHolder || r.rightsHolder || r.institutionCode || '', date: (r.eventDate || '').slice(0, 10), place: [r.stateProvince, r.country].filter(Boolean).join(', '), by: r.recordedBy || '' }; }).filter(function (x) { return /^https:/.test(x.img); }) };
    }).then(function (v) { return v || { total: 0, items: [] }; });
  }
  /* ---- Wikimedia Commons: photographs and playable video, searched live ---- */
  function commons(q, n, kind) {
    var url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=' + (n || 12) + '&gsrsearch=' + encodeURIComponent(q + (kind === 'video' ? ' filetype:video' : ' filetype:bitmap')) +
      (kind === 'video' ? '&prop=videoinfo&viprop=url%7Cderivatives%7Cextmetadata&viurlwidth=480' : '&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=420');
    return cached('cm:' + kind + ':' + q + ':' + (n || 12), url, 7 * DAY, function (j) {
      var pages = (j.query && j.query.pages) || {};
      return Object.keys(pages).map(function (k) { return pages[k]; }).sort(function (a, b) { return (a.index || 0) - (b.index || 0); }).map(function (pg) {
        var ii = ((kind === 'video' ? pg.videoinfo : pg.imageinfo) || [])[0] || {}, em = ii.extmetadata || {};
        var o = { title: (pg.title || '').replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, ''), thumb: ii.thumburl || '', page: ii.descriptionurl || '', credit: (strip(em.Artist && em.Artist.value).slice(0, 60) + ' · ' + ((em.LicenseShortName && em.LicenseShortName.value) || '')).replace(/^ · /, '') };
        if (kind === 'video') { o.dur = Math.round(ii.duration || 0); o.src = (ii.derivatives || []).filter(function (d) { return d.src && /^video\//.test(d.type || '') && (d.width || 0) <= 900; }).slice(0, 4).map(function (d) { return { src: d.src, type: (d.type || '').split(';')[0] }; }); if (ii.url) o.src.push({ src: ii.url, type: '' }); }
        return o;
      }).filter(function (o) { return o.thumb && (kind !== 'video' || o.src.length); });
    }).then(function (v) { return v || []; });
  }
  function commonsImages(q, n) { return commons(q, n, 'image'); }
  function commonsVideos(q, n) { return commons(q, n, 'video'); }
  /* a strip of Commons videos that play in place */
  function commonsVideoStrip(box, q, n) {
    box.innerHTML = '<p class="small muted">Searching Wikimedia Commons for film…</p>';
    commonsVideos(q, n || 6).then(function (vs) {
      if (!vs.length) { box.innerHTML = '<p class="small muted">No open-licence film came back for this topic (or you are offline).</p>'; return; }
      box.innerHTML = '<div class="grid">' + vs.map(function (v, i) { return '<div class="vid"><div class="video" data-cv="' + i + '" role="button" tabindex="0"><img src="' + esc(v.thumb) + '" alt="" loading="lazy"><div class="play"><i>▶</i></div></div><div class="vcap">' + esc(v.title) + (v.dur ? ' <span class="muted">(' + Math.floor(v.dur / 60) + ':' + String(v.dur % 60).padStart(2, '0') + ')</span>' : '') + ' <a href="' + esc(v.page) + '" target="_blank" rel="noopener">source ↗</a><br><span class="small muted">' + esc(v.credit) + '</span></div></div>'; }).join('') + '</div>';
      box.querySelectorAll('.video[data-cv]').forEach(function (el) { el.addEventListener('click', function () { var v = vs[+el.getAttribute('data-cv')]; el.innerHTML = '<video controls autoplay playsinline style="position:absolute;inset:0;width:100%;height:100%;background:#000">' + v.src.map(function (s) { return '<source src="' + esc(s.src) + '"' + (s.type ? ' type="' + esc(s.type) + '"' : '') + '>'; }).join('') + '</video>'; }); });
    });
  }
  /* ---- YouTube cards check themselves: live title and channel, and dead videos drop out ---- */
  function checkVideo(card) {
    var id = card.getAttribute('data-ytid'); if (!id) return;
    var k = 'yt:' + id, c = cache[k];
    var apply = function (v) { if (!v) return; if (v.ok === false) { var g = card.parentNode; card.remove(); if (g && !g.querySelector('.vid')) g.innerHTML = '<p class="small muted">These videos are no longer available. Use the search links.</p>'; return; } var t = card.querySelector('.vt'); if (t && v.title) t.textContent = v.title + (v.by ? ' — ' + v.by : ''); };
    if (c && (Date.now() - c.t) < 7 * DAY) { apply(c.v); return; }
    getJSON('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id), 0).then(function (j) { cache[k] = { t: Date.now(), v: { ok: true, title: j.title || '', by: j.author_name || '' } }; persist(); apply(cache[k].v); })
      .catch(function (e) { if (e && (e.status === 401 || e.status === 403 || e.status === 404)) { cache[k] = { t: Date.now(), v: { ok: false } }; persist(); apply(cache[k].v); } });
  }

  /* ---- DOM helpers ---- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); fill(en.target); } });
  }, { rootMargin: '200px' }) : null;

  /* <div class="photo" data-sci="Danaus plexippus"> → fills with a real photo + credit */
  function fill(el) {
    var sci = el.getAttribute('data-sci'), wk = el.getAttribute('data-wiki');
    var p = sci ? taxon(sci).then(function (t) { return t && t.photo ? { url: t.photo.url, attr: t.photo.attr } : (wk ? wiki(wk).then(function (w) { return w && w.thumb ? { url: w.image || w.thumb, attr: 'Wikipedia' } : null; }) : null); })
                : wiki(wk).then(function (w) { return w && (w.image || w.thumb) ? { url: w.image || w.thumb, attr: 'Wikipedia' } : null; });
    p.then(function (ph) {
      if (!ph || !ph.url) return;
      var img = document.createElement('img');
      img.alt = el.getAttribute('data-alt') || sci || wk || '';
      img.loading = 'lazy';
      img.onload = function () { img.classList.add('loaded'); var phd = el.querySelector('.ph'); if (phd) phd.remove(); };
      img.src = ph.url;
      el.appendChild(img);
      if (ph.attr && !el.hasAttribute('data-nocredit')) {
        var c = document.createElement('span'); c.className = 'credit'; c.textContent = ph.attr.replace(/^\(c\)\s*/, '© ').replace('some rights reserved', '').trim(); el.appendChild(c);
      }
    });
  }
  function photoHTML(sci, opts) {
    opts = opts || {};
    return '<div class="photo ' + (opts.cls || '') + '" data-sci="' + esc(sci || '') + '"' + (opts.wiki ? ' data-wiki="' + esc(opts.wiki) + '"' : '') + (opts.alt ? ' data-alt="' + esc(opts.alt) + '"' : '') + (opts.nocredit ? ' data-nocredit' : '') + '><span class="ph">' + (opts.icon || '🔍') + '</span></div>';
  }
  function hydrate(root) {
    (root || document).querySelectorAll('.photo[data-sci], .photo[data-wiki]').forEach(function (el) {
      if (el.getAttribute('data-hydrated')) return; el.setAttribute('data-hydrated', '1');
      if (io) io.observe(el); else fill(el);
    });
    (root || document).querySelectorAll('.vid[data-ytid]').forEach(function (card) { if (card.getAttribute('data-checked')) return; card.setAttribute('data-checked', '1'); checkVideo(card); });
    (root || document).querySelectorAll('.video[data-yt]').forEach(function (el) {
      if (el.getAttribute('data-hydrated')) return; el.setAttribute('data-hydrated', '1');
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-yt');
        el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(id) + '?autoplay=1&rel=0" title="Video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    });
  }
  function videoHTML(v) {
    return '<div class="vid" data-ytid="' + esc(v.id) + '"><div class="video" data-yt="' + esc(v.id) + '" role="button" tabindex="0" aria-label="Play: ' + esc(v.title) + '">' +
      '<img src="https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy"><div class="play"><i>▶</i></div></div>' +
      '<div class="vcap"><span class="vt">' + esc(v.title) + '</span> <a href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">open ↗</a>' +
      (v.q ? '<a href="https://www.youtube.com/results?search_query=' + encodeURIComponent(v.q) + '" target="_blank" rel="noopener">more like this ↗</a>' : '') + '</div></div>';
  }
  function videoGrid(list) { return '<div class="grid">' + list.map(videoHTML).join('') + '</div>'; }

  return { taxon: taxon, gallery: gallery, nearby: nearby, wiki: wiki, sounds: sounds, points: points, searchSpecies: searchSpecies, lineage: lineage, gbif: gbif, specimens: specimens, commonsImages: commonsImages, commonsVideos: commonsVideos, commonsVideoStrip: commonsVideoStrip, cached: cached, photoHTML: photoHTML, hydrate: hydrate, videoHTML: videoHTML, videoGrid: videoGrid, esc: esc,
    clearCache: function () { cache = {}; try { localStorage.removeItem(CKEY); } catch (e) {} } };
})();
