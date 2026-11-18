/**
 * "Create Listing" outside a shop page (/market/create) used to send anyone
 * without a (never-set) shop cookie to My Shops, with no way on to the
 * create form. It now picks the shop: straight through with one, a choice
 * with several, and "create my shop" with none.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import type { ShopResponse } from "../../../../store/api/v2/market"
import { ChooseShopToSell } from "../ChooseShopToSell"

let mockShops: ShopResponse[] = []
vi.mock("../../quick-list/useSellingAsShop", () => ({
  useSellingAsShop: () => ({
    shops: mockShops,
    defaultShopId: mockShops[0]?.shop_id ?? null,
    remember: vi.fn(),
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

const mockQuickCreate = vi.fn()
vi.mock("../../../shops/hooks/useShopActions", () => ({
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

const shop = (slug: string, name: string, org = false): ShopResponse =>
  ({ shop_id: slug, slug, name, is_org_owned: org }) as ShopResponse

function Where() {
  const location = useLocation()
  return <div data-testid="where">{location.pathname + location.search}</div>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/market/create" element={<ChooseShopToSell />} />
        <Route path="/shop/:slug/listings/create" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ChooseShopToSell", () => {
  beforeEach(() => {
    mockShops = []
    mockQuickCreate.mockReset()
  })

  it("goes straight to the only shop's create page, keeping the prefill", () => {
    mockShops = [shop("mine", "My Shop")]
    renderAt("/market/create?game_item_id=gi-1")
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/shop/mine/listings/create?game_item_id=gi-1",
    )
  })

  it("lets you choose between several shops", () => {
    mockShops = [shop("mine", "My Shop"), shop("org", "Org Shop", true)]
    renderAt("/market/create")
    expect(screen.getByText("My Shop")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Org Shop"))
    expect(screen.getByTestId("where")).toHaveTextContent(
      "/shop/org/listings/create",
    )
  })

  it("offers to create a shop when you have none, then opens its create page", async () => {
    mockQuickCreate.mockResolvedValue(shop("new-shop", "New Shop"))
    renderAt("/market/create")
    fireEvent.click(screen.getByRole("button", { name: /create my shop/i }))
    await waitFor(() =>
      expect(screen.getByTestId("where")).toHaveTextContent(
        "/shop/new-shop/listings/create",
      ),
    )
  })
})
