// Encodes the procedural textures to KTX2 (Basis ETC1S with mipmaps) so the
// GPU keeps them compressed, and copies the Basis transcoder next to them.
// Skips work when the outputs are newer than the generator.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { encodeToKTX2 } from "ktx2-encoder";
import { TEX_IDS } from "../src/world/materials.ts";
import { generateTexture, TEX_SIZE } from "../src/world/texgen.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "../public/baked/textures");
const basisDir = path.join(here, "../public/baked/basis");
const genFile = path.join(here, "../src/world/texgen.ts");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(basisDir, { recursive: true });

const require = createRequire(import.meta.url);
const threeDir = path.resolve(path.dirname(require.resolve("three")), "..");
for (const f of ["basis_transcoder.js", "basis_transcoder.wasm"]) {
  fs.copyFileSync(path.join(threeDir, "examples/jsm/libs/basis", f), path.join(basisDir, f));
}

const genTime = fs.statSync(genFile).mtimeMs;
const force = process.argv.includes("--force");
let made = 0, bytes = 0;
const t0 = Date.now();
for (const id of TEX_IDS) {
  const out = path.join(outDir, `${id}.ktx2`);
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs > genTime) {
    bytes += fs.statSync(out).size;
    continue;
  }
  const rgba = generateTexture(id);
  const ktx = await encodeToKTX2(new Uint8Array(1), {
    isUASTC: false,
    qualityLevel: 200,
    compressionLevel: 2,
    generateMipmap: true,
    isKTX2File: true,
    isPerceptual: true,
    isSetKTX2SRGBTransferFunc: true,
    imageDecoder: async () => ({ width: TEX_SIZE, height: TEX_SIZE, data: rgba }),
  });
  fs.writeFileSync(out, ktx);
  bytes += ktx.length;
  made++;
}
console.log(`textures: ${made} encoded, ${TEX_IDS.length} total, ${(bytes / 1024).toFixed(0)} KB KTX2 in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
