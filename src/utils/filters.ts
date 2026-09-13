import type { AppliedFilters, Preset } from "../types/preset";
import { IDENTITY_PRESET } from "../presets/presets";

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
  };
}

export function cssFilterString(filters: AppliedFilters): string {
  const parts = [
    `brightness(${filters.brightness})`,
    `contrast(${filters.contrast})`,
    `saturate(${filters.saturation})`,
  ];
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

  if (Math.abs(filters.warmth) > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(0.55, Math.abs(filters.warmth) * 0.45);
    if (filters.warmth > 0) {
      ctx.fillStyle = "#e8a05a";
    } else {
      ctx.fillStyle = "#5a7ec8";
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  if (filters.fade > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "lighten";
    ctx.globalAlpha = Math.min(0.55, filters.fade * 0.55);
    ctx.fillStyle = "#3a342e";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = Math.min(0.22, filters.fade * 0.28);
    ctx.fillStyle = "#d7c4a8";
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
