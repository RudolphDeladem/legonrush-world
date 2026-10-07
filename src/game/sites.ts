// Every building modelled from photos as blocks (see blocks.ts), site by site.
import { banking } from './banking';
import { commonwealth } from './commonwealth';
import { domeHouse } from './dome';
import { engineeringSite } from './engineering';
import { greatHalls } from './greathalls';
import { hostels } from './hostels';
import { pentagon } from './pentagon';
import { vikingsLaw } from './vikingslaw';
import { volta } from './volta';

export const BLOCK_SITES = [hostels, banking, vikingsLaw, engineeringSite, domeHouse, pentagon, commonwealth, volta, greatHalls];
