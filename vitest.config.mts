import { defineConfig } from "vitest/config";

/*
 * Unit tests cover the domain module only: pure functions with no React or
 * browser APIs, so the node environment is enough.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
