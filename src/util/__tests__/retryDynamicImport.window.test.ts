/**
 * retryDynamicImport timing: outlast the post-deploy 404 flap (~12 s measured
 * on prod) before touching the reload budget, but reload at once when the tab
 * runs a build a deploy already replaced (waiting cannot bring it back).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { retryDynamicImport } from "../retryDynamicImport"

const reload = vi.fn()
const originalLocation = window.location
const originalFetch = globalThis.fetch

function chunkError() {
  return new TypeError(
    "Failed to fetch dynamically imported module: https://sc-market.space/assets/SettingsPage-abc.js",
  )
}

function runningEntry(src: string | null) {
  document
    .querySelectorAll("script[data-test-entry]")
    .forEach((s) => s.remove())
  if (!src) return
  const script = document.createElement("script")
  script.type = "module"
  script.setAttribute("data-test-entry", "")
  script.setAttribute("src", src)
  document.head.appendChild(script)
}

function liveShell(entry: string) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(`<script type="module" src="${entry}"></script>`, {
        status: 200,
      }),
    ),
  ) as unknown as typeof fetch
}

describe("retryDynamicImport timing", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
    reload.mockReset()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "https://sc-market.space/settings",
        origin: "https://sc-market.space",
        reload,
      },
    })
    runningEntry("/assets/index-CURRENT.js")
    liveShell("/assets/index-CURRENT.js")
  })

  afterEach(() => {
    vi.useRealTimers()
    runningEntry(null)
    globalThis.fetch = originalFetch
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("waits ~15.5 s (0.5+1+2+4+8) on the live build before the reload", async () => {
    const importFn = vi.fn(() => Promise.reject(chunkError()))
    const done = retryDynamicImport(importFn).catch((e) => e)

    await vi.advanceTimersByTimeAsync(15_000)
    expect(reload).not.toHaveBeenCalled()
    expect(importFn).toHaveBeenCalledTimes(5)

    await vi.advanceTimersByTimeAsync(600)
    expect(await done).toBeInstanceOf(TypeError)
    expect(importFn).toHaveBeenCalledTimes(6)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("recovers in place when the chunk comes back during the flap: no reload", async () => {
    const importFn = vi
      .fn()
      .mockRejectedValueOnce(chunkError())
      .mockRejectedValueOnce(chunkError())
      .mockRejectedValueOnce(chunkError())
      .mockResolvedValue({ Page: "ok" })

    const done = retryDynamicImport(importFn)
    await vi.advanceTimersByTimeAsync(4_000)

    expect(await done).toEqual({ Page: "ok" })
    expect(reload).not.toHaveBeenCalled()
  })

  it("reloads right away when a deploy replaced the running build", async () => {
    liveShell("/assets/index-NEWER.js")
    const importFn = vi.fn(() => Promise.reject(chunkError()))

    const done = retryDynamicImport(importFn).catch((e) => e)
    await vi.advanceTimersByTimeAsync(0)

    expect(await done).toBeInstanceOf(TypeError)
    expect(importFn).toHaveBeenCalledTimes(1)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/__app_shell_probe",
      expect.objectContaining({ cache: "no-store" }),
    )
  })

  it("a failed probe counts as 'not stale': normal backoff, still one reload", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.reject(new Error("offline")),
    ) as unknown as typeof fetch
    const importFn = vi.fn(() => Promise.reject(chunkError()))

    const done = retryDynamicImport(importFn).catch((e) => e)
    await vi.advanceTimersByTimeAsync(16_000)

    await done
    expect(importFn).toHaveBeenCalledTimes(6)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("no entry script (dev server): never probes", async () => {
    runningEntry(null)
    const importFn = vi.fn(() => Promise.reject(chunkError()))

    const done = retryDynamicImport(importFn).catch((e) => e)
    await vi.advanceTimersByTimeAsync(16_000)

    await done
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it("spent budget: still waits, then throws without reloading (no loop)", async () => {
    sessionStorage.setItem(
      "scmarket_asset_reload_window_start",
      String(Date.now()),
    )
    sessionStorage.setItem("scmarket_asset_reload_attempts", "2")
    const importFn = vi.fn(() => Promise.reject(chunkError()))

    const done = retryDynamicImport(importFn).catch((e) => e)
    await vi.advanceTimersByTimeAsync(16_000)

    expect(await done).toBeInstanceOf(TypeError)
    expect(reload).not.toHaveBeenCalled()
  })
})
