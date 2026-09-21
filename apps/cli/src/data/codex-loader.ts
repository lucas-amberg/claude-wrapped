import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { homedir } from "node:os";
import { join } from "node:path";
import type { UsageRecord } from "../types.js";
import { findJsonl, makeLocalParts, pool, type LocalParts } from "./loader.js";

/**
 * Codex CLI writes one JSONL "rollout" file per session under
 * ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl (override with $CODEX_HOME).
 */
export function resolveCodexSessionsDir(): string {
  const base = process.env.CODEX_HOME || join(homedir(), ".codex");
  return join(base, "sessions");
}

/** Codex/OpenAI token usage block (per response). `input_tokens` INCLUDES cached. */
interface CodexUsage {
  input_tokens?: number;
  cached_input_tokens?: number;
  cache_write_input_tokens?: number;
  output_tokens?: number; // includes reasoning
  reasoning_output_tokens?: number;
  total_tokens?: number;
}

interface CodexLine {
  timestamp?: string;
  type?: string; // "session_meta" | "turn_context" | "token_usage_record" | "event_msg" | ...
  payload?: {
    type?: string; // for event_msg, e.g. "token_count"
    cwd?: string; // session_meta / turn_context
    model?: string; // turn_context
    usage?: CodexUsage; // token_usage_record (newer CLI)
    response_id?: string; // token_usage_record dedup key
    info?: {
      // event_msg -> token_count (older CLI)
      last_token_usage?: CodexUsage; // per-response delta
      total_token_usage?: CodexUsage; // cumulative
    };
  };
}

/**
 * Split Codex usage into our Claude-shaped UsageRecord. Codex reports the FULL
 * prompt size in `input_tokens` with the cached slice broken out in
 * `cached_input_tokens`, so we subtract to get the non-cached input billed at
 * the full rate — then `costOf` and the token/cache-hit math work unchanged.
 * Returns null for a zero-usage event (nothing to count).
 */
function toRecord(
  u: CodexUsage,
  model: string,
  cwd: string,
  ts: number,
  local: LocalParts,
): UsageRecord | null {
  const inputTotal = u.input_tokens ?? 0;
  const cached = u.cached_input_tokens ?? 0;
  const cacheWrite = u.cache_write_input_tokens ?? 0;
  const output = u.output_tokens ?? 0;
  const reasoning = u.reasoning_output_tokens ?? 0;
  if (inputTotal === 0 && output === 0 && cacheWrite === 0) return null;
  return {
    ts,
    provider: "codex",
    model,
    input: Math.max(0, inputTotal - cached),
    output,
    reasoning,
    cacheCreate: cacheWrite,
    cacheCreate5m: 0,
    cacheCreate1h: 0,
    cacheRead: cached,
    cwd,
    hour: local.hour,
    dow: local.dow,
    day: local.day,
  };
}

async function streamCodexFile(
  path: string,
  targetYm: string,
  toLocal: (ms: number) => LocalParts,
  seen: Set<string>,
  out: UsageRecord[],
): Promise<void> {
  const rl = createInterface({
    input: createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let cwd = "";
  let model = "unknown";
  // A single session mixes the two token schemas (newer CLIs emit BOTH a
  // token_usage_record and an equivalent event_msg/token_count per response).
  // Buffer each separately and keep only token_usage_record when present, else
  // fall back to token_count — never both, or usage doubles.
  const fromRecord: UsageRecord[] = [];
  const fromCount: UsageRecord[] = [];

  for await (const line of rl) {
    // Cheap pre-filter: skip response/message lines before JSON.parse.
    if (
      line.indexOf("token_") === -1 &&
      line.indexOf("turn_context") === -1 &&
      line.indexOf("session_meta") === -1
    )
      continue;

    let obj: CodexLine;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    const p = obj.payload;
    if (!p) continue;

    if (obj.type === "session_meta") {
      if (p.cwd) cwd = p.cwd;
      continue;
    }
    if (obj.type === "turn_context") {
      if (p.cwd) cwd = p.cwd;
      if (p.model) model = p.model;
      continue;
    }

    let usage: CodexUsage | undefined;
    let buf: UsageRecord[] | undefined;
    let dedupKey: string | undefined;
    if (obj.type === "token_usage_record") {
      usage = p.usage;
      buf = fromRecord;
      dedupKey = p.response_id;
    } else if (obj.type === "event_msg" && p.type === "token_count") {
      usage = p.info?.last_token_usage;
      buf = fromCount;
    } else {
      continue;
    }
    if (!usage || !obj.timestamp || !buf) continue;

    const ts = Date.parse(obj.timestamp);
    if (Number.isNaN(ts)) continue;
    const local = toLocal(ts);
    if (local.ym !== targetYm) continue;

    // Dedup resumed/forked sessions that replay the same response.
    if (dedupKey) {
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);
    }

    const rec = toRecord(usage, model, cwd, ts, local);
    if (rec) buf.push(rec);
  }

  out.push(...(fromRecord.length ? fromRecord : fromCount));
}

export interface CodexLoadResult {
  records: UsageRecord[];
  filesScanned: number;
  sessionsDir: string;
}

/**
 * Load all Codex usage records for `targetMonth` (YYYY-MM) in `timezone`,
 * streamed from ~/.codex/sessions, deduped by response id.
 */
export async function loadCodexMonth(
  targetMonth: string,
  timezone: string,
  concurrency = 8,
): Promise<CodexLoadResult> {
  const sessionsDir = resolveCodexSessionsDir();
  const files = await findJsonl(sessionsDir);
  const toLocal = makeLocalParts(timezone);
  const seen = new Set<string>();
  const records: UsageRecord[] = [];

  await pool(files, concurrency, (f) =>
    streamCodexFile(f, targetMonth, toLocal, seen, records),
  );

  return { records, filesScanned: files.length, sessionsDir };
}
