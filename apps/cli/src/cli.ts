import { cac } from "cac";
import { writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import open from "open";
import { loadMonth } from "./data/loader.js";
import { loadCodexMonth } from "./data/codex-loader.js";
import { loadPricing } from "./data/pricing.js";
import { aggregate } from "./data/aggregate.js";
import { renderSvg, renderCombinedSvg } from "./render/card.js";
import { svgToPng } from "./render/png.js";
import { SATORI_FONTS } from "./render/fonts.js";
import { fmtCompact, fmtMoney0, fmtPct1, themeFor } from "./render/theme.js";
import type { PriceMap, Provider, WrappedStats } from "./types.js";
import { name as pkgName, version } from "../package.json";

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
  claude?: boolean;
  codex?: boolean;
}

const TITLE: Record<Provider, string> = { claude: "Claude Wrapped", codex: "Codex Wrapped" };

/** Load + aggregate one provider's usage for the month. Returns null when nothing was found. */
async function statsFor(
  provider: Provider,
  month: string,
  tz: string,
  pricing: PriceMap,
): Promise<{ stats: WrappedStats; filesScanned: number; dir: string } | null> {
  if (provider === "claude") {
    const { records, filesScanned, projectsDir } = await loadMonth(month, tz);
    if (records.length === 0) return null;
    return { stats: aggregate(records, pricing, { month, timezone: tz, provider }), filesScanned, dir: projectsDir };
  }
  const { records, filesScanned, sessionsDir } = await loadCodexMonth(month, tz);
  if (records.length === 0) return null;
  return { stats: aggregate(records, pricing, { month, timezone: tz, provider }), filesScanned, dir: sessionsDir };
}

const summarize = (stats: WrappedStats) =>
  `     ${fmtCompact(stats.totals.tokens)} tokens · ${fmtMoney0(stats.totals.cost)} · ` +
  `${fmtPct1(stats.totals.cacheHitRate)} cache hit · top: ${stats.projects[0]?.name ?? "—"}`;

const cli = cac(pkgName);

cli
  .command("[month]", "Generate a Spotify-Wrapped-style image of your Claude Code + Codex usage")
  .option("--month <YYYY-MM>", "Month to summarize (default: current month)")
  .option("--claude", "Only track Claude Code usage (standalone card)")
  .option("--codex", "Only track Codex CLI usage (standalone card)")
  .option("--output <path>", "Output PNG path (default: ~/Desktop/<name>-<month>.png)")
  .option("--timezone <iana>", "IANA timezone for date grouping (default: system local)")
  .option("--no-open", "Don't open the image after saving")
  .option("--offline", "Use cached/bundled pricing only (no network fetch)")
  .option("--scale <n>", "Render scale for crispness (default: 2)")
  .option("--dark", "Use the dark theme")
  .option("--json", "Also print the computed stats as JSON to stdout")
  .example(`  ${pkgName}                 # combined Claude + Codex card`)
  .example(`  ${pkgName} --claude        # Claude only`)
  .example(`  ${pkgName} --codex --dark  # Codex only, dark theme`)
  .example(`  ${pkgName} --month 2026-05 --output ~/wrapped.png`)
  .action(async (monthArg: string | undefined, opts: Options) => {
    const tz = opts.timezone || systemTz();
    const month = opts.month || monthArg || currentMonth(tz);

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      console.error(`✗ Invalid month "${month}". Use YYYY-MM, e.g. 2026-05.`);
      process.exit(1);
    }

    // --claude / --codex select one; neither (or both) = the combined card.
    const combined = opts.claude === opts.codex; // false only when exactly one is set
    const mode = opts.dark ? "dark" : "light";
    const scale = Number(opts.scale) || 2;

    const pricing = await loadPricing({ offline: opts.offline });
    const claude = !opts.codex || combined ? await statsFor("claude", month, tz, pricing) : null;
    const codex = !opts.claude || combined ? await statsFor("codex", month, tz, pricing) : null;

    // Single-provider requests must have data for that provider.
    if (!combined) {
      const only = opts.claude ? claude : codex;
      if (!only) {
        const which = opts.claude ? "Claude Code" : "Codex";
        const hint = opts.claude
          ? "Set CLAUDE_CONFIG_DIR if your config lives elsewhere."
          : "Set CODEX_HOME if Codex lives elsewhere.";
        console.error(`✗ No ${which} usage found for ${month} (tz ${tz}).\n  ${hint}`);
        process.exit(1);
      }
    } else if (!claude && !codex) {
      console.error(
        `✗ No Claude Code or Codex usage found for ${month} (tz ${tz}).\n` +
          `  Set CLAUDE_CONFIG_DIR / CODEX_HOME if your data lives elsewhere.`,
      );
      process.exit(1);
    }

    // Decide what to render: combined only when BOTH have data; otherwise the
    // single card of whichever we have (a lone Claude/Codex user's default).
    let svg: string;
    let pngBg: string;
    let defaultName: string;
    let heading: string;
    let jsonOut: unknown;

    if (combined && claude && codex) {
      svg = await renderCombinedSvg(
        claude.stats,
        codex.stats,
        SATORI_FONTS,
        themeFor("claude", mode),
        themeFor("codex", mode),
      );
      pngBg = themeFor("claude", mode).pngBg;
      defaultName = `vibe-coding-wrapped-${month}`;
      heading = `Vibe Coding Wrapped · ${claude.stats.monthLabel}`;
      jsonOut = { claude: claude.stats, codex: codex.stats };
    } else {
      const one = (claude ?? codex)!;
      const theme = themeFor(one.stats.provider, mode);
      svg = await renderSvg(one.stats, SATORI_FONTS, theme);
      pngBg = theme.pngBg;
      defaultName = `${one.stats.provider}-wrapped-${month}`;
      heading = `${TITLE[one.stats.provider]} · ${one.stats.monthLabel}`;
      jsonOut = one.stats; // flat single-provider stats (back-compat)
    }

    // --json emits machine output on stdout, so route the human summary to
    // stderr in that case; otherwise print it to stdout so the results are
    // plainly visible in the terminal.
    if (opts.json) process.stdout.write(JSON.stringify(jsonOut, null, 2) + "\n");

    const png = svgToPng(svg, scale, pngBg);
    const output = opts.output
      ? resolve(opts.output)
      : join(homedir(), "Desktop", `${defaultName}.png`);
    await writeFile(output, png);

    const lines = [`\n  ✳  ${heading}`];
    if (claude) lines.push(`  ▸ Claude\n${summarize(claude.stats)}`);
    if (codex) lines.push(`  ▸ Codex\n${summarize(codex.stats)}`);
    lines.push(`     → saved to ${output}\n`);
    (opts.json ? console.error : console.log)(lines.join("\n"));

    if (opts.open !== false) {
      await open(output).catch(() => {
        console.error(`  (couldn't auto-open — open it manually: ${output})\n`);
      });
    }
  });

cli.help();
cli.version(version);

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
