/**
 * Tests for useFeatureFlag.
 *
 * This hook decides which treatment every gated feature renders, and had no
 * coverage. The behaviour that matters for a rollout is: what does a user see
 * when an admin flips a flag server-side, and does a per-user override survive
 * the background sync that follows.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"

const getUserProfileQuery = vi.fn(() => ({ data: undefined }))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => getUserProfileQuery(),
}))

/** What the mocked getFeatureFlag endpoint resolves to for the next render. */
let serverResponse: unknown = { data: undefined }
const dispatch = vi.fn(() => Promise.resolve(serverResponse))

vi.mock("../../../store/hooks", () => {
  // Stable identity, like react-redux's dispatch, so effects keyed on it don't re-run.
  const stableDispatch = () => dispatch()
  return { useAppDispatch: () => stableDispatch }
})
vi.mock("../../../store/api/v2/market", () => ({
  marketV2Api: {
    endpoints: {
      getFeatureFlag: { initiate: () => ({ type: "getFeatureFlag" }) },
      setFeatureFlag: { initiate: (arg: unknown) => ({ type: "setFeatureFlag", arg }) },
    },
  },
}))

const { useFeatureFlag } = await import("../useFeatureFlag")

const STORAGE_KEY = "feature_flags"

beforeEach(() => {
  localStorage.clear()
  dispatch.mockClear()
  serverResponse = { data: undefined }
})

afterEach(() => {
  localStorage.clear()
})

describe("useFeatureFlag — initial read", () => {
  it("starts from the built-in defaults with an empty localStorage", () => {
    const { result } = renderHook(() => useFeatureFlag())

    expect(result.current.flags.customizable_dashboard).toBe(false)
    expect(result.current.flags.market_v2_redesign).toBe(false)
    // Retired flags (always on, no longer gated) have no default.
    expect(result.current.flags.nav_v2).toBeUndefined()
    expect(result.current.flags.wiki).toBeUndefined()
  })

  it("reads stored flags synchronously on the first render", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customizable_dashboard: true }))

    const { result } = renderHook(() => useFeatureFlag())

    // No waitFor: the value must be present on the very first render, or gated
    // components flash the wrong treatment before the sync lands.
    expect(result.current.flags.customizable_dashboard).toBe(true)
  })

  it("layers stored flags over the defaults rather than replacing them", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customizable_dashboard: true }))

    const { result } = renderHook(() => useFeatureFlag())

    expect(result.current.flags.customizable_dashboard).toBe(true)
    expect(result.current.flags.market_v2_redesign).toBe(false)
  })

  it("ignores and clears the stale market_version key from the retired market_v2 flag", async () => {
    localStorage.setItem("market_version", "V2")

    const { result } = renderHook(() => useFeatureFlag())

    expect(result.current.flags.market_v2).toBeUndefined()
    await waitFor(() => expect(localStorage.getItem("market_version")).toBeNull())
  })
})

describe("useFeatureFlag — server render and hydration", () => {
  function RedesignFlag() {
    const { flags } = useFeatureFlag()
    return <span>{flags.market_v2_redesign ? "on" : "off"}</span>
  }

  it("renders the defaults on the server even with stored flags", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ market_v2_redesign: true }))
    expect(renderToString(<RedesignFlag />)).toContain(">off<")
  })

  it("falls back to the defaults when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined)
    try {
      const { result } = renderHook(() => useFeatureFlag())
      expect(result.current.flags.market_v2_redesign).toBe(false)
      expect(result.current.flags.customizable_dashboard).toBe(false)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it("hydrates with the defaults, then applies the stored flags", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ market_v2_redesign: true }))
    const container = document.createElement("div")
    container.innerHTML = renderToString(<RedesignFlag />)
    document.body.appendChild(container)

    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, <RedesignFlag />, {
        onRecoverableError: (error) => errors.push(error),
      })
    })

    expect(errors).toEqual([])
    expect(container.textContent).toBe("on")
    act(() => root!.unmount())
    container.remove()
  })
})

describe("useFeatureFlag — background sync", () => {
  it("applies a server-enabled flag during the current session", async () => {
    // The hook's header comment claims changes only take effect next session.
    // They do not: the sync calls setFlags, so a flag an admin turns on appears
    // without a reload. This test pins the actual behaviour. Uses
    // market_v2_redesign because it defaults off, so the off → server-enabled →
    // on transition is what's exercised.
    serverResponse = {
      data: { flags: { market_v2_redesign: true }, overridden_flags: [], has_override: false },
    }

    const { result } = renderHook(() => useFeatureFlag())
    expect(result.current.flags.market_v2_redesign).toBe(false)

    await waitFor(() => expect(result.current.flags.market_v2_redesign).toBe(true))
  })

  it("persists synced flags for the next session", async () => {
    serverResponse = {
      data: { flags: { customizable_dashboard: true }, overridden_flags: [], has_override: false },
    }

    renderHook(() => useFeatureFlag())

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
      expect(stored.customizable_dashboard).toBe(true)
    })
  })

  it("takes the server's value for an overridden flag", async () => {
    // The server resolves overrides itself, and at the highest precedence:
    // isFlagEnabled checks user_feature_overrides before the enabled gate and
    // the rollout, so data.flags already IS the override's value. The client
    // must not second-guess it.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customizable_dashboard: false }))
    serverResponse = {
      data: {
        flags: { customizable_dashboard: true },
        overridden_flags: ["customizable_dashboard"],
        has_override: true,
      },
    }

    const { result } = renderHook(() => useFeatureFlag())

    await waitFor(() => expect(result.current.flags.customizable_dashboard).toBe(true))
    expect(result.current.hasOverride).toBe(true)
    expect(result.current.overriddenFlags).toEqual(["customizable_dashboard"])
  })

  it("applies a server-side override on a browser with no stored flags", async () => {
    // The regression. The old sync kept `currentLocal[key]` for every
    // overridden flag, and currentLocal came from readStoredFlags(), which
    // always spreads DEFAULT_FLAGS — so `key in currentLocal` was true even
    // when nothing had ever been stored. An enabling override therefore got
    // overwritten by DEFAULT_FLAGS.customizable_dashboard (false) on any fresh browser.
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    serverResponse = {
      data: {
        flags: { customizable_dashboard: true },
        overridden_flags: ["customizable_dashboard"],
        has_override: true,
      },
    }

    const { result } = renderHook(() => useFeatureFlag())

    await waitFor(() => expect(result.current.flags.customizable_dashboard).toBe(true))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").customizable_dashboard).toBe(true)
  })

  it("applies a server-side override that disagrees with a stale stored value", async () => {
    // Same shape in the other direction: a disabling override must win over a
    // stored `true` left behind by an earlier session.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customizable_dashboard: true }))
    serverResponse = {
      data: {
        flags: { customizable_dashboard: false },
        overridden_flags: ["customizable_dashboard"],
        has_override: true,
      },
    }

    const { result } = renderHook(() => useFeatureFlag())

    await waitFor(() => expect(result.current.flags.customizable_dashboard).toBe(false))
  })

  it("lets the server disable a flag the user has no override for", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customizable_dashboard: true }))
    serverResponse = {
      data: { flags: { customizable_dashboard: false }, overridden_flags: [], has_override: false },
    }

    const { result } = renderHook(() => useFeatureFlag())

    await waitFor(() => expect(result.current.flags.customizable_dashboard).toBe(false))
  })

  it("leaves flags absent from the server response at their default", async () => {
    // A flag with no feature_flag_config row is missing from the response
    // entirely rather than being false, so the client default has to hold.
    serverResponse = {
      data: { flags: { customizable_dashboard: true }, overridden_flags: [], has_override: false },
    }

    const { result } = renderHook(() => useFeatureFlag())

    await waitFor(() => expect(result.current.flags.customizable_dashboard).toBe(true))
    expect(result.current.flags.market_v2_redesign).toBe(false)
  })

  it("keeps the stored flags when the sync fails", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ customizable_dashboard: true }))
    dispatch.mockImplementationOnce(() => Promise.reject(new Error("offline")))

    const { result } = renderHook(() => useFeatureFlag())

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.flags.customizable_dashboard).toBe(true)
  })

  it("ignores a legacy market_version-only server response", async () => {
    serverResponse = { data: { market_version: "V2" } }

    const { result } = renderHook(() => useFeatureFlag())

    await waitFor(() => expect(dispatch).toHaveBeenCalled())
    expect(result.current.flags.market_v2).toBeUndefined()
    expect(localStorage.getItem("market_version")).toBeNull()
  })

  it("never writes the legacy market_version key when syncing", async () => {
    serverResponse = {
      data: { flags: { market_v2: true, customizable_dashboard: true }, overridden_flags: [], has_override: false },
    }

    renderHook(() => useFeatureFlag())

    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull())
    expect(localStorage.getItem("market_version")).toBeNull()
  })
})

describe("useFeatureFlag — setFlag", () => {
  it("applies and stores a flag the user sets", async () => {
    const { result } = renderHook(() => useFeatureFlag())

    await act(async () => {
      await result.current.setFlag("customizable_dashboard", true)
    })

    expect(result.current.flags.customizable_dashboard).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").customizable_dashboard).toBe(true)
  })

  it("does not special-case market_v2 or write the legacy key", async () => {
    const { result } = renderHook(() => useFeatureFlag())

    await act(async () => {
      await result.current.setFlag("market_v2", true)
    })

    expect(localStorage.getItem("market_version")).toBeNull()
  })

  it("reports admins as developers", () => {
    getUserProfileQuery.mockReturnValueOnce({
      data: { role: "admin" },
    } as never)

    const { result } = renderHook(() => useFeatureFlag())

    expect(result.current.isDeveloper).toBe(true)
  })
})
