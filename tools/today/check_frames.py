"""Share of lit pixels on the rendered Moon frames vs (1-cos(elongation))/2. Usage: python3 tools/today/check_frames.py"""
import math, sys
from pathlib import Path
from PIL import Image
D = Path(__file__).resolve().parents[2] / 'assets/today/phases'
worst = 0
for e in (15, 30, 45, 90, 135, 160, 175, 200, 225, 270, 300, 340):
    im = Image.open(D / f'{e:03d}-800.webp').convert('RGBA'); px = im.load(); w, h = im.size
    disc = lit = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 250:
                disc += 1
                if 0.299 * r + 0.587 * g + 0.114 * b > 10: lit += 1
    got = 100 * lit / disc; want = 100 * (1 - math.cos(math.radians(e))) / 2; worst = max(worst, abs(got - want))
    print(f'elong {e:3d}: lit pixels {got:5.1f}% expected {want:5.1f}% diff {got-want:+.1f} pp (disc {disc} px)')
print(f'max |diff| = {worst:.1f} pp'); sys.exit(0 if worst <= 5 else 1)
