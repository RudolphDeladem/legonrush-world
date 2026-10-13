#!/usr/bin/env python3
"""Ground-cover grids from the owner's aerials, for the Great Hall landscape (ghlandscape.ts) and the tennis complex's
tree belt (tennis.ts).

    python3 scripts/landcover/cover.py            # writes src/game/landcover.ts

The aerials are the owner's screenshots in docs/great-hall-landscape/refs (Pictures 1 and 2 of the Great Hall
surrounding landscape brief) and docs/tennis-west/refs (Picture 12 of the Commonwealth west tennis court brief). Each is
registered to the game map (x east, z south, metres) by a scale and an offset, read from features the map and the
picture share: the Legon ByPass, the long north-south track (osm), the pale rectangle south-west of the Great Hall, the
tennis pitches, the dirt roads. No rotation was needed (checked by overlaying the mapped roads and outlines).

Every pixel is classed by its colour, then each grid cell keeps its commonest class and how much of it is dense green:
  1 dense green (tree and shrub clusters)   2 green low cover (grass, herbs)   3 dry sparse cover (olive, khaki)
  4 exposed red-orange soil                 5 pale bare ground                 6 dark brown ground (soil under small shrubs)
  0 no evidence (outside the pictures, the owner's blue marks, the map's labels and buttons)
A cell is one character: 97 + class * 4 + dense quarter (0-3). The grid is run-length encoded ("<count>~<char>" for runs).
Colour, not survey: the classes are what the aerial shows from above, not measured ground or plant heights.
"""
import colorsys, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')

# (file, x of pixel 0, z of pixel 0, pixels per metre): px = (x - x0) * s
P1 = ('docs/great-hall-landscape/refs/picture-1.jpg', -1273 - 917 / 1.114, 269 - 620 / 1.114, 1.114)
P2 = ('docs/great-hall-landscape/refs/picture-2.jpg', -1324 - 770 / 1.07, -73 - 688 / 1.07, 1.07)
# Picture 12: the hard court's enclosure (its west edge, pixel 275, and north edge, pixel 438) on the mapped pitch
P12 = ('docs/tennis-west/refs/picture-12.jpg', -638.7 - 275 / 2.69, -90.6 - 438 / 2.69, 2.69)


def load(spec):
    f, x0, z0, s = spec
    im = Image.open(os.path.join(ROOT, f)).convert('RGB')
    return im, im.load(), x0, z0, s


def ui(r, g, b):
    """the owner's blue marks, the map's white labels and grey buttons"""
    return (b > r + 40 and b > g + 15) or (r > 225 and g > 225 and b > 225) or (abs(r - g) < 6 and abs(g - b) < 6 and r < 70)


def cls_aerial(r, g, b, dense=(14, 0.42)):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if v > 0.62 and s < 0.3:
        return 5
    if g - r > dense[0]:
        return 1 if v < dense[1] else 2
    if g - r > 6:
        return 2
    if r - g > 22:
        return 4 if v >= 0.47 else 6
    return 3


def grid(sources, x0, x1, z0, z1, cell, dense, edge=6):
    nx, nz = round((x1 - x0) / cell), round((z1 - z0) / cell)
    out = []
    for j in range(nz):
        for i in range(nx):
            counts = [0] * 7
            for im, px, ix0, iz0, s in sources:
                W, H = im.size
                u0, v0 = (x0 + i * cell - ix0) * s, (z0 + j * cell - iz0) * s
                u1, v1 = u0 + cell * s, v0 + cell * s
                if u0 < edge or v0 < edge or u1 > W - edge or v1 > H - edge:
                    continue
                n = 0
                for v in range(int(v0), int(v1)):
                    for u in range(int(u0), int(u1)):
                        r, g, b = px[u, v]
                        if ui(r, g, b):
                            continue
                        counts[cls_aerial(r, g, b, dense)] += 1
                        n += 1
                if n:
                    break  # the first picture that covers the cell decides it
            total = sum(counts)
            if total == 0:
                out.append(97)
                continue
            c = max(range(1, 7), key=lambda k: counts[k])
            q = min(3, int(4 * counts[1] / total))
            out.append(97 + c * 4 + q)
    return nx, nz, out


def rle(codes):
    s, i = [], 0
    while i < len(codes):
        j = i
        while j < len(codes) and codes[j] == codes[i]:
            j += 1
        n, ch = j - i, chr(codes[i])
        s.append(f'{n}~{ch}' if n > 3 else ch * n)
        i = j
    return ''.join(s).replace('\\', '\\\\').replace("'", "\\'")


def main():
    # the Great Hall landscape: Picture 1 first (the Great Hall's side), then Picture 2 (the north)
    gh = dict(x0=-1996, x1=-420, z0=-716, z1=488, cell=4)
    nx, nz, codes = grid([load(P1), load(P2)], gh['x0'], gh['x1'], gh['z0'], gh['z1'], gh['cell'], (14, 0.42))
    # the tennis complex's surroundings: Picture 12 (a sharper capture: its dense canopy is lighter, its lawns olive)
    tc = dict(x0=-744, x1=-412, z0=-248, z1=60, cell=2)
    tnx, tnz, tcodes = grid([load(P12)], tc['x0'], tc['x1'], tc['z0'], tc['z1'], tc['cell'], (28, 0.6))
    with open(os.path.join(ROOT, 'src/game/landcover.ts'), 'w') as f:
        f.write('// Generated by scripts/landcover/cover.py from the owner\'s aerials (see that script): do not edit by hand.\n')
        f.write('// Each cell: 97 + class * 4 + dense quarter; runs as "<count>~<char>". Classes: 0 no evidence, 1 dense green,\n')
        f.write('// 2 green low cover, 3 dry sparse cover, 4 red-orange soil, 5 pale bare ground, 6 dark brown ground.\n')
        f.write('export interface CoverGrid { x0: number; z0: number; cell: number; nx: number; nz: number; rle: string }\n')
        f.write(f"export const GH_COVER: CoverGrid = {{ x0: {gh['x0']}, z0: {gh['z0']}, cell: {gh['cell']}, nx: {nx}, nz: {nz}, rle: '{rle(codes)}' }};\n")
        f.write(f"export const TC_COVER: CoverGrid = {{ x0: {tc['x0']}, z0: {tc['z0']}, cell: {tc['cell']}, nx: {tnx}, nz: {tnz}, rle: '{rle(tcodes)}' }};\n")
    print('GH', nx, nz, 'TC', tnx, tnz)


if __name__ == '__main__':
    main()
