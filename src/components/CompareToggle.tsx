type CompareToggleProps = {
  isShowingOriginal: boolean;
  onChange: (isShowingOriginal: boolean) => void;
};

export default function CompareToggle({ isShowingOriginal, onChange }: CompareToggleProps) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-full border border-white/10 bg-black/30 p-1">
      <button
        type="button"
        className={`rounded-full py-2 text-sm transition ${
          isShowingOriginal ? "bg-amber-100 text-stone-900" : "text-stone-400"
        }`}
        onClick={() => onChange(true)}
      >
        Original
      </button>
      <button
        type="button"
        className={`rounded-full py-2 text-sm transition ${
          !isShowingOriginal ? "bg-amber-100 text-stone-900" : "text-stone-400"
        }`}
        onClick={() => onChange(false)}
      >
        Edited
      </button>
    </div>
  );
}
