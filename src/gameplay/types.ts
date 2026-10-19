/**
 * Lokam Mini — Gameplay Contracts
 * Interactions, seating, and camera controls.
 */

export interface InteractionTarget {
  id: string;
  label: string;
  distance: number;
  position: [number, number, number];
}
