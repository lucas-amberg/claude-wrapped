import type {
  ModelStat,
  PriceMap,
  ProjectStat,
  UsageRecord,
  WrappedStats,
} from "../types.js";
import { costOf } from "./pricing.js";

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

/** Derive a human project name from a cwd, rolling worktrees up to the parent. */
export function projectName(cwd: string): string {
  if (!cwd) return "unknown";
  // Strip a worktree segment that lives inside the project (".../.claude/worktrees/<slug>").
  let p = cwd.split(/\/\.claude\/worktrees\//)[0];
  p = p.split(/\/\.worktrees\//)[0];
  let base = p.split("/").filter(Boolean).pop() || p;
  // Strip an encoded worktree suffix ("project--claude-worktrees-foo" / "project--worktrees-foo").
  base = base.replace(/--claude-worktrees-.*$/, "").replace(/--worktrees-.*$/, "");
  return base || "unknown";
}

export function modelFamily(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("opus")) return "Opus";
  if (m.includes("sonnet")) return "Sonnet";
  if (m.includes("haiku")) return "Haiku";
  return model;
}

function persona(peakHour: number): { persona: string; personaEmoji: string } {
  if (peakHour >= 22 || peakHour <= 4) return { persona: "Night Owl", personaEmoji: "🦉" };
  if (peakHour >= 5 && peakHour <= 8) return { persona: "Early Bird", personaEmoji: "🐤" };
  if (peakHour >= 9 && peakHour <= 16) return { persona: "Daylight Coder", personaEmoji: "☀️" };
  return { persona: "Evening Hacker", personaEmoji: "🌙" };
}

/** Longest run of consecutive calendar days among a set of YYYY-MM-DD strings. */
function longestStreak(days: Set<string>): number {
  if (days.size === 0) return 0;
  const sorted = [...days].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = Date.parse(sorted[i - 1] + "T00:00:00Z");
    const cur = Date.parse(sorted[i] + "T00:00:00Z");
    const diffDays = Math.round((cur - prev) / 86_400_000);
    if (diffDays === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function aggregate(
  records: UsageRecord[],
  pricing: PriceMap,
  opts: { month: string; timezone: string; topProjects?: number },
): WrappedStats {
  const topN = opts.topProjects ?? 5;
  const [yearStr, monthStr] = opts.month.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const totals = {
    input: 0,
    output: 0,
    cacheCreate: 0,
    cacheRead: 0,
    tokens: 0,
    cost: 0,
    messages: 0,
    cacheHitRate: 0,
  };
  let cache5m = 0;
  let cache1h = 0;

  const familyAgg = new Map<string, { tokens: number; cost: number }>();
  const projectAgg = new Map<string, { tokens: number; cost: number; messages: number }>();
  const dayTokens = new Map<string, number>();
  const hourCount = new Array<number>(24).fill(0);
  const heatmapCounts: number[][] = Array.from({ length: 7 }, () =>
    new Array<number>(24).fill(0),
  );
  const activeDays = new Set<string>();

  for (const r of records) {
    const tokens = r.input + r.output + r.cacheCreate + r.cacheRead;
    const cost = costOf(r, pricing);

    totals.input += r.input;
    totals.output += r.output;
    totals.cacheCreate += r.cacheCreate;
    totals.cacheRead += r.cacheRead;
    totals.tokens += tokens;
    totals.cost += cost;
    totals.messages += 1;
    cache5m += r.cacheCreate5m;
    cache1h += r.cacheCreate1h;

    const fam = modelFamily(r.model);
    const f = familyAgg.get(fam) ?? { tokens: 0, cost: 0 };
    f.tokens += tokens;
    f.cost += cost;
    familyAgg.set(fam, f);

    const pname = projectName(r.cwd);
    const p = projectAgg.get(pname) ?? { tokens: 0, cost: 0, messages: 0 };
    p.tokens += tokens;
    p.cost += cost;
    p.messages += 1;
    projectAgg.set(pname, p);

    dayTokens.set(r.day, (dayTokens.get(r.day) ?? 0) + tokens);
    activeDays.add(r.day);
    hourCount[r.hour] += 1;
    heatmapCounts[r.dow][r.hour] += 1;
  }

  totals.cacheHitRate =
    totals.cacheRead + totals.cacheCreate + totals.input > 0
      ? totals.cacheRead / (totals.cacheRead + totals.cacheCreate + totals.input)
      : 0;

  const models: ModelStat[] = [...familyAgg.entries()]
    .map(([model, v]) => ({ model, tokens: v.tokens, cost: v.cost, share: 0 }))
    .sort((a, b) => b.cost - a.cost);
  for (const m of models) m.share = totals.cost > 0 ? m.cost / totals.cost : 0;

  const projects: ProjectStat[] = [...projectAgg.entries()]
    .map(([name, v]) => ({ name, tokens: v.tokens, cost: v.cost, messages: v.messages }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, topN);

  // Peak hour by message count.
  let peakHour = 0;
  let peakHourCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCount[h] > peakHourCount) {
      peakHourCount = hourCount[h];
      peakHour = h;
    }
  }

  // Busiest day by tokens.
  let busiestDay = "";
  let busiestDayTokens = 0;
  for (const [d, t] of dayTokens) {
    if (t > busiestDayTokens) {
      busiestDayTokens = t;
      busiestDay = d;
    }
  }

  // Normalize heatmap by max cell.
  let heatmapMax = 0;
  for (const row of heatmapCounts) for (const c of row) if (c > heatmapMax) heatmapMax = c;
  const heatmap = heatmapCounts.map((row) =>
    row.map((c) => (heatmapMax > 0 ? c / heatmapMax : 0)),
  );

  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();
  const { persona: personaLabel, personaEmoji } = persona(peakHour);

  return {
    month: opts.month,
    monthLabel: `${MONTH_NAMES[monthIdx] ?? ""} ${year}`,
    timezone: opts.timezone,
    generatedAt: new Date().toISOString(),
    totals,
    models,
    projects,
    time: {
      peakHour,
      peakHourCount,
      persona: personaLabel,
      personaEmoji,
      busiestDay,
      busiestDayTokens,
      longestStreakDays: longestStreak(activeDays),
      activeDays: activeDays.size,
      daysInMonth,
    },
    heatmap,
    heatmapCounts,
    heatmapMax,
    cache5m,
    cache1h,
  };
}
