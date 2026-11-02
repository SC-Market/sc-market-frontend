/**
 * Regression: the org Customers table showed the same "5" orders worth
 * "32 aUEC" on every row. Those were hardcoded placeholders; the endpoint
 * never returned per-customer stats. Each row must show its own customer's
 * orders and order value.
 */
import React from "react"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/theme/mainTheme"
import { describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => ({ args: [] as unknown[] }))

vi.mock("../../../store/api/v2/market", () => ({
  useGetOrgCustomersQuery: (arg: unknown) => {
    h.args.push(arg)
    return {
      isLoading: false,
      data: {
        spectrum_id: "TESTORG",
        customers: [
          {
            user_id: "u1",
            username: "alice",
            display_name: "Alice",
            avatar: null,
            orders: 2,
            fulfilled_orders: 1,
            total_value: 1500000,
            last_order_at: "2026-10-30T12:00:00.000Z",
          },
          {
            user_id: "u2",
            username: "bob",
            display_name: "Bob",
            avatar: null,
            orders: 7,
            fulfilled_orders: 6,
            total_value: 32000000,
            last_order_at: "2026-10-31T08:00:00.000Z",
          },
        ],
      },
    }
  },
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)

const { CustomerList } = await import("../Customers")

describe("org customers", () => {
  it("two customers with different orders show different stats", () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <MemoryRouter initialEntries={["/org/TESTORG/members"]}>
          <Routes>
            <Route path="/org/:contractor_id/members" element={<CustomerList />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(h.args).toContainEqual({ spectrumId: "TESTORG" })

    const alice = screen.getByText("alice").closest("tr")!
    const bob = screen.getByText("bob").closest("tr")!
    expect(within(alice).getByText("2")).toBeTruthy()
    expect(within(alice).getByText("1,500,000 aUEC")).toBeTruthy()
    expect(within(bob).getByText("7")).toBeTruthy()
    expect(within(bob).getByText("6")).toBeTruthy()
    expect(within(bob).getByText("32,000,000 aUEC")).toBeTruthy()
    expect(screen.queryByText("32 aUEC")).toBeNull()
  })
})
