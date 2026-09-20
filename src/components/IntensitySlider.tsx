type IntensitySliderProps = {
  value: number;
  onChange: (value: number) => void;
  onChangeStart?: () => void;
};

export default function IntensitySlider({ value, onChange, onChangeStart }: IntensitySliderProps) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xs tracking-[0.28em] text-stone-400 uppercase">Intensity</h2>
        <span className="font-display text-2xl leading-none text-amber-100">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label="加工の強さ"
        className="w-full"
        onPointerDown={onChangeStart}
        onKeyDown={onChangeStart}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-2 flex justify-between text-[11px] tracking-wide text-stone-500">
        <span>なし</span>
        <span>標準</span>
        <span>最大</span>
      </div>
    </section>
  );
}
