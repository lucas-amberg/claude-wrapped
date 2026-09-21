import { afterAll, beforeAll } from "vitest";
import { fileURLToPath } from "node:url";

/** Absolute path to test/fixtures — a CLAUDE_CONFIG_DIR whose projects/ tree feeds the loader. */
export const FIXTURES_DIR = fileURLToPath(new URL("../fixtures", import.meta.url));

/** Scope an env var to the enclosing `describe`, restoring the prior value after. */
function useEnv(key: string, dir?: string): void {
  const original = process.env[key];
  if (dir !== undefined) {
    beforeAll(() => {
      process.env[key] = dir;
    });
  }
  afterAll(() => {
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  });
}

/**
 * Scope `CLAUDE_CONFIG_DIR` to the enclosing `describe`: optionally point it at
 * `dir` (via beforeAll) and always restore the prior value afterwards. Call from
 * inside a `describe` block.
 */
export function useConfigDir(dir?: string): void {
  useEnv("CLAUDE_CONFIG_DIR", dir);
}

/** Same as `useConfigDir`, but for Codex's `CODEX_HOME` (its `sessions/` is scanned). */
export function useCodexHome(dir?: string): void {
  useEnv("CODEX_HOME", dir);
}
