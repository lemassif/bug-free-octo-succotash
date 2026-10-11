/* ============================================================
   rewards.js — draws the reward card and gets it off the iPad

   Grandpa's ask: when Chance earns something, he should be able to
   send it to family. So every badge becomes a real PNG image drawn
   here on a canvas, and then:

     Share   -> navigator.share() with the actual image file. On
                iPad this opens the iOS share sheet, so Messages,
                Mail, AirDrop and Photos all work in one tap and
                the picture really is attached.
     Save    -> downloads the PNG (Files / Photos).
     Text    -> sms: link pre-filled with the achievement text.
     Email   -> mailto: link pre-filled, with the text.

   sms: and mailto: links cannot carry an attachment — that is an
   iOS limitation, not a choice — so those two send the words and
   we tell the user to use Share if they want the picture.
   ============================================================ */

window.Rewards = (function () {

  var W = 1080, H = 1350;

  function drawCard(badge, stats) {
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');

    // --- night sky background, because everything started with the solar system
    var sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#132f54');
    sky.addColorStop(0.55, '#0f2a4a');
    sky.addColorStop(1, '#091a2f');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // stars — seeded so a badge always looks the same when re-shared
    var seed = hash(badge.id || badge.name || 'x');
    for (var i = 0; i < 90; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var x = (seed % W), y = ((seed >> 7) % (H - 380));
      var r = ((seed >> 3) % 3) + 1;
      g.globalAlpha = 0.25 + ((seed >> 11) % 60) / 100;
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;

    // --- header
    g.textAlign = 'center';
    g.fillStyle = '#ffc93c';
    g.font = '800 40px "Trebuchet MS", system-ui, sans-serif';
    g.fillText('CHANCE ACADEMY', W / 2, 118);
    g.fillStyle = 'rgba(255,255,255,.66)';
    g.font = '600 28px "Trebuchet MS", system-ui, sans-serif';
    g.fillText('Science · Numbers · Reading', W / 2, 162);

    // --- medallion
    var cx = W / 2, cy = 470, R = 210;
    var ring = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    ring.addColorStop(0, '#ffe27a');
    ring.addColorStop(0.5, '#ffc93c');
    ring.addColorStop(1, '#f5a524');
    g.fillStyle = ring;
    g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.fill();
    g.fillStyle = '#0f2a4a';
    g.beginPath(); g.arc(cx, cy, R - 26, 0, 6.283); g.fill();

    // sunburst points
    g.save();
    g.translate(cx, cy);
    g.fillStyle = 'rgba(255,201,60,.9)';
    for (var s = 0; s < 16; s++) {
      g.rotate(6.283 / 16);
      g.beginPath();
      g.moveTo(-14, -R - 6); g.lineTo(14, -R - 6); g.lineTo(0, -R - 42);
      g.closePath(); g.fill();
    }
    g.restore();

    // the badge emoji, dead centre
    g.font = '200px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    g.textBaseline = 'middle';
    g.fillText(badge.em || '⭐', cx, cy + 8);
    g.textBaseline = 'alphabetic';

    // --- who and what
    g.fillStyle = '#ffffff';
    g.font = '800 66px "Trebuchet MS", system-ui, sans-serif';
    wrap(g, badge.name || 'Great Work', cx, 790, W - 140, 74);

    g.fillStyle = '#ffc93c';
    g.font = '700 40px "Trebuchet MS", system-ui, sans-serif';
    g.fillText('earned by ' + (badge.who || 'Chance'), cx, 890);

    if (badge.blurb) {
      g.fillStyle = 'rgba(255,255,255,.8)';
      g.font = '400 32px "Trebuchet MS", system-ui, sans-serif';
      wrap(g, badge.blurb, cx, 950, W - 200, 42);
    }

    // --- stats strip
    if (stats && stats.length) {
      var boxY = 1050, boxH = 150, pad = 70;
      g.fillStyle = 'rgba(255,255,255,.08)';
      roundRect(g, pad, boxY, W - pad * 2, boxH, 28);
      g.fill();
      var each = (W - pad * 2) / stats.length;
      stats.forEach(function (st, i) {
        var x = pad + each * i + each / 2;
        g.fillStyle = '#ffe27a';
        g.font = '800 54px "Trebuchet MS", system-ui, sans-serif';
        g.fillText(String(st.value), x, boxY + 74);
        g.fillStyle = 'rgba(255,255,255,.7)';
        g.font = '600 24px "Trebuchet MS", system-ui, sans-serif';
        g.fillText(st.label.toUpperCase(), x, boxY + 112);
      });
    }

    // --- date
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.font = '500 28px "Trebuchet MS", system-ui, sans-serif';
    g.fillText(prettyDate(badge.date), cx, 1272);

    return c;
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function wrap(g, text, cx, y, maxW, lh) {
    var words = String(text).split(' '), line = '', lines = [];
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    lines.forEach(function (l, i) { g.fillText(l, cx, y + i * lh); });
    return lines.length;
  }

  function prettyDate(d) {
    var dt = d ? new Date(String(d).replace(/-/g, '/')) : new Date();
    if (isNaN(dt)) dt = new Date();
    return dt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h & 0x7fffffff;
  }

  /* --------------------------- the message -------------------------- */
  function messageFor(badge, who) {
    var lines = [
      (who || 'Chance') + ' just earned the "' + (badge.name || 'Great Work') + '" badge at Chance Academy!'
    ];
    if (badge.blurb) lines.push(badge.blurb);
    if (window.Progress) {
      var t = Progress.data.totals;
      lines.push('⭐ ' + t.stars + ' stars · 💎 ' + t.gems + ' perfect missions · 🔥 ' + Progress.data.streak.count + '-day streak');
    }
    lines.push('— sent from Chance Academy');
    return lines.join('\n');
  }

  function toBlob(canvas) {
    return new Promise(function (res) {
      if (canvas.toBlob) canvas.toBlob(function (b) { res(b); }, 'image/png');
      else res(dataURLtoBlob(canvas.toDataURL('image/png')));
    });
  }
  function dataURLtoBlob(u) {
    var parts = u.split(','), bin = atob(parts[1]), n = bin.length, arr = new Uint8Array(n);
    while (n--) arr[n] = bin.charCodeAt(n);
    return new Blob([arr], { type: 'image/png' });
  }

  function fileName(badge) {
    return 'chance-' + String(badge.name || 'badge').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png';
  }

  /* Share sheet with the real image attached (iPad: Messages, Mail,
     AirDrop, Photos, Notes...). Returns 'shared' | 'fallback'. */
  function share(badge, canvas, who) {
    var text = messageFor(badge, who);
    return toBlob(canvas).then(function (blob) {
      var file = null;
      try { file = new File([blob], fileName(badge), { type: 'image/png' }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: badge.name, text: text })
          .then(function () { return 'shared'; })
          .catch(function () { return 'cancelled'; });
      }
      if (navigator.share) {
        return navigator.share({ title: badge.name, text: text })
          .then(function () { return 'shared-text'; })
          .catch(function () { return 'cancelled'; });
      }
      return 'fallback';
    });
  }

  function download(badge, canvas) {
    return toBlob(canvas).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = fileName(badge);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      return 'saved';
    });
  }

  function textIt(badge, who) {
    var body = encodeURIComponent(messageFor(badge, who));
    // iOS wants sms:&body=, Android wants sms:?body=
    var ios = /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent);
    location.href = 'sms:' + (ios ? '&' : '?') + 'body=' + body;
  }

  function emailIt(badge, who) {
    var subj = encodeURIComponent((who || 'Chance') + ' earned a badge: ' + (badge.name || ''));
    var body = encodeURIComponent(messageFor(badge, who) + '\n\n(Tap Share in the app to send the picture too.)');
    location.href = 'mailto:?subject=' + subj + '&body=' + body;
  }

  function copyIt(badge, who) {
    var t = messageFor(badge, who);
    if (navigator.clipboard) return navigator.clipboard.writeText(t).then(function () { return true; }).catch(function () { return false; });
    return Promise.resolve(false);
  }

  return {
    drawCard: drawCard, share: share, download: download,
    textIt: textIt, emailIt: emailIt, copyIt: copyIt,
    messageFor: messageFor, toBlob: toBlob
  };
})();
