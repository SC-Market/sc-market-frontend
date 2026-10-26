/**
 * Moved Help & Guides URLs in the SPA (src/features/help/domain/redirects):
 * rendered through the real app, each old URL replaces itself with the new
 * one and the new page renders. Full page loads
 * get a 301 at the edge first (src/bridge/__tests__/guideRedirects.test.ts).
 */
import { describe, expect, it, vi } from "vitest"
import { routes } from "../../App"
import { APP_TEST_TIMEOUT_MS, renderRoute } from "./regression/harness"
import { GUIDE_REDIRECTS } from "../../features/help/domain/redirects"

vi.unmock("../../features/profile/api/profileApi")
vi.mock("react-router-dom", async (importOriginal) =>
  (await import("./regression/instrument")).instrumentRouterModule(
    await importOriginal<typeof import("react-router-dom")>(),
  ),
)
vi.mock("socket.io-client", async () =>
  (await import("./regression/instrument")).fakeSocketModule(),
)

describe("moved guide URLs", () => {
  it.each(Object.entries(GUIDE_REDIRECTS))(
    "%s → %s",
    async (from, to) => {
      const record = await renderRoute(routes, from, { session: "anonymous" })
      expect(record.lazyPending).toEqual([])
      expect(record.errorElementErrors).toEqual([])
      expect(record.finalUrl).toBe(to)
      expect(record.historyAction).toBe("REPLACE")
      expect(record.h1.length).toBeGreaterThan(0)
      expect(record.title).not.toMatch(/not found/i)
    },
    APP_TEST_TIMEOUT_MS,
  )
})
