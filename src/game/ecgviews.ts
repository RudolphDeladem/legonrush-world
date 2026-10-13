// Comparison cameras for the owner's ECG area correction brief (Pairs 1-18, the annotated aerials A01-A03; preview
// views ec* in tools/preview/halls.html). Heights are above the ground. Placed from the aerials' arrows and matched by
// eye to the street photographs, not surveyed camera positions.
import type { OkView } from './okviews';
export const EC_VIEWS: OkView[] = [
  { name: 'ecP01', eye: [781, 2.5, -252], look: [810, 3, -300], fov: 66, note: 'Pair 1: the utility corridor and rough open land east of the N4 (A01 arrows 1)' },
  { name: 'ecP02', eye: [752, 2.5, -256], look: [703, 3, -318], fov: 60, note: 'Pair 2: the blue fenced compound across the road (A01 arrow 2)' },
  { name: 'ecP03', eye: [758, 2.5, -300], look: [772, 2.5, -360], fov: 62, note: 'Pair 3: the highway planting and the low red-roof building (A01 arrow 3)' },
  { name: 'ecP04', eye: [778, 2.5, -365], look: [716, 4, -372], fov: 60, note: 'Pair 4: the ECG office and its pitched-roof neighbour across the planted highway (A01 arrow 4)' },
  { name: 'ecP05', eye: [770, 2.5, -380], look: [786, 2.5, -360], fov: 64, note: 'Pair 5: the low cream building and the fenced utility yard (A01 arrow 5)' },
  { name: 'ecP06', eye: [738, 2.5, -241], look: [722, 4, -325], fov: 58, note: 'Pair 6: the blue compound in the wider roadside landscape (A01 arrow 6)' },
  { name: 'ecP07', eye: [756, 2.5, -296], look: [748, 2, -380], fov: 62, note: 'Pair 7: north along the highway beside the concrete divider (A01 arrow 7)' },
  { name: 'ecP08', eye: [757, 2.5, -290], look: [752, 2, -360], fov: 62, note: 'Pair 8: the divider transition and the highway depth (A01 arrow 8)' },
  { name: 'ecP09', eye: [728, 2.5, -270], look: [705, 3, -318], fov: 66, note: 'Pair 9: the blue compound approach and the side road mouth (A02 arrow 9)' },
  { name: 'ecP10', eye: [726, 2.5, -318], look: [690, 4, -320], fov: 62, note: 'Pair 10: the blue-roof guardhouse and the stepped office (A02 arrow 10)' },
  { name: 'ecP11', eye: [725, 2.5, -330], look: [710, 8, -356], fov: 66, note: 'Pair 11: the tall white block behind the blue planted boundary (A02 arrows 11)' },
  { name: 'ecP12', eye: [748, 2.5, -380], look: [716, 5, -385], fov: 64, note: 'Pair 12: the ECG office and the pitched-roof neighbour (A03 arrows 12)' },
  { name: 'ecP13', eye: [735, 2.5, -385], look: [712, 6, -368], fov: 62, note: 'Pair 13: the ECG glazed office close (A03 arrow 13)' },
  { name: 'ecP14', eye: [740, 2.5, -408], look: [714, 5, -410], fov: 62, note: 'Pair 14: the pitched-roof building and its small entrance structures (A03 arrows 14)' },
  { name: 'ecP15', eye: [760, 2.5, -460], look: [730, 2.5, -470], fov: 66, note: 'Pair 15: the side access and the roadside trading frontage (A03 arrows 15)' },
  { name: 'ecP16', eye: [770, 2.5, -486], look: [743, 2, -466], fov: 64, note: 'Pair 16: the canopies, kiosks, soil and the roadside pavement (A03 arrow 16)' },
  { name: 'ecP17', eye: [770, 2.5, -440], look: [742, 3, -458], fov: 64, note: 'Pair 17: the roadside stalls and the older white blocks (A03 arrow 17)' },
  { name: 'ecP18', eye: [711, 2.5, -284], look: [705, 3, -320], fov: 66, note: 'Pair 18: the blue compound approach checked from the second set (A02 arrows 18)' },
  { name: 'ecTopN', eye: [730, 200, -440], look: [730, 0, -439.9], fov: 50, note: 'overhead: the stalls, the pitched-roof building, the ECG office (A03)' },
  { name: 'ecTopS', eye: [730, 200, -320], look: [730, 0, -319.9], fov: 50, note: 'overhead: the blue compound, the divider, the substation, the utility corridor (A01, A02)' },
];
