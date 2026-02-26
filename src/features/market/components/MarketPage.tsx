import React, { useMemo, useState, Suspense } from "react"
import { CircularProgress, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { MarketSidebarContext } from "../hooks/MarketSidebar"
import { ServiceSidebarContext } from "../../../hooks/contract/ServiceSidebar"
import { Page } from "../../../components/metadata/Page"
import { MarketActions } from "./MarketActions"
import { useLocation, useNavigate } from "react-router-dom"
import { TabPanel } from "../../../components/tabs/Tabs"
import { MarketTabsLayout } from "../../../components/layout/MarketTabsLayout"
import { useTranslation } from "react-i18next"
import { FiltersFAB } from "../../../components/mobile/FiltersFAB"
import { FeatureErrorBoundary } from "../../../components/error-boundaries"

// Dynamic imports for heavy components
const ItemMarketView = React.lazy(() =>
  import("./ItemMarketView").then((module) => ({
    default: module.ItemMarketView,
  })),
)
const ServiceMarketView = React.lazy(() =>
  import("../../../views/services/ServiceMarketView").then((module) => ({
    default: module.ServiceMarketView,
  })),
)
const ServiceActions = React.lazy(() =>
  import("../../../views/services/ServiceActions").then((module) => ({
    default: module.ServiceActions,
  })),
)
const ContractActions = React.lazy(() =>
  import("../../../views/contracts/ContractActions").then((module) => ({
    default: module.ContractActions,
  })),
)
const ContractListings = React.lazy(() =>
  import("../../../views/contracts/ContractListings").then((module) => ({
    default: module.ContractListings,
  })),
)

function MarketTabLoader() {
  return null
}

export function MarketPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)
  
  const tabPage = useMemo(() => {
    if (location.pathname.startsWith("/market/services")) return 1 // Services
    if (
      location.pathname.startsWith("/market") ||
      location.pathname.startsWith("/bulk") ||
      location.pathname.startsWith("/buyorders")
    )
      return 0 // Items
    if (location.pathname.startsWith("/contracts")) return 2 // Contracts
    return 0 // default to Items
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
                <MarketActions />
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
              <Suspense fallback={<MarketTabLoader />}>
                <ItemMarketView />
              </Suspense>
            </TabPanel>
            <TabPanel value={tabPage} index={1}>
              <FeatureErrorBoundary featureName="Services">
                <Suspense fallback={<MarketTabLoader />}>
                  <ServiceMarketView />
                </Suspense>
              </FeatureErrorBoundary>
            </TabPanel>
            <TabPanel value={tabPage} index={2}>
              <Suspense fallback={<MarketTabLoader />}>
                <ContractListings />
              </Suspense>
            </TabPanel>
          </MarketTabsLayout>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
