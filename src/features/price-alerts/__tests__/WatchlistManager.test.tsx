import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  query: { data: undefined as unknown, isLoading: false, isError: false },
  remove: vi.fn(),
}))

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string, opts?: Record<string, unknown>) =>
        (defaultValue || key).replace(/\{\{(\w+)\}\}/g, (_m, k) =>
          String(opts?.[k] ?? ""),
        ),
      i18n: { language: "en", changeLanguage: vi.fn() },
    }),
  }
})
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
    vi.fn(),
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
    expect(rows[0].textContent).toContain("≤ 25,000 aUEC")
    expect(rows[0].textContent).toContain("21,500 aUEC")
    expect(rows[0].textContent).toContain("Never")
    expect(rows[1].textContent).toContain("Matches listing titles")
    expect(rows[1].textContent).toContain("None listed")
    expect(screen.getByText("2 of 50 items")).toBeTruthy()
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
    expect(screen.getByText("You aren't watching anything yet.")).toBeTruthy()
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
