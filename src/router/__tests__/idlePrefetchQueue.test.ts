import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  enqueueIdlePrefetch,
  GRACE_MS,
  INPUT_BACKOFF_MS,
  resetIdlePrefetchQueue,
} from "../idlePrefetchQueue"

// Idle callbacks run as soon as the timers let them, with time to spare.
globalThis.requestIdleCallback = vi.fn((cb: IdleRequestCallback) =>
  setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0),
) as unknown as typeof requestIdleCallback

describe("idlePrefetchQueue", () => {
  beforeEach(() => {
    resetIdlePrefetchQueue()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    Reflect.deleteProperty(navigator, "connection")
  })

  it("waits for the grace period, then runs tasks one at a time", async () => {
    let releaseFirst!: () => void
    const first = vi.fn(
      () => new Promise<void>((resolve) => (releaseFirst = resolve)),
    )
    const second = vi.fn(() => Promise.resolve())
    enqueueIdlePrefetch("a", first)
    enqueueIdlePrefetch("b", second)

    await vi.advanceTimersByTimeAsync(GRACE_MS - 10)
    expect(first).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(20)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).not.toHaveBeenCalled() // still busy with the first

    releaseFirst()
    await vi.advanceTimersByTimeAsync(10)
    expect(second).toHaveBeenCalledTimes(1)
  })

  it("dedupes by key and swallows failures", async () => {
    const failing = vi.fn(() => Promise.reject(new Error("404 after deploy")))
    const next = vi.fn(() => Promise.resolve())
    enqueueIdlePrefetch("x", failing)
    enqueueIdlePrefetch("x", failing)
    enqueueIdlePrefetch("y", next)
    await vi.advanceTimersByTimeAsync(GRACE_MS + 50)
    expect(failing).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it("backs off after user input", async () => {
    const task = vi.fn(() => Promise.resolve())
    enqueueIdlePrefetch("t", task)
    await vi.advanceTimersByTimeAsync(GRACE_MS - 5)
    window.dispatchEvent(new Event("pointerdown"))
    await vi.advanceTimersByTimeAsync(20)
    expect(task).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(INPUT_BACKOFF_MS)
    expect(task).toHaveBeenCalledTimes(1)
  })

  it("skips prefetching with Save-Data on", async () => {
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
      configurable: true,
    })
    const task = vi.fn(() => Promise.resolve())
    enqueueIdlePrefetch("s", task)
    await vi.advanceTimersByTimeAsync(GRACE_MS + 50)
    expect(task).not.toHaveBeenCalled()
  })
})
