// Comparison cameras for the owner's Commonwealth west tennis court brief (tennisplan.ts; preview views tc* in
// tools/preview/halls.html). Heights are above the ground under the eye and the target. The game views of Pictures 9-11
// are matched by eye to the owner's screenshots; the court-level views of Pictures 1, 7 and 8 are placed inside the
// enclosure at a player's eye height (the video's exact camera spots and headings are not established).
export interface TcView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const TC_VIEWS: TcView[] = [
  { name: 'tcTop', eye: [-604.5, 175, -73], look: [-604.5, 0, -73.1], fov: 50, note: 'the clearing from above, north up (Picture 12)' },
  { name: 'tcAir', eye: [-560, 45, -10], look: [-606, 3, -72], fov: 55, note: 'the sunken terrace from above the road (drone view)' },
  { name: 'tc9', eye: [-575, 55, 5], look: [-612, 0, -70], fov: 60, note: 'the marked zone from above the road (Picture 9)' },
  { name: 'tc10', eye: [-596, 3.6, -18], look: [-614, 1.5, -72], fov: 62, note: 'from the road south of the courts (Picture 10)' },
  { name: 'tc11', eye: [-650, 3.4, -22], look: [-610, 1.5, -70], fov: 62, note: 'from the road further west (Picture 11)' },
  { name: 'tcP1', eye: [-624.2, 1.6, -88.5], look: [-634.5, 1.0, -57.5], fov: 62, note: 'the hard court across to the stepped wall and the lawn above it (Picture 1)' },
  { name: 'tcP7', eye: [-625.5, 1.5, -64], look: [-633, 1.2, -82], fov: 64, note: 'the net and the opposite half (Picture 7)' },
  { name: 'tcP8', eye: [-606, 1.6, -57.2], look: [-603, 1.4, -88], fov: 64, note: 'the red-soil courts, their nets and the mast (Picture 8)' },
  { name: 'tcWall', eye: [-646, 2.2, -62], look: [-636, 0, -70], fov: 58, note: 'the wall from the higher ground behind it' },
];
