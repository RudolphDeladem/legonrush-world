// Comparison cameras for the owner's Crop Improvement and Agriculture Precinct brief (pictures 1, 2, 4, 6, 7 and a raised
// view near picture 9; preview views crop1 ... crop9 in tools/preview/halls.html). Heights are above the ground. Placed
// by matching the game screenshots in the brief, not surveyed camera positions.
export interface CropView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const CROP_VIEWS: CropView[] = [
  { name: 'crop1', eye: [478, 1.8, 272], look: [430, 3, 292], fov: 62, note: 'the two-storey block by the Child Study Centre among the low red-based buildings (picture 1)' },
  { name: 'crop2', eye: [300, 1.8, 266], look: [345, 4, 286], fov: 62, note: 'east along the WACCI forecourt to the low group beyond the carport (picture 2)' },
  { name: 'crop4', eye: [300, 1.8, 345], look: [320, 4, 300], fov: 62, note: 'behind WACCI: the rear annex and the tanks (picture 4)' },
  { name: 'crop6', eye: [350, 1.8, 262], look: [320, 4, 215], fov: 62, note: 'from Onyaa Road north-west into the department group (picture 6)' },
  { name: 'crop7', eye: [395, 1.8, 265], look: [350, 4, 215], fov: 62, note: 'from Onyaa Road north-west, farther east (picture 7)' },
  { name: 'crop9', eye: [300, 45, 350], look: [335, 0, 215], fov: 55, note: 'raised beyond WACCI over the group (near picture 9)' },
];
