/**
 * Lokam Mini — Dev Console Button
 * Compact, distinct technical developer button separate from the game HUD.
 */

import React from 'react';
import { Terminal, Zap } from 'lucide-react';

interface DevConsoleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  fps?: number;
}

export const DevConsoleButton: React.FC<DevConsoleButtonProps> = ({
  isOpen,
  onToggle,
  fps = 60,
}) => {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle Developer Console"
      className={`fixed top-2.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-full font-mono text-[9px] tracking-wider uppercase flex items-center space-x-1.5 shadow-md border backdrop-blur-md transition-all cursor-pointer pointer-events-auto select-none opacity-60 hover:opacity-100 ${
        isOpen
          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-emerald-500/20 opacity-100'
          : 'bg-black/40 hover:bg-black/70 text-slate-300 border-white/15'
      }`}
    >
      <Terminal className="w-2.5 h-2.5 text-emerald-400" />
      <span className="font-semibold text-[8.5px]">DEV</span>
      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-slate-400 font-mono text-[8px]">[{fps} FPS]</span>
    </button>
  );
};
