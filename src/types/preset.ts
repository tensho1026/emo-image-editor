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
};

export type AppliedFilters = Omit<Preset, "id" | "name" | "description">;
