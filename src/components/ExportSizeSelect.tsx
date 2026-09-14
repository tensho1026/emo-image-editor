import type { ExportSize } from "../types/preset";

const OPTIONS: { id: ExportSize; label: string }[] = [
  { id: "original", label: "原寸" },
  { id: "preview", label: "1920px" },
  { id: "square", label: "正方形" },
  { id: "story", label: "Story" },
];

type ExportSizeSelectProps = {
  value: ExportSize;
  onChange: (value: ExportSize) => void;
};

export default function ExportSizeSelect({ value, onChange }: ExportSizeSelectProps) {
  return (
    <section>
      <h2 className="mb-2 text-xs tracking-[0.28em] text-stone-400 uppercase">Export</h2>
      <div className="grid grid-cols-4 gap-1.5">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-full py-1.5 text-[11px] ${
              value === option.id ? "bg-amber-100 text-stone-900" : "border border-white/10 text-stone-400"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
