/**
 * Lokam Mini — AssetLoader
 * Network-efficient asset loader with request deduplication and format routing.
 */

import * as THREE from 'three';
import type { AssetDefinition } from './types';

export class AssetLoader {
  private inFlight = new Map<string, Promise<unknown>>();
  private textureLoader = new THREE.TextureLoader();

  /**
   * Load an asset defined by its AssetDefinition.
   * If a load for the same URL is already in progress, reuses the existing Promise.
   */
  async load<T = unknown>(def: AssetDefinition): Promise<T> {
    const existingPromise = this.inFlight.get(def.url);
    if (existingPromise) {
      return existingPromise as Promise<T>;
    }

    const loadPromise = this.executeLoad(def);
    this.inFlight.set(def.url, loadPromise);

    try {
      const result = await loadPromise;
      return result as T;
    } finally {
      this.inFlight.delete(def.url);
    }
  }

  private async executeLoad(def: AssetDefinition): Promise<unknown> {
    switch (def.type) {
      case 'texture':
        return this.loadTexture(def.url);
      case 'audio':
        return this.loadAudio(def.url);
      case 'json':
        return this.loadJson(def.url);
      case 'model':
        return this.loadModel(def.url, def.id);
      default:
        throw new Error(`[AssetLoader] Unsupported asset type "${def.type}" for ID "${def.id}"`);
    }
  }

  private loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (err) => reject(new Error(`[AssetLoader] Failed to load texture at ${url}: ${err}`))
      );
    });
  }

  private async loadJson(url: string): Promise<unknown> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`[AssetLoader] HTTP ${res.status} loading JSON from ${url}`);
    }
    return res.json();
  }

  private async loadAudio(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`[AssetLoader] HTTP ${res.status} loading audio from ${url}`);
    }
    return res.arrayBuffer();
  }

  /**
   * Model loading with architecture-safe procedural fallback
   * when 3D model files are yet to be dropped into public/assets/.
   */
  private async loadModel(url: string, id: string): Promise<THREE.Object3D> {
    // Attempt fetch to check file existence
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        // When dynamic GLTFLoader is added with real assets:
        // const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        // ...
      }
    } catch {
      // File not present yet on disk; construct procedural placeholder model
    }

    // Return an architecture placeholder representing this asset ID
    return this.createPlaceholderModel(id);
  }

  private createPlaceholderModel(id: string): THREE.Group {
    const group = new THREE.Group();
    group.name = `asset_placeholder_${id}`;

    // Minimal geometry for placeholder visualization
    const geom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    return group;
  }
}
