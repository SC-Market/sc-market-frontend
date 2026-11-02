import "../../../../util/i18n"
/**
 * First-use hints: hidden until the session is known, dismissible, and once
 * dismissed never shown again: on the account when signed in (GET/PUT
 * /api/v2/hints/dismissed), in localStorage when signed out.
 */
import React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { ThemeProvider } from "@mui/material/styles"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const session = vi.hoisted(() => ({ status: "unknown" as "unknown" | "anonymous" | "authenticated" }))

vi.mock("../../../../hooks/login/useSession", () => ({
  useSession: () =>
    session.status === "authenticated"
      ? { status: "authenticated", profile: { username: "tester" } }
      : { status: session.status, profile: undefined },
  useIsAuthenticated: () => session.status === "authenticated",
}))

import { makeStore } from "../../../../store/store"
import { browserNetworkEnv } from "../../../../store/browserNetworkEnv"
import { mainTheme } from "../../../../hooks/styles/Theme"
import { FirstUseHint } from "../FirstUseHint"
import { HINT_KEY_PATTERN, HINTS } from "../../hints"
import { GUIDE_LINKS } from "../../guideLinks"
import { DISMISSED_HINTS_STORAGE_KEY } from "../../dismissedHintsStorage"

let serverKeys: string[]
let requests: string[]
let failPut: boolean
let originalFetch: typeof fetch

beforeEach(() => {
  session.status = "unknown"
  serverKeys = []
  requests = []
  failPut = false
  localStorage.clear()
  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(String(input), init)
    const url = new URL(req.url)
    requests.push(`${req.method} ${url.pathname}`)
    const json = (body: unknown, status = 200) =>
      Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }))
    if (req.method === "GET" && url.pathname === "/api/v2/hints/dismissed") {
      return json({ hint_keys: [...serverKeys] })
    }
    const put = /^\/api\/v2\/hints\/dismissed\/(.+)$/.exec(url.pathname)
    if (req.method === "PUT" && put) {
      if (failPut) return json({ error: "nope" }, 400)
      serverKeys.push(decodeURIComponent(put[1]))
      return json({ hint_key: put[1], dismissed_at: "2026-11-02T00:00:00.000Z" })
    }
    return json({})
  }) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

function renderHint(store = makeStore({ networkEnv: browserNetworkEnv })) {
  const ui = (
    <Provider store={store}>
      <ThemeProvider theme={mainTheme}>
        <FirstUseHint hint="stockLots" title="Stock is kept in lots">
          A lot is a quantity of one item.
        </FirstUseHint>
      </ThemeProvider>
    </Provider>
  )
  const result = render(ui)
  return { ...result, store, ui }
}

const hint = () => screen.queryByRole("complementary", { name: "Stock is kept in lots" })

describe("HINTS", () => {
  it("has unique keys the backend accepts, each with a guide", () => {
    const keys = Object.values(HINTS).map((h) => h.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const { key, guide } of Object.values(HINTS)) {
      expect(key).toMatch(HINT_KEY_PATTERN)
      expect(GUIDE_LINKS[guide]).toMatch(/^\/guides\//)
    }
  })
})

describe("FirstUseHint", () => {
  it("shows nothing while the session is unknown", async () => {
    renderHint()
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(hint()).toBeNull()
    expect(requests).toEqual([])
  })

  it("signed out: shows, links its guide, and stays dismissed in this browser", async () => {
    session.status = "anonymous"
    const { unmount } = renderHint()
    expect(hint()).toBeInTheDocument()
    const learnMore = screen.getByRole("link", { name: /Learn more/ })
    expect(learnMore).toHaveAttribute("href", GUIDE_LINKS.stockLots)
    expect(learnMore).toHaveAttribute("target", "_blank")

    fireEvent.click(screen.getByRole("button", { name: "Dismiss this tip" }))
    expect(hint()).toBeNull()
    expect(JSON.parse(localStorage.getItem(DISMISSED_HINTS_STORAGE_KEY) ?? "[]")).toEqual([HINTS.stockLots.key])
    expect(requests).toEqual([])

    unmount()
    renderHint()
    expect(hint()).toBeNull()
  })

  it("signed in: waits for the account's list, dismisses on the account", async () => {
    session.status = "authenticated"
    const { unmount } = renderHint()
    expect(hint()).toBeNull()
    await waitFor(() => expect(hint()).toBeInTheDocument())

    fireEvent.click(screen.getByRole("button", { name: "Dismiss this tip" }))
    // Hidden at once, before the request finishes.
    expect(hint()).toBeNull()
    await waitFor(() => expect(requests).toContain(`PUT /api/v2/hints/dismissed/${HINTS.stockLots.key}`))
    expect(serverKeys).toEqual([HINTS.stockLots.key])
    // Not written to this browser: another account here still sees it.
    expect(localStorage.getItem(DISMISSED_HINTS_STORAGE_KEY)).toBeNull()

    // A reload (fresh store) reads the account's list: still hidden.
    unmount()
    renderHint()
    await waitFor(() => expect(requests.filter((r) => r.startsWith("GET")).length).toBeGreaterThanOrEqual(2))
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(hint()).toBeNull()
  })

  it("signed in: a hint dismissed on another device stays hidden", async () => {
    session.status = "authenticated"
    serverKeys = [HINTS.stockLots.key]
    renderHint()
    await waitFor(() => expect(requests).toContain("GET /api/v2/hints/dismissed"))
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(hint()).toBeNull()
  })

  it("signed in: shows again if the account didn't take the dismissal", async () => {
    session.status = "authenticated"
    failPut = true
    renderHint()
    await waitFor(() => expect(hint()).toBeInTheDocument())
    fireEvent.click(screen.getByRole("button", { name: "Dismiss this tip" }))
    expect(hint()).toBeNull()
    await waitFor(() => expect(hint()).toBeInTheDocument())
  })
})
