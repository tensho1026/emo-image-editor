import type { AppliedFilters } from "../types/preset";

type FilterDefinition = {
  identity: number;
  combine: "add" | "multiply";
  min: number;
  max: number;
};

export const FILTER_DEFINITIONS = {
  brightness: { identity: 1, combine: "multiply", min: 0.25, max: 1.8 },
  contrast: { identity: 1, combine: "multiply", min: 0.4, max: 2 },
  saturation: { identity: 1, combine: "multiply", min: 0.15, max: 2 },
  blur: { identity: 0, combine: "add", min: 0, max: 8 },
  grain: { identity: 0, combine: "add", min: 0, max: 1 },
  bloom: { identity: 0, combine: "add", min: 0, max: 1 },
  warmth: { identity: 0, combine: "add", min: -1.5, max: 1.5 },
  fade: { identity: 0, combine: "add", min: 0, max: 1 },
  blue: { identity: 0, combine: "add", min: 0, max: 1.4 },
  hue: { identity: 0, combine: "add", min: -40, max: 40 },
  shadows: { identity: 0, combine: "add", min: 0, max: 1 },
  highlights: { identity: 0, combine: "add", min: 0, max: 1 },
  vignette: { identity: 0, combine: "add", min: 0, max: 1 },
  haze: { identity: 0, combine: "add", min: 0, max: 1 },
  lightLeak: { identity: 0, combine: "add", min: 0, max: 1 },
  aberration: { identity: 0, combine: "add", min: 0, max: 1 },
  skyGradient: { identity: 0, combine: "add", min: 0, max: 1 },
  frame: { identity: 0, combine: "add", min: 0, max: 1 },
} as const satisfies Record<keyof AppliedFilters, FilterDefinition>;

export const FILTER_KEYS = Object.keys(FILTER_DEFINITIONS) as (keyof AppliedFilters)[];

export const IDENTITY_FILTERS = Object.fromEntries(
  FILTER_KEYS.map((key) => [key, FILTER_DEFINITIONS[key].identity]),
) as AppliedFilters;

export type AdjustmentDefinition = {
  key: keyof AppliedFilters;
  label: string;
  min: number;
  max: number;
  step?: number;
  fromSlider: (value: number) => number;
  toSlider: (value: number) => number;
  format: (value: number) => string;
};

const hundred = (value: number) => value * 100;
const fromHundred = (value: number) => value / 100;
const integer = (value: number) => String(Math.round(value * 100));
const decimal = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return String(Math.round(value * factor) / factor);
};

export const ADJUSTMENT_GROUPS: { label: string; items: AdjustmentDefinition[] }[] = [
  {
    label: "光",
    items: [
      { key: "brightness", label: "明るさ", min: 60, max: 140, fromSlider: fromHundred, toSlider: hundred, format: decimal },
      { key: "contrast", label: "コントラスト", min: 60, max: 160, fromSlider: fromHundred, toSlider: hundred, format: decimal },
      { key: "shadows", label: "シャドウ", min: -40, max: 60, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "highlights", label: "ハイライト", min: -40, max: 60, fromSlider: fromHundred, toSlider: hundred, format: integer },
    ],
  },
  {
    label: "色",
    items: [
      { key: "saturation", label: "彩度", min: 40, max: 160, fromSlider: fromHundred, toSlider: hundred, format: decimal },
      {
        key: "warmth",
        label: "色温度",
        min: -80,
        max: 80,
        fromSlider: fromHundred,
        toSlider: hundred,
        format: (value) => value === 0 ? "0" : value > 0 ? `暖 ${Math.round(value * 100)}` : `寒 ${Math.round(-value * 100)}`,
      },
      { key: "blue", label: "ブルー", min: 0, max: 100, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "hue", label: "色相", min: -30, max: 30, fromSlider: (value) => value, toSlider: (value) => value, format: (value) => `${Math.round(value)}°` },
    ],
  },
  {
    label: "空気",
    items: [
      { key: "fade", label: "フェード", min: -30, max: 60, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "haze", label: "ヘイズ", min: -30, max: 70, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "blur", label: "ぼかし", min: 0, max: 50, step: 0.5, fromSlider: (value) => value / 10, toSlider: (value) => value * 10, format: (value) => decimal(value, 1) },
      { key: "bloom", label: "ブルーム", min: -30, max: 70, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "grain", label: "粒子", min: -30, max: 70, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "vignette", label: "ビネット", min: -40, max: 70, fromSlider: fromHundred, toSlider: hundred, format: integer },
    ],
  },
  {
    label: "フィルム",
    items: [
      { key: "lightLeak", label: "ライトリーク", min: -30, max: 80, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "aberration", label: "RGBずらし", min: -30, max: 80, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "skyGradient", label: "空グラデ", min: -30, max: 80, fromSlider: fromHundred, toSlider: hundred, format: integer },
      { key: "frame", label: "枠", min: -30, max: 80, fromSlider: fromHundred, toSlider: hundred, format: integer },
    ],
  },
];
