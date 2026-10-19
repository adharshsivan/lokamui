# Lokam Mini — System Architecture

## 1. Overview & Architectural Philosophy
**Lokam Mini** is an open-world exploration sandbox for web and mobile.
The architecture is designed around **low coupling, high cohesion, and strict modular boundaries**. Rather than a monolithic engine where subsystems intertwine, Lokam Mini functions as independent satellite modules surrounding a compact, lightweight core.

```
                    ┌─────────────────────────┐
                    │      Lokam Game /       │
                    │   Bootstrap Lifecycle   │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────┐                             ┌───────────────────┐
│   GameEngine    │                             │  ServiceRegistry  │
│ (Scene/Camera/  │                             │ (Decoupled IoC    │
│  Renderer/Loop) │                             │  Locator)         │
└────────┬────────┘                             └─────────┬─────────┘
         │                                                │
         │     ┌──────────────────────────────────────────┴────────┐
         │     │ Central Services:                                 │
         │     │ • EventBus (cross-module events)                  │
         │     │ • AssetRegistry (cached stable ID asset queries)  │
         │     │ • MaterialRegistry (shared material families)     │
         │     │ • GlobalSettings (graphics, audio, input, mobile) │
         │     │ • LocationRegistry (package load/unload)          │
         │     │ • InputService (keyboard, touch, gamepad)         │
         │     │ • AudioService (positional & ambient audio)       │
         │     └───────────────────────────────────────────────────┘
         │
         ├────────────────────────────────────────────────────────┐
         ▼                                                        ▼
┌──────────────────┐                                     ┌───────────────────┐
│ Active Location  │                                     │ Gameplay Systems  │
│ (e.g. Kochi Isle)│                                     │ (Player, Vehicle, │
│  • Environment   │                                     │  Buildings, NPCs, │
│  • Terrain/Water │                                     │  Multiplayer sync)│
│  • Spawn Points  │                                     └───────────────────┘
│  • Interactions  │
└──────────────────┘
```

---

## 2. Directory Hierarchy

```
lokam-mini/
├── AI_RULES.md                  # Mandatory rules for all human & AI developers
├── README.md                    # Project index and developer onboarding
├── docs/                        # Architecture, asset pipeline, performance docs
│   ├── ARCHITECTURE.md          # This document
│   ├── ASSET_PIPELINE.md        # Asset conventions, manifest schema, and formats
│   ├── MODULE_GUIDE.md          # Guide on authoring and extending game modules
│   ├── PERFORMANCE.md           # Mobile/web graphics limits and optimization guides
│   ├── AI_WORKFLOW.md           # Guidelines for AI coding agents
│   └── agents/                  # Handoff notes between AI sessions
├── public/
│   └── assets/                  # Centralized game assets
│       ├── shared/              # Shared reusable assets (never duplicate)
│       │   ├── vegetation/      # Trees, palms, bushes
│       │   ├── props/           # Benches, barriers, lights, signs
│       │   ├── materials/       # Standard texture sets and PBR maps
│       │   ├── animations/      # Shared humanoid walk/idle/gesture clips
│       │   └── audio/           # Ambient, UI, and footstep sound effects
│       ├── characters/          # Character models and skins
│       ├── vehicles/            # Vehicle models and chassis configs
│       ├── buildings/           # Modular architectural kits
│       └── locations/           # Location-specific assets only
│           └── kochi-island/    # Unique Kochi assets (landmarks, island terrain)
└── src/
    ├── app/                     # App bootstrap and root game orchestrator
    ├── core/                    # Engine, lifecycle, events, services, settings
    ├── assets/                  # AssetLoader, AssetRegistry, AssetCache, MaterialRegistry
    ├── world/                   # Terrain, water, sky, lighting
    ├── locations/               # Self-contained location packages
    ├── characters/              # Player controller, NPC, rig definitions
    ├── vehicles/                # Vehicle mechanics, physics integration
    ├── buildings/               # Building system, exterior-interior transitions
    ├── gameplay/                # Interactions, seating, fast-travel
    ├── multiplayer/             # Entity replication, WebSocket/WebRTC client
    ├── ui/                      # HUD, minimap, mobile controls, settings UI
    ├── audio/                   # Audio manager and spatial emitters
    ├── performance/             # LOD, culling, instancing, object pooling
    ├── data/                    # Data-driven definitions (locations, vehicles, etc.)
    └── utils/                   # Math, device detection, geometry helpers
```

---

## 3. Communication Patterns

### Rule A: Indirect Communication via EventBus
Unrelated systems must never invoke internal functions directly.
- **Good:** Player enters trigger -> emits `player:enteredVehicle(vehicleId)` -> VehicleModule handles mount -> HUD updates controls.
- **Bad:** `player.ts` imports `vehicleManager.ts` and directly sets `vehicle.driver = player`.

### Rule B: Shared Services via ServiceRegistry
Services with universal relevance (AssetRegistry, GlobalSettings, InputService) are registered in `ServiceRegistry` and accessed via dependency injection during `init(context)`.

### Rule C: Data-Driven Definitions
Vehicles, buildings, NPCs, and props are defined in declarative JSON/TypeScript data objects in `src/data/`, keeping logic decoupled from specific content configurations.
