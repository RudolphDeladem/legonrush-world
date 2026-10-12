// Comparison cameras for the owner's UPSA Hostel to UPSA campus brief (Street View frames RW01-RW15; preview views upsa1
// ... upsa12 in tools/preview/halls.html). Heights are above the ground. Placed by matching the frames' viewpoints and
// headings along the mapped roads, not surveyed camera positions.
export interface UpsaView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
export const UPSA_VIEWS: UpsaView[] = [
  { name: 'upsa1', eye: [1745, 2, -862], look: [1850, 1.5, -870], fov: 60, note: 'out of the hostel road east along the frontage road (RW01-RW03)' },
  { name: 'upsa2', eye: [1840, 1.8, -886], look: [1940, 2, -890], fov: 60, note: 'east on IPS Road: the paver sidewalk and the blue hoarding on the left, the strip on the right (RW05, RW06)' },
  { name: 'upsa3', eye: [1870, 1.8, -866], look: [1960, 1.5, -862], fov: 60, note: 'the tower and the tyre stalls on the red earth (RW07)' },
  { name: 'upsa4', eye: [1900, 1.8, -868], look: [1960, 1, -850], fov: 60, note: 'the fork at the tower: the link bears right to Trinity Avenue (RW08)' },
  { name: 'upsa5', eye: [1940, 2, -869], look: [1976, 1, -873], fov: 60, note: 'the roundabout\'s island with its tree (RW09)' },
  { name: 'upsa6', eye: [1998, 1.8, -871], look: [2100, 6, -886], fov: 60, note: 'east on the south carriageway: the median, the red-earth verge, the towers ahead on the left (RW10)' },
  { name: 'upsa7', eye: [2110, 1.8, -877], look: [2181, 16, -955], fov: 60, note: 'the Abednego F. O. Amartey Towers over the hoarding (RW10, RW11)' },
  { name: 'upsa8', eye: [2150, 1.8, -877], look: [2240, 4, -866], fov: 60, note: 'the south side: the tower, the shop row and its lay-by (RW11-RW13)' },
  { name: 'upsa9', eye: [2291, 1.8, -888], look: [2291, 4, -915], fov: 60, note: 'the UPSA Main Gate from IPS Road' },
  { name: 'upsa10', eye: [2290, 1.8, -930], look: [2282, 2, -990], fov: 60, note: 'inside the gate, north on the campus road' },
  { name: 'upsa11', eye: [2370, 1.8, -1114.6], look: [2390, 3, -1114.7], fov: 60, note: 'the arrival: the academic core\'s entrance canopy' },
  { name: 'upsa12', eye: [2120, 140, -740], look: [2300, 0, -1010], fov: 55, note: 'raised over the route from the roundabout to the campus' },
];
