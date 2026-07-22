import React, { useState, useMemo, lazy } from "react"
import { ContractListings } from "../../views/contracts/ContractListings"
import { ContractSidebar } from "../../views/contracts/ContractSidebar"
import { ContractSidebarContext } from "../../features/contracting/hooks/ContractSidebar"
import {
  ContractSearchContext,
  ContractSearchState,
} from "../../features/contracting/hooks/ContractSearch"
import { FiltersFAB } from "../../components/mobile/FiltersFAB"
import {
  Divider,
  Grid,
  Box,
  Stack,
  useMediaQuery,
  Container,
  Paper,
} from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MarketSidebarContext } from "../../features/market/hooks/MarketSidebar"
import { ServiceSidebarContext } from "../../features/contracting/hooks/ServiceSidebar"
import { TabPanel } from "../../components/tabs/Tabs"
import { MarketTabsLayout } from "../../components/layout/MarketTabsLayout"
import { Page } from "../../components/metadata/Page"
import { LazySection } from "../../components/layout/LazySection"
import { PATHS, MARKET_PATHS } from "../../routes/paths"

const ServiceMarketView = lazy(() =>
  import("../../views/services/ServiceMarketView").then((module) => ({
    default: module.ServiceMarketView,
  })),
)
const ServiceActions = lazy(() =>
  import("../../views/services/ServiceActions").then((module) => ({
    default: module.ServiceActions,
  })),
)
const ContractActions = lazy(() =>
  import("../../views/contracts/ContractActions").then((module) => ({
    default: module.ContractActions,
  })),
)

export function Contracts() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const location = useLocation()
  const navigate = useNavigate()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)
  const [contractSearchState, setContractSearchState] = useState<
    ContractSearchState
  >({ query: "", sort: "date-old" })
  const [contractSidebarOpen, setContractSidebarOpen] = useState(
    !showMobileSidebar,
  )

  const tabPage = useMemo(() => {
    if (location.pathname.startsWith("/market/services")) return 1 // Services
    if (
      location.pathname.startsWith("/market") ||
      location.pathname.startsWith("/bulk") ||
      location.pathname.startsWith("/buyorders")
    )
      return 0 // Items
    if (location.pathname.startsWith("/contracts")) return 2 // Contracts
    return 2 // default to Contracts (standalone contracts page)
  }, [location.pathname])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate(MARKET_PATHS.search)
    else if (newValue === 1) navigate(MARKET_PATHS.services)
    else if (newValue === 2) navigate(PATHS.contracts)
  }

  const tabs = [
    { value: 0, label: t("market.itemsTab") },
    { value: 1, label: t("market.servicesTab") },
    { value: 2, label: t("market.contractsTab", "Open Contracts") },
  ]

  return (
    <Page title={t("contracts.contractsTitle")}>
      <MarketSidebarContext.Provider
        value={[marketSidebarOpen, setMarketSidebarOpen]}
      >
        <ServiceSidebarContext.Provider
          value={[serviceSidebarOpen, setServiceSidebarOpen]}
        >
          <ContractSearchContext.Provider
            value={[contractSearchState, setContractSearchState]}
          >
            <ContractSidebarContext.Provider
              value={[contractSidebarOpen, setContractSidebarOpen]}
            >
              <MarketTabsLayout
                title={t("market.market")}
                tabIndex={tabPage}
                onTabChange={handleTabChange}
                tabs={tabs}
                headerActions={
                  tabPage === 1 ? (
                    <LazySection
                      component={ServiceActions}
                      skeleton={() => null}
                    />
                  ) : (
                    <LazySection
                      component={ContractActions}
                      skeleton={() => null}
                    />
                  )
                }
                fab={
                  showMobileSidebar && tabPage === 1 ? (
                    <FiltersFAB
                      onClick={() => setServiceSidebarOpen((prev) => !prev)}
                      label={t("service_market.toggle_sidebar")}
                    />
                  ) : showMobileSidebar && tabPage === 2 ? (
                    <FiltersFAB
                      onClick={() => setContractSidebarOpen((prev) => !prev)}
                      label={t("contracts.toggleSidebar")}
                    />
                  ) : undefined
                }
              >
                <TabPanel value={tabPage} index={1}>
                  <LazySection
                    component={ServiceMarketView}
                    skeleton={() => null}
                  />
                </TabPanel>
                <TabPanel value={tabPage} index={2}>
                  <Container maxWidth="xxxl" sx={{ padding: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      {showMobileSidebar ? (
                        <Grid container spacing={theme.layoutSpacing.layout}>
                          <Grid item xs={12}>
                            <Divider light />
                          </Grid>
                          <Grid item xs={12}>
                            <ContractSidebar />
                          </Grid>
                          <Grid item xs={12}>
                            <Grid container spacing={theme.layoutSpacing.layout}>
                              <ContractListings />
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : (
                        <Stack
                          direction="row"
                          justifyContent="center"
                          spacing={theme.layoutSpacing.layout}
                          sx={{ width: "100%", maxWidth: "xxxl" }}
                        >
                          {contractSidebarOpen && (
                            <Paper
                              sx={{
                                position: "sticky",
                                top: "calc(64px + 16px)",
                                maxHeight: "calc(100vh - 64px - 32px)",
                                height: "fit-content",
                                width: 300,
                                flexShrink: 0,
                                overflowY: "auto",
                              }}
                            >
                              <ContractSidebar />
                            </Paper>
                          )}

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Grid
                              container
                              spacing={theme.layoutSpacing.layout}
                            >
                              <ContractListings />
                            </Grid>
                          </Box>
                        </Stack>
                      )}
                    </Box>
                  </Container>
                </TabPanel>
              </MarketTabsLayout>
            </ContractSidebarContext.Provider>
          </ContractSearchContext.Provider>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </Page>
  )
}
