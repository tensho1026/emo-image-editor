export type Preset = {
  id: string;
  name: string;
  description: string;
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
  doubleExposure: number;
  windowRain: number;
  flashBurn: number;
  rawLook: number;
  colorCast: number;
  scanDust: number;
  foldedTape: number;
  shake: number;
  splitExposure: number;
};

export type AppliedFilters = Omit<Preset, "id" | "name" | "description">;

export type ExportSize = "original" | "preview" | "square" | "story";
