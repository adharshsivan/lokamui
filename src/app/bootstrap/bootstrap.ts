/**
 * Lokam Mini — Bootstrap
 * Client application startup runner with web/mobile diagnostics.
 */

import { LokamGame, type LokamGameOptions } from '../game/LokamGame';

export async function bootstrapLokamGame(options: LokamGameOptions): Promise<LokamGame> {
  const game = new LokamGame(options);
  try {
    await game.start();
    return game;
  } catch (err) {
    console.error('[LokamBootstrap] Fatal startup failure:', err);
    game.dispose();
    throw err;
  }
}
