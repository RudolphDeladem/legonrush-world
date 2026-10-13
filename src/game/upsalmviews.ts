// Comparison cameras for the owner's UPSA landmark pack (LEGONRUSH_UPSA_Landmark_Reconstruction_Brief; preview views
// upsl1 ... upsl11, upslTop in tools/preview/halls.html). Heights are above the ground. Placed to match the pack's
// photographs (G-01 ... G-04, the KOKA and court views, REF A-01, REF L-01) along the mapped roads and walks; approximate,
// not surveyed camera positions.
import type { LbView } from './lbviews';
const V = (name: string, eye: [number, number, number], look: [number, number, number], fov: number, note: string): LbView => ({ name, eye, look, fov, note });
export const UPSL_VIEWS: LbView[] = [
  V('upsl1', [2297, 1.7, -884], [2289, 6.5, -913], 62, 'G-01: the Main Entrance from IPS Road, the arch on the left, the tiled block on the right'),
  V('upsl2', [2306, 1.7, -893], [2284, 4.5, -912], 62, 'G-02: three-quarter view, the sweeping edge, the ramp and its rails, the paved apron'),
  V('upsl3', [2279, 1.6, -900], [2283, 4.5, -910], 62, 'G-03: the foot of the arch, the planting bed, the crest'),
  V('upsl4', [2289, 1.7, -936], [2291, 5.5, -912], 62, 'The Main Entrance from the campus side'),
  V('upsl5', [2302, 1.7, -1096], [2372, 12, -1170], 62, 'KOKA wide: the fountain on the left, the walks and benches, the curved blue glass'),
  V('upsl6', [2306, 1.7, -1094], [2372, 9, -1132], 74, 'The court: the fountain, KOKA on the left, the Justice Aryeetey Building on the right'),
  V('upsl7', [2376, 1.7, -1141], [2376, 11, -1170], 64, 'KOKA close: the glass curtain wall, the dark-column entrance'),
  V('upsl8', [2348, 4, -1078], [2405, 9, -1122], 64, 'REF J-01 / image 9: KOKA on the left, the Justice Aryeetey Building on the right'),
  V('upsl9', [2318, 1.7, -969], [2356, 8.5, -969], 62, 'REF A-01: the Opoku Ampomah Building / Central Administration from its car park'),
  V('upsl10', [2425, 3, -1066], [2412, 12, -1052], 70, 'REF L-01: the Joshua Alabi Library\'s central bay and wings'),
  V('upsl11', [2296, 1.7, -931], [2246, 16, -951], 62, 'The Abednego F. O. Amartey Twin Towers from inside the gate'),
  V('upslTop', [2350, 280, -1060], [2350, 0, -1062], 55, 'Overhead check of the gate, KOKA, the court, the core, the Administration and the Library'),
];
