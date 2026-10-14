import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
    viewport: { width: 390, height: 844 },
    timezoneId: "America/Chicago",
  },
  webServer: {
    command: "node scripts/serve-web.cjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
