import { describe, expect, it } from "vitest";
import { createZip } from "./zip";

describe("ZIP export", () => {
  it("writes a valid ZIP envelope containing UTF-8 filenames", async () => {
    const zip = createZip([{ name: "思い出.jpg", data: new Uint8Array([1, 2, 3]) }]);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    const view = new DataView(bytes.buffer);

    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(bytes.length - 22, true)).toBe(0x06054b50);
    expect(new TextDecoder().decode(bytes)).toContain("思い出.jpg");
  });
});
