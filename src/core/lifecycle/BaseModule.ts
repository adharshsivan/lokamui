/**
 * Lokam Mini — Base Module
 * Base implementation providing automatic disposable tracking and safe lifecycle handling.
 */

import type { EngineContext, ILifecycle, LifecycleStatus } from './types';

export interface DisposableResource {
  dispose(): void;
}

export abstract class BaseModule implements ILifecycle {
  protected context: EngineContext | null = null;
  private _status: LifecycleStatus = 'uninitialized';
  private _enabled = true;
  private _disposables: Array<(() => void) | DisposableResource> = [];

  get status(): LifecycleStatus {
    return this._status;
  }

  get isEnabled(): boolean {
    return this._enabled;
  }

  async init(context: EngineContext): Promise<void> {
    this._status = 'initializing';
    this.context = context;
    await this.onInit(context);
    this._status = 'ready';
  }

  start(): void {
    if (this._status !== 'ready' && this._status !== 'paused') {
      return;
    }
    this._status = 'running';
    this.onStart();
  }

  update(delta: number, elapsed: number): void {
    if (!this._enabled || this._status !== 'running') {
      return;
    }
    this.onUpdate(delta, elapsed);
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    this.onEnabledChange(enabled);
  }

  dispose(): void {
    this._status = 'disposed';
    this._enabled = false;

    // Run registered disposables in reverse order
    while (this._disposables.length > 0) {
      const item = this._disposables.pop();
      if (!item) continue;
      try {
        if (typeof item === 'function') {
          item();
        } else if (item && typeof item.dispose === 'function') {
          item.dispose();
        }
      } catch (err) {
        console.error(`[BaseModule] Error during disposal in ${this.constructor.name}:`, err);
      }
    }

    this.onDispose();
    this.context = null;
  }

  /**
   * Register a cleanup action (callback or object with .dispose())
   * Automatically triggered on module dispose.
   */
  protected registerDisposable<T extends (() => void) | DisposableResource>(disposable: T): T {
    this._disposables.push(disposable);
    return disposable;
  }

  // Lifecycle hooks for derived classes
  protected async onInit(_context: EngineContext): Promise<void> {}
  protected onStart(): void {}
  protected onUpdate(_delta: number, _elapsed: number): void {}
  protected onEnabledChange(_enabled: boolean): void {}
  protected onDispose(): void {}
}
