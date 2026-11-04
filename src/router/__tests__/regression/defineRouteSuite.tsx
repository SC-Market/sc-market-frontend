/**
 * Shared body of the per-route regression suites (routes.regression.*.test.tsx).
 * Each suite file takes one shard of the route table so vitest runs them in
 * parallel; together they cover every leaf route in src/App.tsx.
 */
import { describe, expect, it } from "vitest"
import { routes } from "../../../router/routeObjects"
import {
  APP_TEST_TIMEOUT_MS,
  defaultSessionFor,
  enumerateRoutes,
  fillPattern,
  renderRoute,
} from "./harness"
import { EXPECTED_ROUTE_ERRORS } from "./expectations"

export const ROUTE_SHARDS = 4

/** Unique leaf patterns, in route-table order (duplicates like /send dropped). */
export function uniqueLeaves() {
  const seen = new Set<string>()
  return enumerateRoutes(routes).filter((leaf) => {
    if (seen.has(leaf.pattern)) return false
    seen.add(leaf.pattern)
    return true
  })
}

/**
 * Which shard a route belongs to: a hash of its pattern (FNV-1a), not its
 * position in the route table. Adding, removing or moving a route only
 * touches that route's snapshot instead of re-filing every later route
 * into a different shard's .snap file.
 */
export function shardOf(pattern: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < pattern.length; i++) {
    hash ^= pattern.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash % ROUTE_SHARDS
}

export function defineRouteSuite(shard: number) {
  const leaves = uniqueLeaves().filter(
    (leaf) => shardOf(leaf.pattern) === shard,
  )

  describe(`routes (shard ${shard + 1}/${ROUTE_SHARDS})`, () => {
    it.each(leaves.map((leaf) => [leaf.pattern, leaf] as const))(
      "%s",
      async (_pattern, leaf) => {
        const url = fillPattern(leaf.pattern)
        const session = defaultSessionFor(leaf)
        const record = await renderRoute(routes, url, { session })

        // The lazy route (and every lazy parent) resolved.
        expect(record.lazyPending).toEqual([])
        // No errorElement rendered unless this route is known to error.
        const expected = EXPECTED_ROUTE_ERRORS[leaf.pattern]
        if (expected) {
          expect(record.errorElementErrors).toEqual(expected)
        } else {
          expect(record.routeErrors).toBeNull()
          expect(record.errorElementErrors).toEqual([])
        }
        // Fully loaded (renderRoute's settle already waits for this and
        // throws otherwise): never snapshot a half-rendered page.
        expect(record.pageReady).toBe("true")
        // A stable identity marker: final location, matched route chain,
        // title and headings.
        expect(record).toMatchSnapshot()
      },
      APP_TEST_TIMEOUT_MS,
    )
  })
}
