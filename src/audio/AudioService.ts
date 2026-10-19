/**
 * Lokam Mini — AudioService
 * Central audio routing service respecting GlobalSettings volume channels.
 */

import type { GlobalSettings } from '../core/config/GlobalSettings';
import type { AudioChannel, SoundPlayOptions } from './types';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private settingsUnsubscribe: (() => void) | null = null;

  constructor(private settings: GlobalSettings) {
    this.settingsUnsubscribe = this.settings.subscribe(() => {
      // Respond to volume changes if needed
    });
  }

  /**
   * Initializes Web Audio Context on first user gesture.
   */
  async initAudioContext(): Promise<void> {
    if (this.audioContext) return;
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
  }

  play(soundId: string, options: SoundPlayOptions = {}): void {
    const audioSettings = this.settings.audio;
    if (audioSettings.muted) return;

    const channel = options.channel || 'sfx';
    const channelVolume = this.getChannelVolume(channel);
    const finalVolume = (options.volume ?? 1.0) * channelVolume * audioSettings.masterVolume;

    if (finalVolume <= 0) return;

    // Ready for sound playback implementation
  }

  private getChannelVolume(channel: AudioChannel): number {
    const a = this.settings.audio;
    switch (channel) {
      case 'master':
        return a.masterVolume;
      case 'ambient':
        return a.ambientVolume;
      case 'sfx':
        return a.sfxVolume;
      case 'music':
        return a.musicVolume;
      case 'ui':
        return a.uiVolume;
      default:
        return 1.0;
    }
  }

  dispose(): void {
    if (this.settingsUnsubscribe) {
      this.settingsUnsubscribe();
      this.settingsUnsubscribe = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
