export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };

export type AspectId = "free" | "original" | "1:1" | "4:5" | "9:16" | "16:9";

export const ASPECT_OPTIONS: { id: AspectId; label: string; value: number | null }[] = [
  { id: "free", label: "自由", value: null },
  { id: "original", label: "原寸", value: null },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "4:5", label: "4:5", value: 4 / 5 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
];

export function clampCrop(crop: CropRect): CropRect {
  const width = Math.min(1, Math.max(0.08, crop.width));
  const height = Math.min(1, Math.max(0.08, crop.height));
  const x = Math.min(1 - width, Math.max(0, crop.x));
  const y = Math.min(1 - height, Math.max(0, crop.y));
  return { x, y, width, height };
}

export function aspectCrop(imageWidth: number, imageHeight: number, aspect: number): CropRect {
  const imageAspect = imageWidth / imageHeight;
  if (imageAspect > aspect) {
    const width = aspect / imageAspect;
    return clampCrop({ x: (1 - width) / 2, y: 0, width, height: 1 });
  }
  const height = imageAspect / aspect;
  return clampCrop({ x: 0, y: (1 - height) / 2, width: 1, height });
}

export function cropToPixels(crop: CropRect, width: number, height: number) {
  const x = Math.round(crop.x * width);
  const y = Math.round(crop.y * height);
  const w = Math.max(1, Math.round(crop.width * width));
  const h = Math.max(1, Math.round(crop.height * height));
  return {
    x: Math.min(width - 1, Math.max(0, x)),
    y: Math.min(height - 1, Math.max(0, y)),
    width: Math.min(width - x, w),
    height: Math.min(height - y, h),
  };
}

export function extractCrop(source: HTMLCanvasElement, crop: CropRect): HTMLCanvasElement {
  const box = cropToPixels(crop, source.width, source.height);
  const canvas = document.createElement("canvas");
  canvas.width = box.width;
  canvas.height = box.height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(source, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
  return canvas;
}

export function coverDraw(source: HTMLCanvasElement, dest: HTMLCanvasElement, width: number, height: number): void {
  dest.width = width;
  dest.height = height;
  const ctx = dest.getContext("2d");
  if (!ctx) return;
  const scale = Math.max(width / source.width, height / source.height);
  const w = source.width * scale;
  const h = source.height * scale;
  ctx.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
}
