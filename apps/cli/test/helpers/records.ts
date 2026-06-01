import type { PriceMap, UsageRecord } from "../../src/types.js";

/** A `UsageRecord` factory: full defaults, overridable per-field. */
export function makeRecord(p: Partial<UsageRecord> = {}): UsageRecord {
  return {
    ts: Date.parse("2026-05-01T12:00:00.000Z"),
    model: "claude-opus-4-7",
    input: 0,
    output: 0,
    cacheCreate: 0,
    cacheCreate5m: 0,
    cacheCreate1h: 0,
    cacheRead: 0,
    cwd: "/Users/dev/atlas-api",
    hour: 12,
    dow: 0,
    day: "2026-05-01",
    ...p,
  };
}

/** A small, deterministic `PriceMap` with distinct per-family rates. */
export function makePricing(): PriceMap {
  return {
    "claude-opus-4-7": {
      input_cost_per_token: 1e-5,
      output_cost_per_token: 5e-5,
      cache_creation_input_token_cost: 1.25e-5,
      cache_read_input_token_cost: 1e-6,
    },
    "claude-sonnet-4-6": {
      input_cost_per_token: 3e-6,
      output_cost_per_token: 1.5e-5,
      cache_creation_input_token_cost: 3.75e-6,
      cache_read_input_token_cost: 3e-7,
    },
    "claude-haiku-4-5": {
      input_cost_per_token: 1e-6,
      output_cost_per_token: 5e-6,
      cache_creation_input_token_cost: 1.25e-6,
      cache_read_input_token_cost: 1e-7,
    },
  };
}
