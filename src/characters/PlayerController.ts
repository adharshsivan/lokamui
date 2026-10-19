/**
 * Lokam Mini — PlayerController & 3D Character Avatar
 * Implements smooth third-person character locomotion:
 * - Fluid joystick & WASD movement relative to camera heading
 * - Procedural skeletal limb animation (walk, sprint, jump, idle breathing)
 * - Jump physics & punch combat action
 * - Expressive emote / gesture playback
 * - Soft ground contact shadow
 */

import * as THREE from 'three';
import type { InputService } from '../input/InputService';
import type { OrbitCameraController } from '../core/engine/OrbitCameraController';
import type { EventBus } from '../core/events/EventBus';

export class PlayerController {
  readonly group = new THREE.Group();

  // Character body parts for procedural animation
  private bodyGroup = new THREE.Group();
  private headMesh!: THREE.Mesh;
  private torsoMesh!: THREE.Mesh;
  private leftArmGroup = new THREE.Group();
  private rightArmGroup = new THREE.Group();
  private leftLegGroup = new THREE.Group();
  private rightLegGroup = new THREE.Group();
  private shadowMesh!: THREE.Mesh;

  // Physics & Locomotion state
  position = new THREE.Vector3(0, 0.4, 10);
  private velocity = new THREE.Vector3();
  private isGrounded = true;
  private heading = 0; // facing angle in radians
  private targetHeading = 0;

  private walkCycle = 0;
  private activeEmote: string | null = null;
  private emoteTimer = 0;
  private punchTimer = 0;

  // Walk bounds along Fort Kochi seaside promenade
  private bounds = {
    minX: -8.0,
    maxX: 6.2,
    minZ: -38.0,
    maxZ: 58.0,
    groundY: 0.4,
  };

  constructor(
    private scene: THREE.Scene,
    private input: InputService,
    private cameraController: OrbitCameraController,
    private eventBus?: EventBus
  ) {
    this.buildCharacterMesh();
    this.group.position.copy(this.position);
    this.scene.add(this.group);
  }

  private buildCharacterMesh(): void {
    // 1. Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xcd8c64, // Warm South Asian complexion
      roughness: 0.65,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Tropical Cerulean Blue
      roughness: 0.55,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark Navy Chinos
      roughness: 0.7,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp White Coastal Sneakers
      roughness: 0.4,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x171717, // Jet Black Hair
      roughness: 0.85,
    });

    const shadesMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.1,
      metalness: 0.9,
    });

    // 2. Torso (Casual Polo)
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.65, 16);
    this.torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    this.torsoMesh.position.set(0, 0.95, 0);
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.bodyGroup.add(this.torsoMesh);

    // 3. Head & Hair
    const headGeo = new THREE.SphereGeometry(0.22, 20, 20);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.set(0, 1.48, 0);
    this.headMesh.castShadow = true;
    this.bodyGroup.add(this.headMesh);

    // Stylish haircut
    const hairGeo = new THREE.SphereGeometry(0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 1.5, 0.02);
    this.bodyGroup.add(hairMesh);

    // Cool Aviator Sunglasses
    const shadesGeo = new THREE.BoxGeometry(0.28, 0.08, 0.06);
    const shadesMesh = new THREE.Mesh(shadesGeo, shadesMat);
    shadesMesh.position.set(0, 1.48, 0.2);
    this.bodyGroup.add(shadesMesh);

    // 4. Arms (Pivoted from shoulders at y = 1.2)
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.55, 12);
    armGeo.translate(0, -0.25, 0);

    // Left Arm
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.castShadow = true;
    this.leftArmGroup.position.set(-0.38, 1.2, 0);
    this.leftArmGroup.add(leftArmMesh);
    this.bodyGroup.add(this.leftArmGroup);

    // Right Arm
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.castShadow = true;
    this.rightArmGroup.position.set(0.38, 1.2, 0);
    this.rightArmGroup.add(rightArmMesh);
    this.bodyGroup.add(this.rightArmGroup);

    // 5. Legs (Pivoted from hips at y = 0.65)
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 12);
    legGeo.translate(0, -0.3, 0);

    const shoeGeo = new THREE.BoxGeometry(0.16, 0.12, 0.26);
    shoeGeo.translate(0, -0.62, 0.05);

    // Left Leg & Shoe
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    const leftShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoeMesh.castShadow = true;
    this.leftLegGroup.position.set(-0.16, 0.65, 0);
    this.leftLegGroup.add(leftLegMesh);
    this.leftLegGroup.add(leftShoeMesh);
    this.bodyGroup.add(this.leftLegGroup);

    // Right Leg & Shoe
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    const rightShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoeMesh.castShadow = true;
    this.rightLegGroup.position.set(0.16, 0.65, 0);
    this.rightLegGroup.add(rightLegMesh);
    this.rightLegGroup.add(rightShoeMesh);
    this.bodyGroup.add(this.rightLegGroup);

    this.group.add(this.bodyGroup);

    // 6. Dynamic Ground Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.02, 0);
    this.group.add(this.shadowMesh);
  }

  playEmote(emoteId: string): void {
    this.activeEmote = emoteId;
    this.emoteTimer = 5.0; // 5-second emote cycle
  }

  triggerPunch(): void {
    this.punchTimer = 0.35;
  }

  update(delta: number): void {
    const move = this.input.current.movement;
    const isJumping = this.input.current.jump;
    const isSprinting = this.input.current.sprint;
    const isPunching = this.input.current.primaryAction;

    if (isPunching && this.punchTimer <= 0) {
      this.triggerPunch();
    }

    const moveMag = Math.hypot(move.x, move.y);
    const isMoving = moveMag > 0.08;

    const forward = this.cameraController.getForwardVector();
    const right = this.cameraController.getRightVector();
    const isFPV = this.cameraController.getIsFPV();

    // Movement relative to camera heading
    if (isMoving) {
      this.activeEmote = null; // moving cancels emotes

      const moveDir = new THREE.Vector3()
        .addScaledVector(forward, move.y)
        .addScaledVector(right, move.x)
        .normalize();

      const speed = (isSprinting ? 8.5 : 5.2) * moveMag;
      this.velocity.x = moveDir.x * speed;
      this.velocity.z = moveDir.z * speed;

      // Calculate target character heading
      this.targetHeading = Math.atan2(moveDir.x, moveDir.z);

      // Advance walk cycle
      this.walkCycle += delta * (isSprinting ? 18 : 12) * moveMag;
    } else {
      this.velocity.x *= Math.max(0, 1 - 12 * delta);
      this.velocity.z *= Math.max(0, 1 - 12 * delta);
      if (isFPV) {
        this.targetHeading = Math.atan2(forward.x, forward.z);
      }
    }

    // Jump Physics
    if (isJumping && this.isGrounded) {
      this.velocity.y = 6.8;
      this.isGrounded = false;
      this.activeEmote = null;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y -= 18.0 * delta;
    }

    // Update position
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Ground collision & bounds clamping
    if (this.position.y <= this.bounds.groundY) {
      this.position.y = this.bounds.groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Clamp inside Fort Kochi promenade
    this.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.position.x));
    this.position.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, this.position.z));

    this.group.position.copy(this.position);

    // Smooth heading rotation
    let angleDiff = this.targetHeading - this.heading;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.heading += angleDiff * Math.min(1, 16 * delta);
    this.bodyGroup.rotation.y = this.heading;

    // In FPV, hide player mesh so it doesn't obstruct the first-person camera
    this.bodyGroup.visible = !isFPV;

    // Camera follow target
    this.cameraController.target.set(this.position.x, this.position.y + 1.2, this.position.z);

    // Procedural Limb Animation
    this.animateLimbs(delta, isMoving, moveMag);

    // Shadow opacity & scale based on ground clearance
    const heightAboveGround = this.position.y - this.bounds.groundY;
    const shadowScale = Math.max(0.4, 1 - heightAboveGround * 0.25);
    this.shadowMesh.scale.set(shadowScale, shadowScale, 1);
    (this.shadowMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
      0.1,
      0.35 - heightAboveGround * 0.1
    );

    // Sync heading and coordinates with EventBus for HUD Minimap
    if (this.eventBus) {
      const camHeading = Math.atan2(forward.x, forward.z);
      this.eventBus.emit('player:moved', {
        position: [this.position.x, this.position.y, this.position.z],
        heading: (this.heading * 180) / Math.PI,
        cameraHeading: (camHeading * 180) / Math.PI,
        isMoving,
      });
    }
  }

  private animateLimbs(delta: number, isMoving: boolean, moveMag: number): void {
    if (this.punchTimer > 0) {
      this.punchTimer -= delta;
      const punchPhase = Math.sin((1 - this.punchTimer / 0.35) * Math.PI);
      this.rightArmGroup.rotation.x = -Math.PI * 0.5 * punchPhase;
      this.rightArmGroup.position.z = punchPhase * 0.25;
      return;
    }

    if (this.activeEmote && this.emoteTimer > 0) {
      this.emoteTimer -= delta;
      this.playEmoteAnimation(this.activeEmote, 5.0 - this.emoteTimer);
      return;
    }

    if (!this.isGrounded) {
      // In-air tuck pose
      this.leftLegGroup.rotation.x = 0.6;
      this.rightLegGroup.rotation.x = 0.3;
      this.leftArmGroup.rotation.x = -0.8;
      this.rightArmGroup.rotation.x = -0.8;
      this.torsoMesh.position.y = 0.95;
      return;
    }

    if (isMoving) {
      const swing = Math.sin(this.walkCycle) * 0.65 * Math.min(moveMag, 1);
      const bob = Math.abs(Math.sin(this.walkCycle * 2)) * 0.06;

      this.leftLegGroup.rotation.x = swing;
      this.rightLegGroup.rotation.x = -swing;
      this.leftArmGroup.rotation.x = -swing * 0.85;
      this.rightArmGroup.rotation.x = swing * 0.85;

      this.bodyGroup.position.y = bob;
      this.torsoMesh.rotation.z = Math.sin(this.walkCycle) * 0.04;
    } else {
      // Idle subtle breathing
      const breath = Math.sin(performance.now() * 0.003) * 0.02;
      this.leftLegGroup.rotation.x = 0;
      this.rightLegGroup.rotation.x = 0;
      this.leftArmGroup.rotation.x = breath;
      this.rightArmGroup.rotation.x = -breath;
      this.bodyGroup.position.y = breath;
      this.torsoMesh.rotation.z = 0;
    }
  }

  private playEmoteAnimation(emote: string, elapsed: number): void {
    const t = elapsed * 4;

    if (emote === 'wave') {
      // Raise right arm and wave
      this.rightArmGroup.rotation.x = -Math.PI * 0.85;
      this.rightArmGroup.rotation.z = Math.sin(t * 3) * 0.35 + 0.3;
      this.leftArmGroup.rotation.x = 0;
    } else if (emote === 'dance') {
      // Kerala folk dance sway
      this.bodyGroup.position.y = Math.abs(Math.sin(t * 2)) * 0.08;
      this.bodyGroup.rotation.z = Math.sin(t) * 0.12;
      this.leftArmGroup.rotation.x = Math.sin(t) * 0.6 - 0.5;
      this.rightArmGroup.rotation.x = -Math.sin(t) * 0.6 - 0.5;
    } else if (emote === 'cheer' || emote === 'laugh') {
      // Arms up cheer
      this.leftArmGroup.rotation.x = -Math.PI * 0.75 + Math.sin(t * 2) * 0.2;
      this.rightArmGroup.rotation.x = -Math.PI * 0.75 + Math.sin(t * 2) * 0.2;
      this.bodyGroup.position.y = Math.abs(Math.sin(t * 3)) * 0.1;
    } else if (emote === 'namaste' || emote === 'meditate') {
      // Bring hands together in front
      this.leftArmGroup.rotation.x = -Math.PI * 0.45;
      this.rightArmGroup.rotation.x = -Math.PI * 0.45;
      this.leftArmGroup.rotation.z = 0.5;
      this.rightArmGroup.rotation.z = -0.5;
    } else if (emote === 'flex') {
      // Double bicep pose
      this.leftArmGroup.rotation.x = -Math.PI * 0.6;
      this.rightArmGroup.rotation.x = -Math.PI * 0.6;
      this.leftArmGroup.rotation.z = 0.9;
      this.rightArmGroup.rotation.z = -0.9;
    }
  }

  teleport(pos: [number, number, number]): void {
    this.position.set(pos[0], pos[1], pos[2]);
    this.group.position.copy(this.position);
    this.cameraController.target.set(pos[0], pos[1] + 1.2, pos[2]);
  }

  getPosition(): THREE.Vector3 {
    return this.position;
  }

  getHeading(): number {
    return this.heading;
  }

  dispose(): void {
    this.scene.remove(this.group);
  }
}
