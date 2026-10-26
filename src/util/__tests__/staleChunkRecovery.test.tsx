/**
 * Stale-chunk recovery, end to end through the router: a lazy route whose chunk
 * is gone (deploy while the tab was open) must retry, spend at most the
 * rate-limited automatic reload budget, then show a "new version" notice IN
 * PLACE, on the page's own URL.
 *
 * The bug this guards: the error used to be moved to /error?message=…&target=…
 * so the message lived in the URL. Every later refresh, hard ones included,
 * re-rendered that stale message even after the new build was live (seen in
 * prod: a SettingsPage chunk from a build replaced 17 hours earlier).
 *
 * Each "page load" below is a fresh router over the same sessionStorage, which
 * is what a reload is: JS state is gone, sessionStorage survives.
 */
import React from "react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"

vi.mock("../../hooks/contractor/CustomDomain", () => ({
  useCustomDomain: () => ({ customOrg: undefined }),
}))
vi.mock("../../features/contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: () => ({ data: undefined }),
}))
vi.mock("@unhead/react", () => ({ useHead: () => undefined }))
vi.mock("@unhead/react/helmet", () => ({ Helmet: () => null }))
vi.mock("../../components/metadata/PageReady", () => ({
  usePageReady: () => undefined,
}))
// FrontendError.tsx imports the app shell for FrontendErrorElement; the body
// under test needs none of it.
vi.mock("../../components/layout/Root", () => ({
  Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock("../../hooks/HookProvider", () => ({
  HookProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))
vi.mock("../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

import { Page } from "../../components/metadata/Page"
import { FrontendErrorBody } from "../../pages/errors/FrontendError"
import { retryDynamicImport } from "../retryDynamicImport"

const ATTEMPTS_KEY = "scmarket_asset_reload_attempts"

const reload = vi.fn()
const assign = vi.fn()
const originalLocation = window.location

function setWindowPath(path: string) {
  const url = new URL(path, "https://sc-market.space")
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      origin: url.origin,
      href: url.href,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      reload,
      assign,
    },
  })
}

function staleChunk() {
  return Promise.reject(
    new TypeError(
      "Failed to fetch dynamically imported module: https://sc-market.space/assets/SettingsPage-C0Ny8cS6.js",
    ),
  )
}

type SettingsModule = { SettingsPage: React.ComponentType }
const freshChunk = (): Promise<SettingsModule> =>
  Promise.resolve({ SettingsPage: () => <h1>Settings loaded</h1> })

/** Mirrors App.tsx: root errorElement → FrontendErrorPage → Page → body. */
function ErrorElement() {
  return (
    <Page>
      <FrontendErrorBody />
    </Page>
  )
}

function makeRouter(
  path: string,
  settingsImport: () => Promise<SettingsModule>,
) {
  return createMemoryRouter(
    [
      {
        path: "/",
        errorElement: <ErrorElement />,
        element: <Outlet />,
        children: [
          {
            path: "/settings",
            lazy: async () => ({
              Component: (
                await retryDynamicImport(settingsImport, { baseDelayMs: 1 })
              ).SettingsPage,
            }),
          },
          {
            path: "/broken",
            loader: () => {
              throw new Error("API exploded")
            },
            element: <div />,
          },
          { path: "/error", element: <ErrorElement /> },
        ],
      },
    ],
    { initialEntries: [path] },
  )
}

/** One full page load of `path`; resolves once the route has settled. */
async function pageLoad(
  path: string,
  settingsImport: () => Promise<SettingsModule>,
) {
  cleanup()
  setWindowPath(path)
  const router = makeRouter(path, settingsImport)
  render(<RouterProvider router={router} />)
  await waitFor(() => expect(router.state.initialized).toBe(true))
  await waitFor(() => expect(router.state.navigation.state).toBe("idle"))
  return router
}

describe("stale chunk recovery", () => {
  let now = 1_800_000_000_000

  beforeEach(() => {
    sessionStorage.clear()
    reload.mockReset()
    assign.mockReset()
    now = 1_800_000_000_000
    vi.spyOn(Date, "now").mockImplementation(() => now)
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("keeps the URL on the page and shows the new-version notice", async () => {
    const router = await pageLoad("/settings", staleChunk)

    expect(router.state.location.pathname).toBe("/settings")
    expect(
      await screen.findByText("A new version of SC Market is available"),
    ).toBeInTheDocument()
    // First failure: one automatic reload from the budget.
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("refreshes with the chunk still missing: at most 2 automatic reloads, then the notice, never /error", async () => {
    // Ten loads inside one 120 s window: the automatic reloads (2) plus eight
    // manual refreshes, hard ones included (they do not touch sessionStorage).
    for (let load = 0; load < 10; load++) {
      const router = await pageLoad("/settings", staleChunk)
      expect(router.state.location.pathname).toBe("/settings")
      now += 5_000
    }
    expect(reload).toHaveBeenCalledTimes(2)
    expect(sessionStorage.getItem(ATTEMPTS_KEY)).toBe("2")
    expect(
      screen.getByText("A new version of SC Market is available"),
    ).toBeInTheDocument()
  })

  it("a refresh after the new build is live loads the page (the URL was never replaced)", async () => {
    await pageLoad("/settings", staleChunk)
    await pageLoad("/settings", staleChunk)
    await pageLoad("/settings", staleChunk) // budget spent: notice

    const router = await pageLoad("/settings", freshChunk) // user refresh, chunk now served
    expect(router.state.location.pathname).toBe("/settings")
    expect(await screen.findByText("Settings loaded")).toBeInTheDocument()
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it("the budget refills only after the window: still at most 2 reloads per 120 s", async () => {
    for (let load = 0; load < 6; load++) {
      await pageLoad("/settings", staleChunk)
      now += 10_000
    }
    expect(reload).toHaveBeenCalledTimes(2)

    now += 121_000
    for (let load = 0; load < 6; load++) {
      await pageLoad("/settings", staleChunk)
      now += 10_000
    }
    expect(reload).toHaveBeenCalledTimes(4)
  })

  it("the Reload button reloads once per click, ignoring and not spending the budget", async () => {
    await pageLoad("/settings", staleChunk)
    await pageLoad("/settings", staleChunk)
    await pageLoad("/settings", staleChunk)
    expect(reload).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByRole("button", { name: "Reload" }))

    expect(reload).toHaveBeenCalledTimes(3)
    expect(assign).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(ATTEMPTS_KEY)).toBe("2")
  })

  it("an import that resolves to undefined is handled like a missing chunk", async () => {
    const router = await pageLoad(
      "/settings",
      () => Promise.resolve(undefined) as unknown as Promise<SettingsModule>,
    )
    expect(router.state.location.pathname).toBe("/settings")
    expect(
      await screen.findByText("A new version of SC Market is available"),
    ).toBeInTheDocument()
  })

  it("an old /error URL holding a chunk error offers Reload to its target, without navigating by itself", async () => {
    const message =
      "TypeError: Failed to fetch dynamically imported module: https://sc-market.space/assets/SettingsPage-C0Ny8cS6.js"
    const path =
      "/error?" +
      new URLSearchParams([
        ["message", message],
        ["target", "/settings"],
      ])

    const router = await pageLoad(path, freshChunk)

    expect(router.state.location.pathname).toBe("/error")
    expect(reload).not.toHaveBeenCalled()
    expect(assign).not.toHaveBeenCalled()

    fireEvent.click(await screen.findByRole("button", { name: "Reload" }))
    expect(assign).toHaveBeenCalledWith("/settings")
  })

  it("an off-site /error target is ignored: Reload stays on this page", async () => {
    const path =
      "/error?" +
      new URLSearchParams([
        [
          "message",
          "TypeError: Failed to fetch dynamically imported module: https://x/a.js",
        ],
        ["target", "//evil.example"],
      ])
    await pageLoad(path, freshChunk)

    fireEvent.click(await screen.findByRole("button", { name: "Reload" }))
    expect(assign).not.toHaveBeenCalled()
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("other route errors still move to /error with the message", async () => {
    const router = await pageLoad("/broken", freshChunk)

    await waitFor(() => expect(router.state.location.pathname).toBe("/error"))
    const params = new URLSearchParams(router.state.location.search)
    expect(params.get("message")).toBe("Error: API exploded")
    expect(params.get("target")).toBe("/broken")
    expect(reload).not.toHaveBeenCalled()
  })
})
