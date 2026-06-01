import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    globals: false,
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // These modules can't (or needn't) be exercised under Vitest:
      //  - fonts.ts imports `.ttf` via tsup's binary loader (no Vite equivalent)
      //  - font-manifest.ts / assets / types.ts are plain data / type-only
      //  - cli.ts is the executable entrypoint (cac wiring + process.exit)
      exclude: [
        "src/**/*.d.ts",
        "src/render/fonts.ts",
        "src/render/font-manifest.ts",
        "src/assets/**",
        "src/types.ts",
        "src/cli.ts",
      ],
      reporter: ["text", "html", "lcov"],
    },
  },
});
