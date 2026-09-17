import type { AppliedFilters } from "../types/preset";
import SliderRow from "./SliderRow";

type FineTunePanelProps = {
  tweaks: AppliedFilters;
  onChange: (tweaks: AppliedFilters) => void;
};

function round(value: number, digits = 2): string {
  const factor = 10 ** digits;
  return String(Math.round(value * factor) / factor);
}

export default function FineTunePanel({ tweaks, onChange }: FineTunePanelProps) {
  const set = (key: keyof AppliedFilters, value: number) => {
    onChange({ ...tweaks, [key]: value });
  };

  return (
    <section>
      <h2 className="mb-3 text-xs tracking-[0.28em] text-stone-400 uppercase">Adjust</h2>
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 lg:grid-cols-2">
        <p className="text-[10px] tracking-[0.22em] text-stone-500 uppercase lg:col-span-2">光</p>
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

        <p className="mt-1 text-[10px] tracking-[0.22em] text-stone-500 uppercase lg:col-span-2">色</p>
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

        <p className="mt-1 text-[10px] tracking-[0.22em] text-stone-500 uppercase lg:col-span-2">空気</p>
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

        <p className="mt-1 text-[10px] tracking-[0.22em] text-stone-500 uppercase lg:col-span-2">フィルム</p>
        <SliderRow
          label="ライトリーク"
          min={-30}
          max={80}
          value={Math.round(tweaks.lightLeak * 100)}
          display={String(Math.round(tweaks.lightLeak * 100))}
          onChange={(value) => set("lightLeak", value / 100)}
        />
        <SliderRow
          label="RGBずらし"
          min={-30}
          max={80}
          value={Math.round(tweaks.aberration * 100)}
          display={String(Math.round(tweaks.aberration * 100))}
          onChange={(value) => set("aberration", value / 100)}
        />
        <SliderRow
          label="空グラデ"
          min={-30}
          max={80}
          value={Math.round(tweaks.skyGradient * 100)}
          display={String(Math.round(tweaks.skyGradient * 100))}
          onChange={(value) => set("skyGradient", value / 100)}
        />
        <SliderRow
          label="枠"
          min={-30}
          max={80}
          value={Math.round(tweaks.frame * 100)}
          display={String(Math.round(tweaks.frame * 100))}
          onChange={(value) => set("frame", value / 100)}
        />

        <p className="mt-1 text-[10px] tracking-[0.22em] text-stone-500 uppercase lg:col-span-2">記憶</p>
        <SliderRow
          label="二重露光"
          min={-30}
          max={80}
          value={Math.round(tweaks.doubleExposure * 100)}
          display={String(Math.round(tweaks.doubleExposure * 100))}
          onChange={(value) => set("doubleExposure", value / 100)}
        />
        <SliderRow
          label="窓・雨粒"
          min={-30}
          max={80}
          value={Math.round(tweaks.windowRain * 100)}
          display={String(Math.round(tweaks.windowRain * 100))}
          onChange={(value) => set("windowRain", value / 100)}
        />
        <SliderRow
          label="フラッシュ"
          min={-30}
          max={80}
          value={Math.round(tweaks.flashBurn * 100)}
          display={String(Math.round(tweaks.flashBurn * 100))}
          onChange={(value) => set("flashBurn", value / 100)}
        />
        <SliderRow
          label="赤目・白飛び"
          min={-30}
          max={80}
          value={Math.round(tweaks.rawLook * 100)}
          display={String(Math.round(tweaks.rawLook * 100))}
          onChange={(value) => set("rawLook", value / 100)}
        />
        <SliderRow
          label="色かぶり"
          min={-80}
          max={80}
          value={Math.round(tweaks.colorCast * 100)}
          display={
            tweaks.colorCast === 0
              ? "0"
              : tweaks.colorCast > 0
                ? `マゼンタ ${Math.round(tweaks.colorCast * 100)}`
                : `緑 ${Math.round(-tweaks.colorCast * 100)}`
          }
          onChange={(value) => set("colorCast", value / 100)}
        />
        <SliderRow
          label="スキャン傷"
          min={-30}
          max={80}
          value={Math.round(tweaks.scanDust * 100)}
          display={String(Math.round(tweaks.scanDust * 100))}
          onChange={(value) => set("scanDust", value / 100)}
        />
        <SliderRow
          label="折れ・テープ"
          min={-30}
          max={80}
          value={Math.round(tweaks.foldedTape * 100)}
          display={String(Math.round(tweaks.foldedTape * 100))}
          onChange={(value) => set("foldedTape", value / 100)}
        />
        <SliderRow
          label="手ブレ"
          min={-30}
          max={80}
          value={Math.round(tweaks.shake * 100)}
          display={String(Math.round(tweaks.shake * 100))}
          onChange={(value) => set("shake", value / 100)}
        />
        <SliderRow
          label="露出段差"
          min={-80}
          max={80}
          value={Math.round(tweaks.splitExposure * 100)}
          display={
            tweaks.splitExposure === 0
              ? "0"
              : tweaks.splitExposure > 0
                ? `上 ${Math.round(tweaks.splitExposure * 100)}`
                : `下 ${Math.round(-tweaks.splitExposure * 100)}`
          }
          onChange={(value) => set("splitExposure", value / 100)}
        />
      </div>
    </section>
  );
}
