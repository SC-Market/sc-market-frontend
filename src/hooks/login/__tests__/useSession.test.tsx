import React from "react"
import { act, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import type { UserProfileState } from "../UserProfile"
import { useIsAuthenticated, useSession } from "../useSession"
import type { SessionCheckResult } from "../../../store/networkEnv"

interface QueryState {
  data?: UserProfileState
  isSuccess: boolean
  isError: boolean
}

let mockQuery: QueryState
/** GET /api/auth/session answer; undefined while in flight. */
let mockCheck: SessionCheckResult | undefined
/** skip option of the last useGetUserProfileQuery call. */
let lastProfileSkip: boolean | undefined

vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: (_arg?: undefined, opts?: { skip?: boolean }) => {
    lastProfileSkip = opts?.skip
    return opts?.skip
      ? { data: undefined, isSuccess: false, isError: false }
      : mockQuery
  },
  useAuthSessionCheckQuery: () => ({ data: mockCheck }),
}))

const profile = { username: "tester", role: "user" } as UserProfileState

function StatusLabel() {
  const session = useSession()
  return <span>{`${session.status}:${session.profile?.username ?? "-"}`}</span>
}

describe("useSession", () => {
  beforeEach(() => {
    mockQuery = { data: undefined, isSuccess: false, isError: false }
    mockCheck = undefined
  })

  it("is anonymous as soon as the session check says so, even with a cached profile", () => {
    mockQuery = { data: profile, isSuccess: true, isError: false }
    mockCheck = "anonymous"
    const { result } = renderHook(useSession)
    expect(result.current).toEqual({ status: "anonymous", profile: undefined })
  })

  it("renders a cached profile immediately while the session check is in flight", () => {
    mockQuery = { data: profile, isSuccess: true, isError: false }
    mockCheck = undefined
    const { result } = renderHook(useSession)
    expect(result.current).toEqual({ status: "authenticated", profile })
  })

  it("is unknown while the profile request is pending", () => {
    const { result } = renderHook(useSession)
    expect(result.current).toEqual({ status: "unknown", profile: undefined })
  })

  it("is authenticated with the profile once the query succeeds", () => {
    mockQuery = { data: profile, isSuccess: true, isError: false }
    const { result } = renderHook(useSession)
    expect(result.current).toEqual({ status: "authenticated", profile })
  })

  it("is anonymous when the query fails, even with stale data", () => {
    mockQuery = { data: profile, isSuccess: false, isError: true }
    const { result } = renderHook(useSession)
    expect(result.current).toEqual({ status: "anonymous", profile: undefined })
  })

  it("returns the same object while the query state is unchanged", () => {
    mockQuery = { data: profile, isSuccess: true, isError: false }
    const { result, rerender } = renderHook(useSession)
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it("is unknown on the server even with a cached profile", () => {
    mockQuery = { data: profile, isSuccess: true, isError: false }
    expect(renderToString(<StatusLabel />)).toContain("unknown:-")
  })

  it("hydrates as unknown without a mismatch, then reports the session", async () => {
    // Server: logged out (no profile). Client: profile seeded from cache.
    mockQuery = { data: undefined, isSuccess: false, isError: false }
    const container = document.createElement("div")
    container.innerHTML = renderToString(<StatusLabel />)
    document.body.appendChild(container)

    mockQuery = { data: profile, isSuccess: true, isError: false }
    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, <StatusLabel />, {
        onRecoverableError: (error) => errors.push(error),
      })
    })

    expect(errors).toEqual([])
    expect(container.textContent).toBe("authenticated:tester")
    act(() => root!.unmount())
    container.remove()
  })
})

describe("useIsAuthenticated", () => {
  beforeEach(() => {
    mockQuery = { data: undefined, isSuccess: false, isError: false }
    mockCheck = undefined
    lastProfileSkip = undefined
  })

  it("is false while the session check is in flight, even with a cached profile", () => {
    mockQuery = { data: profile, isSuccess: true, isError: false }
    const { result } = renderHook(useIsAuthenticated)
    expect(result.current).toBe(false)
  })

  it("is true once the session check confirms the session", () => {
    mockCheck = "authenticated"
    const { result } = renderHook(useIsAuthenticated)
    expect(result.current).toBe(true)
    expect(lastProfileSkip).toBe(true)
  })

  it("is false for anonymous visitors", () => {
    mockCheck = "anonymous"
    mockQuery = { data: profile, isSuccess: true, isError: false }
    const { result } = renderHook(useIsAuthenticated)
    expect(result.current).toBe(false)
  })

  it("falls back to the profile query when the backend has no session check", () => {
    mockCheck = "unsupported"
    const { result, rerender } = renderHook(useIsAuthenticated)
    expect(lastProfileSkip).toBe(false)
    expect(result.current).toBe(false)
    mockQuery = { data: profile, isSuccess: true, isError: false }
    rerender()
    expect(result.current).toBe(true)
  })

  it("is false on the server", () => {
    mockCheck = "authenticated"
    function Label() {
      return <span>{String(useIsAuthenticated())}</span>
    }
    expect(renderToString(<Label />)).toContain("false")
  })
})
