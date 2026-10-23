import React from "react"
import { act, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import type { UserProfileState } from "../UserProfile"
import { useSession } from "../useSession"

interface QueryState {
  data?: UserProfileState
  isSuccess: boolean
  isError: boolean
}

let mockQuery: QueryState

vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => mockQuery,
}))

const profile = { username: "tester", role: "user" } as UserProfileState

function StatusLabel() {
  const session = useSession()
  return <span>{`${session.status}:${session.profile?.username ?? "-"}`}</span>
}

describe("useSession", () => {
  beforeEach(() => {
    mockQuery = { data: undefined, isSuccess: false, isError: false }
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
