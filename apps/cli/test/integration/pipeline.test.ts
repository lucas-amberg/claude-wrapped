import { describe, expect, it } from "vitest";
import { loadMonth } from "../../src/data/loader.js";
import { aggregate } from "../../src/data/aggregate.js";
import { renderSvg } from "../../src/render/card.js";
import { svgToPng } from "../../src/render/png.js";
import { LIGHT } from "../../src/render/theme.js";
import type { PriceMap } from "../../src/types.js";
import fallback from "../../src/assets/pricing-fallback.json";
import { loadTestFonts } from "../helpers/fonts.js";
import { isPng, pngSize } from "../helpers/png.js";
import { FIXTURES_DIR, useConfigDir } from "../helpers/env.js";

const fonts = loadTestFonts();

describe("source-level pipeline: loadMonth → aggregate → renderSvg → svgToPng", () => {
  useConfigDir(FIXTURES_DIR);

  it("produces sane stats and a valid PNG end to end", async () => {
    const { records } = await loadMonth("2026-05", "UTC");
    expect(records.length).toBe(3);

    const stats = aggregate(records, fallback as unknown as PriceMap, {
      month: "2026-05",
      timezone: "UTC",
    });

    // Token math flows through unchanged: 11500 + 1700 + 3450.
    expect(stats.totals.messages).toBe(3);
    expect(stats.totals.tokens).toBe(16650);
    // Two atlas-api lines + a worktree line all roll up to one project.
    expect(stats.projects[0]?.name).toBe("atlas-api");
    expect(stats.projects.some((p) => p.name.includes("worktree") || p.name === "feature-x")).toBe(
      false,
    );
    // Opus spend dominates the lone Sonnet line.
    expect(stats.models[0]?.model).toBe("Opus");

    const svg = await renderSvg(stats, fonts, LIGHT);
    const png = svgToPng(svg, 2, LIGHT.pngBg);
    expect(isPng(png)).toBe(true);
    expect(pngSize(png)).toEqual({ width: 2160, height: 2700 });
  });
});
