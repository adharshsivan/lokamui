/**
 * Lokam Mini — Instanced Prop Manager
 * Batches hundreds of identical scenery objects (e.g. coconut palms, benches, streetlights)
 * into a single Three.js InstancedMesh to keep draw calls low on mobile devices.
 */

import * as THREE from 'three';

export interface InstanceTransform {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export class InstancedPropManager {
  private dummy = new THREE.Object3D();

  /**
   * Create an InstancedMesh from a base geometry, material, and array of transforms.
   */
  createBatchedMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    instances: InstanceTransform[]
  ): THREE.InstancedMesh {
    const count = instances.length;
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    instances.forEach((inst, index) => {
      this.dummy.position.set(inst.position[0], inst.position[1], inst.position[2]);

      if (inst.rotation) {
        this.dummy.rotation.set(inst.rotation[0], inst.rotation[1], inst.rotation[2]);
      } else {
        this.dummy.rotation.set(0, 0, 0);
      }

      if (inst.scale) {
        this.dummy.scale.set(inst.scale[0], inst.scale[1], inst.scale[2]);
      } else {
        this.dummy.scale.set(1, 1, 1);
      }

      this.dummy.updateMatrix();
      mesh.setMatrixAt(index, this.dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }
}
