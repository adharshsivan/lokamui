/**
 * Lokam Mini — Bag / Inventory Button (Bottom-Right Action Stack)
 * Monochrome smoked acrylic glass button with pure white bag icon (with distinct carry handles).
 * Sized identically to Fist and Jump buttons for perfect optical symmetry.
 */

import React, { useState } from 'react';
import { FaBagShopping } from 'react-icons/fa6';

interface BagButtonProps {
  size?: number;
  onOpenBag?: () => void;
}

export const BagButton: React.FC<BagButtonProps> = ({
  size = 58,
  onOpenBag,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onOpenBag?.();
  };

  return (
    <div
      style={{ width: size, height: size }}
      className="relative select-none pointer-events-auto touch-none flex items-center justify-center cursor-pointer"
      onClick={handleClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      role="button"
      aria-label="Bag / Inventory"
      title="Bag"
    >
      {/* Balanced Smoked Glass Disc */}
      <div
        className={`w-full h-full rounded-full bg-black/40 hover:bg-black/55 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_20px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all ${
          isPressed
            ? 'scale-90 bg-black/60 shadow-[0_0_16px_rgba(255,255,255,0.3)]'
            : 'scale-100'
        }`}
      >
        {/* Unmistakable Real Bag Icon with Twin Carry Handles */}
        <FaBagShopping className="w-6.5 h-6.5 text-white drop-shadow-sm transition-transform" />
      </div>
    </div>
  );
};
