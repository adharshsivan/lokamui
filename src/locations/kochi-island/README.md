# Kochi Island Location Package

## Overview
Kochi Island is the debut exploration map for Lokam Mini, featuring:
- A coastal jetty promenade
- Historic Chinese fishing net observation deck
- Fort Kochi colonial heritage square
- Auto-rickshaw stand and Vypin ferry terminal

## File Architecture:
- `index.ts`: Package lifecycle implementation (`load`, `start`, `update`, `unload`).
- `config.ts`: Geographical bounds, sun/fog settings, water plane height.
- `environment.ts`: Three.js lighting, terrain meshes, coastal water plane.
- `spawn-points.ts`: Defined player, rickshaw, and boat spawn vectors.
- `interactions.ts`: Interactive trigger locations (seating, fast travel, dialogue).

## Asset Guidelines:
- Shared assets (coconut palms, teak benches, streetlights) must come from `AssetRegistry.get()`.
- Only unique heritage landmarks (such as bespoke Cheena Vala nets) may go in `public/assets/locations/kochi-island/`.
