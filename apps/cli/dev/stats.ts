// Dev-only: dump WrappedStats as JSON for verification + mockup. Run with bun.
//   bun dev/stats.ts 2026-05 [IANA-tz]
import { loadMonth } from "../src/data/loader.js";
import { loadPricing } from "../src/data/pricing.js";
import { aggregate } from "../src/data/aggregate.js";

const month = process.argv[2] || "2026-05";
const tz = process.argv[3] || Intl.DateTimeFormat().resolvedOptions().timeZone;

const t0 = Date.now();
const { records, filesScanned } = await loadMonth(month, tz);
const pricing = await loadPricing({ offline: true });
const stats = aggregate(records, pricing, { month, timezone: tz });

console.error(
  `[stats] tz=${tz} files=${filesScanned} records=${records.length} ms=${Date.now() - t0}`,
);
console.log(JSON.stringify(stats, null, 2));
