// Comparison cameras along IPS Road from the UPSA junction to the UPSA Hostel (the owner's road-corridor and site
// briefs; preview views ips01 ... ips14 in tools/preview/halls.html). Heights are above the ground under the eye and
// the target. Placed against the mapped road, matched by eye to the briefs' photographs (named in each note); not
// surveyed camera positions.
export interface IpsView { name: string; eye: [number, number, number]; look: [number, number, number]; fov: number; note: string }
const V = (n: number, eye: [number, number, number], look: [number, number, number], fov: number, note: string): IpsView =>
  ({ name: `ips${String(n).padStart(2, '0')}`, eye, look, fov, note });
export const IPS_VIEWS: IpsView[] = [
  V(1, [1005, 1.7, -882], [1100, 1.6, -881], 60, 'leaving the UPSA junction east on IPS Road (R01-R04)'),
  V(2, [1180, 1.7, -884], [1300, 1.6, -884], 60, 'the median ending, the north sidewalk beginning'),
  V(3, [1300, 1.7, -885], [1420, 1.6, -885], 60, 'the old grey wall and the red-earth strip (R05, R06)'),
  V(4, [1450, 1.7, -886], [1570, 1.6, -886], 60, 'the old wall giving way to the white one (R07)'),
  V(5, [1600, 1.7, -887], [1720, 3, -878], 60, 'the white wall, the mesh fence, the hostels ahead (R08, R09, IMG-15)'),
  V(6, [1677, 1.7, -878.5], [1682, 8, -815], 62, 'the VCG office and the hostel from the strip (IMG-14)'),
  V(7, [1733, 1.7, -876], [1735, 14, -800], 60, 'the hostel front across the frontage road (IMG-04, R30)'),
  V(8, [1739, 1.7, -878], [1739, 2, -915], 62, 'the school\'s arched gate (IMG-02)'),
  V(9, [1683, 1.7, -856], [1680, 8, -820], 64, 'the VCG front over its zig-zag wall (IMG-05, IMG-09)'),
  V(10, [1745, 60, -905], [1740, 0, -805], 60, 'over the hostel and the VCG compound'),
  V(11, [1760, 1.7, -884], [1640, 1.6, -884], 60, 'back west along IPS Road'),
  V(12, [1500, 1.7, -891.5], [1600, 1.4, -891], 60, 'along the north sidewalk (R13-R19)'),
  V(13, [1560, 1.7, -874], [1660, 2, -872], 60, 'along the red-earth strip (R10-R12)'),
  V(14, [1800, 1.7, -875], [1790, 12, -820], 60, 'the hostel\'s east block (IMG-03)'),
];
