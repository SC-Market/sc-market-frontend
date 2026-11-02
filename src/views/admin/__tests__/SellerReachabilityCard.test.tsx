import React from "react"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import * as marketApi from "../../../store/api/v2/market"
import type { SellerReachabilityReport } from "../../../store/api/v2/market"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../store/api/v2/market", () => ({
  useGetSellerReachabilityQuery: vi.fn(),
}))

import { SellerReachabilityCard } from "../SellerReachabilityCard"

const mockQuery = vi.mocked(marketApi.useGetSellerReachabilityQuery)
const refetch = vi.fn()

const c = (sellers: number, listings: number) => ({ sellers, listings })
const bucket = (
  name: SellerReachabilityReport["buckets"][number]["bucket"],
  n: number,
) => ({
  bucket: name,
  sellers: n,
  listings: n * 3,
  discord_dm: c(n, n * 2),
  discord_dm_confirmed: c(0, 0),
  email: c(1, 1),
  email_confirmed: c(1, 1),
  push: c(0, 0),
  any: c(n, n * 2),
  none: c(0, n),
})

const report = (unknown = 0): SellerReachabilityReport => ({
  generated_at: "2026-11-01T12:00:00.000Z",
  buckets: [
    bucket("today", 4),
    bucket("this_week", 2),
    bucket("this_month", 1),
    bucket("over_a_month", 9),
    bucket("unknown", unknown),
  ],
  totals: {
    sellers: 16 + unknown,
    listings: 48,
    discord_dm: c(16, 32),
    discord_dm_confirmed: c(0, 0),
    email: c(4, 4),
    email_confirmed: c(3, 3),
    push: c(0, 0),
    any: c(16, 32),
    none: c(0, 16),
  },
  signals: {
    discord_dm_delivery_results: true,
    discord_dm_result_retention_days: 90,
    email_delivery_results: true,
    email_delivered_window_days: 90,
    push_delivery_results: false,
  },
  email_category: "announcements",
})

function state(s: Record<string, unknown>) {
  mockQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch,
    ...s,
  } as unknown as ReturnType<typeof marketApi.useGetSellerReachabilityQuery>)
}

describe("SellerReachabilityCard", () => {
  beforeEach(() => vi.clearAllMocks())

  it("shows one row per last-seen bucket and the totals, as sellers · listings", () => {
    state({ data: report() })
    render(<SellerReachabilityCard />)
    const over = screen.getByTestId("reachability-over_a_month")
    expect(
      within(over).getByText("Not seen for over a month"),
    ).toBeInTheDocument()
    expect(within(over).getByText("9 · 27")).toBeInTheDocument()
    // Discord DM and Any channel: 9 sellers, 18 listings.
    expect(within(over).getAllByText("9 · 18")).toHaveLength(2)
    expect(
      within(screen.getByTestId("reachability-total")).getByText("16 · 48"),
    ).toBeInTheDocument()
    expect(screen.getByText("Any channel")).toBeInTheDocument()
    expect(screen.getByText("DM delivered")).toBeInTheDocument()
    expect(screen.getByText("Email delivered")).toBeInTheDocument()
    expect(
      within(screen.getByTestId("reachability-total")).getByText("3 · 3"),
    ).toBeInTheDocument()
  })

  it("hides the 'no one to contact' row when it is empty, shows it otherwise", () => {
    state({ data: report(0) })
    const { unmount } = render(<SellerReachabilityCard />)
    expect(screen.queryByTestId("reachability-unknown")).not.toBeInTheDocument()
    unmount()
    state({ data: report(2) })
    render(<SellerReachabilityCard />)
    expect(
      within(screen.getByTestId("reachability-unknown")).getByText(
        "No one to contact",
      ),
    ).toBeInTheDocument()
  })

  it("says how reliable each channel is: DM results kept, email bounces and deliveries recorded, no push results", () => {
    state({ data: report() })
    render(<SellerReachabilityCard />)
    expect(
      screen.getByText(/last DM from SC Market \(kept 90 days\) didn't fail/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/hasn't bounced or been reported as spam/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Sellers not emailed in the last 90 days count/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Bounces aren't recorded/)).not.toBeInTheDocument()
    expect(
      screen.getByText(/no delivery result is recorded/),
    ).toBeInTheDocument()
  })

  it("shows an error with a working retry", () => {
    state({ isError: true })
    render(<SellerReachabilityCard />)
    expect(
      screen.getByText("The reachability report couldn't be loaded."),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(refetch).toHaveBeenCalled()
  })

  it("shows placeholders while loading", () => {
    state({ isLoading: true })
    const { container } = render(<SellerReachabilityCard />)
    expect(
      container.querySelectorAll(".MuiSkeleton-root").length,
    ).toBeGreaterThan(0)
  })
})
