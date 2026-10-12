// Comparison cameras for the owner's Limbo brief (pictures 1-3, game screenshots with the outlines circled; picture 4,
// the aerial; preview views limbo1 ... limbo3, limboTop, limboStrip in tools/preview/halls.html). Heights are above the
// ground. Placed to match the screenshots' framing, not surveyed camera positions.
import type { LbView } from './lbviews';
export const LIMBO_VIEWS: LbView[] = [
  { name: 'limbo1', eye: [524, 1.8, 8], look: [470, 5, -60], fov: 62, note: 'Picture 1: from the corner of Annie Jiagge Road toward the Limbo ruin, the strip on the right' },
  { name: 'limbo2', eye: [513, 1.8, -62], look: [536, 4, -140], fov: 62, note: 'Picture 2: north along Annie Jiagge Road, the strip by the road' },
  { name: 'limbo3', eye: [505, 1.8, 70], look: [470, 5, -30], fov: 62, note: 'Picture 3: from the south, the ruin behind its trees' },
  { name: 'limboTop', eye: [470, 190, 60], look: [465, 0, -55], fov: 55, note: 'Picture 4: the ruin from above' },
  { name: 'limboStrip', eye: [534, 75, -120], look: [534, 0, -137], fov: 50, note: 'Picture 4 (purple arrow): the strip from above' },
  { name: 'limboSouth', eye: [440, 25, 30], look: [445, 0, -50], fov: 60, note: 'The ruin from the red soil south of it' },
];
