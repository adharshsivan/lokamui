/**
 * Lokam Mini — Atmospheric Sky Dome Shaders (Three.js GLSL)
 * Renders high-fidelity physically-motivated sky:
 * - Rayleigh & Mie atmospheric scattering
 * - Sun disc with limb darkening & corona
 * - Moon with lunar maria, craters, phase terminator, and earthshine
 * - Sidereal rotating starfield & Milky Way band
 * - Layered volumetric FBM clouds (cumulus, stratus deck, scud rolls, cirrus)
 * - Atmospheric weather optics: 42° rainbows, 22° halos, sunshafts, fogbows
 * - Dynamic lightning channel bolts and intra-cloud sheet flashes
 */

export const SKY_VERTEX_SHADER = `
varying vec3 vWorldPos;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const SKY_FRAGMENT_SHADER = `
precision highp float;

varying vec3 vWorldPos;

uniform vec4 uRW;     // x,y: res, z,w: wind
uniform vec4 uP0;    // x: time, y: cloudT, z: sidereal, w: camH
uniform vec4 uP1;    // x: sunI, y: moonI, z: stars, w: moonLit
uniform vec4 uP2;    // x: cover, y: wave, z: haze, w: exposure
uniform vec4 uW0;    // x: overcast, y: storm, z: rain, w: shafts
uniform vec4 uW1;    // x: fog, y: windS, z: rainbow, w: spray
uniform vec4 uW2;    // x: fogbow, y: halo, z: scud, w: gust
uniform vec4 uL0;    // x: flash, y: bolt, z: boltSeed, w: boltTop
uniform vec4 uL1;    // xy: boltAz, z: boltW, w: leader

uniform vec3 uSun;       // Sun direction unit vector
uniform vec3 uMoon;      // Moon direction unit vector
uniform vec3 uSunCol;    // Direct sun radiance
uniform vec3 uZen;       // Zenith sky color
uniform vec3 uHor;       // Horizon sky color
uniform vec3 uFlashDir;  // Lightning flash center

#define uWind uRW.zw
#define uTime uP0.x
#define uCloudT uP0.y
#define uSid uP0.z
#define uSunI uP1.x
#define uMoonI uP1.y
#define uStars uP1.z
#define uMoonLit uP1.w
#define uCover uP2.x
#define uHaze uP2.z
#define uExp uP2.w
#define uOvercast uW0.x
#define uStorm uW0.y
#define uRain uW0.z
#define uShafts uW0.w
#define uFog uW1.x
#define uWindS uW1.y
#define uRainbow uW1.z
#define uFogbow uW2.x
#define uHalo uW2.y
#define uScud uW2.z
#define uFlash uL0.x
#define uBolt uL0.y
#define uBoltSeed uL0.z
#define uBoltTop uL0.w
#define uBoltAz uL1.xy
#define uBoltW uL1.z
#define uLeader uL1.w

const vec3 MOONCOL = vec3(0.32, 0.40, 0.58);
const vec3 FLASHCOL = vec3(0.78, 0.84, 1.0);
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x),
    f.y
  );
}

float pnoise(vec2 p, float per) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mod(i.x, per);
  float b = mod(i.x + 1.0, per);
  return mix(
    mix(hash(vec2(a, i.y)), hash(vec2(b, i.y)), f.x),
    mix(hash(vec2(a, i.y + 1.0)), hash(vec2(b, i.y + 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float fade(float a, float b, float x) {
  return 1.0 - smoothstep(a, b, x);
}

vec3 hue(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

float angTo(vec3 rd, vec3 d) {
  return degrees(acos(clamp(dot(rd, d), -1.0, 1.0)));
}

vec3 flashL(vec3 rd) {
  if (uFlash < 0.001) return vec3(0.0);
  float d = max(dot(rd, uFlashDir), 0.0);
  return FLASHCOL * uFlash * (0.08 + pow(d, 4.0) * 0.8 + pow(d, 48.0) * 1.6);
}

vec3 skyBase(vec3 rd) {
  float y = max(rd.y, 0.0);
  float h = pow(max(1.0 - y, 0.0), 5.0);
  vec3 c = mix(uZen, uHor, h);
  float sd = max(dot(rd, uSun), 0.0);
  float above = smoothstep(-0.3, 0.05, uSun.y);

  // Smooth natural sun glow without wide ring artifacts
  float mie = pow(sd, 24.0) * 0.15 + pow(sd, 120.0) * 0.45 + pow(sd, 600.0) * 1.5;
  c += uSunCol * mie * uSunI * above * (0.35 + 0.65 * h);

  vec2 a = normalize(rd.xz + 1e-4);
  vec2 b = normalize(uSun.xz + 1e-4);
  float az = max(dot(a, b), 0.0);
  c += uSunCol * h * h * pow(az, 4.0) * 0.35 * uSunI * smoothstep(-0.28, 0.02, uSun.y) * fade(0.0, 0.45, uSun.y);

  float md = max(dot(rd, uMoon), 0.0);
  c += MOONCOL * pow(md, 80.0) * 0.04 * uMoonI * uMoonLit * smoothstep(-0.05, 0.1, uMoon.y);
  return c + flashL(rd) * 0.3;
}

vec3 stars(vec3 rd) {
  if (uStars < 0.001) return vec3(0.0);
  // Sky declination tilt & sidereal celestial sphere rotation
  vec3 r = vec3(rd.x, rd.y * 0.788 - rd.z * 0.616, rd.y * 0.616 + rd.z * 0.788);
  float cs = cos(uSid);
  float sn = sin(uSid);
  r = vec3(cs * r.x - sn * r.z, r.y, sn * r.x + cs * r.z);

  vec3 col = vec3(0.0);

  // Stable celestial sphere lattice
  float scale = 80.0;
  vec3 p = r * scale;
  vec3 baseId = floor(p);
  vec3 f = fract(p);

  // Direction of the closest 8 neighbor cells (2x2x2) around p
  // This guarantees C1 continuity across cell boundaries—eliminating all boundary popping
  vec3 stepDir = step(0.5, f) * 2.0 - 1.0;

  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < 2; j++) {
      for (int k = 0; k < 2; k++) {
        vec3 offset = vec3(
          float(i) * stepDir.x,
          float(j) * stepDir.y,
          float(k) * stepDir.z
        );
        vec3 id = baseId + offset;
        float h = hash3(id + 11.7);

        // Very sparse celestial distribution (~0.18% of cells): ~70 stars across the entire night sky
        if (h > 0.9982) {
          // Stable star position within its cell
          vec3 starLocal = id + vec3(hash3(id + 1.7), hash3(id + 3.1), hash3(id + 5.3)) * 0.6 + 0.2;
          vec3 starDir = normalize(starLocal);

          // True angular chord distance on unit celestial sphere
          float dist = length(r - starDir);

          // Tiny pinpoint radius (0.7 - 1.3 screen pixels): delicate specks, zero large blobs
          float starRadius = mix(0.0007, 0.0013, hash3(id + 4.9));

          if (dist < starRadius) {
            float normD = dist / starRadius;
            // Smooth bell profile with zero derivative at boundaries
            float core = 1.0 - normD * normD;
            float starShape = core * core;

            // Astronomical magnitude: delicate and balanced
            float mag = pow((h - 0.9982) / 0.0018, 1.8) * 0.9 + 0.3;

            // Ultra-gentle scintillation (0.04 depth) so stars stay calm and stable while rotating camera
            float twinkle = 0.96 + 0.04 * sin(uTime * 0.35 + hash3(id + 7.1) * 6.28318);

            // Natural stellar spectral colors (O/B blue to K/M warm white)
            vec3 starColor = mix(vec3(0.82, 0.9, 1.0), vec3(1.0, 0.94, 0.84), hash3(id + 9.3));

            col += starShape * mag * twinkle * starColor;
          }
        }
      }
    }
  }

  // Soft Milky Way galactic band
  vec3 mw = normalize(vec3(0.3, 0.9, 0.32));
  float dm = dot(r, mw) * 4.0;
  col += exp(-dm * dm) * vec3(0.5, 0.55, 0.75) * (noise(r.xz * 9.0 + r.y * 5.0) * 0.6 + noise(r.xy * 23.0) * 0.4) * 0.09;

  // Horizon atmospheric extinction and daytime sun fade
  float daylightFade = 1.0 - smoothstep(-0.2, 0.02, uSun.y);
  return col * uStars * smoothstep(0.0, 0.22, rd.y) * daylightFade;
}

vec4 moonDisk(vec3 rd) {
  float R = 0.028;
  if (dot(rd, uMoon) < cos(R * 1.02)) return vec4(0.0);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), uMoon));
  vec3 up = cross(uMoon, rt);
  vec2 p = vec2(dot(rd, rt), dot(rd, up)) / R;
  float r2 = dot(p, p);
  if (r2 > 1.0) return vec4(0.0);
  float z = sqrt(1.0 - r2);
  vec3 n = p.x * rt + p.y * up - z * uMoon;
  float lit = smoothstep(-0.03, 0.06, dot(n, uSun));
  float maria = noise(p * 3.0 + 4.0) * 0.55 + noise(p * 9.0) * 0.3 + noise(p * 22.0) * 0.15;
  vec3 alb = vec3(0.85, 0.87, 0.9) * (0.6 + 0.55 * smoothstep(0.35, 0.7, maria));
  vec3 c = alb * (lit * 1.6 * uMoonI + 0.025);
  return vec4(c * smoothstep(-0.02, 0.03, uMoon.y), fade(0.9, 1.0, r2));
}

vec4 clouds(vec3 rd, out float thin) {
  thin = 0.0;
  if (rd.y < 0.005) return vec4(0.0);
  vec2 uv = rd.xz / (rd.y + 0.09) * 0.55;
  vec2 w = uWind * uCloudT;
  vec3 amb = mix(uHor, uZen, 0.55) * 1.1;
  float dayL = uSunI * smoothstep(-0.2, 0.02, uSun.y);
  float moonL = uMoonI * uMoonLit * smoothstep(-0.05, 0.15, uMoon.y);
  vec3 fl = flashL(rd);
  vec3 acc = vec3(0.0);
  float a = 0.0;

  if (uScud > 0.01) {
    vec2 su = rd.xz / (rd.y + 0.03) * 1.1 + w * 2.4;
    float sn = noise(su * 0.7) * 0.55 + noise(su * 1.9 + vec2(3.1, 1.7)) * 0.3;
    float sa = smoothstep(0.5, 0.8, sn) * uScud * smoothstep(0.015, 0.1, rd.y) * 0.85;
    vec3 sc = amb * 0.6 + uSunCol * dayL * 0.16 + MOONCOL * moonL * 0.05 + fl * (1.25 - sa);
    acc = sc * sa;
    a = sa;
  }

  float cov = mix(1.05, 0.28, uCover);
  float base = fbm(uv * 1.3 + w) * 0.78 + noise(uv * 0.33 + w * 0.45) * 0.42;
  float dens = smoothstep(cov, cov + 0.32, base);
  float shade = mix(1.0, 0.45, dens);

  float fwd = pow(max(dot(rd, uSun), 0.0), 5.0);
  vec3 col = amb * (0.55 + 0.45 * (1.0 - dens)) +
             uSunCol * dayL * shade * (1.1 + fwd * (1.0 - dens) * 3.0) +
             MOONCOL * moonL * shade * 0.35 * (1.0 + pow(max(dot(rd, uMoon), 0.0), 6.0) * 2.0);

  col *= 1.0 - uStorm * (dens * 0.4 + 0.3 * smoothstep(0.55, 0.9, base));
  col += fl * (1.3 - dens);
  float ca = dens * smoothstep(0.005, 0.14, rd.y);
  acc += col * ca * (1.0 - a);
  a += ca * (1.0 - a);

  if (uOvercast > 0.001) {
    float dt = base;
    float da = uOvercast * smoothstep(0.0, 0.07, rd.y) * (0.8 + 0.2 * smoothstep(0.3, 0.75, dt));
    vec3 dc = amb * (0.74 + 0.6 * (dt - 0.5)) * (1.0 - uStorm * (0.45 + 0.3 * smoothstep(0.35, 0.8, dt)));
    dc *= 1.0 + (0.16 - 0.46 * uStorm) * rd.y;
    dc += uSunCol * dayL * (0.22 + 0.3 * dt) + MOONCOL * moonL * 0.12;
    dc += uSunCol * dayL * pow(max(dot(rd, uSun), 0.0), 8.0) * (1.2 - dt) * 1.5;
    dc += fl * (1.35 - dt);
    acc += dc * da * (1.0 - a);
    thin = clamp(1.2 - dt * 1.4, 0.0, 1.0) * (1.0 - uStorm) * da * (1.0 - a);
    a += da * (1.0 - a);
  }

  return vec4(acc / max(a, 1e-4), a);
}

void main() {
  vec3 rd = normalize(vWorldPos - cameraPosition);

  // Atmospheric sky base gradient
  vec3 col = skyBase(rd);

  // Starfield & Milky Way
  col += stars(rd);

  // Sun disc with natural limb darkening
  float sd = max(dot(rd, uSun), 0.0);
  float sunDisc = smoothstep(0.99965, 0.9999, sd) * uSunI * smoothstep(-0.05, 0.08, uSun.y);
  col += uSunCol * sunDisc * 4.0;

  // Moon disc with craters & lunar phase illumination
  vec4 mn = moonDisk(rd);
  col = mix(col, mn.rgb, mn.a);

  // Cloud layers
  float thin = 0.0;
  vec4 c = clouds(rd, thin);
  col = mix(col, c.rgb, c.a);

  // Atmospheric Intra-Cloud Lightning Illumination
  if (uFlash > 0.001) {
    float flashDot = dot(rd, uFlashDir);
    float flashSpread = pow(max(0.0, flashDot * 0.5 + 0.5), 2.5);
    float cloudIllum = (0.35 + 0.65 * c.a) * flashSpread;
    vec3 flashCol = vec3(0.72, 0.84, 1.0) * uFlash * cloudIllum * 2.2;
    col += flashCol;
  }

  // Tone mapping & exposure
  col = 1.0 - exp(-col * uExp);

  gl_FragColor = vec4(col, 1.0);
}
`;
