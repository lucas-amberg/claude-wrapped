<div align="center">

# Claude Wrapped

A **Spotify-Wrapped-style** image of your Claude Code usage — total tokens, spend, cache hit
rate, top projects, model split, an activity heatmap, and your "coding persona" — rendered from
your local logs, nothing uploaded.

<!-- status: live npm + repo/social -->
[![npm version](https://img.shields.io/npm/v/claude-wrapped-cli?style=for-the-badge&logo=npm&logoColor=white&label=npm&color=CB3837)](https://www.npmjs.com/package/claude-wrapped-cli)
[![npm downloads](https://img.shields.io/npm/dm/claude-wrapped-cli?style=for-the-badge&logo=npm&logoColor=white&label=downloads&color=CB3837)](https://www.npmjs.com/package/claude-wrapped-cli)
[![GitHub stars](https://img.shields.io/github/stars/lucas-amberg/claude-wrapped?style=for-the-badge&logo=github&logoColor=white&color=2B3137)](https://github.com/lucas-amberg/claude-wrapped/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639?style=for-the-badge)](apps/cli/README.md#license)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-6F42C1?style=for-the-badge)](https://github.com/lucas-amberg/claude-wrapped/pulls)

<!-- tech stack -->
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-FBF0DF?style=for-the-badge&logo=bun&logoColor=000000)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind v4](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Satori](https://img.shields.io/badge/Satori-0B0B0F?style=for-the-badge&logo=vercel&logoColor=white)

<a href="https://claude-wrapped.vercel.app"><b>🌐 View the site →</b></a>

<p align="center">
  <a href="https://claude-wrapped-zeta.vercel.app"><b>🌐 View the site →</b></a>
</p>
 
<img src="apps/cli/docs/sample.png" width="49%" alt="Claude Wrapped sample — light theme" />
<img src="apps/cli/docs/sample-dark.png" width="49%" alt="Claude Wrapped sample — dark theme" />

<sub>Sample cards (illustrative data) — default and <code>--dark</code> themes.</sub>

</div>

This repository is a **Turborepo + Bun monorepo** with two apps: the published CLI and a
marketing/documentation website that shows it off.

## Try the CLI

```bash
npx claude-wrapped-cli            # current month → ~/Desktop, then opens it
npx claude-wrapped-cli --dark     # warm near-black dark theme
```

Full CLI documentation — every flag and how it works — lives in
**[`apps/cli/README.md`](apps/cli/README.md)** (this is what npm renders).

## Monorepo layout

```
claude-wrapped/
├── apps/
│   ├── cli/      # the published `claude-wrapped-cli` npm CLI (Bun · tsup · Satori → resvg)
│   └── web/      # the marketing/docs site (Next.js 16 · Tailwind v4 · static)
├── turbo.json    # build / dev / typecheck / lint pipeline
└── package.json  # workspaces + turbo pass-through scripts
```

The CLI is the source of truth for the design: the website's palette and fonts **mirror**
[`apps/cli/src/render/theme.ts`](apps/cli/src/render/theme.ts) (its `LIGHT`/`DARK` token sets),
so the page re-themes light↔dark exactly like the rendered card.

## Quick start

```bash
bun install        # installs every workspace from the repo root
bun run dev        # turbo: runs the CLI watcher + the website (localhost:3000)
bun run build      # turbo: builds apps/cli/dist + apps/web/.next
bun run typecheck  # turbo: typechecks both apps
bun run lint       # turbo: lints the web app
```

Work on one app at a time:

```bash
bun --filter claude-wrapped-cli dev   # CLI only (tsup --watch)
bun --filter web dev              # website only (next dev)
```

## Deploying the site

The site is a static Next.js app, ready for [Vercel](https://vercel.com):

1. Import the repo into Vercel.
2. Set **Root Directory** to `apps/web` (Vercel auto-detects Next.js + Bun from there).
3. Deploy. No environment variables are required — the site is fully static.

The live deployment is **<https://claude-wrapped-zeta.vercel.app>**. To self-host under a
different URL, set `NEXT_PUBLIC_SITE_URL` (it feeds the metadata/OG defaults in
[`apps/web/app/layout.tsx`](apps/web/app/layout.tsx)).

## Acknowledgements

Inspired by [`ccusage`](https://github.com/ryoppippi/ccusage) — the project that got me poking
at Claude Code usage in the first place. Both read the same LiteLLM pricing source.

## License

MIT. Claude logo © Anthropic; bundled fonts under the SIL Open Font License.
