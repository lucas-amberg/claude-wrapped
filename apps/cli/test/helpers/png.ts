// Minimal PNG inspectors — enough to prove resvg produced a real raster of the
// expected size, without pulling in an image-decoding dependency.

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** True if `buf` starts with the 8-byte PNG signature. */
export function isPng(buf: Uint8Array): boolean {
  if (buf.length < PNG_MAGIC.length) return false;
  return PNG_MAGIC.every((b, i) => buf[i] === b);
}

/**
 * Parse pixel dimensions from a PNG's IHDR chunk. Layout: 8-byte signature,
 * 4-byte chunk length, 4-byte "IHDR" type, then width/height as big-endian u32.
 */
export function pngSize(buf: Buffer): { width: number; height: number } {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
