import { useEffect, useState } from "react";
import { presets } from "../presets/presets";
import type { BatchItem } from "../types/batch";
import type { AppliedFilters } from "../types/preset";
import { editedThumbUrl } from "../utils/batch";
import { FULL_CROP, type CropRect } from "../utils/crop";
import { applyIntensity } from "../utils/filters";

export function usePresetThumbnails(activeItem: BatchItem | undefined, activeCrop: CropRect) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!activeItem) {
      setThumbs({});
      return;
    }

    const handle = window.setTimeout(() => {
      const next: Record<string, string> = {};
      for (const preset of presets) {
        next[preset.id] = editedThumbUrl(activeItem.source, activeCrop, applyIntensity(preset, 50));
      }
      setThumbs(next);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [activeItem, activeCrop]);

  return thumbs;
}

export function useBatchThumbnails(
  items: BatchItem[],
  crops: Record<string, CropRect>,
  filters: AppliedFilters,
) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (items.length === 0) {
      setThumbs({});
      return;
    }

    let cancelled = false;
    let frame: number | null = null;
    let index = 0;

    setThumbs((current) =>
      Object.fromEntries(items.map((item) => [item.id, current[item.id] ?? item.thumbUrl])),
    );

    const renderNext = () => {
      if (cancelled || index >= items.length) return;
      const item = items[index];
      const thumb = editedThumbUrl(item.source, crops[item.id] ?? FULL_CROP, filters);
      setThumbs((current) => ({ ...current, [item.id]: thumb }));
      index += 1;
      if (index < items.length) frame = window.requestAnimationFrame(renderNext);
    };

    const timeout = window.setTimeout(renderNext, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [filters, items, crops]);

  return thumbs;
}
