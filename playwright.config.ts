import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright-Konfiguration für den FCB-Website Smoke-Test.
 * Startet den Next.js-Dev-Server automatisch (oder nutzt einen laufenden).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Dev-Server starten falls keiner läuft – reuseExistingServer verhindert Doppelstart
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
