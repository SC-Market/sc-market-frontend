import React, { Suspense, useMemo, useState } from "react"
import { CircularProgress } from "@mui/material"
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

// V1 components for the Services page (shared across V1/V2)
const ServiceMarketView = React.lazy(() =>
  import("../../../views/services/ServiceMarketView").then((m) => ({
    default: m.ServiceMarketView,
  })),
)
const ServiceActions = React.lazy(() =>
  import("../../../views/services/ServiceActions").then((m) => ({
    default: m.ServiceActions,
  })),
)

type MarketPageKind = "items" | "buyorders" | "services"

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

  const page = useMemo<MarketPageKind>(() => {
    if (location.pathname.startsWith("/market/services")) return "services"
    if (location.pathname.startsWith("/buyorders")) return "buyorders"
    return "items"
  }, [location.pathname])

  // Same labels as the sidebar entries for these pages (SidebarV2)
  const title =
    page === "services"
      ? t("nav.services", "Services")
      : page === "buyorders"
        ? t("nav.buyOrders", "Buy Orders")
        : t("nav.market", "Market")

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
                <Suspense fallback={<CircularProgress size={24} />}>
                  <ServiceActions />
                </Suspense>
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
                <Suspense fallback={null}>
                  <ServiceMarketView />
                </Suspense>
              </FeatureErrorBoundary>
            ) : (
              <Suspense fallback={null}>
                <MarketV2Routes />
              </Suspense>
            )}
          </MarketPageLayout>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
