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
};

export type AppliedFilters = {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grain: number;
  bloom: number;
  warmth: number;
  fade: number;
};
