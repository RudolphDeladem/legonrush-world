// A spatial index of road segments: the distance from a point to the nearest road edge without scanning every road on
// the map (the models' ground drapes ask it thousands of times; scanned linearly it cost seconds of the page's start).
export type Seg5 = [number, number, number, number, number];

/** distance from x, z to the nearest segment's edge (its half width off the centre line), at most `reach` */
export function segIndex(segs: Seg5[], cell = 16) {
  const grid = new Map<number, number[]>();
  const key = (i: number, j: number) => (i + 32768) * 65536 + (j + 32768);
  segs.forEach(([ax, az, bx, bz, h], k) => {
    for (let i = Math.floor((Math.min(ax, bx) - h) / cell); i <= Math.floor((Math.max(ax, bx) + h) / cell); i++)
      for (let j = Math.floor((Math.min(az, bz) - h) / cell); j <= Math.floor((Math.max(az, bz) + h) / cell); j++) {
        const kk = key(i, j);
        let l = grid.get(kk);
        if (!l) grid.set(kk, (l = []));
        l.push(k);
      }
  });
  const stamp = new Uint32Array(segs.length);
  let round = 0;
  return (x: number, z: number, reach: number) => {
    let best = reach;
    round++;
    const r = Math.ceil(reach / cell), ci = Math.floor(x / cell), cj = Math.floor(z / cell);
    for (let i = ci - r; i <= ci + r; i++) for (let j = cj - r; j <= cj + r; j++) {
      const l = grid.get(key(i, j));
      if (!l) continue;
      for (const k of l) {
        if (stamp[k] === round) continue;
        stamp[k] = round;
        const [ax, az, bx, bz, h] = segs[k], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
        best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h);
      }
    }
    return best;
  };
}
