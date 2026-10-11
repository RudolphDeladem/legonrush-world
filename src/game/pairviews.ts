// The thirty comparison cameras of the owner's 30-pair reconstruction brief (Geography frontage, the Legon Road
// underpass, the roadside plots, the Jones-Quartey Building), one per pair: Pair 01 ... Pair 30. Placed from the
// numbered blue arrows on the brief's five maps (A: pairs 1-7, B: 9-14, C: 15-22, D: 8 and 23-27, E: 28-30), the map
// pixels registered to the game frame by mapped landmarks (Map A: the Geography block and Mekki Abass Circle; B, C, D: the
// interchange ring and Mekki Abass Circle; E: the Jones-Quartey footprint), then matched by eye to each real photograph.
// They are approximate: no camera position was surveyed. Heights are above the ground under the eye and the target
// (so the trench views stand on the lowered road). Pair 16 and Pair 21 share one real photograph; their two camera
// positions follow the map's two arrows and stay unresolved.
export interface PairView { name: string; pair: number; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }

const P = (pair: number, eye: [number, number, number], look: [number, number, number], fov: number, note: string): PairView =>
  ({ name: `pair${String(pair).padStart(2, '0')}`, pair, eye, look, fov, note });

export const PAIR_VIEWS: PairView[] = [
  P(1, [416, 1.6, 116.5], [414.5, 3.0, 97], 50, 'Geography frontage from the road'),
  P(2, [376, 1.6, 111], [412, 2.6, 97], 60, 'oblique Geography approach and the department sign'),
  P(3, [487.2, 1.6, 78.6], [450, 1.8, 78.6], 72, 'the covered Geography corridor, looking west'),
  P(4, [414.5, 1.6, 109], [414.5, 2.8, 96], 64, 'frontal Geography entrance'),
  P(5, [401, 1.6, 106.5], [418, 2.6, 96], 60, 'Geography steps from the side'),
  P(6, [423, 1.6, 114], [414.5, 2.6, 96], 58, 'Geography entrance and full staircase'),
  P(7, [630, 15, 192], [598, 1.0, 168], 60, 'the low service compound near the junction (raised: the photograph is elevated)'),
  P(8, [760, 1.7, 103.5], [792, -2.5, 58], 66, 'the bridge and the circular junction, from the ring approaching the north bridge'),
  P(9, [757, 1.6, 168], [690, 2.0, 160], 60, 'the low frontage west across the planted strip'),
  P(10, [771, 1.6, 211], [725, 2.5, 278], 60, 'the planted strip with the speed sign'),
  P(11, [781, 1.6, 266], [721, 2.0, 358], 60, 'the tree-covered verge and low structure'),
  P(12, [789.5, 1.6, 314], [727, 2.0, 427], 60, 'the open earth clearing beneath the trees'),
  P(13, [755, 2.6, 118], [786, -2.5, 102], 72, 'the bridge opening from the west, over the ring\'s inner slope'),
  P(14, [752.6, 2.4, 64], [790, -5.5, 95], 66, 'the patterned retaining wall and the lowered road toward the bridge, over the west parapet'),
  P(15, [752.6, 2.3, 62], [900, 15, -70], 55, 'the distant commercial skyline over the road cut, from the west parapet'),
  P(16, [756.7, 2.3, -103], [690, 1.0, -105], 60, 'the low frontage west beyond the retaining wall, from the east parapet'),
  P(17, [717, 1.6, -140], [676, 4.0, -186], 60, 'the overgrown roadside edge with the masts'),
  P(18, [755.5, 1.6, 20], [764, 2.0, 100], 60, 'down the lowered road toward the bridge'),
  P(19, [751, 1.6, 10], [736, 2.0, -80], 60, 'the lowered road the other way'),
  P(20, [765, 1.6, -112], [840, 5.0, -165], 60, 'Legon City Mall across its forecourt'),
  P(21, [761.0, 2.3, -74], [700, 1.0, -80], 60, 'the low west frontage from the second arrow (same photograph as Pair 16)'),
  P(22, [782, 1.6, 30], [812, 2.0, 0], 60, 'the roadside shops on the east side'),
  P(23, [894, 1.6, 36], [849, 1.5, 21], 66, 'the earth verge and parking approach'),
  P(24, [880, 1.6, -1], [865, 1.5, 38], 66, 'the row of informal roadside stalls'),
  P(25, [824, 1.6, 112], [839, 2.0, 81], 60, 'the low buildings and parking beside the road'),
  P(26, [818, 1.6, 142], [836, 2.0, 185], 60, 'the same low compound obliquely'),
  P(27, [863, 1.6, 249], [865, 2.5, 214], 60, 'the end building and the bare-earth verge'),
  P(28, [538.5, 1.6, -7.5], [565, 7.0, -27], 62, 'the Jones-Quartey Building front and side'),
  P(29, [586.5, 1.6, -22], [586.5, 3.0, -32], 70, 'the Jones-Quartey exterior staircase'),
  P(30, [610, 1.6, -40], [597, 3.0, -92], 70, 'the Jones-Quartey side parking and grade'),
];
