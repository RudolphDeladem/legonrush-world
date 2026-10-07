// Representative destination journeys across Legon, checked by scripts/route-tests.mjs and
// listed in the geography inspector (/geo/) so they can be ridden from above.
// maxLength: a generous ceiling (metres) for the ride; a detour beyond it means routing went wrong.

export interface RouteCheck {
  from: string;
  to: string;
  maxLength: number;
  /** what the way should look like, in words */
  expect: string;
}

export const ROUTE_CHECKS: RouteCheck[] = [
  { from: 'Legon Main Entrance', to: 'University Square', maxLength: 900, expect: 'In through the Main Gate and west along the avenue to the square at the fountain.' },
  { from: 'Mensah Sarbah Hall', to: 'Great Hall', maxLength: 2300, expect: 'Out of the Sarbah porters\' lodge drive, north to the avenue and up Legon Hill to the Convocation courtyard.' },
  { from: 'University of Ghana Business School', to: 'University Square', maxLength: 700, expect: 'From the UGBS car park round to the square on the avenue.' },
  { from: 'Night Market', to: 'Legon Main Entrance', maxLength: 2200, expect: 'North from the market past the halls to the avenue and east to the Main Gate.' },
  { from: 'Legon Main Entrance', to: 'The Balme Library', maxLength: 900, expect: 'In through the Main Gate, west along the avenue, ending on the forecourt road in front of the library (south side, facing the fountain).' },
  { from: 'Legon Main Entrance', to: 'Great Hall', maxLength: 2300, expect: 'The avenue west past the Balme fountain and Commonwealth Hall, up the axial road on Legon Hill to its loop, then on foot across the Convocation courtyard to the Great Hall\'s east front.' },
  { from: 'The Balme Library', to: 'University Square', maxLength: 150, expect: 'Out of the library front straight onto the square: a few dozen metres.' },
  { from: 'University Square', to: 'Night Market', maxLength: 1400, expect: 'South across the avenue past the halls to the market frontage on Jubilee Link.' },
  { from: 'Great Hall', to: 'University of Ghana banking square', maxLength: 2400, expect: 'Down Legon Hill and south to the Banking Square car park, arriving facing the banks.' },
  { from: 'School of Engineering Sciences', to: 'The Balme Library', maxLength: 1000, expect: 'From the engineering school to the library front, not the road behind it.' },
  { from: 'Commonwealth Hall', to: 'Great Hall', maxLength: 1200, expect: 'From the hall up the axial road to the Convocation courtyard and the Great Hall\'s east front.' },
  { from: 'Akuafo Hall Main', to: 'Night Market', maxLength: 1100, expect: 'Out of the Akuafo gatehouse forecourt onto the avenue, then south past Sarbah and Valco to the north end of the market.' },
  { from: 'University of Ghana Botanical Gardens', to: 'University Square', maxLength: 2600, expect: 'Out of the gardens by their main entrance road, through the gardens on the paved drive, not the woodland trails.' },
  { from: 'Mensah Sarbah Hall', to: 'Central Cafeteria, CC', maxLength: 300, expect: 'From the Sarbah porters\' lodge to the CC right in front of it.' },
  { from: 'Volta Hall', to: 'The Balme Library', maxLength: 600, expect: 'A short ride east to the library front.' },
  { from: 'Legon Main Entrance', to: 'University of Ghana Sports Stadium', maxLength: 2200, expect: 'Through campus to the stadium in the south-east.' },
  { from: 'International Students Hostel 1, ISH 1', to: 'Night Market', maxLength: 600, expect: 'The hostel and the market are neighbours.' },
  { from: 'Elizabeth Frances Sey Hall', to: 'Jones Quartey Building, JQB', maxLength: 3200, expect: 'From the southern halls (leaving by the Sey frontage) north to JQB by the Main Gate.' },
];
