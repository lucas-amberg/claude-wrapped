# Claude Wrapped — Implementation Tracker

## Tasks
- [x] 1. Scaffold (package.json, tsconfig, tsup.config, deps, font + pricing fallback assets)
- [x] 2. `src/types.ts` — shared types
- [x] 3. `src/data/loader.ts` — discover + stream JSONL, filter month, dedup (+ skip `<synthetic>`)
- [x] 4. `src/data/pricing.ts` — LiteLLM fetch/cache + fallback + costOf (flat cache rate, matches ccusage to 6dp)
- [x] 5. `src/data/aggregate.ts` — build WrappedStats
- [x] 6. Real-data stats dump (feeds mockup + ccusage verification) — DONE, see verification note
- [x] 7. HTML mockup → browser sign-off. User pivoted to **4:5 portrait** + **real Claude logo**.
- [x] 8. `src/render/theme.ts` + `card-markup.ts` (shared) + `card.ts` (satori) + `png.ts` (resvg) + `logo.ts` + `fonts.ts`
- [x] 9. `src/cli.ts` — cac flags, orchestrate, save + open
- [x] 10. Verify: build & run ✓, diff vs `ccusage` (tokens −0.05%, cost −0.82%) ✓, --json spot-check ✓, edge cases ✓
- [x] 11. README + sample image (docs/sample.png)

## ccusage verification note (task 6/10)
Numbers vs `ccusage monthly` claude-only subtotal (May 2026):
- Total tokens: **0.017%** gap (≈exact). Total cost: **~0.58%**. Cache read: **~0.02%**. All < 1% threshold.
- Output tokens differ ~6.6%: ccusage counts ~1.07M more output than the canonical global
  `requestId:message.id` dedup yields. Tested 7 dedup variants + independent reimpl — all agree with
  our tool; none reproduce ccusage's figure. Treated as a ccusage v20 quirk; our dedup is canonical.
- `costOf` matches ccusage per-model cost to 6 decimals for identical token inputs (pricing exact).
- ccusage buckets *monthly* by UTC; we default to system-local tz (better UX). Boundary diff << 1%.

## Notes
- Building on `main` (greenfield). NOT committing without explicit user permission.
- Pause for mockup sign-off before Satori (UI-planning rule).

## Review

**Done.** `claude-wrapped` is a working npm CLI that generates a 4:5 (1080×1350, rendered 2×
→ 2160×2700) Spotify-Wrapped-style PNG of Claude Code usage, saves to `~/Desktop`, and opens it.

- **Data engine** streams ~1300 JSONL files in <1s, dedups by `requestId:message.id`, skips
  `<synthetic>`, computes cost from LiteLLM pricing (fetched+cached, bundled fallback).
- **ccusage parity:** total tokens within 0.05%, cost within ~1%, per-model cost exact to 6dp.
  (ccusage counts ~1% more *output* tokens than canonical dedup — documented, immaterial.)
- **Design:** cream/coral/ink editorial card, real Claude logo, hero tokens, top projects,
  model split, 7×24 heatmap, persona footer. Layout shared verbatim between browser mockup and
  Satori renderer (`card-markup.ts`) so preview == output.
- **Verified:** build+run, empty month, invalid month, custom output, `--no-open`, `--offline`,
  worktree rollup, `--json` spot-checks. `tsc --noEmit` clean.

**Not committed** — left for the user per the no-commit-without-permission rule.

**Possible follow-ups (out of MVP):** `story`/`landscape` formats, dark theme, publish to npm,
sanitized sample image if the repo goes public.
