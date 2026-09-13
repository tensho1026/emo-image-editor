import type { Preset } from "../types/preset";

type PresetSelectorProps = {
  presets: Preset[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function PresetSelector({ presets, selectedId, onSelect }: PresetSelectorProps) {
  return (
    <section>
      <h2 className="mb-3 text-center text-xs tracking-[0.28em] text-stone-400 uppercase">Presets</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {presets.map((preset) => {
          const selected = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                selected
                  ? "border-amber-200/70 bg-amber-200/15 text-amber-50"
                  : "border-white/8 bg-white/4 text-stone-300 hover:border-white/20"
              }`}
            >
              <span className="block font-display text-lg leading-none">{preset.name}</span>
              <span className="mt-1 block text-[11px] leading-snug text-stone-400">{preset.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
