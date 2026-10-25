import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"

vi.mock("../monitoring/bugsnagLoader", () => ({
  notifyBugsnag: vi.fn(),
  leaveBugsnagBreadcrumb: vi.fn(),
}))

import {
  notifyBugsnag,
  leaveBugsnagBreadcrumb,
} from "../monitoring/bugsnagLoader"
import {
  registerServiceWorker,
  initPWA,
  probeServiceWorkerScript,
} from "../pwa"

const mockNotify = vi.mocked(notifyBugsnag)
const mockBreadcrumb = vi.mocked(leaveBugsnagBreadcrumb)

function setServiceWorker(register: () => Promise<unknown>) {
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      register: vi.fn(register),
      getRegistrations: vi.fn(() => Promise.resolve([])),
      controller: null,
      addEventListener: vi.fn(),
    },
  })
}

function headResponse(status: number, contentType: string | null) {
  const headers = new Headers()
  if (contentType) headers.set("content-type", contentType)
  return new Response(null, { status, headers })
}

function mockFetch(impl: () => Promise<Response>) {
  const fn = vi.fn(impl)
  vi.stubGlobal("fetch", fn)
  return fn
}

const unknownFetchError = () =>
  new TypeError(
    "Failed to register a ServiceWorker for scope ('https://sc-market.space/') with script ('https://sc-market.space/sw.js'): An unknown error occurred when fetching the script.",
  )

describe("pwa service worker registration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Production path: classification only runs outside dev.
    vi.stubEnv("DEV", false)
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("handles register() resolving undefined without touching .scope", async () => {
    setServiceWorker(() => Promise.resolve(undefined))
    const fetchFn = mockFetch(() =>
      Promise.resolve(headResponse(200, "application/javascript")),
    )

    await expect(registerServiceWorker()).resolves.toBeNull()

    expect(mockNotify).not.toHaveBeenCalled()
    expect(mockBreadcrumb).toHaveBeenCalledWith(
      expect.stringContaining("without a registration"),
      expect.any(Object),
    )
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it.each([
    ["TypeError unknown fetch error", unknownFetchError()],
    [
      "AbortError",
      new DOMException(
        "Failed to register a ServiceWorker: An unknown error occurred when fetching the script.",
        "AbortError",
      ),
    ],
    ["Error Rejected", new Error("Rejected")],
  ])(
    "treats %s as environmental when sw.js is served fine",
    async (_label, error) => {
      setServiceWorker(() => Promise.reject(error))
      const fetchFn = mockFetch(() =>
        Promise.resolve(
          headResponse(200, "application/javascript; charset=utf-8"),
        ),
      )

      await expect(registerServiceWorker()).resolves.toBeNull()

      expect(fetchFn).toHaveBeenCalledWith("/sw.js", {
        method: "HEAD",
        cache: "no-store",
      })
      expect(mockNotify).not.toHaveBeenCalled()
      expect(mockBreadcrumb).toHaveBeenCalledWith(
        "Service worker registration failed",
        expect.objectContaining({
          context: "sw-registration",
          status: 200,
          ourFault: false,
        }),
      )
      expect(console.warn).toHaveBeenCalled()
    },
  )

  it("treats a network failure of the HEAD probe as environmental", async () => {
    setServiceWorker(() => Promise.reject(unknownFetchError()))
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")))

    await expect(registerServiceWorker()).resolves.toBeNull()

    expect(mockNotify).not.toHaveBeenCalled()
    expect(mockBreadcrumb).toHaveBeenCalledWith(
      "Service worker registration failed",
      expect.objectContaining({ status: null, probeError: "Failed to fetch" }),
    )
  })

  it.each([
    [404, "text/html"],
    [500, "application/javascript"],
    [503, null],
    [200, "text/html; charset=utf-8"],
  ])(
    "notifies Bugsnag when sw.js HEAD returns %s %s (our fault)",
    async (status, contentType) => {
      const error = unknownFetchError()
      setServiceWorker(() => Promise.reject(error))
      mockFetch(() => Promise.resolve(headResponse(status, contentType)))

      await expect(registerServiceWorker()).resolves.toBeNull()

      expect(mockNotify).toHaveBeenCalledTimes(1)
      expect(mockNotify).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          context: "sw-registration",
          status,
          contentType,
          ourFault: true,
        }),
      )
      expect(mockBreadcrumb).not.toHaveBeenCalled()
    },
  )

  it("probeServiceWorkerScript accepts JS content types only on 2xx", async () => {
    mockFetch(() => Promise.resolve(headResponse(200, "text/javascript")))
    await expect(probeServiceWorkerScript("/sw.js")).resolves.toMatchObject({
      ourFault: false,
    })
    mockFetch(() => Promise.resolve(headResponse(200, null)))
    await expect(probeServiceWorkerScript("/sw.js")).resolves.toMatchObject({
      ourFault: true,
    })
  })

  describe("initPWA", () => {
    // Tests run under Node; the frontend tsconfig has no node types.
    const nodeProcess = (
      globalThis as unknown as {
        process: {
          on(event: "unhandledRejection", fn: (reason: unknown) => void): void
          off(event: "unhandledRejection", fn: (reason: unknown) => void): void
        }
      }
    ).process
    let unhandled: unknown[]
    const onUnhandled = (reason: unknown) => unhandled.push(reason)
    const onWindowUnhandled = (e: PromiseRejectionEvent) =>
      unhandled.push(e.reason)

    beforeEach(() => {
      unhandled = []
      nodeProcess.on("unhandledRejection", onUnhandled)
      window.addEventListener("unhandledrejection", onWindowUnhandled)
    })

    afterEach(() => {
      nodeProcess.off("unhandledRejection", onUnhandled)
      window.removeEventListener("unhandledrejection", onWindowUnhandled)
    })

    async function runInitPWA() {
      vi.useFakeTimers({ toFake: ["setTimeout", "setInterval"] })
      initPWA()
      await vi.advanceTimersByTimeAsync(1500)
      vi.useRealTimers()
      // Let any stray rejection surface.
      await new Promise((r) => setTimeout(r, 20))
    }

    it.each([
      [
        "register() rejects (environmental)",
        () => Promise.reject(unknownFetchError()),
        200,
      ],
      [
        "register() rejects (our fault)",
        () => Promise.reject(unknownFetchError()),
        404,
      ],
      ["register() resolves undefined", () => Promise.resolve(undefined), 200],
      [
        "register() throws synchronously",
        () => {
          throw new Error("Rejected")
        },
        200,
      ],
    ])(
      "no unhandled rejection escapes when %s",
      async (_label, register, headStatus) => {
        setServiceWorker(register as () => Promise<unknown>)
        mockFetch(() =>
          Promise.resolve(headResponse(headStatus, "application/javascript")),
        )

        await runInitPWA()

        expect(navigator.serviceWorker.register).toHaveBeenCalled()
        expect(unhandled).toEqual([])
      },
    )

    it("no unhandled rejection escapes when the HEAD probe itself throws", async () => {
      setServiceWorker(() => Promise.reject(new Error("Rejected")))
      mockFetch(() => {
        throw new Error("fetch exploded")
      })

      await runInitPWA()

      expect(unhandled).toEqual([])
      expect(mockNotify).not.toHaveBeenCalled()
    })
  })
})
