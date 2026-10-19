# Lokam Mini — Module Guide & Authoring Standard

## 1. Module Lifecycle Contract
All major engine and gameplay modules must implement `ILifecycle`:

```typescript
export interface EngineContext {
  engine: GameEngine;
  services: ServiceRegistry;
}

export interface ILifecycle {
  /** Initialize dependencies, listen to events, prepare assets. */
  init(context: EngineContext): Promise<void> | void;

  /** Activate the module, attach to scene graph. */
  start(): void;

  /** Per-frame update hook. */
  update(delta: number, elapsed: number): void;

  /** Toggle activity without discarding state. */
  setEnabled(enabled: boolean): void;

  /** Tear down all resources, remove listeners, dispose Three.js meshes/materials. */
  dispose(): void;
}
```

---

## 2. Location Package Architecture
Every location is an isolated module:
```
src/locations/<location-id>/
├── index.ts           # Location entry point implementing ILocationPackage
├── config.ts          # Extents, lighting presets, boundary coordinates
├── environment.ts     # Sky, atmospheric fog, ambient water setup
├── spawn-points.ts    # Player and vehicle spawn transforms
├── interactions.ts    # Points of interest, benches, door triggers
└── README.md          # Location design notes and asset references
```

### Loading & Unloading Locations:
```typescript
const location = locationRegistry.get("kochi-island");
await location.load(context);
location.start();

// When travelling to another location:
location.unload();
```

---

## 3. Interior Transitions
Buildings can feature separate interior scenes.
1. Exterior door trigger detects player interaction.
2. Event `gameplay:enterInterior` is emitted with building ID.
3. Interior loader fetches interior definition and model package.
4. Exterior world culling / LOD switches to low-overhead mode.
5. Exit door triggers reverse sequence.
*Interiors must use shared materials and global services.*

---

## 4. UI to Three.js Decoupling
UI components (React/HTML HUD) must never touch Three.js objects directly:
- **Read state:** Subscribe to `EventBus` or query read-only state stores.
- **Trigger actions:** Send commands through `EventBus` (e.g. `EventBus.emit('ui:respawnRequested')`).
