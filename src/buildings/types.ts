/**
 * Lokam Mini — Building & Interior Contracts
 */

export interface BuildingDefinition {
  id: string;
  name: string;
  exteriorAssetId: string;
  hasInterior: boolean;
  interiorAssetId?: string;
  doorPosition: [number, number, number];
}

export interface InteriorSceneConfig {
  buildingId: string;
  interiorId: string;
  spawnTransform: [number, number, number];
}
