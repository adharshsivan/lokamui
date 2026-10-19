# Sky System Handoff Notes

## Celestial Starfield Anti-Aliasing & Twinkle Refinement

### Problem Addressed
- The stars in the night sky exhibited significant spatial aliasing and temporal crawling ("noise" / pixel popping) when moving or rotating the camera.
- Twinkle animation frequency was running at up to ~7.0 rad/s with a ±35% amplitude, resulting in a frantic, buzzing strobe effect rather than natural celestial scintillation.

### Changes Made (`src/world/sky/skyShaders.ts`)
1. **Spatial Nyquist Filtering & Anti-Aliased Profiles**:
   - Adjusted the cell grid scale from `[160.0, 330.0]` down to a balanced `[72.0, 128.0]`. The previous scale of 330 was far below the screen-space subpixel threshold, causing extreme temporal aliasing on camera movement.
   - Replaced the harsh `fade(0.0, 0.16, d)` cutoff with an anti-aliased Gaussian profile `exp(-d * d * coreSpread)` combined with a soft falloff halo `smoothstep(0.36, 0.08, d)`. This ensures that as the camera rotates, neighboring raster pixels smoothly interpolate stellar luminance with zero pop-in or crawl.
   - Raised the density thresholds to `0.925` (Layer 0) and `0.94` (Layer 1) to eliminate clutter and introduce a natural astronomical magnitude distribution.

2. **Calm, Realistic Atmospheric Twinkle**:
   - Slowed scintillation frequency down to `0.5 - 1.1 rad/s` (5–12 second gentle cycle) rather than 7 rad/s.
   - Reduced scintillation amplitude to `0.86 + 0.14 * sin(...)`, keeping stars steadily luminous without blinking to extinction.

### Updates: Pinpoint Sizing & Natural Sparse Density
1. **Crisp Pinpoint Sizing (Removed Large Glowing Halos):**
   - Tightened the exponential falloff profile from `coreSpread = 32-44` up to `150.0` (Layer 0) and `200.0` (Layer 1).
   - Removed the wide diffuse halo (`exp(-d * 11.0)`) and tightened boundary falloff to `smoothstep(0.20, 0.03, d)`.
   - Result: Stars are sharp, delicate pinpoints of light without appearing as large blurry dots.

### Updates: Elimination of Orbiting Camera Twinkling Noise
1. **Root Cause Analysis:**
   - When sampling a Cartesian 3D lattice (`floor(p)`) from a spherical ray `p = r * scale`, the ray sliced through 3D cubic boxes.
   - At cell boundaries, stars located near faces were abruptly clipped when the sampling ray moved into a neighbor cell that evaluated a different random seed.
   - Furthermore, active dynamic time oscillation (`sin(uTime)`) combined with high angular camera orbiting speeds created perceived jitter.

2. **Continuous 8-Cell Angular Chord Distance:**
   - Implemented an unrolled 2x2x2 neighborhood search around `stepDir = step(0.5, fract(p)) * 2.0 - 1.0`.
   - Projected each star to its true unit celestial vector `starDir = normalize(starLocal)` and evaluated true spherical chord distance `length(r - starDir)`.
   - Smooth bell profile `core = 1.0 - normD * normD; starShape = core * core` with zero derivative at boundary ensures strict $C^1$ continuity without any seam or boundary popping.
3. **Final Calibration: Delicate Pinpoint Radius & Sparse Star Count:**
   - Reduced `starRadius` from `0.0022 - 0.0034` down to `mix(0.0007, 0.0013, ...)` (approx 0.7 to 1.3 screen pixels). Stars now appear as crisp, delicate pinpoint specks rather than large discs.
   - Raised generation threshold to `h > 0.9982` on `scale = 80.0` (~0.18% density). This limits the total visible star count to ~70 stars across the entire night sky hemisphere (~8–12 in a typical viewport), eliminating clutter and producing a clean, natural night sky.

### High-Fidelity 3D Stepped-Leader Lightning Strike System (`LightningMesh.ts` & `SkyService.ts`)
1. **Continuous Mitered Polyline Ribbon Strips:**
   - Replaced disconnected per-segment quads with continuous miter-joined polyline strips.
   - Vertices at every kink are shared with averaged miter normals, eliminating disjointed corners, broken elbows, and polygon seams.
2. **Physical Dielectric Gradient & Branching Flow:**
   - 32-step main trunk from storm clouds (52m–65m) down to sea level, with downward flow and sharp 15°–30° angular kinks.
   - 4 primary branches that follow the downward dielectric breakdown vector with acute 22°–32° divergence (strictly downward, no unnatural 90° or upward noodle lines).
   - Natural tapering: main trunk tapers from 1.65m down to 0.85m; branches taper from 0.68m down to 0.14m.
3. **Smooth Quadratic Window Function:**
   - Evaluates `window = (1.0 - d^2)^2` in fragment shader, forcing glow to smoothly drop to exactly zero at the quad boundary with zero visible rectangular borders or edge cutoffs.
4. **Physical 3D Scene Illumination & Intra-Cloud Flash:**
   - Dynamic 3D `PointLight` casts real-time electric light across the island, water, pier, and player.
   - SkyDome renders diffuse intra-cloud sheet flashes (`uFlash` & `uBolt`) behind the 3D bolt for atmospheric depth.

### Realistic 3D Atmospheric Rain System (`RainFX.ts` & `SkyService.ts`)
1. **True 3D World-Space Simulation & Toroidal Wrapping:**
   - Rain particles live and move in physical 3D world space $(X, Y, Z)$ rather than camera-local space.
   - Particles are toroidally wrapped around the camera's position $\vec{C}$, guaranteeing rain never vanishes when orbiting or moving around the island.
   - Rain streaks remain fixed in the world; rotating the camera inspects the same physical falling rain without directional turning ("rain falling for me only" resolved).
2. **Three.js View-Projection Matrix Alignment:**
   - Rain streaks and ground splashes are projected directly using `Matrix4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)`.
   - Motion blur tails are computed from true world velocity $\vec{V} = (V_x, -V_{\text{fall}}, V_z)$, creating authentic overhead convergence when looking up and natural horizontal slant aligned with wind.
3. **Wind Synchronization:**
   - Rain streak drift vector $(V_x, V_z)$ is naturally driven by world `wind` speed and `windDir` with atmospheric gust turbulence.
4. **Dev Console Rain Controls:**
   - Added dedicated Dev Console section with Rain toggle, Precipitation Intensity slider, Fall Speed slider, Wind Velocity Drift slider, Ground Splashes toggle, and 4 quick presets (Light Drizzle, Monsoon Rain, Tropical Squall, Clear & Dry).



