# apps/web — Claude Wrapped website

The marketing/documentation site for [Claude Wrapped](../../README.md). Next.js 16 (App
Router) + Tailwind v4, statically prerendered. Its palette and fonts mirror the CLI's design
tokens in [`apps/cli/src/render/theme.ts`](../cli/src/render/theme.ts), so the page re-themes
light↔dark exactly like the rendered card.

```bash
# from the repo root
bun install
bun --filter web dev      # → http://localhost:3000
bun --filter web build    # static production build
```

**Deploy (Vercel):** import the repo, set **Root Directory = `apps/web`**, deploy. No env vars
required. Live at <https://claude-wrapped-zeta.vercel.app>; to self-host elsewhere, set
`NEXT_PUBLIC_SITE_URL` (see `app/layout.tsx`).

## Layout

- `app/` — `layout.tsx` (fonts + metadata + no-flash theme), `page.tsx`, `globals.css`
  (design tokens + component styles), `opengraph-image.tsx`, `icon.svg`.
- `components/` — section components (`Nav`, `Hero`, `InsideCard`, `Built`, `HowItWorks`,
  `Install`, `Personas`, `Accuracy`, `Faq`, `Footer`) + primitives (`ThemeToggle`,
  `CopyCommand`, `Reveal`, `icons`).
- `lib/content.ts` — all page copy + the deterministic heatmap.
