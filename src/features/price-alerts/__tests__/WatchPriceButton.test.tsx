import React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  session: { status: "authenticated" } as { status: string },
  watchlist: { items: [] as unknown[], max_items: 50 },
  isLoading: false,
  add: vi.fn(),
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => h.session,
}))
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../../store/api/v2/market", () => ({
  useGetWatchlistQuery: (_: unknown, opts?: { skip?: boolean }) =>
    opts?.skip
      ? { data: undefined, isLoading: false }
      : { data: h.watchlist, isLoading: h.isLoading },
  useAddWatchlistItemMutation: () => [
    h.add,
    { isLoading: false, error: undefined },
  ],
  useUpdateWatchlistItemMutation: () => [
    vi.fn(),
    { isLoading: false, error: undefined },
  ],
  useRemoveWatchlistItemMutation: () => [
    vi.fn(),
    { isLoading: false, error: undefined },
  ],
}))

import { WatchPriceButton } from "../components/WatchPriceButton"

const ITEM = "58891d96-ea38-4141-831d-eae17e17f7cf"

function LoginProbe() {
  const location = useLocation()
  return <div data-testid="login-page">{location.search}</div>
}

function renderButton() {
  return render(
    <MemoryRouter initialEntries={["/wiki/items/medical-supplies"]}>
      <Routes>
        <Route
          path="/wiki/items/:id"
          element={
            <WatchPriceButton
              gameItemId={ITEM}
              itemName="Medical Supplies"
              currentPrice={21500}
            />
          }
        />
        <Route path="/login" element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  h.session = { status: "authenticated" }
  h.watchlist = { items: [], max_items: 50 }
  h.isLoading = false
  h.add.mockReset()
  h.add.mockReturnValue({ unwrap: () => Promise.resolve({}) })
})

describe("WatchPriceButton", () => {
  it("asks a logged-out visitor to sign in, then brings them back to the page", () => {
    h.session = { status: "anonymous" }
    renderButton()
    fireEvent.click(
      screen.getByRole("button", { name: /Watch price|Watching/ }),
    )
    const prompt = screen.getByRole("dialog", { name: "Sign in to watch prices" })
    fireEvent.click(within(prompt).getByRole("button", { name: "Sign in" }))
    expect(screen.getByTestId("login-page").textContent).toBe(
      "?redirect=%2Fwiki%2Fitems%2Fmedical-supplies",
    )
  })

  it("shows a skeleton while the session or watchlist loads", () => {
    h.session = { status: "unknown" }
    renderButton()
    expect(screen.getByTestId("watch-price-loading")).toBeTruthy()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("opens the dialog with the current price prefilled and adds the item", async () => {
    renderButton()
    fireEvent.click(screen.getByRole("button", { name: "Watch price" }))
    const input = screen.getByRole("textbox", {
      name: "Target price",
    }) as HTMLInputElement
    expect(input.value).toBe("21500")
    fireEvent.change(input, { target: { value: "20000" } })
    const dialog = screen.getByRole("dialog", { name: "Watch price" })
    fireEvent.click(within(dialog).getByRole("button", { name: "Watch price" }))
    expect(h.add).toHaveBeenCalledWith({
      addWatchlistItemRequest: { game_item_id: ITEM, max_price: 20000 },
    })
  })

  it("rejects a target price of 1 aUEC", () => {
    renderButton()
    fireEvent.click(screen.getByRole("button", { name: "Watch price" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Target price" }), {
      target: { value: "1" },
    })
    expect(screen.getByText("Enter a whole number above 1 aUEC.")).toBeTruthy()
  })

  it("offers a minimum quality for items with quality tiers", () => {
    render(
      <MemoryRouter>
        <WatchPriceButton
          gameItemId={ITEM}
          itemName="Medical Supplies"
          currentPrice={21500}
          qualityRelevant
        />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Watch price" }))
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Minimum quality" }))
    fireEvent.click(screen.getByRole("option", { name: "Tier 3 or better" }))
    const dialog = screen.getByRole("dialog", { name: "Watch price" })
    fireEvent.click(within(dialog).getByRole("button", { name: "Watch price" }))
    expect(h.add).toHaveBeenCalledWith({
      addWatchlistItemRequest: {
        game_item_id: ITEM,
        max_price: 21500,
        min_quality_tier: 3,
      },
    })
  })

  it("hides the quality choice for items without quality tiers", () => {
    renderButton()
    fireEvent.click(screen.getByRole("button", { name: "Watch price" }))
    expect(screen.queryByRole("combobox", { name: "Minimum quality" })).toBeNull()
  })

  it("reads Paused · Edit for a paused watch", () => {
    h.watchlist = {
      max_items: 50,
      items: [
        {
          id: "w1",
          game_item_id: ITEM,
          query: "Medical Supplies",
          max_price: 25000,
          min_quality_tier: null,
          paused: true,
          current_lowest: 21500,
        },
      ],
    }
    renderButton()
    expect(screen.getByRole("button", { name: "Paused · Edit" })).toBeTruthy()
  })

  it("shows Watching · Edit when the item is already watched", () => {
    h.watchlist = {
      max_items: 50,
      items: [
        {
          id: "w1",
          game_item_id: ITEM,
          query: "Medical Supplies",
          max_price: 25000,
          min_quality_tier: null,
          paused: false,
          current_lowest: 21500,
        },
      ],
    }
    renderButton()
    expect(
      screen.getByRole("button", { name: /Watch price|Watching/ }).textContent,
    ).toContain("Watching · Edit")
    fireEvent.click(
      screen.getByRole("button", { name: /Watch price|Watching/ }),
    )
    expect(
      screen.getByRole("dialog", { name: "Edit price alert" }),
    ).toBeTruthy()
    expect(screen.getByText("Stop watching")).toBeTruthy()
    expect(
      (
        screen.getByRole("textbox", {
          name: "Target price",
        }) as HTMLInputElement
      ).value,
    ).toBe("25000")
  })
})
