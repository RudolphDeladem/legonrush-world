// Comparison cameras for the owner's Great Hall surrounding landscape brief (ghlplan.ts, ghlandscape.ts; preview views
// ghl* in tools/preview/halls.html). Heights are above the ground. The two top views frame the aerials' own extents
// (Pictures 1 and 2, north up); the low views stand in an open soil patch, a grass patch, a short-stemmed tree cluster
// and on the long north-south track, picked from the ground cover grid.
export interface GhlView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const GHL_VIEWS: GhlView[] = [
  { name: 'ghlTop1', eye: [-1514, 840, 100], look: [-1514, 0, 99.9], fov: 50, note: 'the extent of Picture 1 from above, north up' },
  { name: 'ghlTop2', eye: [-1164, 1080, -316], look: [-1164, 0, -316.1], fov: 50, note: 'the extent of Picture 2 from above, north up' },
  { name: 'ghlSoil', eye: [-1786, 1.7, 138], look: [-1806, 0.6, 104], fov: 62, note: 'a low view through an open red soil patch' },
  { name: 'ghlGrass', eye: [-1868, 1.7, -160], look: [-1890, 0.6, -196], fov: 62, note: 'a low view over a grass patch' },
  { name: 'ghlTrees', eye: [-1772, 1.7, 76], look: [-1772, 2.2, 36], fov: 62, note: 'a short-stemmed tree cluster' },
  { name: 'ghlTrack', eye: [-1324, 1.7, -60], look: [-1325, 0.8, -160], fov: 62, note: 'on the long north-south earth track' },
  { name: 'ghlRise', eye: [-980, 40, 40], look: [-1300, 0, -180], fov: 60, note: 'from above the Great Hall\'s west side over the land behind it' },
  { name: 'ghlPale', eye: [-1240, 18, 320], look: [-1273, 0, 269], fov: 58, note: 'the pale clearing (no building)' },
];
