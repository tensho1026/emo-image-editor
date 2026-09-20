import { describe, expect, it } from "vitest";
import { parseRecipeJson } from "./recipes";

const validRecipe = {
  id: "recipe-1",
  name: "Night memory",
  createdAt: 1,
  presetId: "tide",
  intensity: 50,
  tweaks: { brightness: 1.1, grain: -0.1 },
};

describe("recipe validation", () => {
  it("accepts known finite adjustments", () => {
    expect(parseRecipeJson(JSON.stringify(validRecipe))).toEqual(validRecipe);
  });

  it("clamps intensity to the supported range", () => {
    expect(parseRecipeJson(JSON.stringify({ ...validRecipe, intensity: 120 }))?.intensity).toBe(100);
  });

  it("rejects unknown presets and non-finite adjustment values", () => {
    expect(parseRecipeJson(JSON.stringify({ ...validRecipe, presetId: "unknown" }))).toBeNull();
    expect(parseRecipeJson(JSON.stringify({ ...validRecipe, tweaks: { grain: "heavy" } }))).toBeNull();
  });
});
