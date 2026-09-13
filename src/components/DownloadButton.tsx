import { useState } from "react";

type DownloadButtonProps = {
  disabled?: boolean;
  count: number;
  progress?: string | null;
  onDownload: (format: "image/jpeg" | "image/png") => Promise<void>;
};

export default function DownloadButton({ disabled, count, progress, onDownload }: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);

  const save = async (format: "image/jpeg" | "image/png") => {
    if (disabled || busy) return;
    setBusy(true);
    try {
      await onDownload(format);
    } finally {
      setBusy(false);
    }
  };

  const jpegLabel = count > 1 ? `JPEG ${count}枚` : "JPEG";
  const pngLabel = count > 1 ? `PNG ${count}枚` : "PNG";

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => save("image/jpeg")}
        className="rounded-full bg-amber-100 py-2.5 text-sm font-medium tracking-wide text-stone-900 transition hover:bg-white disabled:opacity-50"
      >
        {busy ? (progress ?? "…") : jpegLabel}
      </button>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => save("image/png")}
        className="rounded-full border border-white/15 py-2.5 text-sm text-stone-300 hover:border-white/35 disabled:opacity-50"
      >
        {busy ? (progress ?? "…") : pngLabel}
      </button>
    </div>
  );
}
