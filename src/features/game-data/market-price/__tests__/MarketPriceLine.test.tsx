/**
 * "Lowest on SC Market": the line's text and link, hidden when nobody sells
 * the item, one batched request per page, and no hydration mismatch on the
 * prerendered / server-rendered wiki pages (the line only appears after
 * hydration, even when the price is already in the browser's cache).
 */
import React from "react"
import { act, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import * as marketApi from "../../../../store/api/v2/market"
import type { GameItemMarketPrice } from "../../../../store/api/v2/market"
import {
  querySuccess,
  queryUninitialized,
} from "../../../../__tests__/rtkQueryMocks"
import { MarketPriceLine } from "../MarketPriceLine"
import { marketPriceIdsArg, useMarketPrices } from "../useMarketPrices"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const ITEM = "a0000000-0000-4000-8000-000000000001"
const OTHER = "b0000000-0000-4000-8000-000000000002"

const price = (p: Partial<GameItemMarketPrice> = {}): GameItemMarketPrice => ({
  game_item_id: ITEM,
  lowest_price: 1_500_000,
  seller_count: 3,
  listing_count: 5,
  ...p,
})

function Probe({ ids }: { ids: string[] }) {
  const prices = useMarketPrices(ids)
  return (
    <MarketPriceLine
      price={prices.get(ITEM)}
      gameItemId={ITEM}
      itemName="FR-66"
    />
  )
}

const tree = (ids: string[] = [ITEM]) => (
  <MemoryRouter>
    <Probe ids={ids} />
  </MemoryRouter>
)

function mockPrices(items: GameItemMarketPrice[]) {
  return vi.spyOn(marketApi, "useGetMarketPricesQuery").mockReturnValue(
    querySuccess<typeof marketApi.marketV2Api.endpoints.getMarketPrices>({
      items,
    }),
  )
}

afterEach(() => vi.restoreAllMocks())

describe("MarketPriceLine", () => {
  it("shows the lowest price and distinct sellers, linking to the market page", () => {
    mockPrices([price()])
    render(tree())
    const link = screen.getByRole("link", {
      name: "Lowest on SC Market: 1.5M aUEC · 3 sellers",
    })
    expect(link.getAttribute("href")).toBe("/market/aggregate/a0000000--fr-66")
  })

  it("uses the singular for one seller", () => {
    mockPrices([price({ seller_count: 1 })])
    render(tree())
    expect(
      screen.getByText("Lowest on SC Market: 1.5M aUEC · 1 seller"),
    ).toBeInTheDocument()
  })

  it("says only the sellers when no listing has a fixed price", () => {
    mockPrices([price({ lowest_price: null, seller_count: 2 })])
    render(tree())
    expect(screen.getByText("On SC Market: 2 sellers")).toBeInTheDocument()
  })

  it("is hidden when nobody sells the item", () => {
    mockPrices([price({ game_item_id: OTHER })])
    render(tree())
    expect(screen.queryByTestId("market-price-line")).toBeNull()
  })

  it("is hidden for a zero-seller entry", () => {
    mockPrices([price({ seller_count: 0 })])
    render(tree())
    expect(screen.queryByTestId("market-price-line")).toBeNull()
  })

  it("asks once for the whole page, with a stable, capped id list", () => {
    const spy = mockPrices([])
    render(tree([OTHER, ITEM, ITEM.toUpperCase()]))
    expect(spy.mock.calls[0][0]).toEqual({ ids: `${ITEM},${OTHER}` })
    const many = Array.from(
      { length: 130 },
      (_, n) => `c0000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    )
    expect(marketPriceIdsArg(many).split(",")).toHaveLength(120)
    expect(marketPriceIdsArg([])).toBe("")
  })

  it("skips the request without ids", () => {
    const spy = vi
      .spyOn(marketApi, "useGetMarketPricesQuery")
      .mockReturnValue(
        queryUninitialized<
          typeof marketApi.marketV2Api.endpoints.getMarketPrices
        >(),
      )
    render(tree([]))
    expect(spy.mock.calls[0][1]).toEqual({ skip: true })
  })
})

describe("hydration", () => {
  it("renders no price on the server and hydrates without a mismatch", async () => {
    // Worst case: the browser already has the price when it hydrates.
    mockPrices([price()])
    const html = renderToString(tree())
    expect(html).not.toContain("SC Market")

    const container = document.createElement("div")
    container.innerHTML = html
    document.body.appendChild(container)
    const recoverable: unknown[] = []
    const consoleErrors: string[] = []
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation((...args) => {
        consoleErrors.push(args.map(String).join(" "))
      })
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, tree(), {
        onRecoverableError: (error) => recoverable.push(error),
      })
    })
    expect(recoverable).toEqual([])
    expect(
      consoleErrors.filter((m) => /hydrat|did not match/i.test(m)),
    ).toEqual([])
    // After hydration the line appears.
    expect(container.textContent).toContain(
      "Lowest on SC Market: 1.5M aUEC · 3 sellers",
    )
    consoleSpy.mockRestore()
    act(() => root!.unmount())
    container.remove()
  })
})
