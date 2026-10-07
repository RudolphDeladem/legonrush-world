// Every building modelled from photos as blocks (see blocks.ts), site by site.
import { banking } from './banking';
import { engineeringSite } from './engineering';
import { hostels } from './hostels';
import { vikingsLaw } from './vikingslaw';

export const BLOCK_SITES = [hostels, banking, vikingsLaw, engineeringSite];
