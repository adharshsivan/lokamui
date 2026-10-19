# LOKAM MINI — AI DEVELOPER RULES
> **MANDATORY RULES FOR ALL AI SESSIONS EDITING THIS REPOSITORY**
> *Read this file and `README.md` completely before generating or editing any code.*

---

## 1. Prime Directive: Modularity & Independence
Lokam Mini is a modular, lightweight third-person multiplayer exploration game designed for Web and Mobile. It is built as independent modules orbiting a small, stable core.
- **Never create monolithic "GameManager" or "Game.js" files.**
- **Player logic must NEVER contain UI code.**
- **UI code must NEVER manipulate Three.js scene graphs directly.** Communication happens via events or services.
- **Weather / environment systems must NOT depend on building internals.**
- **Vehicles must NOT depend on the road renderer.**
- **Interiors must NOT declare their own isolated graphics settings.**
- **Locations must NEVER hardcode global engine systems.**

---

## 2. Multi-Session Safety Rules
Multiple AI sessions and human developers work on this repository independently. Follow these safety constraints to avoid corrupting parallel work:

1. **Inspect Before Building:** Before writing any new class or utility, check `src/` and `docs/` to see if a system already exists. **Never duplicate an existing system because you failed to find it.**
2. **Work Only Within Your Assigned Subsystem:** Do not refactor unrelated subsystems. If you are assigned the vehicle system, do not rewrite player movement or touch water shaders.
3. **No Casual Renames:** Do not rename public methods, event keys, service signatures, or asset IDs without explicit instruction and backward compatibility.
4. **No Arbitrary Folder Relocation:** Keep the established folder tree. Do not move shared core folders.
5. **Session Handoffs:** When completing significant work on a subsystem, create or update a handoff file in `docs/agents/<subsystem-name>.md` (see `docs/agents/README.md`).
6. **Preserve Working Functionality:** Every session must leave the project in a compiling, runnable state (`npm run build` / `npm run lint`).
7. **Smallest Safe Implementation:** If a requirement is ambiguous, implement the minimal safe design rather than speculative over-engineered frameworks.

---

## 3. Centralized Asset Architecture
Hardcoded file paths scattered in code are **strictly forbidden**.

- **Stable Asset IDs:** Gameplay systems must always request assets by stable ID through `AssetRegistry`:
  ```ts
  // CORRECT:
  const benchModel = await assetRegistry.get("prop.bench.wood.01");
  const roadMat = assetRegistry.getMaterial("material.road.asphalt");

  // FORBIDDEN:
  loader.load("/assets/models/bench_final_v2.glb");
  ```
- **Shared Assets Live in Shared Locations:**
  - Trees, streetlights, benches, barriers, road signs, materials, animations, and audio belong in `/public/assets/shared/`.
  - Never put copies of shared trees or props inside location folders like `kochi-island/tree.glb`.
- **Material Reuse:** Always query `MaterialRegistry` before instantiating new materials:
  - Common families: `wall.plaster.white`, `wall.plaster.warm`, `roof.terracotta`, `concrete.clean`, `wood.dark`, `metal.paint`, `glass.standard`, `road.asphalt`, `ground.dirt`, `ground.grass`.
- **Asset Cleanup:** Locations must release location-specific assets upon unload while keeping shared assets in cache.

---

## 4. Module Lifecycle Protocol
Every major subsystem and location package must implement the standard lifecycle interface:

```ts
export interface ILifecycle {
  init(context: EngineContext): Promise<void> | void;
  start(): void;
  update(delta: number, elapsed: number): void;
  setEnabled(enabled: boolean): void;
  dispose(): void;
}
```

- **Cleanup Discipline:** Every `addEventListener`, Three.js geometry/material, texture, animation frame, audio player, physics body, or interval created by a module **must** have a corresponding cleanup path in `dispose()`. No memory leaks.

---

## 5. Event System & Service Discipline
- Use the typed `EventBus` for cross-boundary communication (e.g. `location:loaded`, `player:enteredVehicle`, `settings:changed`).
- **Do not spam the EventBus:** Subsystem internal operations must stay internal. Do not fire 60 events per second for continuous values; use direct module updates or state snapshots.
- Global services are strictly limited to:
  1. `AssetRegistry`
  2. `EventBus`
  3. `GlobalSettings`
  4. `InputService`
  5. `AudioService`
  6. `LocationRegistry`

---

## 6. Web & Mobile Performance Mandate
Lokam Mini runs in mobile browsers with thermal and memory limits:
- Prefer low-poly GLTF/GLB models with DRACO/Meshopt compression.
- Reuse texture atlases and materials.
- Use `InstancedMesh` for repeated objects (trees, benches, lights, bollards). Never spawn 500 individual scene meshes.
- Respect `GlobalSettings.graphics` tiers (`low`, `medium`, `high`).
- Restrict real-time shadow casting to key hero elements.
- Keep draw calls and transparent overdraw to a minimum.

---

## 7. Verification Checklist Before Finishing
Before completing your session, you must:
1. Ensure no TypeScript errors exist (`npm run lint` / compilation check).
2. Verify asset paths conform to the manifest system.
3. Check that memory disposal is implemented for created resources.
4. Update `docs/agents/<your-module>.md` with a summary of changes.
