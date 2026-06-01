import { describe, it, expect } from "vitest";
import { costOf, findRates, loadPricing } from "../../src/data/pricing.js";
import type { PriceMap } from "../../src/types.js";
import fallback from "../../src/assets/pricing-fallback.json";
import { makeRecord } from "../helpers/records.js";

const PM: PriceMap = {
  "claude-opus-4-7": {
    input_cost_per_token: 1e-5,
    output_cost_per_token: 5e-5,
    cache_creation_input_token_cost: 1.25e-5,
    cache_read_input_token_cost: 1e-6,
  },
};

describe("findRates", () => {
  it("returns an exact match", () => {
    expect(findRates("claude-opus-4-7", PM)).toBe(PM["claude-opus-4-7"]);
  });
  it("strips a trailing -YYYYMMDD date stamp", () => {
    expect(findRates("claude-opus-4-7-20260416", PM)).toBe(PM["claude-opus-4-7"]);
  });
  it("strips provider prefixes (anthropic/, us.)", () => {
    expect(findRates("anthropic/claude-opus-4-7", PM)).toBe(PM["claude-opus-4-7"]);
    expect(findRates("us.claude-opus-4-7", PM)).toBe(PM["claude-opus-4-7"]);
  });
  it("handles a combined provider-prefix + date stamp", () => {
    expect(findRates("anthropic/claude-opus-4-7-20260416", PM)).toBe(PM["claude-opus-4-7"]);
  });
  it("returns null on a miss", () => {
    expect(findRates("gpt-4o", PM)).toBeNull();
  });
});

describe("costOf", () => {
  it("is the weighted sum over the rate fields", () => {
    const r = makeRecord({
      model: "claude-opus-4-7",
      input: 1000,
      output: 500,
      cacheCreate: 2000,
      cacheRead: 8000,
    });
    // 1000*1e-5 + 500*5e-5 + 2000*1.25e-5 + 8000*1e-6
    expect(costOf(r, PM)).toBeCloseTo(0.068, 10);
  });
  it("is 0 for an unknown model", () => {
    expect(costOf(makeRecord({ model: "gpt-4o", input: 1000 }), PM)).toBe(0);
  });
});

describe("bundled pricing fallback", () => {
  const map = fallback as unknown as PriceMap;

  it("is a non-empty price map", () => {
    expect(typeof map).toBe("object");
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });

  it("contains a claude entry with real cost fields", () => {
    const claude = Object.entries(map).find(
      ([k, v]) => k.includes("claude") && typeof v.input_cost_per_token === "number",
    );
    expect(claude).toBeDefined();
    expect(claude![1].output_cost_per_token).toBeGreaterThan(0);
  });
});

describe("loadPricing (offline)", () => {
  it("resolves to a usable map without any network call", async () => {
    const map = await loadPricing({ offline: true });
    expect(typeof map).toBe("object");
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });
});
