import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { Suspense } from "react"
import {
  createPageRoute as definePage,
  markRouterReady,
  resetRouterReadyForTests,
} from "../definePage"

vi.mock("../../util/assetReloadGuard", () => ({
  tryEmergencyReload: vi.fn(() => false),
}))
import { tryEmergencyReload } from "../../util/assetReloadGuard"

function Hello(props: { who?: string }) {
  return <p>hello {props.who ?? "page"}</p>
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  resetRouterReadyForTests()
  vi.mocked(tryEmergencyReload).mockClear()
})
afterEach(() => vi.useRealTimers())

describe("definePage", () => {
  it("first page load: the loader doesn't wait, the page suspends until its chunk loads", async () => {
    const chunk = deferred<{ Hello: typeof Hello }>()
    const page = definePage(
      () => chunk.promise,
      (m) => m.Hello,
    )
    await expect(page.clientLoader()).resolves.toBeNull() // returns before the chunk
    render(
      <Suspense fallback={<p>skeleton</p>}>
        <page.Component />
      </Suspense>,
    )
    expect(screen.getByText("skeleton")).toBeTruthy()
    await act(async () => chunk.resolve({ Hello }))
    expect(screen.getByText("hello page")).toBeTruthy()
  })

  it("navigation: the loader waits for the chunk, then the page renders without suspending", async () => {
    markRouterReady()
    const chunk = deferred<{ Hello: typeof Hello }>()
    const page = definePage(
      () => chunk.promise,
      (m) => m.Hello,
      { props: { who: "org" } },
    )
    let done = false
    const loading = page.clientLoader().then(() => (done = true))
    await Promise.resolve()
    expect(done).toBe(false)
    chunk.resolve({ Hello })
    await loading
    render(<page.Component />)
    expect(screen.getByText("hello org")).toBeTruthy()
  })

  it("a chunk that keeps failing is retried, then escalated to the reload budget and thrown", async () => {
    vi.useFakeTimers()
    markRouterReady()
    const error = new TypeError(
      "Failed to fetch dynamically imported module: /assets/X-1.js",
    )
    const importPage = vi.fn(() => Promise.reject(error))
    const page = definePage(importPage, (m: { Hello: typeof Hello }) => m.Hello)
    const result = page.clientLoader().catch((e: unknown) => e)
    await vi.runAllTimersAsync()
    expect(await result).toBe(error)
    // Retried in place (retryDynamicImport's schedule), then escalated once.
    expect(importPage.mock.calls.length).toBeGreaterThan(1)
    expect(tryEmergencyReload).toHaveBeenCalledTimes(1)
  })

  it("after a failure the next navigation tries the import again", async () => {
    vi.useFakeTimers()
    markRouterReady()
    let fail = true
    const importPage = vi.fn(() =>
      fail
        ? Promise.reject(new TypeError("Importing a module script failed."))
        : Promise.resolve({ Hello }),
    )
    const page = definePage(importPage, (m: { Hello: typeof Hello }) => m.Hello)
    const first = page.clientLoader().catch(() => "failed")
    await vi.runAllTimersAsync()
    expect(await first).toBe("failed")
    const callsAfterFailure = importPage.mock.calls.length
    fail = false
    await expect(page.clientLoader()).resolves.toBeNull()
    expect(importPage).toHaveBeenCalledTimes(callsAfterFailure + 1)
  })

  it("never revalidates (it only loads code)", () => {
    const page = definePage(
      () => Promise.resolve({ Hello }),
      (m) => m.Hello,
    )
    expect(page.shouldRevalidate()).toBe(false)
  })

  it("a standalone page brings its own Suspense fallback", async () => {
    const chunk = deferred<{ Hello: typeof Hello }>()
    const page = definePage(
      () => chunk.promise,
      (m) => m.Hello,
      { fallback: <p>wait</p> },
    )
    render(<page.Component />)
    expect(screen.getByText("wait")).toBeTruthy()
    await act(async () => chunk.resolve({ Hello }))
    expect(screen.getByText("hello page")).toBeTruthy()
  })
})
