import type { AppliedFilters, Preset } from "../types/preset";
import { IDENTITY_PRESET } from "../presets/presets";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Intensity 50 = preset as designed, 0 = none, 100 = 2× the designed effect. */
export function applyIntensity(preset: Preset, intensity: number): AppliedFilters {
  const t = intensity / 50;
  const mix = (identity: number, value: number) => identity + (value - identity) * t;
  const keys = Object.keys(IDENTITY_PRESET) as (keyof AppliedFilters)[];
  const next = { ...IDENTITY_PRESET };
  for (const key of keys) {
    next[key] = mix(IDENTITY_PRESET[key], preset[key]);
  }
  return next;
}

export function combineFilters(base: AppliedFilters, tweaks: AppliedFilters): AppliedFilters {
  return {
    brightness: clamp(base.brightness * tweaks.brightness, 0.25, 1.8),
    contrast: clamp(base.contrast * tweaks.contrast, 0.4, 2),
    saturation: clamp(base.saturation * tweaks.saturation, 0.15, 2),
    blur: clamp(base.blur + tweaks.blur, 0, 8),
    grain: clamp(base.grain + tweaks.grain, 0, 1),
    bloom: clamp(base.bloom + tweaks.bloom, 0, 1),
    warmth: clamp(base.warmth + tweaks.warmth, -1.5, 1.5),
    fade: clamp(base.fade + tweaks.fade, 0, 1),
    blue: clamp(base.blue + tweaks.blue, 0, 1.4),
    hue: clamp(base.hue + tweaks.hue, -40, 40),
    shadows: clamp(base.shadows + tweaks.shadows, 0, 1),
    highlights: clamp(base.highlights + tweaks.highlights, 0, 1),
    vignette: clamp(base.vignette + tweaks.vignette, 0, 1),
    haze: clamp(base.haze + tweaks.haze, 0, 1),
    lightLeak: clamp(base.lightLeak + tweaks.lightLeak, 0, 1),
    aberration: clamp(base.aberration + tweaks.aberration, 0, 1),
    skyGradient: clamp(base.skyGradient + tweaks.skyGradient, 0, 1),
    frame: clamp(base.frame + tweaks.frame, 0, 1),
    doubleExposure: clamp(base.doubleExposure + tweaks.doubleExposure, 0, 1),
    windowRain: clamp(base.windowRain + tweaks.windowRain, 0, 1),
    flashBurn: clamp(base.flashBurn + tweaks.flashBurn, 0, 1),
    rawLook: clamp(base.rawLook + tweaks.rawLook, 0, 1),
    colorCast: clamp(base.colorCast + tweaks.colorCast, -1.2, 1.2),
    scanDust: clamp(base.scanDust + tweaks.scanDust, 0, 1),
    foldedTape: clamp(base.foldedTape + tweaks.foldedTape, 0, 1),
    shake: clamp(base.shake + tweaks.shake, 0, 1),
    splitExposure: clamp(base.splitExposure + tweaks.splitExposure, -1, 1),
  };
}

export function cssFilterString(filters: AppliedFilters, pixelScale = 1): string {
  const parts = [
    `brightness(${filters.brightness})`,
    `contrast(${filters.contrast})`,
    `saturate(${filters.saturation})`,
  ];
  if (Math.abs(filters.hue) > 0.4) {
    parts.push(`hue-rotate(${filters.hue.toFixed(1)}deg)`);
  }
  if (filters.blur > 0.05) {
    parts.push(`blur(${(filters.blur * pixelScale).toFixed(2)}px)`);
  }
  return parts.join(" ");
}

const grainCache = { canvas: null as HTMLCanvasElement | null, width: 0, height: 0 };
const bloomCanvas = typeof document === "undefined" ? null : document.createElement("canvas");

function getGrainCanvas(width: number, height: number): HTMLCanvasElement {
  if (grainCache.canvas && grainCache.width === width && grainCache.height === height) {
    return grainCache.canvas;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 70;
  }

  ctx.putImageData(imageData, 0, 0);
  grainCache.canvas = canvas;
  grainCache.width = width;
  grainCache.height = height;
  return canvas;
}

function rng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

type OverlayCache = { canvas: HTMLCanvasElement | null; width: number; height: number };
const rainCache: OverlayCache = { canvas: null, width: 0, height: 0 };
const dustCache: OverlayCache = { canvas: null, width: 0, height: 0 };

function makeOverlay(cache: OverlayCache, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  if (cache.canvas && cache.width === width && cache.height === height) return cache.canvas;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx);
  cache.canvas = canvas;
  cache.width = width;
  cache.height = height;
  return canvas;
}

function getRainOverlay(width: number, height: number): HTMLCanvasElement {
  return makeOverlay(rainCache, width, height, (ctx) => {
    const rand = rng(width * 31 + height * 17);
    ctx.clearRect(0, 0, width, height);
    const fog = ctx.createLinearGradient(0, 0, 0, height);
    fog.addColorStop(0, "rgba(220,230,240,0.28)");
    fog.addColorStop(0.35, "rgba(220,230,240,0.08)");
    fog.addColorStop(1, "rgba(220,230,240,0)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(210,225,240,0.28)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 32; i += 1) {
      const x = rand() * width;
      const y = rand() * height * 0.72;
      const len = 16 + rand() * 80;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + (rand() - 0.5) * 8, y + len * 0.55, x + (rand() - 0.5) * 5, y + len);
      ctx.stroke();
    }

    const count = 70;
    for (let i = 0; i < count; i += 1) {
      const x = rand() * width;
      const y = rand() * height;
      const rx = 1.2 + rand() * 3.5;
      const ry = rx * (1.6 + rand());
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rand() - 0.5) * 0.4);
      const drop = ctx.createRadialGradient(0, -ry * 0.2, 0, 0, 0, ry);
      drop.addColorStop(0, "rgba(255,255,255,0.75)");
      drop.addColorStop(0.45, "rgba(200,220,235,0.25)");
      drop.addColorStop(1, "rgba(200,220,235,0)");
      ctx.fillStyle = drop;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const condensation = ctx.createLinearGradient(0, height * 0.58, 0, height);
    condensation.addColorStop(0, "rgba(200,215,230,0)");
    condensation.addColorStop(1, "rgba(200,215,230,0.4)");
    ctx.fillStyle = condensation;
    ctx.fillRect(0, 0, width, height);
  });
}

function getDustOverlay(width: number, height: number): HTMLCanvasElement {
  return makeOverlay(dustCache, width, height, (ctx) => {
    const rand = rng(width * 13 + height * 47);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(20,16,12,0.18)";
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y + rand());
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = 0; i < 120; i += 1) {
      const x = rand() * width;
      const y = rand() * height;
      const s = 0.4 + rand() * 1.8;
      ctx.fillStyle = rand() > 0.5 ? "rgba(30,24,18,0.55)" : "rgba(255,255,245,0.35)";
      ctx.fillRect(x, y, s, s * (0.4 + rand()));
    }
    ctx.strokeStyle = "rgba(25,20,16,0.45)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.02);
    ctx.quadraticCurveTo(width * 0.22, height * 0.18, width * 0.08, height * 0.42);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.92, height * 0.08);
    ctx.quadraticCurveTo(width * 0.78, height * 0.2, width * 0.88, height * 0.38);
    ctx.stroke();
  });
}

function drawDoubleExposure(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  const min = Math.min(width, height);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = Math.min(0.45, amount * 0.4);
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.58);
  sky.addColorStop(0, "rgba(10, 22, 58, 0.95)");
  sky.addColorStop(0.55, "rgba(18, 36, 78, 0.35)");
  sky.addColorStop(1, "rgba(18, 36, 78, 0)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = Math.min(0.7, amount * 0.62);

  const moonX = width * 0.78;
  const moonY = height * 0.18;
  const moonR = min * 0.09;
  const moon = ctx.createRadialGradient(moonX - moonR * 0.2, moonY - moonR * 0.2, moonR * 0.1, moonX, moonY, moonR);
  moon.addColorStop(0, "rgba(245,248,255,0.95)");
  moon.addColorStop(1, "rgba(180,200,230,0)");
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = Math.min(0.5, amount * 0.4);
  ctx.fillStyle = "rgba(230,240,255,0.9)";
  for (let i = 0; i < 18; i += 1) {
    const x = (((i * 97) % 1000) / 1000) * width;
    const y = (((i * 53) % 420) / 1000) * height;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  ctx.globalAlpha = Math.min(0.75, amount * 0.7);
  const lights = [
    [0.18, 0.78],
    [0.42, 0.86],
    [0.63, 0.72],
    [0.84, 0.8],
  ];
  for (const [px, py] of lights) {
    const x = width * px;
    const y = height * py;
    const lamp = ctx.createRadialGradient(x, y, 0, x, y, min * 0.16);
    lamp.addColorStop(0, "rgba(255, 220, 140, 0.95)");
    lamp.addColorStop(0.4, "rgba(255, 160, 60, 0.35)");
    lamp.addColorStop(1, "rgba(255, 160, 60, 0)");
    ctx.fillStyle = lamp;
    ctx.fillRect(x - min * 0.16, y - min * 0.16, min * 0.32, min * 0.32);
  }
  ctx.restore();
}

function drawWindowRain(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = Math.min(0.4, amount * 0.36);
  ctx.fillStyle = "#9eb4c8";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  const overlay = getRainOverlay(width, height);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = Math.min(0.85, amount * 0.8);
  ctx.drawImage(overlay, 0, 0);
  ctx.restore();
}

function drawFlashBurn(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  const cx = width * 0.5;
  const cy = height * 0.42;
  const radius = Math.max(width, height) * 0.85;
  ctx.save();
  const burn = ctx.createRadialGradient(cx, cy, radius * 0.02, cx, cy, radius * 0.42);
  burn.addColorStop(0, "rgba(255,255,248,0.95)");
  burn.addColorStop(0.35, "rgba(255,250,230,0.35)");
  burn.addColorStop(1, "rgba(255,250,230,0)");
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = Math.min(0.9, amount * 0.85);
  ctx.fillStyle = burn;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  const edge = ctx.createRadialGradient(cx, cy, radius * 0.28, cx, cy, radius);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(8,6,4,0.85)");
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = Math.min(0.8, amount * 0.7);
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawRawLook(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = Math.min(0.35, amount * 0.32);
  ctx.fillStyle = "#fff6ea";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  const min = Math.min(width, height);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = Math.min(0.5, amount * 0.42);
  const patches: Array<[number, number, number]> = [
    [0.52, 0.28, 0.13],
    [0.3, 0.22, 0.08],
    [0.7, 0.4, 0.07],
  ];
  for (const [px, py, pr] of patches) {
    const x = width * px;
    const y = height * py;
    const r = min * pr;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, "rgba(255,255,250,0.95)");
    glow.addColorStop(1, "rgba(255,255,250,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();

  const spots = [
    [0.38, 0.36],
    [0.58, 0.35],
  ];
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = Math.min(0.55, amount * 0.5);
  for (const [px, py] of spots) {
    const x = width * px;
    const y = height * py;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, min * 0.035);
    glow.addColorStop(0, "rgba(255, 40, 30, 0.95)");
    glow.addColorStop(0.45, "rgba(180, 20, 30, 0.4)");
    glow.addColorStop(1, "rgba(180, 20, 30, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - min * 0.04, y - min * 0.04, min * 0.08, min * 0.08);
  }
  ctx.restore();
}

function drawFoldedTape(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  const min = Math.min(width, height);
  const fold = min * (0.12 + amount * 0.1);
  ctx.save();
  ctx.globalAlpha = Math.min(0.95, 0.55 + amount * 0.4);
  ctx.fillStyle = "#d8c7a4";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(fold, 0);
  ctx.lineTo(0, fold);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(40,30,20,0.18)";
  ctx.beginPath();
  ctx.moveTo(fold * 0.15, fold * 0.15);
  ctx.lineTo(fold, 0);
  ctx.lineTo(0, fold);
  ctx.closePath();
  ctx.fill();

  ctx.translate(width * 0.28, height * 0.015);
  ctx.rotate(-0.18);
  ctx.fillStyle = "rgba(232, 214, 160, 0.55)";
  ctx.fillRect(0, 0, min * 0.18, min * 0.045);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = Math.min(0.9, 0.5 + amount * 0.4);
  ctx.translate(width * 0.72, height * 0.02);
  ctx.rotate(0.12);
  ctx.fillStyle = "rgba(232, 214, 160, 0.5)";
  ctx.fillRect(0, 0, min * 0.16, min * 0.04);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = Math.min(0.92, 0.5 + amount * 0.4);
  ctx.translate(width, height);
  ctx.fillStyle = "#d8c7a4";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-fold * 0.85, 0);
  ctx.lineTo(0, -fold * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(40,30,20,0.2)";
  ctx.beginPath();
  ctx.moveTo(-fold * 0.12, -fold * 0.12);
  ctx.lineTo(-fold * 0.85, 0);
  ctx.lineTo(0, -fold * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawScanDust(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  const overlay = getDustOverlay(width, height);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = Math.min(0.7, amount * 0.75);
  ctx.drawImage(overlay, 0, 0);
  ctx.restore();
}

function drawColorCast(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  const t = Math.abs(amount);
  if (t < 0.02) return;
  ctx.save();
  ctx.globalCompositeOperation = "color";
  ctx.globalAlpha = Math.min(0.55, t * 0.48);
  ctx.fillStyle = amount > 0 ? "#c24a88" : "#3a9a5c";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = Math.min(0.28, t * 0.22);
  ctx.fillStyle = amount > 0 ? "#8a3068" : "#245a38";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawSplitExposure(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number): void {
  const t = Math.abs(amount);
  if (t < 0.02) return;
  const topBright = amount > 0;

  ctx.save();
  const bright = ctx.createLinearGradient(0, 0, 0, height);
  if (topBright) {
    bright.addColorStop(0, `rgba(255, 248, 230, ${Math.min(0.7, t * 0.65)})`);
    bright.addColorStop(0.38, `rgba(255, 248, 230, ${Math.min(0.18, t * 0.16)})`);
    bright.addColorStop(0.55, "rgba(255,248,230,0)");
    bright.addColorStop(1, "rgba(255,248,230,0)");
  } else {
    bright.addColorStop(0, "rgba(255,248,230,0)");
    bright.addColorStop(0.45, "rgba(255,248,230,0)");
    bright.addColorStop(0.62, `rgba(255, 248, 230, ${Math.min(0.18, t * 0.16)})`);
    bright.addColorStop(1, `rgba(255, 248, 230, ${Math.min(0.7, t * 0.65)})`);
  }
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = bright;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  const dark = ctx.createLinearGradient(0, 0, 0, height);
  if (topBright) {
    dark.addColorStop(0, "rgba(0,0,0,0)");
    dark.addColorStop(0.5, "rgba(0,0,0,0)");
    dark.addColorStop(1, `rgba(6, 8, 16, ${Math.min(0.55, t * 0.48)})`);
  } else {
    dark.addColorStop(0, `rgba(6, 8, 16, ${Math.min(0.55, t * 0.48)})`);
    dark.addColorStop(0.5, "rgba(0,0,0,0)");
    dark.addColorStop(1, "rgba(0,0,0,0)");
  }
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawShakenSource(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement | HTMLImageElement,
  width: number,
  height: number,
  shake: number,
  pixelScale: number,
): void {
  if (shake < 0.03) {
    ctx.drawImage(source, 0, 0, width, height);
    return;
  }
  const copies = 5;
  const dx = shake * 14 * pixelScale;
  const dy = shake * 5.5 * pixelScale;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 1 / copies;
  for (let i = 0; i < copies; i += 1) {
    const t = i / (copies - 1) - 0.5;
    ctx.drawImage(source, dx * t * 2, dy * t * 2, width, height);
  }
  ctx.restore();
}

function applyAberration(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number, pixelScale: number): void {
  const shift = Math.max(1, Math.round(amount * 6 * pixelScale));
  if (shift < 1 || width * height > 3_500_000) return;
  const src = ctx.getImageData(0, 0, width, height);
  const out = ctx.createImageData(width, height);
  const s = src.data;
  const d = out.data;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const xl = Math.max(0, x - shift);
      const xr = Math.min(width - 1, x + shift);
      d[i] = s[(y * width + xl) * 4];
      d[i + 1] = s[i + 1];
      d[i + 2] = s[(y * width + xr) * 4 + 2];
      d[i + 3] = s[i + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

export function renderEditedImage(
  source: HTMLCanvasElement | HTMLImageElement,
  dest: HTMLCanvasElement,
  filters: AppliedFilters,
  pixelScale = 1,
): void {
  const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

  dest.width = width;
  dest.height = height;

  const ctx = dest.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  ctx.filter = cssFilterString(filters, pixelScale);
  drawShakenSource(ctx, source, width, height, filters.shake, pixelScale);
  ctx.filter = "none";

  if (filters.bloom > 0.01 && bloomCanvas) {
    bloomCanvas.width = width;
    bloomCanvas.height = height;
    const bctx = bloomCanvas.getContext("2d");
    if (bctx) {
      const bloomBlur = Math.max(8, filters.blur * 4 + 12) * pixelScale;
      bctx.filter = `${cssFilterString(filters, pixelScale)} blur(${bloomBlur}px) brightness(1.25)`;
      bctx.drawImage(source, 0, 0, width, height);
      bctx.filter = "none";
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = Math.min(0.85, filters.bloom);
      ctx.drawImage(bloomCanvas, 0, 0);
      ctx.restore();
    }
  }

  if (filters.blue > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = Math.min(0.82, filters.blue * 0.62);
    ctx.fillStyle = "#081426";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "color";
    ctx.globalAlpha = Math.min(0.78, filters.blue * 0.72);
    ctx.fillStyle = "#3a6cb8";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(0.45, filters.blue * 0.38);
    ctx.fillStyle = "#1a3f86";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filters.skyGradient > 0.01) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `rgba(28, 72, 140, ${Math.min(0.7, filters.skyGradient * 0.65)})`);
    gradient.addColorStop(0.48, "rgba(28, 72, 140, 0)");
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (Math.abs(filters.warmth) > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(0.58, Math.abs(filters.warmth) * 0.48);
    ctx.fillStyle = filters.warmth > 0 ? "#e8a05a" : "#4a72c4";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (Math.abs(filters.colorCast) > 0.02) {
    drawColorCast(ctx, width, height, filters.colorCast);
  }

  if (filters.shadows > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = Math.min(0.7, filters.shadows * 0.55);
    ctx.fillStyle = filters.blue > 0.2 ? "#050a16" : "#0a0806";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filters.highlights > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = Math.min(0.4, filters.highlights * 0.32);
    ctx.fillStyle = filters.blue > 0.2 ? "#6d7c94" : "#9a9084";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filters.fade > 0.01) {
    const coolFade = filters.blue > 0.18 || filters.warmth < -0.15;
    ctx.save();
    ctx.globalCompositeOperation = "lighten";
    ctx.globalAlpha = Math.min(0.5, filters.fade * 0.5);
    ctx.fillStyle = coolFade ? "#1a2436" : "#3a342e";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = Math.min(0.22, filters.fade * 0.28);
    ctx.fillStyle = coolFade ? "#6d7f99" : "#d7c4a8";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filters.haze > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = Math.min(0.4, filters.haze * 0.36);
    ctx.fillStyle = filters.blue > 0.15 ? "#6a88b0" : "#d8cfc4";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (Math.abs(filters.splitExposure) > 0.02) {
    drawSplitExposure(ctx, width, height, filters.splitExposure);
  }

  if (filters.aberration > 0.02) {
    applyAberration(ctx, width, height, filters.aberration, pixelScale);
  }

  if (filters.lightLeak > 0.01) {
    const radius = Math.max(width, height) * (0.45 + filters.lightLeak * 0.35);
    const gradient = ctx.createRadialGradient(width * 0.08, height * 0.12, 0, width * 0.08, height * 0.12, radius);
    gradient.addColorStop(0, "rgba(255, 170, 80, 0.95)");
    gradient.addColorStop(0.35, "rgba(255, 70, 40, 0.45)");
    gradient.addColorStop(1, "rgba(255, 70, 40, 0)");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = Math.min(0.85, filters.lightLeak * 0.9);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filters.vignette > 0.01) {
    const radius = Math.max(width, height) * 0.72;
    const inner = Math.min(width, height) * 0.22;
    const gradient = ctx.createRadialGradient(width / 2, height / 2, inner, width / 2, height / 2, radius);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    const edge = filters.blue > 0.2 ? `rgba(2, 8, 22, ${Math.min(0.92, filters.vignette * 0.9)})` : `rgba(8, 6, 4, ${Math.min(0.88, filters.vignette * 0.85)})`;
    gradient.addColorStop(1, edge);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filters.grain > 0.01) {
    const grain = getGrainCanvas(width, height);
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(0.7, filters.grain * 1.4);
    ctx.drawImage(grain, 0, 0);
    ctx.restore();
  }

  if (filters.flashBurn > 0.02) {
    drawFlashBurn(ctx, width, height, filters.flashBurn);
  }

  if (filters.doubleExposure > 0.02) {
    drawDoubleExposure(ctx, width, height, filters.doubleExposure);
  }

  if (filters.rawLook > 0.02) {
    drawRawLook(ctx, width, height, filters.rawLook);
  }

  if (filters.windowRain > 0.02) {
    drawWindowRain(ctx, width, height, filters.windowRain);
  }

  if (filters.scanDust > 0.02) {
    drawScanDust(ctx, width, height, filters.scanDust);
  }

  if (filters.frame > 0.02) {
    const border = Math.max(4, Math.min(width, height) * filters.frame * 0.055);
    const bottom = border * (1.4 + filters.frame);
    ctx.save();
    ctx.fillStyle = "#efe2c9";
    ctx.fillRect(0, 0, width, border);
    ctx.fillRect(0, 0, border, height);
    ctx.fillRect(width - border, 0, border, height);
    ctx.fillRect(0, height - bottom, width, bottom);
    ctx.restore();
  }

  if (filters.foldedTape > 0.02) {
    drawFoldedTape(ctx, width, height, filters.foldedTape);
  }
}
