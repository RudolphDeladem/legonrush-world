// Comparison cameras for the owner's Bani Hostel, PRESEC and IPS Road brief (Bani_PRESEC_IPS_Detailed_Claude_Brief: 20
// pairs, R1-R4, G1; preview views bpi1 ... bpi20, the branches bpi3b, bpi7b, bpi9b, bpi10b, bpi20b, the overhead checks
// bpiR1 ... bpiR4, bpiG1 in tools/preview/halls.html). Heights are above the ground. Each camera stands at the tail of its
// pair's arrow on the owner's aerial, fitted to the game map by the mapped roads and outlines, and looks along the
// arrow's head; approximate, not surveyed camera positions (Street View's camera rides about 2.4 m up).
import type { LbView } from './lbviews';
const V = (name: string, eye: [number, number, number], look: [number, number, number], fov: number, note: string): LbView => ({ name, eye, look, fov, note });
export const BPI_VIEWS: LbView[] = [
  V('bpi1', [824, 2.4, -584], [772, 4, -612], 70, 'Pair 1 (R2): the Shell pylon in front, the canopy behind, the service row farther back'),
  V('bpi2', [816, 2.4, -592], [800, 4, -640], 70, 'Pair 2 (R2): the near palm, the skeletal billboard frame, the open parcel'),
  V('bpi3', [834, 2.4, -634], [858, 4, -702], 70, 'Pair 3 (R2): along the road past the open scrub, the lattice support, the advertising'),
  V('bpi3b', [834, 2.4, -634], [735, 4, -681], 70, 'Pair 3, second branch (R2): west across the scrub'),
  V('bpi4', [861, 2.4, -686], [763, 5, -694], 70, 'Pair 4 (R2): across the strip and the scrub to the distant red-roofed blocks'),
  V('bpi5', [886, 2.4, -757], [795, 5, -725], 70, 'Pair 5 (R2): the billboard edge-on, the exposed soil, the same roof group'),
  V('bpi6', [851, 2.4, -649], [892, 5, -742], 70, 'Pair 6 (R2): north toward the signals, the billboards, the UGBS block at the right'),
  V('bpi6b', [851, 2.4, -649], [942, 5, -718], 70, 'Pair 6, second branch (R2): north-east across the road'),
  V('bpi7', [915, 2.4, -829], [934, 5, -890], 70, 'Pair 7 (R1): the signalised approach to the IPS Road junction'),
  V('bpi7b', [915, 2.4, -829], [968, 3, -862], 70, 'Pair 7, second branch (R1): toward the corner south of IPS Road'),
  V('bpi8', [968, 2.4, -938], [990, 2, -900], 70, 'Pair 8 (R3): the corner: drain, crossing slab, cabinets, the exposed frame'),
  V('bpi9', [966, 2.4, -952], [1040, 4, -957], 70, 'Pair 9 (R3): east to GOIL across the roadside trading ground'),
  V('bpi9b', [966, 2.4, -952], [990, 2, -910], 70, 'Pair 9, second branch (R3): south-east along the corner'),
  V('bpi10', [966, 2.4, -978], [972, 5, -1030], 70, 'Pair 10 (R3): north along the east side, the concrete shelter at the right'),
  V('bpi10b', [966, 2.4, -978], [985, 4, -1005], 70, 'Pair 10, second branch (R3): north-east toward the shelter'),
  V('bpi11', [996, 2.4, -1088], [998, 6, -1150], 70, 'Pair 11 (R4): the signal approach, PRESEC\'s wall and trees at the right'),
  V('bpi12', [1012, 2.4, -1150], [1042, 3, -1172], 70, 'Pair 12 (R4): the curved approach to the PRESEC gate, the stone edge'),
  V('bpi13', [1018, 2.4, -1173], [1052, 4, -1171], 66, 'Pair 13 (R4): the PRESEC gateway and the lettered walls'),
  V('bpi14', [1018, 2.4, -1176], [1040, 4, -1240], 70, 'Pair 14 (R4): along the school wall north of the gate'),
  V('bpi15', [988, 2.4, -1162], [920, 9, -1222], 70, 'Pair 15 (R4): the cream Bani block behind the median trees'),
  V('bpi16', [992, 2.4, -1183], [930, 6, -1235], 70, 'Pair 16 (R4): the side-road mouth, the shaded corner, the billboard'),
  V('bpi17', [985, 2.4, -1197], [900, 3, -1198], 70, 'Pair 17 (R4): into the side road opposite PRESEC'),
  V('bpi18', [1000, 2.4, -1172], [925, 8, -1220], 70, 'Pair 18 (R4): the taller cream block and the side-road mouth'),
  V('bpi19', [937, 2.4, -1196], [860, 6, -1206], 70, 'Pair 19 (R4): along the Bani street, the low wall, the peach block'),
  V('bpi20', [996, 2.4, -1093], [978, 5, -1150], 70, 'Pair 20 (R4): the signal arm, the roadside shops, the blocks behind'),
  V('bpi20b', [996, 2.4, -1093], [1004, 5, -1155], 70, 'Pair 20, second branch (R4)'),
  V('bpiR1', [935, 160, -880], [935, 0, -882], 50, 'Overhead check aligned to R1: the IPS Road junction'),
  V('bpiR2', [840, 260, -700], [840, 0, -702], 55, 'Overhead check aligned to R2: Shell, the open parcels, the UGBS side'),
  V('bpiR3', [990, 170, -935], [990, 0, -937], 50, 'Overhead check aligned to R3: GOIL and the corner'),
  V('bpiR4', [900, 260, -1210], [900, 0, -1212], 55, 'Overhead check aligned to R4: Bani, the side road, PRESEC\'s gate'),
  V('bpiG1', [880, 620, -930], [880, 0, -932], 60, 'Overhead of the whole section, for the G1 coverage check'),
];
