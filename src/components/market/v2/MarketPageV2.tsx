import React, { Suspense, useState } from "react"
import { useBreakpointDown } from "../../../hooks/layout/useBreakpoint"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Page } from "../../../components/metadata/Page"
import { MarketSidebarContext } from "../../../features/market/hooks/MarketSidebar"
import { ServiceSidebarContext } from "../../../features/contracting/hooks/ServiceSidebar"
import { MarketPageLayout } from "../../../components/layout/MarketPageLayout"
import {
  MarketActions,
  BuyOrderActions,
} from "../../../features/market/components/MarketActions"
import { FiltersFAB } from "../../../components/mobile/FiltersFAB"
import { FeatureErrorBoundary } from "../../../components/error-boundaries"
import { MarketV2Routes } from "../../../features/market/v2/MarketV2Routes"
import { marketPageKind, marketPageTitle } from "./marketPageKind"
// Static, not lazy: a one-button header that otherwise popped in after a
// spinner and shifted the header row.
import { ServiceActions } from "../../../views/services/ServiceActions"
import {
  MarketSearchSkeleton,
  ServiceMarketSkeleton,
} from "../../skeletons/MarketSearchSkeleton"

// V1 components for the Services page (shared across V1/V2)
const ServiceMarketView = React.lazy(() =>
  import("../../../views/services/ServiceMarketView").then((m) => ({
    default: m.ServiceMarketView,
  })),
)

/**
 * MarketPageV2 — the /market, /buyorders and /market/services pages.
 *
 * Items and buy orders render V2 components (ListingSearchV2, BuyOrdersViewV2, etc.).
 * Services renders the V1 ServiceMarketView (shared, not market-specific).
 * Navigation between these pages lives in the sidebar, so the header just
 * names the current page and shows its actions.
 */
export function MarketPageV2() {
  const { t } = useTranslation()
  const location = useLocation()
  const showMobileSidebar = useBreakpointDown("lg")
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)

  const page = marketPageKind(location.pathname)
  const title = marketPageTitle(page, t)

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <MarketSidebarContext.Provider
        value={[marketSidebarOpen, setMarketSidebarOpen]}
      >
        <ServiceSidebarContext.Provider
          value={[serviceSidebarOpen, setServiceSidebarOpen]}
        >
          <MarketPageLayout
            title={title}
            headerActions={
              page === "services" ? (
                <ServiceActions />
              ) : page === "buyorders" ? (
                <BuyOrderActions />
              ) : (
                // Everyone can create listings — the create page handles which shop to create under
                <MarketActions />
              )
            }
            fab={
              !showMobileSidebar ? undefined : page === "services" ? (
                <FiltersFAB
                  onClick={() => setServiceSidebarOpen((prev) => !prev)}
                  label={t("service_market.toggle_sidebar")}
                />
              ) : (
                <FiltersFAB
                  onClick={() => setMarketSidebarOpen((prev) => !prev)}
                  label={t("market.toggleSidebar")}
                />
              )
            }
          >
            {page === "services" ? (
              <FeatureErrorBoundary featureName="Services">
                <Suspense fallback={<ServiceMarketSkeleton />}>
                  <ServiceMarketView />
                </Suspense>
              </FeatureErrorBoundary>
            ) : (
              <Suspense
                fallback={
                  <MarketSearchSkeleton
                    kind={page === "buyorders" ? "buyorders" : "listings"}
                  />
                }
              >
                <MarketV2Routes />
              </Suspense>
            )}
          </MarketPageLayout>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
