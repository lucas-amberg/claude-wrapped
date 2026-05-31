import { cac } from "cac";
import { writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import open from "open";
import { loadMonth } from "./data/loader.js";
import { loadPricing } from "./data/pricing.js";
import { aggregate } from "./data/aggregate.js";
import { renderSvg } from "./render/card.js";
import { svgToPng } from "./render/png.js";
import { SATORI_FONTS } from "./render/fonts.js";
import { fmtCompact, fmtMoney0, fmtPct1, themeFor } from "./render/theme.js";

const VERSION = "0.1.0";
const systemTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

function currentMonth(tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}`;
}

interface Options {
  month?: string;
  output?: string;
  timezone?: string;
  open: boolean;
  offline: boolean;
  scale?: number | string;
  json?: boolean;
  dark?: boolean;
}

const cli = cac("claude-wrapped");

cli
  .command("[month]", "Generate a Spotify-Wrapped-style image of your Claude Code usage")
  .option("--month <YYYY-MM>", "Month to summarize (default: current month)")
  .option("--output <path>", "Output PNG path (default: ~/Desktop/claude-wrapped-<month>.png)")
  .option("--timezone <iana>", "IANA timezone for date grouping (default: system local)")
  .option("--no-open", "Don't open the image after saving")
  .option("--offline", "Use cached/bundled pricing only (no network fetch)")
  .option("--scale <n>", "Render scale for crispness (default: 2)")
  .option("--dark", "Use the dark theme")
  .option("--json", "Also print the computed stats as JSON to stdout")
  .example("  claude-wrapped")
  .example("  claude-wrapped --dark")
  .example("  claude-wrapped --month 2026-05 --no-open")
  .example("  claude-wrapped --month 2026-05 --output ~/wrapped.png")
  .action(async (monthArg: string | undefined, opts: Options) => {
    const tz = opts.timezone || systemTz();
    const month = opts.month || monthArg || currentMonth(tz);

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      console.error(`✗ Invalid month "${month}". Use YYYY-MM, e.g. 2026-05.`);
      process.exit(1);
    }

    const { records, filesScanned, projectsDir } = await loadMonth(month, tz);

    if (filesScanned === 0) {
      console.error(
        `✗ No Claude Code data found at ${projectsDir}\n` +
          `  Set CLAUDE_CONFIG_DIR if your config lives elsewhere.`,
      );
      process.exit(1);
    }
    if (records.length === 0) {
      console.error(
        `✗ No Claude usage found for ${month} (scanned ${filesScanned} files in ${projectsDir}).\n` +
          `  Try a different --month, or check --timezone ${tz}.`,
      );
      process.exit(1);
    }

    const pricing = await loadPricing({ offline: opts.offline });
    const stats = aggregate(records, pricing, { month, timezone: tz });

    if (opts.json) process.stdout.write(JSON.stringify(stats, null, 2) + "\n");

    const theme = themeFor(opts.dark ? "dark" : "light");
    const svg = await renderSvg(stats, SATORI_FONTS, theme);
    const scale = Number(opts.scale) || 2;
    const png = svgToPng(svg, scale, theme.pngBg);

    const output = opts.output
      ? resolve(opts.output)
      : join(homedir(), "Desktop", `claude-wrapped-${month}.png`);
    await writeFile(output, png);

    const top = stats.projects[0]?.name ?? "—";
    console.error(
      `\n  ✳  Claude Wrapped · ${stats.monthLabel}\n` +
        `     ${fmtCompact(stats.totals.tokens)} tokens · ${fmtMoney0(stats.totals.cost)} · ` +
        `${fmtPct1(stats.totals.cacheHitRate)} cache hit · top: ${top}\n` +
        `     → saved to ${output}\n`,
    );

    if (opts.open !== false) {
      await open(output).catch(() => {
        /* opening is best-effort */
      });
    }
  });

cli.help();
cli.version(VERSION);

// cac's parse() fires the async action as a floating promise, so its rejections
// must be caught off runMatchedCommand() — a plain try/catch around parse() only
// sees synchronous parse-time errors, not failures inside the action.
async function main() {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
