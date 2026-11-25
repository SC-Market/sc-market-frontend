/**
 * Bug report: "every time I make a listing for my org it posts to my personal
 * shop". The org shop's Orders page, when empty, offers "Create Market
 * Listing" and "Create Service Listing"; they opened the shop-less create
 * pages, so the service was created as the user's own. On a shop's page they
 * now create in that shop, and only show what your role there allows.
 */
import "../../../util/i18n"
import React from "react"
import { describe, it, expect } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"
import type { ShopResponse } from "../../../features/shops/api/shopsApi"
import { EmptyOrders } from "../EmptyOrders"

type Permissions = NonNullable<ShopResponse["permissions"]>
const MANAGER: Permissions = {
  can_manage: true,
  manage_market: true,
  manage_stock: true,
  manage_orders: true,
}
const ORDERS_ONLY: Permissions = {
  can_manage: false,
  manage_market: false,
  manage_stock: false,
  manage_orders: true,
}
const orgShop = (permissions: Permissions) =>
  ({
    shop_id: "org-shop",
    slug: "org-shop",
    is_org_owned: true,
    owner_contractor_spectrum_id: "~TESTORG",
    permissions,
  }) as ShopResponse

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}

const emptyState = <EmptyOrders isOffers={true} isSent={false} />

function renderInShop(shop: ShopResponse) {
  return render(
    <MemoryRouter initialEntries={["/shop/org-shop/orders"]}>
      <Routes>
        <Route path="/shop/:shopSlug" element={<Outlet context={{ shop }} />}>
          <Route path="orders" element={emptyState} />
        </Route>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("EmptyOrders create actions", () => {
  it.each([
    ["Create Market Listing", "/shop/org-shop/listings/create"],
    ["Create Service Listing", "/shop/org-shop/services/create"],
  ])("on a shop's orders page, %s opens %s", (name, to) => {
    renderInShop(orgShop(MANAGER))
    fireEvent.click(screen.getByRole("button", { name }))
    expect(screen.getByTestId("where")).toHaveTextContent(to)
  })

  it("only offers what your role in the shop allows", () => {
    renderInShop(orgShop(ORDERS_ONLY))
    expect(
      screen.queryByRole("button", { name: "Create Market Listing" }),
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole("button", { name: "Create Service Listing" }),
    )
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/shop/org-shop/services/create",
    )
  })

  it.each([
    ["Create Market Listing", "/market/create"],
    ["Create Service Listing", "/order/service/create"],
  ])("outside a shop, %s opens the shop picker at %s", (name, to) => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={emptyState} />
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole("button", { name }))
    expect(screen.getByTestId("where")).toHaveTextContent(to)
  })
})
