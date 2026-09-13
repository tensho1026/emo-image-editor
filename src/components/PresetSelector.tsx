import type { Preset } from "../types/preset";

type PresetSelectorProps = {
  presets: Preset[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function PresetSelector({ presets, selectedId, onSelect }: PresetSelectorProps) {
  return (
    <section>
      <h2 className="mb-2 text-xs tracking-[0.28em] text-stone-400 uppercase">Presets</h2>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4 lg:grid-cols-4">
        {presets.map((preset) => {
          const selected = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() => onSelect(preset.id)}
              className={`rounded-xl border px-1.5 py-2 text-center transition ${
                selected
                  ? "border-amber-200/70 bg-amber-200/15 text-amber-50"
                  : "border-white/8 bg-white/4 text-stone-300 hover:border-white/20"
              }`}
            >
              <span className="block font-display text-sm leading-none sm:text-base">{preset.name}</span>
              <span className="mt-1 hidden text-[10px] leading-snug text-stone-400 xl:block">{preset.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
