import { drawToPreviewCanvas } from "./image";
import type { BatchItem } from "../types/batch";

export function createBatchItem(image: HTMLImageElement, fileName: string): BatchItem {
  const source = document.createElement("canvas");
  drawToPreviewCanvas(image, source);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const name = fileName.replace(/\.[^.]+$/, "") || "memory";
  return {
    id,
    name,
    source,
    thumbUrl: source.toDataURL("image/jpeg", 0.6),
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
