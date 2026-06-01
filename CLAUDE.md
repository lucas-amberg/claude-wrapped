# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Turborepo + Bun monorepo** for *Claude Wrapped* — a Spotify-Wrapped-style PNG of your Claude Code usage, rendered entirely from local logs (nothing uploaded). Two apps:

- `apps/cli` — the published `claude-wrapped-cli` npm package. Reads `~/.claude/projects/**/*.jsonl`, aggregates usage, and renders a PNG card. Stack: Bun · tsup · Satori → resvg-js.
- `apps/web` — a static Next.js 16 marketing/docs site that shows the CLI off. Stack: Next 16 (App Router) · React 19 · Tailwind v4.

Use **Bun**, not npm (`packageManager: bun@1.2.19`).

## Commands

Run from the repo root (turbo fans out to both apps):

```bash
bun install         # install all workspaces
bun run dev         # CLI watcher (tsup --watch) + site (localhost:3000)
bun run build       # apps/cli/dist + apps/web/.next
bun run typecheck   # tsc --noEmit in both apps
bun run lint        # eslint (web only)
bun run test        # vitest in both apps
```

Target one app with `--filter` (package names: `claude-wrapped-cli`, `web`):

```bash
bun --filter claude-wrapped-cli dev      # CLI only (tsup --watch)
bun --filter web dev                     # site only (next dev)
bun --filter claude-wrapped-cli test     # CLI test suite only
```

**Running a single test** (Vitest). From inside the app dir, `bunx vitest`:

```bash
cd apps/cli && bunx vitest run test/unit/loader.test.ts   # one file
cd apps/cli && bunx vitest run -t "dedup"                 # tests matching a name
cd apps/cli && bunx vitest                                # watch mode
```

> Gotcha: `bun test` invokes **Bun's native runner**, not these suites. Always use `bun run test` / `bunx vitest` — the project runs on Vitest.

Run the built CLI locally: `node apps/cli/dist/cli.js --help` (after a build). Useful flags: `--month YYYY-MM`, `--output <path>`, `--timezone <IANA>`, `--no-open`, `--offline`, `--scale 1|2`, `--dark`, `--json`.

## CLI architecture (`apps/cli`)

A single linear pipeline, orchestrated in `src/cli.ts` (parsed with `cac`):

```
load JSONL ──▶ load pricing ──▶ aggregate ──▶ build HTML ──▶ Satori SVG ──▶ resvg PNG ──▶ ~/Desktop
 data/loader   data/pricing    data/aggregate  render/        render/card    render/png
```

- **`src/data/loader.ts`** — recursively streams `~/.claude/projects/**/*.jsonl` (override with `$CLAUDE_CONFIG_DIR`), line-by-line, keeps `type === "assistant"` records, **dedupes by `requestId:message.id` (fallback `uuid`)** to handle resumed sessions, and buckets timestamps in the target timezone (not UTC) — affects the heatmap, streaks, and month filtering.
- **`src/data/pricing.ts`** — fetches the LiteLLM price table, caches it at `~/.claude-wrapped/pricing.json` (24h TTL), and falls back to bundled `src/assets/pricing-fallback.json` when offline/`--offline`. Always returns a usable map.
- **`src/data/aggregate.ts`** — single pass over records → `WrappedStats`: totals, cache-hit rate, top-N projects, model-family split (Opus/Sonnet/Haiku), persona/peak-hour/streaks, and a normalized 7×24 activity heatmap.
- **`src/render/`** — `card-markup.ts` builds the card as an **inline-styled HTML string** (no CSS classes); `card.ts` turns it into a PNG-ready SVG via Satori; `png.ts` rasterizes SVG → PNG with `@resvg/resvg-js`. `theme.ts` holds the `LIGHT`/`DARK` design tokens and all number/date formatters. `fonts.ts` exposes the bundled Poppins + Space Mono faces to Satori.

### CLI gotchas — read before touching rendering

- **`satori-html` is broken — do not reintroduce it.** `card.ts` instead parses the markup with `ultrahtml.parse()` and runs a custom HTML→Satori-vnode converter. That converter also expands CSS shorthands Satori rejects (e.g. `border`) and decodes HTML entities (`ultrahtml` leaves them encoded). Keep new card markup expressible by this converter.
- **Fonts are embedded at build time.** `tsup.config.ts` uses `loader: { ".ttf": "binary" }`, so `import font from "*.ttf"` yields bytes only in the built `dist/`. From `src` (Vitest/Bun) the same import returns a path string — which is why the CLI **cannot be run from source** and the e2e suite spawns the built binary instead.
- **`@resvg/resvg-js` is `external`** in tsup (native `.node` binary) — it resolves from `node_modules`, not the bundle.

### CLI tests (`apps/cli/test`)

- `unit/` — loader, pricing, aggregate, theme, logo, card (HTML→vnode).
- `integration/` — full pipeline + render, in-process.
- `e2e/cli.test.ts` — black-box: `beforeAll` runs `bun run build`, then spawns `node dist/cli.js` against `test/fixtures/` with hermetic flags (`--offline --no-open --timezone UTC` + `CLAUDE_CONFIG_DIR` pointed at fixtures). Self-contained but slower (it builds first). Helpers live in `test/helpers/`.
- Coverage intentionally excludes `cli.ts`, `fonts.ts`, `font-manifest.ts`, `assets/`, `types.ts` (see `vitest.config.ts` for why).

> **When adding a feature, add an e2e test for it.** New flags, output behaviors, or pipeline changes belong in `e2e/cli.test.ts`, driven through the built binary as above — it's the only layer that proves the shipped `dist/cli.js` works end-to-end, and the only coverage for the pieces excluded above (`cli.ts`, `fonts.ts`, build wiring).

## Web app (`apps/web`)

Next.js 16 **App Router**, a single static route (`/`) composed of section components in `components/`, prerendered at build. No CMS/MDX — **all copy and sample data live in `lib/content.ts`** (read it first). `app/opengraph-image.tsx` generates the OG image via `next/og`. Tests (`test/content.test.ts`) validate content invariants only (shapes, the 168-cell heatmap, HTTPS URLs), not component rendering.

## The cross-app design contract

The CLI is the source of truth for the design. `apps/web/app/globals.css` **mirrors** the `LIGHT`/`DARK` token sets in `apps/cli/src/render/theme.ts` so the site re-themes light↔dark exactly like the rendered card. **When you change palette/fonts in `theme.ts`, update `globals.css` to match** (and vice-versa). Both apps use Poppins (display) + Space Mono (mono).

## CI

`.github/workflows/ci.yml` runs `bunx turbo run typecheck build lint test` on every PR and push to `main`. Match it locally with `bun run typecheck && bun run build && bun run lint && bun run test` before pushing.
