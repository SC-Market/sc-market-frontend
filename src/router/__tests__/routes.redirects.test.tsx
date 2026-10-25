/**
 * Redirects, guards, the `/*` splat and nested-route links, rendered through
 * the real app (routes from src/App.tsx + real providers; fake API).
 *
 * Covers the Phase 1 risk areas end to end:
 * - index-route <Navigate to="about"/"listings" replace> under
 *   /org/:contractor_id/manage and /shop/:shopSlug (relative targets),
 * - absolute <Navigate>s (/services, /orders/assigned, ShopRedirect*,
 *   OrgRedirect*, SiteAdminRoute, LoggedInRoute's verify/onboarding gates,
 *   OrgContextFromRoute / ShopContextFromRoute rejections),
 * - unmatched URLs falling through to the `/*` splat (Error404),
 * - the hrefs the real nested org/shop/messages pages render and that
 *   clicking one navigates where it says.
 */
import { act, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { routes } from "../../App"
import {
  APP_TEST_TIMEOUT_MS,
  mountApp,
  renderRoute,
  type RenderOptions,
} from "./regression/harness"
import { FIXTURE } from "./regression/fixtures"

vi.unmock("../../features/profile/api/profileApi")
vi.mock("react-router-dom", async (importOriginal) =>
  (await import("./regression/instrument")).instrumentRouterModule(
    await importOriginal<typeof import("react-router-dom")>(),
  ),
)
vi.mock("socket.io-client", async () =>
  (await import("./regression/instrument")).fakeSocketModule(),
)
vi.mock("@mui/x-charts/LineChart", async () =>
  (await import("./regression/instrument")).fakeChartModule(),
)
vi.mock("@mui/x-charts/BarChart", async () =>
  (await import("./regression/instrument")).fakeChartModule(),
)

const ORG = FIXTURE.orgId
const SHOP = FIXTURE.shopSlug
const withOrg = { current_contractor: ORG }
const withShop = { current_shop_slug: SHOP }

const REDIRECT_CASES: Array<
  [name: string, url: string, options: RenderOptions]
> = [
  // Index routes with RELATIVE <Navigate>
  ["org manage index → about", `/org/${ORG}/manage`, { session: "admin" }],
  ["shop index → listings", `/shop/${SHOP}`, { session: "admin" }],
  [
    "shop index (trailing slash) → listings",
    `/shop/${SHOP}/`,
    { session: "admin" },
  ],
  // Absolute <Navigate>
  ["/services → /market/services", "/services", { session: "anonymous" }],
  ["/orders/assigned → /dashboard", "/orders/assigned", { session: "admin" }],
  ["/help → /guides", "/help", { session: "anonymous" }],
  // ShopRedirect* (cookie-driven)
  [
    "/market/manage with shop cookie",
    "/market/manage",
    { session: "admin", cookies: withShop },
  ],
  [
    "/market/manage without shop cookie",
    "/market/manage",
    { session: "admin" },
  ],
  [
    "/market/create with shop cookie",
    "/market/create",
    { session: "admin", cookies: withShop },
  ],
  [
    "/market/create/:tab with shop cookie",
    "/market/create/unique",
    { session: "admin", cookies: withShop },
  ],
  [
    "/market/manage-stock with shop cookie",
    "/market/manage-stock",
    { session: "admin", cookies: withShop },
  ],
  [
    "/market/stock/:id with shop cookie",
    "/market/stock/listing-1",
    { session: "admin", cookies: withShop },
  ],
  [
    "/order/services with shop cookie",
    "/order/services",
    { session: "admin", cookies: withShop },
  ],
  // OrgRedirect* (current org from cookie)
  [
    "/org/manage with org cookie",
    "/org/manage",
    { session: "admin", cookies: withOrg },
  ],
  [
    "/org/orders with org cookie",
    "/org/orders",
    { session: "admin", cookies: withOrg },
  ],
  [
    "/org/money with org cookie",
    "/org/money",
    { session: "admin", cookies: withOrg },
  ],
  [
    "/org/fleet with org cookie",
    "/org/fleet",
    { session: "admin", cookies: withOrg },
  ],
  [
    "/org/send with org cookie",
    "/org/send",
    { session: "admin", cookies: withOrg },
  ],
  [
    "/org/members with org cookie",
    "/org/members",
    { session: "admin", cookies: withOrg },
  ],
  ["/org/members without org cookie", "/org/members", { session: "admin" }],
  ["/myorg with org cookie", "/myorg", { session: "admin", cookies: withOrg }],
  ["/myorg without org cookie", "/myorg", { session: "admin" }],
  // Guards
  ["SiteAdminRoute as non-admin → /404", "/admin/users", { session: "user" }],
  ["SiteAdminRoute as admin", "/admin/users", { session: "admin" }],
  [
    "LoggedInRoute, RSI not linked → /settings",
    "/dashboard",
    { session: "unverified" },
  ],
  [
    "LoggedInRoute, RSI not linked, /accountlink allowed",
    "/accountlink",
    { session: "unverified" },
  ],
  [
    "LoggedInRoute, not onboarded → /onboarding",
    "/dashboard",
    { session: "not-onboarded" },
  ],
  [
    "OrgContextFromRoute, unknown org → /",
    "/org/OTHERORG/dashboard",
    { session: "admin" },
  ],
  [
    "ShopContextFromRoute, unknown shop → /dashboard/shops",
    "/shop/other-shop/listings",
    { session: "admin" },
  ],
  [
    "OrgAdminRoute /org/:id/orders as owner",
    `/org/${ORG}/orders`,
    { session: "user" },
  ],
  // Splat
  ["splat: unknown top-level", "/does-not-exist", { session: "anonymous" }],
  [
    "splat: unknown deep path",
    "/does/not/exist/at/all",
    { session: "anonymous" },
  ],
  ["splat: unknown org child", `/org/${ORG}/not-a-tab`, { session: "admin" }],
  [
    "splat: unknown shop child",
    `/shop/${SHOP}/not-a-tab`,
    { session: "admin" },
  ],
  [
    "splat: unknown messages grandchild",
    `/messages/${FIXTURE.chatId}/extra`,
    { session: "admin" },
  ],
  ["splat: /404", "/404", { session: "anonymous" }],
]

describe("redirects and guards", () => {
  it.each(REDIRECT_CASES)(
    "%s",
    async (_name, url, options) => {
      const record = await renderRoute(routes, url, options)
      expect(record.lazyPending).toEqual([])
      expect(record.errorElementErrors).toEqual([])
      expect({
        url,
        session: options.session,
        cookies: options.cookies ?? {},
        finalUrl: record.finalUrl,
        historyAction: record.historyAction,
        matches: record.matches,
        title: record.title,
        h1: record.h1,
      }).toMatchSnapshot()
    },
    APP_TEST_TIMEOUT_MS,
  )
})

describe("LoggedInRoute when logged out", () => {
  it(
    "sends the browser to /login with the current path as redirect",
    async () => {
      const before = window.location.href
      const app = mountApp(routes, "/dashboard/shops", { session: "anonymous" })
      await app.settle()
      const href = window.location.href
      const record = app.record()
      app.unmount()
      window.history.replaceState(null, "", before)
      const target = new URL(href)
      expect({
        routerLocation: record.finalUrl,
        windowLocation: target.pathname + target.search,
        matches: record.matches,
      }).toMatchSnapshot()
    },
    APP_TEST_TIMEOUT_MS,
  )
})

const NESTED_PAGES: Array<[url: string, options: RenderOptions]> = [
  [`/org/${ORG}/manage/about`, { session: "admin" }],
  [`/org/${ORG}/manage/roles`, { session: "admin" }],
  [`/org/${ORG}/dashboard`, { session: "admin" }],
  [`/org/${ORG}/listings`, { session: "admin" }],
  [`/shop/${SHOP}/listings`, { session: "admin" }],
  [`/shop/${SHOP}/settings`, { session: "admin" }],
  [`/shop/${SHOP}/dashboard`, { session: "admin" }],
  ["/messages", { session: "admin" }],
  [`/messages/${FIXTURE.chatId}`, { session: "admin" }],
  [`/shops/${SHOP}`, { session: "anonymous" }],
  [`/contractor/${ORG}`, { session: "anonymous" }],
]

describe("links rendered by nested pages", () => {
  it.each(NESTED_PAGES)(
    "%s",
    async (url, options) => {
      const app = mountApp(routes, url, options)
      try {
        await app.settle()
        const record = app.record()
        // Every link in the page, including sidebar/navbar (not just <main>).
        const allLinks = [...document.querySelectorAll("a[href]")]
          .map((a) => a.getAttribute("href") ?? "")
          .filter((href) => href.startsWith("/"))
        expect({
          url,
          finalUrl: record.finalUrl,
          mainLinks: record.mainLinks,
          allLinks: [...new Set(allLinks)].sort(),
        }).toMatchSnapshot()
      } finally {
        app.unmount()
      }
    },
    APP_TEST_TIMEOUT_MS,
  )
})

describe("org manage nav: relative navigate(value) from the pathless OrgManageLayout", () => {
  // OrgManageLayout calls navigate("roles") etc. — a RELATIVE navigate from a
  // pathless layout route under /org/:contractor_id/manage. Click every nav
  // item in order and record where each one lands.
  it(
    "lands on /org/:contractor_id/manage/<tab> for every item",
    async () => {
      const app = mountApp(routes, `/org/${ORG}/manage/about`, {
        session: "admin",
      })
      try {
        await app.settle()
        const items = () => [
          ...document.querySelectorAll("#main-content .MuiListItemButton-root"),
        ]
        const visited: string[] = []
        const count = items().length
        for (let i = 0; i < count; i++) {
          const item = items()[i]
          if (!item) break
          await act(async () => {
            fireEvent.click(item)
          })
          await app.settle()
          const loc = app.router.state.location
          visited.push(
            `${app.router.state.historyAction} ${loc.pathname}${loc.search}`,
          )
        }
        expect(count).toBeGreaterThan(0)
        expect(visited).toMatchSnapshot()
      } finally {
        app.unmount()
      }
    },
    APP_TEST_TIMEOUT_MS,
  )
})
