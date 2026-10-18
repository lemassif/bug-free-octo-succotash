"""Builds the reversed (dark-background) TKC logo assets from the official logo file.

Source: public/brand/tkc-logo-source.jpg (official TKC logo, navy star + navy wordmark on white).
Outputs (transparent PNG, upscaled and edge-sharpened):
  public/logo-full.png  star + "The Kennedy Collective" wordmark, navy turned white, wedge in brand Light Red
  public/logo-mark.png  star icon only, same treatment
Run: python3 scripts/make-logo.py
"""
from PIL import Image, ImageFilter
import numpy as np

SRC = 'public/brand/tkc-logo-source.jpg'
UP = 6
RED = np.array([231, 0, 76], dtype=float)      # brand Light Red #E7004C
WHITE = np.array([255, 255, 255], dtype=float)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def build(box, out):
    im = Image.open(SRC).convert('RGB').crop(box)
    w, h = im.size
    im = im.resize((w * UP, h * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(UP * 0.35))
    a = np.asarray(im).astype(float)
    alpha = smoothstep(0.18, 0.80, 1 - a.min(axis=2) / 255.0)          # darkness vs white paper
    redness = smoothstep(-4, 22, a[..., 0] - a[..., 2])                # wedge is red-dominant, star/text are blue-dominant
    rgb = WHITE[None, None, :] * (1 - redness[..., None]) + RED[None, None, :] * redness[..., None]
    pad = 8 * UP
    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, 'RGBA')
    canvas = Image.new('RGBA', (img.width + 2 * pad, img.height + 2 * pad), (255, 255, 255, 0))
    canvas.paste(img, (pad, pad))
    canvas.save(out)
    print('wrote', out, canvas.size)


build((57, 50, 312, 144), 'public/logo-full.png')
build((57, 50, 143, 144), 'public/logo-mark.png')
