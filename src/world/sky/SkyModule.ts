/**
 * Lokam Mini — Sky Subsystem Lifecycle Module
 */

import { BaseModule } from '../../core/lifecycle/BaseModule';
import type { EngineContext } from '../../core/lifecycle/types';

export class SkyModule extends BaseModule {
  protected async onInit(context: EngineContext): Promise<void> {
    const { scene } = context.engine;
    const { sky } = context.services as any;

    if (sky) {
      sky.initSkyDome(scene);
    }
  }

  protected onStart(): void {}

  protected onUpdate(delta: number, _elapsed: number): void {
    // Engine frame loop updates sky service
  }

  protected onDispose(): void {}
}
