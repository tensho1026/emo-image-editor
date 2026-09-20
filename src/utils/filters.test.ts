import { describe, expect, it } from "vitest";
import { IDENTITY_FILTERS } from "../config/filters";
import { presets } from "../presets/presets";
import { applyIntensity, combineFilters } from "./filters";

describe("filter calculations", () => {
  it("keeps the identity at zero intensity and the preset at standard intensity", () => {
    expect(applyIntensity(presets[0], 0)).toEqual(IDENTITY_FILTERS);
    expect(applyIntensity(presets[0], 50)).toEqual(
      expect.objectContaining({
        brightness: presets[0].brightness,
        blue: presets[0].blue,
        frame: presets[0].frame,
      }),
    );
  });

  it("combines multiplicative and additive adjustments and clamps the result", () => {
    const base = { ...IDENTITY_FILTERS, brightness: 0.8, shadows: 0.4 };
    const tweaks = { ...IDENTITY_FILTERS, brightness: 1.2, shadows: -0.2, grain: 2 };
    const combined = combineFilters(base, tweaks);

    expect(combined.brightness).toBeCloseTo(0.96);
    expect(combined.shadows).toBeCloseTo(0.2);
    expect(combined.grain).toBe(1);
  });
});
