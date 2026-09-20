import { ADJUSTMENT_GROUPS } from "../config/filters";
import type { AppliedFilters } from "../types/preset";
import SliderRow from "./SliderRow";

type FineTunePanelProps = {
  tweaks: AppliedFilters;
  onChange: (tweaks: AppliedFilters) => void;
  onChangeStart?: () => void;
};

export default function FineTunePanel({ tweaks, onChange, onChangeStart }: FineTunePanelProps) {
  const set = (key: keyof AppliedFilters, value: number) => {
    onChange({ ...tweaks, [key]: value });
  };

  return (
    <section>
      <h2 className="mb-3 text-xs tracking-[0.28em] text-stone-400 uppercase">Adjust</h2>
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 lg:grid-cols-2">
        {ADJUSTMENT_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className="contents">
            <p
              className={`${groupIndex > 0 ? "mt-1 " : ""}text-[10px] tracking-[0.22em] text-stone-500 uppercase lg:col-span-2`}
            >
              {group.label}
            </p>
            {group.items.map((item) => {
              const value = tweaks[item.key];
              return (
                <SliderRow
                  key={item.key}
                  label={item.label}
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={item.toSlider(value)}
                  display={item.format(value)}
                  onChangeStart={onChangeStart}
                  onChange={(sliderValue) => set(item.key, item.fromSlider(sliderValue))}
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
