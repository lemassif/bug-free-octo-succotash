/* build-single-file.js — bundles Chance Academy into one HTML file.

   The app normally runs as separate files under chance/ (easier to
   read and edit). This flattens it into a single self-contained page
   for anywhere that needs exactly one file: emailing it to somebody,
   dropping it in iCloud Drive, or publishing it as a preview link.

   Run:  node chance/build-single-file.js
   Out:  dist/chance-academy.html

   Pass --page-content to emit the body content only, with no
   <!doctype>/<html>/<head> wrapper, for hosts that supply their own
   document shell.

   The service worker and manifest are dropped from this build — a
   single loose file has no sibling URLs to cache. Use the normal
   chance/ folder on a real web host for the offline,
   add-to-home-screen version. */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(__dirname, '..', 'dist');
const pageContentOnly = process.argv.includes('--page-content');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// Load order matters: the curriculum registry first, then the three
// unit files that push days into it, then the engine, app shell last.
const SCRIPTS = [
  'data/curriculum.js',
  'data/unit1-space.js',
  'data/unit2-woods.js',
  'data/unit3-forces.js',
  'js/phonics.js',
  'js/updater.js',
  'js/homework.js',
  'js/scan.js',
  'js/recordings.js',
  'js/voice.js',
  'js/evaluate.js',
  'js/progress.js',
  'js/rewards.js',
  'js/stations.js',
  'js/grownup.js',
  'js/studio.js',
  'js/hwui.js',
  'js/app.js'
];

const TITLE = 'Chance Academy — Science, Numbers & Reading';
const css = read('app.css');

// Pull the markup out of <body>, dropping the <script src> tags and
// the service-worker registration along with them.
const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(read('index.html'));
if (!bodyMatch) throw new Error('could not find <body> in index.html');
const markup = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').trim();

const js = SCRIPTS
  .map((f) => '/* ===== ' + f + ' ===== */\n' + read(f))
  .join('\n\n');

const parts = [];
if (!pageContentOnly) {
  parts.push(
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-title" content="Chance Academy">',
    '<meta name="theme-color" content="#0f2a4a">'
  );
}
parts.push('<title>' + TITLE + '</title>');
parts.push('<style>\n' + css + '\n</style>');
if (!pageContentOnly) parts.push('</head>', '<body>');
parts.push(markup);
parts.push('<script>\n' + js + '\n<\/script>');
if (!pageContentOnly) parts.push('</body>', '</html>');

/* Keep version.json in step with the version baked into updater.js.
   If these drift the app either nags about an update forever or never
   notices one, so the build writes the file rather than trusting a
   human to remember. */
const verMatch = /var VERSION = '([^']+)'/.exec(read('js/updater.js'));
const builtMatch = /var BUILT = '([^']+)'/.exec(read('js/updater.js'));
if (verMatch) {
  const vfile = path.join(ROOT, 'version.json');
  const existing = fs.existsSync(vfile) ? JSON.parse(fs.readFileSync(vfile, 'utf8')) : {};
  const next = {
    version: verMatch[1],
    built: builtMatch ? builtMatch[1] : existing.built || '',
    notes: existing.notes || ''
  };
  fs.writeFileSync(vfile, JSON.stringify(next, null, 2) + '\n');
  console.log('  version.json -> ' + next.version);
}

/* Stamp the version onto every local file address in index.html.
   A new page then asks for js/app.js?v=1.6.0 — an address the
   browser has never stored — so it can never be handed yesterday's
   script. This is what makes "Update the app" reliable. */
if (verMatch) {
  const ipath = path.join(ROOT, 'index.html');
  const before = fs.readFileSync(ipath, 'utf8');
  const after = before
    .replace(/(<script src="(?:js|data)\/[^"?]+\.js)(?:\?v=[^"]*)?"/g, '$1?v=' + verMatch[1] + '"')
    .replace(/(<link rel="stylesheet" href="app\.css)(?:\?v=[^"]*)?"/g, '$1?v=' + verMatch[1] + '"');
  if (after !== before) fs.writeFileSync(ipath, after);
  console.log('  index.html file addresses stamped with ?v=' + verMatch[1]);
}

const out = parts.join('\n');
fs.mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, pageContentOnly ? 'chance-academy.page.html' : 'chance-academy.html');
fs.writeFileSync(outFile, out);

// Sanity check: all 60 day objects should be in the bundle.
const days = (js.match(/^    icon: '/gm) || []).length;
console.log('wrote ' + outFile);
console.log('  ' + Math.round(out.length / 1024) + ' kb, ' + days + ' mission days bundled');
if (days !== 60) {
  console.error('  WARNING: expected 60 mission days, found ' + days);
  process.exit(1);
}
