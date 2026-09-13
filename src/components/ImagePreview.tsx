import { useEffect, useRef, type RefObject } from "react";

type ImagePreviewProps = {
  sourceRef: RefObject<HTMLCanvasElement | null>;
  outputRef: RefObject<HTMLCanvasElement | null>;
  isShowingOriginal: boolean;
  version: number;
};

export default function ImagePreview({
  sourceRef,
  outputRef,
  isShowingOriginal,
  version,
}: ImagePreviewProps) {
  const displayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const source = isShowingOriginal ? sourceRef.current : outputRef.current;
    const display = displayRef.current;
    if (!source || !display || source.width === 0) return;
    display.width = source.width;
    display.height = source.height;
    const ctx = display.getContext("2d");
    ctx?.drawImage(source, 0, 0);
  }, [isShowingOriginal, version, sourceRef, outputRef]);

  return (
    <div className="relative flex min-h-[280px] items-center justify-center bg-black/40">
      <canvas
        ref={displayRef}
        className="max-h-[min(62vh,640px)] w-full object-contain"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] tracking-widest text-stone-200 uppercase">
        {isShowingOriginal ? "Original" : "Edited"}
      </span>
    </div>
  );
}
