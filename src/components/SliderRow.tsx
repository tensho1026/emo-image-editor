type SliderRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
};

export default function SliderRow({ label, value, min, max, step = 1, display, onChange }: SliderRowProps) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[11px] tracking-wide text-stone-400">
        <span>{label}</span>
        <span className="font-display text-sm text-amber-100/90">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        className="w-full"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
