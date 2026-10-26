import "../../components/__tests__/setup"
/**
 * Buy-order cards on /buyorders are links to the buy order's detail page,
 * reachable by keyboard and named for screen readers, and a negotiable order
 * posted without a price says so instead of "— aUEC".
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, expect, it, vi } from "vitest"
import type { StandingBuyOrder } from "../../../../../store/api/v2/market"
import { BuyOrderCard } from "../BuyOrdersRedesign"

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual<typeof import("react-i18next")>("react-i18next")
  const t = (key: string, def?: string | Record<string, unknown>, opts?: Record<string, unknown>) => {
    const text = typeof def === "string" ? def : key
    const vars = (typeof def === "object" ? def : opts) ?? {}
    return text.replace(/{{(\w+)}}/g, (_, name: string) => String(vars[name] ?? ""))
  }
  return { ...actual, useTranslation: () => ({ t, i18n: { language: "en" } }) }
})

const theme = createTheme({
  layoutSpacing: { layout: 2, component: 1, text: 1, compact: 0.5 },
  borderRadius: { topLevel: 0.375, image: 0.375, button: 1, input: 0.5, chip: 0.5, minimal: 0 },
  palette: { outline: { main: "#e0e0e0" } },
} as Parameters<typeof createTheme>[0])

function order(overrides: Partial<StandingBuyOrder>): StandingBuyOrder {
  return {
    buy_order_id: "bo-1",
    game_item_id: "gi-1",
    game_item_name: "Abrade Scraper Module",
    buyer_id: "u-1",
    buyer_name: "buyer",
    quantity: 4,
    quantity_fulfilled: 1,
    price_per_unit: 1500,
    negotiable: false,
    status: "active",
    visibility: "public",
    created_at: "2026-10-20T00:00:00Z",
    photos: [],
    ...overrides,
  } as StandingBuyOrder
}

function renderCard(o: StandingBuyOrder) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={["/buyorders"]}>
        <Routes>
          <Route path="/buyorders" element={<BuyOrderCard order={o} index={0} />} />
          <Route path="/buyorder/:id" element={<div>buy order detail</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("BuyOrderCard", () => {
  it("is a named link to the buy order's detail page", () => {
    renderCard(order({}))

    const link = screen.getByRole("link", {
      name: "Buy order: Abrade Scraper Module, 1,500 aUEC, 3 of 4 requested",
    })
    expect(link).toHaveAttribute("href", "/buyorder/bo-1")
  })

  it("opens the detail page from the keyboard", async () => {
    const user = userEvent.setup()
    renderCard(order({}))

    await user.tab()
    expect(screen.getByRole("link")).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(screen.getByText("buy order detail")).toBeInTheDocument()
  })

  it("shows 'Make an offer' for a negotiable order without a price", () => {
    renderCard(order({ price_per_unit: 0, negotiable: true }))

    expect(screen.getByText("Make an offer")).toBeInTheDocument()
    expect(screen.queryByText(/— aUEC/)).not.toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Abrade Scraper Module, Make an offer,/ }),
    ).toBeInTheDocument()
  })
})
