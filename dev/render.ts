// Dev-only: render the Satori PNG from stats JSON (fonts read from disk, so it
// runs under bun without the bundler's binary loader).
//   bun dev/render.ts [statsJsonPath]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { WrappedStats } from "../src/types.js";
import { renderSvg, type FontSpec } from "../src/render/card.js";
import { svgToPng } from "../src/render/png.js";
import { FONT_FILES } from "../src/render/font-manifest.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const stats = JSON.parse(
  readFileSync(process.argv[2] || "/tmp/stats-local.json", "utf8"),
) as WrappedStats;

const fdir = join(root, "src/assets/fonts");
const fonts: FontSpec[] = FONT_FILES.map(({ family, file, weight }) => ({
  name: family,
  data: readFileSync(join(fdir, file)),
  weight,
  style: "normal",
}));

const t0 = Date.now();
const svg = await renderSvg(stats, fonts);
writeFileSync(join(root, "mockup/satori.svg"), svg);
const png = svgToPng(svg, 2);
writeFileSync(join(root, "mockup/satori.png"), png);
console.log(`wrote mockup/satori.png (${png.length} bytes) in ${Date.now() - t0}ms`);
