/**
 * Lokam Mini — Weather Subsystem
 * Weather presets, continuous exponential smoothing, and deterministic forecast.
 */

import { dayOfYear } from './astro';

export type WeatherName =
  | 'Clear'
  | 'Fair'
  | 'Overcast'
  | 'Haze'
  | 'Fog'
  | 'Showers'
  | 'Rain'
  | 'Thunderstorm';

export const WEATHER_ORDER: WeatherName[] = [
  'Clear',
  'Fair',
  'Overcast',
  'Haze',
  'Fog',
  'Showers',
  'Rain',
  'Thunderstorm',
];

export interface EnvParams {
  cover: number;
  cloudSpeed: number;
  windDir: number;
  wave: number;
  haze: number;
  sunI: number;
  moonI: number;
  stars: number;
  overcast: number;
  storm: number;
  rain: number;
  fog: number;
  wind: number;
  lightning: number;
  gust: number;
}

export const WEATHER_KEYS = [
  'cover',
  'cloudSpeed',
  'wave',
  'haze',
  'overcast',
  'storm',
  'rain',
  'fog',
  'wind',
  'lightning',
  'gust',
] as const;

export type WeatherKey = (typeof WEATHER_KEYS)[number];
export type WeatherState = Record<WeatherKey, number>;

const S = (
  cover: number,
  cloudSpeed: number,
  wave: number,
  haze: number,
  overcast: number,
  storm: number,
  rain: number,
  fog: number,
  wind: number,
  lightning: number,
  gust: number
): WeatherState => ({
  cover,
  cloudSpeed,
  wave,
  haze,
  overcast,
  storm,
  rain,
  fog,
  wind,
  lightning,
  gust,
});

export const PRESETS: Record<WeatherName, WeatherState> = {
  Clear: S(0.1, 0.35, 0.4, 0.2, 0, 0, 0, 0, 0.18, 0, 0.2),
  Fair: S(0.46, 0.55, 0.58, 0.38, 0, 0, 0, 0, 0.32, 0, 0.3),
  Overcast: S(0.88, 0.6, 0.72, 0.55, 0.82, 0.12, 0, 0.05, 0.42, 0, 0.3),
  Haze: S(0.15, 0.3, 0.35, 1, 0, 0, 0, 0.15, 0.1, 0, 0.1),
  Fog: S(0.5, 0.2, 0.22, 0.7, 0.45, 0, 0, 0.9, 0.06, 0, 0.05),
  Showers: S(0.72, 0.9, 0.8, 0.4, 0.12, 0.35, 0.6, 0.04, 0.5, 0, 0.6),
  Rain: S(0.95, 1, 1, 0.6, 0.92, 0.45, 0.75, 0.2, 0.6, 0.04, 0.45),
  Thunderstorm: S(1, 1.5, 1.4, 0.6, 1, 1, 1, 0.22, 1, 0.85, 0.9),
};

export const WEATHER_DESCRIPTIONS: Record<WeatherName, string> = {
  Clear: 'Sunny tropical skies, calm ocean breeze, and crisp sunlight',
  Fair: 'Drifting cumulus clouds casting soft coastal shadows over Fort Kochi',
  Overcast: 'Lush monsoon cloud cover with soft diffuse ambient light',
  Haze: 'Warm coastal aerosol haze, milky horizon, and soft golden aureole',
  Fog: 'Drifting seaside morning fog rolling in across the Arabian Sea',
  Showers: 'Passing tropical downpours with rain shafts and sunlit rainbows',
  Rain: 'Steady Kerala monsoon rain, low clouds, and humid sea air',
  Thunderstorm: 'Dramatic tropical squall with rolling thunder and lightning strikes',
};

export const DEFAULT_PARAMS: EnvParams = {
  windDir: 40,
  sunI: 1,
  moonI: 1,
  stars: 1,
  ...PRESETS.Fair,
};

const TAU: Record<WeatherKey, [number, number]> = {
  cover: [2.2, 3.5],
  cloudSpeed: [2, 3],
  wave: [4, 5.5],
  haze: [3, 3.5],
  overcast: [2.5, 4.5],
  storm: [3, 3],
  rain: [3.5, 1.6],
  fog: [4, 4.5],
  wind: [2, 3],
  lightning: [4.5, 1.2],
  gust: [3, 3],
};

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export class WeatherSystem {
  auto = false;
  transition = 1;
  label: WeatherName | 'Custom' = 'Fair';
  moisture = 0;
  private autoName: WeatherName | null = null;

  apply(name: WeatherName, target: EnvParams, current?: EnvParams) {
    const s = PRESETS[name];
    for (const k of WEATHER_KEYS) {
      target[k] = s[k];
      if (current) current[k] = s[k];
    }
    this.label = name;
  }

  setAuto(on: boolean) {
    this.auto = on;
    this.autoName = null;
  }

  update(dt: number, cur: EnvParams, tgt: EnvParams, simT: number, simSpeed: number) {
    if (this.auto) {
      const n = this.forecastAt(simT);
      if (n !== this.autoName) {
        this.autoName = n;
        this.apply(n, tgt);
      }
    }

    const ts = this.transition * (this.auto ? clamp(900 / Math.max(1, simSpeed), 0.12, 1) : 1);
    for (const k of WEATHER_KEYS) {
      const c = cur[k];
      const t = tgt[k];
      if (c === t) continue;
      const tau = Math.max(1e-3, TAU[k][t > c ? 0 : 1] * ts);
      const nv = c + (t - c) * (1 - Math.exp(-dt / tau));
      cur[k] = Math.abs(nv - t) < 1e-4 ? t : nv;
    }
  }

  updateMoisture(dt: number, rainLocal: number) {
    const k = 1 - Math.exp(-dt / (rainLocal > this.moisture ? 2.5 : 22));
    this.moisture += (rainLocal - this.moisture) * k;
  }

  private forecastAt(timeSec: number): WeatherName {
    const hour = (timeSec / 3600) % 24;
    const cycle = Math.floor(hour / 3) % WEATHER_ORDER.length;
    return WEATHER_ORDER[cycle];
  }
}
