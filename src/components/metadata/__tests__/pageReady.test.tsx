import React, { Suspense, useState } from "react"
import { act, render, screen } from "@testing-library/react"
import { MemoryRouter, useNavigate } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { isPrimaryLoading, PageReadyStore } from "../pageReadyStore"
import {
  PageReadyProvider,
  usePageReady,
  usePageReadyAttributes,
} from "../PageReady"

/** A store whose batches run only when the test calls flush(). */
function manualStore() {
  const pending: Array<() => void> = []
  const store = new PageReadyStore((fn) => pending.push(fn))
  const flush = () => {
    while (pending.length) pending.shift()!()
  }
  return { store, flush }
}

describe("PageReadyStore", () => {
  it("is busy until a location key is known and a source settled", () => {
    const { store, flush } = manualStore()
    const id = store.register(false)
    flush()
    expect(store.isReady()).toBe(false)
    store.setLocationKey("a")
    flush()
    expect(store.isReady()).toBe(true)
    store.unregister(id)
    flush()
    // Latched for this navigation.
    expect(store.isReady()).toBe(true)
  })

  it("is busy with no source mounted", () => {
    const { store, flush } = manualStore()
    store.setLocationKey("a")
    flush()
    expect(store.isReady()).toBe(false)
  })

  it("waits for every source", () => {
    const { store, flush } = manualStore()
    store.setLocationKey("a")
    const shell = store.register(false)
    const grid = store.register(true)
    flush()
    expect(store.isReady()).toBe(false)
    store.update(grid, false)
    flush()
    expect(store.isReady()).toBe(true)
    expect(shell).not.toBe(grid)
  })

  it("never flips back to busy within one navigation", () => {
    const { store, flush } = manualStore()
    store.setLocationKey("a")
    const id = store.register(true)
    flush()
    store.update(id, false)
    flush()
    expect(store.isReady()).toBe(true)
    // A late source or a reported reload after ready does not unset it.
    store.update(id, true)
    store.register(true)
    flush()
    expect(store.isReady()).toBe(true)
  })

  it("resets on navigation until the new page settles", () => {
    const { store, flush } = manualStore()
    store.setLocationKey("a")
    const id = store.register(false)
    flush()
    expect(store.isReady()).toBe(true)
    store.update(id, true)
    store.setLocationKey("b")
    flush()
    expect(store.isReady()).toBe(false)
    store.update(id, false)
    flush()
    expect(store.isReady()).toBe(true)
  })

  it("evaluates a batch as a whole (fallback swapped for content)", () => {
    const { store, flush } = manualStore()
    store.setLocationKey("a")
    store.register(false) // page shell
    const fallback = store.register(true) // Suspense fallback skeleton
    flush()
    expect(store.isReady()).toBe(false)
    // Same commit: the fallback unmounts, the lazy content mounts loading.
    store.unregister(fallback)
    store.register(true)
    flush()
    expect(store.isReady()).toBe(false)
  })

  it("defaults to a microtask batch, invoked unbound", async () => {
    const original = globalThis.queueMicrotask
    // Browsers throw "Illegal invocation" when queueMicrotask is called with
    // a `this` other than the global object; reproduce that here.
    globalThis.queueMicrotask = function (this: unknown, cb: () => void) {
      if (this !== undefined && this !== globalThis)
        throw new TypeError("Illegal invocation")
      original(cb)
    }
    try {
      const store = new PageReadyStore()
      store.setLocationKey("a")
      store.register(false)
      expect(store.isReady()).toBe(false)
      await Promise.resolve()
      expect(store.isReady()).toBe(true)
    } finally {
      globalThis.queueMicrotask = original
    }
  })

  it("notifies only on changes", () => {
    const { store, flush } = manualStore()
    let calls = 0
    store.subscribe(() => calls++)
    store.setLocationKey("a")
    const id = store.register(false)
    flush()
    store.update(id, true)
    store.update(id, false)
    flush()
    expect(calls).toBe(1)
  })
})

describe("isPrimaryLoading", () => {
  it("is loading on the first load", () => {
    expect(isPrimaryLoading({ isLoading: true, isFetching: true })).toBe(true)
  })
  it("is loading while fetching new arguments with no data for them", () => {
    expect(
      isPrimaryLoading({
        isLoading: false,
        isFetching: true,
        currentData: undefined,
      }),
    ).toBe(true)
  })
  it("is not loading on a background refetch of shown data", () => {
    expect(
      isPrimaryLoading({ isLoading: false, isFetching: true, currentData: [] }),
    ).toBe(false)
  })
  it("is not loading when settled or skipped", () => {
    expect(isPrimaryLoading({ isLoading: false, isFetching: false })).toBe(
      false,
    )
  })
})

// ── React bindings ─────────────────────────────────────────────────────────

function Main(props: { children: React.ReactNode }) {
  const attrs = usePageReadyAttributes()
  return (
    <main data-testid="main" {...attrs}>
      {props.children}
    </main>
  )
}

function Source(props: { loading: boolean }) {
  usePageReady(props.loading)
  return null
}

function renderInApp(ui: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={["/a"]}>
      <PageReadyProvider>
        <Main>{ui}</Main>
      </PageReadyProvider>
    </MemoryRouter>,
  )
}

const main = () => screen.getByTestId("main")

describe("page-ready React bindings", () => {
  it("sets aria-busy/data-ready from the page's loading state", async () => {
    let setLoading: (v: boolean) => void = () => {}
    function Page() {
      const [loading, set] = useState(true)
      setLoading = set
      return <Source loading={loading} />
    }
    renderInApp(<Page />)
    await act(async () => {})
    expect(main()).toHaveAttribute("aria-busy", "true")
    expect(main()).toHaveAttribute("data-ready", "false")
    await act(async () => setLoading(false))
    expect(main()).toHaveAttribute("aria-busy", "false")
    expect(main()).toHaveAttribute("data-ready", "true")
    // Background refetch reported as loading again: stays ready.
    await act(async () => setLoading(true))
    expect(main()).toHaveAttribute("data-ready", "true")
  })

  it("stays busy while a Suspense fallback skeleton shows", async () => {
    let resolve: () => void = () => {}
    const promise = new Promise<void>((r) => (resolve = r))
    let done = false
    void promise.then(() => (done = true))
    function Lazy() {
      if (!done) throw promise
      return <Source loading={false} />
    }
    function Fallback() {
      usePageReady(true)
      return <p>skeleton</p>
    }
    renderInApp(
      <>
        <Source loading={false} />
        <Suspense fallback={<Fallback />}>
          <Lazy />
        </Suspense>
      </>,
    )
    await act(async () => {})
    expect(screen.getByText("skeleton")).toBeInTheDocument()
    expect(main()).toHaveAttribute("data-ready", "false")
    await act(async () => {
      resolve()
      await promise
    })
    expect(screen.queryByText("skeleton")).not.toBeInTheDocument()
    expect(main()).toHaveAttribute("data-ready", "true")
  })

  it("goes busy on navigation until the new page settles", async () => {
    let go: (to: string) => void = () => {}
    let setLoading: (v: boolean) => void = () => {}
    function Page() {
      const navigate = useNavigate()
      go = navigate
      const [loading, set] = useState(false)
      setLoading = set
      return <Source loading={loading} />
    }
    renderInApp(<Page />)
    await act(async () => {})
    expect(main()).toHaveAttribute("data-ready", "true")
    await act(async () => {
      setLoading(true)
      go("/b")
    })
    expect(main()).toHaveAttribute("data-ready", "false")
    await act(async () => setLoading(false))
    expect(main()).toHaveAttribute("data-ready", "true")
  })

  it("is a no-op outside the provider", () => {
    render(<Source loading={true} />)
  })
})
