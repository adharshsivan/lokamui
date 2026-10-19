/**
 * Lokam Mini — Character Module
 * Instantiates the player character, manages locomotion updates, emote handling, and camera integration.
 */

import { BaseModule } from '../core/lifecycle/BaseModule';
import type { EngineContext } from '../core/lifecycle/types';
import { PlayerController } from './PlayerController';

export class CharacterModule extends BaseModule {
  private player: PlayerController | null = null;

  protected async onInit(context: EngineContext): Promise<void> {
    const { eventBus, input } = context.services;
    const { scene, cameraController } = context.engine;

    // 1. Create player controller instance
    if (cameraController) {
      this.player = new PlayerController(scene, input, cameraController, eventBus);
    }

    // 2. Listen to emote triggers from HUD
    const unbindEmote = eventBus.on('player:emote', ({ emoteId }) => {
      if (this.player) {
        this.player.playEmote(emoteId);
      }
    });

    // 3. Listen to location loaded / fast travel teleport
    const unbindLocation = eventBus.on('location:loaded', (payload) => {
      const activeLoc = context.services.locations.get(payload.locationId);
      if (activeLoc && this.player) {
        const spawn = activeLoc.getSpawnPoint('player');
        this.player.teleport(spawn.position);
      }
    });

    // 4. Listen to direct player teleport events
    const unbindTeleport = eventBus.on('player:teleported', ({ position }) => {
      if (this.player) {
        this.player.teleport(position);
      }
    });

    this.registerDisposable(unbindEmote);
    this.registerDisposable(unbindLocation);
    this.registerDisposable(unbindTeleport);
  }

  protected onStart(): void {
    // Character systems active
  }

  protected onUpdate(delta: number, _elapsed: number): void {
    if (this.player) {
      this.player.update(delta);
    }
  }

  protected onDispose(): void {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  }

  getPlayer(): PlayerController | null {
    return this.player;
  }
}
