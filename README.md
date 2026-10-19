# Lokam Mini

> **A lightweight, modular multiplayer third-person exploration game built for Web & Mobile.**

Lokam Mini is an open-world exploration sandbox crafted around coastal, cultural, and urban environments (starting with a Kochi-inspired tropical island). It is designed from the ground up for high performance on mobile browsers, modular extensibility, and safe multi-session AI code collaboration.

---

## 🎯 Target Platforms
- **Primary:** Mobile Web (Safari on iOS, Chrome on Android) with responsive touch controls.
- **Secondary:** Desktop Browsers (Chrome, Firefox, Safari, Edge) with keyboard/mouse and gamepad support.

---

## 🏛️ Core Architecture Principles
1. **Decoupled Satellite Modules:** Major systems (player, vehicles, buildings, weather, UI) never depend directly on each other's internal classes.
2. **Central Services via `ServiceRegistry`:** Universal services (`AssetRegistry`, `EventBus`, `GlobalSettings`, `InputService`, `AudioService`, `LocationRegistry`) are accessed cleanly via dependency injection.
3. **Event-Driven Boundaries:** Cross-system communication occurs through the typed `EventBus`.
4. **Data-Driven Configuration:** Entities and props are defined via data schemas rather than hardcoded in procedural logic.
5. **Strict Lifecycle Management:** Every major system implements `ILifecycle` (`init`, `start`, `update`, `setEnabled`, `dispose`) ensuring zero memory leaks upon teardown.

---

## 📂 Project Structure

```
lokam-mini/
├── AI_RULES.md                  # Critical rules for AI code generation
├── README.md                    # Project overview & developer guide
├── docs/                        # Deep-dive architecture & guide documents
│   ├── ARCHITECTURE.md          # Comprehensive architectural model
│   ├── ASSET_PIPELINE.md        # Asset formats, naming, and manifest specs
│   ├── MODULE_GUIDE.md          # Module lifecycle and patterns
│   ├── PERFORMANCE.md           # Mobile performance thresholds and rules
│   ├── AI_WORKFLOW.md           # Multi-session collaboration workflow
│   └── agents/                  # AI session handoff logs
├── public/
│   └── assets/                  # Centralized game assets
│       ├── shared/              # Shared assets (trees, props, sounds, animations)
│       │   ├── vegetation/      # Coconut palms, tropical banyans, foliage
│       │   ├── props/           # Benches, streetlights, signs, barriers
│       │   ├── materials/       # Shared PBR textures & material maps
│       │   ├── animations/      # Humanoid locomotion animations
│       │   └── audio/           # Sound effects, ambient coastal soundscapes
│       ├── characters/          # Character models & rigs
│       ├── vehicles/            # Auto-rickshaws, boats, bicycles, cars
│       ├── buildings/           # Heritage colonial & Kerala architecture pieces
│       └── locations/           # Location-specific assets only
│           └── kochi-island/    # Island terrain, specific cultural landmarks
└── src/
    ├── app/                     # Game bootstrap & high-level loop
    ├── core/                    # Engine, lifecycle, events, services, settings
    ├── assets/                  # AssetLoader, AssetRegistry, AssetCache, MaterialRegistry
    ├── world/                   # Terrain, water, lighting, sky, atmosphere
    ├── locations/               # Location package system & Kochi Island implementation
    ├── characters/              # Player controller, NPC AI, character rigs
    ├── vehicles/                # Vehicle mechanics, driving physics, interaction
    ├── buildings/               # Building exterior & interior management
    ├── gameplay/                # Interactions, seating, fast-travel, camera
    ├── multiplayer/             # Entity replication & network synchronization
    ├── ui/                      # HUD, minimap, mobile virtual joystick, settings menu
    ├── audio/                   # Spatial audio emitter & background manager
    ├── performance/             # LOD, culling, instancing, object pooling
    ├── data/                    # Data-driven definitions for content
    └── utils/                   # Math, device detection, and engine utilities
```

---

## 🎨 Shared Asset Rules (Crucial)
- **Do not duplicate assets across locations.**
- All common trees, benches, streetlights, road signs, materials, animations, and sound effects belong in `/public/assets/shared/`.
- Assets are queried using stable dot-separated identifiers:
  ```ts
  const palmTree = await assetRegistry.get("tree.coconut.01");
  const bench = await assetRegistry.get("prop.bench.wood.01");
  const wallMat = materialRegistry.get("wall.plaster.warm");
  ```
- Reusable material families: `wall.plaster.white`, `wall.plaster.warm`, `roof.terracotta`, `concrete.clean`, `wood.dark`, `metal.paint`, `glass.standard`, `road.asphalt`, `ground.dirt`, `ground.grass`.

---

## 🗺️ Location System
Locations are self-contained packages under `src/locations/<location-name>/`:
- Implements `ILocationPackage` (`load`, `start`, `update`, `unload`).
- Defines its own local environment, spawn points, and triggers.
- Unloads cleanly from memory when switching islands without restarting the engine.
- First location: **Kochi Island** (`src/locations/kochi-island/`).

---

## 🛠️ How-To Guides

### 1. How to Add a Shared Asset
1. Place the 3D model/texture/audio inside `/public/assets/shared/<category>/`.
2. Register the asset in `src/assets/manifests/shared.manifest.ts`:
   ```ts
   {
     id: "prop.streetlight.colonial.01",
     type: "model",
     url: "/assets/shared/props/streetlight_colonial_01.glb",
     scope: "global"
   }
   ```
3. Retrieve it in gameplay code via `assetRegistry.get("prop.streetlight.colonial.01")`.

### 2. How to Add a New Location
1. Create a directory: `src/locations/<location-name>/`.
2. Implement `index.ts`, `config.ts`, `environment.ts`, `spawn-points.ts`, `interactions.ts`.
3. Register the location in `src/locations/registry/LocationRegistry.ts`.
4. Put any location-exclusive models in `/public/assets/locations/<location-name>/`.

### 3. How to Add a New Feature
1. Identify the target subsystem (`src/characters/`, `src/vehicles/`, `src/gameplay/`, etc.).
2. Implement the `ILifecycle` interface.
3. Access shared services via `EngineContext.services`.
4. Listen or dispatch events via `EventBus`.

---

## ⚡ Performance Principles
- **Instancing:** Always batch repeated scenery elements with `InstancedPropManager`.
- **Low Overdraw:** Avoid excessive transparent particle layers on mobile.
- **Adaptive Quality:** Subsystems must respect `GlobalSettings.graphics` (`low`, `medium`, `high`).
- **Memory Hygiene:** Clean up Three.js geometries, materials, and listeners in `dispose()`.

---

## 🤖 Where Future AI Sessions Should Start
1. Read `AI_RULES.md`.
2. Check `docs/agents/` for the latest session handoff notes.
3. Keep modifications contained inside your subsystem boundary.
4. Verify with `npm run build` or `compile_applet`.
