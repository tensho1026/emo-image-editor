import type { AppliedFilters, Preset } from "../types/preset";
import { IDENTITY_PRESET } from "../presets/presets";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Intensity 50 = preset as designed, 0 = none, 100 = 2× the designed effect. */
export function applyIntensity(preset: Preset, intensity: number): AppliedFilters {
  const t = intensity / 50;
  const mix = (identity: number, value: number) => identity + (value - identity) * t;

  return {
    brightness: mix(IDENTITY_PRESET.brightness, preset.brightness),
    contrast: mix(IDENTITY_PRESET.contrast, preset.contrast),
    saturation: mix(IDENTITY_PRESET.saturation, preset.saturation),
    blur: mix(IDENTITY_PRESET.blur, preset.blur),
    grain: mix(IDENTITY_PRESET.grain, preset.grain),
    bloom: mix(IDENTITY_PRESET.bloom, preset.bloom),
    warmth: mix(IDENTITY_PRESET.warmth, preset.warmth),
    fade: mix(IDENTITY_PRESET.fade, preset.fade),
    blue: mix(IDENTITY_PRESET.blue, preset.blue),
    hue: mix(IDENTITY_PRESET.hue, preset.hue),
    shadows: mix(IDENTITY_PRESET.shadows, preset.shadows),
    highlights: mix(IDENTITY_PRESET.highlights, preset.highlights),
    vignette: mix(IDENTITY_PRESET.vignette, preset.vignette),
    haze: mix(IDENTITY_PRESET.haze, preset.haze),
  };
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
  };
}

export function cssFilterString(filters: AppliedFilters): string {
  const parts = [
    `brightness(${filters.brightness})`,
    `contrast(${filters.contrast})`,
    `saturate(${filters.saturation})`,
  ];
  if (Math.abs(filters.hue) > 0.4) {
    parts.push(`hue-rotate(${filters.hue.toFixed(1)}deg)`);
  }
  if (filters.blur > 0.05) {
    parts.push(`blur(${filters.blur.toFixed(2)}px)`);
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

export function renderEditedImage(
  source: HTMLCanvasElement | HTMLImageElement,
  dest: HTMLCanvasElement,
  filters: AppliedFilters,
): void {
  const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

  dest.width = width;
  dest.height = height;

  const ctx = dest.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  ctx.filter = cssFilterString(filters);
  ctx.drawImage(source, 0, 0, width, height);
  ctx.filter = "none";

  if (filters.bloom > 0.01 && bloomCanvas) {
    bloomCanvas.width = width;
    bloomCanvas.height = height;
    const bctx = bloomCanvas.getContext("2d");
    if (bctx) {
      const bloomBlur = Math.max(8, filters.blur * 4 + 12);
      bctx.filter = `${cssFilterString(filters)} blur(${bloomBlur}px) brightness(1.25)`;
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

  if (Math.abs(filters.warmth) > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(0.58, Math.abs(filters.warmth) * 0.48);
    ctx.fillStyle = filters.warmth > 0 ? "#e8a05a" : "#4a72c4";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
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
}
