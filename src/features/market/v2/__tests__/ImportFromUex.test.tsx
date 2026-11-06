import "./setup"
import "../../../../util/i18n"
/**
 * UEX import: one listing without a price used to make the backend reject the
 * whole import. Unimportable rows now come greyed out with their reason and
 * can't be ticked, only the valid ones are sent, and anything the backend
 * still skips is listed with its reason afterwards.
 */
import React from "react"
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { Provider } from "react-redux"
import { ThemeProvider } from "@mui/material/styles"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../../../hooks/login/useSession", () => ({
  useSession: () => ({ status: "anonymous", profile: undefined }),
  useIsAuthenticated: () => false,
}))

import { makeStore } from "../../../../store/store"
import { browserNetworkEnv } from "../../../../store/browserNetworkEnv"
import { mainTheme } from "../../../../hooks/styles/Theme"
import { ImportFromUex } from "../ImportFromUex"

type Body = { confirm?: boolean; listings?: { title: string; price: number }[] }

let sent: Body[]
let confirmResponse: unknown
let originalFetch: typeof fetch

const preview = [
  { title: "Arrowhead", price: 100, quantity: 1 },
  { title: "Free armor", price: 0, quantity: 1, skip_reason: "no_price" },
  { title: "Helmet", price: 50, quantity: 2 },
]

beforeEach(() => {
  sent = []
  confirmResponse = {
    imported: 1,
    skipped: 1,
    total: 2,
    results: [
      { index: 0, title: "Arrowhead", status: "imported" },
      { index: 1, title: "Helmet", status: "skipped", reason: "failed" },
    ],
  }
  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const req =
        input instanceof Request ? input : new Request(String(input), init)
      const url = new URL(req.url)
      let body: unknown = {}
      if (
        req.method === "POST" &&
        url.pathname === "/api/v2/listings/import-uex"
      ) {
        const parsed = (await req.json()) as Body
        sent.push(parsed)
        body = parsed.confirm
          ? confirmResponse
          : { preview, total: preview.length }
      }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    },
  ) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

async function loadPreview() {
  render(
    <Provider store={makeStore({ networkEnv: browserNetworkEnv })}>
      <ThemeProvider theme={mainTheme}>
        <ImportFromUex shopId="s1" />
      </ThemeProvider>
    </Provider>,
  )
  fireEvent.change(screen.getByLabelText("UEX Username"), {
    target: { value: "seller" },
  })
  fireEvent.click(screen.getByRole("button", { name: /Fetch Listings/ }))
  await screen.findByText("Free armor")
}

describe("ImportFromUex", () => {
  it("blocks an unpriced row, says why, and imports the rest", async () => {
    await loadPreview()

    const blocked = screen.getByRole("checkbox", { name: "Select Free armor" })
    expect(blocked).toBeDisabled()
    expect(blocked).not.toBeChecked()
    expect(screen.getByText("No price set")).toBeInTheDocument()
    expect(
      screen.getByText(/can't be imported as they are/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: "Select Arrowhead" }),
    ).toBeChecked()
    expect(
      screen.getByRole("checkbox", { name: "Select Helmet" }),
    ).toBeChecked()
    // Clicking the blocked row doesn't tick it.
    fireEvent.click(screen.getByText("Free armor"))
    expect(blocked).not.toBeChecked()

    fireEvent.click(screen.getByRole("button", { name: "Import 2 Listings" }))
    const skipped = await screen.findByText("Not imported")
    expect(sent.at(-1)?.listings?.map((l) => l.title)).toEqual([
      "Arrowhead",
      "Helmet",
    ])

    // The backend's per-listing result: the skipped one is listed with its reason.
    const box = skipped.closest("[role=alert]") as HTMLElement
    expect(within(box).getByText(/Helmet/)).toHaveTextContent(
      "Helmet — Couldn't be saved",
    )
    expect(screen.getByText(/Imported/)).toHaveTextContent(
      "Imported 1 of 2 listings from UEX.",
    )
  })

  it("select-all only selects importable rows", async () => {
    await loadPreview()
    const all = screen.getByRole("checkbox", { name: /2 of 2 selected/ })
    fireEvent.click(all)
    expect(
      screen.getByRole("button", { name: "Import 0 Listings" }),
    ).toBeDisabled()
    fireEvent.click(screen.getByRole("checkbox", { name: /0 of 2 selected/ }))
    expect(
      screen.getByRole("button", { name: "Import 2 Listings" }),
    ).toBeEnabled()
    expect(
      screen.getByRole("checkbox", { name: "Select Free armor" }),
    ).not.toBeChecked()
  })

  it("shows no skipped list when everything imported", async () => {
    confirmResponse = {
      imported: 2,
      skipped: 0,
      total: 2,
      results: [
        { index: 0, title: "Arrowhead", status: "imported" },
        { index: 1, title: "Helmet", status: "imported" },
      ],
    }
    await loadPreview()
    fireEvent.click(screen.getByRole("button", { name: "Import 2 Listings" }))
    await waitFor(() =>
      expect(screen.getByText(/Imported/)).toBeInTheDocument(),
    )
    expect(screen.queryByText("Not imported")).toBeNull()
  })
})
