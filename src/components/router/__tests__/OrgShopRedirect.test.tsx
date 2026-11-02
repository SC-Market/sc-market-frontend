/**
 * Orgs no longer own listings; their shops do. /org/:id/listings rendered the
 * removed V1 page (calling dead /api/market endpoints, "No rows"), and
 * /org/:id/manage-stock an unscoped stock grid. Both now send you to the
 * org's shop.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import type { ShopResponse } from "../../../store/api/v2/market"
import { querySuccess } from "../../../__tests__/rtkQueryMocks"
import { OrgShopRedirectListings, OrgShopRedirectStock } from "../ShopRedirect"

let mockShops: ShopResponse[] = []
vi.mock("../../../store/api/v2/market", async () => {
  const actual = await vi.importActual<typeof import("../../../store/api/v2/market")>(
    "../../../store/api/v2/market",
  )
  return {
    ...actual,
    useGetMyShopsQuery: () =>
      querySuccess<typeof actual.marketV2Api.endpoints.getMyShops>(mockShops),
  }
})

const shop = (slug: string, spectrumId: string | null): ShopResponse =>
  ({ shop_id: slug, slug, name: slug, is_org_owned: !!spectrumId, owner_contractor_spectrum_id: spectrumId }) as ShopResponse

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/org/:contractor_id/listings" element={<OrgShopRedirectListings />} />
        <Route path="/org/:contractor_id/manage-stock" element={<OrgShopRedirectStock />} />
        <Route path="/shop/:slug/listings" element={<p>shop listings</p>} />
        <Route path="/shop/:slug/stock" element={<p>shop stock</p>} />
        <Route path="/dashboard/shops" element={<p>my shops</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("OrgShopRedirect", () => {
  beforeEach(() => {
    mockShops = [shop("personal", null), shop("org-shop", "~TESTORG")]
  })

  it("sends the org's listings page to its shop's listings", () => {
    renderAt("/org/~TESTORG/listings")
    expect(screen.getByText("shop listings")).toBeInTheDocument()
  })

  it("sends the org's stock page to its shop's stock", () => {
    renderAt("/org/~TESTORG/manage-stock")
    expect(screen.getByText("shop stock")).toBeInTheDocument()
  })

  it("sends you to My Shops when the org has no shop of yours", () => {
    renderAt("/org/~OTHER/listings")
    expect(screen.getByText("my shops")).toBeInTheDocument()
  })

  it("sends you to My Shops when the org has several shops", () => {
    mockShops = [shop("a", "~TESTORG"), shop("b", "~TESTORG")]
    renderAt("/org/~TESTORG/listings")
    expect(screen.getByText("my shops")).toBeInTheDocument()
  })
})
