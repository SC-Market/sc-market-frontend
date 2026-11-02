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
  discord_dm_closed: c(0, 0),
  discord_server_or_app: c(0, 0),
  email: c(1, 1),
  email_confirmed: c(1, 1),
  push: c(0, 0),
  any: c(n, n * 2),
  none: c(0, n),
})

const report = (
  unknown = 0,
  checkedAt: string | null = "2026-11-01T06:00:00.000Z",
  installCounts = false,
  clicks: SellerReachabilityReport["install_clicks"] = [],
): SellerReachabilityReport => ({
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
    discord_dm_closed: c(5, 7),
    discord_server_or_app: c(11, 21),
    email: c(4, 4),
    email_confirmed: c(3, 3),
    push: c(0, 0),
    any: c(16, 32),
    none: c(0, 16),
  },
  signals: {
    discord_dm_delivery_results: true,
    discord_dm_result_retention_days: 90,
    discord_dm_closed_code: 50007,
    discord_shared_server_checked_at: checkedAt,
    discord_shared_server_fresh_days: 3,
    discord_user_install_counts_as_dm: installCounts,
    email_delivery_results: true,
    email_delivered_window_days: 90,
    push_delivery_results: false,
  },
  email_category: "announcements",
  install_clicks: clicks,
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
      screen.getByText(
        /last DM from SC Market \(kept 90 days\) wasn't refused with error 50007, and they share a server with the bot/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/hasn't bounced or been reported as spam/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Sellers not emailed in the last 90 days count/),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Bounces aren't recorded/),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/no delivery result is recorded/),
    ).toBeInTheDocument()
  })

  it("shows DM failed (closed) and Shares a server or installed the app next to DM delivered, and explains them", () => {
    state({ data: report() })
    render(<SellerReachabilityCard />)
    const headers = screen
      .getAllByRole("columnheader")
      .map((h) => h.textContent)
    const i = headers.indexOf("DM delivered")
    expect(headers.slice(i, i + 3)).toEqual([
      "DM delivered",
      "DM failed (closed)",
      "Shares a server or installed the app",
    ])
    const total = within(screen.getByTestId("reachability-total"))
    expect(total.getByText("5 · 7")).toBeInTheDocument()
    expect(total.getByText("11 · 21")).toBeInTheDocument()
    expect(
      screen.getByText(
        /Discord refused their last DM \(error 50007.*A refused DM also clears a recorded app install/,
      ),
    ).toBeInTheDocument()
    const note = screen.getByTestId(
      "reachability-server-or-app-note",
    ).textContent
    expect(note).toMatch(
      /without sending anything; last checked .+\), or seen using the bot through the app installed/,
    )
    expect(note).toMatch(
      /App installs are recorded but not counted as reachable by Discord DM/,
    )
    expect(
      screen.getByText(/Any channel: reachable by Discord DM, email or push/),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Each cell: sellers · their public listings."),
    ).toBeInTheDocument()
  })

  it("says when server membership has not been checked yet", () => {
    state({ data: report(0, null) })
    render(<SellerReachabilityCard />)
    expect(
      screen.getByTestId("reachability-server-or-app-note").textContent,
    ).toMatch(/not checked yet/)
  })

  it("says app installs count once confirmed", () => {
    state({ data: report(0, "2026-11-01T06:00:00.000Z", true) })
    render(<SellerReachabilityCard />)
    expect(
      screen.getByTestId("reachability-server-or-app-note").textContent,
    ).toMatch(/Installing the app counts as reachable by Discord DM/)
  })

  it("lists install link clicks per surface, or says there are none", () => {
    state({ data: report() })
    const { unmount } = render(<SellerReachabilityCard />)
    expect(
      within(screen.getByTestId("reachability-install-clicks")).getByText(
        "No clicks yet.",
      ),
    ).toBeInTheDocument()
    unmount()
    state({
      data: report(0, null, false, [
        { install_type: "user", src: "shop_hint", clicks_7d: 2, clicks_30d: 5 },
        { install_type: "server", src: "footer", clicks_7d: 0, clicks_30d: 1 },
        {
          install_type: "server",
          src: "discord_app",
          clicks_7d: 3,
          clicks_30d: 4,
        },
        {
          install_type: "server",
          src: "shop_settings",
          clicks_7d: 1,
          clicks_30d: 1,
        },
      ]),
    })
    render(<SellerReachabilityCard />)
    const table = within(screen.getByTestId("reachability-install-clicks"))
    const rows = table.getAllByRole("row").map((r) => r.textContent)
    expect(rows[1]).toBe("Your accountShop pages tip25")
    expect(rows[2]).toBe("A serverSite footer01")
    expect(rows[3]).toBe("A serverDiscord app page34")
    expect(rows[4]).toBe("A serverShop Settings › Discord11")
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
