import React, { Suspense } from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { MarketRouter } from "../MarketRouter"

// The V2 page (loaded via React.lazy). Like the real one, it renders the
// services body through its own Suspense boundary.
vi.mock("../v2/MarketPageV2", async () => {
  const { ServiceMarketView } = await import(
    "../../../views/services/ServiceMarketView.lazy"
  )
  const { useLocation } = await import("react-router-dom")
  return {
    MarketPageV2: function MarketPageV2() {
      const { pathname } = useLocation()
      return (
        <div data-testid="market-v2">
          Market V2
          {pathname === "/market/services" && (
            <Suspense fallback={<p>body fallback</p>}>
              <ServiceMarketView />
            </Suspense>
          )}
        </div>
      )
    },
  }
})

vi.mock("../../../views/services/ServiceMarketView", () => ({
  ServiceMarketView: () => <div data-testid="services-content" />,
}))

vi.mock("../../../features/services", () => ({
  ServiceListings: () => <div data-testid="service-listings" />,
  ServiceListingBase: () => null,
}))

vi.mock("../../../features/market/v2/ListingSearchV2", () => ({
  ListingSearchV2: () => <div data-testid="listing-search" />,
}))

// The Suspense fallback is the route skeleton (tested with the route table)
vi.mock("../../router/RouteSuspense", () => ({
  RouteSkeletonFallback: () => <div role="progressbar" />,
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MarketRouter />
    </MemoryRouter>,
  )
}

describe("MarketRouter", () => {
  it("shows the route skeleton, then the V2 market page", async () => {
    renderAt("/market")

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(await screen.findByTestId("market-v2")).toBeInTheDocument()
    expect(screen.getByText("Market V2")).toBeInTheDocument()
  })

  it("renders /market/services with its body in the same pass (one skeleton)", async () => {
    renderAt("/market/services")

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(await screen.findByTestId("market-v2")).toBeInTheDocument()
    // The body chunk was loaded with the page: no second fallback.
    expect(screen.getByTestId("services-content")).toBeInTheDocument()
    expect(screen.queryByText("body fallback")).not.toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })
})
