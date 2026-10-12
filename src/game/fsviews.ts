// Comparison cameras for the owner's Legon Fire Station, Child Lab and E.A. Boateng Road brief (Pairs 1-14 and the
// aerial checks; preview views fs1 ... fs14, fsG1 ... fsG5, fsR1, fsR2, fsR3 in tools/preview/halls.html). Heights are
// above the ground. Placed from the arrows on the real aerials R1-R3 (tails as viewing zones, heads as directions) and
// tuned to the street photographs' framing; approximate, not surveyed camera positions.
import type { LbView } from './lbviews';
const V = (name: string, eye: [number, number, number], look: [number, number, number], fov: number, note: string): LbView => ({ name, eye, look, fov, note });
export const FS_VIEWS: LbView[] = [
  V('fs1', [556, 1.6, 138], [510, 3, 168], 58, 'Pair 1: from the avenue by E.A. Boateng Road, the veranda pavilion and the low wing behind it (R1 arrow 1)'),
  V('fs2', [582, 1.6, 137], [559, 2.5, 160], 58, 'Pair 2: the low long building\'s north end across the hedge (R1 arrow 2)'),
  V('fs3', [655.5, 1.6, 340.5], [661, 3, 357], 62, 'Pair 3: the station from the car park, the gable, tank, canopy and wall (R3 arrow 3)'),
  V('fs4', [646, 1.6, 335], [657, 2.5, 356], 66, 'Pair 4: the station entrance from the drive (R3 arrow 4)'),
  V('fs5', [657.5, 1.6, 335.6], [660, 2.6, 357], 64, 'Pair 5: the station across the low red railing (R3 arrow 5)'),
  V('fs6', [635.5, 1.6, 321.5], [652, 2.4, 311.5], 64, 'Pair 6: the low office and its hedged access by the car park (R3 arrow 6)'),
  V('fs7', [421, 1.6, 392], [421, 2.5, 376], 66, 'Pair 7: the CEDSA screen and gate from the forecourt (R2 arrow 7)'),
  V('fs8', [421, 1.6, 384], [421, 2.2, 377], 62, 'Pair 8: the CEDSA gate at close range (R2 arrow 8)'),
  V('fs9', [430, 1.6, 343], [430, 3, 356], 62, 'Pair 9: the CEGENSA gable end (R2 arrow 9)'),
  V('fs10', [416, 1.6, 343], [432, 2, 357], 64, 'Pair 10: across the stone court to the CEGENSA gable and its wings (R2 arrow 10)'),
  V('fs11', [445, 1.6, 350], [420, 2, 344], 64, 'Pair 11: the stone court, the planted border, the gable behind its shrubs (R2 arrow 11)'),
  V('fs12', [392, 1.6, 349.5], [418, 3, 322], 62, 'Pair 12: across the tall grass toward the long block and the parking (R2 arrow 12)'),
  V('fs13', [449, 1.6, 372], [432, 2.5, 360], 62, 'Pair 13: the CEGENSA sign by the path beside the low wing (R2 arrow 13)'),
  V('fs14', [620.5, 1.6, 350], [633.5, 3, 297], 60, 'Pair 14: north along La Road past the station frontage (R3 arrow 14)'),
  V('fsG1', [600, 70, 420], [650, 0, 345], 55, 'G1: the station from the south-west'),
  V('fsG2', [590, 70, 300], [650, 0, 360], 55, 'G2: the station from the north-west'),
  V('fsG3', [700, 70, 300], [645, 0, 360], 55, 'G3: the station from the north-east'),
  V('fsG4', [710, 70, 420], [645, 0, 345], 55, 'G4: the station from the south-east'),
  V('fsG5', [650, 90, 470], [645, 0, 340], 55, 'G5: the reverse overview from the south'),
  V('fsR1', [505, 170, 182], [505, 0, 180], 55, 'R1 check: the courtyard complex and the low long building from above'),
  V('fsR2', [422, 120, 352], [422, 0, 350], 55, 'R2 check: the compound in the bend from above'),
  V('fsR3', [655, 130, 352], [655, 0, 350], 55, 'R3 check: the station parcel from above'),
];
