/**
 * The e2e test API: Playwright's `test` with the fake backend installed.
 *
 *   test.use({ session: "user" })        // logged in (default: anonymous)
 *   test("…", async ({ page, api }) => {
 *     await page.goto("/market")
 *     await waitForReady(page)
 *   })
 *
 * Waits go through waitForReady (the page-ready signal on <main>), never
 * fixed sleeps. See docs/testing-with-mcp.md.
 */
import { expect, test as base, type Page } from "@playwright/test"
import type { SessionKind } from "../../src/router/__tests__/regression/fixtures"
import { installFakeApi, type FakeApi } from "./fakeApi"

export const test = base.extend<{ session: SessionKind; api: FakeApi }>({
  session: ["anonymous", { option: true }],
  api: [
    async ({ context, session }, use) => {
      await use(await installFakeApi(context, session))
    },
    { auto: true },
  ],
})

export { expect }

/** The main content area that carries the page-ready signal. */
export const main = (page: Page) => page.locator("main#main-content")

/**
 * Wait until the current page's primary data has loaded:
 * `main[data-ready="true"]` (and `aria-busy="false"`).
 */
export async function waitForReady(page: Page, timeout = 15_000) {
  await expect(main(page)).toHaveAttribute("data-ready", "true", { timeout })
  await expect(main(page)).toHaveAttribute("aria-busy", "false")
}
