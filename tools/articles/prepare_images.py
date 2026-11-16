#!/usr/bin/env python3
"""Offline: make <name>-1600.webp and <name>-800.webp next to each photo that an article declares (kind: photo).

Needs Pillow (not available on the Vercel build, so the derivatives are committed). Usage:
  python3 tools/articles/prepare_images.py [articles/apollo-11/as11-40-5917.jpg ...]   # no arguments: all declared photos
The original stays in articles/ and is not published; the build copies only the derivatives."""
import re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SIZES = (1600, 800)

def declared():
    for md in sorted((ROOT / 'articles').glob('*/*.md')):
        txt = md.read_text(encoding='utf-8')
        for m in re.finditer(r'^\s+file:\s*(\S+)\s*$', txt.split('\n---\n')[0], re.M):
            if not m.group(1).endswith('.webp'): yield md.parent / m.group(1)

def prepare(src):
    im = Image.open(src).convert('RGB')
    for w in SIZES:
        out = src.with_name(f'{src.stem}-{w}.webp')
        w2 = min(w, im.width)
        im.resize((w2, round(im.height * w2 / im.width)), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
        print(f'{out.relative_to(ROOT)}: {w2}x{round(im.height * w2 / im.width)}, {out.stat().st_size} bytes')

if __name__ == '__main__':
    for p in (map(Path, sys.argv[1:]) if len(sys.argv) > 1 else sorted(set(declared()))): prepare(p.resolve())
