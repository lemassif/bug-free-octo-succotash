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
  'js/voice.js',
  'js/evaluate.js',
  'js/progress.js',
  'js/rewards.js',
  'js/stations.js',
  'js/grownup.js',
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
