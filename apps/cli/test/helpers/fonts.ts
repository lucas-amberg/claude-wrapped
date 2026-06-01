import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { FontSpec } from "../../src/render/card.js";
import { FONT_FILES } from "../../src/render/font-manifest.js";

/**
 * Build the Satori `FontSpec[]` for tests by reading the bundled `.ttf` files
 * from `src/assets/fonts/` directly. This deliberately avoids `src/render/fonts.ts`,
 * whose `.ttf` imports rely on tsup's binary loader (which Vitest can't replicate).
 */
export function loadTestFonts(): FontSpec[] {
  return FONT_FILES.map(({ family, file, weight }) => {
    const path = fileURLToPath(new URL(`../../src/assets/fonts/${file}`, import.meta.url));
    return {
      name: family,
      data: readFileSync(path),
      weight,
      style: "normal" as const,
    };
  });
}
