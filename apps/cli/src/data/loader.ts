import { createReadStream } from "node:fs";
import { readdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import { homedir } from "node:os";
import { join } from "node:path";
import type { UsageRecord } from "../types.js";

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function resolveProjectsDir(): string {
  const base = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
  return join(base, "projects");
}

/** Recursively collect every *.jsonl path under `dir`. */
async function findJsonl(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await findJsonl(full)));
    } else if (e.isFile() && e.name.endsWith(".jsonl")) {
      out.push(full);
    }
  }
  return out;
}

/** Local date/time parts for an epoch in a given IANA timezone. */
function makeLocalParts(timezone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  return (ms: number) => {
    let year = "",
      month = "",
      day = "",
      hour = "",
      weekday = "";
    for (const p of fmt.formatToParts(ms)) {
      switch (p.type) {
        case "year":
          year = p.value;
          break;
        case "month":
          month = p.value;
          break;
        case "day":
          day = p.value;
          break;
        case "hour":
          hour = p.value === "24" ? "00" : p.value;
          break;
        case "weekday":
          weekday = p.value;
          break;
      }
    }
    return {
      ym: `${year}-${month}`,
      day: `${year}-${month}-${day}`,
      hour: parseInt(hour, 10) || 0,
      dow: WEEKDAY_INDEX[weekday] ?? 0,
    };
  };
}

interface RawLine {
  type?: string;
  uuid?: string;
  requestId?: string;
  timestamp?: string;
  cwd?: string;
  gitBranch?: string;
  message?: {
    id?: string;
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
      cache_creation?: {
        ephemeral_5m_input_tokens?: number;
        ephemeral_1h_input_tokens?: number;
      };
    };
  };
}

async function streamFile(
  path: string,
  targetYm: string,
  toLocal: (ms: number) => { ym: string; day: string; hour: number; dow: number },
  seen: Set<string>,
  out: UsageRecord[],
): Promise<void> {
  const rl = createInterface({
    input: createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    // Cheap pre-filter: skip the many large user lines before JSON.parse.
    if (line.length < 2 || line.indexOf('"assistant"') === -1) continue;

    let obj: RawLine;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj.type !== "assistant") continue;
    const usage = obj.message?.usage;
    const model = obj.message?.model;
    if (!usage || !model || !obj.timestamp) continue;
    // Skip Claude Code's synthetic assistant messages (no real model/usage),
    // matching ccusage which excludes them.
    if (model === "<synthetic>") continue;

    const ts = Date.parse(obj.timestamp);
    if (Number.isNaN(ts)) continue;

    const local = toLocal(ts);
    if (local.ym !== targetYm) continue;

    // Dedup like ccusage: requestId:message.id, fall back to uuid.
    const key =
      obj.requestId && obj.message?.id
        ? `${obj.requestId}:${obj.message.id}`
        : obj.uuid;
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }

    const cc = usage.cache_creation;
    out.push({
      ts,
      model,
      input: usage.input_tokens ?? 0,
      output: usage.output_tokens ?? 0,
      cacheCreate: usage.cache_creation_input_tokens ?? 0,
      cacheCreate5m: cc?.ephemeral_5m_input_tokens ?? 0,
      cacheCreate1h: cc?.ephemeral_1h_input_tokens ?? 0,
      cacheRead: usage.cache_read_input_tokens ?? 0,
      cwd: obj.cwd ?? "",
      gitBranch: obj.gitBranch,
      hour: local.hour,
      dow: local.dow,
      day: local.day,
    });
  }
}

/** Simple bounded-concurrency map. */
async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

export interface LoadResult {
  records: UsageRecord[];
  filesScanned: number;
  projectsDir: string;
}

/**
 * Load all assistant usage records for `targetMonth` (YYYY-MM) in `timezone`,
 * streamed from ~/.claude/projects, deduped globally.
 */
export async function loadMonth(
  targetMonth: string,
  timezone: string,
  concurrency = 8,
): Promise<LoadResult> {
  const projectsDir = resolveProjectsDir();
  const files = await findJsonl(projectsDir);
  const toLocal = makeLocalParts(timezone);
  const seen = new Set<string>();
  const records: UsageRecord[] = [];

  await pool(files, concurrency, (f) =>
    streamFile(f, targetMonth, toLocal, seen, records),
  );

  return { records, filesScanned: files.length, projectsDir };
}
