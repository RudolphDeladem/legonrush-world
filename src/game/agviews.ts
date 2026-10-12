// Comparison cameras for the owner's 16-pair brief (the Agriculture side south of Dr J.B. Danquah Avenue: the long east
// block by E.A. Boateng Road, the Child Study Centre, the colonnade of the Department of Agriculture Economics and
// Agribusiness, the Biotechnology Centre, the West Africa Centre for Crop Improvement building, the low roadside group,
// the Akuafo Road junction and frontage; preview views ag01 ... ag16 in tools/preview/halls.html). Placed from the
// brief's numbered arrows (the annotated aerial registered to the game by E.A. Boateng, Onyaa and Akuafo Roads) and
// matched by eye to each photograph; heights are above the ground. Pairs 1, 10 and 13 are drone photographs (raised).
export interface AgView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
const V = (n: number, eye: [number, number, number], look: [number, number, number], fov: number, note: string): AgView =>
  ({ name: `ag${String(n).padStart(2, '0')}`, eye, look, fov, note });
export const AG_VIEWS: AgView[] = [
  V(1, [503, 24, 196], [548, 2, 232], 55, 'the long east block from the air, north-west (drone)'),
  V(2, [618, 1.6, 199], [590, 3.5, 224], 62, 'the east block\'s east end and its hardstand'),
  V(3, [612, 1.6, 236], [594, 3.0, 230], 64, 'the east end\'s entrances and service frontage'),
  V(4, [601, 1.6, 209.5], [545, 3.0, 213.5], 58, 'back along the north side from the road to its east'),
  V(5, [427, 1.6, 268.5], [426, 1.2, 300], 62, 'the Child Study Centre through its mesh gate'),
  V(6, [392, 1.6, 258.5], [401, 2.2, 238], 62, 'the colonnade of Agriculture Economics and Agribusiness'),
  V(7, [419, 1.6, 266.8], [376, 3.0, 297], 58, 'the Biotechnology Centre from the road'),
  V(8, [368, 1.6, 283.5], [368, 4.5, 300], 62, 'the Biotechnology Centre\'s signed gable'),
  V(9, [358, 1.6, 291], [367, 4.0, 299], 64, 'the gable close, its sign, AC units and pruned trees'),
  V(10, [262, 32, 262], [298, 3, 300], 55, 'the WACCI building and its neighbours (drone)'),
  V(11, [300, 1.8, 267], [300, 7.0, 300], 62, 'the WACCI building\'s front across its parking'),
  V(12, [279, 1.6, 271], [305, 6.0, 295], 62, 'the front obliquely across the forecourt'),
  V(13, [298, 30, 352], [298, 4, 305], 58, 'the rear and the service yard (drone)'),
  V(14, [240, 1.6, 276], [262, 2.5, 284], 62, 'the low roadside group and the big tree'),
  V(15, [241, 1.6, 271], [246, 1.5, 245], 64, 'the Akuafo Road junction with Onyaa Road'),
  V(16, [231.5, 1.6, 145], [236, 1.5, 215], 60, 'Akuafo Road south from Danquah Avenue'),
];
