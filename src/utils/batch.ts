import { drawToPreviewCanvas, MAX_PREVIEW_SIZE } from "./image";
import type { BatchItem } from "../types/batch";
import type { AppliedFilters } from "../types/preset";
import { renderEditedImage } from "./filters";
import { extractCrop, type CropRect } from "./crop";

export function createBatchItem(image: HTMLImageElement, file: File): BatchItem {
  const source = document.createElement("canvas");
  drawToPreviewCanvas(image, source, MAX_PREVIEW_SIZE);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const name = file.name.replace(/\.[^.]+$/, "") || "memory";
  return {
    id,
    name,
    file,
    source,
    thumbUrl: source.toDataURL("image/jpeg", 0.55),
  };
}

export function copyCanvas(from: HTMLCanvasElement, to: HTMLCanvasElement): void {
  to.width = from.width;
  to.height = from.height;
  const ctx = to.getContext("2d");
  ctx?.drawImage(from, 0, 0);
}

export function uniqueDownloadName(base: string, used: Set<string>, extension: string): string {
  let candidate = `${base}.${extension}`;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${index}.${extension}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

export function editedThumbUrl(source: HTMLCanvasElement, crop: CropRect, filters: AppliedFilters): string {
  const cropped = extractCrop(source, crop);
  const thumb = document.createElement("canvas");
  const scale = 96 / Math.max(cropped.width, cropped.height);
  thumb.width = Math.max(1, Math.round(cropped.width * scale));
  thumb.height = Math.max(1, Math.round(cropped.height * scale));
  const ctx = thumb.getContext("2d");
  ctx?.drawImage(cropped, 0, 0, thumb.width, thumb.height);
  const out = document.createElement("canvas");
  renderEditedImage(thumb, out, filters, thumb.width / Math.max(1, cropped.width));
  return out.toDataURL("image/jpeg", 0.7);
}
