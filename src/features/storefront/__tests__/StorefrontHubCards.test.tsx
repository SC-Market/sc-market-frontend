/**
 * Storefronts hub cards (service-only orgs get a "Services" tag, their
 * services count and a link to their services) and the shop settings'
 * Branded storefront section (personal shops have no directory toggle).
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import type { ShopResponse, StorefrontCard as StorefrontCardData } from "../../../store/api/v2/market"

const h = vi.hoisted(() => ({ directoryArgs: [] as unknown[] }))

vi.mock("../../../store/api/v2/market", () => ({
  useGetShopStorefrontDirectoryQuery: (arg: unknown, opts?: { skip?: boolean }) => {
    h.directoryArgs.push({ arg, opts })
    return opts?.skip
      ? { data: undefined }
      : {
          data: {
            show_in_directory: true,
            can_change: true,
            listed: true,
            reason: "listed",
            members_only: false,
            public_listings: 1,
            private_listings: 0,
            active_services: 0,
          },
        }
  },
  useSetShopStorefrontDirectoryMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../components/StorefrontEnquiryCard", () => ({
  StorefrontEnquiryCard: () => <div data-testid="enquiry-card" />,
}))

import { StorefrontCard } from "../components/StorefrontCard"
import { ShopStorefrontSection } from "../../shops/components/ShopStorefrontSection"

const wrap = (ui: React.ReactElement) =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={mainTheme}>{ui}</ThemeProvider>
    </MemoryRouter>,
  )

const card = (over: Partial<StorefrontCardData> = {}): StorefrontCardData => ({
  spectrum_id: "HAULERS",
  name: "Haulers",
  logo_url: null,
  tagline: "We move cargo",
  fields: ["freight", "trading", "mining"],
  active_listings: 4,
  active_services: 0,
  services_shop_slug: null,
  completed_orders: 0,
  avg_rating: null,
  rating_count: 0,
  showcase: false,
  ...over,
})

beforeEach(() => {
  h.directoryArgs = []
})

describe("StorefrontCard", () => {
  it("an org with listings links to its storefront, without a Services tag", () => {
    wrap(<StorefrontCard storefront={card({ active_services: 2, services_shop_slug: "haulers" })} />)
    expect(screen.getByTestId("storefront-card")).toHaveAttribute("href", "/contractor/HAULERS")
    expect(screen.queryByTestId("storefront-card-services-tag")).toBeNull()
    expect(screen.getByText(/4 listings · 2 services/)).toBeInTheDocument()
  })

  it("a service-only org is tagged Services, shows its services and links to them", () => {
    wrap(<StorefrontCard storefront={card({ active_listings: 0, active_services: 3, services_shop_slug: "haulers" })} />)
    expect(screen.getByTestId("storefront-card-services-tag")).toHaveTextContent("Services")
    expect(screen.getByTestId("storefront-card")).toHaveAttribute("href", "/shops/haulers/services")
    expect(screen.getByText("3 services")).toBeInTheDocument()
    expect(screen.queryByText(/listings/)).toBeNull()
    // The tag takes one of the three chip slots.
    expect(screen.getByText("freight")).toBeInTheDocument()
    expect(screen.queryByText("mining")).toBeNull()
  })
})

const shop = (over: Partial<ShopResponse>): ShopResponse =>
  ({ shop_id: "s1", slug: "my-shop", name: "My shop", is_org_owned: true, ...over }) as ShopResponse

describe("ShopStorefrontSection", () => {
  it("an org's shop shows the directory toggle", () => {
    wrap(<ShopStorefrontSection shop={shop({ is_org_owned: true })} />)
    expect(screen.getByTestId("storefront-directory-toggle")).toBeInTheDocument()
  })

  it("a personal shop has no directory toggle and doesn't ask for its status", () => {
    wrap(<ShopStorefrontSection shop={shop({ is_org_owned: false })} />)
    expect(screen.getByTestId("enquiry-card")).toBeInTheDocument()
    expect(screen.queryByTestId("storefront-directory-toggle")).toBeNull()
    expect(screen.queryByTestId("storefront-directory")).toBeNull()
    expect(h.directoryArgs).toEqual([{ arg: { shopId: "s1" }, opts: { skip: true } }])
    expect(screen.getByText("Ask for your shop's own sc-market.space subdomain")).toBeInTheDocument()
  })
})
