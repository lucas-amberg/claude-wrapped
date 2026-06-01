# Monorepo + Marketing Site — Implementation Tracker

> Prior milestone (the CLI itself) is complete and shipped to npm. This tracker covers the
> monorepo restructure + Next.js marketing/docs site. CLI history archived in git + lessons.md.

## Phase 1 — Monorepo scaffolding (Turborepo + Bun)  ✅ DONE + VERIFIED
- [x] 1.1 `git mv` CLI (29 paths, all renames, history preserved) → apps/cli/
- [x] 1.2 Root `package.json` (private, workspaces, turbo ^2.9.16, pass-through scripts)
- [x] 1.3 `turbo.json` (build/dev/typecheck/lint, outputs dist+.next)
- [x] 1.4 `apps/cli/README.md` (CLI-focused, npm renders this; website-linked)
- [x] 1.5 Update `.gitignore` (.next/ .turbo/ .vercel/ out/ next-env.d.ts)
- [x] 1.6 `bun install` → workspaces resolved, turbo installed, lockfile regenerated
- [x] 1.7 CLI verified: turbo typecheck+build ✓, --json valid, render 2160×2700 identical ✓
        Matched light+dark hero pair rendered (offline, both 2.97B/$2,293) → /tmp/cw-light.png, /tmp/cw-darkpair.png

## Phase 2 — Next.js web app (centerpiece)  ✅ built + streamlined (Impeccable)
- [x] 2.1 Preview → SIGN-OFF: approved w/ "streamline via Impeccable, keep card parity" + Next 16
- [x] 2.2 Scaffolded Next 16 + Tailwind v4 in apps/web (cleaned scaffold noise)
- [x] 2.3 Tokens (globals.css, LIGHT+DARK mirror theme.ts), fonts (Poppins+Space Mono via next/font)
- [x] 2.4 Primitives: CopyCommand (chip+button), Reveal, ThemeToggle, icons
- [x] 2.5 Sections: Nav, Hero, InsideCard, Built, HowItWorks, Install(tabs+options), Personas, Accuracy, Faq, Footer
- [x] 2.6 Assets: sample(+dark).png, claude-logo.svg, grain(inlined); metadata + opengraph-image + icon.svg
- [x] 2.7 typecheck ✓, next build ✓ (all static), browser verify light/dark/mobile + OG ✓
        Streamlined per Impeccable: no gradient text, no icon-square cards, hairline editorial framing.

## Phase 3 — README, CI, Vercel, Dependabot  ✅ DONE
- [x] 3.1 Root README rewritten (website hero + monorepo layout + quick start + deploy note)
- [x] 3.2 ci.yml → `bunx turbo run typecheck build lint`
- [x] 3.3 apps/web/vercel.json + README Deploy note (Root Directory = apps/web)
- [x] 3.4 dependabot.yml → directories: / , /apps/cli , /apps/web
- [x] 3.5 ESLint for web (Next default); CLI lint = no-op (turbo skips)

## Verification (end-to-end)  ✅ ALL PASS
- [x] V1 bun install resolves workspaces; turbo typecheck passes both apps
- [x] V2 turbo build → apps/cli/dist/cli.js AND apps/web/.next (all routes static)
- [x] V3 CLI unchanged: build hash byte-identical (cache hit); --json valid; render correct
        (pixels differ from Phase-1 only because live usage grew 2.97B→3.00B mid-session)
- [x] V4 Web: light/dark toggle flips+persists+no-flash ✓, install tabs ✓, FAQ ✓, copy ✓,
        reveals ✓; desktop/dark/mobile/OG screenshots captured
- [x] V5 turbo lint clean; CI mirrors local commands
- [x] V6 README renders; sample image path valid; links point to repo/npm
- [x] V7 next build succeeds (static); Vercel Root-Directory documented; NOT deployed

## Review
**Done.** `claude-wrapped` is now a Turborepo+Bun monorepo:
- `apps/cli` — the published CLI, moved unchanged (git renames; byte-identical build).
- `apps/web` — NEW Next.js 16 + Tailwind v4 static marketing/docs site. Warm "data-magazine"
  design mirroring the card's tokens (theme.ts), with a live light↔dark toggle, copyable install
  commands, tabbed terminal, options table, personas, accuracy, FAQ accordion, OG image + favicon.
  First prototype was streamlined with the **Impeccable** skill per user feedback (killed
  gradient text, icon-square cards, decorative noise → hairline editorial framing; kept Poppins +
  Space Mono for card parity).
- Root: package.json (workspaces+turbo), turbo.json; CI/dependabot/README updated for the monorepo.

**Not committed** — left for the user per the no-commit-without-permission rule.
**Deploy:** ready for Vercel (Root Directory = apps/web); user ships the deploy + updates the
placeholder site URL.

## Constraints
- NO commits without explicit user instruction.
- Static SSG site, deploy-ready (user ships deploy).
- Web palette MIRRORS apps/cli/src/render/theme.ts (cross-ref comment, not shared pkg).
- CLI internals byte-for-byte unchanged.

## Review
(to fill in at the end)
