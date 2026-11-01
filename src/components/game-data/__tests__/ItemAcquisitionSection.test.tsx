import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { ItemAcquisitionSection } from "../ItemAcquisitionSection"
import { acquisition } from "../../../bridge/__tests__/fixtures"

// The English catalog, exactly as the bridge renders it.
vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  const { englishT } = await import("../../../bridge/englishT")
  return {
    ...actual,
    useTranslation: () => ({ t: englishT, i18n: { language: "en-US" } }),
  }
})

function renderSection(doc = acquisition(), onAddToCart?: (id: string) => void) {
  return render(
    <MemoryRouter>
      <ItemAcquisitionSection doc={doc} itemName="Siebe Helmet" onAddToCart={onAddToCart} />
    </MemoryRouter>,
  )
}

function href(name: string | RegExp): string | null {
  return screen.getByRole("link", { name }).getAttribute("href")
}

describe("ItemAcquisitionSection", () => {
  it("links listings, missions, blueprints and ingredients with real hrefs", () => {
    renderSection()
    expect(screen.getByRole("heading", { name: "How to get Siebe Helmet" })).toBeTruthy()
    expect(screen.getByText("Lowest ask").nextSibling?.textContent).toBe("450,000 aUEC")
    expect(screen.getByText("Median ask (medium confidence)").nextSibling?.textContent).toBe("650,000 aUEC")
    expect(href("Siebe Helmet")).toBe("/market/5e2d1f98--siebe-helmet")
    expect(href("Compare all Siebe Helmet listings")).toBe("/market/aggregate/9bb3a108--siebe-helmet")
    expect(href("Additional Resources For Research")).toBe("/missions/Rayari_Rank3_IrradiatedPearls")
    expect(screen.getByText("3.6% drop chance")).toBeTruthy()
    expect(screen.getByText("Giver: Rayari Incorporated")).toBeTruthy()
    expect(href("Siebe Helmet blueprint")).toBe("/blueprints/BP_CRAFT_clda_utility_heavy_helmet_03_01_01")
    expect(href("Stileron")).toBe("/wiki/items/51c80361--stileron")
    expect(href("JSON data")).toBe("https://api.sc-market.space/api/public/items/9bb3a108--siebe-helmet.json")
    expect(href("CC BY 4.0")).toBe("https://creativecommons.org/licenses/by/4.0/")
  })

  it("hides empty subsections", () => {
    const { unmount } = renderSection()
    expect(screen.queryByText("In-game shops")).toBeNull()
    expect(screen.queryByText("Mining, salvage and loot")).toBeNull()
    unmount()
    const doc = acquisition()
    doc.listings = { ...doc.listings, count: 0, seller_count: 0, top: [] }
    doc.missions = { total: 0, top: [] }
    doc.blueprints = { total: 0, items: [] }
    renderSection(doc)
    expect(screen.getByText("No player listings, missions, blueprints or in-game shops for Siebe Helmet yet.")).toBeTruthy()
    expect(screen.queryByText("Buy from players")).toBeNull()
  })

  it("shows in-game shops and resource info when present, and adds a listing to the cart", () => {
    const doc = acquisition()
    doc.in_game_shops = { total: 1, shops: [{ name: "Cousin Crow's", location: "Orison", buy_price: 1200, sell_price: null }] }
    doc.resource = {
      can_be_mined: true,
      can_be_purchased: false,
      can_be_salvaged: true,
      can_be_looted: false,
      mining_locations: { Stanton: ["Aberdeen", "Daymar"] },
      purchase_locations: null,
    }
    const add = vi.fn()
    renderSection(doc, add)
    expect(screen.getByText("Cousin Crow's")).toBeTruthy()
    expect(screen.getByText("1,200 aUEC")).toBeTruthy()
    expect(screen.getByText("Can be mined")).toBeTruthy()
    expect(screen.getByText("Can be salvaged")).toBeTruthy()
    expect(screen.queryByText("Can be looted")).toBeNull()
    expect(screen.getByText("Stanton: Aberdeen, Daymar")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }))
    expect(add).toHaveBeenCalledWith("5e2d1f98-5d8f-4d55-969a-e32b006684f4")
  })
})
