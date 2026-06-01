import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    globals: false,
    coverage: {
      provider: "v8",
      include: ["lib/**"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
