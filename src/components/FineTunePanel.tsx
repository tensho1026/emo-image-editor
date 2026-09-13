import type { AppliedFilters } from "../types/preset";
import SliderRow from "./SliderRow";

type FineTunePanelProps = {
  tweaks: AppliedFilters;
  onChange: (tweaks: AppliedFilters) => void;
  onReset: () => void;
};

function round(value: number, digits = 2): string {
  const factor = 10 ** digits;
  return String(Math.round(value * factor) / factor);
}

export default function FineTunePanel({ tweaks, onChange, onReset }: FineTunePanelProps) {
  const set = (key: keyof AppliedFilters, value: number) => {
    onChange({ ...tweaks, [key]: value });
  };

  return (
    <section className="rounded-3xl border border-white/8 bg-black/20 px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs tracking-[0.28em] text-stone-400 uppercase">Adjust</h2>
        <button
          type="button"
          className="text-[11px] tracking-wide text-stone-500 underline-offset-4 hover:text-stone-300 hover:underline"
          onClick={onReset}
        >
          リセット
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-[10px] tracking-[0.22em] text-stone-500 uppercase">光</p>
        <SliderRow
          label="明るさ"
          min={60}
          max={140}
          value={Math.round(tweaks.brightness * 100)}
          display={round(tweaks.brightness)}
          onChange={(value) => set("brightness", value / 100)}
        />
        <SliderRow
          label="コントラスト"
          min={60}
          max={160}
          value={Math.round(tweaks.contrast * 100)}
          display={round(tweaks.contrast)}
          onChange={(value) => set("contrast", value / 100)}
        />
        <SliderRow
          label="シャドウ"
          min={-40}
          max={60}
          value={Math.round(tweaks.shadows * 100)}
          display={String(Math.round(tweaks.shadows * 100))}
          onChange={(value) => set("shadows", value / 100)}
        />
        <SliderRow
          label="ハイライト"
          min={-40}
          max={60}
          value={Math.round(tweaks.highlights * 100)}
          display={String(Math.round(tweaks.highlights * 100))}
          onChange={(value) => set("highlights", value / 100)}
        />

        <p className="mt-1 text-[10px] tracking-[0.22em] text-stone-500 uppercase">色</p>
        <SliderRow
          label="彩度"
          min={40}
          max={160}
          value={Math.round(tweaks.saturation * 100)}
          display={round(tweaks.saturation)}
          onChange={(value) => set("saturation", value / 100)}
        />
        <SliderRow
          label="色温度"
          min={-80}
          max={80}
          value={Math.round(tweaks.warmth * 100)}
          display={tweaks.warmth === 0 ? "0" : tweaks.warmth > 0 ? `暖 ${Math.round(tweaks.warmth * 100)}` : `寒 ${Math.round(-tweaks.warmth * 100)}`}
          onChange={(value) => set("warmth", value / 100)}
        />
        <SliderRow
          label="ブルー"
          min={0}
          max={100}
          value={Math.round(tweaks.blue * 100)}
          display={String(Math.round(tweaks.blue * 100))}
          onChange={(value) => set("blue", value / 100)}
        />
        <SliderRow
          label="色相"
          min={-30}
          max={30}
          value={Math.round(tweaks.hue)}
          display={`${Math.round(tweaks.hue)}°`}
          onChange={(value) => set("hue", value)}
        />

        <p className="mt-1 text-[10px] tracking-[0.22em] text-stone-500 uppercase">空気</p>
        <SliderRow
          label="フェード"
          min={-30}
          max={60}
          value={Math.round(tweaks.fade * 100)}
          display={String(Math.round(tweaks.fade * 100))}
          onChange={(value) => set("fade", value / 100)}
        />
        <SliderRow
          label="ヘイズ"
          min={-30}
          max={70}
          value={Math.round(tweaks.haze * 100)}
          display={String(Math.round(tweaks.haze * 100))}
          onChange={(value) => set("haze", value / 100)}
        />
        <SliderRow
          label="ぼかし"
          min={0}
          max={50}
          step={0.5}
          value={tweaks.blur * 10}
          display={round(tweaks.blur, 1)}
          onChange={(value) => set("blur", value / 10)}
        />
        <SliderRow
          label="ブルーム"
          min={-30}
          max={70}
          value={Math.round(tweaks.bloom * 100)}
          display={String(Math.round(tweaks.bloom * 100))}
          onChange={(value) => set("bloom", value / 100)}
        />
        <SliderRow
          label="粒子"
          min={-30}
          max={70}
          value={Math.round(tweaks.grain * 100)}
          display={String(Math.round(tweaks.grain * 100))}
          onChange={(value) => set("grain", value / 100)}
        />
        <SliderRow
          label="ビネット"
          min={-40}
          max={70}
          value={Math.round(tweaks.vignette * 100)}
          display={String(Math.round(tweaks.vignette * 100))}
          onChange={(value) => set("vignette", value / 100)}
        />
      </div>
    </section>
  );
}
