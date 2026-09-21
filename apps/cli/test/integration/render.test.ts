import { beforeAll, describe, it, expect } from "vitest";
import { renderSvg, renderCombinedSvg } from "../../src/render/card.js";
import { svgToPng } from "../../src/render/png.js";
import { LIGHT, DARK, themeFor } from "../../src/render/theme.js";
import { SAMPLE_STATS } from "../../dev/sample-data.js";
import type { WrappedStats } from "../../src/types.js";
import { loadTestFonts } from "../helpers/fonts.js";
import { isPng, pngSize } from "../helpers/png.js";

const fonts = loadTestFonts();

describe("renderSvg → svgToPng (full Satori → resvg pipeline)", () => {
  // renderSvg is a pure function of (stats, fonts, theme), so render each card
  // once and let the assertions share the result (Satori is the slow part).
  let lightSvg: string;
  let darkSvg: string;
  beforeAll(async () => {
    lightSvg = await renderSvg(SAMPLE_STATS, fonts, LIGHT);
    darkSvg = await renderSvg(SAMPLE_STATS, fonts, DARK);
  });

  it("renders the light card to a structured SVG", () => {
    expect(lightSvg.startsWith("<svg")).toBe(true);
    expect(lightSvg).toContain('width="1080"');
    expect(lightSvg).toContain('height="1350"');
    expect(lightSvg).toContain("<path"); // text is rasterized to glyph paths
    expect(lightSvg).toContain("<image"); // the Claude logo <img>
    // Satori inlines everything — there is no stylesheet and no class attributes.
    expect(lightSvg).not.toContain("<style");
    expect(lightSvg).not.toContain("class=");
  });

  it("rasterizes the light card to a 2160×2700 PNG at scale 2", () => {
    const png = svgToPng(lightSvg, 2, LIGHT.pngBg);
    expect(isPng(png)).toBe(true);
    expect(pngSize(png)).toEqual({ width: 2160, height: 2700 });
  });

  it("rasterizes at scale 1 to 1080×1350", () => {
    const png = svgToPng(lightSvg, 1, LIGHT.pngBg);
    expect(pngSize(png)).toEqual({ width: 1080, height: 1350 });
  });

  it("renders the dark card and produces a distinct raster", () => {
    expect(darkSvg.startsWith("<svg")).toBe(true);
    expect(darkSvg).not.toEqual(lightSvg); // different palette → different SVG
    const png = svgToPng(darkSvg, 2, DARK.pngBg);
    expect(isPng(png)).toBe(true);
    expect(pngSize(png)).toEqual({ width: 2160, height: 2700 });
  });
});

describe("renderCombinedSvg (Vibe Coding Wrapped — Claude + Codex)", () => {
  const codexStats: WrappedStats = {
    ...SAMPLE_STATS,
    provider: "codex",
    models: [{ model: "GPT-5.6 Sol", tokens: 1_000_000, cost: 42, share: 1 }],
    totals: { ...SAMPLE_STATS.totals, reasoning: 5_000_000 },
  };

  it("auto-heights to a 1080-wide SVG taller than a single card, and rasterizes", async () => {
    const svg = await renderCombinedSvg(
      SAMPLE_STATS,
      codexStats,
      fonts,
      themeFor("claude", "light"),
      themeFor("codex", "light"),
    );
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('width="1080"');
    // Satori computes the height from content (no fixed height passed).
    const height = Number(/height="(\d+)"/.exec(svg)?.[1]);
    expect(height).toBeGreaterThan(1200);

    // resvg must rasterize to exactly that auto-computed height.
    const png = svgToPng(svg, 1, themeFor("claude", "light").pngBg);
    expect(isPng(png)).toBe(true);
    expect(pngSize(png)).toEqual({ width: 1080, height });
  });
});
