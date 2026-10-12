// Comparison cameras for the owner's Legon Road and La Bawaleshie brief (Pairs 1-19 and the aerial references; preview
// views lb1 ... lb19, lbRef5, lbRef6, lbTop in tools/preview/halls.html). Heights are above the ground. Placed from the
// annotated aerial's arrows (Additional References 1 and 3) and the street photographs, not surveyed camera positions.
export interface LbView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const LB_VIEWS: LbView[] = [
  { name: 'lb1', eye: [962, 1.8, 1003], look: [1012, 6, 1030], fov: 60, note: 'Pair 1: across the median from the southbound carriageway to the beige block with its dark face and the mast' },
  { name: 'lb2', eye: [956, 1.8, 975], look: [1000, 5, 1060], fov: 60, note: 'Pair 2: south along the southbound carriageway, the east frontage on the left' },
  { name: 'lb3', eye: [943, 1.8, 1005], look: [915, 3, 930], fov: 60, note: 'Pair 3: the scrub west of the N4 north of the junction' },
  { name: 'lb4', eye: [957, 1.8, 1015], look: [1005, 5, 1110], fov: 60, note: 'Pair 4: south toward the junction, the cream-and-orange block on the east side' },
  { name: 'lb5', eye: [990, 1.8, 1190], look: [900, 6, 1300], fov: 60, note: 'Pair 5: from the median north of the junction toward the stadium' },
  { name: 'lb6', eye: [999, 1.8, 1206], look: [880, 8, 1290], fov: 60, note: 'Pair 6: the stadium across the junction, the signal posts and the cabinet' },
  { name: 'lb7', eye: [985, 1.8, 1185], look: [915, 6, 1265], fov: 60, note: 'Pair 7: the turn toward the stadium junction' },
  { name: 'lb8', eye: [990, 1.8, 1385], look: [820, 8, 1400], fov: 60, note: 'Pair 8: the stadium side elevation behind the fence and the verge' },
  { name: 'lb9', eye: [992, 1.8, 1235], look: [1015, 4, 1420], fov: 60, note: 'Pair 9: south along the divided road' },
  { name: 'lb10', eye: [1012, 1.8, 1245], look: [1000, 3, 1190], fov: 60, note: 'Pair 10: the junction, its signal posts and turn markings' },
  { name: 'lb11', eye: [998, 1.8, 1222], look: [1060, 5, 1185], fov: 60, note: 'Pair 11: the opposite frontage at the junction (the low yellow frontage, the beige mass behind)' },
  { name: 'lb12', eye: [960, 1.8, 1265], look: [1050, 5, 1252], fov: 60, note: 'Pair 12: across the N4 to the retail corner south-east of the junction' },
  { name: 'lb13', eye: [1012, 1.8, 1300], look: [1030, 4, 1470], fov: 60, note: 'Pair 13: south along the highway and median' },
  { name: 'lb14', eye: [1003, 1.8, 1340], look: [870, 8, 1395], fov: 60, note: 'Pair 14: the stadium through the empty billboard frame and the lattice mast' },
  { name: 'lb15', eye: [1035, 1.8, 1525], look: [1080, 4, 1475], fov: 60, note: 'Pair 15: the commercial frontage from the shared 15-16 position' },
  { name: 'lb16', eye: [1035, 1.8, 1525], look: [1090, 4, 1520], fov: 60, note: 'Pair 16: the adjoining frontage from the same position (the green gable-front, the red-trimmed building)' },
  { name: 'lb17', eye: [1020, 1.8, 1214], look: [1070, 3, 1195], fov: 60, note: 'Pair 17: La Bawaleshie mouth toward the low yellow frontage' },
  { name: 'lb18', eye: [1018, 1.8, 1210], look: [1110, 3, 1205], fov: 60, note: 'Pair 18: along La Bawaleshie Road' },
  { name: 'lb19', eye: [1012, 1.8, 1220], look: [1080, 3, 1232], fov: 60, note: 'Pair 19: the corner shop block south of La Bawaleshie Road' },
  { name: 'lbRef5', eye: [1100, 70, 1470], look: [1075, 0, 1380], fov: 60, note: 'Additional Reference 5: the neighbourhood from above the Diamed outline, looking north-west' },
  { name: 'lbTop', eye: [1000, 560, 1260], look: [1000, 0, 1259], fov: 60, note: 'Additional Reference 1: straight down over the junction and the stadium, north up' },
  { name: 'lbRef6', eye: [1140, 75, 1460], look: [1080, 0, 1385], fov: 60, note: 'Additional Reference 6: the neighbourhood from above, a second oblique' },
];
