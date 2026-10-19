/**
 * Lokam Mini — MaterialRegistry
 * Centralized registry for shared material families.
 * Eliminates duplicate material creation, reduces WebGL state switches and draw calls.
 */

import * as THREE from 'three';
import type { MaterialFamilyId, MaterialConfig } from './types';

export class MaterialRegistry {
  private materials = new Map<MaterialFamilyId | string, THREE.Material>();

  // Baseline standard material family configurations
  private readonly defaultConfigs: Record<MaterialFamilyId, MaterialConfig> = {
    'wall.plaster.white': {
      id: 'wall.plaster.white',
      color: 0xf5f4f0, // Clean off-white tropical stucco
      roughness: 0.85,
      metalness: 0.05,
    },
    'wall.plaster.warm': {
      id: 'wall.plaster.warm',
      color: 0xe6cfb0, // Kochi heritage colonial warm ochre
      roughness: 0.88,
      metalness: 0.04,
    },
    'roof.terracotta': {
      id: 'roof.terracotta',
      color: 0xb34d28, // Kerala clay Mangalore terracotta roof tile
      roughness: 0.75,
      metalness: 0.05,
    },
    'concrete.clean': {
      id: 'concrete.clean',
      color: 0x9ca3af, // Coastal promenade / pier concrete
      roughness: 0.9,
      metalness: 0.1,
    },
    'wood.dark': {
      id: 'wood.dark',
      color: 0x3e2715, // Kerala teakwood / weathered timber
      roughness: 0.65,
      metalness: 0.02,
    },
    'metal.paint': {
      id: 'metal.paint',
      color: 0x1f2937, // Wrought iron gates / dark painted steel railings
      roughness: 0.4,
      metalness: 0.7,
    },
    'glass.standard': {
      id: 'glass.standard',
      color: 0xdbeafe, // Clean window glass
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.45,
    },
    'road.asphalt': {
      id: 'road.asphalt',
      color: 0x2b2d30, // Weathered island road asphalt
      roughness: 0.92,
      metalness: 0.1,
    },
    'ground.dirt': {
      id: 'ground.dirt',
      color: 0x6e5239, // Coastal soil & dirt paths
      roughness: 0.95,
      metalness: 0.0,
    },
    'ground.grass': {
      id: 'ground.grass',
      color: 0x4d7c3b, // Tropical lush green turf
      roughness: 0.85,
      metalness: 0.0,
    },
  };

  /**
   * Retrieve a shared material instance.
   * If not already created, instantiates and caches it.
   */
  get(familyId: MaterialFamilyId | string): THREE.Material {
    let mat = this.materials.get(familyId);
    if (mat) return mat;

    // Check if it is one of the standard predefined families
    const cfg = this.defaultConfigs[familyId as MaterialFamilyId];
    if (cfg) {
      mat = this.createStandardMaterial(cfg);
    } else {
      // Fallback neutral material
      mat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.8,
        metalness: 0.1,
        name: familyId,
      });
    }

    this.materials.set(familyId, mat);
    return mat;
  }

  /**
   * Register a custom or textured material family
   */
  register(id: string, material: THREE.Material): void {
    if (this.materials.has(id)) {
      console.warn(`[MaterialRegistry] Material "${id}" is being replaced.`);
    }
    this.materials.set(id, material);
  }

  has(id: string): boolean {
    return this.materials.has(id) || id in this.defaultConfigs;
  }

  private createStandardMaterial(cfg: MaterialConfig): THREE.MeshStandardMaterial {
    const mat = new THREE.MeshStandardMaterial({
      name: cfg.id,
      color: new THREE.Color(cfg.color),
      roughness: cfg.roughness,
      metalness: cfg.metalness,
      transparent: Boolean(cfg.transparent),
      opacity: cfg.opacity ?? 1.0,
    });
    return mat;
  }

  dispose(): void {
    for (const mat of this.materials.values()) {
      mat.dispose();
    }
    this.materials.clear();
  }
}
