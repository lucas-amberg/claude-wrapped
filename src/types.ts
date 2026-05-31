/** A single normalized assistant usage record (post-dedup, in target month). */
export interface UsageRecord {
  ts: number; // epoch ms
  model: string; // raw message.model, e.g. "claude-opus-4-7"
  input: number;
  output: number;
  cacheCreate: number; // total cache_creation_input_tokens
  cacheCreate5m: number;
  cacheCreate1h: number;
  cacheRead: number;
  cwd: string;
  gitBranch?: string;
  // local-time parts (in the target timezone), filled by the loader
  hour: number; // 0-23
  dow: number; // 0=Mon .. 6=Sun
  day: string; // local YYYY-MM-DD
}

export interface ModelStat {
  model: string; // family label: Opus / Sonnet / Haiku (or raw)
  tokens: number;
  cost: number;
  share: number; // 0-1 share of total cost
}

export interface ProjectStat {
  name: string;
  tokens: number;
  cost: number;
  messages: number;
}

export interface WrappedStats {
  month: string; // "2026-05"
  monthLabel: string; // "MAY 2026"
  timezone: string;
  generatedAt: string; // ISO

  totals: {
    input: number;
    output: number;
    cacheCreate: number;
    cacheRead: number;
    tokens: number;
    cost: number;
    messages: number;
    cacheHitRate: number; // cacheRead / (cacheRead + cacheCreate + input)
  };

  models: ModelStat[]; // by family, desc by cost
  projects: ProjectStat[]; // top N, desc by cost

  time: {
    peakHour: number; // 0-23 local
    peakHourCount: number;
    persona: string; // "Night Owl" etc.
    personaEmoji: string;
    busiestDay: string; // local YYYY-MM-DD
    busiestDayTokens: number;
    longestStreakDays: number;
    activeDays: number;
    daysInMonth: number;
  };

  heatmap: number[][]; // [7][24] normalized 0-1 by max cell
  heatmapCounts: number[][]; // [7][24] raw message counts
  heatmapMax: number;

  cache5m: number;
  cache1h: number;
}

/** LiteLLM-style per-model pricing entry (only the fields we use). */
export interface PriceEntry {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  cache_creation_input_token_cost?: number;
  cache_creation_input_token_cost_above_1hr?: number;
  cache_read_input_token_cost?: number;
}

export type PriceMap = Record<string, PriceEntry>;
