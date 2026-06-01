import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { PriceEntry, PriceMap, UsageRecord } from "../types.js";
import fallback from "../assets/pricing-fallback.json";

const LITELLM_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const CACHE_DIR = join(homedir(), ".claude-wrapped");
const CACHE_FILE = join(CACHE_DIR, "pricing.json");
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

const FALLBACK = fallback as unknown as PriceMap;

interface CacheShape {
  fetchedAt: number;
  data: PriceMap;
}

async function readCache(): Promise<CacheShape | null> {
  try {
    const raw = await readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as CacheShape;
    if (parsed && typeof parsed.fetchedAt === "number" && parsed.data) return parsed;
  } catch {
    /* no cache */
  }
  return null;
}

async function writeCache(data: PriceMap): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify({ fetchedAt: Date.now(), data }));
  } catch {
    /* cache write is best-effort */
  }
}

async function fetchFresh(timeoutMs = 8000): Promise<PriceMap | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(LITELLM_URL, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const json = (await res.json()) as PriceMap;
    if (json && typeof json === "object") return json;
  } catch {
    /* network/offline */
  }
  return null;
}

/**
 * Resolve the pricing map. Order of preference:
 *   offline: fresh cache (any age) -> bundled fallback
 *   online:  fresh fetch -> fresh-enough cache -> stale cache -> bundled fallback
 * Always returns a usable map (bundled fallback as last resort).
 */
export async function loadPricing(opts: { offline?: boolean } = {}): Promise<PriceMap> {
  const cache = await readCache();

  if (opts.offline) {
    return cache?.data ?? FALLBACK;
  }

  if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
    return cache.data;
  }

  const fresh = await fetchFresh();
  if (fresh) {
    await writeCache(fresh);
    return fresh;
  }

  return cache?.data ?? FALLBACK;
}

/** Match a raw model name against the pricing map, with sensible fallbacks. */
export function findRates(model: string, pricing: PriceMap): PriceEntry | null {
  if (pricing[model]) return pricing[model];

  // Strip a trailing -YYYYMMDD date stamp (claude-haiku-4-5-20251001 -> claude-haiku-4-5)
  const noDate = model.replace(/-\d{8}$/, "");
  if (noDate !== model && pricing[noDate]) return pricing[noDate];

  // Strip common provider prefixes (anthropic/, anthropic., us./eu./apac. etc.)
  const stripped = model.replace(/^([a-z]+[./])+/i, "");
  if (stripped !== model && pricing[stripped]) return pricing[stripped];

  const strippedNoDate = stripped.replace(/-\d{8}$/, "");
  if (pricing[strippedNoDate]) return pricing[strippedNoDate];

  return null;
}

/**
 * Cost of one record. Matches ccusage exactly: a single flat
 * `cache_creation_input_token_cost` is applied to ALL cache-creation tokens
 * (the 1h `_above_1hr` tier is intentionally not used, to stay consistent with
 * the numbers users see from ccusage).
 */
export function costOf(r: UsageRecord, pricing: PriceMap): number {
  const p = findRates(r.model, pricing);
  if (!p) return 0;
  const ic = p.input_cost_per_token ?? 0;
  const oc = p.output_cost_per_token ?? 0;
  const ccc = p.cache_creation_input_token_cost ?? 0;
  const crc = p.cache_read_input_token_cost ?? 0;
  return r.input * ic + r.output * oc + r.cacheCreate * ccc + r.cacheRead * crc;
}
