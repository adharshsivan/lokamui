# Lokam Mini — AI Multi-Session Collaboration Workflow

## 1. Why This Guide Exists
Lokam Mini is developed iteratively across multiple AI agent sessions and human contributors. Because context windows are limited and parallel sessions may occur, every AI agent must adhere to this predictable protocol to maintain project stability.

---

## 2. Step-by-Step AI Session Protocol

### Step 1: Context Intake & Verification
1. Read `/AI_RULES.md` and `/README.md`.
2. Read the latest session logs in `docs/agents/` related to your assigned subsystem.
3. Check `package.json` and directory structure before assuming any library or module exists.
4. **Never rewrite an existing module from scratch** if it already works. Extend or adapt it.

### Step 2: Boundary Isolation
1. Work **only** within your assigned subsystem folder:
   - Vehicle logic -> `src/vehicles/`
   - Kochi location -> `src/locations/kochi-island/`
   - Input enhancements -> `src/core/services/` & `src/input/`
   - UI features -> `src/ui/`
2. If your subsystem needs an asset, add it to `src/assets/manifests/` or use an existing ID in `AssetRegistry`.
3. If your subsystem needs to communicate with another subsystem, emit or listen to an event via `EventBus`.

### Step 3: Compile & Lint Gate
1. Run `compile_applet` or `npm run lint`.
2. Fix any TypeScript errors, missing imports, or broken types.
3. Ensure no dangling timers or un-disposed event listeners were introduced.

### Step 4: Session Handoff Documentation
Before ending your session, create or update a document in `docs/agents/<subsystem-name>.md` summarizing:
- What was added / updated.
- Public methods and event signatures introduced.
- Next recommended steps for the next AI session.
