import { useState } from "react";

type DownloadButtonProps = {
  disabled?: boolean;
  onDownload: (format: "image/jpeg" | "image/png") => Promise<void>;
};

export default function DownloadButton({ disabled, onDownload }: DownloadButtonProps) {
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

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => save("image/jpeg")}
        className="rounded-full bg-amber-100 py-2.5 text-sm font-medium tracking-wide text-stone-900 transition hover:bg-white disabled:opacity-50"
      >
        {busy ? "…" : "JPEG"}
      </button>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => save("image/png")}
        className="rounded-full border border-white/15 py-2.5 text-sm text-stone-300 hover:border-white/35 disabled:opacity-50"
      >
        PNG
      </button>
    </div>
  );
}
