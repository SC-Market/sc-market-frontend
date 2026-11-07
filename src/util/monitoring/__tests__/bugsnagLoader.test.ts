import { describe, expect, it } from "vitest"
import { isResizeObserverLoopNoise } from "../bugsnagLoader"

describe("isResizeObserverLoopNoise", () => {
  it("matches the browsers' ResizeObserver loop notices", () => {
    expect(
      isResizeObserverLoopNoise(
        "ResizeObserver loop completed with undelivered notifications.",
      ),
    ).toBe(true)
    expect(
      isResizeObserverLoopNoise(
        "ResizeObserver loop completed with undelivered notifications",
      ),
    ).toBe(true)
    expect(
      isResizeObserverLoopNoise("ResizeObserver loop limit exceeded"),
    ).toBe(true)
    expect(
      isResizeObserverLoopNoise(
        "Uncaught Error: ResizeObserver loop completed with undelivered notifications.",
      ),
    ).toBe(true)
  })

  it("leaves every other error, ResizeObserver ones included, reported", () => {
    expect(isResizeObserverLoopNoise("Load failed")).toBe(false)
    expect(
      isResizeObserverLoopNoise(
        "Failed to construct 'ResizeObserver': 1 argument required",
      ),
    ).toBe(false)
    expect(
      isResizeObserverLoopNoise(
        "Cannot read properties of null (reading 'offsetHeight') in ResizeObserver loop completed with undelivered notifications",
      ),
    ).toBe(false)
  })
})
