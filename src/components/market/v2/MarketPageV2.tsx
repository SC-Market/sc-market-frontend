import React, { Suspense, useMemo, useState } from "react"
import { CircularProgress, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Page } from "../../../components/metadata/Page"
import { MarketSidebarContext } from "../../../features/market/hooks/MarketSidebar"
import { ServiceSidebarContext } from "../../../hooks/contract/ServiceSidebar"
import { MarketTabsLayout } from "../../../components/layout/MarketTabsLayout"
import { MarketActions, BuyOrderActions } from "../../../features/market/components/MarketActions"
import { TabPanel } from "../../../components/tabs/Tabs"
import { FiltersFAB } from "../../../components/mobile/FiltersFAB"
import { FeatureErrorBoundary } from "../../../components/error-boundaries"
import { MarketV2Routes } from "../../../features/market/v2/MarketV2Routes"

// V1 components for Services and Contracts tabs (shared across V1/V2)
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
const ContractActions = React.lazy(() =>
  import("../../../views/contracts/ContractActions").then((m) => ({
    default: m.ContractActions,
  })),
)
const ContractListings = React.lazy(() =>
  import("../../../views/contracts/ContractListings").then((m) => ({
    default: m.ContractListings,
  })),
)

/**
 * MarketPageV2 — V2 market page with the same tabbed layout as V1.
 *
 * Items tab renders V2 components (ListingSearchV2, BuyOrdersViewV2, etc.)
 * Services and Contracts tabs render V1 components (shared, not market-specific).
 */
export function MarketPageV2() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)

  const tabPage = useMemo(() => {
    if (location.pathname.startsWith("/market/services")) return 1
    if (location.pathname.startsWith("/contracts")) return 2
    return 0
  }, [location.pathname])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate("/market")
    else if (newValue === 1) navigate("/market/services")
    else if (newValue === 2) navigate("/contracts")
  }

  const tabs = [
    { value: 0, label: t("market.itemsTab") },
    { value: 1, label: t("market.servicesTab") },
    { value: 2, label: t("market.contractsTab", "Open Contracts") },
  ]

  const isBuyOrders = location.pathname.startsWith("/buyorders")

  return (
    <Page title={t("market.market")} dontUseDefaultCanonUrl={true}>
      <MarketSidebarContext.Provider
        value={[marketSidebarOpen, setMarketSidebarOpen]}
      >
        <ServiceSidebarContext.Provider
          value={[serviceSidebarOpen, setServiceSidebarOpen]}
        >
          <MarketTabsLayout
            title={t("market.market")}
            tabIndex={tabPage}
            onTabChange={handleTabChange}
            tabs={tabs}
            headerActions={
              tabPage === 0 ? (
                isBuyOrders ? <BuyOrderActions /> : <MarketActions />
              ) : tabPage === 1 ? (
                <Suspense fallback={<CircularProgress size={24} />}>
                  <ServiceActions />
                </Suspense>
              ) : (
                <Suspense fallback={<CircularProgress size={24} />}>
                  <ContractActions />
                </Suspense>
              )
            }
            fab={
              showMobileSidebar && tabPage === 0 ? (
                <FiltersFAB
                  onClick={() => setMarketSidebarOpen((prev) => !prev)}
                  label={t("market.toggleSidebar")}
                />
              ) : showMobileSidebar && tabPage === 1 ? (
                <FiltersFAB
                  onClick={() => setServiceSidebarOpen((prev) => !prev)}
                  label={t("service_market.toggle_sidebar")}
                />
              ) : undefined
            }
          >
            <TabPanel value={tabPage} index={0}>
              <Suspense fallback={null}>
                <MarketV2Routes />
              </Suspense>
            </TabPanel>
            <TabPanel value={tabPage} index={1}>
              <FeatureErrorBoundary featureName="Services">
                <Suspense fallback={null}>
                  <ServiceMarketView />
                </Suspense>
              </FeatureErrorBoundary>
            </TabPanel>
            <TabPanel value={tabPage} index={2}>
              <Suspense fallback={null}>
                <ContractListings />
              </Suspense>
            </TabPanel>
          </MarketTabsLayout>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
