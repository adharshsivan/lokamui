# Lokam Mini — Asset Pipeline & Shared Asset Rules

## 1. Golden Rule of Assets
**Never duplicate an asset across locations.**
Every common object (coconut palms, road signs, park benches, asphalt textures, humanoid animations) must reside in `/public/assets/shared/` and be referenced using a **stable identifier**.

---

## 2. Stable Asset Identifiers
The `AssetRegistry` matches dot-separated keys to file paths, formats, and caching policies.

```
<category>.<subcategory>.<variant>.<index>
```

### Standard ID Examples:
- `tree.coconut.01` -> `/assets/shared/vegetation/coconut_01.glb`
- `tree.banyan.01` -> `/assets/shared/vegetation/banyan_01.glb`
- `prop.bench.wood.01` -> `/assets/shared/props/bench_wood_01.glb`
- `prop.streetlight.colonial.01` -> `/assets/shared/props/streetlight_colonial_01.glb`
- `material.wall.plaster.white` -> Shared Material definition
- `material.road.asphalt` -> Shared Material definition
- `animation.humanoid.walk` -> `/assets/shared/animations/walk.glb`
- `audio.ambient.ocean` -> `/assets/shared/audio/ocean_ambient.mp3`

---

## 3. Reusable Material Families
Buildings and props must reuse shared materials. Instantiating unique materials for every individual wall or structure is forbidden.

### Core Shared Material Families:
1. `wall.plaster.white` - White coastal stucco/plaster
2. `wall.plaster.warm` - Ochre/warm terracotta tinted plaster
3. `roof.terracotta` - Red clay Mangalore/Kerala roofing tile
4. `concrete.clean` - Pavement, walkways, foundation plinths
5. `wood.dark` - Teak wood railings, door frames, timber beams
6. `metal.paint` - Coated iron gates, railings, lamps
7. `glass.standard` - Architectural window panes
8. `road.asphalt` - Weathered street asphalt
9. `ground.dirt` - Compacted soil and pathways
10. `ground.grass` - Tropical coastal foliage & turf

---

## 4. Asset Manifest Structure
Manifests define assets declaratively:

```ts
export interface AssetEntry {
  id: string;
  type: 'model' | 'texture' | 'audio' | 'material' | 'animation';
  url: string;
  scope: 'global' | `location:${string}`;
  sizeBytes?: number;
  preload?: boolean;
}
```

- **Global Scope:** Retained in memory across location transitions (trees, core props, avatar animations).
- **Location Scope:** Released and garbage-collected when the player leaves the location.

---

## 5. Mobile Asset Constraints
- **Polycount:** Props < 800 polys. Buildings < 3,000 polys. Characters < 5,000 polys.
- **Textures:** Max 1024x1024 for hero assets; 512x512 for standard props. Atlasing preferred.
- **File Formats:** GLB (binary glTF) with DRACO or Meshopt compression.
- **Audio:** Compressed MP3 or OGG, streamed for ambient music, pre-buffered for sound effects.
