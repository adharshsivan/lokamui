/**
 * Lokam Mini — Vehicle Subsystem Types
 */

export type VehicleCategory = 'auto_rickshaw' | 'bicycle' | 'scooter' | 'boat' | 'car';

export interface VehicleDefinition {
  id: string;
  name: string;
  category: VehicleCategory;
  assetId: string;
  maxSpeed: number;
  acceleration: number;
  seats: number;
}

export interface VehicleState {
  id: string;
  definitionId: string;
  driverId: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  currentSpeed: number;
}
