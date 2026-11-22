import { describe, expect, it } from "vitest"
import {
  isInjectedDescriptorRecursion,
  isNoiseEvent,
  isResizeObserverLoopNoise,
  type ReportedError,
} from "../bugsnagLoader"

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

// The /market event (Windows, Chrome 157): an extension's inline script
// wraps Object.getOwnPropertyDescriptor and recurses into its own wrapper.
const extensionFrame = {
  file: "https://sc-market.space/market",
  method: "Object.getOwnPropertyDescriptor [as _getOwnPropertyDescriptor]",
  lineNumber: 1,
  columnNumber: 2995,
}
const extensionRecursion: ReportedError = {
  errorClass: "RangeError",
  errorMessage: "Maximum call stack size exceeded",
  stacktrace: Array.from({ length: 40 }, () => ({ ...extensionFrame })),
}

// A stack overflow in our own code: the frames are in the bundle.
const appRecursion: ReportedError = {
  errorClass: "RangeError",
  errorMessage: "Maximum call stack size exceeded",
  stacktrace: [
    {
      file: "https://sc-market.space/assets/MarketPage-B2x9kQ1a.js",
      method: "walkTree",
    },
    {
      file: "https://sc-market.space/assets/MarketPage-B2x9kQ1a.js",
      method: "walkTree",
    },
  ],
}

describe("isInjectedDescriptorRecursion", () => {
  it("matches the extension's self-wrapping getOwnPropertyDescriptor", () => {
    expect(isInjectedDescriptorRecursion(extensionRecursion)).toBe(true)
    expect(isNoiseEvent([extensionRecursion])).toBe(true)
  })

  it("keeps a stack overflow in our own code", () => {
    expect(isInjectedDescriptorRecursion(appRecursion)).toBe(false)
    expect(isNoiseEvent([appRecursion])).toBe(false)
  })

  it("keeps the overflow when any frame is ours", () => {
    const mixed: ReportedError = {
      ...extensionRecursion,
      stacktrace: [
        ...extensionRecursion.stacktrace,
        {
          file: "https://sc-market.space/assets/index-Dk3l1x.js",
          method: "Object.getOwnPropertyDescriptor",
        },
      ],
    }
    expect(isInjectedDescriptorRecursion(mixed)).toBe(false)
  })

  it("keeps an inline-script frame that is not the descriptor wrapper", () => {
    const other: ReportedError = {
      ...extensionRecursion,
      stacktrace: [
        ...extensionRecursion.stacktrace,
        { file: "https://sc-market.space/market", method: "render" },
      ],
    }
    expect(isInjectedDescriptorRecursion(other)).toBe(false)
  })

  it("keeps other errors with the same frames, and empty stacks", () => {
    expect(
      isInjectedDescriptorRecursion({
        ...extensionRecursion,
        errorClass: "TypeError",
        errorMessage: "x is undefined",
      }),
    ).toBe(false)
    expect(
      isInjectedDescriptorRecursion({ ...extensionRecursion, stacktrace: [] }),
    ).toBe(false)
  })

  it("drops an event only when all of its errors are noise", () => {
    expect(isNoiseEvent([])).toBe(false)
    expect(isNoiseEvent([extensionRecursion, appRecursion])).toBe(false)
  })
})
