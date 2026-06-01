import { beforeAll, describe, expect, it } from "vitest";
import { homedir } from "node:os";
import { join } from "node:path";
import { type LoadResult, loadMonth, resolveProjectsDir } from "../../src/data/loader.js";
import { FIXTURES_DIR, useConfigDir } from "../helpers/env.js";

describe("resolveProjectsDir", () => {
  useConfigDir(); // restore CLAUDE_CONFIG_DIR after this block mutates it

  it("honors CLAUDE_CONFIG_DIR", () => {
    process.env.CLAUDE_CONFIG_DIR = "/tmp/cw-test-config";
    expect(resolveProjectsDir()).toBe(join("/tmp/cw-test-config", "projects"));
  });

  it("falls back to ~/.claude/projects", () => {
    delete process.env.CLAUDE_CONFIG_DIR;
    expect(resolveProjectsDir()).toBe(join(homedir(), ".claude", "projects"));
  });
});

describe("loadMonth (fixtures)", () => {
  useConfigDir(FIXTURES_DIR);

  let utc: LoadResult;
  let ny: LoadResult;
  beforeAll(async () => {
    utc = await loadMonth("2026-05", "UTC");
    ny = await loadMonth("2026-05", "America/New_York");
  });

  it("dedups and skips other-month / synthetic / non-assistant / malformed lines", () => {
    expect(utc.filesScanned).toBe(1);
    expect(utc.records.length).toBe(3); // 2 unique assistant lines + 1 straddle line
    const firstTs = Date.parse("2026-05-10T14:00:00.000Z");
    expect(utc.records.filter((r) => r.ts === firstTs)).toHaveLength(1); // duplicate dropped
  });

  it("assigns local day/hour/dow per timezone (UTC vs America/New_York)", () => {
    const straddle = Date.parse("2026-05-15T02:30:00.000Z");
    const u = utc.records.find((r) => r.ts === straddle);
    const n = ny.records.find((r) => r.ts === straddle);
    expect(u).toBeDefined();
    expect(n).toBeDefined();
    expect(u!.day).toBe("2026-05-15");
    expect(u!.hour).toBe(2);
    expect(n!.day).toBe("2026-05-14"); // UTC-4 → previous calendar day
    expect(n!.hour).toBe(22);
    expect(u!.dow).not.toBe(n!.dow);
  });
});
