// Comparison cameras for New Pent Block A (the owner's Block A brief and the Block A visual corrections report; preview
// views pa* in tools/preview/halls.html). Heights are above the ground. Matched by eye to the photographs, not surveyed.
export interface PaView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const PA_VIEWS: PaView[] = [
  { name: 'paFront', eye: [562.8, 1.6, -592], look: [562.5, 6.5, -627], fov: 52, note: 'view 2: the front elevation from the paver path' },
  { name: 'paFront34', eye: [546, 14, -584], look: [566, 7, -622], fov: 58, note: 'front three-quarter, the entrance and both front structures' },
  { name: 'paEndWall', eye: [560.5, 1.6, -600], look: [550, 6, -617], fov: 62, note: 'view 4: the west wing\'s brick end wall, the low-walled yard, the branch path' },
  { name: 'paJunction', eye: [571.4, 1.6, -604.0], look: [552, 5, -622], fov: 62, note: 'view 5: from beside the east front structure\'s west side, its columns on the left, across the court to the west wing\'s brick end wall (position estimated)' },
  { name: 'paSidePassage', eye: [578.5, 1.6, -617.9], look: [550, 2.5, -617.0], fov: 60, note: 'view 6: the grey walk across the porch front, from the corner by the east front structure' },
  { name: 'paCourtHigh', eye: [563, 26, -578], look: [563, 0, -608], fov: 60, note: 'view 1: the court from above the drive' },
  { name: 'paRoofs', eye: [565, 70, -740], look: [563, 0, -660], fov: 55, note: 'the roofs from the north, against the roof plan' },
  { name: 'paTop', eye: [563, 190, -622], look: [563, 0, -621.9], fov: 60, note: 'overhead (south at the top of the frame)' },
  { name: 'paCycle', eye: [563, 1.2, -566], look: [563, 3, -600], fov: 60, note: 'cycling height on the drive' },
];
