/**
 * The shop-less URLs of pages that live in a shop (/market/create,
 * /market/manage, /market/manage-stock, /market/stock/:id, /order/services)
 * used to redirect via a current_shop_slug cookie nothing ever set, so
 * everyone landed on My Shops. They now pick the shop: straight through
 * with one, a choice with several, and "create my shop" with none; only
 * shops you can do that in count, and the query string is kept.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import type { ShopResponse } from "../../../../store/api/v2/market"
import {
  ChooseShopForServices,
  ChooseShopToManageListings,
  ChooseShopToManageStock,
  ChooseShopToSell,
} from "../ChooseShop"

let mockShops: ShopResponse[] = []
let mockShopsLoading = false
vi.mock("../../../../store/api/v2/market", () => ({
  useGetMyShopsQuery: () => ({
    data: mockShops,
    isLoading: mockShopsLoading,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("../../../../hooks/login/useSession", () => ({
  useSession: () => ({
    status: "authenticated",
    profile: { username: "seller" },
  }),
}))

const mockQuickCreate = vi.fn()
vi.mock("../../hooks/useShopActions", () => ({
  useQuickCreateShop: () => ({ create: mockQuickCreate, isLoading: false }),
}))

vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({
    children,
    headerTitle,
  }: {
    children: React.ReactNode
    headerTitle?: React.ReactNode
  }) => (
    <div>
      {headerTitle}
      {children}
    </div>
  ),
}))

type Permissions = NonNullable<ShopResponse["permissions"]>
const OWNER: Permissions = {
  can_manage: true,
  manage_market: true,
  manage_stock: true,
  manage_orders: true,
}
const STOCK_ONLY: Permissions = {
  can_manage: false,
  manage_market: false,
  manage_stock: true,
  manage_orders: false,
}
const ORDERS_ONLY: Permissions = {
  can_manage: false,
  manage_market: false,
  manage_stock: false,
  manage_orders: true,
}

const shop = (
  slug: string,
  name: string,
  opts: { org?: boolean; permissions?: Permissions; archived?: boolean } = {},
): ShopResponse =>
  ({
    shop_id: slug,
    slug,
    name,
    is_org_owned: opts.org ?? false,
    status: opts.archived ? "archived" : "active",
    permissions: opts.permissions ?? OWNER,
  }) as ShopResponse

function Where() {
  const location = useLocation()
  return (
    <div data-testid="where">
      {location.pathname + location.search + location.hash}
    </div>
  )
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/market/create" element={<ChooseShopToSell />} />
        <Route path="/market/create/:tab" element={<ChooseShopToSell />} />
        <Route path="/market/manage" element={<ChooseShopToManageListings />} />
        <Route
          path="/market/stock/:listingId"
          element={<ChooseShopToManageListings />}
        />
        <Route
          path="/market/manage-stock"
          element={<ChooseShopToManageStock />}
        />
        <Route path="/order/services" element={<ChooseShopForServices />} />
        <Route path="/shop/:slug/*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ChooseShop", () => {
  beforeEach(() => {
    mockShops = []
    mockShopsLoading = false
    mockQuickCreate.mockReset()
  })

  it.each([
    [
      "/market/create?game_item_id=gi-1",
      "/shop/mine/listings/create?game_item_id=gi-1",
    ],
    [
      "/market/manage?quantityAvailable=0",
      "/shop/mine/listings?quantityAvailable=0",
    ],
    ["/market/stock/listing-1", "/shop/mine/listings"],
    ["/market/manage-stock#lots", "/shop/mine/stock#lots"],
    ["/order/services", "/shop/mine/services"],
  ])("%s goes straight to the only shop: %s", (from, to) => {
    mockShops = [shop("mine", "My Shop")]
    renderAt(from)
    expect(screen.getByTestId("where")).toHaveTextContent(to)
  })

  it("lets you choose between several shops", () => {
    mockShops = [
      shop("mine", "My Shop"),
      shop("org", "Org Shop", { org: true }),
    ]
    renderAt("/market/manage-stock?tab=lots")
    expect(screen.getByText("My Shop")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Org Shop"))
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/shop/org/stock?tab=lots",
    )
  })

  it("only counts the shops you can do that in", () => {
    mockShops = [
      shop("stock", "Stock Shop", { org: true, permissions: STOCK_ONLY }),
      shop("orders", "Orders Shop", { org: true, permissions: ORDERS_ONLY }),
      shop("old", "Old Shop", { archived: true }),
    ]
    renderAt("/market/manage-stock")
    expect(screen.getByTestId("where")).toHaveTextContent("/shop/stock/stock")
  })

  it("sends the services URL to the shop whose services you manage", () => {
    mockShops = [
      shop("stock", "Stock Shop", { org: true, permissions: STOCK_ONLY }),
      shop("orders", "Orders Shop", { org: true, permissions: ORDERS_ONLY }),
    ]
    renderAt("/order/services")
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/shop/orders/services",
    )
  })

  it("waits for your shops before choosing", () => {
    mockShopsLoading = true
    mockShops = []
    renderAt("/market/manage")
    expect(screen.queryByTestId("where")).toBeNull()
    expect(
      screen.queryByRole("button", { name: "chooseShop.createShop" }),
    ).toBeNull()
  })

  it("offers to create a shop when you have none, then opens its page", async () => {
    mockShops = [
      shop("stock", "Stock Shop", { org: true, permissions: STOCK_ONLY }),
    ]
    mockQuickCreate.mockResolvedValue(shop("new-shop", "New Shop"))
    renderAt("/market/manage?quantityAvailable=0")
    fireEvent.click(
      screen.getByRole("button", { name: "chooseShop.createShop" }),
    )
    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent(
        "/shop/new-shop/listings?quantityAvailable=0",
      ),
    )
  })

  it("creates a shop from /market/create and opens its create page", async () => {
    mockQuickCreate.mockResolvedValue(shop("new-shop", "New Shop"))
    renderAt("/market/create")
    fireEvent.click(
      screen.getByRole("button", { name: "chooseShop.createShop" }),
    )
    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent(
        "/shop/new-shop/listings/create",
      ),
    )
  })
})
