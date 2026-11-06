import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../../store/api/v2/market", () => {
  const mutation = () => [vi.fn(), { isLoading: false, error: undefined }]
  return {
    useAddWatchlistItemMutation: mutation,
    useUpdateWatchlistItemMutation: mutation,
    useRemoveWatchlistItemMutation: mutation,
  }
})

import { WatchPriceDialog } from "../components/WatchPriceDialog"

const ui = (open: boolean, currentPrice: number) => (
  <WatchPriceDialog
    open={open}
    onClose={vi.fn()}
    gameItemId="58891d96-ea38-4141-831d-eae17e17f7cf"
    itemName="Medical Supplies"
    currentPrice={currentPrice}
  />
)

const priceField = () => screen.getByRole("textbox", { name: /target price/i })

describe("WatchPriceDialog field reset", () => {
  it("keeps what the user typed when the price changes while open", () => {
    const { rerender } = render(ui(true, 500))
    expect(priceField()).toHaveValue("500")
    fireEvent.change(priceField(), { target: { value: "420" } })
    rerender(ui(true, 600))
    expect(priceField()).toHaveValue("420")
  })

  it("resets the fields from the current price each time it opens", () => {
    const { rerender } = render(ui(true, 500))
    fireEvent.change(priceField(), { target: { value: "420" } })
    rerender(ui(false, 600))
    rerender(ui(true, 600))
    expect(priceField()).toHaveValue("600")
  })
})
