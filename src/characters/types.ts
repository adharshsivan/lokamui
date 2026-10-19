/**
 * Lokam Mini — Character Subsystem Contracts
 */

export interface CharacterTransform {
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface CharacterState {
  id: string;
  isPlayer: boolean;
  transform: CharacterTransform;
  isMoving: boolean;
  isGrounded: boolean;
  activeAnimation: 'idle' | 'walk' | 'run' | 'sit' | 'jump';
}

export interface ICharacterController {
  readonly id: string;
  readonly state: CharacterState;
  teleport(position: [number, number, number]): void;
}
