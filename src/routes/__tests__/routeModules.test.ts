import { describe, expect, it } from "vitest"
import type { RouteConfigEntry } from "@react-router/dev/routes"
import routeConfig from "../../routes"
import { routeModuleFiles, routeModuleForId } from "../routeModules"
import { registerRouteModules } from "../registerRouteModules"

function flatten(entries: RouteConfigEntry[]): RouteConfigEntry[] {
  return entries.flatMap((entry) => [entry, ...flatten(entry.children ?? [])])
}

const entries = flatten(routeConfig)

describe("route modules", () => {
  it("every route has an id that names its own file", () => {
    for (const entry of entries) {
      expect(entry.id, entry.file).toBeDefined()
      expect(`${entry.id!.replace(/~\d+$/, "")}.tsx`).toBe(entry.file)
    }
  })

  it("ids are unique", () => {
    const ids = entries.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every route's module is bundled (routeModuleForId)", () => {
    for (const entry of entries) {
      expect(routeModuleForId(entry.id!), entry.id).toBeDefined()
    }
  })

  it("every bundled module is used by a route", () => {
    const used = new Set(
      entries.map((entry) => `./${entry.file.replace(/^routes\//, "")}`),
    )
    expect(routeModuleFiles.filter((file) => !used.has(file))).toEqual([])
  })

  it("every module renders something", () => {
    for (const entry of entries) {
      expect(typeof routeModuleForId(entry.id!)!.default, entry.id).toBe(
        "function",
      )
    }
  })
})

describe("registerRouteModules", () => {
  it("registers every manifest route except root, keeping what's loaded", () => {
    const root = { default: () => null }
    const loaded: Record<string, unknown> = { root }
    const ids = entries.map((entry) => entry.id!)
    registerRouteModules({
      __reactRouterManifest: {
        routes: Object.fromEntries(["root", ...ids].map((id) => [id, {}])),
      },
      __reactRouterRouteModules: loaded,
    })
    expect(loaded.root).toBe(root)
    for (const id of ids) expect(loaded[id]).toBe(routeModuleForId(id))
  })

  it("throws for a route with no bundled module", () => {
    expect(() =>
      registerRouteModules({
        __reactRouterManifest: {
          routes: { root: {}, "routes/pages/Nope": {} },
        },
        __reactRouterRouteModules: {},
      }),
    ).toThrow(/routes\/pages\/Nope/)
  })

  it("throws when React Router's globals are missing", () => {
    expect(() => registerRouteModules({})).toThrow(/missing/)
  })
})
