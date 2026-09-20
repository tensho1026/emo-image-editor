export type AppliedFilters = {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grain: number;
  bloom: number;
  warmth: number;
  fade: number;
  blue: number;
  hue: number;
  shadows: number;
  highlights: number;
  vignette: number;
  haze: number;
  lightLeak: number;
  aberration: number;
  skyGradient: number;
  frame: number;
};

export type Preset = AppliedFilters & {
  id: string;
  name: string;
  description: string;
};

export type ExportSize = "original" | "preview" | "square" | "story";
