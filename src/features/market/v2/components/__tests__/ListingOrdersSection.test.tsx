import "./setup"
/**
 * ListingOrdersSection only asks for a listing's orders when the viewer can
 * manage the listing's shop. GET /orders/by-listing is owner/manager-only, so
 * calling it for anyone else (anonymous visitors included) is a 401/403 on
 * every listing page.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as marketApi from "../../../../../store/api/v2/market"
import * as session from "../../../../../hooks/login/useSession"
import { ListingOrdersSection } from "../ListingOrdersSection"

vi.mock("../../../../../hooks/login/useSession", () => ({
  useIsAuthenticated: vi.fn(),
}))

vi.mock("../../../../../components/paper/Section", () => ({
  Section: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}))

vi.mock("../../../../../store/api/v2/market", () => ({
  useGetMyShopsQuery: vi.fn(),
  useGetOrdersByListingQuery: vi.fn(),
}))

const ordersQuery = vi.mocked(marketApi.useGetOrdersByListingQuery)
const myShopsQuery = vi.mocked(marketApi.useGetMyShopsQuery)
const isAuthenticated = vi.mocked(session.useIsAuthenticated)

type MyShops = NonNullable<ReturnType<typeof marketApi.useGetMyShopsQuery>["data"]>

function shop(shopId: string, canManage: boolean): MyShops[number] {
  return {
    shop_id: shopId,
    permissions: {
      can_manage: canManage,
      manage_market: canManage,
      manage_stock: canManage,
      manage_orders: canManage,
    },
  } as MyShops[number]
}

function renderSection() {
  return render(
    <MemoryRouter>
      <ListingOrdersSection listingId="listing-1" shopId="shop-1" />
    </MemoryRouter>,
  )
}

function lastOrdersSkip(): boolean | undefined {
  const call = ordersQuery.mock.calls.at(-1)
  const options = call?.[1] as { skip?: boolean } | undefined
  return options?.skip
}

describe("ListingOrdersSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ordersQuery.mockReturnValue({
      data: {
        orders: [
          {
            order_id: "order-1",
            status: "in-progress",
            created_at: "2026-10-01T00:00:00Z",
            buyer_name: "buyer",
            quantity: 2,
            price_per_unit: 100,
          },
        ],
        offers: [],
      },
      error: undefined,
    } as unknown as ReturnType<typeof marketApi.useGetOrdersByListingQuery>)
  })

  it("never requests orders (or my shops) for an anonymous visitor", () => {
    isAuthenticated.mockReturnValue(false)
    myShopsQuery.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof marketApi.useGetMyShopsQuery>)

    renderSection()

    expect(myShopsQuery).toHaveBeenLastCalledWith(undefined, { skip: true })
    expect(lastOrdersSkip()).toBe(true)
    expect(screen.queryByText("Orders & Offers")).not.toBeInTheDocument()
  })

  it("does not request orders for a logged-in user who cannot manage the shop", () => {
    isAuthenticated.mockReturnValue(true)
    myShopsQuery.mockReturnValue({
      data: [shop("other-shop", true), shop("shop-1", false)],
    } as unknown as ReturnType<typeof marketApi.useGetMyShopsQuery>)

    renderSection()

    expect(lastOrdersSkip()).toBe(true)
    expect(screen.queryByText("Orders & Offers")).not.toBeInTheDocument()
  })

  it("requests and shows orders for a viewer who manages the listing's shop", () => {
    isAuthenticated.mockReturnValue(true)
    myShopsQuery.mockReturnValue({
      data: [shop("shop-1", true)],
    } as unknown as ReturnType<typeof marketApi.useGetMyShopsQuery>)

    renderSection()

    expect(lastOrdersSkip()).toBe(false)
    expect(screen.getByText("Orders & Offers")).toBeInTheDocument()
    expect(screen.getByText("buyer")).toBeInTheDocument()
  })
})
