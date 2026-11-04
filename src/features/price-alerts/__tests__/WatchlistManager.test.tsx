import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  query: { data: undefined as unknown, isLoading: false, isError: false },
  remove: vi.fn(),
  update: vi.fn(),
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../dashboard/GameItemPicker", () => ({
  GameItemPicker: () => <input aria-label="item search" />,
}))
vi.mock("../../../store/api/v2/market", () => ({
  useGetWatchlistQuery: () => h.query,
  useAddWatchlistItemMutation: () => [
    vi.fn(),
    { isLoading: false, error: undefined, reset: vi.fn() },
  ],
  useUpdateWatchlistItemMutation: () => [
    h.update,
    { isLoading: false, error: undefined },
  ],
  useRemoveWatchlistItemMutation: () => [
    h.remove,
    { isLoading: false, error: undefined },
  ],
}))

import { WatchlistManager } from "../components/WatchlistManager"

const ITEMS = [
  {
    id: "w1",
    query: "Medical Supplies",
    game_item_id: "58891d96-ea38-4141-831d-eae17e17f7cf",
    item_name: "Medical Supplies",
    item_image_url: null,
    max_price: 25000,
    min_quality_tier: 3,
    paused: false,
    paused_at: null,
    current_lowest: 21500,
    last_notified_at: null,
    created_at: "2026-10-25T00:00:00Z",
  },
  {
    id: "w2",
    query: "quantainium",
    game_item_id: null,
    item_name: null,
    item_image_url: null,
    max_price: 9000,
    min_quality_tier: null,
    paused: true,
    paused_at: "2026-10-30T00:00:00Z",
    current_lowest: null,
    last_notified_at: null,
    created_at: "2026-10-24T00:00:00Z",
  },
]

const renderManager = () =>
  render(
    <MemoryRouter>
      <WatchlistManager />
    </MemoryRouter>,
  )

beforeEach(() => {
  h.remove.mockReset()
  h.update.mockReset()
  h.query = {
    data: { items: ITEMS, max_items: 50 },
    isLoading: false,
    isError: false,
  }
})

describe("WatchlistManager", () => {
  it("lists each watch with its target, current lowest and last alert", () => {
    renderManager()
    const rows = screen.getAllByTestId("watchlist-item")
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.getAttribute("data-id"))).toEqual(["w1", "w2"])
    expect(rows[0].textContent).toContain("Medical Supplies")
    expect(rows[0].textContent).toContain("Alert at ≤ 25,000 aUEC · Tier 3+")
    expect(rows[0].textContent).toContain("21,500 aUEC")
    expect(rows[0].textContent).toContain("Never")
    expect(rows[1].textContent).toContain("Matches listing titles")
    expect(rows[1].textContent).toContain("None listed")
    expect(screen.getByText("2 of 50 items")).toBeTruthy()
  })

  it("shows each watch's status and pauses or resumes it", () => {
    renderManager()
    const status = screen.getAllByTestId("watchlist-status")
    expect(status.map((s) => s.textContent)).toEqual(["Active", "Paused"])
    fireEvent.click(screen.getByLabelText("Pause alerts for Medical Supplies"))
    expect(h.update).toHaveBeenCalledWith({
      watchlistId: "w1",
      updateWatchlistItemRequest: { paused: true },
    })
    fireEvent.click(screen.getByLabelText("Resume alerts for quantainium"))
    expect(h.update).toHaveBeenCalledWith({
      watchlistId: "w2",
      updateWatchlistItemRequest: { paused: false },
    })
  })

  it("edits the target price and quality of an item watch", () => {
    renderManager()
    fireEvent.click(screen.getByLabelText("Edit Medical Supplies"))
    expect(
      screen.getByRole("dialog", { name: "Edit price alert" }),
    ).toBeTruthy()
    expect(
      screen.getByRole("combobox", { name: "Minimum quality" }).textContent,
    ).toBe("Tier 3 or better")
    fireEvent.change(screen.getByRole("textbox", { name: "Target price" }), {
      target: { value: "30000" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(h.update).toHaveBeenCalledWith({
      watchlistId: "w1",
      updateWatchlistItemRequest: { max_price: 30000, min_quality_tier: 3 },
    })
  })

  it("removes an item", () => {
    renderManager()
    fireEvent.click(screen.getByLabelText("Stop watching Medical Supplies"))
    expect(h.remove).toHaveBeenCalledWith({ watchlistId: "w1" })
  })

  it("shows skeletons while loading", () => {
    h.query = { data: undefined, isLoading: true, isError: false }
    renderManager()
    expect(screen.getByTestId("watchlist-loading")).toBeTruthy()
  })

  it("says when the watchlist is empty", () => {
    h.query = {
      data: { items: [], max_items: 50 },
      isLoading: false,
      isError: false,
    }
    renderManager()
    const empty = screen.getByTestId("watchlist-empty")
    expect(empty.textContent).toContain("You aren't watching anything yet.")
    expect(empty.textContent).toContain("press Watch price")
    expect(
      screen.getByRole("link", { name: "Browse items" }).getAttribute("href"),
    ).toBe("/wiki/items")
    expect(
      screen
        .getByRole("link", { name: "Browse the market" })
        .getAttribute("href"),
    ).toBe("/market")
  })

  it("disables adding once the watchlist is full", () => {
    const full = Array.from({ length: 50 }, (_, i) => ({
      ...ITEMS[1],
      id: `w${i}`,
    }))
    h.query = {
      data: { items: full, max_items: 50 },
      isLoading: false,
      isError: false,
    }
    renderManager()
    expect(screen.getByText(/Your watchlist is full/)).toBeTruthy()
    expect(
      (screen.getByText("Add item").closest("button") as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })
})
