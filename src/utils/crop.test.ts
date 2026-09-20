import { describe, expect, it } from "vitest";
import { aspectCrop, clampCrop, cropToPixels } from "./crop";

describe("crop utilities", () => {
  it("keeps crop rectangles inside the image", () => {
    expect(clampCrop({ x: -1, y: 0.9, width: 0.5, height: 0.5 })).toEqual({
      x: 0,
      y: 0.5,
      width: 0.5,
      height: 0.5,
    });
  });

  it("creates a centered square crop", () => {
    expect(aspectCrop(1600, 900, 1)).toEqual({ x: 0.21875, y: 0, width: 0.5625, height: 1 });
  });

  it("converts normalized coordinates to bounded pixels", () => {
    expect(cropToPixels({ x: 0.25, y: 0.25, width: 0.5, height: 0.5 }, 400, 200)).toEqual({
      x: 100,
      y: 50,
      width: 200,
      height: 100,
    });
  });
});
