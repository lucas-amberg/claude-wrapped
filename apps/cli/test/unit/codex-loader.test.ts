import { describe, expect, it } from "vitest";
import { loadCodexMonth } from "../../src/data/codex-loader.js";
import { aggregate } from "../../src/data/aggregate.js";
import { projectName } from "../../src/data/aggregate.js";
import { makePricing } from "../helpers/records.js";
import { FIXTURES_DIR, useCodexHome } from "../helpers/env.js";

describe("loadCodexMonth", () => {
  useCodexHome(FIXTURES_DIR);

  it("parses the old event_msg/token_count format (sums last_token_usage, splits cached out of input)", async () => {
    const { records } = await loadCodexMonth("2026-05", "UTC");
    expect(records.length).toBe(2);

    const [a, b] = records;
    expect(a.provider).toBe("codex");
    expect(a.model).toBe("gpt-5.5");
    // input_tokens INCLUDES cached → non-cached input is the difference.
    expect(a.input).toBe(600); // 1000 - 400
    expect(a.cacheRead).toBe(400);
    expect(a.output).toBe(200);
    expect(a.reasoning).toBe(50);
    expect(b.input).toBe(500); // 2000 - 1500
    expect(b.cacheRead).toBe(1500);
  });

  it("parses the new token_usage_record format, dedups response_id, and never double-counts the mirror token_count", async () => {
    const { records } = await loadCodexMonth("2026-09", "UTC");
    // Two responses (r1, r2). The mirror event_msg/token_count lines and the
    // replayed r1 must NOT add extra records.
    expect(records.length).toBe(2);
    expect(records.map((r) => r.model)).toEqual(["gpt-5-codex", "gpt-5-codex"]);

    const r1 = records[0];
    expect(r1.input).toBe(1000); // 5000 - 4000 cached
    expect(r1.cacheRead).toBe(4000);
    expect(r1.reasoning).toBe(80);

    const r2 = records[1];
    expect(r2.cacheCreate).toBe(100); // cache_write_input_tokens
    expect(r2.input).toBe(1000);

    // Codex worktree cwd resolves to the project AFTER the hash, not the home dir.
    expect(projectName(r1.cwd)).toBe("peptrac-app");
  });

  it("aggregates Codex records with GPT family labels + reasoning totals", async () => {
    const { records } = await loadCodexMonth("2026-09", "UTC");
    const stats = aggregate(records, makePricing(), {
      month: "2026-09",
      timezone: "UTC",
      provider: "codex",
    });
    expect(stats.provider).toBe("codex");
    expect(stats.totals.reasoning).toBe(80);
    expect(stats.models[0]?.model).toBe("GPT-5 Codex");
    expect(stats.projects[0]?.name).toBe("peptrac-app");
    // tokens = (1000+300+0+4000) + (1000+50+100+0) = 5300 + 1150
    expect(stats.totals.tokens).toBe(6450);
  });

  it("returns no records for a month with no Codex sessions", async () => {
    const { records } = await loadCodexMonth("2026-01", "UTC");
    expect(records).toEqual([]);
  });
});
