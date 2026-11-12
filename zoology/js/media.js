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
  function getJSON(url) {
    return enqueue(function () {
      return fetch(url, { headers: { 'Accept': 'application/json' } }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    });
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
    var k = 'wk:' + title;
    if (fresh(cache[k])) return Promise.resolve(cache[k].v);
    return getJSON('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.replace(/ /g, '_'))).then(function (j) {
      var v = { title: j.title, extract: j.extract || '', url: (j.content_urls && j.content_urls.desktop) ? j.content_urls.desktop.page : 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title), thumb: j.thumbnail ? j.thumbnail.source : '', image: j.originalimage ? j.originalimage.source : '' };
      cache[k] = { t: Date.now(), v: v }; persist(); return v;
    }).catch(function () { return null; });
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
    (root || document).querySelectorAll('.video[data-yt]').forEach(function (el) {
      if (el.getAttribute('data-hydrated')) return; el.setAttribute('data-hydrated', '1');
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-yt');
        el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(id) + '?autoplay=1&rel=0" title="Video" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    });
  }
  function videoHTML(v) {
    return '<div class="vid"><div class="video" data-yt="' + esc(v.id) + '" role="button" tabindex="0" aria-label="Play: ' + esc(v.title) + '">' +
      '<img src="https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy"><div class="play"><i>▶</i></div></div>' +
      '<div class="vcap">' + esc(v.title) + ' <a href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">open ↗</a>' +
      (v.q ? '<a href="https://www.youtube.com/results?search_query=' + encodeURIComponent(v.q) + '" target="_blank" rel="noopener">more like this ↗</a>' : '') + '</div></div>';
  }
  function videoGrid(list) { return '<div class="grid">' + list.map(videoHTML).join('') + '</div>'; }

  return { taxon: taxon, gallery: gallery, nearby: nearby, wiki: wiki, photoHTML: photoHTML, hydrate: hydrate, videoHTML: videoHTML, videoGrid: videoGrid, esc: esc,
    clearCache: function () { cache = {}; try { localStorage.removeItem(CKEY); } catch (e) {} } };
})();
