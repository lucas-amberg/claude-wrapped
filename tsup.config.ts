import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  platform: "node",
  clean: true,
  // Fonts + pricing fallback are read at runtime relative to dist/, so copy them in.
  // (resvg-js ships a native .node binary; keep it external so it resolves from node_modules.)
  external: ["@resvg/resvg-js"],
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Embed fonts directly into the bundle as Uint8Array so they resolve
  // regardless of cwd / how the bin is invoked.
  loader: {
    ".ttf": "binary",
    ".otf": "binary",
  },
});
