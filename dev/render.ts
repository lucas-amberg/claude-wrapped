// Dev-only: render the Satori PNG from stats JSON (fonts read from disk, so it
// runs under bun without the bundler's binary loader).
//   bun dev/render.ts [statsJsonPath] [--dark]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { WrappedStats } from "../src/types.js";
import { renderSvg, type FontSpec } from "../src/render/card.js";
import { svgToPng } from "../src/render/png.js";
import { themeFor } from "../src/render/theme.js";
import { FONT_FILES } from "../src/render/font-manifest.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
mkdirSync(join(root, "mockup"), { recursive: true });
const dark = process.argv.includes("--dark");
const statsPath = process.argv.slice(2).find((a) => !a.startsWith("--")) || "/tmp/stats-local.json";
const stats = JSON.parse(readFileSync(statsPath, "utf8")) as WrappedStats;
const theme = themeFor(dark ? "dark" : "light");

const fdir = join(root, "src/assets/fonts");
const fonts: FontSpec[] = FONT_FILES.map(({ family, file, weight }) => ({
  name: family,
  data: readFileSync(join(fdir, file)),
  weight,
  style: "normal",
}));

const t0 = Date.now();
const svg = await renderSvg(stats, fonts, theme);
const svgFile = dark ? "mockup/satori-dark.svg" : "mockup/satori.svg";
const pngFile = dark ? "mockup/satori-dark.png" : "mockup/satori.png";
writeFileSync(join(root, svgFile), svg);
const png = svgToPng(svg, 2, theme.pngBg);
writeFileSync(join(root, pngFile), png);
console.log(`wrote ${pngFile} (${png.length} bytes) in ${Date.now() - t0}ms`);
