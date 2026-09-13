import type { RefObject } from "react";

type ImageEditorProps = {
  sourceRef: RefObject<HTMLCanvasElement | null>;
  outputRef: RefObject<HTMLCanvasElement | null>;
};

export default function ImageEditor({ sourceRef, outputRef }: ImageEditorProps) {
  return (
    <div className="hidden" aria-hidden="true">
      <canvas ref={sourceRef} />
      <canvas ref={outputRef} />
    </div>
  );
}
