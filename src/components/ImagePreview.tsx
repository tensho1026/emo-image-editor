import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { CropRect } from "../utils/crop";

type ImagePreviewProps = {
  sourceRef: RefObject<HTMLCanvasElement | null>;
  outputRef: RefObject<HTMLCanvasElement | null>;
  version: number;
  split: number;
  onSplitChange: (value: number) => void;
  cropMode: boolean;
  crop: CropRect;
  onCropChange: (crop: CropRect) => void;
};

export default function ImagePreview({
  sourceRef,
  outputRef,
  version,
  split,
  onSplitChange,
  cropMode,
  crop,
  onCropChange,
}: ImagePreviewProps) {
  const originalRef = useRef<HTMLCanvasElement>(null);
  const editedRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"split" | "move" | "resize" | null>(null);

  useEffect(() => {
    const source = sourceRef.current;
    const output = outputRef.current;
    const original = originalRef.current;
    const edited = editedRef.current;
    if (!source || !output || !original || !edited || source.width === 0) return;
    original.width = source.width;
    original.height = source.height;
    edited.width = output.width;
    edited.height = output.height;
    original.getContext("2d")?.drawImage(source, 0, 0);
    edited.getContext("2d")?.drawImage(output, 0, 0);
  }, [version, sourceRef, outputRef]);

  const pointerToSplit = (clientX: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    onSplitChange(Math.min(92, Math.max(8, next)));
  };

  const pointerToCrop = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return { x: 0, y: 0 };
      const rect = stage.getBoundingClientRect();
      return {
        x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
      };
    },
    [],
  );

  useEffect(() => {
    const up = () => {
      dragging.current = null;
    };
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      if (dragging.current === "split") {
        pointerToSplit(event.clientX);
        return;
      }
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
    <div className="relative flex h-full min-h-0 w-full items-center justify-center bg-black/50">
      <div ref={stageRef} className="relative max-h-full max-w-full">
        <canvas ref={originalRef} className="block max-h-[min(100%,52dvh)] max-w-full lg:max-h-full" />
        <canvas
          ref={editedRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
        />

        {!cropMode ? (
          <button
            type="button"
            aria-label="Before after slider"
            className="absolute top-0 z-20 h-full w-8 -translate-x-1/2 cursor-ew-resize touch-none"
            style={{ left: `${split}%` }}
            onPointerDown={(event) => {
              event.preventDefault();
              dragging.current = "split";
              pointerToSplit(event.clientX);
            }}
          >
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-amber-100/90" />
            <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100 bg-black/50" />
          </button>
        ) : null}

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
          Original
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[10px] tracking-widest text-stone-200 uppercase">
          Edited
        </span>
      </div>
    </div>
  );
}
