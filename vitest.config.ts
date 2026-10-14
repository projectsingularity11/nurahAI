import { defineConfig } from "vitest/config";
process.env.TZ = "America/Chicago";
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], testTimeout: 20000 },
});
