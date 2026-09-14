import { ASPECT_OPTIONS, type AspectId } from "../utils/crop";

type CropBarProps = {
  cropMode: boolean;
  aspect: AspectId;
  onToggle: () => void;
  onAspect: (id: AspectId) => void;
};

export default function CropBar({ cropMode, aspect, onToggle, onAspect }: CropBarProps) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs tracking-[0.28em] text-stone-400 uppercase">Crop</h2>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-full px-3 py-1 text-[11px] ${cropMode ? "bg-amber-100 text-stone-900" : "border border-white/15 text-stone-300"}`}
        >
          {cropMode ? "切り抜き中" : "切り抜き"}
        </button>
      </div>
      {cropMode ? (
        <div className="flex flex-wrap gap-1.5">
          {ASPECT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onAspect(option.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] ${
                aspect === option.id ? "bg-amber-100/90 text-stone-900" : "border border-white/10 text-stone-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
