/**
 * Lokam Mini — Sky & Weather Service
 * Coordinates Astronomy, Weather Presets, Lightning, Atmospheric Lighting, and Three.js Sky Dome.
 * Provides clean query/mutation API for Dev Controls and Game Lifecycle.
 */

import * as THREE from 'three';
import { computeAstro, type SkyAstro } from './astro';
import { samplePalette, applyWeather, type Palette } from './palette';
import {
  WeatherSystem,
  DEFAULT_PARAMS,
  type EnvParams,
  type WeatherName,
  type WeatherKey,
  PRESETS,
} from './weather';
import { LightningSystem } from './lightning';
import { LightningMesh } from './LightningMesh';
import { SkyDome } from './SkyDome';
import { RainFX } from './RainFX';
import type { EventBus } from '../../core/events/EventBus';

export interface RainControls {
  enabled: boolean;
  manualOverride: boolean;
  intensity: number; // 0..1
  splashes: boolean;
  speed: number;
}

export interface SkyState {
  hour: number; // 0..24
  timeSpeed: number; // multiplier on real-time (0 = paused, 1 = normal, 60, 300, 1200)
  weatherName: WeatherName | 'Custom';
  autoForecast: boolean;
  astro: SkyAstro;
  params: EnvParams;
  palette: Palette;
  rain: RainControls;
}

export type SkyStateListener = (state: SkyState) => void;

export class SkyService {
  private date = new Date(2026, 9, 2, 14, 0, 0); // Start at 2:00 PM (Lush Kerala afternoon)
  private hourOverride: number | null = 14.0;
  private timeSpeed = 1.0;

  readonly weather = new WeatherSystem();
  readonly lightning = new LightningSystem();
  readonly currentParams: EnvParams = { ...DEFAULT_PARAMS };
  readonly targetParams: EnvParams = { ...DEFAULT_PARAMS };

  private skyDome: SkyDome | null = null;
  private lightningMesh: LightningMesh | null = null;
  private rainFX: RainFX | null = null;
  private sunLight: THREE.DirectionalLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private sceneFog: THREE.Fog | null = null;
  private lastCamYaw = 0;

  readonly rainControls: RainControls = {
    enabled: true,
    manualOverride: false,
    intensity: 0,
    splashes: true,
    speed: 11.0,
  };

  private listeners = new Set<SkyStateListener>();

  constructor(private eventBus?: EventBus) {}

  initSkyDome(scene: THREE.Scene): void {
    if (this.skyDome) return;
    this.skyDome = new SkyDome();
    scene.add(this.skyDome.mesh);

    // Realistic 3D Fractal Lightning Strike Mesh
    this.lightningMesh = new LightningMesh(scene);

    // 1. Synchronized Celestial Sun/Moon Directional Light
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 400;
    const d = 80;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    scene.add(this.sunLight);

    // 2. Synchronized Sky Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffedd5, 0.7);
    scene.add(this.ambientLight);

    // Initial weather preset
    this.weather.apply('Fair', this.targetParams, this.currentParams);
  }

  initRain(canvas: HTMLCanvasElement): void {
    if (this.rainFX) return;
    this.rainFX = new RainFX({
      parent: canvas.parentElement || document.body,
      intensity: this.currentParams.rain,
      wind: this.currentParams.wind,
      windDir: this.currentParams.windDir,
      splashes: this.rainControls.splashes,
      speed: this.rainControls.speed,
    });
  }

  update(camera: THREE.Camera, delta: number): void {
    // Advance simulation time
    if (this.timeSpeed > 0) {
      const dtHours = (delta * this.timeSpeed) / 3600;
      if (this.hourOverride !== null) {
        this.hourOverride = (this.hourOverride + dtHours) % 24;
      }
    }

    const simT = (this.hourOverride ?? 14) * 3600;
    this.weather.update(delta, this.currentParams, this.targetParams, simT, this.timeSpeed);

    // Camera yaw for lightning direction
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const camYaw = Math.atan2(camDir.x, camDir.z);

    this.lastCamYaw = camYaw;
    this.lightning.update(delta, this.currentParams.lightning, camYaw);

    // Update 3D Fractal Lightning Strike Mesh
    if (this.lightningMesh) {
      this.lightningMesh.update(camera, this.lightning);
    }

    // Compute astronomical positions
    const astro = computeAstro(this.date, this.hourOverride ?? undefined);

    // Sample and grade atmospheric palette
    const rawPalette = samplePalette(astro.sunElev);
    const palette = applyWeather(
      rawPalette,
      {
        overcast: this.currentParams.overcast,
        storm: this.currentParams.storm,
        fog: this.currentParams.fog,
        haze: this.currentParams.haze,
        rain: this.currentParams.rain,
      },
      astro.sunElev
    );

    // Update moisture for rainbow optics
    this.weather.updateMoisture(delta, this.currentParams.rain);
    const rainbowStrength =
      astro.sunElev > 5 && astro.sunElev < 42
        ? Math.min(this.weather.moisture, 1) * (1 - this.currentParams.overcast * 0.8)
        : 0;

    // Update Three.js Sky Dome Shader
    if (this.skyDome) {
      this.skyDome.update(
        camera,
        delta,
        astro,
        palette,
        this.currentParams,
        this.lightning,
        rainbowStrength
      );
    }

    // Synchronize Scene Lighting
    this.updateSceneLighting(astro, palette);

    // Update RainFX simulation & rendering
    if (this.rainFX) {
      // Synchronize rain intensity with weather or manual override
      const effectiveIntensity = this.rainControls.manualOverride
        ? this.rainControls.intensity
        : this.currentParams.rain;

      this.rainFX.setIntensity(this.rainControls.enabled ? effectiveIntensity : 0);
      this.rainFX.setWind(this.currentParams.wind, this.currentParams.windDir);
      this.rainFX.splashesEnabled = this.rainControls.splashes;
      this.rainFX.fallSpeed = this.rainControls.speed;

      this.rainFX.update(camera, delta);
      this.rainFX.render(camera);
    }

    // Notify Dev Console UI listeners
    if (this.listeners.size > 0) {
      const state = this.getState();
      for (const listener of this.listeners) {
        listener(state);
      }
    }
  }

  private updateSceneLighting(astro: SkyAstro, palette: Palette): void {
    if (!this.sunLight || !this.ambientLight) return;

    // Position sun light along solar / lunar direction
    const isDay = astro.sunElev > -4;
    const dir = isDay ? astro.sunDir : astro.moonDir;
    this.sunLight.position.set(dir[0] * 120, Math.max(dir[1] * 120, 8), dir[2] * 120);

    // Sun light color & intensity
    if (isDay) {
      this.sunLight.color.setRGB(palette.sun[0], palette.sun[1], palette.sun[2]);
      const sunAbove = Math.min(Math.max((astro.sunElev + 2) / 10, 0), 1);
      this.sunLight.intensity = (1.4 - this.currentParams.overcast * 0.9) * this.currentParams.sunI * sunAbove;
    } else {
      this.sunLight.color.setRGB(0.4, 0.5, 0.7);
      this.sunLight.intensity = 0.25 * this.currentParams.moonI * astro.moonIllum;
    }

    // Ambient light matching atmospheric horizon & zenith blend
    const ambR = (palette.horizon[0] * 0.7 + palette.zenith[0] * 0.3) * 1.2;
    const ambG = (palette.horizon[1] * 0.7 + palette.zenith[1] * 0.3) * 1.2;
    const ambB = (palette.horizon[2] * 0.7 + palette.zenith[2] * 0.3) * 1.2;
    this.ambientLight.color.setRGB(ambR, ambG, ambB);
    this.ambientLight.intensity = Math.max(0.2, (isDay ? 0.75 : 0.25) + this.lightning.flash * 0.8);
  }

  // ── MUTATION APIS FOR DEV CONTROLS & GAMEPLAY ──

  setHour(hour: number): void {
    this.hourOverride = Math.max(0, Math.min(24, hour));
  }

  setTimeSpeed(multiplier: number): void {
    this.timeSpeed = multiplier;
  }

  setWeatherPreset(name: WeatherName): void {
    this.rainControls.manualOverride = false;
    this.weather.apply(name, this.targetParams);
  }

  setWeatherParam(key: WeatherKey | 'sunI' | 'moonI' | 'stars' | 'windDir', value: number): void {
    this.targetParams[key as keyof EnvParams] = value;
    this.currentParams[key as keyof EnvParams] = value;
    if (key === 'rain') {
      this.rainControls.intensity = value;
    }
    this.weather.label = 'Custom';
  }

  setRainControl<K extends keyof RainControls>(key: K, value: RainControls[K]): void {
    this.rainControls[key] = value;
    if (key === 'intensity') {
      this.rainControls.manualOverride = true;
      this.targetParams.rain = value as number;
      this.currentParams.rain = value as number;
    }
    if (this.listeners.size > 0) {
      const state = this.getState();
      for (const listener of this.listeners) {
        listener(state);
      }
    }
  }

  setAutoForecast(enabled: boolean): void {
    this.weather.setAuto(enabled);
  }

  triggerLightningStrike(): void {
    this.lightning.trigger(this.lastCamYaw, 0.35, 'bolt');
  }

  getState(): SkyState {
    const astro = computeAstro(this.date, this.hourOverride ?? undefined);
    const rawPalette = samplePalette(astro.sunElev);
    const palette = applyWeather(
      rawPalette,
      {
        overcast: this.currentParams.overcast,
        storm: this.currentParams.storm,
        fog: this.currentParams.fog,
        haze: this.currentParams.haze,
        rain: this.currentParams.rain,
      },
      astro.sunElev
    );

    return {
      hour: this.hourOverride ?? 14,
      timeSpeed: this.timeSpeed,
      weatherName: this.weather.label,
      autoForecast: this.weather.auto,
      astro,
      params: { ...this.currentParams },
      palette,
      rain: {
        ...this.rainControls,
        intensity: this.rainControls.manualOverride
          ? this.rainControls.intensity
          : this.currentParams.rain,
      },
    };
  }

  getRainCanvas(): HTMLCanvasElement | null {
    return this.rainFX?.canvas ?? null;
  }

  getRainFX(): RainFX | null {
    return this.rainFX;
  }

  subscribe(listener: SkyStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose(): void {
    if (this.rainFX) {
      this.rainFX.destroy();
      this.rainFX = null;
    }
    if (this.lightningMesh) {
      this.lightningMesh.dispose();
      this.lightningMesh = null;
    }
    if (this.skyDome) {
      this.skyDome.dispose();
      this.skyDome = null;
    }
    this.listeners.clear();
  }
}
