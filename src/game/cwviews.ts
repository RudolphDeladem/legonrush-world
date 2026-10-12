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
];
