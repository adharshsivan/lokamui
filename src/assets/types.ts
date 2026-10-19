/**
 * Lokam Mini — Asset Types & Manifest Schema
 */

import type * as THREE from 'three';

export type AssetCategory =
  | 'vegetation'
  | 'prop'
  | 'street'
  | 'material'
  | 'texture'
  | 'animation'
  | 'audio'
  | 'character'
  | 'vehicle'
  | 'building';

export type AssetType =
  | 'model'
  | 'texture'
  | 'material'
  | 'audio'
  | 'animation'
  | 'json';

export type AssetScope = 'global' | `location:${string}`;

export interface AssetDefinition {
  id: string; // e.g. "tree.coconut.01", "prop.bench.wood.01"
  category: AssetCategory;
  type: AssetType;
  url: string;
  scope: AssetScope;
  preload?: boolean;
  metadata?: Record<string, unknown>;
}

export interface LoadedAsset<T = unknown> {
  id: string;
  data: T;
  type: AssetType;
  scope: AssetScope;
  loadedAt: number;
  refCount: number;
}

export type MaterialFamilyId =
  | 'wall.plaster.white'
  | 'wall.plaster.warm'
  | 'roof.terracotta'
  | 'concrete.clean'
  | 'wood.dark'
  | 'metal.paint'
  | 'glass.standard'
  | 'road.asphalt'
  | 'ground.dirt'
  | 'ground.grass';

export interface MaterialConfig {
  id: MaterialFamilyId;
  color: number | string;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
  textureId?: string;
  normalMapId?: string;
  bumpScale?: number;
}
