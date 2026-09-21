import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCli, readBin, runCli, type RunResult } from "../helpers/cli.js";
import { FIXTURES_DIR } from "../helpers/env.js";
import { isPng, pngSize } from "../helpers/png.js";

// Render dimensions at the two scales (see test/integration/render.test.ts).
const SCALE2 = { width: 2160, height: 2700 };
const SCALE1 = { width: 1080, height: 1350 };

// Fixture facts (see test/integration/pipeline.test.ts): 2026-05 → 3 Claude
// records, 16650 tokens, top project atlas-api. Codex fixtures (test/fixtures/
// sessions) add 2026-05 (old format) + 2026-09 (new format) sessions.
const MONTH = "2026-05";
const TOKENS = 16650;

// Hermetic render flags shared by every render run.
const HERMETIC = ["--offline", "--no-open", "--timezone", "UTC"];

// Tracked temp dirs, removed wholesale in afterAll.
const tmpDirs: string[] = [];
function tmp(): string {
  const dir = mkdtempSync(join(tmpdir(), "cw-e2e-"));
  tmpDirs.push(dir);
  return dir;
}

// A guaranteed-empty CODEX_HOME so Claude-only tests never read the dev's real
// ~/.codex (findJsonl tolerates the missing sessions/ dir).
const EMPTY_CODEX = tmp();

// Claude-only, hermetic: Codex has no data, so the default falls back to the
// standalone Claude card.
const fixtureEnv = { CLAUDE_CONFIG_DIR: FIXTURES_DIR, CODEX_HOME: EMPTY_CODEX };
// Both agents present → the default renders the combined card.
const bothEnv = { CLAUDE_CONFIG_DIR: FIXTURES_DIR, CODEX_HOME: FIXTURES_DIR };

/** Render `args` to a fresh temp PNG with the hermetic flags; returns the path + spawn result. */
function render(args: string[], env: Record<string, string> = fixtureEnv): RunResult & { out: string } {
  const out = join(tmp(), "out.png");
  return { out, ...runCli([...args, ...HERMETIC, "--output", out], { env }) };
}

describe("e2e: claude-wrapped CLI (spawned dist/cli.js)", () => {
  // Build once; generous timeout because tsup runs as a child process.
  beforeAll(buildCli, 120_000);
  afterAll(() => {
    for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
  });

  it("renders the default light card at scale 2 to --output (Claude-only fixture)", () => {
    const { out, status, stdout, stderr } = render(["--month", MONTH]);
    expect(status).toBe(0);
    expect(existsSync(out)).toBe(true);
    const png = readFileSync(out);
    expect(isPng(png)).toBe(true);
    expect(pngSize(png)).toEqual(SCALE2);
    expect(stderr).toMatch(/Claude Wrapped/);
    expect(stderr).toMatch(/saved to/);
    expect(stdout.trim()).toBe("");
  }, 30_000);

  it("--dark selects the dark theme (raster differs from light)", () => {
    const light = render(["--month", MONTH]);
    const dark = render(["--month", MONTH, "--dark"]);
    expect(light.status).toBe(0);
    expect(dark.status).toBe(0);
    const lightPng = readFileSync(light.out);
    const darkPng = readFileSync(dark.out);
    expect(isPng(lightPng)).toBe(true);
    expect(isPng(darkPng)).toBe(true);
    expect(pngSize(darkPng)).toEqual(SCALE2);
    expect(darkPng.equals(lightPng)).toBe(false);
  }, 60_000);

  it("--scale 1 rasterizes at 1080×1350", () => {
    const { out, status } = render(["--month", MONTH, "--scale", "1"]);
    expect(status).toBe(0);
    expect(pngSize(readFileSync(out))).toEqual(SCALE1);
  }, 30_000);

  it("--json prints the flat single-provider stats and still writes the PNG", () => {
    const { out, status, stdout } = render(["--month", MONTH, "--json"]);
    expect(status).toBe(0);
    const stats = JSON.parse(stdout);
    expect(stats.provider).toBe("claude");
    expect(stats.totals.tokens).toBe(TOKENS);
    expect(stats.monthLabel.length).toBeGreaterThan(0);
    expect(isPng(readFileSync(out))).toBe(true);
  }, 30_000);

  // ---- Codex + combined -----------------------------------------------------

  it("default renders the combined Vibe Coding Wrapped card when both agents have data", () => {
    const { out, status, stdout, stderr } = render(["--month", MONTH, "--json"], bothEnv);
    expect(status).toBe(0);
    const png = readFileSync(out);
    expect(isPng(png)).toBe(true);
    expect(pngSize(png).width).toBe(2160); // combined is 1080 wide → 2160 at scale 2
    expect(stderr).toMatch(/Vibe Coding Wrapped/);
    expect(stderr).toMatch(/Claude/);
    expect(stderr).toMatch(/Codex/);
    const stats = JSON.parse(stdout);
    expect(stats.claude.provider).toBe("claude");
    expect(stats.codex.provider).toBe("codex");
    expect(stats.codex.totals.reasoning).toBeGreaterThan(0);
  }, 30_000);

  it("--codex renders a standalone Codex card", () => {
    const { out, status, stdout, stderr } = render(["--month", MONTH, "--codex", "--scale", "1", "--json"], bothEnv);
    expect(status).toBe(0);
    expect(pngSize(readFileSync(out))).toEqual(SCALE1);
    expect(stderr).toMatch(/Codex Wrapped/);
    expect(stderr).not.toMatch(/Vibe Coding Wrapped/);
    expect(JSON.parse(stdout).provider).toBe("codex");
  }, 30_000);

  it("--claude forces the Claude card even when Codex data exists", () => {
    const { status, stderr } = render(["--month", MONTH, "--claude"], bothEnv);
    expect(status).toBe(0);
    expect(stderr).toMatch(/Claude Wrapped/);
    expect(stderr).not.toMatch(/Vibe Coding Wrapped/);
    expect(stderr).not.toMatch(/Codex Wrapped/);
  }, 30_000);

  it("defaults the combined output to ~/Desktop/vibe-coding-wrapped-<month>.png", () => {
    const home = tmp();
    mkdirSync(join(home, "Desktop"));
    const { status } = runCli(["--month", MONTH, ...HERMETIC], {
      env: { ...bothEnv, HOME: home },
    });
    expect(status).toBe(0);
    const expected = join(home, "Desktop", `vibe-coding-wrapped-${MONTH}.png`);
    expect(existsSync(expected)).toBe(true);
    expect(isPng(readFileSync(expected))).toBe(true);
  }, 30_000);

  it("defaults a Claude-only run to ~/Desktop/claude-wrapped-<month>.png", () => {
    const home = tmp();
    mkdirSync(join(home, "Desktop"));
    const { status } = runCli(["--month", MONTH, ...HERMETIC], {
      env: { ...fixtureEnv, HOME: home },
    });
    expect(status).toBe(0);
    const expected = join(home, "Desktop", `claude-wrapped-${MONTH}.png`);
    expect(existsSync(expected)).toBe(true);
  }, 30_000);

  it("accepts the month as a positional argument", () => {
    const { out, status } = render([MONTH]);
    expect(status).toBe(0);
    expect(isPng(readFileSync(out))).toBe(true);
  }, 30_000);

  it("rejects an invalid month with exit 1 and writes no file", () => {
    const { out, status, stderr } = render(["--month", "2026-13"]);
    expect(status).toBe(1);
    expect(stderr).toMatch(/Invalid month/);
    expect(existsSync(out)).toBe(false);
  });

  it("exits 1 when neither agent has data", () => {
    const empty = tmp();
    const { status, stderr } = runCli(["--month", MONTH, ...HERMETIC], {
      env: { CLAUDE_CONFIG_DIR: empty, CODEX_HOME: empty },
    });
    expect(status).toBe(1);
    expect(stderr).toMatch(/No Claude Code or Codex usage found/);
  });

  it("--codex exits 1 when no Codex data is found", () => {
    const { status, stderr } = runCli(["--month", MONTH, "--codex", ...HERMETIC], {
      env: fixtureEnv, // Codex home is empty
    });
    expect(status).toBe(1);
    expect(stderr).toMatch(/No Codex usage found/);
  });

  it("exits 1 when the requested month has no usage", () => {
    const { status, stderr } = runCli(["--month", "2026-01", ...HERMETIC], { env: fixtureEnv });
    expect(status).toBe(1);
    expect(stderr).toMatch(/No Claude Code or Codex usage found for 2026-01/);
  });

  it("--version prints the bin name and version", () => {
    const { name, version } = readBin();
    const { status, stdout } = runCli(["--version"]);
    expect(status).toBe(0);
    expect(stdout).toContain(version);
    expect(stdout).toContain(name);
  });

  it("--help lists usage and every flag", () => {
    const { status, stdout } = runCli(["--help"]);
    expect(status).toBe(0);
    expect(stdout).toContain("Usage");
    for (const flag of [
      "--month",
      "--claude",
      "--codex",
      "--output",
      "--timezone",
      "--no-open",
      "--offline",
      "--scale",
      "--dark",
      "--json",
    ]) {
      expect(stdout).toContain(flag);
    }
  });
});
