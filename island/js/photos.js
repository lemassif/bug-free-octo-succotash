/* Shrinks a photo from the camera or library before it is saved.

   A phone photo is 3–8 MB; the full copy saved here is a 1600 px
   JPEG of roughly 300 KB, and the thumbnail about 40 KB. Redrawing
   through a canvas also drops the EXIF block, so a photo's GPS
   location is never uploaded. */

const FULL = 1600;
const THUMB = 480;

export async function preparePhoto(file) {
  const src = await decode(file);
  const w = src.width || src.naturalWidth;
  const h = src.height || src.naturalHeight;
  if (!w || !h) throw new Error('unreadable');
  const full = await draw(src, w, h, FULL, 0.82);
  const thumb = await draw(src, w, h, THUMB, 0.75);
  if (src.close) src.close();
  return { full: full.blob, thumb: thumb.blob, width: full.width, height: full.height };
}

async function decode(file) {
  if (window.createImageBitmap) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e) { /* fall back to <img>, which some Safari versions need */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function draw(src, w, h, max, quality) {
  const scale = Math.min(1, max / Math.max(w, h));
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, cw, ch);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve({ blob, width: cw, height: ch }) : reject(new Error('unreadable'))),
      'image/jpeg', quality);
  });
}
