// Comparison cameras for the owner's IPS Road opposite UPSA reference pack (the nine stills and the 270° Street View
// recording; preview views ipso1 ... ipso7, ipsoTop in tools/preview/halls.html). Heights are above the ground. Placed
// from the recording's sequence (the panorama's point by the row's east end, the side street, the lay-by) and the
// mapped roads; approximate, not surveyed camera positions.
import type { LbView } from './lbviews';
const V = (name: string, eye: [number, number, number], look: [number, number, number], fov: number, note: string): LbView => ({ name, eye, look, fov, note });
export const IPSO_VIEWS: LbView[] = [
  V('ipso1', [2261, 1.6, -874], [2281, 6, -852], 62, 'Still 01 / recording start: Northill Heights on the corner past the side street'),
  V('ipso2', [2252, 1.6, -871], [2200, 6, -858], 62, 'Stills 02, 05: the long Prestige frontage from its east end'),
  V('ipso3', [2168, 1.6, -871], [2215, 7, -857], 62, 'Still 07: the Prestige frontage from its west end, its length and rhythm'),
  V('ipso4', [2210, 1.6, -873.5], [2210, 7.5, -862], 64, 'Still 04: the columned entrance bay'),
  V('ipso5', [2236, 1.6, -872], [2181, 14, -955], 62, 'Still 03 / recording end: across the road to the Abednego F. O. Amartey Towers'),
  V('ipso6', [2257, 1.6, -876], [2150, 3, -874], 60, 'Still 09 / recording middle: west along IPS Road, the shoulder, poles and wires'),
  V('ipso7', [2249, 1.6, -856], [2265, 5, -846], 62, 'Still 06: the frontage\'s east end and its paved forecourt'),
  V('ipsoTop', [2225, 150, -850], [2225, 0, -852], 55, 'Overhead check of the frontage, the side street and the towers across the road'),
];
