/**
 * Lokam Mini — Audio Service Types
 */

export type AudioChannel = 'master' | 'ambient' | 'sfx' | 'music' | 'ui';

export interface SoundPlayOptions {
  channel?: AudioChannel;
  volume?: number;
  loop?: boolean;
  position?: [number, number, number];
}
