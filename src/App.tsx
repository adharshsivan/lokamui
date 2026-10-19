/**
 * Lokam Mini — Application Root
 * Mounts 3D Canvas, Waterfront Game HUD, Orientation Blocker, and Discreet Dev Toggle.
 */

import React, { useEffect, useRef, useState } from 'react';
import { bootstrapLokamGame } from './app/bootstrap/bootstrap';
import type { LokamGame } from './app/game/LokamGame';
import type { FramePerformanceStats } from './performance/types';
import { GameHUD } from './ui/hud/GameHUD';
import { OrientationBlocker } from './ui/hud/OrientationBlocker';
import { DevConsoleButton } from './ui/dev/DevConsoleButton';
import { DevConsoleModal } from './ui/dev/DevConsoleModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<LokamGame | null>(null);
  const [perfStats, setPerfStats] = useState<FramePerformanceStats | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [devConsoleOpen, setDevConsoleOpen] = useState(false);

  useEffect(() => {
    let activeGame: LokamGame | null = null;
    let isCancelled = false;

    async function init() {
      if (!canvasRef.current) return;

      try {
        const instance = await bootstrapLokamGame({
          canvas: canvasRef.current,
          onPerformanceUpdate: (stats) => {
            if (!isCancelled) {
              setPerfStats({ ...stats });
            }
          },
        });

        if (isCancelled) {
          instance.dispose();
          return;
        }

        activeGame = instance;
        setGame(instance);
      } catch (err: any) {
        console.error('[App] Failed to start Lokam Mini engine:', err);
        if (!isCancelled) {
          setInitError(err.message || 'Unknown initialization error');
        }
      }
    }

    init();

    return () => {
      isCancelled = true;
      if (activeGame) {
        activeGame.dispose();
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 1. Mobile Portrait Blocker ("Coming Soon") */}
      <OrientationBlocker />

      {/* 2. Three.js Game Engine Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        tabIndex={0}
      />

      {/* 3. In-Game Waterfront HUD with 4-Button Action Cluster (No Text) */}
      <GameHUD game={game} />

      {/* 4. Small, Discreet Top Dev Pill */}
      <DevConsoleButton
        isOpen={devConsoleOpen}
        onToggle={() => setDevConsoleOpen((prev) => !prev)}
        fps={perfStats?.fps}
      />

      {/* 5. Developer Diagnostics Modal */}
      <DevConsoleModal
        isOpen={devConsoleOpen}
        onClose={() => setDevConsoleOpen(false)}
        game={game}
        perfStats={perfStats}
      />

      {/* 6. Critical Engine Error Fallback */}
      {initError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-50 p-6 text-white text-center">
          <div className="max-w-md bg-red-950 border border-red-800 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-lg font-bold text-red-300 mb-2">Engine Initialization Error</h2>
            <p className="text-sm text-red-200">{initError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
