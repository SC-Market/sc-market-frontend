/**
 * Playwright: read-only smoke flows and the accessible-name audit, run against
 * a local production build with the API faked at the network layer
 * (e2e/support/fakeApi.ts). See docs/testing-with-mcp.md.
 *
 *   npm run e2e:build        # vite build → dist-e2e/, API = the app origin
 *   npm run e2e              # both projects (starts vite preview itself)
 *   npm run e2e -- --project=smoke
 *
 * The preview server listens on 127.0.0.1 only. The browser opens it as
 * http://localhost:4173 (resolved to 127.0.0.1): the app treats "localhost"
 * as the main site, while any other hostname (127.0.0.1 included) is a
 * white-label custom domain.
 */
import { defineConfig, devices } from "@playwright/test"

const CI = !!process.env.CI

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  timeout: 30_000,
  reporter: CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    // Requests from a service worker bypass request interception.
    serviceWorkers: "block",
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
    trace: "retain-on-failure",
    launchOptions: {
      args: ["--host-resolver-rules=MAP localhost 127.0.0.1"],
    },
  },
  projects: [
    {
      name: "smoke",
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "a11y",
      testMatch: /a11y\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command:
      "npx vite preview --outDir dist-e2e --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
})
