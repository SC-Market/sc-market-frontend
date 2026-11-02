import "../../../util/i18n"
/**
 * "Show tips again" brings back every dismissed hint: signed in it clears the
 * account's list (DELETE /api/v2/hints/dismissed), signed out this browser's
 * localStorage, and either way confirms with a snackbar.
 */
import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { ThemeProvider } from "@mui/material/styles"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const session = vi.hoisted(() => ({
  status: "anonymous" as "anonymous" | "authenticated",
}))
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () =>
    session.status === "authenticated"
      ? { status: "authenticated", profile: { username: "tester" } }
      : { status: "anonymous", profile: undefined },
  useIsAuthenticated: () => session.status === "authenticated",
}))

import { makeStore } from "../../../store/store"
import { browserNetworkEnv } from "../../../store/browserNetworkEnv"
import { mainTheme } from "../../../hooks/styles/Theme"
import { AlertHookContext } from "../../../hooks/alert/AlertHook"
import type { AlertInterface } from "../../../datatypes/Alert"
import { HelpTipsSettings } from "../HelpTipsSettings"
import {
  DISMISSED_HINTS_STORAGE_KEY,
  addLocalDismissedHint,
  readLocalDismissedHints,
} from "../../../features/help/dismissedHintsStorage"

let requests: string[]
let deleteStatus: number
let alerts: AlertInterface[]
let originalFetch: typeof fetch

beforeEach(() => {
  session.status = "anonymous"
  requests = []
  deleteStatus = 200
  alerts = []
  localStorage.clear()
  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(String(input), init)
    requests.push(`${req.method} ${new URL(req.url).pathname}`)
    const body = req.method === "DELETE" ? { cleared: 3 } : { hint_keys: [] }
    return new Response(JSON.stringify(body), {
      status: req.method === "DELETE" ? deleteStatus : 200,
      headers: { "Content-Type": "application/json" },
    })
  }) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

function renderSettings() {
  const setAlert = ((a: AlertInterface | null) => {
    if (a) alerts.push(a)
  }) as React.Dispatch<React.SetStateAction<AlertInterface | null>>
  render(
    <Provider store={makeStore({ networkEnv: browserNetworkEnv })}>
      <ThemeProvider theme={mainTheme}>
        <AlertHookContext.Provider value={[null, setAlert]}>
          <HelpTipsSettings />
        </AlertHookContext.Provider>
      </ThemeProvider>
    </Provider>,
  )
  return screen.getByRole("button", { name: "Show tips again" })
}

describe("HelpTipsSettings", () => {
  it("signed out: clears this browser's dismissed hints", async () => {
    addLocalDismissedHint("stock.lots")
    expect(readLocalDismissedHints()).toEqual(["stock.lots"])

    fireEvent.click(renderSettings())
    await waitFor(() =>
      expect(alerts).toEqual([
        { message: "Tips will show again", severity: "success" },
      ]),
    )
    expect(localStorage.getItem(DISMISSED_HINTS_STORAGE_KEY)).toBeNull()
    expect(readLocalDismissedHints()).toEqual([])
    expect(requests).toEqual([])
  })

  it("signed in: clears the account's dismissed hints", async () => {
    session.status = "authenticated"
    addLocalDismissedHint("stock.lots")
    fireEvent.click(renderSettings())
    await waitFor(() =>
      expect(alerts).toEqual([
        { message: "Tips will show again", severity: "success" },
      ]),
    )
    expect(requests).toContain("DELETE /api/v2/hints/dismissed")
    // The browser's own list belongs to signed-out use; left alone.
    expect(readLocalDismissedHints()).toEqual(["stock.lots"])
  })

  it("signed in: reports a failure", async () => {
    session.status = "authenticated"
    deleteStatus = 400
    fireEvent.click(renderSettings())
    await waitFor(() =>
      expect(alerts).toEqual([
        { message: "Couldn't reset your tips. Try again.", severity: "error" },
      ]),
    )
  })
})
