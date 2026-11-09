import React from "react"
import { act, render, renderHook, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Session } from "../../../hooks/login/useSession"
import type { UserProfileState } from "../../../hooks/login/UserProfile"
import { resetUnpersistedCampaignPicks, signedInCreative } from "../campaign"
import { IAE_2956 } from "../iae2956"
import { useCampaignAd } from "../useCampaignAd"

let mockSession: Session
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => mockSession,
}))

const ANON: Session = { status: "anonymous", profile: undefined }
const UNKNOWN: Session = { status: "unknown", profile: undefined }
const signedIn = (username: string): Session => ({
  status: "authenticated",
  profile: { username } as UserProfileState,
})

const DURING = new Date("2026-11-20T12:00:00Z")
const END = Date.parse(IAE_2956.end)

function AdId() {
  const ad = useCampaignAd()
  return <span data-testid="ad">{ad?.id ?? "none"}</span>
}

describe("useCampaignAd", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] })
    vi.setSystemTime(DURING)
    localStorage.clear()
    resetUnpersistedCampaignPicks()
    mockSession = ANON
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("is null before the start and after the end", () => {
    vi.setSystemTime(new Date("2026-11-07T23:59:59Z"))
    expect(renderHook(useCampaignAd).result.current).toBeNull()
    vi.setSystemTime(new Date(END))
    expect(renderHook(useCampaignAd).result.current).toBeNull()
    vi.setSystemTime(new Date(END - 1))
    expect(renderHook(useCampaignAd).result.current).not.toBeNull()
  })

  it("switches off at the end while the page is open, without a reload", () => {
    vi.setSystemTime(new Date(END - 1000))
    const { result } = renderHook(useCampaignAd)
    expect(result.current).not.toBeNull()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toBeNull()
  })

  it("waits for the login state", () => {
    mockSession = UNKNOWN
    expect(renderHook(useCampaignAd).result.current).toBeNull()
  })

  it("gives a signed-in user their hashed creative, the same on every mount", () => {
    mockSession = signedIn("tester")
    const expected = signedInCreative(IAE_2956, "tester")
    for (let i = 0; i < 3; i++) {
      const { result, unmount } = renderHook(useCampaignAd)
      expect(result.current).toBe(expected)
      unmount()
    }
    // A signed-in pick doesn't touch the anonymous key.
    expect(localStorage.getItem(IAE_2956.storageKey)).toBeNull()
  })

  it("keeps an anonymous visitor on one creative across mounts and reloads", () => {
    const first = renderHook(useCampaignAd).result.current
    expect(first).not.toBeNull()
    expect(localStorage.getItem(IAE_2956.storageKey)).toBe(first!.id)
    for (let i = 0; i < 5; i++) {
      // Fresh module-level state, as after a reload: only localStorage stays.
      resetUnpersistedCampaignPicks()
      expect(renderHook(useCampaignAd).result.current).toBe(first)
    }
  })

  it("hydrates without a mismatch: none on the server, the creative right after", async () => {
    mockSession = signedIn("tester")
    const container = document.createElement("div")
    container.innerHTML = renderToString(<AdId />)
    expect(container.textContent).toBe("none")
    document.body.appendChild(container)

    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, <AdId />, {
        onRecoverableError: (error) => errors.push(error),
      })
    })
    expect(errors).toEqual([])
    expect(container.textContent).toBe(signedInCreative(IAE_2956, "tester").id)
    act(() => root!.unmount())
    container.remove()
  })

  it("renders the creative on a client-only mount", () => {
    render(<AdId />)
    expect(screen.getByTestId("ad").textContent).toMatch(/^iae2956-/)
  })
})
