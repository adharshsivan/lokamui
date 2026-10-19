# Lokam Mini — Transparent Glass HUD & Style Guide

## 1. Aesthetic Vision: Smoked Liquid Acrylic Glass & Premium Typography
The Lokam Mini in-game Heads-Up Display replicates the refined coastal aesthetic of tropical Kerala. All elements are designed with high-transparency frosted smoked glass (`rgba(2, 6, 23, 0.40)` to `rgba(15, 23, 42, 0.50)` with `backdrop-filter: blur(16px)` to `blur(20px)`), allowing the sunlit ocean, palm trees, and cobblestones to shine through while keeping all iconography and typography razor-sharp.

**Premium Gaming Typography System:**
- **Primary UI Sans:** `Outfit` & `Plus Jakarta Sans` — modern, luxury geometric sans-serif for sharp numerals and UI labels.
- **Display & HUD Headlines (`font-display`):** `Rajdhani` (weights 600, 700) with wide optical tracking (`tracking-[0.08em]` to `tracking-[0.14em]`) for radial weapon/radio wheels, title headers, and tactical readouts.
- **HUD Metadata (`font-hud`):** `Outfit` with crisp tabular figures and high-contrast letter spacing.

**Strict Monochromatic Rule:**
- All icons across the HUD are pure white (`text-white`).
- All active / touch states are **monochrome white** (`bg-white/25 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.4)]`).
- **NO colorful active states** (strictly NO yellow/amber, green, or blue highlights on buttons or icons).

---

## 2. Key Minute Details & Separation Lines

### A. Top-Right Profile Badge (`PlayerProfileBadge.tsx`)
- **Avatar Outer Ring:** Minimal crisp white border (`border-[1.5px] border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md`) without golden tones.
- **Clean Aesthetic:** Zero status symbol pips or busy gradients for an ultra-clean, minimal avatar circle.
- Clicking smoothly opens the quick menu modal.

### B. Balanced Smoked Glass Action Toolbar Dock (`BottomActionTray.tsx`)
- **100% Purely Rounded Design (Zero Rectangles):** Completely eliminates any rectangular tabs, boxy corners, or straight edges.
  - The capsule dock is a pristine `rounded-full` pill.
  - All action items are circular glass discs (`rounded-full`).
  - The collapsible arrow is an **integrated circular button** inside the bar (`w-10.5 h-10.5 sm:w-11 sm:h-11 rounded-full`).
- **Fluid Expand & Collapse Animations:** Powered by `cubic-bezier(0.16, 1, 0.3, 1)` 300ms easing:
  - When **expanded**: The dock gracefully unfurls into a balanced smoked glass pill with all 7 circular discs in a unified row.
  - When **collapsed**: The 6 action discs smoothly slide and shrink into the toggle button, condensing the entire toolbar into a single, perfectly circular floating glass puck (`rounded-full`) with the upward chevron.
  - The chevron rotates 180° smoothly between open (pointing down to collapse) and closed (pointing up to expand).
  - Provides a generous 44px+ circular hit area on mobile screens.
- **Clean Interaction & Minimal Dock Popups:** 
  - Clicking `Games`, `Buildings`, or `Gestures` opens a minimal, frosted glass horizontal selection card directly above the dock (`ActivityDockPopup.tsx`):
    - **Smooth Animation Lifecycle:** Fluid `cubic-bezier(0.16, 1, 0.3, 1)` easing for both opening (scale + fade + slide up) and closing transitions without clipping.
    - **Gestures Horizontal Scroll & Fitted Grids:** Gestures & Emotes supports full mouse-drag, mouse-wheel, and touch-swipe horizontal scrolling across 10 expressive emotes with a dynamic bottom progress bar. Mini Games & Buildings display in clean, fitted 5-column grids with zero unnecessary scroll.
    - **Unique Stylish Border per Item:** Each gesture, building, and game features its own distinct glowing neon border and soft specular tint when selected (matching the reference design).
    - **Tactile Auto-Close:** Selecting any item triggers an immediate glowing highlight and smoothly auto-closes the window after 200ms.
    - **Solid Color Fill & White Border Loader on Toolbar:** When a gesture is selected, the gesture disc in the bottom dock fills solidly with the gesture's theme color (`backgroundColor: activeGesture.color`), displays the crisp white icon, and animates a pure white 5-second circular loader ring (`stroke="#ffffff"`) embedded directly inside the circular button perimeter with zero square bounding box or double border artifacts. Once the 5 seconds complete, it seamlessly resets back to the standard default gesture icon (`MdEmojiPeople`).
    - **Backdrop:** Neutral pitch black smoked glass capsule (`bg-black/65 hover:bg-black/75 backdrop-blur-2xl border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.55)]`).
    - **Header:** Category icon in smoked container, Title ("Mini Games" / "City & Places" / "Gestures & Emotes"), Subtitle ("Choose an activity" / "Choose a destination" / "Express yourself"), and round `✕` close button.
    - **Horizontal Cards:** Clean, distraction-free cards (icon + title only, with zero tag dashes).
- **Exact Icon Sequence (Left to Right):**
  1. `Mic`: Crimson-red disc (`#e11d48`) with crisp white icon and neatly fitted, uncropped pulsating ring (`-inset-0.5 border-2 border-rose-400/80 bg-rose-500/15 animate-small-ring-pulse`) with generous capsule clearance
  2. `Gesture`: Official Material `MdEmojiPeople` emote glyph (dynamically transforms into active gesture icon with 5s circular loader ring when playing an emote)
  3. `Radio`: Dynamic broadcast disc that matches the current playing station's signature color (Cyber Cyan for Sooriyan FM, Rose Pink for Kalai FM, Amber Orange for 80s Radio, Emerald for Tamil Panpalai, Neon Gold for 90s Melodies, Magenta Violet for Jei FM, and Neon Lime for 80s Hits) with high-contrast icon, dynamic glowing drop shadow, and matching synchronized pulsing outer ring (`animate-small-ring-pulse`). When radio is off, smoothly reverts to neutral smoked glass.
  4. `Camera`: Snapshot / photo mode (`Camera`)
  5. `Games`: Island mini-games (`Gamepad2` - Cycling Race, Fishing, Delivery Run, Boat Race, Parkour)
  6. `Buildings`: City & Places (`Building2` - Sarvam Theater, Heritage Museum, Aazhi Stadium, Cafe Rooftop, Paradise Mall)
  7. `Friends`: Friends / Social hub (`Users`)
  8. `Chat`: In-game world chat (`MessageSquare`)
  9. `Collapse Toggle`: Circular smoked glass button with 180° animated chevron

### C. Balanced Smoked Glass Gun & Sprint Controls
Positioned in the bottom-right thumb zone, stacked vertically with **exact matching 58px diameter** for clean symmetry:
1. **Gun Button (`GunButton.tsx`):**
   - 58px circular smoked glass disc (`bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_20px_rgba(0,0,0,0.3)]`).
   - Sits right above the Sprint button with identical dimensions and geometry.
   - Strictly monochrome (zero colored backgrounds or yellow tones). Pure crisp white pistol icon (`GiPistolGun`) with tactile dark glass press feedback (`scale-90 bg-black/60 border-white/40 shadow-[0_0_16px_rgba(255,255,255,0.3)]`).
2. **Sprint Button (`SprintButton.tsx`):**
   - 58px circular smoked glass disc, matching the Gun button's exact dimensions.
   - Real athletic running human vector icon (`MdDirectionsRun`) with sharp, modern posture and clear silhouette.
   - Touch/mouse down triggers `inputService.setVirtualAction('sprint', true)`, touch/mouse up releases it.

### D. Circular RPG Reactive Radar Minimap (`Minimap.tsx`)
- **Dynamic Controller Movement:** As the player moves using the virtual joystick or keyboard (WASD), the map terrain translates dynamically under their feet in real-time.
- **Dynamic Player Orientation:** The center golden 3D player arrow smoothly rotates to point along the active movement vector and heading.
- **Synchronized Cardinal Compass System (3 Direction Lines + North Marker):**
  - **3 Directional Lines:** Crisp white tick marks on East (+90°), South (+180°), and West (+270°).
  - **Compact North Marker ("N"):** Reduced compact badge (18px diameter) positioned directly on the North axis (0°) with no redundant extra tick line.
  - **100% In-Sync Motion:** The 3 directional lines and the North badge rotate together in full synchronization as the player turns and moves.
  - **Always-Upright Legibility:** The "N" text inside the badge is counter-rotated (`transform: rotate(${-northAngle}deg)`) so it stays vertically upright, legible, and right-side up at every angle.
- **Translucent Glass Display:** Semi-transparent smoked glass backdrop (`bg-black/40 backdrop-blur-md`) with 80% opacity map texture layer, allowing the vibrant 3D world and sky to subtly show through.
- **Pure Minimal Form:** Clean perimeter without status gauges or maximize button for an unobstructed view.

### E. Balanced Smoked Glass Player Controller (`VirtualJoystick.tsx`)
- **Base Ring:** 142px circular smoked glass disc with active state retention (`isActive ? 'bg-black/45 border-white/35 shadow-[0_10px_32px_rgba(0,0,0,0.4)]' : 'bg-black/35 hover:bg-black/45 border-white/25 shadow-[0_10px_32px_rgba(0,0,0,0.3)]'`). Maintains continuous engaged opacity while dragging anywhere without flickering when the cursor moves beyond the outer rim.
- **Directional Side Arrows:** 4 minimal, neat semi-transparent white directional chevrons for sides (Up, Down, Left, Right) positioned subtly along the cardinal axes (`text-white/40`).
- **Extended Analog Travel:** The inner circle puck has an extended travel radius (`maxDistance = radius + 10`), allowing it to move slightly beyond the outer rim of the main circle for a tactile, responsive analog movement feel. Full movement input reaches 1.0 smoothly before the outer rim.
- **Live Glimmering Chromatic Gradient Rim:** The draggable center puck features the exact same continuous live chromatic gradient animation (`.glimmer-border-glow`) as the "Ride" prompt, delivering a unified premium look.
- **Smoked Glass Specular Core:** 54px floating draggable puck (`z-20`) with clean, solid dark smoked translucent glass core (`bg-[#0a0e17]/85 backdrop-blur-xl border border-white/10 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.35)]`) and dynamic ambient glow when active.

### F. Action Vertical Stack (`FistButton.tsx`, `JumpButton.tsx`, `BagButton.tsx`)
Arranged in a sleek, thumb-friendly vertical column in the bottom-right zone (**strictly NO text labels**, pure razor-sharp white monochrome vector glyphs, matching 58px uniform disc sizes):
- **1. Fist / Melee Attack (`FistButton.tsx` - Top):**
  - 58px circular smoked acrylic glass disc (`bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_20px_rgba(0,0,0,0.3)]`).
  - Standard upright solid white clenched fist icon (`FaFistRaised`) triggering melee / primary action attacks.
- **2. Jump / Climb (`JumpButton.tsx` - Middle):**
  - 58px circular smoked acrylic glass disc (`bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_20px_rgba(0,0,0,0.3)]`).
  - Athletic leaping motion icon (`FaPersonRunning`).
- **3. Bag / Inventory (`BagButton.tsx` - Bottom):**
  - 58px circular smoked acrylic glass disc (`bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_20px_rgba(0,0,0,0.3)]`).
  - Solid white bag icon with distinct twin arched carry handles (`FaBagShopping`), matching the solid vector fill and optical weight of the Fist and Jump icons.

### G. In-World Contextual Interaction ("Ride") (`InteractionPrompt.tsx`)
- **Live Glimmering Chromatic Gradient Border:** Features a continuous, luxury glimmering chromatic gradient border animation (`.glimmer-border-glow` with soft rose, sunset coral, radiant gold, fresh mint, sky cyan, violet, and a specular white crest) that sweeps around the pill to create a live, premium interactive feel.
- **Floating Pill:** Neutral smoked black glass capsule (`bg-[#0a0e17]/85 backdrop-blur-xl shadow-lg`) with pure white bicycle glyph and "Ride" label, matching the HUD controls without any blue tint.
- **Anchor Stem:** Delicate vertical line descending from the capsule base down to a glowing white anchor dot positioned directly over the bicycle.

### H. Full-Screen Photo / Camera Mode (`CameraModeOverlay.tsx`)
- **First-Person View (FPV) Camera Controller:**
  - Entering Camera Mode smoothly transitions the 3D camera into FPV at eye height (~1.55m) and hides the player body model to prevent camera obstruction.
  - **Full Camera Pitch & Yaw:** Dragging anywhere on the screen rotates the FPV view 360° horizontally and up to 140° vertically to view the celestial sky overhead.
  - **Character Locomotion in FPV:** The virtual joystick and WASD/arrow keys remain active with subtle translucent styling, allowing continuous walking and exploration while framing shots in FPV.
- **Fluid Bi-Directional Transitions (`350ms cubic-bezier(0.16, 1, 0.3, 1)`):**
  - **Entering Camera Mode:** The top HUD slides smoothly upward, the center utility dock slides down, while the camera viewfinder brackets glide into place from the corners and the camera action dock emerges from below.
  - **Exiting Camera Mode:** Tapping `X` collapses the viewfinder brackets outwards, slides down the camera dock, returns the camera to third-person view, and smoothly restores the full gameplay HUD.
- **Viewfinder Overlays:**
  - **4 Corner Brackets:** Crisp white corner indicators (`┌ ┐ └ ┘`) in the 4 corners of the viewport.
  - **Rule-of-Thirds Grid:** Delicate, toggleable 3x3 grid lines across the screen.
  - **Center Focus Reticle:** Minimal circular focus target ring with center dot.
- **Matching Bottom Control Dock (1:1 Action Bar Smoked Glass Sync):**
  - All auxiliary buttons share the exact styling as the main action bar icons:
    `bg-black/40 hover:bg-black/55 text-white border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_3px_10px_rgba(0,0,0,0.3)] backdrop-blur-md`
  - 1. `Gallery`: Saved photos icon (`Image`) — opens the **Lokam Mini Night Gallery Modal** (`CameraGalleryModal.tsx`).
  - 2. `Grid Toggle`: 3x3 camera rule-of-thirds grid icon (`Grid3X3`) with 1-tap toggle ON / OFF.
  - 3. `Shutter Hero Button`: Large crisp white circular shutter button with dark inner ring and snapshot flash effect (captures canvas frames into the gallery).
  - 4. `Filter Switcher`: Classic three overlapping circles photographic filter icon with 1-tap toggle ON / OFF.
  - 5. `Exit (X)`: Close button returning instantly to standard HUD.
- **Lokam Mini Gallery Modal (`CameraGalleryModal.tsx`):**
  - **Smoked Frosted Glass Container:** Translucent modal (`w-[880px] max-w-[96vw] h-[640px] sm:h-[660px] max-h-[94vh] rounded-[26px] sm:rounded-3xl bg-[#0a0e17]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_70px_rgba(0,0,0,0.85)]`) aligned 100% with `GameSettingsModal.tsx` and `RadioStationsModal.tsx`.
  - **Header:** Clean text-only title ("Gallery") with subtle subtitle, hairline divider (`border-white/[0.06]`), and circular close button (`w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08]`).
  - **Left Showcase Viewer:** 16:9 high-resolution preview box with inner shadow and video overlay badge.
  - **Bottom Info Card:** Frosted card (`rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5`) with calendar date (`Apr 26, 2024`), clock time (`09:14 PM`), circular download button, and circular share button.
  - **Right Thumbnail Column & Scrollbar:** Styled with custom thin scrollbar (`[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/[0.12] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.22]`), frosted thumbnail cards (`bg-white/[0.03] border-white/[0.06]`), active frosted highlight (`bg-white/[0.09] border-white/[0.25] shadow-[0_0_16px_rgba(255,255,255,0.12)]`), and corner photo/video badges.
  - **Footer:** Hairline divider with capture count and solid white "Done" button (`bg-white text-neutral-950 font-semibold px-6 py-2.5 rounded-2xl`).

### I. Game Settings Menu (`GameSettingsModal.tsx`)
- **Trigger:** Tapping the Player Profile Avatar in the top-right opens the game settings menu.
- **Smoked Frosted Glass Container:** Translucent modal (`bg-[#0a0e17]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_70px_rgba(0,0,0,0.85)] rounded-3xl`) matching `RadioStationsModal.tsx`.
- **Sidebar Tabs:** `General`, `Visual`, `Audio`, `Controls` (with consistent white borders and active states).
- **Card Sections:**
  - **1. General:** Language dropdown, Subtitles toggle, Fullscreen toggle.
  - **2. Visual:** Quality Preset pill segmented control, Anti-Aliasing, SSAO, Bloom toggles, Shadow/Water/Texture dropdowns, Draw Distance & Traffic filled sliders.
  - **3. Audio:** Master Volume, Radio Music, and SFX Volume dynamic filled sliders.
  - **4. Controls:** Look Sensitivity slider, Invert Y, Vibration toggles.
- **Footer Actions:** `Reset to Default`, `Cancel`, and solid white `Apply Changes` button.

### J. Radial Radio Wheel Menu (`RadioWheelOverlay.tsx`)
- **Activation:** Tapping the Radio broadcast icon in the bottom action bar.
- **HUD Persistence:** When the Radio Wheel is open, all surrounding gameplay HUD controls (minimap, profile badge, joystick, action bar, gun/sprint buttons) **remain fully visible and active**.
- **Wheel Scrolling & Inside-the-Wheel Radial Glow:**
  - Mouse wheel scrolling cycles smoothly through stations clockwise/counter-clockwise with fluid throttle.
  - As the active station changes, a dynamic subtle radial gradient glow illuminates **inside the wheel disc itself** (`#wheelInsideGlow` in SVG, strictly bounded within `outerRadius`), dynamically taking on the active radio station's signature color without any outer glow or blur spilling outside the perimeter.
- **Elevated Radial Position:**
  - Nudged upward (`-translate-y-4 sm:-translate-y-8`) for optimal vertical balance and clearance over the bottom toolbar.
- **Dynamic Station Signature Color Switching:**
  - Inspired by custom radial weapon wheels, each station features a dedicated neon color theme:
    - `SOORIYAN FM` (89.6): Cyber Cyan / Sky Blue (`#38bdf8`)
    - `KALAI FM TAMIL` (88.1): Vibrant Rose Pink (`#fb7185`)
    - `TAMIL 80'S RADIO` (90.6): Warm Amber Orange (`#fb923c`)
    - `TAMIL PANPALAI GO...` (93.4): Emerald Jade Green (`#34d399`)
    - `90'S TAMIL MELODIES` (95.7): Neon Gold Yellow (`#facc15`)
    - `JEI FM KLANG TAMIL RADIO` (97.3): Electric Indigo Blue (`#818cf8`)
    - `80'S TAMIL HITS` (92.7): Neon Lime (`#a3e635`)
    - `NO STATION` (OFF): Pure Silver White (`#ffffff`)
- **Neutral Translucent Smoked Glass Base (`#0c0c0e`, 80% Opacity):**
  - Sophisticated smoked glass canvas with 80% opacity (`fillOpacity="0.80"`) and circular `backdrop-blur-md`, allowing the 3D game world to gently filter through without looking overly dark or solid black.
  - **Optimal Text Contrast:** All station names and frequency tags feature crisp pure white typography with high-contrast text drop shadows (`drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`), ensuring 100% legibility against any background scenery.
  - **1:1 Geometry & Shadow Alignment:** Perfect match between the SVG circle and bounding container, eliminating any outer border halos or misaligned container shadows.
  - **Borderless Perimeter:** Clean borderless outer rim without glass border rings.
  - **Subtle Hairline Separation Spokes:** Inactive radial divider lines refined to subtle `0.8px` hairline lines (`strokeOpacity="0.045"`).
  - Active wedge features a subtle 18% signature color tint, signature color boundary spoke outlines, and a sharp glowing neon outer arc.
  - **Center Hub:** Semi-translucent smoked glass disc (`bg-[#0c0c0e]/85 backdrop-blur-md`) with subtle, soft translucent border ring (`border-[1.2px]`, ~22% opacity) so the outer circle remains the crisp bright focal boundary, glowing signature icon, bold tracked uppercase title, and clean subtitle. **The central circle details strictly update only upon selecting/clicking a station, not upon mouse hovering.**
- **Top Pill ("Stations"):** Floating neutral smoked glass capsule with settings/gear icon and "Stations" label. Clicking this pill opens the **Tropical Radio Station Selector & Configuration Modal** (`RadioStationsModal.tsx`).
- **Live Radio Streaming via Open-Source Radio Browser API (`RadioAudioService.ts`):**
  - **Direct Live Streaming:** Uses the open-source Radio Browser API (`api.radio-browser.info`) with multi-mirror fallback (`de1`, `nl1`, `at1`) to stream real live audio directly into the game.
  - **Language Focus:** Features dedicated stations and categories for **Malayalam**, **Tamil**, **Hindi**, and **English** music.
  - **Pure Live Audio Streaming:** Seeded with top verified Malayalam, Tamil, Hindi, and English global live music streams for zero-delay instant playback. Zero squeaky frequency effects or synth oscillator hums—only clean broadcast radio streaming.
- **Tropical Radio Station Selector Modal (`RadioStationsModal.tsx`):**
  - **Clean Smoked Frosted Glass Aesthetic:** Translucent backdrop (`bg-[#0a0e17]/80 backdrop-blur-2xl border border-white/[0.07]`) with delicate hairline dividers (`border-white/[0.06]`).
  - **Minimalist Clean Header:** Clean text-only title and subtitle (`Radio Stations` / `Settings`) with zero extraneous heading icons or rainbow gradient boxes.
  - **Unified Settings Modal Visual Design (`GameSettingsModal.tsx`):** Aligned to the exact same fixed window dimensions (`840px x 620px`), translucent smoked glass background, left tab navigation (General, Visual, Audio, Controls), clean frosted cards, standard white toggles/segmented controls, dynamic white fill sliders (`FilledSlider`), and consistent footer action buttons (Reset, Cancel, Apply Changes).
  - **Subtle Search & Card Borders:** Ultra-subtle frosted glass inset search bar and soft translucent card borders (`border-white/[0.04]` hover `border-white/[0.08]`). Removed the `[ ⇅ A-Z ]` button for an uncluttered single-focus search bar.
  - **Apple Aesthetics Vibrant Pastel Gradient Radio Icons:** Station avatars styled in radiant, luminous Apple-inspired pastel gradients (flamingo peach, neon lilac, cyber mint, arctic sky, solar mango, tropical guava, royal iris, golden honey, lime sorbet) with glossy top specular rims (`shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45)]`), delicate tinted borders, and crisp white vector glyphs with drop shadows.
  - **Dedicated Hindi Section (Positioned Right After Tamil):** 6 curated high-fidelity Hindi stations (Radio Mirchi Hindi, Bollywood Gaane Purane, Meethi Mirchi Romantic, Hits of Bollywood, Radio Udaan Hindi, Vividh Bharati National) with sidebar navigation tab and live streams.
  - **Dedicated English Section:** 12 curated high-fidelity English music stations with sidebar navigation tab.
  - **Complete Removal of Horizontal Filter Bar:** Removed the redundant horizontal pills row, giving the station list full vertical presence and clean presentation.
  - **Preview vs. Wheel Audio Retention on Window Close:** When closing the modal (via Close `X`, Cancel, backdrop click, or Apply), any station that was only previewed and is not pinned to the user's radio wheel automatically turns off. If the playing station is pinned to the radio wheel, it continues playing smoothly in the background.
  - **Expanded Mobile-Friendly Window Size:** Fixed geometry (`w-[880px] max-w-[96vw] h-[640px] sm:h-[660px] max-h-[94vh]`) with minimum 44px tap targets for mobile touch comfort.
  - **Custom Sleek Glass Scrollbar (`.glass-scrollbar`):** Replaces generic operating system scrollbars with an ultra-thin 5px translucent rounded pill thumb and transparent track.
  - **Clean Sidebar Typography (Zero Colored Icons):** Minimalist text labels (`All Stations`, `Malayalam`, `Tamil`, `Hindi`, `English`, `On Wheel`, `Favorites`) with translucent glass count badges.
  - **Station Card Action Controls (Love -> Add -> Play):**
    - Strict visual order on every card: **1. Love** (Favorite heart), **2. Add** (Wheel pin toggle), **3. Play** (Instant streaming play/pause/loader).
    - Unified icon proportions: all three action glyphs share identical `w-4 h-4` geometry with matched `w-8 h-8 sm:w-8.5 sm:h-8.5` circular glass pill buttons.
    - Standard sans typography (`font-sans`) for stream codec/bitrate badges (`AAC 64k`, `MP3 128k`) with zero monospaced fonts.
    - **Standard Non-Blue Button Styling:** Removed all blue/sky accents from buttons. When playing, the active station button uses the standard clean solid white disc with crisp dark glyph (`bg-white text-neutral-950 hover:bg-white/90 shadow-md`), and the footer "Apply to Radio Wheel" button uses the standard primary white pill (`bg-white text-neutral-950 font-bold hover:bg-white/90 shadow-sm`), matching our standard HUD controls.
  - **Zero-Latency Audio Streaming Pipeline:** Immediate optimistic UI reaction on click (0ms button state transition), `preload="auto"`, removal of restrictive CORS headers for icecast/shoutcast servers, and `canplay` readiness detection for fastest possible stream playback.
  - **8-Slot Radio Wheel Configuration:** Add or remove stations to customize the 8 radial slices on the radio wheel, with slot counter and "Apply to Radio Wheel".
  - **Empty Slot Fallback ("EMPTY SLOT / EMPTY" vs "NO STATION / OFF"):**
    - **Top Slot 0 (12 o'clock):** Dedicated power switch with title `NO STATION`, tag `OFF`, and authentic `FaPowerOff` power icon.
    - **Other Unassigned Slots (Slots 1–7):** Explicitly rendered as `EMPTY SLOT` with tag `EMPTY` and a dedicated open slot icon (`CircleDashed`). Zero colored accents (clean neutral smoked glass without neon rims, glows, or tints). Selecting any empty slot stops/turns off radio playback.
- **8 Radial Station Slices & Premium Official Vector Icons (Clockwise from Top):**
  1. `NO STATION` (OFF) - Authentic Power switch (`FaPowerOff`)
  2. `KALAI FM TAMIL` (88.1) - Classic FM transistor broadcast radio tuner with antenna & dials (`FaRadio`)
  3. `TAMIL 80'S RADIO` (90.6) - Detailed retro 80s compact audio cassette tape (`BsCassetteFill`)
  4. `TAMIL PANPALAI GO...` (93.4) - Concentric grooves vinyl / compact audio disc (`FaCompactDisc`)
  5. `98.6 MALAYALAM RADIO` (98.6) - Dual-speaker 90s boombox cassette blaster (`BsBoomboxFill`)
  6. `KJ YESUDAS RADIO` (92.4) - Melodic audio tune notation / musical notes (`IoMusicalNotes`)
  7. `RADIO MANGO KOCHI` (91.9) - Modern DJ over-ear studio monitor headphones (`RiHeadphoneFill`)
  8. `SOORIYAN FM` (89.6) - Electric rock guitar with fretboard & pickups (`FaGuitar`)
- **Enhanced Spacing Hierarchy:** Generous `mb-2 sm:mb-2.5` breathing room between icons and station titles, with `mt-1` spacing for frequency subtitles.
- **Center Hub Disc:**
  - Neutral smoked glass circular hub (`bg-black/75 border border-white/25 shadow-inner`) displaying the active station's icon, station name, and frequency.
  - Live audio playback through HTML5 Audio element connected to Radio Browser API live stream URLs.

---

## 3. Separation of Dev Mode UI vs Game HUD
- **Game HUD:** Organic, immersive, warm, translucent glass with zero developer telemetry or debug text.
- **Dev Console:** Distinct minimalist hacker/terminal aesthetic (`font-mono`, dark slate background, green accent) toggled exclusively via the discreet `[DEV]` pill at the top of the screen.
- **Atmospheric Sky & Weather Controls (`src/world/sky/`):**
  - **Decoupled Architecture**: Fully isolated Sky subsystem (`SkyService`, `SkyDome`, `astro`, `palette`, `weather`, `lightning`, `skyShaders`) without touching water, gameplay, or HUD.
  - **Astronomical Sun & Moon System**: Real solar/lunar coordinates, moon phases with procedural craters, sidereal starfield with Milky Way band.
  - **Dynamic Weather System**: Clear, Fair, Overcast, Haze, Fog, Showers, Rain, and Thunderstorm with continuous exponential smoothing.
  - **Atmospheric Weather Optics**: 42° primary/secondary rainbows, 22° ice halos, sun shafts, fogbows, and procedural lightning bolts.
  - **Dev Console Integration**: Full interactive controls under the `Sky & Weather` tab in the Dev Console (time-of-day slider, 1x/60x/300x/1200x time speed, presets, weather sliders, and instant lightning strike trigger).

---

## 4. 3D Orbit Camera & Player Locomotion Controls
- **Tactile 3D Orbit Camera (`OrbitCameraController.ts`)**:
  - **Single Finger / Mouse Drag**: Smoothly orbits camera 360° around player character with weighted inertial damping. Pitch elevation extends from 3° (overhead bird's eye) up to 140° (direct upward sky gaze towards the sun, moon, stars, and clouds) with automatic look-target tilting and ground collision safety.
  - **Two-Finger Pinch / Mouse Wheel**: Zooms in and out smoothly between 2.8m and 24m.
  - **Camera-Relative Locomotion**: Player moves in the direction of the camera view (pushing UP moves away from camera, DOWN moves towards camera, etc.).
- **3D Player Character Avatar (`PlayerController.ts` & `CharacterModule.ts`)**:
  - Stylized South Asian coastal explorer with casual polo shirt, sunglasses, sneakers, and animated limbs.
  - Procedural walking/sprint animation, jump physics with air tuck pose, and fist punch action.
  - Full synchronization with the top-left Minimap radar and gestures/emotes action toolbar.

---

## 5. Mobile Ergonomics & Safe Area Padding
- Horizontal landscape only (portrait blocked with animated rotation instructions).
- Strict adherence to `env(safe-area-inset-*)` padding.
- All touch targets are minimum 44x44px.
