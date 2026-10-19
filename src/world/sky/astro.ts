/**
 * Lokam Mini — Astronomy & Time Subsystem
 * Deterministic astronomical calculations:
 * Computes solar and lunar positions, lunar age/phase, sidereal angle, and solar elevations.
 */

export const LATITUDE = 9.9312; // Fort Kochi, Kerala, India latitude (approx 9.93° N)
const D2R = Math.PI / 180;

export type Vec3 = [number, number, number];

export interface SkyAstro {
  sunDir: Vec3;
  moonDir: Vec3;
  sunElev: number;
  sunAz: number;
  moonElev: number;
  moonAz: number;
  moonAge: number;
  moonIllum: number;
  phaseName: string;
  sidereal: number;
  hours: number;
}

export function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return (d.getTime() - start.getTime()) / 86400000;
}

function dirFrom(Hdeg: number, declDeg: number): Vec3 {
  const phi = LATITUDE * D2R;
  const H = Hdeg * D2R;
  const dl = declDeg * D2R;
  const east = -Math.cos(dl) * Math.sin(H);
  const north = Math.cos(phi) * Math.sin(dl) - Math.sin(phi) * Math.cos(dl) * Math.cos(H);
  const up = Math.sin(phi) * Math.sin(dl) + Math.cos(phi) * Math.cos(dl) * Math.cos(H);
  return [east, up, north];
}

export function getMoonPhaseName(age: number): string {
  const a = age * 29.53;
  if (a < 1.2 || a > 28.3) return 'New Moon';
  if (a < 6.4) return 'Waxing Crescent';
  if (a < 8.4) return 'First Quarter';
  if (a < 13.8) return 'Waxing Gibbous';
  if (a < 15.8) return 'Full Moon';
  if (a < 21.1) return 'Waning Gibbous';
  if (a < 23.1) return 'Last Quarter';
  return 'Waning Crescent';
}

/**
 * Computes accurate astronomical orientation for Sun, Moon, and Stars.
 * @param date Current simulation date
 * @param hoursOverride Optional fixed local time-of-day in hours (0..24)
 */
export function computeAstro(date: Date, hoursOverride?: number): SkyAstro {
  const hours =
    hoursOverride ??
    date.getHours() +
      date.getMinutes() / 60 +
      date.getSeconds() / 3600 +
      date.getMilliseconds() / 3.6e6;

  const N = dayOfYear(date);
  const decl = 23.44 * Math.sin((2 * Math.PI * (284 + N)) / 365);
  const H = (hours - 12) * 15;
  const sunDir = dirFrom(H, decl);
  const jd = date.getTime() / 86400000 + 2440587.5;
  let age = ((jd - 2451550.1) / 29.530588853) % 1;
  if (age < 0) age += 1;
  const moonH = H - age * 360;
  const moonDecl = decl * Math.cos(age * 2 * Math.PI) + 5.1 * Math.sin(jd * 0.2299);
  const moonDir = dirFrom(moonH, moonDecl);
  const el = (v: Vec3) => Math.asin(Math.max(-1, Math.min(1, v[1]))) / D2R;
  const az = (v: Vec3) => ((Math.atan2(v[0], v[2]) / D2R) + 360) % 360;

  return {
    sunDir,
    moonDir,
    sunElev: el(sunDir),
    sunAz: az(sunDir),
    moonElev: el(moonDir),
    moonAz: az(moonDir),
    moonAge: age,
    moonIllum: (1 - Math.cos(age * 2 * Math.PI)) / 2,
    phaseName: getMoonPhaseName(age),
    sidereal: (hours / 24 + N / 365.25) * 2 * Math.PI,
    hours,
  };
}
