/**
 * Lokam Mini — Kochi Island Spawn Points
 * Standard spawn transforms for player, auto-rickshaw, and ferry boat.
 */

import type { SpawnPoint } from '../types';

export const KOCHI_SPAWN_POINTS: SpawnPoint[] = [
  {
    id: 'spawn_pier_default',
    name: 'Kochi Jetty Promenade (Default)',
    position: [0, 0.5, 12],
    rotation: [0, 0, 0],
    type: 'player',
  },
  {
    id: 'spawn_sarvam_theater',
    name: 'Sarvam Theater Plaza',
    position: [-6, 0.5, -24],
    rotation: [0, Math.PI * 0.5, 0],
    type: 'player',
  },
  {
    id: 'spawn_heritage_museum',
    name: 'Heritage Museum Gallery',
    position: [15, 0.5, -14],
    rotation: [0, -Math.PI * 0.5, 0],
    type: 'player',
  },
  {
    id: 'spawn_aazhi_stadium',
    name: 'Aazhi Stadium Gate',
    position: [18, 0.5, 20],
    rotation: [0, -Math.PI * 0.5, 0],
    type: 'player',
  },
  {
    id: 'spawn_cafe_rooftop',
    name: 'Cafe Rooftop Lounge',
    position: [-7, 0.5, 12],
    rotation: [0, Math.PI * 0.5, 0],
    type: 'player',
  },
  {
    id: 'spawn_paradise_mall',
    name: 'Paradise Mall Entrance',
    position: [-8, 0.5, 36],
    rotation: [0, Math.PI * 0.5, 0],
    type: 'player',
  },
  {
    id: 'spawn_ferry_berth',
    name: 'Vypin Ferry Terminal Berth',
    position: [0, 0.0, 45],
    rotation: [0, Math.PI, 0],
    type: 'boat',
  },
];
