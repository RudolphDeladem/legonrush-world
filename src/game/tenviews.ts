// Comparison cameras for the owner's 10-pair brief (GCB Bank near Ernest Chemist, Legon City Mall and GMI Motors, the
// roadside strip and the stalls against the police station, the main gate, the Jones-Quartey Building's parking and
// the Finance Directorate, the overhead crossing; preview views ten01 ... ten10 in tools/preview/halls.html). Heights
// are above the ground under the eye and the target. Placed against the mapped roads and outlines and matched by eye to
// the brief's photographs; not surveyed camera positions.
export interface TenView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
const V = (n: number, eye: [number, number, number], look: [number, number, number], fov: number, note: string): TenView =>
  ({ name: `ten${String(n).padStart(2, '0')}`, eye, look, fov, note });
export const TEN_VIEWS: TenView[] = [
  V(1, [797, 1.6, -23], [832, 3.0, -23], 58, 'GCB Bank near Ernest Chemist across the service road'),
  V(2, [809, 1.6, 4], [846, 5.0, -44], 64, 'the bank\'s south-west corner, Legon City Mall behind'),
  V(3, [807, 1.6, -52], [870, 2.0, -86], 62, 'the open parcel behind the bank toward the mall'),
  V(4, [838, 1.6, -126], [846, 6.0, -220], 62, 'GMI Motors and Legon City Mall across the gravel lot'),
  V(5, [830, 1.6, 50], [832, 1.6, 18], 64, 'the roadside strip south of the bank'),
  V(6, [841, 1.6, 57.5], [843, 1.8, 84], 66, 'the stalls against the police station\'s north wall'),
  V(7, [712, 1.6, 180], [677, 3.5, 176], 60, 'the low frontage west of the main gate, approached from the police station side'),
  V(8, [604, 1.6, -44], [606, 5.0, -110], 64, 'the Jones-Quartey parking court toward the unfinished frame'),
  V(9, [743, 1.6, 112.4], [764, 0.2, 125], 66, 'the upper road curving round the splitter island at the overhead crossing'),
  V(10, [630.5, 1.6, -41], [646, 2.2, -52], 62, 'the Finance Directorate and its sign across La Road'),
  // the Legon City Mall and GM Motors correction brief (images 1, 3, 5 and the distant check from image 6)
  { name: 'mall1', eye: [834, 1.6, -168], look: [900, 11, -184], fov: 62, note: 'Legon City Mall across its paved forecourt (image 1)' },
  { name: 'mall3', eye: [781, 1.6, -130.3], look: [830, 1.0, -125.5], fov: 62, note: 'the lane to the mall and the roadside cluster on its right (image 3)' },
  { name: 'mall5', eye: [789, 1.6, -176], look: [803, 2.5, -212], fov: 62, note: 'GMI Motors, the circled building (image 5)' },
  { name: 'mall6', eye: [800, 1.6, -160], look: [832, 6, -222], fov: 62, note: 'GMI Motors, the low structure behind it and the mall (image 6)' },
];
