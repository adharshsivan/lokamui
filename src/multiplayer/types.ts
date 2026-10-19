/**
 * Lokam Mini — Multiplayer Contracts
 */

export interface RemotePlayerSnapshot {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  animation: string;
  timestamp: number;
}
