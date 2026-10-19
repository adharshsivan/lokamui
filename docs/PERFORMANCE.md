# Lokam Mini — Web & Mobile Performance Guide

## 1. Target Hardware & Budget
- **Platforms:** Mobile Web (Safari iOS, Chrome Android), Desktop Browsers.
- **Frame Rate Target:** Consistent 60 FPS on desktop; stable 30-60 FPS on mobile.
- **Draw Call Budget:** < 80 draw calls on mobile; < 150 on desktop.
- **Triangle Budget:** < 150k rendered triangles per frame on mobile.

---

## 2. Core Optimization Techniques

### A. Instanced Rendering (`InstancedMesh`)
- **Rule:** Never spawn individual scene objects for repeated elements like streetlights, coconut trees, bushes, chairs, or bollards.
- **Usage:** Use `InstancedPropManager` to batch 50-200 instances into a single draw call.

### B. Material & Texture Reuse
- Every unique material forces a separate draw call and shader program switch.
- All structural walls and props must reuse `MaterialRegistry` families.

### C. Frustum and Distance Culling
- Three.js auto-culls bounding spheres outside the camera frustum.
- Keep bounding volumes accurate. Group props logically into spatial chunks (e.g. 50m x 50m cells).
- Non-essential small clutter (bottles, rocks, leaves) must have short distance culling thresholds (< 25m).

### D. Global Graphics Presets
`GlobalSettings` provides three quality presets:

| Setting | Low (Mobile Default) | Medium | High (Desktop Default) |
|---|---|---|---|
| Pixel Ratio | 1.0 (capped) | 1.25 | Math.min(window.devicePixelRatio, 2.0) |
| Shadows | Off | Directional only (1024x1024) | Soft Cascaded (2048x2048) |
| Antialiasing | False | True (FXAA or standard) | True (MSAA) |
| View Distance | 150m | 300m | 600m |
| Vegetation Density | Low | Medium | High |
| Post-Processing | Disabled | Bloom/Color Grading | Full (SSAO, Bloom, Sun Shafts) |

---

## 3. Memory & GC Hygiene
- Avoid instantiating temporary `THREE.Vector3` or `THREE.Matrix4` inside `update(delta)`.
- Use preallocated working vectors (`_tempVecA`, `_tempVecB`) in module scopes.
- Dispose of geometries, materials, and textures when modules or locations unload.
