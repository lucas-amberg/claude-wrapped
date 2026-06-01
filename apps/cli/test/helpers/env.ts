import { afterAll, beforeAll } from "vitest";
import { fileURLToPath } from "node:url";

/** Absolute path to test/fixtures — a CLAUDE_CONFIG_DIR whose projects/ tree feeds the loader. */
export const FIXTURES_DIR = fileURLToPath(new URL("../fixtures", import.meta.url));

/**
 * Scope `CLAUDE_CONFIG_DIR` to the enclosing `describe`: optionally point it at
 * `dir` (via beforeAll) and always restore the prior value afterwards. Call from
 * inside a `describe` block.
 */
export function useConfigDir(dir?: string): void {
  const original = process.env.CLAUDE_CONFIG_DIR;
  if (dir !== undefined) {
    beforeAll(() => {
      process.env.CLAUDE_CONFIG_DIR = dir;
    });
  }
  afterAll(() => {
    if (original === undefined) delete process.env.CLAUDE_CONFIG_DIR;
    else process.env.CLAUDE_CONFIG_DIR = original;
  });
}
