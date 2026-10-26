import { describe, expect, it } from "vitest"
import documentTemplate from "../document.html?raw"
import { APP_MARKER, HEAD_MARKER, renderDocument } from "../renderDocument"
import { removeBridgeSummary } from "../bridgeSummary"
import { shellProblems } from "../../../scripts/build/checkShell"
import {
  checkServiceWorker,
  serviceWorkerViolations,
} from "../../../scripts/build/checkServiceWorker"
import swSource from "../../sw.ts?raw"

describe("document.html", () => {
  it("has both markers and a data-cfasync on every script", () => {
    expect(documentTemplate).toContain(HEAD_MARKER)
    expect(documentTemplate).toContain(`<div id="root">${APP_MARKER}</div>`)
    for (const tag of documentTemplate.match(/<script\b[^>]*>/gi) ?? []) {
      expect(tag).toContain('data-cfasync="false"')
    }
  })

  it("keeps the asset-reload guard in sync with assetReloadGuard.ts", () => {
    expect(documentTemplate).toContain('"scmarket_asset_reload_attempts"')
    expect(documentTemplate).toContain('"scmarket_asset_reload_window_start"')
    expect(documentTemplate).toContain("MAX_ATTEMPTS = 2")
    expect(documentTemplate).toContain("WINDOW_MS = 120000")
    // Never vite:preloadError: that would preempt retryDynamicImport.
    expect(documentTemplate).not.toMatch(
      /addEventListener\(\s*["']vite:preloadError/,
    )
  })
})

describe("renderDocument", () => {
  const app =
    '<script>window.__reactRouterContext = {}</script><script type="module">import("/assets/entry.client-x.js")</script>'

  it("fills the app and the stylesheets, and marks every script", () => {
    const html = renderDocument(documentTemplate, {
      appHtml: app,
      stylesheets: ["/assets/root-a.css", "/assets/root-a.css"],
    })
    expect(html).toContain(
      '<div id="root"><script data-cfasync="false">window.__reactRouterContext',
    )
    expect(html.match(/root-a\.css/g)).toHaveLength(1)
    expect(html).not.toContain(HEAD_MARKER)
    expect(shellProblems(html)).toEqual([])
  })

  it("does not treat $ in the app HTML as a replacement pattern", () => {
    const html = renderDocument(documentTemplate, {
      appHtml: "<p>$& $1 $$</p>",
      stylesheets: [],
    })
    expect(html).toContain("<p>$& $1 $$</p>")
  })

  it("refuses a template without markers", () => {
    expect(() =>
      renderDocument("<html></html>", { appHtml: "", stylesheets: [] }),
    ).toThrow(/marker/)
  })
})

describe("shell checks", () => {
  it("flags a script without data-cfasync and a missing #root", () => {
    expect(shellProblems("<html><script src=/x.js></script></html>")).toEqual(
      expect.arrayContaining([
        expect.stringContaining("data-cfasync"),
        'no <div id="root">',
      ]),
    )
  })
})

describe("service worker stays push-only", () => {
  it("src/sw.ts has no precache, routing or fetch handler", () => {
    expect(serviceWorkerViolations(swSource)).toEqual([])
    expect(() => checkServiceWorker(swSource)).not.toThrow()
  })

  it.each([
    "precacheAndRoute(self.__WB_MANIFEST)",
    "registerRoute(/x/, h)",
    'self.addEventListener("fetch", e => e.respondWith(caches.match(e.request)))',
    "self.onfetch = () => {}",
  ])("rejects %s", (code) => {
    expect(() => checkServiceWorker(code)).toThrow(/must not precache/)
  })
})

describe("removeBridgeSummary", () => {
  it("removes only the bridge's summary from #root", () => {
    const root = document.createElement("div")
    root.innerHTML =
      '<link rel="modulepreload" href="/a.js"><script>1</script><main data-bridge-summary><h1>Ship</h1></main>'
    removeBridgeSummary(root)
    expect(root.innerHTML).toBe(
      '<link rel="modulepreload" href="/a.js"><script>1</script>',
    )
  })
})
