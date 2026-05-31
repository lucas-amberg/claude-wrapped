# Lessons

## `satori-html` is broken — parse with `ultrahtml` directly instead
`html()` from `satori-html@0.3.2` throws `undefined is not an object (evaluating 't.type')`
for **every** input (even `<div>hi</div>`) — its ultrahtml inline-transformer is broken in this
runtime. Fix: use ultrahtml's raw `parse()` and write a small HTML→Satori-vnode converter.
Gotchas the converter must handle:
- **Decode entities** (`&lt;`/`&gt;`/`&amp;`) in text nodes — ultrahtml's `parse` does NOT decode
  them the way the browser DOM does, so escaped text leaks through literally.
- **Expand `border`/`border-top` shorthands** to longhands (`borderWidth/Style/Color`) — older
  Satori lacks shorthand.
- **Unitless numbers → numbers** (flex, line-height, opacity).
- **Style must be an object**, camelCased — not a CSS string.
- Give every node (incl. text leaves) an explicit `display:flex`.
- **No emoji** without a font/grapheme provider — use drawn shapes (divs/border-radius) instead.
- `<img>` with a **base64 SVG data-URI** renders fine in both the browser and Satori (used for
  the Claude logo) — better than inline `<svg>` for cross-renderer reliability.

## Match `ccusage`, then verify against ground truth before trusting either
ccusage `monthly --json` aggregates **all agents** (Claude + Codex `gpt-*`); compare against the
*Claude-only* subtotal (sum the `claude*` `modelBreakdowns`). It buckets monthly totals by **UTC**
regardless of `-z`. Cost uses the **flat** `cache_creation_input_token_cost` for all cache-creation
tokens (not the 1h `_above_1hr` tier) — confirmed by reproducing per-model cost to 6 decimals.
When a metric diverged (output tokens ~1% high in ccusage), I reverse-engineered it by testing 7
dedup variants + an independent reimplementation rather than guessing — concluded it's a ccusage
quirk and our canonical `requestId:message.id` dedup is correct.

## Font sourcing for Satori
Many Google Fonts are now variable-only (finicky in Satori). Static TTFs that still exist in
`github.com/google/fonts`: **Poppins** (ofl/poppins, Regular→Black) and **Space Mono**
(ofl/spacemono). Bundle them via tsup's `binary` loader (→ `Uint8Array`), wrap in `Buffer.from`.
For bun dev scripts, read fonts from disk instead (bun doesn't honor the esbuild binary loader),
so make the renderer accept fonts as a parameter.
