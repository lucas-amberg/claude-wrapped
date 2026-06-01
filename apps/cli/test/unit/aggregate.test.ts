import { describe, it, expect } from "vitest";
import { aggregate, modelFamily, projectName } from "../../src/data/aggregate.js";
import { makePricing, makeRecord } from "../helpers/records.js";

describe("aggregate — totals, models, projects, time, heatmap", () => {
  const pricing = makePricing();
  const records = [
    makeRecord({
      model: "claude-opus-4-7",
      input: 1000,
      output: 500,
      cacheCreate: 2000,
      cacheRead: 8000,
      cwd: "/Users/dev/atlas-api",
      hour: 23,
      dow: 0,
      day: "2026-05-01",
    }),
    makeRecord({
      model: "claude-opus-4-7",
      input: 500,
      output: 200,
      cacheRead: 4000,
      cwd: "/Users/dev/atlas-api",
      hour: 23,
      dow: 1,
      day: "2026-05-02",
    }),
    makeRecord({
      model: "claude-sonnet-4-6",
      input: 300,
      output: 100,
      cacheCreate: 1000,
      cacheRead: 2000,
      cwd: "/Users/dev/northstar",
      hour: 23,
      dow: 2,
      day: "2026-05-03",
    }),
  ];
  const stats = aggregate(records, pricing, { month: "2026-05", timezone: "UTC" });

  it("sums token totals and message count", () => {
    expect(stats.totals.input).toBe(1800);
    expect(stats.totals.output).toBe(800);
    expect(stats.totals.cacheCreate).toBe(3000);
    expect(stats.totals.cacheRead).toBe(14000);
    expect(stats.totals.tokens).toBe(19600);
    expect(stats.totals.messages).toBe(3);
  });

  it("computes cacheHitRate = cacheRead / (cacheRead + cacheCreate + input)", () => {
    expect(stats.totals.cacheHitRate).toBeCloseTo(14000 / 18800, 10);
  });

  it("computes total cost as the weighted sum across records", () => {
    expect(stats.totals.cost).toBeCloseTo(0.09375, 10);
  });

  it("sorts models by cost desc with shares summing to 1", () => {
    expect(stats.models.map((m) => m.model)).toEqual(["Opus", "Sonnet"]);
    expect(stats.models[0].cost).toBeGreaterThan(stats.models[1].cost);
    expect(stats.models[0].tokens).toBe(16200);
    expect(stats.models[1].tokens).toBe(3400);
    expect(stats.models.reduce((s, m) => s + m.share, 0)).toBeCloseTo(1, 10);
  });

  it("rolls projects up, sorts by cost desc", () => {
    expect(stats.projects.map((p) => p.name)).toEqual(["atlas-api", "northstar"]);
    expect(stats.projects[0].messages).toBe(2);
    expect(stats.projects[0].cost).toBeCloseTo(0.087, 10);
    expect(stats.projects[1].cost).toBeCloseTo(0.00675, 10);
  });

  it("finds the peak hour (by messages) and busiest day (by tokens)", () => {
    expect(stats.time.peakHour).toBe(23);
    expect(stats.time.peakHourCount).toBe(3);
    expect(stats.time.busiestDay).toBe("2026-05-01");
    expect(stats.time.busiestDayTokens).toBe(11500);
  });

  it("builds a [7][24] heatmap normalized so the max cell is 1", () => {
    expect(stats.heatmap).toHaveLength(7);
    expect(stats.heatmap.every((r) => r.length === 24)).toBe(true);
    expect(Math.max(...stats.heatmap.flat())).toBe(1);
    expect(stats.heatmapCounts[0][23]).toBe(1);
    expect(stats.heatmapCounts[1][23]).toBe(1);
    expect(stats.heatmapCounts[2][23]).toBe(1);
    expect(stats.heatmapMax).toBe(1);
  });

  it("counts active days and the longest consecutive streak", () => {
    expect(stats.time.activeDays).toBe(3);
    expect(stats.time.longestStreakDays).toBe(3); // 05-01, 05-02, 05-03
    expect(stats.time.daysInMonth).toBe(31);
  });
});

describe("aggregate — daysInMonth", () => {
  it("derives the calendar length of the month", () => {
    const days = (month: string) =>
      aggregate([], makePricing(), { month, timezone: "UTC" }).time.daysInMonth;
    expect(days("2026-02")).toBe(28);
    expect(days("2024-02")).toBe(29); // leap year
    expect(days("2026-05")).toBe(31);
  });
});

describe("aggregate — persona (driven via peakHour)", () => {
  const personaFor = (hour: number) =>
    aggregate([makeRecord({ hour })], makePricing(), { month: "2026-05", timezone: "UTC" }).time
      .persona;

  it("maps the peak hour to a coding persona", () => {
    expect(personaFor(23)).toBe("Night Owl");
    expect(personaFor(7)).toBe("Early Bird");
    expect(personaFor(14)).toBe("Daylight Coder");
    expect(personaFor(19)).toBe("Evening Hacker");
  });
});

describe("aggregate — longestStreak (driven via day sets)", () => {
  const streakFor = (days: string[]) =>
    aggregate(
      days.map((day) => makeRecord({ day })),
      makePricing(),
      { month: "2026-05", timezone: "UTC" },
    ).time.longestStreakDays;

  it("returns 1 when every day is gapped", () => {
    expect(streakFor(["2026-05-01", "2026-05-03", "2026-05-05"])).toBe(1);
  });

  it("returns the best consecutive run when days are mixed", () => {
    expect(streakFor(["2026-05-01", "2026-05-02", "2026-05-10", "2026-05-11", "2026-05-12"])).toBe(3);
  });
});

describe("aggregate — top-N projects + worktree rollup", () => {
  const mk = (proj: string, cacheRead: number, day: string) =>
    makeRecord({ model: "claude-opus-4-7", cacheRead, cwd: `/Users/dev/${proj}`, day });
  const records = [
    mk("alpha", 6000, "2026-05-01"),
    mk("bravo", 5000, "2026-05-02"),
    mk("charlie", 4000, "2026-05-03"),
    mk("delta", 3000, "2026-05-04"),
    mk("echo", 2000, "2026-05-05"),
    mk("foxtrot", 1000, "2026-05-06"),
    makeRecord({
      model: "claude-opus-4-7",
      cacheRead: 500,
      cwd: "/Users/dev/alpha/.claude/worktrees/feat",
      day: "2026-05-07",
    }),
  ];

  it("keeps the top 5 by cost and rolls worktrees into the parent", () => {
    const stats = aggregate(records, makePricing(), { month: "2026-05", timezone: "UTC" });
    expect(stats.projects.map((p) => p.name)).toEqual(["alpha", "bravo", "charlie", "delta", "echo"]);
    expect(stats.projects.find((p) => p.name === "alpha")?.messages).toBe(2);
    expect(stats.projects.some((p) => p.name.includes("worktree") || p.name === "feat")).toBe(false);
    expect(stats.projects.some((p) => p.name === "foxtrot")).toBe(false);
  });

  it("honors the topProjects option", () => {
    const stats = aggregate(records, makePricing(), {
      month: "2026-05",
      timezone: "UTC",
      topProjects: 2,
    });
    expect(stats.projects.map((p) => p.name)).toEqual(["alpha", "bravo"]);
  });
});

describe("projectName", () => {
  it("derives the leaf directory name", () => {
    expect(projectName("/Users/dev/myproj")).toBe("myproj");
  });
  it("rolls .claude/worktrees and .worktrees up to the parent project", () => {
    expect(projectName("/Users/dev/myproj/.claude/worktrees/feature-x")).toBe("myproj");
    expect(projectName("/Users/dev/myproj/.worktrees/bar")).toBe("myproj");
  });
  it("strips an encoded worktree suffix", () => {
    expect(projectName("/Users/dev/myproj--claude-worktrees-foo")).toBe("myproj");
    expect(projectName("/Users/dev/myproj--worktrees-bar")).toBe("myproj");
  });
  it("returns 'unknown' for an empty cwd", () => {
    expect(projectName("")).toBe("unknown");
  });
});

describe("modelFamily", () => {
  it("maps Opus / Sonnet / Haiku case-insensitively", () => {
    expect(modelFamily("claude-opus-4-7")).toBe("Opus");
    expect(modelFamily("claude-OPUS-4")).toBe("Opus");
    expect(modelFamily("claude-sonnet-4-6")).toBe("Sonnet");
    expect(modelFamily("anthropic/claude-haiku-4-5")).toBe("Haiku");
  });
  it("passes unknown models through unchanged", () => {
    expect(modelFamily("gpt-4o")).toBe("gpt-4o");
  });
});
