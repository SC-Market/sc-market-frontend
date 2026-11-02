/**
 * Admin › Orders' "Show test orders": off by default and kept in the URL
 * (?include_test=true); the list and stats ask the API for test orders only
 * when it is on; test orders, when shown, get a "Test" chip.
 */
import "../../../util/i18n"
import React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../profile/api/profileApi", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useGetUserProfileQuery: () => ({ data: { username: "admin", role: "admin", contractors: [] } }),
  }
})

import { makeStore } from "../../../store/store"
import { AlertHookContext } from "../../../hooks/alert/AlertHook"
import type { AlertInterface } from "../../../datatypes/Alert"
import { browserNetworkEnv } from "../../../store/browserNetworkEnv"
import { useShowTestOrders } from "../hooks/useShowTestOrders"
import { useAdminOrderSearch } from "../hooks/useAdminOrderSearch"
import { usePageAdminOrderStats } from "../hooks/usePageAdminOrderStats"
import { OrdersTableView } from "../../../views/orders/OrderList"
import type { AdminOrderStub } from "../../../store/api/v2/market"

function order(id: string, is_test: boolean): AdminOrderStub {
  const rating = { avg_rating: 0, rating_count: 0, total_rating: 0, streak: 0 }
  return {
    order_id: id,
    contractor: null,
    assigned_to: null,
    customer: { username: is_test ? "~test-buyer" : "buyer", display_name: "Buyer", avatar: "", rating },
    shop: null,
    status: "not-started",
    timestamp: "2026-11-01T12:00:00.000Z",
    service_name: null,
    cost: "1000",
    title: "Order",
    kind: "Delivery",
    payment_type: "one-time",
    count: 1,
    is_test,
  }
}

let requests: URL[]
let originalFetch: typeof fetch
let listItems: AdminOrderStub[]

beforeEach(() => {
  requests = []
  listItems = []
  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    requests.push(url)
    const body = url.pathname.endsWith("/admin/orders/analytics")
      ? {
          daily_totals: [],
          weekly_totals: [],
          monthly_totals: [],
          top_shops: [],
          top_users: [],
          summary: { total_orders: 0, active_orders: 0, completed_orders: 0, total_value: 0 },
        }
      : {
          item_counts: { fulfilled: 0, "in-progress": 0, "not-started": listItems.length, cancelled: 0, unassigned: 0 },
          items: listItems,
        }
    return Promise.resolve(
      new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }),
    )
  }) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

function Wrapper({ children, initialEntry = "/admin/orders" }: { children: React.ReactNode; initialEntry?: string }) {
  const [store] = React.useState(() => makeStore({ networkEnv: browserNetworkEnv }))
  const alert = React.useState<AlertInterface | null>(null)
  return (
    <Provider store={store}>
      <ThemeProvider theme={mainTheme}>
        <AlertHookContext.Provider value={alert}>
          <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
        </AlertHookContext.Provider>
      </ThemeProvider>
    </Provider>
  )
}

/** The toggle wired like the page: URL state feeding the list and the stats. */
function Harness() {
  const [show, setShow] = useShowTestOrders()
  const search = useAdminOrderSearch({ includeTest: show })
  usePageAdminOrderStats({ includeTest: show })
  const location = useLocation()
  return (
    <>
      <input type="checkbox" aria-label="show-test" checked={show} onChange={(e) => setShow(e.target.checked)} />
      <div data-testid="search">{location.search}</div>
      <OrdersTableView title="Orders" search={search} />
    </>
  )
}

function adminRequests(path: string) {
  return requests.filter((u) => u.pathname.endsWith(path))
}

describe("Admin › Orders: Show test orders", () => {
  it("is off by default: the list and the stats leave test orders out", async () => {
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )
    await waitFor(() => {
      expect(adminRequests("/admin/orders")).toHaveLength(1)
      expect(adminRequests("/admin/orders/analytics")).toHaveLength(1)
    })
    expect(screen.getByLabelText("show-test")).not.toBeChecked()
    expect(adminRequests("/admin/orders")[0].searchParams.has("include_test")).toBe(false)
    expect(adminRequests("/admin/orders/analytics")[0].searchParams.has("include_test")).toBe(false)
  })

  it("turning it on asks for test orders and keeps it in the URL; off removes it", async () => {
    render(
      <Wrapper>
        <Harness />
      </Wrapper>,
    )
    await waitFor(() => expect(adminRequests("/admin/orders")).toHaveLength(1))

    act(() => {
      fireEvent.click(screen.getByLabelText("show-test"))
    })
    expect(screen.getByTestId("search")).toHaveTextContent("?include_test=true")
    await waitFor(() => {
      expect(adminRequests("/admin/orders").at(-1)?.searchParams.get("include_test")).toBe("true")
      expect(adminRequests("/admin/orders/analytics").at(-1)?.searchParams.get("include_test")).toBe("true")
    })

    act(() => {
      fireEvent.click(screen.getByLabelText("show-test"))
    })
    expect(screen.getByTestId("search")).toHaveTextContent(/^$/)
  })

  it("reads the toggle from the URL", async () => {
    render(
      <Wrapper initialEntry="/admin/orders?include_test=true">
        <Harness />
      </Wrapper>,
    )
    expect(screen.getByLabelText("show-test")).toBeChecked()
    await waitFor(() => expect(adminRequests("/admin/orders")).toHaveLength(1))
    expect(adminRequests("/admin/orders")[0].searchParams.get("include_test")).toBe("true")
  })

  it("marks test orders with a Test chip, and only those", async () => {
    listItems = [order("aaaaaaaa-real", false), order("bbbbbbbb-test", true)]
    render(
      <Wrapper initialEntry="/admin/orders?include_test=true">
        <Harness />
      </Wrapper>,
    )
    await screen.findByText(/AAAAAAAA/)
    expect(screen.getAllByText("Test")).toHaveLength(1)
    // The chip sits next to the order's label.
    expect(screen.getByText(/BBBBBBBB/)).toHaveTextContent("Test")
    expect(screen.getByText(/AAAAAAAA/)).not.toHaveTextContent("Test")
  })
})
