/**
 * Lokam Mini — Lifecycle Manager
 * Manages registered modules, guarantees ordered execution and unified cleanup.
 */

import type { EngineContext, ILifecycle } from './types';

export interface RegisteredModule {
  name: string;
  module: ILifecycle;
  priority: number; // Higher numbers update earlier
}

export class LifecycleManager {
  private modules: RegisteredModule[] = [];
  private isRunning = false;

  register(name: string, module: ILifecycle, priority = 0): void {
    if (this.modules.some((m) => m.name === name)) {
      console.warn(`[LifecycleManager] Module "${name}" already registered. Skipping.`);
      return;
    }
    this.modules.push({ name, module, priority });
    this.modules.sort((a, b) => b.priority - a.priority);
  }

  unregister(name: string): void {
    const idx = this.modules.findIndex((m) => m.name === name);
    if (idx !== -1) {
      const { module } = this.modules[idx];
      module.dispose();
      this.modules.splice(idx, 1);
    }
  }

  getModule<T extends ILifecycle>(name: string): T | undefined {
    const found = this.modules.find((m) => m.name === name);
    return found ? (found.module as T) : undefined;
  }

  get<T extends ILifecycle>(name: string): T | undefined {
    return this.getModule<T>(name);
  }

  getAllModules(): ReadonlyArray<RegisteredModule> {
    return this.modules;
  }

  async initAll(context: EngineContext): Promise<void> {
    for (const { name, module } of this.modules) {
      try {
        await module.init(context);
      } catch (err) {
        console.error(`[LifecycleManager] Failed to init module "${name}":`, err);
        throw err;
      }
    }
  }

  startAll(): void {
    this.isRunning = true;
    for (const { name, module } of this.modules) {
      try {
        module.start();
      } catch (err) {
        console.error(`[LifecycleManager] Failed to start module "${name}":`, err);
      }
    }
  }

  updateAll(delta: number, elapsed: number): void {
    if (!this.isRunning) return;
    for (const { name, module } of this.modules) {
      try {
        module.update(delta, elapsed);
      } catch (err) {
        console.error(`[LifecycleManager] Error in update for module "${name}":`, err);
      }
    }
  }

  disposeAll(): void {
    this.isRunning = false;
    // Dispose in reverse registration order
    for (let i = this.modules.length - 1; i >= 0; i--) {
      const { name, module } = this.modules[i];
      try {
        module.dispose();
      } catch (err) {
        console.error(`[LifecycleManager] Error disposing module "${name}":`, err);
      }
    }
    this.modules = [];
  }
}
