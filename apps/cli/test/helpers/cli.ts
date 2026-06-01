// Black-box harness for driving the *built* CLI as a subprocess.
//
// The CLI can't be run from src: fonts.ts does `import x from "*.ttf"`, which
// only resolves to bytes through tsup's `loader: { ".ttf": "binary" }` at build
// time (Vitest / Bun would hand back a file-path string instead). So the e2e
// suite builds dist/cli.js first, then spawns it like a real user would.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path to the apps/cli package root (two levels up from test/helpers/). */
const PKG_DIR = fileURLToPath(new URL("../..", import.meta.url));

export interface Bin {
  /** The bin command name (the package.json `bin` key) — `claude-wrapped` today. */
  name: string;
  /** The package version, e.g. "0.1.0" — the oracle for the `--version` output. */
  version: string;
  /** Absolute path to the bin's target, e.g. <pkg>/dist/cli.js. */
  entry: string;
}

/**
 * Read the (single) bin entry from apps/cli/package.json. The name is resolved
 * dynamically — never hardcoded — so an in-flight rename of the bin key
 * (e.g. to `claude-wrapped-cli`) keeps these tests green on either branch.
 */
export function readBin(): Bin {
  const pkg = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf8")) as {
    bin: Record<string, string>;
    version: string;
  };
  const name = Object.keys(pkg.bin)[0];
  return { name, version: pkg.version, entry: resolve(PKG_DIR, pkg.bin[name]) };
}

/**
 * Build dist/cli.js with tsup so the spawned binary always matches current
 * source. turbo's `test` task has no `dependsOn: ["build"]`, so dist isn't
 * guaranteed to exist — we build it here. Throws on a non-zero exit or a
 * still-missing entry so failures surface as a clear setup error.
 */
export function buildCli(): void {
  const { entry } = readBin();
  const res = spawnSync("bun", ["run", "build"], { cwd: PKG_DIR, encoding: "utf8" });
  if (res.status !== 0) {
    throw new Error(`\`bun run build\` failed (status ${res.status}):\n${res.stdout}\n${res.stderr}`);
  }
  if (!existsSync(entry)) {
    throw new Error(`build reported success but ${entry} is missing`);
  }
}

export interface RunResult {
  /** Exit code, or null if the process was killed by a signal. */
  status: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Spawn the built CLI with `args`. Uses spawnSync (not execFileSync) so non-zero
 * exits return cleanly instead of throwing — the suite asserts on exit codes.
 * `opts.env` is layered over the inherited environment.
 */
export function runCli(args: string[], opts: { env?: Record<string, string> } = {}): RunResult {
  const { entry } = readBin();
  const res = spawnSync(process.execPath, [entry, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...opts.env },
  });
  return { status: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
}
