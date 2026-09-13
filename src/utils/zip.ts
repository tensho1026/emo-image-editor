const CRC_TABLE = new Uint32Array(256);

for (let i = 0; i < 256; i += 1) {
  let crc = i;
  for (let j = 0; j < 8; j += 1) {
    crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  CRC_TABLE[i] = crc >>> 0;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeU16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeU32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

type ZipEntry = {
  name: string;
  data: Uint8Array;
};

/** Uncompressed ZIP (STORE). JPEG/PNG are already compressed. */
export function createZip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const encoded = entries.map((entry) => ({
    ...entry,
    nameBytes: encoder.encode(entry.name),
    crc: crc32(entry.data),
  }));

  let localSize = 0;
  for (const entry of encoded) {
    localSize += 30 + entry.nameBytes.length + entry.data.length;
  }

  let centralSize = 0;
  for (const entry of encoded) {
    centralSize += 46 + entry.nameBytes.length;
  }

  const buffer = new ArrayBuffer(localSize + centralSize + 22);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  let offset = 0;
  const localOffsets: number[] = [];

  for (const entry of encoded) {
    localOffsets.push(offset);
    writeU32(view, offset, 0x04034b50);
    writeU16(view, offset + 4, 20);
    writeU16(view, offset + 6, 0);
    writeU16(view, offset + 8, 0);
    writeU16(view, offset + 10, 0);
    writeU16(view, offset + 12, 0);
    writeU32(view, offset + 14, entry.crc);
    writeU32(view, offset + 18, entry.data.length);
    writeU32(view, offset + 22, entry.data.length);
    writeU16(view, offset + 26, entry.nameBytes.length);
    writeU16(view, offset + 28, 0);
    bytes.set(entry.nameBytes, offset + 30);
    bytes.set(entry.data, offset + 30 + entry.nameBytes.length);
    offset += 30 + entry.nameBytes.length + entry.data.length;
  }

  const centralStart = offset;
  for (let i = 0; i < encoded.length; i += 1) {
    const entry = encoded[i];
    writeU32(view, offset, 0x02014b50);
    writeU16(view, offset + 4, 20);
    writeU16(view, offset + 6, 20);
    writeU16(view, offset + 8, 0);
    writeU16(view, offset + 10, 0);
    writeU16(view, offset + 12, 0);
    writeU16(view, offset + 14, 0);
    writeU32(view, offset + 16, entry.crc);
    writeU32(view, offset + 20, entry.data.length);
    writeU32(view, offset + 24, entry.data.length);
    writeU16(view, offset + 28, entry.nameBytes.length);
    writeU16(view, offset + 30, 0);
    writeU16(view, offset + 32, 0);
    writeU16(view, offset + 34, 0);
    writeU16(view, offset + 36, 0);
    writeU32(view, offset + 38, 0);
    writeU32(view, offset + 42, localOffsets[i]);
    bytes.set(entry.nameBytes, offset + 46);
    offset += 46 + entry.nameBytes.length;
  }

  writeU32(view, offset, 0x06054b50);
  writeU16(view, offset + 4, 0);
  writeU16(view, offset + 6, 0);
  writeU16(view, offset + 8, encoded.length);
  writeU16(view, offset + 10, encoded.length);
  writeU32(view, offset + 12, centralSize);
  writeU32(view, offset + 16, centralStart);
  writeU16(view, offset + 20, 0);

  return new Blob([buffer], { type: "application/zip" });
}
