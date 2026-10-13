// Comparison cameras for the owner's Great Hall correction brief (the aerial A01, the tour R01-R59, the game views
// G01-G10; preview views gh* in tools/preview/halls.html). Heights are above the ground. Matched by eye to the
// references, not surveyed camera positions.
export interface GhView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const GH_VIEWS: GhView[] = [
  { name: 'ghTop', eye: [-905, 300, 128], look: [-905.1, 0, 128], fov: 48, note: 'the whole precinct from above, the hall at the top as in A01' },
  { name: 'ghTopC', eye: [-955, 150, 128], look: [-955.1, 0, 128], fov: 48, note: 'the hall, the courts and the gateway from above (A01, upper half)' },
  { name: 'ghG01', eye: [-900, 45, 128], look: [-1000, 10, 128], fov: 55, note: 'the front oblique from the east (G01, G02)' },
  { name: 'ghG03', eye: [-915, 38, 178], look: [-995, 6, 125], fov: 55, note: 'the side oblique from the south-east (G03, G04)' },
  { name: 'ghG09', eye: [-1095, 40, 128], look: [-990, 10, 128], fov: 55, note: 'the opposite side from the west, the tower (G09, G10)' },
  { name: 'ghR54', eye: [-976, 1.7, 131], look: [-995, 6.5, 129], fov: 62, note: 'the upper court toward the portico and its signs (R54)' },
  { name: 'ghR51', eye: [-952, 1.7, 127], look: [-1000, 8, 129], fov: 62, note: 'the upper court facing the hall (R51-R53)' },
  { name: 'ghR15', eye: [-950, 1.7, 124], look: [-905, 3.5, 129], fov: 62, note: 'from the upper court toward the gateway, the piers and tanks (R15-R17)' },
  { name: 'ghR10', eye: [-968, 1.7, 112], look: [-968, 3, 160], fov: 62, note: 'across the upper court to the side wing and its arched gable (R10, R02-R03)' },
  { name: 'ghR25', eye: [-931, 1.7, 139.5], look: [-912, 2, 145.5], fov: 62, note: 'the lower court and the bust walk (R25-R27)' },
  { name: 'ghR34', eye: [-916, 1.7, 124.5], look: [-909, 2.5, 129], fov: 62, note: 'the arched threshold of the gateway (R34-R36)' },
  { name: 'ghR48', eye: [-921, 1.7, 127.6], look: [-960, 6, 128], fov: 62, note: 'the stepped approach up to the upper court and the hall (R46-R50)' },
  { name: 'ghR58', eye: [-974, 1.7, 119], look: [-994, 24, 146], fov: 70, note: 'the clock tower from the upper court (R58, R59)' },
  { name: 'ghR06', eye: [-976, 1.7, 136], look: [-994, 6, 146], fov: 62, note: 'the tower base, the oriel and the portico (R06-R08)' },
  { name: 'ghGarden', eye: [-768, 14, 128], look: [-850, 0, 128], fov: 58, note: 'the formal approach garden toward the gateway (A01, lower half)' },
];
