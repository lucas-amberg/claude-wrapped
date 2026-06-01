# Claude Wrapped

A **Spotify-Wrapped-style** image of your Claude Code usage. Point it at a month and it
generates an aesthetic 1080×1350 card — total tokens, spend, cache hit rate, top projects,
model split, an activity heatmap, and your "coding persona" — then saves it to your Desktop
and opens it.

It's self-contained: it reads your local `~/.claude/projects/**/*.jsonl` logs directly and
computes cost from per-model [LiteLLM](https://github.com/BerriAI/litellm) pricing — the rates
Anthropic actually bills — so spend is computed from real data, not estimated.

<p align="center">
  <img src="docs/sample.png" width="49%" alt="Claude Wrapped sample — light theme" />
  <img src="docs/sample-dark.png" width="49%" alt="Claude Wrapped sample — dark theme" />
</p>
<p align="center"><sub>Sample cards (illustrative data) — default and <code>--dark</code> themes.</sub></p>

> 🌐 **There's a website:** see [the landing page](https://claude-wrapped-zeta.vercel.app)
> for a tour of every panel, the install guide, and the design story. This package lives in the
> [`claude-wrapped` monorepo](https://github.com/lucas-amberg/claude-wrapped) under `apps/cli`.

## Install

```bash
# one-off
npx claude-wrapped

# or global
npm i -g claude-wrapped   # (bun add -g claude-wrapped)
claude-wrapped
```

## Usage

```bash
claude-wrapped                          # current month → ~/Desktop, then opens it
claude-wrapped --month 2026-05          # a specific month
claude-wrapped --month 2026-05 --no-open
claude-wrapped --month 2026-05 --output ~/wrapped.png
claude-wrapped --offline                # skip the pricing fetch (use bundled/cached)
claude-wrapped --dark                   # render the dark theme
claude-wrapped --json                   # also print computed stats to stdout
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--month <YYYY-MM>` | current month | Month to summarize. |
| `--output <path>` | `~/Desktop/claude-wrapped-<month>.png` | Where to save the PNG. |
| `--timezone <iana>` | system local | Timezone for date grouping (hours, days, streaks). |
| `--no-open` | _opens by default_ | Don't open the image after saving. |
| `--offline` | off | Use cached/bundled pricing only — no network. |
| `--scale <n>` | `2` | Render scale; 2× → a crisp 2160×2700 PNG. |
| `--dark` | off | Use the dark theme (warm near-black). |
| `--json` | off | Print the computed stats as JSON to stdout. |

You can also pass the month positionally: `claude-wrapped 2026-05`.

If your Claude config lives somewhere non-standard, set `CLAUDE_CONFIG_DIR`.

## How it works

1. **Load** — streams every `*.jsonl` under `~/.claude/projects` line-by-line (never loads a
   file whole), keeps `assistant` messages in the target month, and **dedups** resumed-session
   copies by `requestId:message.id`.
2. **Price** — fetches the LiteLLM price table (cached 24h under `~/.claude-wrapped/`, with a
   bundled fallback so first run / offline still works) and computes cost per record.
3. **Aggregate** — totals, cache hit rate, top projects (worktrees rolled up to their parent
   repo), per-model split, peak hour / persona / busiest day / longest streak, and a 7×24
   activity heatmap — all in your timezone.
4. **Render** — builds the card with [Satori](https://github.com/vercel/satori) (HTML/flexbox →
   SVG) and rasterizes it to PNG with [resvg](https://github.com/yisibl/resvg-js). Fonts
   (Poppins + Space Mono) are embedded in the binary.

## Development

This package is the `apps/cli` workspace of the [`claude-wrapped`](https://github.com/lucas-amberg/claude-wrapped)
monorepo. Run these from `apps/cli`:

```bash
bun install                   # (from the repo root — installs all workspaces)
bun run build                 # tsup → dist/cli.js

# fast iteration (no build needed — fonts read from disk):
bun dev/stats.ts  2026-05     # dump WrappedStats JSON
bun dev/render.ts             # render mockup/satori.png from /tmp/stats-local.json
bun dev/mockup.ts             # write mockup/index.html (browser preview, fonts inlined)
```

You can also drive everything from the repo root with Turborepo: `bun run build`,
`bun run typecheck`, `bun run dev` (runs the CLI watcher alongside the website).

The card layout lives in `src/render/card-markup.ts` and is shared verbatim between the HTML
mockup and the Satori renderer, so the preview can't drift from the output.

## License

MIT. Claude logo © Anthropic; bundled fonts under the SIL Open Font License.
