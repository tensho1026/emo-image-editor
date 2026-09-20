import type { AppliedFilters, ExportSize } from "../types/preset";
import type { BatchItem } from "../types/batch";
import { extractCrop, coverDraw, type CropRect } from "./crop";
import { renderEditedImage } from "./filters";
import { drawToPreviewCanvas, loadImageFromFile, MAX_FULL_SIZE } from "./image";

export async function buildExportCanvas(
  item: BatchItem,
  crop: CropRect,
  filters: AppliedFilters,
  size: ExportSize,
): Promise<HTMLCanvasElement> {
  let base = item.source;
  if (size !== "preview") {
    const image = await loadImageFromFile(item.file);
    base = document.createElement("canvas");
    drawToPreviewCanvas(image, base, MAX_FULL_SIZE);
  }
  const cropped = extractCrop(base, crop);
  const previewCropWidth = Math.max(1, item.source.width * crop.width);

  if (size === "square" || size === "story") {
    const framed = document.createElement("canvas");
    coverDraw(cropped, framed, 1080, size === "square" ? 1080 : 1920);
    const out = document.createElement("canvas");
    renderEditedImage(framed, out, filters, framed.width / previewCropWidth);
    return out;
  }

  const out = document.createElement("canvas");
  renderEditedImage(cropped, out, filters, cropped.width / previewCropWidth);
  return out;
}
