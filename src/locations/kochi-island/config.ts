/**
 * Lokam Mini — Kochi Island Configuration
 * Boundary, ambient atmospheric settings, coastal water plane height.
 */

import type { LocationConfig } from '../types';

export const KOCHI_ISLAND_CONFIG: LocationConfig = {
  id: 'kochi-island',
  name: 'kochi-island',
  displayName: 'Fort Kochi Coastal Isle',
  bounds: {
    minX: -250,
    maxX: 250,
    minZ: -250,
    maxZ: 250,
  },
  lighting: {
    ambientColor: 0xfff5e6, // Warm tropical ambient
    ambientIntensity: 0.6,
    sunColor: 0xffeedd, // Bright coastal sun
    sunIntensity: 1.4,
    sunPosition: [80, 120, 60],
    fogColor: 0xbae6fd, // Soft coastal sea haze
    fogNear: 100,
    fogFar: 450,
  },
  waterLevel: 0.0,
};
