// Comparison cameras for the owner's Commonwealth Hall and Great Hall brief (pairs 1-7 on map M1; the elevated checks of
// the axis, the Great Hall and the stair sequence; preview views cw1 ... cw7, cwAxis, cwGreat, cwStairs in
// tools/preview/halls.html). Heights are above the ground. Placed from M1's arrows and matched by eye to the photographs;
// pair 1 is a raised photograph. Not surveyed camera positions.
export interface CwView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const CW_VIEWS: CwView[] = [
  { name: 'cw1', eye: [-468, 20, 108], look: [-494, 3, 127], fov: 58, note: 'the front entrance from above (pair 1)' },
  { name: 'cw2', eye: [-350, 1.7, 128], look: [-420, 7, 128], fov: 58, note: 'the gatehouses and the stairway from the road (pair 2)' },
  { name: 'cw3', eye: [-477, 1.6, 131], look: [-492, 4.5, 127.5], fov: 62, note: 'the entrance facade and the parking edge (pair 3)' },
  { name: 'cw4', eye: [-474, 1.6, 162], look: [-492, 4, 154], fov: 62, note: 'the pharmacy side wing (pair 4)' },
  { name: 'cw5', eye: [-346, 1.6, -121], look: [-380, 1.0, -72], fov: 62, note: 'J.K.M. Hodasi Road curving south-west by the Volta Hall Annex (pair 5)' },
  { name: 'cw6', eye: [-360, 1.6, -103], look: [-322, 3, -72], fov: 62, note: 'across the road to the trees and the screened Annex (pair 6)' },
  { name: 'cw7', eye: [-381, 1.6, -66], look: [-350, 1.5, -114], fov: 62, note: 'the same road the other way, north toward the bend (pair 7)' },
  { name: 'cwAxis', eye: [-420, 70, 128], look: [-760, 8, 128], fov: 50, note: 'the axis from Commonwealth up to the Great Hall (raised)' },
  { name: 'cwGreat', eye: [-950, 22, 170], look: [-1005, 12, 132], fov: 58, note: 'the Great Hall and its tower (raised)' },
  { name: 'cwStairs', eye: [-549, 9, 139], look: [-626, 0, 128], fov: 56, note: 'the flights and level walks through the courts, the statue (raised)' },
  // the owner's Commonwealth correction brief (Pictures 1-6): the overhead matched to Picture 6, the court and pharmacy
  // views of Pictures 1, 2 and 4, the close-ups of the connectors, the stone faces and the stairs
  { name: 'cwcTop', eye: [-615, 240, 112], look: [-615, 0, 111.9], fov: 50, note: 'the whole hall from above (Picture 6)' },
  { name: 'cwcP1', eye: [-606, 3.5, 222], look: [-606, 6, 150], fov: 62, note: 'the south range and its junctions from the slope (Picture 1)' },
  { name: 'cwcP1b', eye: [-560, 3.5, 128], look: [-640, 6, 128], fov: 62, note: 'the court and the crossbars from the first court (Picture 1)' },
  { name: 'cwcP2', eye: [-469, 1.7, 182], look: [-494, 5, 160], fov: 62, note: 'the pharmacy and the low link south of it (Picture 2)' },
  { name: 'cwcP3', eye: [-472, 14, 100], look: [-496, 5, 117], fov: 58, note: 'the low link north of the entrance from above (Picture 3)' },
  { name: 'cwcP4', eye: [-478, 1.7, 172], look: [-482, 3, 130], fov: 62, note: 'the drive past the pharmacy: stone faces, steps (Picture 4)' },
  { name: 'cwcP5', eye: [-481, 1.6, 147], look: [-491, 3, 136], fov: 58, note: 'the front terrace and the entrance steps close up (Picture 5)' },
  { name: 'cwcLinkD', eye: [-478, 6, 80], look: [-496, 4, 90], fov: 58, note: 'the link between the front north block and the lane (mark d)' },
  { name: 'cwcDining', eye: [-600, 14, 98], look: [-612, 4, 70], fov: 58, note: 'the dining hall, its wings and their links (marks a-c)' },
  { name: 'cwcChapel', eye: [-604, 9, 222], look: [-605, 4, 190], fov: 58, note: 'the chapel and its links to the crossbars (marks j, k)' },
  { name: 'cwcLibrary', eye: [-690, 10, 127], look: [-712, 4, 127], fov: 62, note: 'the end building and its links to the stubs (marks h, i)' },
  { name: 'cwcWin', eye: [-560, 4, 112], look: [-575, 6, 104], fov: 50, note: 'the timber windows close up (court side)' },
];
