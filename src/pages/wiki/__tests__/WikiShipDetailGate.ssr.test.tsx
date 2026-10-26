/**
 * /wiki/ships/:id server HTML carries the real ship detail content (not just
 * the browser list), and the client hydrates it without a mismatch.
 */
import React from "react"
import { act } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@mui/material"
import { afterEach, describe, expect, it, vi } from "vitest"
import { mainTheme } from "../../../hooks/styles/Theme"
import type { WikiShipDetail as Ship } from "../../../store/api/v2/market"
import {
  DESKTOP_WIDTH,
  PHONE_WIDTH,
  mockViewport,
} from "../../../hooks/layout/__tests__/mockViewport"
import { WikiShipDetailGate } from "../WikiShipDetailGate"

const ship: Ship = {
  id: "ship-1",
  name: "Aegis Gladius",
  manufacturer: "Aegis Dynamics",
  manufacturer_name: "Aegis Dynamics",
  description: "A light fighter built for dogfighting.",
  attributes: { shield_hp: "4500" },
  crew_size: 1,
}

vi.mock("../../../store/api/v2/market", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useGetShipDetailQuery: () => ({ data: ship, isLoading: false, error: undefined }),
}))

vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: (props: { children: React.ReactNode; headerTitle?: string }) => (
    <div>
      <h1>{props.headerTitle}</h1>
      {props.children}
    </div>
  ),
}))

vi.mock("@unhead/react/helmet", () => ({ Helmet: () => null }))

vi.mock("../WikiShipBrowser", () => ({
  WikiShipBrowser: () => <div>ship browser with detail modal</div>,
}))

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({
    t: (key: string, def?: string | Record<string, unknown>) =>
      typeof def === "string" ? def : key,
    i18n: { language: "en" },
  }),
}))

const app = (
  <ThemeProvider theme={mainTheme}>
    <MemoryRouter initialEntries={["/wiki/ships/ship-1"]}>
      <Routes>
        <Route path="/wiki/ships/:id" element={<WikiShipDetailGate />} />
      </Routes>
    </MemoryRouter>
  </ThemeProvider>
)

describe("WikiShipDetailGate server render", () => {
  afterEach(() => vi.restoreAllMocks())

  it("puts the ship's detail content in the server HTML", () => {
    const html = renderToString(app)
    expect(html).toContain("Aegis Gladius")
    expect(html).toContain("A light fighter built for dogfighting.")
    expect(html).toContain("Aegis Dynamics")
    expect(html).not.toContain("ship browser with detail modal")
  })

  it.each([
    ["desktop", DESKTOP_WIDTH, "ship browser with detail modal"],
    ["a phone", PHONE_WIDTH, "A light fighter built for dogfighting."],
  ])("hydrates without a mismatch on %s", async (_label, width, expected) => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(app)
    document.body.appendChild(container)
    mockViewport(width)

    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, app, {
        onRecoverableError: (error) => errors.push(error),
      })
    })

    expect(errors).toEqual([])
    expect(container.textContent).toContain(expected)
    act(() => root!.unmount())
    container.remove()
  })
})
