/**
 * Lokam Mini — Building Data Definitions
 * Declarative catalog for structures and interiors.
 */

import type { BuildingDefinition } from '../../buildings/types';

export const REGISTERED_BUILDINGS: BuildingDefinition[] = [
  {
    id: 'bld_heritage_colonial_01',
    name: 'Fort Kochi Heritage Mansion',
    exteriorAssetId: 'building.colonial.mansion.01',
    hasInterior: true,
    interiorAssetId: 'interior.colonial.parlor.01',
    doorPosition: [35, 0, -18],
  },
  {
    id: 'bld_tea_stall_01',
    name: 'Coastal Tea Stall',
    exteriorAssetId: 'building.tea_stall.01',
    hasInterior: false,
    doorPosition: [12, 0, -8],
  },
  {
    id: 'bld_ferry_terminal_01',
    name: 'Vypin Passenger Jetty Terminal',
    exteriorAssetId: 'building.ferry_terminal.01',
    hasInterior: true,
    interiorAssetId: 'interior.ferry_lounge.01',
    doorPosition: [0, 0, 36],
  },
];
