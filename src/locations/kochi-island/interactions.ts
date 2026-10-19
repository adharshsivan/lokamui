/**
 * Lokam Mini — Kochi Island Interactions
 * Interactive world triggers (seating, viewpoints, fast travel ferry, heritage plaques).
 */

import type { InteractionPoint } from '../types';

export const KOCHI_INTERACTIONS: InteractionPoint[] = [
  {
    id: 'poi_sarvam_theater',
    type: 'inspect',
    position: [-4.2, 0.5, -25],
    radius: 3.5,
    label: 'Enter Sarvam Theater (Cinematic Premiere)',
    data: {
      landmark: 'Sarvam Theater',
      category: 'Cinema & Performing Arts',
    },
  },
  {
    id: 'poi_heritage_museum',
    type: 'inspect',
    position: [3.8, 0.5, -15],
    radius: 3.5,
    label: 'Explore Heritage Museum (Colonial Art Gallery)',
    data: {
      landmark: 'Heritage Museum',
      category: 'Art & Cultural Heritage',
    },
  },
  {
    id: 'poi_aazhi_stadium',
    type: 'inspect',
    position: [3.8, 0.5, 20],
    radius: 3.5,
    label: 'Enter Aazhi Stadium (Coastal Sports Arena)',
    data: {
      landmark: 'Aazhi Stadium',
      category: 'Sports Arena',
    },
  },
  {
    id: 'poi_cafe_rooftop',
    type: 'seating',
    position: [-3.5, 0.5, 12],
    radius: 3.5,
    label: 'Relax at Cafe Rooftop (Ocean Vista Lounge)',
    data: {
      landmark: 'Cafe Rooftop',
      category: 'Skyline Cafe & Lounge',
    },
  },
  {
    id: 'poi_paradise_mall',
    type: 'inspect',
    position: [-4.2, 0.5, 38],
    radius: 3.5,
    label: 'Shop at Paradise Mall (Coastal Galleria)',
    data: {
      landmark: 'Paradise Mall',
      category: 'Luxury Shopping & Arcade',
    },
  },
  {
    id: 'poi_chinese_nets',
    type: 'inspect',
    position: [-25, 0.5, 30],
    radius: 3.5,
    label: 'Observe Historic Chinese Fishing Nets',
    data: {
      landmark: 'Cheena Vala (Chinese Fishing Nets)',
      period: '14th Century Heritage',
    },
  },
  {
    id: 'bench_promenade_01',
    type: 'seating',
    position: [5, 0.5, 10],
    radius: 1.8,
    label: 'Sit on Teak Promenade Bench',
    data: {
      seatIndex: 0,
      facingAngle: Math.PI,
    },
  },
  {
    id: 'ferry_fast_travel',
    type: 'fast_travel',
    position: [0, 0.5, 40],
    radius: 3.0,
    label: 'Board Ferry to Ernakulam Mainland',
    data: {
      targetDestination: 'ernakulam-mainland',
    },
  },
];
