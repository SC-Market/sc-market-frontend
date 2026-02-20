import React, { useState, useMemo, lazy } from "react"
import { ContractListings } from "../../views/contracts/ContractListings"
import { ContractSidebar } from "../../views/contracts/ContractSidebar"
import { ContractSidebarContext } from "../../hooks/contract/ContractSidebar"
import {
  ContractSearchContext,
  ContractSearchState,
} from "../../hooks/contract/ContractSearch"
import FilterListIcon from "@mui/icons-material/FilterList"
import { FiltersFAB } from "../../components/mobile/FiltersFAB"
import {
  Divider,
  Grid,
  Box,
  Stack,
  useMediaQuery,
  Container,
  Tabs,
  Typography,
  Paper,
} from "@mui/material"
import { HapticTab } from "../../components/haptic"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MarketSidebarContext } from "../../features/market/hooks/MarketSidebar"
import { ServiceSidebarContext } from "../../hooks/contract/ServiceSidebar"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { LazySection } from "../../components/layout/LazySection"

const ItemMarketView = lazy(() =>
  import("../../features/market/components/ItemMarketView").then((module) => ({
    default: module.ItemMarketView,
  })),
)
const ServiceMarketView = lazy(() =>
  import("../../views/services/ServiceMarketView").then((module) => ({
    default: module.ServiceMarketView,
  })),
)
const MarketActions = lazy(() =>
  import("../../features/market/components/MarketActions").then((module) => ({
    default: module.MarketActions,
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
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [marketSidebarOpen, setMarketSidebarOpen] = useState(false)
  const [serviceSidebarOpen, setServiceSidebarOpen] = useState(false)
  const [contractSidebarOpen, setContractSidebarOpen] = useState(!xs)

  const pages = ["/market/services", "/market", "/contracts"]
  const tabPage = useMemo(
    () =>
      pages.indexOf(
        pages.find((p) => location.pathname.startsWith(p)) || "/contracts",
      ),
    [location.pathname],
  )

  return (
    <StandardPageLayout
      title={t("contracts.contractsTitle")}
      canonicalUrl={undefined}
      sidebarOpen={true}
      noMobilePadding={true}
      maxWidth={false}
    >
      <MarketSidebarContext.Provider
        value={[marketSidebarOpen, setMarketSidebarOpen]}
      >
        <ServiceSidebarContext.Provider
          value={[serviceSidebarOpen, setServiceSidebarOpen]}
        >
          <ContractSearchContext.Provider
            value={useState<ContractSearchState>({
              query: "",
              sort: "date-old",
            })}
          >
            <ContractSidebarContext.Provider
              value={[contractSidebarOpen, setContractSidebarOpen]}
            >
              <Container
                maxWidth={"xxl"}
                sx={{
                  paddingTop: { xs: 2, sm: 8 },
                  paddingX: { xs: theme.spacing(1), sm: theme.spacing(3) },
                }}
              >
                <Grid
                  container
                  spacing={{
                    xs: theme.layoutSpacing.component,
                    sm: theme.layoutSpacing.layout,
                  }}
                  sx={{ marginBottom: { xs: 2, sm: 4 } }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item xs={12} sm="auto">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: "bold",
                          fontSize: { xs: "1.5rem", sm: "2.125rem" },
                        }}
                        color={"text.secondary"}
                      >
                        {t("market.market")}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm="auto">
                    <Tabs
                      value={tabPage}
                      onChange={(_, newValue) => {
                        if (newValue === 0) {
                          navigate("/market/services")
                        } else if (newValue === 1) {
                          navigate("/market")
                        } else if (newValue === 2) {
                          navigate("/contracts")
                        }
                      }}
                      aria-label={t("ui.aria.orgInfoArea")}
                      variant="scrollable"
                      scrollButtons="auto"
                      textColor="secondary"
                      indicatorColor="secondary"
                      sx={{
                        minHeight: { xs: 48, sm: 64 },
                        "& .MuiTab-root": {
                          minHeight: { xs: 48, sm: 64 },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          padding: { xs: "12px 16px", sm: "12px 24px" },
                        },
                      }}
                    >
                      <HapticTab
                        label={t("market.itemsTab")}
                        value={1}
                        {...a11yProps(1)}
                      />
                      <HapticTab
                        label={t("market.servicesTab")}
                        value={0}
                        {...a11yProps(0)}
                      />
                      <HapticTab
                        label={t("market.contractsTab", "Open Contracts")}
                        value={2}
                        {...a11yProps(2)}
                      />
                    </Tabs>
                  </Grid>
                  <Grid item xs={12} sm="auto">
                    {tabPage === 1 ? (
                      <LazySection
                        component={MarketActions}
                        skeleton={() => null}
                      />
                    ) : tabPage === 0 ? (
                      <LazySection
                        component={ServiceActions}
                        skeleton={() => null}
                      />
                    ) : (
                      <LazySection
                        component={ContractActions}
                        skeleton={() => null}
                      />
                    )}
                  </Grid>
                </Grid>
              </Container>

              <TabPanel value={tabPage} index={1}>
                <LazySection component={ItemMarketView} skeleton={() => null} />
              </TabPanel>
              <TabPanel value={tabPage} index={0}>
                <LazySection
                  component={ServiceMarketView}
                  skeleton={() => null}
                />
              </TabPanel>
              <TabPanel value={tabPage} index={2}>
                <Container maxWidth="xxl" sx={{ padding: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    {xs ? (
                      <Grid container spacing={theme.layoutSpacing.layout}>
                        <Grid item xs={12}>
                          <Divider light />
                        </Grid>

                        {/* Mobile: BottomSheet sidebar */}
                        <ContractSidebar />

                        <Grid item xs={12}>
                          <Grid
                            container
                            spacing={theme.layoutSpacing.layout}
                          >
                            <ContractListings />
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : (
                      <Stack
                        direction="row"
                        justifyContent="center"
                        spacing={theme.layoutSpacing.layout}
                        sx={{ width: "100%", maxWidth: "xxl" }}
                      >
                        {contractSidebarOpen && (
                          <Paper
                            sx={{
                              position: "sticky",
                              top: "calc(64px + 16px)",
                              maxHeight: "calc(100vh - 64px - 32px)",
                              width: 300,
                              flexShrink: 0,
                              overflowY: "auto",
                            }}
                          >
                            <ContractSidebar />
                          </Paper>
                        )}

                        <Box sx={{ flex: 1 }}>
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

              {xs && tabPage === 1 && (
                <FiltersFAB
                  onClick={() => setMarketSidebarOpen((prev) => !prev)}
                  label={t("market.toggleSidebar")}
                />
              )}
              {xs && tabPage === 0 && (
                <FiltersFAB
                  onClick={() => setServiceSidebarOpen((prev) => !prev)}
                  label={t("service_market.toggle_sidebar")}
                />
              )}
              {xs && tabPage === 2 && (
                <FiltersFAB
                  onClick={() => setContractSidebarOpen((prev) => !prev)}
                  label={t("contracts.toggleSidebar")}
                />
              )}
            </ContractSidebarContext.Provider>
          </ContractSearchContext.Provider>
        </ServiceSidebarContext.Provider>
      </MarketSidebarContext.Provider>
    </StandardPageLayout>
  )
}
