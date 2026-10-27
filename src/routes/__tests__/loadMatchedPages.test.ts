import { afterEach, describe, expect, it, vi } from "vitest"
import { createPageRoute } from "../definePage"
import { loadMatchedPages } from "../registerRouteModules"

vi.mock("../../util/assetReloadGuard", () => ({
  tryEmergencyReload: vi.fn(() => false),
}))

afterEach(() => vi.useRealTimers())

function page(name: string) {
  const importPage = vi.fn(async () => ({ Page: () => null }))
  const route = createPageRoute(importPage, (m) => m.Page, {}, name)
  return {
    importPage,
    module: { default: route.Component, clientLoader: route.clientLoader },
  }
}

describe("loadMatchedPages", () => {
  it("loads the page chunks of the routes matching the URL, and no others", async () => {
    const guide = page("GuidePage")
    const hub = page("GuidesHub")
    const globals = {
      __reactRouterManifest: {
        routes: {
          root: { id: "root", path: "" },
          layout: { id: "layout", parentId: "root" },
          hub: { id: "hub", parentId: "layout", path: "/guides" },
          guide: {
            id: "guide",
            parentId: "layout",
            path: "/guides/:category/:slug",
          },
        },
      },
      __reactRouterRouteModules: {
        root: { default: () => null },
        layout: { default: () => null },
        hub: hub.module,
        guide: guide.module,
      },
    }
    await loadMatchedPages("/guides/buying/buy-an-item", globals)
    expect(guide.importPage).toHaveBeenCalledTimes(1)
    expect(hub.importPage).not.toHaveBeenCalled()
  })

  it("settles when a chunk fails (the page shows the error once it renders)", async () => {
    const importPage = vi.fn(async () => {
      throw new TypeError("Failed to fetch dynamically imported module")
    })
    const route = createPageRoute(
      importPage,
      (m: { Page: () => null }) => m.Page,
    )
    const globals = {
      __reactRouterManifest: {
        routes: {
          root: { id: "root", path: "" },
          p: { id: "p", parentId: "root", path: "/x" },
        },
      },
      __reactRouterRouteModules: {
        root: {},
        p: { clientLoader: route.clientLoader },
      },
    }
    vi.useFakeTimers()
    const done = loadMatchedPages("/x", globals)
    await vi.runAllTimersAsync()
    await expect(done).resolves.toBeUndefined()
    expect(importPage.mock.calls.length).toBeGreaterThan(1)
  })
})
