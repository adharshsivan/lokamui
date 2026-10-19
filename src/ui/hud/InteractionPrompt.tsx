/**
 * Lokam Mini — Contextual Interaction Prompt
 * Translucent neutral smoked glass pill matching the exact aesthetic of HUD buttons and controls,
 * with a continuous live glimmering white animated border, crisp white vector glyph, and delicate anchor stem.
 */

import React from 'react';
import { Bike, Coffee, Armchair, Ship, Sparkles } from 'lucide-react';

export interface InteractionPromptData {
  id: string;
  label: string;
  type: 'ride' | 'tea' | 'seating' | 'ferry' | 'inspect';
  screenPosition?: { x: number; y: number };
}

interface InteractionPromptProps {
  prompt?: InteractionPromptData | null;
  onInteract?: (id: string) => void;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({
  prompt = {
    id: 'kerala_roadster_bike_01',
    label: 'Ride',
    type: 'ride',
    screenPosition: { x: 53, y: 52 },
  },
  onInteract,
}) => {
  if (!prompt) return null;

  const posX = prompt.screenPosition?.x ?? 53;
  const posY = prompt.screenPosition?.y ?? 52;

  const renderIcon = () => {
    switch (prompt.type) {
      case 'ride':
        return <Bike className="w-4 h-4 text-white stroke-[2.2] drop-shadow-sm" />;
      case 'tea':
        return <Coffee className="w-4 h-4 text-white stroke-[2.2] drop-shadow-sm" />;
      case 'seating':
        return <Armchair className="w-4 h-4 text-white stroke-[2.2] drop-shadow-sm" />;
      case 'ferry':
        return <Ship className="w-4 h-4 text-white stroke-[2.2] drop-shadow-sm" />;
      default:
        return <Sparkles className="w-4 h-4 text-white stroke-[2.2] drop-shadow-sm" />;
    }
  };

  return (
    <div
      style={{ left: `${posX}%`, top: `${posY}%` }}
      className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto select-none transition-all duration-200 z-30"
    >
      <div
        className="flex flex-col items-center group cursor-pointer"
        onClick={() => onInteract?.(prompt.id)}
      >
        {/* Animated Glimmering Colored Gradient Border Wrapper (Live Activity Glow) */}
        <div className="relative p-[1.5px] rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_14px_rgba(255,255,255,0.25),0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.7),0_0_22px_rgba(255,255,255,0.4),0_0_28px_rgba(244,114,182,0.35)] group-active:scale-95 transition-all duration-200">
          {/* Continuous Live Prismatic Chromatic Conic Ring */}
          <div className="absolute -inset-[200%] glimmer-border-glow pointer-events-none" />

          {/* Inner Neutral Smoked Glass Interaction Capsule (No Blue Tint, 100% HUD-aligned) */}
          <div className="relative z-10 flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0a0e17]/85 backdrop-blur-xl text-white">
            {renderIcon()}
            <span className="font-semibold text-xs sm:text-[13px] tracking-wide text-white drop-shadow-sm font-sans">
              {prompt.label}
            </span>
          </div>
        </div>

        {/* Delicate Downward Anchor Stem with Glimmer Accent */}
        <div className="w-[1.5px] h-3.5 bg-gradient-to-b from-white/80 to-white/30" />

        {/* Gleaming Anchor Dot */}
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-ping absolute" />
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)] ring-1 ring-black/80" />
        </div>
      </div>
    </div>
  );
};
