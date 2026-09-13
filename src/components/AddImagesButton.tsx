import { useId, useRef } from "react";
import { isAcceptedImage } from "../utils/image";

type AddImagesButtonProps = {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
};

export default function AddImagesButton({ disabled, onFiles }: AddImagesButtonProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []).filter(isAcceptedImage);
          if (files.length > 0) onFiles(files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        className="text-[11px] tracking-wide text-stone-400 underline-offset-4 hover:text-stone-200 hover:underline disabled:opacity-40"
        onClick={() => inputRef.current?.click()}
      >
        写真を追加
      </button>
    </>
  );
}
