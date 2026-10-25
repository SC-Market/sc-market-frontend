import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { ContextAwareFAB } from "../ContextAwareFAB"

vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useBreakpointDown: () => true,
}))
vi.mock("../../../hooks/layout/useBottomNavHeight", () => ({
  useBottomNavHeight: () => 0,
}))
vi.mock("../../../util/haptics", () => ({
  haptic: { light: vi.fn(), medium: vi.fn() },
}))

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe("ContextAwareFAB", () => {
  // Regression: "Manage Inventory" used to navigate to the bare /market/stock,
  // which matched /market/:id and rendered the listing page with id="stock"
  // (POST /api/v2/listings/stock/views -> 500).
  it("Manage Inventory navigates to /market/manage-stock, not /market/stock", () => {
    render(
      <MemoryRouter initialEntries={["/market/stock/listing-1"]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <ContextAwareFAB />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Manage Inventory" }))

    expect(screen.getByTestId("location").textContent).toBe(
      "/market/manage-stock",
    )
  })
})
