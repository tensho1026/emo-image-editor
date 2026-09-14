import type { Preset } from "../types/preset";

type PresetSelectorProps = {
  presets: Preset[];
  selectedId: string;
  thumbs: Record<string, string>;
  onSelect: (id: string) => void;
};

export default function PresetSelector({ presets, selectedId, thumbs, onSelect }: PresetSelectorProps) {
  return (
    <section>
      <h2 className="mb-2 text-xs tracking-[0.28em] text-stone-400 uppercase">Presets</h2>
      <div className="grid grid-cols-4 gap-1.5">
        {presets.map((preset) => {
          const selected = preset.id === selectedId;
          const thumb = thumbs[preset.id];
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() => onSelect(preset.id)}
              className={`overflow-hidden rounded-xl border text-left transition ${
                selected ? "border-amber-200/80 ring-1 ring-amber-100/40" : "border-white/10 hover:border-white/25"
              }`}
            >
              <span className="block aspect-[4/3] bg-black/40">
                {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : null}
              </span>
              <span className="block px-1.5 py-1.5">
                <span className="block font-display text-sm leading-none text-stone-100">{preset.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
