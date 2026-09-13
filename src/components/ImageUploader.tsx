import { useCallback, useId, useState } from "react";
import { isAcceptedImage } from "../utils/image";

type ImageUploaderProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
};

export default function ImageUploader({ onFiles, disabled }: ImageUploaderProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const takeFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || disabled) return;
      const files = Array.from(list).filter(isAcceptedImage);
      if (files.length === 0) return;
      onFiles(files);
    },
    [disabled, onFiles],
  );

  return (
    <label
      htmlFor={inputId}
      className={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 px-6 py-12 text-center transition ${
        isDragging ? "bg-amber-200/10" : "bg-transparent"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        takeFiles(event.dataTransfer.files);
      }}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-200/30 text-amber-100/80">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 16V4m0 0 4 4M12 4 8 8M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div>
        <p className="font-display text-2xl italic text-stone-100">写真をここに置く</p>
        <p className="mt-2 text-sm text-stone-400">1枚でも、複数枚でも。同じ設定でまとめて加工できます</p>
      </div>
      <input
        id={inputId}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          takeFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
