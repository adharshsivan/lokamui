/**
 * Lokam Mini — Shared Asset Manifest
 * Master registry of common assets shared globally across all game environments.
 * DO NOT duplicate these items in location-specific folders.
 */

import type { AssetDefinition } from '../types';

export const SHARED_ASSETS_MANIFEST: AssetDefinition[] = [
  // Vegetation
  {
    id: 'tree.coconut.01',
    category: 'vegetation',
    type: 'model',
    url: '/assets/shared/vegetation/coconut_01.glb',
    scope: 'global',
    preload: true,
  },
  {
    id: 'tree.coconut.02',
    category: 'vegetation',
    type: 'model',
    url: '/assets/shared/vegetation/coconut_02.glb',
    scope: 'global',
  },
  {
    id: 'tree.banyan.01',
    category: 'vegetation',
    type: 'model',
    url: '/assets/shared/vegetation/banyan_01.glb',
    scope: 'global',
  },
  {
    id: 'bush.tropical.01',
    category: 'vegetation',
    type: 'model',
    url: '/assets/shared/vegetation/bush_tropical_01.glb',
    scope: 'global',
  },

  // Street Furniture & Props
  {
    id: 'prop.bench.wood.01',
    category: 'prop',
    type: 'model',
    url: '/assets/shared/props/bench_wood_01.glb',
    scope: 'global',
    preload: true,
  },
  {
    id: 'prop.streetlight.colonial.01',
    category: 'street',
    type: 'model',
    url: '/assets/shared/props/streetlight_colonial_01.glb',
    scope: 'global',
  },
  {
    id: 'prop.sign.street.01',
    category: 'street',
    type: 'model',
    url: '/assets/shared/props/sign_street_01.glb',
    scope: 'global',
  },
  {
    id: 'prop.barrier.concrete.01',
    category: 'street',
    type: 'model',
    url: '/assets/shared/props/barrier_concrete_01.glb',
    scope: 'global',
  },
  {
    id: 'prop.chair.tea_stall.01',
    category: 'prop',
    type: 'model',
    url: '/assets/shared/props/chair_tea_stall_01.glb',
    scope: 'global',
  },

  // Locomotion Animations
  {
    id: 'animation.humanoid.walk',
    category: 'animation',
    type: 'animation',
    url: '/assets/shared/animations/humanoid_walk.glb',
    scope: 'global',
  },
  {
    id: 'animation.humanoid.idle',
    category: 'animation',
    type: 'animation',
    url: '/assets/shared/animations/humanoid_idle.glb',
    scope: 'global',
  },
  {
    id: 'animation.humanoid.sit',
    category: 'animation',
    type: 'animation',
    url: '/assets/shared/animations/humanoid_sit.glb',
    scope: 'global',
  },

  // Shared Audio
  {
    id: 'audio.ambient.ocean',
    category: 'audio',
    type: 'audio',
    url: '/assets/shared/audio/ocean_ambient.mp3',
    scope: 'global',
  },
  {
    id: 'audio.sfx.footstep.stone',
    category: 'audio',
    type: 'audio',
    url: '/assets/shared/audio/footstep_stone.mp3',
    scope: 'global',
  },
  {
    id: 'audio.sfx.ui.click',
    category: 'audio',
    type: 'audio',
    url: '/assets/shared/audio/ui_click.mp3',
    scope: 'global',
  },
];
