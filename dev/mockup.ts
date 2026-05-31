// Dev-only: render a standalone HTML mockup of the square card from real stats.
//   bun dev/mockup.ts [statsJsonPath]
// Fonts are base64-embedded so the browser preview is pixel-accurate.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { WrappedStats } from "../src/types.js";
import { buildCardMarkup } from "../src/render/card-markup.js";
import { FONT_FILES } from "../src/render/font-manifest.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const statsPath = process.argv[2] || "/tmp/stats-local.json";
const stats = JSON.parse(readFileSync(statsPath, "utf8")) as WrappedStats;

const fontsDir = join(root, "src/assets/fonts");
const b64 = (f: string) => readFileSync(join(fontsDir, f)).toString("base64");
const fonts = FONT_FILES.map(
  ({ family, file, weight }) =>
    `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/ttf;base64,${b64(file)}) format('truetype');}`,
).join("\n");

const card = buildCardMarkup(stats);

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
${fonts}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#E7E2D6;display:flex;align-items:center;justify-content:center;padding:28px;font-family:'Poppins';}
.frame{box-shadow:0 30px 80px rgba(60,30,15,0.24);border-radius:34px;overflow:hidden;}
</style></head>
<body><div class="frame">${card}</div></body></html>`;

writeFileSync(join(root, "mockup/index.html"), html);
console.log("wrote mockup/index.html");
