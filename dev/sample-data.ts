// Dev-only: a fully fictional `WrappedStats` fixture used to render the README
// sample cards. Everything here is made up — fake project names, round-ish
// numbers — so the committed samples never leak real usage. It is fully
// deterministic (no `Math.random`, no `Date`) so re-rendering is byte-stable.
import type { WrappedStats } from "../src/types.js";

// --- deterministic night-owl, weekday-heavy heatmap -------------------------
// Hour intensity peaks at 22h (10 PM) with a tail past midnight and a pre-dawn
// trough. Index = hour 0..23.
const HOUR_CURVE = [
  22, 12, 5, 2, 1, 1, 3, 8, //          00–07  late-night tail → pre-dawn trough
  16, 28, 36, 42, 39, 31, 37, 46, //    08–15  morning ramp, lunch dip, afternoon
  54, 60, 57, 64, 80, 95, 100, 68, //   16–23  evening surge, peak at 22
];
// Day-of-week weighting, 0=Mon … 6=Sun — weekdays heavy, weekends light.
const DOW_WEIGHT = [1.0, 1.08, 1.12, 1.05, 0.95, 0.5, 0.44];

function buildHeatmap() {
  const counts: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const rowVals: number[] = [];
    for (let h = 0; h < 24; h++) {
      const base = HOUR_CURVE[h] * DOW_WEIGHT[d];
      // small deterministic jitter (±~15%) so the grid looks organic, not striped
      const jitter = (((d * 31 + h * 17) % 13) - 6) / 40;
      rowVals.push(Math.max(0, Math.round(base * (1 + jitter))));
    }
    counts.push(rowVals);
  }
  const max = Math.max(...counts.flat());
  const normalized = counts.map((r) => r.map((c) => c / max));
  const peakHourCount = counts.reduce((sum, r) => sum + r[22], 0);
  return { counts, max, normalized, peakHourCount };
}

const HEAT = buildHeatmap();

// --- token split: sums to 1.94B, cache-hit rate ≈ 0.94 ----------------------
const TOK = {
  input: 18_000_000,
  output: 67_000_000,
  cacheCreate: 95_000_000,
  cacheRead: 1_760_000_000,
};
const TOTAL_TOKENS = TOK.input + TOK.output + TOK.cacheCreate + TOK.cacheRead; // 1.94B
const CACHE_HIT_RATE =
  TOK.cacheRead / (TOK.cacheRead + TOK.cacheCreate + TOK.input); // ≈ 0.9397

// --- model split: costs sum to $1,480; shares derived so they sum to 1 ------
const MODEL_COSTS = { Opus: 1036, Sonnet: 400, Haiku: 44 };
const TOTAL_COST = MODEL_COSTS.Opus + MODEL_COSTS.Sonnet + MODEL_COSTS.Haiku; // 1480

export const SAMPLE_STATS: WrappedStats = {
  month: "2026-05",
  monthLabel: "MAY 2026",
  timezone: "America/New_York",
  generatedAt: "2026-05-31T22:00:00-04:00",

  totals: {
    input: TOK.input,
    output: TOK.output,
    cacheCreate: TOK.cacheCreate,
    cacheRead: TOK.cacheRead,
    tokens: TOTAL_TOKENS,
    cost: TOTAL_COST,
    messages: 18_240,
    cacheHitRate: CACHE_HIT_RATE,
  },

  // cost desc; shares derived from cost so they sum to exactly 1
  models: [
    {
      model: "Opus",
      tokens: 1_500_000_000,
      cost: MODEL_COSTS.Opus,
      share: MODEL_COSTS.Opus / TOTAL_COST,
    },
    {
      model: "Sonnet",
      tokens: 390_000_000,
      cost: MODEL_COSTS.Sonnet,
      share: MODEL_COSTS.Sonnet / TOTAL_COST,
    },
    {
      model: "Haiku",
      tokens: 50_000_000,
      cost: MODEL_COSTS.Haiku,
      share: MODEL_COSTS.Haiku / TOTAL_COST,
    },
  ],

  // cost desc; tokens + messages sum to the totals above for self-consistency
  projects: [
    { name: "atlas-api", tokens: 810_000_000, cost: 612, messages: 7200 },
    { name: "northstar-web", tokens: 510_000_000, cost: 388, messages: 4800 },
    { name: "pixel-pipeline", tokens: 318_000_000, cost: 241, messages: 2900 },
    { name: "ledger-sync", tokens: 208_000_000, cost: 158, messages: 2100 },
    { name: "scratch", tokens: 94_000_000, cost: 81, messages: 1240 },
  ],

  time: {
    peakHour: 22,
    peakHourCount: HEAT.peakHourCount,
    persona: "Night Owl",
    personaEmoji: "🦉",
    busiestDay: "2026-05-14",
    busiestDayTokens: 128_000_000,
    longestStreakDays: 12,
    activeDays: 27,
    daysInMonth: 31,
  },

  heatmap: HEAT.normalized,
  heatmapCounts: HEAT.counts,
  heatmapMax: HEAT.max,

  cache5m: 86_000_000,
  cache1h: 9_000_000,
};
