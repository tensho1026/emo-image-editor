import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { CropRect } from "../utils/crop";

type ImagePreviewProps = {
  sourceRef: RefObject<HTMLCanvasElement | null>;
  outputRef: RefObject<HTMLCanvasElement | null>;
  isShowingOriginal: boolean;
  version: number;
  cropMode: boolean;
  crop: CropRect;
  onCropChange: (crop: CropRect) => void;
};

export default function ImagePreview({
  sourceRef,
  outputRef,
  isShowingOriginal,
  version,
  cropMode,
  crop,
  onCropChange,
}: ImagePreviewProps) {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"move" | "resize" | null>(null);

  useEffect(() => {
    const source = isShowingOriginal || cropMode ? sourceRef.current : outputRef.current;
    const display = displayRef.current;
    if (!source || !display || source.width === 0) return;
    display.width = source.width;
    display.height = source.height;
    display.getContext("2d")?.drawImage(source, 0, 0);
  }, [isShowingOriginal, cropMode, version, sourceRef, outputRef]);

  const pointerToCrop = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    };
  }, []);

  useEffect(() => {
    const up = () => {
      dragging.current = null;
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      const point = pointerToCrop(event.clientX, event.clientY);
      if (dragging.current === "move") {
        onCropChange({
          ...crop,
          x: point.x - crop.width / 2,
          y: point.y - crop.height / 2,
        });
      }
      if (dragging.current === "resize") {
        onCropChange({
          ...crop,
          width: point.x - crop.x,
          height: point.y - crop.y,
        });
      }
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
    };
  }, [crop, onCropChange, pointerToCrop]);

  return (
    <div className={`relative flex h-full min-h-0 w-full items-center justify-center bg-black/50 ${cropMode ? "" : "pb-14"}`}>
      <div ref={stageRef} className="relative max-h-full max-w-full">
        <canvas ref={displayRef} className="block max-h-[min(100%,52dvh)] max-w-full lg:max-h-full" />

        {cropMode ? (
          <div className="absolute inset-0 z-20">
            <div
              className="absolute border-2 border-amber-100 bg-amber-100/10"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.width * 100}%`,
                height: `${crop.height * 100}%`,
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                dragging.current = "move";
              }}
            >
              <button
                type="button"
                aria-label="リサイズ"
                className="absolute -bottom-2 -right-2 h-5 w-5 rounded-sm bg-amber-100"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  dragging.current = "resize";
                }}
              />
            </div>
          </div>
        ) : null}

        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] tracking-widest text-stone-200 uppercase">
          {isShowingOriginal || cropMode ? "Original" : "Edited"}
        </span>
      </div>
    </div>
  );
}
