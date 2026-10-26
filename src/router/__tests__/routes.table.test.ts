/**
 * Route table and route matching snapshots (no rendering).
 *
 * - The flattened route table from src/App.tsx: every leaf pattern with its
 *   chain, guards, lazy flag and nearest errorElement. Adding/removing a
 *   route, or moving it under a different guard, shows up as a diff.
 * - matchRoutes() ranking for URLs where static, dynamic and splat routes
 *   compete (e.g. /market/create vs /market/:id, the `/*` splat, trailing
 *   slashes, unknown nested children). React Router 7 must match the same.
 */
import { describe, expect, it } from "vitest"
import { matchRoutes } from "react-router-dom"
import { routes } from "../../router/routeObjects"
import { enumerateRoutes, fillPattern, routeLabel } from "./regression/harness"
import { FIXTURE } from "./regression/fixtures"

const leaves = enumerateRoutes(routes)

describe("route table", () => {
  it("has a fixture URL for every leaf pattern", () => {
    for (const leaf of leaves) {
      expect(() => fillPattern(leaf.pattern)).not.toThrow()
    }
  })

  it("lists every leaf route", () => {
    expect(leaves.length).toMatchInlineSnapshot(`167`)
    expect(
      leaves.map((leaf) => ({
        pattern: leaf.pattern,
        chain: leaf.chain.join(" > "),
        guards: leaf.guards,
        lazy: leaf.lazy,
        errorBoundaryAt: leaf.errorBoundaryAt,
      })),
    ).toMatchSnapshot()
  })

  it("reports duplicate patterns (the later one is unreachable)", () => {
    const counts = new Map<string, number>()
    for (const leaf of leaves)
      counts.set(leaf.pattern, (counts.get(leaf.pattern) ?? 0) + 1)
    expect([...counts].filter(([, n]) => n > 1)).toMatchInlineSnapshot(`
      [
        [
          "/send",
          2,
        ],
      ]
    `)
  })
})

const MATCH_CASES = [
  "/",
  "/market",
  "/market/",
  "/market/create",
  "/market/create/unique",
  "/market/me",
  "/market/cart",
  "/market/services",
  "/market/manage",
  "/market/manage-stock",
  "/market/stock/listing-1",
  "/market/aggregate/item-1",
  "/market/multiple/m-1",
  "/market/multiple/m-1/edit",
  "/market/category/weapons",
  "/market/some-listing--abc123",
  "/Market",
  "/buyorder/create",
  "/buyorder/b-1",
  "/order/service/create",
  "/order/service/s-1",
  "/order/service/s-1/edit",
  "/order/services",
  "/order/o-1",
  "/order/o-1/chat",
  "/recruiting/post/create",
  "/recruiting/post/p-1",
  "/recruiting/post/p-1/update",
  "/shops/create",
  "/shops/test-shop",
  "/shops/test-shop/about",
  "/shops/test-shop/about/extra",
  "/messages",
  "/messages/",
  "/messages/chat-1",
  "/messages/chat-1/extra",
  `/org/${FIXTURE.orgId}`,
  `/org/${FIXTURE.orgId}/`,
  `/org/${FIXTURE.orgId}/manage`,
  `/org/${FIXTURE.orgId}/manage/about`,
  `/org/${FIXTURE.orgId}/manage/unknown`,
  `/org/${FIXTURE.orgId}/orders`,
  `/org/${FIXTURE.orgId}/money`,
  `/org/${FIXTURE.orgId}/unknown`,
  "/org/members",
  "/org/fleet",
  "/org/manage",
  "/org/register",
  `/shop/${FIXTURE.shopSlug}`,
  `/shop/${FIXTURE.shopSlug}/listings`,
  `/shop/${FIXTURE.shopSlug}/listings/create`,
  `/shop/${FIXTURE.shopSlug}/unknown`,
  "/admin/feature-flags",
  "/admin/feature-flags/some_flag",
  "/user/someone",
  "/user/someone/store",
  "/user/someone/store/extra",
  "/wiki/items",
  "/wiki/items/i-1",
  "/mining/locations",
  "/mining/locations/hurston",
  "/mining/ores/quantanium",
  "/send",
  "/widget/orders",
  "/does-not-exist",
  "/deeply/nested/unknown/path",
  "/market/a/b/c",
  "/404",
]

describe("route matching", () => {
  it.each(MATCH_CASES)("%s", (url) => {
    const matches = matchRoutes(routes, url) ?? []
    expect({
      chain: matches.map((m) => routeLabel(m.route)),
      params: matches.at(-1)?.params ?? null,
      pathnameBase: matches.at(-1)?.pathnameBase ?? null,
    }).toMatchSnapshot()
  })
})
