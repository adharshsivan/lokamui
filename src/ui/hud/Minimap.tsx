/**
 * Lokam Mini — Synchronized Reactive Minimap Radar (Top-Left HUD)
 * - Map moves dynamically in real-time tracking the player's true 3D world coordinates.
 * - Center golden player arrow points and rotates dynamically with player heading.
 * - Vision cone radiates in the camera look direction so looking around is visually apparent.
 * - 3 directional tick lines (East, South, West) + North marker ("N") provide true compass orientation.
 * - Compact 'N' badge size with always-upright text for perfect legibility.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { LokamGame } from '../../app/game/LokamGame';
import type { InputService } from '../../input/InputService';
import type { CharacterModule } from '../../characters/CharacterModule';

interface MinimapProps {
  game?: LokamGame | null;
  inputService?: InputService;
  playerHeading?: number;
  locationTitle?: string;
}

export const Minimap: React.FC<MinimapProps> = ({
  game,
  inputService,
  playerHeading = 0,
}) => {
  // Dynamic player position & heading updated in real-time from 3D player controller & camera
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [heading, setHeading] = useState(playerHeading);
  const [camHeading, setCamHeading] = useState(playerHeading);

  const posRef = useRef({ x: 0, y: 0 });
  const headingRef = useRef(playerHeading);
  const camHeadingRef = useRef(playerHeading);

  // Subscribe to EventBus and run high-rate rAF loop to ensure 60fps buttery tracking
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    // Cache event bus listener for immediate broadcast updates
    const eventBus = game?.services.eventBus;
    let unbindEvent: (() => void) | null = null;

    if (eventBus) {
      unbindEvent = eventBus.on('player:moved', (data: any) => {
        if (data.position) {
          // World coordinates: X is East (+), Z is South (+)
          // Spawn is around (0, 10)
          const relX = data.position[0];
          const relZ = data.position[2] - 10;
          // Scale: 1.8px per world meter
          const targetX = -relX * 1.8;
          const targetY = -relZ * 1.8;
          posRef.current.x = targetX;
          posRef.current.y = targetY;
        }

        if (typeof data.heading === 'number') {
          // Three.js to Screen Angle: (180 - heading)
          const targetScreenAngle = ((180 - data.heading) % 360 + 360) % 360;
          let diff = (targetScreenAngle - headingRef.current) % 360;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          headingRef.current += diff * 0.4;
        }

        if (typeof data.cameraHeading === 'number') {
          const targetCamAngle = ((180 - data.cameraHeading) % 360 + 360) % 360;
          let diff = (targetCamAngle - camHeadingRef.current) % 360;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          camHeadingRef.current += diff * 0.4;
        }
      });
    }

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // 1. Direct Sampling from live Game Engine
      if (game) {
        try {
          const charModule = game.lifecycle.get('character') as CharacterModule | undefined;
          const player = charModule?.getPlayer?.();
          const camController = game.getEngine()?.cameraController;

          if (player) {
            // World to Minimap Map translation
            const pos = player.getPosition();
            const relX = pos.x;
            const relZ = pos.z - 10;
            const targetMapX = -relX * 1.8;
            const targetMapY = -relZ * 1.8;

            // Clamp so map texture doesn't overflow edge
            const clampedX = Math.max(-45, Math.min(45, targetMapX));
            const clampedY = Math.max(-55, Math.min(55, targetMapY));

            posRef.current.x += (clampedX - posRef.current.x) * Math.min(1, dt * 14);
            posRef.current.y += (clampedY - posRef.current.y) * Math.min(1, dt * 14);

            // Player character heading in world space
            const playerHeadingDeg = (player.getHeading() * 180) / Math.PI;
            const targetScreenAngle = ((180 - playerHeadingDeg) % 360 + 360) % 360;

            let diffH = (targetScreenAngle - headingRef.current) % 360;
            if (diffH > 180) diffH -= 360;
            if (diffH < -180) diffH += 360;
            headingRef.current += diffH * Math.min(1, dt * 18);

            // Camera look direction
            if (camController) {
              const camForward = camController.getForwardVector();
              const camHeadingDeg = (Math.atan2(camForward.x, camForward.z) * 180) / Math.PI;
              const targetCamAngle = ((180 - camHeadingDeg) % 360 + 360) % 360;

              let diffC = (targetCamAngle - camHeadingRef.current) % 360;
              if (diffC > 180) diffC -= 360;
              if (diffC < -180) diffC += 360;
              camHeadingRef.current += diffC * Math.min(1, dt * 18);
            }
          }
        } catch {
          // Graceful fallback
        }
      } else if (inputService) {
        // Fallback simulation if game instance is not yet ready
        const move = inputService.current.movement;
        if (Math.abs(move.x) > 0.05 || Math.abs(move.y) > 0.05) {
          posRef.current.x += move.x * 20 * dt;
          posRef.current.y += move.y * 20 * dt;
          posRef.current.x = Math.max(-35, Math.min(35, posRef.current.x));
          posRef.current.y = Math.max(-35, Math.min(35, posRef.current.y));

          const targetAngle = ((Math.atan2(move.x, -move.y) * (180 / Math.PI)) % 360 + 360) % 360;
          let diff = (targetAngle - headingRef.current) % 360;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          headingRef.current += diff * Math.min(1, dt * 14);
          camHeadingRef.current = headingRef.current;
        }
      }

      setPosition({ ...posRef.current });
      setHeading(headingRef.current);
      setCamHeading(camHeadingRef.current);

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => {
      cancelAnimationFrame(animId);
      if (unbindEvent) unbindEvent();
    };
  }, [game, inputService]);

  return (
    <div className="relative select-none pointer-events-auto">
      {/* Main Radar Circle with Glass Translucency */}
      <div className="relative w-28 h-28 sm:w-30 sm:h-30 rounded-full shadow-[0_10px_32px_rgba(0,0,0,0.55)] overflow-hidden bg-black/40 backdrop-blur-md border border-white/10">
        {/* Dynamic Moving Map Texture Layer */}
        <div
          className="absolute top-1/2 left-1/2 w-[240%] h-[240%] max-w-none pointer-events-none transition-transform duration-75 ease-out opacity-85"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(1.15)`,
          }}
        >
          <img
            src="/src/assets/images/fantasy_rpg_minimap_1790933642326.jpg"
            alt="Island Minimap"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>

        {/* Camera Vision Cone (Points in the exact direction the camera is looking) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-transform duration-75 ease-out"
          style={{
            transform: `rotate(${camHeading}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <div className="w-16 h-16 -translate-y-3">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <defs>
                <radialGradient id="camVisionGlow" cx="50%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>
              <polygon points="50,90 20,10 80,10" fill="url(#camVisionGlow)" />
            </svg>
          </div>
        </div>

        {/* Center Golden Player Direction Arrow (Dead Centered, Rotates dynamically with player heading) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className="w-5 h-5 flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `rotate(${heading}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full filter drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.85)]"
            >
              <polygon
                points="12,2 20,20 12,15 4,20"
                fill="#facc15"
                stroke="#0f172a"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <polygon points="12,2 12,15 4,20" fill="#fde047" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── CARDINAL COMPASS FRAME (Fixed True North Orientation) ── */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* 1. East Axis Direction Line (+90° from North) */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-[1.5px] bg-white/90 shadow-sm" />

        {/* 2. South Axis Direction Line (+180° from North) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-2 bg-white/90 shadow-sm" />

        {/* 3. West Axis Direction Line (+270° from North) */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-[1.5px] bg-white/90 shadow-sm" />

        {/* 4. North Axis Marker Badge ('N' - Sits proudly at True North) */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-[#090d16] border-[1.2px] border-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.7)] ring-1 ring-black/50 pointer-events-auto">
          <span className="text-[9px] font-black text-white leading-none select-none">
            N
          </span>
        </div>
      </div>
    </div>
  );
};
