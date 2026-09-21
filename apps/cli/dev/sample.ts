// Dev-only: regenerate the committed README sample cards from the fictional
// fixture. One run writes BOTH PNGs (light → docs/sample.png, dark →
// docs/sample-dark.png) AND mirrors each into apps/web/public/ so the website's
// hero card can never drift from the README's — plus a side-by-side HTML
// preview for a browser check.
//   bun dev/sample.ts
//
// Reuses the exact renderSvg / svgToPng / themeFor the production CLI uses, so
// the committed samples can't drift from real output. Fonts are read from disk
// (via FONT_FILES) so this runs under bun without the bundler's binary loader.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderSvg, renderCombinedSvg, type FontSpec } from "../src/render/card.js";
import { svgToPng } from "../src/render/png.js";
import { buildCardMarkup } from "../src/render/card-markup.js";
import { themeFor, LIGHT, DARK, type Palette } from "../src/render/theme.js";
import { FONT_FILES } from "../src/render/font-manifest.js";
import { SAMPLE_STATS, SAMPLE_STATS_CODEX } from "./sample-data.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const web = join(root, "..", "web", "public");
mkdirSync(join(root, "docs"), { recursive: true });
mkdirSync(join(root, "mockup"), { recursive: true });

const fdir = join(root, "src/assets/fonts");
// Read each .ttf from disk once, then reuse the buffer for both Satori
// rendering and the base64-inlined preview below.
const fontData = FONT_FILES.map((f) => ({ ...f, data: readFileSync(join(fdir, f.file)) }));
const fonts: FontSpec[] = fontData.map(({ family, data, weight }) => ({
  name: family,
  data,
  weight,
  style: "normal",
}));

// Render once per theme, then write the SAME buffer to every target path so the
// docs copy and the website's public copy stay byte-identical.
async function renderTo(theme: Palette, ...outPaths: string[]): Promise<number> {
  const svg = await renderSvg(SAMPLE_STATS, fonts, theme);
  const png = svgToPng(svg, 2, theme.pngBg);
  for (const p of outPaths) writeFileSync(p, png);
  return png.length;
}

async function renderCombinedTo(mode: "light" | "dark", ...outPaths: string[]): Promise<number> {
  const svg = await renderCombinedSvg(
    SAMPLE_STATS,
    SAMPLE_STATS_CODEX,
    fonts,
    themeFor("claude", mode),
    themeFor("codex", mode),
  );
  const png = svgToPng(svg, 2, themeFor("claude", mode).pngBg);
  for (const p of outPaths) writeFileSync(p, png);
  return png.length;
}

const t0 = Date.now();
// Standalone Claude cards → docs/sample*.png, mirrored byte-identically to the
// website's public/ (the cross-app design contract).
const lightBytes = await renderTo(
  themeFor("claude", "light"),
  join(root, "docs/sample.png"),
  join(web, "sample.png"),
);
const darkBytes = await renderTo(
  themeFor("claude", "dark"),
  join(root, "docs/sample-dark.png"),
  join(web, "sample-dark.png"),
);
// Standalone Codex card (README).
await renderTo(themeFor("codex", "light"), join(root, "docs/sample-codex.png"));
// Combined "Vibe Coding Wrapped" flagship — README hero (docs) + website hero (public).
await renderCombinedTo("light", join(root, "docs/sample-combined.png"), join(web, "sample-combined.png"));
await renderCombinedTo("dark", join(root, "docs/sample-combined-dark.png"), join(web, "sample-combined-dark.png"));
console.log(
  `wrote docs/sample*.png (claude ${lightBytes}+${darkBytes}B, codex, combined light+dark), ` +
    `mirrored claude pair + combined pair to apps/web/public/, in ${Date.now() - t0}ms`,
);

// --- side-by-side HTML preview (fonts base64-inlined, like dev/mockup.ts) ----
const fontFaces = fontData
  .map(
    ({ family, data, weight }) =>
      `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/ttf;base64,${data.toString("base64")}) format('truetype');}`,
  )
  .join("\n");

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
${fontFaces}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#1b1714;display:flex;gap:48px;align-items:flex-start;justify-content:center;flex-wrap:wrap;padding:56px;font-family:'Poppins';}
figure{display:flex;flex-direction:column;align-items:center;gap:18px;}
figcaption{font-family:'Space Mono',monospace;font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#cbb9ad;}
/* card root is 1080×1350; scale it to half so both fit side by side */
.frame{width:540px;height:675px;overflow:hidden;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,0.45);}
.frame > div{transform:scale(0.5);transform-origin:top left;}
</style></head>
<body>
  <figure><div class="frame">${buildCardMarkup(SAMPLE_STATS, LIGHT)}</div><figcaption>Light · default</figcaption></figure>
  <figure><div class="frame">${buildCardMarkup(SAMPLE_STATS, DARK)}</div><figcaption>Dark · --dark</figcaption></figure>
</body></html>`;

writeFileSync(join(root, "mockup/sample-preview.html"), html);
console.log("wrote mockup/sample-preview.html");
