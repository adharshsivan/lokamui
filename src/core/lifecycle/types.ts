/**
 * Lokam Mini — Lifecycle Contract
 * Standard interface adhered to by all major modules and location packages.
 */

import type { GameEngine } from '../engine/GameEngine';
import type { ServiceRegistry } from '../services/ServiceRegistry';

export interface EngineContext {
  engine: GameEngine;
  services: ServiceRegistry;
}

export type LifecycleStatus =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'running'
  | 'paused'
  | 'disposed';

export interface ILifecycle {
  /**
   * Status of this lifecycle component
   */
  readonly status: LifecycleStatus;

  /**
   * Initializes module resources, sets up event listeners, prepares dependencies.
   */
  init(context: EngineContext): Promise<void> | void;

  /**
   * Activates the module and attaches objects to the scene graph.
   */
  start(): void;

  /**
   * Per-frame simulation and animation update.
   * @param delta Seconds passed since previous frame.
   * @param elapsed Total seconds elapsed since game start.
   */
  update(delta: number, elapsed: number): void;

  /**
   * Pauses or resumes processing without tearing down state.
   */
  setEnabled(enabled: boolean): void;

  /**
   * Complete teardown: disposes Three.js meshes/materials/textures, removes DOM listeners, cancels timers.
   */
  dispose(): void;
}
