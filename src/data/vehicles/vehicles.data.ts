/**
 * Lokam Mini — Vehicle Data Definitions
 */

import type { VehicleDefinition } from '../../vehicles/types';

export const REGISTERED_VEHICLES: VehicleDefinition[] = [
  {
    id: 'veh_rickshaw_yellow_01',
    name: 'Kerala Auto Rickshaw',
    category: 'auto_rickshaw',
    assetId: 'vehicle.rickshaw.classic.01',
    maxSpeed: 14.0,
    acceleration: 6.0,
    seats: 3,
  },
  {
    id: 'veh_ferry_boat_01',
    name: 'State Water Transport Ferry',
    category: 'boat',
    assetId: 'vehicle.boat.ferry.01',
    maxSpeed: 8.0,
    acceleration: 2.0,
    seats: 12,
  },
  {
    id: 'veh_bicycle_roadster_01',
    name: 'Atlas Traditional Bicycle',
    category: 'bicycle',
    assetId: 'vehicle.bicycle.atlas.01',
    maxSpeed: 7.0,
    acceleration: 4.0,
    seats: 1,
  },
];
