// @vitest-environment node
/**
 * Each server render lists the guide bodies IT showed (entry.server.tsx ships
 * them with the page so the browser loads them before hydrating). Prerender
 * renders several pages at once (react-router.config.ts `concurrency`), so
 * the list is collected per render (RenderedContentBodies), never in module
 * state: two pages rendering at the same time must not see each other's.
 */
import { Suspense } from "react"
import { prerender } from "react-dom/static"
import { describe, expect, it, vi } from "vitest"

interface Deferred {
  promise: Promise<{ default: { blocks: [] } }>
  resolve: () => void
}

function deferred(): Deferred {
  let resolve!: () => void
  const promise = new Promise<{ default: { blocks: [] } }>((r) => {
    resolve = () => r({ default: { blocks: [] } })
  })
  return { promise, resolve }
}

// Each body resolves only when the test says so, to interleave the renders.
const loads = vi.hoisted(() => new Map<string, Deferred>())

vi.mock("virtual:help-content", () => ({
  index: { categories: [], guides: [], changelog: [] },
  bodies: new Proxy(
    {},
    {
      get: (_, key) =>
        typeof key === "string" && loads.has(key)
          ? () => loads.get(key)!.promise
          : undefined,
    },
  ),
}))

const { RenderedContentBodies, useSuspenseContentBody } =
  await import("../content")

function Body({ contentKey }: { contentKey: string }) {
  const { body } = useSuspenseContentBody(contentKey)
  return <p data-key={contentKey}>{body ? "loaded" : "missing"}</p>
}

function Page({ keys }: { keys: string[] }) {
  return (
    <main>
      {keys.map((key) => (
        <Suspense key={key} fallback={<p>loading</p>}>
          <Body contentKey={key} />
        </Suspense>
      ))}
    </main>
  )
}

async function renderPage(keys: string[], bodies: Set<string> | null) {
  const { prelude } = await prerender(
    <RenderedContentBodies value={bodies}>
      <Page keys={keys} />
    </RenderedContentBodies>,
    { progressiveChunkSize: Number.POSITIVE_INFINITY },
  )
  return new Response(prelude).text()
}

describe("rendered content bodies", () => {
  it("two pages rendering at the same time each list only their own bodies", async () => {
    for (const key of ["guides/a1", "guides/a2", "guides/b1"]) {
      loads.set(key, deferred())
    }
    const pageA = new Set<string>()
    const pageB = new Set<string>()
    const renderA = renderPage(["guides/a1", "guides/a2"], pageA)
    const renderB = renderPage(["guides/b1"], pageB)

    // Both renders are suspended on their bodies; finish them interleaved.
    await new Promise((r) => setTimeout(r, 0))
    loads.get("guides/a1")!.resolve()
    await new Promise((r) => setTimeout(r, 0))
    loads.get("guides/b1")!.resolve()
    await new Promise((r) => setTimeout(r, 0))
    loads.get("guides/a2")!.resolve()

    const [htmlA, htmlB] = await Promise.all([renderA, renderB])
    expect([...pageA].sort()).toEqual(["guides/a1", "guides/a2"])
    expect([...pageB]).toEqual(["guides/b1"])
    // And each page rendered its whole bodies (not the placeholders).
    expect(htmlA).toContain('data-key="guides/a1"')
    expect(htmlA).toContain('data-key="guides/a2"')
    expect(htmlA).not.toContain("guides/b1")
    expect(htmlB).toContain('data-key="guides/b1"')
    expect(htmlB).not.toContain("guides/a")
  })

  it("a render without a collector (a data pass, the browser) lists nothing anywhere", async () => {
    loads.set("guides/c1", deferred())
    const later = new Set<string>()
    const render = renderPage(["guides/c1"], null)
    loads.get("guides/c1")!.resolve()
    await render
    // A later render with its own collector starts empty.
    loads.set("guides/d1", deferred())
    const next = renderPage(["guides/d1"], later)
    loads.get("guides/d1")!.resolve()
    await next
    expect([...later]).toEqual(["guides/d1"])
  })
})
